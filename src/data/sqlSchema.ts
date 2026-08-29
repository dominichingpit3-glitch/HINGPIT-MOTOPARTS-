export const SQL_SCHEMA_POSTGRES = `-- =========================================================================
-- MOTOPARTS EXPRESS PHILIPPINES - RELATIONAL DATABASE SCHEMA (PostgreSQL / Supabase)
-- Use this script in Supabase SQL Editor, PostgreSQL, Neon, or Cloud SQL
-- =========================================================================

-- 1. Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS & ACCOUNTS TABLE
-- Stores riders (buyers) and tuning shop merchants (sellers)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    gcash_number VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    store_name VARCHAR(255),
    address TEXT NOT NULL,
    barangay VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    garage_bikes JSONB DEFAULT '[]'::jsonb, -- Array of rider motorcycles e.g. ["Honda Click 125i", "Yamaha Aerox 155"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user lookups by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. PRODUCTS & MOTORCYCLE PARTS TABLE
-- Stores parts uploaded by tuning shops/sellers across all devices
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2),
    stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
    category VARCHAR(100) NOT NULL,
    compatible_bikes JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["Honda XRM 125", "Honda Click 125i"]
    bike_type_target JSONB NOT NULL DEFAULT '["universal"]'::jsonb, -- ["underbone", "scooter", "street"]
    description TEXT NOT NULL,
    key_features JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb, -- [{"label": "Material", "value": "Forged Aluminum"}]
    images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of image URLs
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    seller_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    seller_name VARCHAR(255) NOT NULL,
    seller_gcash VARCHAR(50) NOT NULL,
    seller_verified BOOLEAN DEFAULT TRUE,
    is_hot BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    free_shipping BOOLEAN DEFAULT FALSE,
    condition VARCHAR(50) NOT NULL DEFAULT 'Brand New', -- 'Brand New', 'Racing Spec', 'OEM Surplus / Original'
    warranty_months INTEGER DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast searching & filtering by bike compatibility, category & price
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 4. PRODUCT REVIEWS & STAR RATINGS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    gcash_verified BOOLEAN DEFAULT TRUE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    bike_model VARCHAR(255) NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- 5. ORDERS & TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_gcash VARCHAR(50) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Order Placed',
    payment_method VARCHAR(100) NOT NULL,
    payment_ref VARCHAR(100),
    street TEXT NOT NULL,
    barangay VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    courier VARCHAR(100) NOT NULL,
    estimated_delivery VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 6. ORDER ITEMS (LINE ITEMS) TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    image TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 7. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES (Optional)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products & reviews
CREATE POLICY "Public can view all products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Public can create users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
`;

export const SQL_SCHEMA_MYSQL = `-- =========================================================================
-- MOTOPARTS EXPRESS PHILIPPINES - RELATIONAL DATABASE SCHEMA (MySQL 8.0+)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS motoparts_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE motoparts_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    gcash_number VARCHAR(50) NOT NULL,
    role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
    store_name VARCHAR(255),
    address TEXT NOT NULL,
    barangay VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    garage_bikes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    stock INT NOT NULL DEFAULT 1,
    category VARCHAR(100) NOT NULL,
    compatible_bikes JSON,
    bike_type_target JSON,
    description TEXT NOT NULL,
    key_features JSON,
    specifications JSON,
    images JSON,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    seller_id VARCHAR(100),
    seller_name VARCHAR(255) NOT NULL,
    seller_gcash VARCHAR(50) NOT NULL,
    seller_verified BOOLEAN DEFAULT TRUE,
    is_hot BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    free_shipping BOOLEAN DEFAULT FALSE,
    \`condition\` VARCHAR(50) NOT NULL DEFAULT 'Brand New',
    warranty_months INT DEFAULT 6,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_prod_category (category),
    INDEX idx_prod_brand (brand),
    INDEX idx_prod_created (created_at)
) ENGINE=InnoDB;

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    gcash_verified BOOLEAN DEFAULT TRUE,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    bike_model VARCHAR(255) NOT NULL,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_rev_product (product_id)
) ENGINE=InnoDB;

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_gcash VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Order Placed',
    payment_method VARCHAR(100) NOT NULL,
    payment_ref VARCHAR(100),
    street TEXT NOT NULL,
    barangay VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    courier VARCHAR(100) NOT NULL,
    estimated_delivery VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ord_tracking (tracking_number)
) ENGINE=InnoDB;

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(100) PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    image TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;
`;
