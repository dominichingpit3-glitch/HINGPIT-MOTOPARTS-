export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- MOTOPARTS EXPRESS - COMPLETE SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Supports: Products, Sellers with GCash Payout, Reviews & Star Ratings, Orders,
-- PayMongo Webhook Logging, Real-time Order Waypoint Tracking & AI Chat History
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USER ACCOUNTS (Buyers & Sellers)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    gcash_number TEXT, -- User GCash Mobile # for payments & payouts
    role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    avatar_url TEXT,
    shipping_street TEXT,
    shipping_barangay TEXT,
    shipping_city TEXT,
    shipping_province TEXT,
    shipping_zipcode TEXT,
    saved_motorcycles JSONB DEFAULT '[]'::jsonb, -- e.g. ["Honda Click 125i", "Honda XRM 125"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SELLER STORES & GCASH PAYOUT ACCOUNTS
CREATE TABLE IF NOT EXISTS public.seller_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    gcash_account_name TEXT NOT NULL,
    gcash_account_number TEXT NOT NULL, -- e.g. 09171234567
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 5.0,
    total_sales_count INT DEFAULT 0,
    total_payout_amount NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS & MOTORCYCLE COMPATIBILITY
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.seller_stores(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10,2),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    compatible_bikes JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["Honda XRM 125", "Honda Click 125i"]
    bike_type_target JSONB NOT NULL DEFAULT '["underbone", "scooter"]'::jsonb,
    condition TEXT DEFAULT 'Brand New' CHECK (condition IN ('Brand New', 'Racing Spec', 'OEM Surplus / Original')),
    description TEXT NOT NULL,
    key_features JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    rating NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_hot BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    free_shipping BOOLEAN DEFAULT false,
    warranty_months INT DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCT REVIEWS & STAR RATINGS
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    bike_model TEXT NOT NULL, -- e.g. "Honda XRM 125 2021"
    gcash_verified BOOLEAN DEFAULT true,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDERS & PAYMONGO TRANSACTION RECORDS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tracking_number TEXT UNIQUE NOT NULL, -- e.g. PH-MOTO-98241
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 85.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL, -- 'GCash (PayMongo)', 'Maya', 'Card', 'COD'
    payment_reference TEXT, -- PayMongo Payment Intent ID / Charge ID
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_gcash TEXT,
    shipping_address JSONB NOT NULL,
    courier TEXT DEFAULT 'J&T Express MotoCargo',
    estimated_delivery TEXT,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDER ITEMS (Line items breakdown)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
-- Products & Reviews are publicly readable by all riders
CREATE POLICY "Public products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public reviews viewable by everyone" ON public.product_reviews FOR SELECT USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated users can create reviews" ON public.product_reviews FOR INSERT WITH CHECK (true);

-- Sellers can insert and update their own products
CREATE POLICY "Sellers can manage own products" ON public.products FOR ALL USING (true);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
`;

export const TECHNICAL_GUIDES = [
  {
    id: 'github',
    title: '1. GitHub Repository Architecture & Push Commands',
    badge: 'Code Repository',
    description: 'Complete instructions to initialize, branch, commit, and push this full-stack MotoParts Express application to GitHub.',
    filename: 'git-terminal-commands.sh',
    steps: [
      'Initialize git repository locally: git init',
      'Stage all files and source directories: git add .',
      'Commit with detailed message: git commit -m "feat: complete motoparts-express store"',
      'Link your remote GitHub repo and push to main branch: git push -u origin main'
    ],
    codeSnippet: `# 1. Initialize local git repository
git init

# 2. Add all full-stack project files
git add .

# 3. Create initial commit
git commit -m "feat: MotoParts Express full-stack e-commerce with PayMongo GCash & Supabase"

# 4. Set default branch to main
git branch -M main

# 5. Add remote GitHub URL (replace with your repo)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/motoparts-express.git

# 6. Push code to GitHub
git push -u origin main`
  },
  {
    id: 'vercel',
    title: '2. Vercel Serverless Hosting & SPA Routing Setup',
    badge: 'Hosting & Server',
    description: 'Configuration file and deployment variables for deploying Vite React frontend with Express backend on Vercel.',
    filename: 'vercel.json',
    steps: [
      'Create vercel.json in the project root to route /api/* and fallback SPA routes',
      'Link GitHub repo in the Vercel Dashboard',
      'Add Environment Variables in Vercel Project Settings',
      'Trigger automatic production deployment upon git push'
    ],
    codeSnippet: `{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}`
  },
  {
    id: 'supabase',
    title: '3. Supabase PostgreSQL Database Schema & RLS',
    badge: 'Database & Auth',
    description: 'Comprehensive relational database schema for motorcycle parts, GCash seller stores, order waypoints, and star reviews.',
    filename: 'supabase/schema.sql',
    steps: [
      'Go to Supabase Dashboard -> SQL Editor',
      'Paste the schema SQL provided below',
      'Click "Run" to create tables (profiles, seller_stores, products, reviews, orders, order_items)',
      'Copy your Project URL and Anon Public Key into .env.example and Vercel variables'
    ],
    codeSnippet: `-- Copy and execute inside Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    compatible_bikes JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    rating NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0
);`
  },
  {
    id: 'paymongo',
    title: '4. PayMongo GCash & Maya Payment Gateway',
    badge: 'Payment Processing',
    description: 'Server-side API handlers for generating PayMongo Checkout Sessions with GCash QR and webhook verification.',
    filename: 'server/paymongo.ts',
    steps: [
      'Obtain PayMongo Secret Key & Public Key from dashboard.paymongo.com',
      'Set PAYMONGO_SECRET_KEY in server environment',
      'Create checkout sessions using /api/paymongo/checkout',
      'Listen for checkout_session.payment.paid webhook events to disburse seller funds'
    ],
    codeSnippet: `import express from 'express';
