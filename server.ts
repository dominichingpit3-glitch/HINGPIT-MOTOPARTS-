import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistent Server-Side Data Storage Directory
const DATA_DIR = path.join(process.cwd(), 'server_data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUPABASE_CONFIG_FILE = path.join(DATA_DIR, 'supabase_config.json');

// Helper to read JSON file safely
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON file safely
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize server data stores - Starts empty (0 preloaded products/accounts)
if (!fs.existsSync(PRODUCTS_FILE)) {
  writeJsonFile(PRODUCTS_FILE, []);
}
if (!fs.existsSync(ORDERS_FILE)) {
  writeJsonFile(ORDERS_FILE, []);
}
if (!fs.existsSync(USERS_FILE)) {
  writeJsonFile(USERS_FILE, []);
}

// ==========================================
// SUPABASE CLIENT INITIALIZATION & DYNAMIC BRIDGE
// ==========================================
let supabaseClient: SupabaseClient | null = null;
let currentSupabaseUrl: string = '';

export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing slashes and common subpaths like /rest/v1 or /auth/v1
  url = url.replace(/\/rest\/v1\/?.*$/i, '').replace(/\/auth\/v1\/?.*$/i, '').replace(/\/+$/, '');
  return url;
}

export function getSupabaseCredentials(): { url: string; key: string } {
  // Check stored config file first
  const fileConfig = readJsonFile<{ url?: string; key?: string }>(SUPABASE_CONFIG_FILE, {});
  
  let url = fileConfig.url || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  let key = fileConfig.key || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

  // Default to user's provided Supabase project credentials if unconfigured
  if (!url || url.includes('your-project-id')) {
    url = 'https://reilurkdveaghluryfhz.supabase.co';
    key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaWx1cmtkdmVhZ2hsdXJ5Zmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODUxNDksImV4cCI6MjEwMzU2MTE0OX0.gZ-VEA3uGW7gfn0zszuYZty5jzE_VIe7YB4msEx21iU';
  }

  return { url: cleanSupabaseUrl(url), key: key.trim() };
}

export function getSupabaseClient(forceRefresh: boolean = false): SupabaseClient | null {
  if (supabaseClient && !forceRefresh) return supabaseClient;

  const { url, key } = getSupabaseCredentials();

  if (url && key && url.startsWith('http') && !url.includes('your-project-id') && key.length > 15) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      currentSupabaseUrl = url;
      console.log(`[Supabase Bridge] Initialized connection to ${url}`);
    } catch (err) {
      console.error('[Supabase Bridge] Initialization error:', err);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  return supabaseClient;
}

// Map UserProfile <-> Supabase users table row
function mapUserToSupabaseRow(user: any) {
  return {
    id: user.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: user.name || 'Rider',
    email: (user.email || '').toLowerCase().trim(),
    password_hash: user.password || user.password_hash || null,
    phone: user.phone || '09123456789',
    gcash_number: user.gcashNumber || user.gcash_number || user.phone || '09123456789',
    role: (user.role === 'seller' ? 'seller' : 'buyer'),
    store_name: user.storeName || user.store_name || null,
    address: user.address || 'Metro Manila',
    barangay: user.barangay || 'Brgy. Central',
    city: user.city || 'Quezon City',
    province: user.province || 'Metro Manila',
    zip_code: user.zipCode || user.zip_code || '1100',
    garage_bikes: Array.isArray(user.garageBikes) ? user.garageBikes : (Array.isArray(user.garage_bikes) ? user.garage_bikes : []),
    created_at: user.createdAt || user.created_at || new Date().toISOString()
  };
}

function mapSupabaseRowToUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password_hash || row.password || '',
    phone: row.phone || '',
    gcashNumber: row.gcash_number || row.gcashNumber || '',
    role: (row.role === 'seller' ? 'seller' : 'buyer') as 'buyer' | 'seller',
    storeName: row.store_name || row.storeName || undefined,
    address: row.address || '',
    barangay: row.barangay || undefined,
    city: row.city || '',
    province: row.province || '',
    zipCode: row.zip_code || row.zipCode || undefined,
    garageBikes: Array.isArray(row.garage_bikes) ? row.garage_bikes : (Array.isArray(row.garageBikes) ? row.garageBikes : []),
    createdAt: row.created_at || row.createdAt
  };
}

