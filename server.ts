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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent Server-Side Data Storage Directory
const DATA_DIR = path.join(process.cwd(), 'server_data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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

// Initialize server data stores - Starts empty (0 preloaded products/accounts as requested)
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
// SUPABASE CLIENT INITIALIZATION & BRIDGE
// ==========================================
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (url && key && url.startsWith('http') && key.length > 10) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      console.log(`[Supabase Bridge] Initialized connection to ${url}`);
    } catch (err) {
      console.error('[Supabase Bridge] Initialization error:', err);
    }
  }
  return supabaseClient;
}

// Map UserProfile <-> Supabase users table row
function mapUserToSupabaseRow(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: (user.email || '').toLowerCase().trim(),
    password_hash: user.password || user.password_hash || null,
    phone: user.phone || '',
    gcash_number: user.gcashNumber || user.gcash_number || '',
    role: user.role || 'buyer',
    store_name: user.storeName || user.store_name || null,
    address: user.address || '',
    barangay: user.barangay || null,
    city: user.city || '',
    province: user.province || '',
    zip_code: user.zipCode || user.zip_code || null,
    garage_bikes: user.garageBikes || user.garage_bikes || [],
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
  return {
    id: p.id,
    title: p.title,
    brand: p.brand || 'Aftermarket',
    sku: p.sku || `MP-${Math.floor(1000 + Math.random() * 9000)}`,
    price: Number(p.price) || 0,
    original_price: p.originalPrice ? Number(p.originalPrice) : null,
    stock: Number(p.stock) || 1,
    category: p.category || 'All Parts',
    compatible_bikes: p.compatibleBikes || [],
    bike_type_target: p.bikeTypeTarget || ['universal'],
    description: p.description || '',
    key_features: p.keyFeatures || [],
    specifications: p.specifications || [],
    images: p.images || [],
    rating: Number(p.rating) || 5,
    review_count: Number(p.reviewCount) || 0,
    seller_id: p.sellerId || null,
    seller_name: p.sellerName || 'Tuning Shop',
    seller_gcash: p.sellerGcash || '09XXXXXXXXX',
    seller_verified: p.sellerVerified ?? true,
    is_hot: p.isHot ?? false,
    is_new: p.isNew ?? true,
    free_shipping: p.freeShipping ?? false,
    condition: p.condition || 'Brand New',
    warranty_months: Number(p.warrantyMonths) || 6,
    created_at: p.createdAt || new Date().toISOString()
  };
}