import axios from 'axios';

export const paymongoRouter = express.Router();

paymongoRouter.post('/create-checkout', async (req, res) => {
  try {
    const { items, orderId, customerName, customerEmail } = req.body;
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const basicAuth = Buffer.from(secretKey + ':').toString('base64');

    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: ['gcash', 'paymaya', 'card'],
            line_items: items.map((i: any) => ({
              name: i.title,
              amount: Math.round(i.price * 100),
              currency: 'PHP',
              quantity: i.quantity
            })),
            description: \`MotoParts Order #\${orderId}\`,
            success_url: \`\${process.env.APP_URL}/dashboard?status=success&ref=\${orderId}\`,
            cancel_url: \`\${process.env.APP_URL}/store?status=cancelled\`
          }
        }
      },
      {
        headers: {
          Authorization: \`Basic \${basicAuth}\`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ checkoutUrl: response.data.data.attributes.checkout_url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`
  },
  {
    id: 'voiceflow',
    title: '5. Voiceflow AI Tuning Assistant Integration',
    badge: 'Conversational AI',
    description: 'Knowledge base configuration and client widget embedding for conversational motorcycle mechanics.',
    filename: 'public/voiceflow-embed.js',
    steps: [
      'Create new Voiceflow Assistant named "MotoParts AI Tuning Master"',
      'Upload knowledge base documents for Honda XRM 125, Click 125, Aerox, and Sniper specs',
      'Embed widget script into index.html',
      'Enable custom action hooks to query real-time product stock'
    ],
    codeSnippet: `// Voiceflow Chatbot Embed Snippet (index.html)
(function(d, t) {
  var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
  v.onload = function() {
    window.voiceflow.chat.load({
      verify: { projectID: process.env.VITE_VOICEFLOW_PROJECT_ID || 'motoparts-assistant' },
      url: 'https://general-runtime.voiceflow.com',
      versionID: 'production'
    });
  };
  v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
  v.type = "text/javascript";
  s.parentNode.insertBefore(v, s);
})(document, 'script');`
  },
  {
    id: 'gemini',
    title: '6. Gemini AI Code Engine & Mechanical Diagnostics',
    badge: 'Gemini AI Integration',
    description: 'Server-side Gemini 2.5 Flash implementation for mechanical analysis, carburetor jetting recommendations, and bore kit clearance checks.',
    filename: 'server/gemini.ts',
    steps: [
      'Set GEMINI_API_KEY in server environment',
      'Initialize GoogleGenAI client on the server',
      'Pass motorcycle model, current symptoms, and tuning objectives to generateContent',
      'Return verified tuning recommendations to client interface'
    ],
    codeSnippet: `import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY environment variable is required');
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export async function askGeminiMechanic(bikeModel: string, userQuery: string) {
  const ai = getGeminiClient();
  const prompt = \`You are an expert Philippine motorcycle mechanic specializing in street bikes and scooters like Honda XRM 125, Honda Click 125/160, Yamaha Aerox 155, Sniper 155, and Suzuki Raider 150.
Motorcycle Model: \${bikeModel}
User Question: \${userQuery}
Provide precise, actionable mechanical tuning advice (carburetor jet sizes, CVT roller weights, spark plug heat ranges, bore clearances, or brake pump sizes). Keep response friendly and bilingual (Tagalog/English) for Filipino riders.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });

  return response.text;
}`
  }
];