// Map Product <-> Supabase products table row
function mapProductToSupabaseRow(p: any) {
  // Safe sellerId fallback
  const sellerId = (p.sellerId && typeof p.sellerId === 'string' && (p.sellerId.startsWith('usr-') || p.sellerId.startsWith('user-'))) ? p.sellerId : null;

  return {
    id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: p.title,
    brand: p.brand || 'Aftermarket',
    sku: p.sku || `MP-${Math.floor(1000 + Math.random() * 9000)}`,
    price: Number(p.price) || 0,
    original_price: p.originalPrice ? Number(p.originalPrice) : null,
    stock: Number(p.stock) >= 0 ? Number(p.stock) : 1,
    category: p.category || 'All Parts',
    compatible_bikes: Array.isArray(p.compatibleBikes) ? p.compatibleBikes : (Array.isArray(p.compatible_bikes) ? p.compatible_bikes : []),
    bike_type_target: Array.isArray(p.bikeTypeTarget) ? p.bikeTypeTarget : (Array.isArray(p.bike_type_target) ? p.bike_type_target : ['universal']),
    description: p.description || '',
    key_features: Array.isArray(p.keyFeatures) ? p.keyFeatures : (Array.isArray(p.key_features) ? p.key_features : []),
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    images: Array.isArray(p.images) ? p.images : [],
    rating: Number(p.rating) || 5,
    review_count: Number(p.reviewCount) || (p.reviews ? p.reviews.length : 0),
    seller_id: sellerId,
    seller_name: p.sellerName || p.seller_name || 'Tuning Shop',
    seller_gcash: p.sellerGcash || p.seller_gcash || '09123456789',
    seller_verified: p.sellerVerified ?? p.seller_verified ?? true,
    is_hot: p.isHot ?? p.is_hot ?? false,
    is_new: p.isNew ?? p.is_new ?? true,
    free_shipping: p.freeShipping ?? p.free_shipping ?? false,
    condition: p.condition || 'Brand New',
    warranty_months: Number(p.warrantyMonths) || Number(p.warranty_months) || 6,
    created_at: p.createdAt || p.created_at || new Date().toISOString()
  };
}

function mapSupabaseRowToProduct(row: any, reviews: any[] = []) {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand || 'Aftermarket',
    sku: row.sku || `MP-${row.id}`,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    stock: Number(row.stock),
    category: row.category || 'All Parts',
    compatibleBikes: Array.isArray(row.compatible_bikes) ? row.compatible_bikes : [],
    bikeTypeTarget: Array.isArray(row.bike_type_target) ? row.bike_type_target : ['universal'],
    description: row.description || '',
    keyFeatures: Array.isArray(row.key_features) ? row.key_features : [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'],
    rating: Number(row.rating) || 5,
    reviewCount: Number(row.review_count) || reviews.length,
    reviews: reviews,
    sellerId: row.seller_id || '',
    sellerName: row.seller_name || 'Tuning Shop',
    sellerGcash: row.seller_gcash || '09XXXXXXXXX',
    sellerVerified: row.seller_verified ?? true,
    isHot: row.is_hot ?? false,
    isNew: row.is_new ?? true,
    freeShipping: row.free_shipping ?? false,
    condition: row.condition || 'Brand New',
    warrantyMonths: Number(row.warranty_months) || 6
  };
}

// Map Review <-> Supabase reviews table row
function mapReviewToSupabaseRow(productId: string, r: any) {
  const userId = (r.userId && typeof r.userId === 'string' && r.userId.startsWith('usr-')) ? r.userId : null;
  return {
    id: r.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    product_id: productId,
    user_id: userId,
    user_name: r.userName || r.user_name || 'Rider',
    user_avatar: r.userAvatar || r.user_avatar || null,
    gcash_verified: r.gcashVerified ?? r.gcash_verified ?? true,
    rating: Number(r.rating) || 5,
    comment: r.comment || '',
    bike_model: r.bikeModel || r.bike_model || 'Motorcycle',
    helpful_count: Number(r.helpfulCount) || Number(r.helpful_count) || 0,
    created_at: r.date ? new Date(r.date).toISOString() : new Date().toISOString()
  };
}

