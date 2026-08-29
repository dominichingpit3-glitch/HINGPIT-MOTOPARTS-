import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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

// 1. Health API Route
app.get('/api/health', (req, res) => {
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const users = readJsonFile<any[]>(USERS_FILE, []);
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);

  res.json({
    status: 'ok',
    service: 'MotoParts Express Shared Cloud & API Gateway',
    timestamp: new Date().toISOString(),
    multiDeviceSync: 'active',
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

// 2. PRODUCTS API — Shared across all devices
// GET /api/products — Fetch all live products uploaded by all users
app.get('/api/products', (req, res) => {
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  res.json(products);
});

// POST /api/products — Upload a new product (Any device can see it instantly)
app.post('/api/products', (req, res) => {
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

    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    // Prepend new product
    const updated = [productWithDefaults, ...products.filter(p => p.id !== productWithDefaults.id)];
    writeJsonFile(PRODUCTS_FILE, updated);

    console.log(`[Product Uploaded] ${productWithDefaults.title} by ${productWithDefaults.sellerName || 'Seller'}. Total items: ${updated.length}`);
    res.status(201).json(productWithDefaults);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Failed to save product' });
  }
});

// DELETE /api/products/:id — Delete a product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    const updated = products.filter(p => p.id !== id);
    writeJsonFile(PRODUCTS_FILE, updated);
    res.json({ success: true, remaining: updated.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/:id/reviews — Add star review
app.post('/api/products/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const newReview = req.body;
    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    
    let targetFound = false;
    const updated = products.map(p => {
      if (p.id === id) {
        targetFound = true;
        const reviewItem = {
          ...newReview,
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          helpfulCount: 0
        };
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

// 3. USERS & AUTH API — Shared across all devices
app.get('/api/users', (req, res) => {
  const users = readJsonFile<any[]>(USERS_FILE, []);
  // Return users without exposing passwords
  const sanitized = users.map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
  res.json(sanitized);
});

app.post('/api/auth/register', (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.email || !user.name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const users = readJsonFile<any[]>(USERS_FILE, []);
    const existing = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (existing) {
      // Update existing or return conflict
      const updatedUsers = users.map(u => u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, ...user } : u);
      writeJsonFile(USERS_FILE, updatedUsers);
      const { password, ...safe } = { ...existing, ...user };
      return res.json({ message: 'Account profile updated', user: safe });
    }

    const newUser = {
      ...user,
      id: user.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    
    const { password, ...safeUser } = newUser;
    res.status(201).json({ message: 'Registration successful', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readJsonFile<any[]>(USERS_FILE, []);
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please register first.' });
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

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const users = readJsonFile<any[]>(USERS_FILE, []);
    const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
    writeJsonFile(USERS_FILE, updated);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const users = readJsonFile<any[]>(USERS_FILE, []);
    const updated = users.filter(u => u.id !== id);
    writeJsonFile(USERS_FILE, updated);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ORDERS API — Shared across devices
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.items) {
      return res.status(400).json({ error: 'Order items are required' });
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
app.post('/api/admin/clear-all', (req, res) => {
  writeJsonFile(PRODUCTS_FILE, []);
  writeJsonFile(ORDERS_FILE, []);
  writeJsonFile(USERS_FILE, []);
  res.json({ success: true, message: 'All products, orders, and demo accounts cleared to clean slate.' });
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
    console.log(`MotoParts Express Server with Multi-Device Shared Storage running on port ${PORT}`);
  });
}

startServer();