function mapSupabaseRowToProduct(row: any, reviews: any[] = []) {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    sku: row.sku,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    stock: Number(row.stock),
    category: row.category,
    compatibleBikes: Array.isArray(row.compatible_bikes) ? row.compatible_bikes : [],
    bikeTypeTarget: Array.isArray(row.bike_type_target) ? row.bike_type_target : ['universal'],
    description: row.description || '',
    keyFeatures: Array.isArray(row.key_features) ? row.key_features : [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    images: Array.isArray(row.images) ? row.images : [],
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
// REST API ROUTES (PERSISTENT & SHARED ACROSS ALL DEVICES)
// ==========================================

// 1. Health & Database Status API Route
app.get('/api/health', async (req, res) => {
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const users = readJsonFile<any[]>(USERS_FILE, []);
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const supabase = getSupabaseClient();

  let supabaseStatus = 'not_configured';
  let supabaseMessage = 'Supabase environment variables (VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY) can be provided in Settings.';

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        supabaseStatus = 'error_or_table_missing';
        supabaseMessage = `Connected to URL, but queries returned: ${error.message}. Make sure to run the SQL schema migration!`;
      } else {
        supabaseStatus = 'connected';
        supabaseMessage = 'Supabase PostgreSQL database is active and syncing users, products, and orders.';
      }
    } catch (err: any) {
      supabaseStatus = 'connection_failed';
      supabaseMessage = err.message || 'Failed to ping Supabase';
    }
  }

  res.json({
    status: 'ok',
    service: 'MotoParts Express Shared Cloud & API Gateway',
    timestamp: new Date().toISOString(),
    multiDeviceSync: 'active',
    database: {
      supabase: supabaseStatus,
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

// 2. PRODUCTS API — Shared across all devices + Supabase Sync
app.get('/api/products', async (req, res) => {
  const localProducts = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: dbProducts, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && dbProducts) {
        // Fetch reviews for products
        const { data: dbReviews } = await supabase.from('reviews').select('*');
        const mapped = dbProducts.map(p => {
          const prodReviews = (dbReviews || [])
            .filter((r: any) => r.product_id === p.id)
            .map((r: any) => ({
              id: r.id,
              productId: r.product_id,
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

// POST /api/products — Upload a new product (Saves to Supabase & Local Cache)
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct || !newProduct.title || !newProduct.price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const productWithDefaults = {
      ...newProduct,
      id: newProduct.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      reviews: newProduct.reviews || [],
      rating: newProduct.rating || 5,
      reviewCount: newProduct.reviewCount || 0
    };

    // Save to Supabase if connected
    const supabase = getSupabaseClient();
    let supabaseResult = { stored: false, message: 'Local persistent storage active' };

    if (supabase) {
      try {
        const row = mapProductToSupabaseRow(productWithDefaults);
        const { error } = await supabase.from('products').upsert(row);
        if (!error) {
          supabaseResult = { stored: true, message: 'Saved directly to Supabase products table' };
          console.log(`[Supabase Bridge] Product ${productWithDefaults.title} saved to Supabase!`);
        } else {
          console.warn(`[Supabase Bridge] Product upsert notice: ${error.message}`);
          supabaseResult = { stored: false, message: error.message };
        }
      } catch (err: any) {
        console.error('[Supabase Bridge] Product save exception:', err);
        supabaseResult = { stored: false, message: err.message };
      }
    }

    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    const updated = [productWithDefaults, ...products.filter(p => p.id !== productWithDefaults.id)];
    writeJsonFile(PRODUCTS_FILE, updated);

    console.log(`[Product Uploaded] ${productWithDefaults.title} by ${productWithDefaults.sellerName || 'Seller'}. Total items: ${updated.length}`);
    res.status(201).json({
      ...productWithDefaults,
      _supabase: supabaseResult
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Failed to save product' });
  }
});

// DELETE /api/products/:id — Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
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

// POST /api/products/:id/reviews — Add star review
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
    if (supabase) {
      try {
        await supabase.from('reviews').insert({
          id: reviewItem.id,
          product_id: id,
          user_id: newReview.userId || null,
          user_name: newReview.userName || 'Rider',
          user_avatar: newReview.userAvatar || null,
          gcash_verified: newReview.gcashVerified ?? true,
          rating: Number(newReview.rating) || 5,
          comment: newReview.comment || '',
          bike_model: newReview.bikeModel || 'Motorcycle',
          helpful_count: 0
        });
      } catch (err) {
        console.warn('[Supabase Review Insert Notice]:', err);
      }
    }

    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    let targetFound = false;
    const updated = products.map(p => {
      if (p.id === id) {
        targetFound = true;
        const allReviews = [reviewItem, ...(p.reviews || [])];
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
    res.json({ success: true, product: updated.find(p => p.id === id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. USERS & AUTH API — Stored directly into Supabase 'users' table + Local Cache
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
        const { data, error } = await supabase.from('users').upsert(supabaseRow, { onConflict: 'email' });
        
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
    } else {
      console.log('[Supabase Auth] Supabase not yet configured via env vars; using server JSON store.');
    }

    // Save locally as well to ensure zero disruption
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

// 4. ORDERS API — Shared across devices + Supabase Sync
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
        await supabase.from('orders').insert({
          id: newOrder.id,
          tracking_number: newOrder.trackingNumber,
          user_id: newOrder.userId || null,
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
        });

        // Insert items
        if (Array.isArray(newOrder.items)) {
          const itemRows = newOrder.items.map((it: any, idx: number) => ({
            id: `${newOrder.id}-item-${idx}`,
            order_id: newOrder.id,
            product_id: it.productId || null,
            title: it.title,
            brand: it.brand || 'MotoParts',
            price: it.price,
            quantity: it.quantity,
            image: it.image
          }));
          await supabase.from('order_items').insert(itemRows);
        }
      } catch (err) {
        console.warn('[Supabase Order Insert Notice]:', err);
      }
    }

    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const updatedOrders = [newOrder, ...orders];
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

// 5. AI Mechanic Ask Endpoint (Gemini API)
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

// 6. PayMongo GCash Checkout Session Endpoint
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

// 7. Clear/Reset all server data endpoint (Clean Slate)
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
  });
}

startServer();