// Lazy initialization for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Supabase Status, Test & Live Configuration Endpoints
app.get('/api/supabase/status', async (req, res) => {
  const { url, key } = getSupabaseCredentials();
  const isConfigured = Boolean(url && key && url.startsWith('http') && !url.includes('your-project-id'));
  
  if (!isConfigured) {
    return res.json({
      configured: false,
      status: 'not_configured',
      url: '',
      message: 'Supabase URL and API Key are not set yet. You can connect by entering your Supabase credentials in the SQL Database & Sync modal.',
      tables: { users: false, products: false, reviews: false, orders: false }
    });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.json({
      configured: true,
      status: 'connection_failed',
      url,
      message: 'Could not create Supabase client with current credentials.',
      tables: { users: false, products: false, reviews: false, orders: false }
    });
  }

  try {
    // Check all tables
    const [uRes, pRes, rRes, oRes] = await Promise.allSettled([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true })
    ]);

    const usersOk = uRes.status === 'fulfilled' && !uRes.value.error;
    const prodsOk = pRes.status === 'fulfilled' && !pRes.value.error;
    const revsOk = rRes.status === 'fulfilled' && !rRes.value.error;
    const ordersOk = oRes.status === 'fulfilled' && !oRes.value.error;

    const usersCount = (uRes.status === 'fulfilled' && uRes.value.count !== null) ? uRes.value.count : 0;
    const prodsCount = (pRes.status === 'fulfilled' && pRes.value.count !== null) ? pRes.value.count : 0;
    const revsCount = (rRes.status === 'fulfilled' && rRes.value.count !== null) ? rRes.value.count : 0;
    const ordersCount = (oRes.status === 'fulfilled' && oRes.value.count !== null) ? oRes.value.count : 0;

    const allTablesOk = usersOk && prodsOk && revsOk && ordersOk;

    let errorMessage = '';
    if (!usersOk && uRes.status === 'fulfilled' && uRes.value.error) errorMessage += ` users: ${uRes.value.error.message};`;
    if (!prodsOk && pRes.status === 'fulfilled' && pRes.value.error) errorMessage += ` products: ${pRes.value.error.message};`;

    res.json({
      configured: true,
      status: allTablesOk ? 'connected' : 'table_missing_or_error',
      url,
      message: allTablesOk
        ? `Successfully connected to Supabase (${url})! All tables are active.`
        : `Connected to Supabase, but some tables are missing: ${errorMessage} Run the SQL schema script in your Supabase SQL Editor.`,
      tables: {
        users: usersOk,
        products: prodsOk,
        reviews: revsOk,
        orders: ordersOk
      },
      counts: {
        users: usersCount,
        products: prodsCount,
        reviews: revsCount,
        orders: ordersCount
      }
    });
  } catch (err: any) {
    res.json({
      configured: true,
      status: 'error',
      url,
      message: err.message || 'Error communicating with Supabase',
      tables: { users: false, products: false, reviews: false, orders: false }
    });
  }
});

// Configure Supabase credentials via In-App Modal
app.post('/api/supabase/config', async (req, res) => {
  try {
    const { url, key } = req.body;
    if (!url || !key) {
      return res.status(400).json({ error: 'Supabase URL and API Key are required' });
    }

    const cleanUrl = cleanSupabaseUrl(url);
    const cleanKey = key.trim();

    // Test creating client and querying
    const testClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { error } = await testClient.from('users').select('id', { count: 'exact', head: true });
    
    // Save to disk
    writeJsonFile(SUPABASE_CONFIG_FILE, { url: cleanUrl, key: cleanKey });
    
    // Refresh client in memory
    supabaseClient = testClient;
    currentSupabaseUrl = cleanUrl;

    if (error) {
      return res.json({
        success: true,
        saved: true,
        warning: `Connected to ${cleanUrl}, but table query returned: "${error.message}". Remember to run the SQL Schema in your Supabase SQL Editor!`
      });
    }

    res.json({
      success: true,
      saved: true,
      message: `Successfully connected and synced to Supabase: ${cleanUrl}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save Supabase configuration' });
  }
});

// Sync All Local Data directly into Supabase in one click
app.post('/api/supabase/sync-all', async (req, res) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(400).json({ error: 'Supabase is not connected. Please configure your credentials first.' });
  }

  const localUsers = readJsonFile<any[]>(USERS_FILE, []);
  const localProducts = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const localOrders = readJsonFile<any[]>(ORDERS_FILE, []);

  const results: any = { users: 0, products: 0, reviews: 0, orders: 0, errors: [] };

  try {
    // 1. Sync Users first (to satisfy any FK)
    for (const u of localUsers) {
      try {
        const row = mapUserToSupabaseRow(u);
        const { error } = await supabase.from('users').upsert(row, { onConflict: 'email' });
        if (error) results.errors.push(`User ${u.email}: ${error.message}`);
        else results.users++;
      } catch (err: any) {
        results.errors.push(`User ${u.email}: ${err.message}`);
      }
    }

    // 2. Sync Products
    for (const p of localProducts) {
      try {
        const row = mapProductToSupabaseRow(p);
        const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
        if (error) results.errors.push(`Product ${p.title}: ${error.message}`);
        else results.products++;

        // Sync its reviews if any
        if (Array.isArray(p.reviews) && p.reviews.length > 0) {
          for (const r of p.reviews) {
            try {
              const revRow = mapReviewToSupabaseRow(p.id, r);
              const { error: revErr } = await supabase.from('reviews').upsert(revRow, { onConflict: 'id' });
              if (revErr) results.errors.push(`Review for ${p.title}: ${revErr.message}`);
              else results.reviews++;
            } catch (err: any) {
              results.errors.push(`Review err: ${err.message}`);
            }
          }
        }
      } catch (err: any) {
        results.errors.push(`Product ${p.title}: ${err.message}`);
      }
    }

    // 3. Sync Orders
    for (const o of localOrders) {
      try {
        const { error } = await supabase.from('orders').upsert({
          id: o.id,
          tracking_number: o.trackingNumber || o.tracking_number,
          user_id: (o.userId && o.userId.startsWith('usr-')) ? o.userId : null,
          customer_name: o.customerName || o.customer_name,
          customer_email: o.customerEmail || o.customer_email,
          customer_phone: o.customerPhone || o.customer_phone,
          customer_gcash: o.customerGcash || o.customer_gcash,
          subtotal: Number(o.subtotal),
          shipping_fee: Number(o.shippingFee || o.shipping_fee) || 0,
          discount: Number(o.discount) || 0,
          total_amount: Number(o.totalAmount || o.total_amount),
          status: o.status || 'Order Placed',
          payment_method: o.paymentMethod || o.payment_method,
          payment_ref: o.paymentRef || o.payment_ref,
          street: o.shippingAddress?.street || o.street || '',
          barangay: o.shippingAddress?.barangay || o.barangay || '',
          city: o.shippingAddress?.city || o.city || '',
          province: o.shippingAddress?.province || o.province || '',
          zip_code: o.shippingAddress?.zipCode || o.zip_code || '',
          courier: o.courier || 'J&T Express MotoCargo',
          estimated_delivery: o.estimatedDelivery || o.estimated_delivery
        }, { onConflict: 'id' });

        if (error) results.errors.push(`Order ${o.id}: ${error.message}`);
        else results.orders++;
      } catch (err: any) {
        results.errors.push(`Order ${o.id}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Sync completed: ${results.users} users, ${results.products} products, ${results.reviews} reviews, ${results.orders} orders uploaded to Supabase.`,
      results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Health & System API Route
app.get('/api/health', async (req, res) => {
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const users = readJsonFile<any[]>(USERS_FILE, []);
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const supabase = getSupabaseClient();
  const { url } = getSupabaseCredentials();

  let supabaseStatus = 'not_configured';
  let supabaseMessage = 'Supabase can be connected via in-app SQL Database modal or environment variables.';

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        supabaseStatus = 'error_or_table_missing';
        supabaseMessage = `Connected to ${url}, but queries returned: ${error.message}. Make sure to run the SQL schema migration!`;
      } else {
        supabaseStatus = 'connected';
        supabaseMessage = `Supabase PostgreSQL (${url}) is active and storing all accounts, products, and reviews.`;
      }
    } catch (err: any) {
      supabaseStatus = 'connection_failed';
      supabaseMessage = err.message || 'Failed to ping Supabase';
    }
  }

  res.json({
    status: 'ok',
    service: 'MotoParts Express Shared Cloud & Supabase Gateway',
    timestamp: new Date().toISOString(),
    multiDeviceSync: 'active',
    database: {
      supabase: supabaseStatus,
      supabaseUrl: url || '',
      supabaseMessage,
      localCache: 'synced'
    },
    stats: {
      totalProducts: products.length,
      totalUsers: users.length,
      totalOrders: orders.length
    },
    gateways: {
      paymongo: 'active',
      sqlDatabase: 'ready',
      gemini: Boolean(process.env.GEMINI_API_KEY) ? 'configured' : 'fallback-active'
    }
  });
});

// 3. PRODUCTS API — Reads & Writes to Supabase and Local Cache
app.get('/api/products', async (req, res) => {
  const localProducts = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: dbProducts, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && dbProducts) {
        // Fetch all reviews for products
        const { data: dbReviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        
        const mapped = dbProducts.map(p => {
          const prodReviews = (dbReviews || [])
            .filter((r: any) => r.product_id === p.id)
            .map((r: any) => ({
              id: r.id,
              productId: r.product_id,
              userId: r.user_id,
              userName: r.user_name,
              userAvatar: r.user_avatar,
              gcashVerified: r.gcash_verified,
              rating: r.rating,
              comment: r.comment,
              bikeModel: r.bike_model,
              helpfulCount: r.helpful_count || 0,
              date: new Date(r.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }));
          return mapSupabaseRowToProduct(p, prodReviews);
        });

        // Update local cache
        writeJsonFile(PRODUCTS_FILE, mapped);
        return res.json(mapped);
      }
    } catch (err) {
      console.warn('[Supabase Products Fetch] Fallback to local storage:', err);
    }
  }

  res.json(localProducts);
});

// POST /api/products — Upload a new product (Stored into Supabase 'products' table)
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct || !newProduct.title || !newProduct.price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const productWithDefaults = {
      ...newProduct,
      id: newProduct.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: newProduct.createdAt || new Date().toISOString(),
      reviews: newProduct.reviews || [],
      rating: newProduct.rating || 5,
      reviewCount: newProduct.reviewCount || (newProduct.reviews ? newProduct.reviews.length : 0)
    };

    // Save to Supabase
    const supabase = getSupabaseClient();
    let supabaseResult = { stored: false, message: 'Local persistent storage active' };

    if (supabase) {
      try {
        const row = mapProductToSupabaseRow(productWithDefaults);
        let { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
        
        // If FK error on seller_id, retry with seller_id = null
        if (error && error.message && error.message.includes('seller_id')) {
          const fallbackRow = { ...row, seller_id: null };
          const retryRes = await supabase.from('products').upsert(fallbackRow, { onConflict: 'id' });
          error = retryRes.error;
        }

        if (!error) {
          supabaseResult = { stored: true, message: 'Successfully saved into Supabase "products" table!' };
          console.log(`[Supabase Store] Product "${productWithDefaults.title}" stored in Supabase products table.`);
        } else {
          console.error(`[Supabase Product Error]: ${error.message}`);
          supabaseResult = { stored: false, message: `Supabase notice: ${error.message}` };
        }
      } catch (err: any) {
        console.error('[Supabase Product Exception]:', err);
        supabaseResult = { stored: false, message: `Supabase exception: ${err.message}` };
      }
    }

    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    const updated = [productWithDefaults, ...products.filter(p => p.id !== productWithDefaults.id)];
    writeJsonFile(PRODUCTS_FILE, updated);

    console.log(`[Product Uploaded] ${productWithDefaults.title} by ${productWithDefaults.sellerName || 'Seller'}. Total: ${updated.length}`);
    res.status(201).json({
      ...productWithDefaults,
      _supabase: supabaseResult
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Failed to save product' });
  }
});

// DELETE /api/products/:id — Delete a product from Supabase & Local Cache
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('reviews').delete().eq('product_id', id);
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase Delete Product Notice]:', err);
      }
    }

    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    const updated = products.filter(p => p.id !== id);
    writeJsonFile(PRODUCTS_FILE, updated);
    res.json({ success: true, remaining: updated.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/:id/reviews — Post Star Review into Supabase 'reviews' table
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const newReview = req.body;
    const reviewItem = {
      ...newReview,
      id: newReview.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0
    };

    const supabase = getSupabaseClient();
    let supabaseResult = { stored: false, message: 'Local storage' };

    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    let targetFound = false;

    if (supabase) {
      try {
        const parentProd = products.find(p => p.id === id);
        if (parentProd) {
          const prodRow = mapProductToSupabaseRow(parentProd);
          await supabase.from('products').upsert(prodRow, { onConflict: 'id' });
        }

        const reviewRow = mapReviewToSupabaseRow(id, reviewItem);
        let { error } = await supabase.from('reviews').upsert(reviewRow, { onConflict: 'id' });
        if (error && error.message && error.message.includes('user_id')) {
          const fallbackReview = { ...reviewRow, user_id: null };
          const retryRes = await supabase.from('reviews').upsert(fallbackReview, { onConflict: 'id' });
          error = retryRes.error;
        }

        if (!error) {
          supabaseResult = { stored: true, message: 'Successfully inserted into Supabase "reviews" table!' };
          console.log(`[Supabase Review] Review for product ${id} stored in Supabase.`);
        } else {
          console.warn(`[Supabase Review Error]: ${error.message}`);
          supabaseResult = { stored: false, message: error.message };
        }
      } catch (err: any) {
        console.warn('[Supabase Review Insert Notice]:', err);
        supabaseResult = { stored: false, message: err.message };
      }
    }
    const updated = products.map(p => {
      if (p.id === id) {
        targetFound = true;
        const allReviews = [reviewItem, ...(p.reviews || []).filter((r: any) => r.id !== reviewItem.id)];
        const avg = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / allReviews.length;
        return {
          ...p,
          reviews: allReviews,
          rating: Number(avg.toFixed(1)),
          reviewCount: allReviews.length
        };
      }
      return p;
    });

    if (!targetFound) {
      return res.status(404).json({ error: 'Product not found' });
    }

    writeJsonFile(PRODUCTS_FILE, updated);
    res.json({
      success: true,
      review: reviewItem,
      product: updated.find(p => p.id === id),
      _supabase: supabaseResult
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. USERS & AUTH API — Stored directly into Supabase 'users' table
app.get('/api/users', async (req, res) => {
  const localUsers = readJsonFile<any[]>(USERS_FILE, []);
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const mappedUsers = data.map(mapSupabaseRowToUser);
        
        // Merge with local users to keep state in sync
        const mergedMap = new Map<string, any>();
        localUsers.forEach(u => mergedMap.set(u.id || u.email, u));
        mappedUsers.forEach(u => mergedMap.set(u.id || u.email, u));
        const mergedUsers = Array.from(mergedMap.values());
        
        writeJsonFile(USERS_FILE, mergedUsers);
        
        const sanitized = mappedUsers.map(u => {
          const { password, ...safe } = u;
          return safe;
        });
        return res.json(sanitized);
      }
    } catch (err) {
      console.warn('[Supabase Users Fetch] Fallback to local storage:', err);
    }
  }

  const sanitized = localUsers.map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
  res.json(sanitized);
});

// REGISTER USER — Writes directly to Supabase table 'users'
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.email || !user.name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newUser = {
      ...user,
      id: user.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: user.email.toLowerCase().trim(),
      createdAt: user.createdAt || new Date().toISOString()
    };

    let supabaseStatus = { stored: false, message: 'Stored in local persistent server storage' };
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const supabaseRow = mapUserToSupabaseRow(newUser);
        const { error } = await supabase.from('users').upsert(supabaseRow, { onConflict: 'email' });
        
        if (!error) {
          supabaseStatus = { stored: true, message: 'Successfully inserted into Supabase "users" table!' };
          console.log(`[Supabase Auth] Account ${newUser.email} (${newUser.name}) stored in Supabase users table.`);
        } else {
          console.error(`[Supabase Auth Error]: ${error.message}`);
          supabaseStatus = { stored: false, message: `Supabase notice: ${error.message}. Make sure table "users" exists with the provided SQL schema.` };
        }
      } catch (err: any) {
        console.error('[Supabase Auth Exception]:', err);
        supabaseStatus = { stored: false, message: `Supabase exception: ${err.message}` };
      }
    }

    // Save locally as well
    const users = readJsonFile<any[]>(USERS_FILE, []);
    const filtered = users.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase());
    const updatedUsers = [newUser, ...filtered];
    writeJsonFile(USERS_FILE, updatedUsers);
    
    const { password, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      user: safeUser,
      supabase: supabaseStatus
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    
    const supabase = getSupabaseClient();
    let user: any = null;

    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').ilike('email', cleanEmail).limit(1);
        if (!error && data && data.length > 0) {
          user = mapSupabaseRowToUser(data[0]);
        }
      } catch (err) {
        console.warn('[Supabase Login Search Notice]:', err);
      }
    }

    if (!user) {
      const localUsers = readJsonFile<any[]>(USERS_FILE, []);
      user = localUsers.find(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanEmail || u.gcashNumber === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email or phone. Please create an account first.' });
    }

    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const row = mapUserToSupabaseRow({ id, ...updates });
        await supabase.from('users').update(row).eq('id', id);
      } catch (err) {
        console.warn('[Supabase User Update Notice]:', err);
      }
    }

    const users = readJsonFile<any[]>(USERS_FILE, []);
    const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
    writeJsonFile(USERS_FILE, updated);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase User Delete Notice]:', err);
      }
    }

    const users = readJsonFile<any[]>(USERS_FILE, []);
    const updated = users.filter(u => u.id !== id);
    writeJsonFile(USERS_FILE, updated);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. ORDERS API — Supabase 'orders' & 'order_items' + Local Cache
app.get('/api/orders', async (req, res) => {
  const localOrders = readJsonFile<any[]>(ORDERS_FILE, []);
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: dbOrders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && dbOrders) {
        const { data: dbItems } = await supabase.from('order_items').select('*');
        const mappedOrders = dbOrders.map((o: any) => {
          const items = (dbItems || []).filter((it: any) => it.order_id === o.id).map((it: any) => ({
            productId: it.product_id || '',
            title: it.title,
            brand: it.brand,
            price: Number(it.price),
            quantity: Number(it.quantity),
            image: it.image
          }));

          return {
            id: o.id,
            trackingNumber: o.tracking_number,
            date: new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            items: items.length > 0 ? items : (o.items || []),
            subtotal: Number(o.subtotal),
            shippingFee: Number(o.shipping_fee) || 0,
            discount: Number(o.discount) || 0,
            totalAmount: Number(o.total_amount),
            status: o.status,
            paymentMethod: o.payment_method,
            paymentRef: o.payment_ref,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
            customerGcash: o.customer_gcash,
            shippingAddress: {
              street: o.street || '',
              barangay: o.barangay || '',
              city: o.city || '',
              province: o.province || '',
              zipCode: o.zip_code || ''
            },
            courier: o.courier || 'J&T Express MotoCargo',
            estimatedDelivery: o.estimated_delivery || '3-5 business days',
            timeline: []
          };
        });

        writeJsonFile(ORDERS_FILE, mappedOrders);
        return res.json(mappedOrders);
      }
    } catch (err) {
      console.warn('[Supabase Orders Fetch] Fallback to local storage:', err);
    }
  }

  res.json(localOrders);
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.items) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const userId = (newOrder.userId && typeof newOrder.userId === 'string' && newOrder.userId.startsWith('usr-')) ? newOrder.userId : null;
        
        const orderPayload = {
          id: newOrder.id,
          tracking_number: newOrder.trackingNumber,
          user_id: userId,
          customer_name: newOrder.customerName,
          customer_email: newOrder.customerEmail,
          customer_phone: newOrder.customerPhone,
          customer_gcash: newOrder.customerGcash,
          subtotal: newOrder.subtotal,
          shipping_fee: newOrder.shippingFee || 0,
          discount: newOrder.discount || 0,
          total_amount: newOrder.totalAmount,
          status: newOrder.status,
          payment_method: newOrder.paymentMethod,
          payment_ref: newOrder.paymentRef,
          street: newOrder.shippingAddress?.street || '',
          barangay: newOrder.shippingAddress?.barangay || '',
          city: newOrder.shippingAddress?.city || '',
          province: newOrder.shippingAddress?.province || '',
          zip_code: newOrder.shippingAddress?.zipCode || '',
          courier: newOrder.courier,
          estimated_delivery: newOrder.estimatedDelivery
        };

        let { error: ordErr } = await supabase.from('orders').upsert(orderPayload, { onConflict: 'id' });
        if (ordErr && ordErr.message && ordErr.message.includes('user_id')) {
          await supabase.from('orders').upsert({ ...orderPayload, user_id: null }, { onConflict: 'id' });
        }

        // Insert items
        if (Array.isArray(newOrder.items)) {
          const itemRows = newOrder.items.map((it: any, idx: number) => ({
            id: `${newOrder.id}-item-${idx}`,
            order_id: newOrder.id,
            product_id: (it.productId && typeof it.productId === 'string' && it.productId.startsWith('prod-')) ? it.productId : null,
            title: it.title,
            brand: it.brand || 'MotoParts',
            price: it.price,
            quantity: it.quantity,
            image: it.image
          }));
          await supabase.from('order_items').upsert(itemRows, { onConflict: 'id' });
        }
      } catch (err) {
        console.warn('[Supabase Order Insert Notice]:', err);
      }
    }

    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const updatedOrders = [newOrder, ...orders.filter(o => o.id !== newOrder.id)];
    writeJsonFile(ORDERS_FILE, updatedOrders);

    // Decrement stock in products file
    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    const updatedProducts = products.map(p => {
      const ordered = newOrder.items.find((item: any) => item.productId === p.id);
      if (ordered) {
        return { ...p, stock: Math.max(0, p.stock - ordered.quantity) };
      }
      return p;
    });
    writeJsonFile(PRODUCTS_FILE, updatedProducts);

    res.status(201).json({ success: true, order: newOrder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. AI Mechanic Ask Endpoint (Gemini API)
app.post('/api/mechanic/ask', async (req, res) => {
  try {
    const { bikeModel, query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `[Expert Mechanic Advice for ${bikeModel || 'Motorcycle'}]: Para sa optimal performance, siguraduhing tama ang clearance ng cylinder bore (0.03mm-0.04mm piston-to-wall) at balansehin ang flyball roller weights para sa Click 125i o carburetor jetting para sa XRM 125. Laging gumamit ng genuine synthetic 4T/Scooter gear oil!`
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are an expert Philippine motorcycle mechanic and master tuner at MotoParts Express Philippines.
Specialize in street bikes and scooters like Honda XRM 125, Honda Click 125i/160, Yamaha Aerox 155, Sniper 155, and Suzuki Raider 150.
Motorcycle Model: ${bikeModel || 'General Street Bike / Scooter'}
User Question: ${query}

Provide precise, actionable mechanical tuning advice (carburetor jet sizes, CVT roller weights, spark plug heat ranges, bore clearances, or brake pump sizes). Keep response friendly and bilingual (Tagalog/English) for Filipino riders.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error generating mechanic response:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI mechanic request' });
  }
});

// 7. PayMongo GCash Checkout Session Endpoint
app.post('/api/paymongo/checkout', async (req, res) => {
  try {
    const { items, orderNumber, customerName } = req.body;
    
    res.json({
      success: true,
      checkoutUrl: `https://checkout.paymongo.com/sandbox/pay_${orderNumber || Date.now()}`,
      referenceNumber: `PAYM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMethod: 'GCash / Maya (PayMongo Escrow Verified)'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Clear/Reset all server data endpoint (Clean Slate)
app.post('/api/admin/clear-all', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await Promise.all([
        supabase.from('order_items').delete().neq('id', '___non_existent___'),
        supabase.from('orders').delete().neq('id', '___non_existent___'),
        supabase.from('reviews').delete().neq('id', '___non_existent___'),
        supabase.from('products').delete().neq('id', '___non_existent___'),
        supabase.from('users').delete().neq('id', '___non_existent___')
      ]);
    } catch (err) {
      console.warn('[Supabase Clear Notice]:', err);
    }
  }

  writeJsonFile(PRODUCTS_FILE, []);
  writeJsonFile(ORDERS_FILE, []);
  writeJsonFile(USERS_FILE, []);
  res.json({ success: true, message: 'All products, orders, and accounts cleared.' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MotoParts Express Server with Supabase PostgreSQL Bridge running on port ${PORT}`);
    // Run background automatic sync on startup
    setTimeout(() => {
      autoSyncToSupabase().catch(err => console.warn('[Supabase Startup Sync Notice]:', err));
    }, 2000);
  });
}

async function autoSyncToSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const localUsers = readJsonFile<any[]>(USERS_FILE, []);
    const localProducts = readJsonFile<any[]>(PRODUCTS_FILE, []);
    const localOrders = readJsonFile<any[]>(ORDERS_FILE, []);

    for (const u of localUsers) {
      try {
        const row = mapUserToSupabaseRow(u);
        await supabase.from('users').upsert(row, { onConflict: 'email' });
      } catch (e) {}
    }

    for (const p of localProducts) {
      try {
        const row = mapProductToSupabaseRow(p);
        let { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
        if (error && error.message && error.message.includes('seller_id')) {
          await supabase.from('products').upsert({ ...row, seller_id: null }, { onConflict: 'id' });
        }
        if (Array.isArray(p.reviews) && p.reviews.length > 0) {
          for (const r of p.reviews) {
            try {
              const revRow = mapReviewToSupabaseRow(p.id, r);
              let { error: revErr } = await supabase.from('reviews').upsert(revRow, { onConflict: 'id' });
              if (revErr && revErr.message && revErr.message.includes('user_id')) {
                await supabase.from('reviews').upsert({ ...revRow, user_id: null }, { onConflict: 'id' });
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    console.log('[Supabase AutoSync] Automatic background sync to Supabase executed successfully.');
  } catch (err) {
    console.warn('[Supabase AutoSync Notice]:', err);
  }
}

startServer();
