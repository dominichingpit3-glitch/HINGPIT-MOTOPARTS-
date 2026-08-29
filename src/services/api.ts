import { Product, Order, UserProfile, Review } from '../types';
import { getClientSupabase } from './supabase';

export interface DbStatusResponse {
  status: string;
  database: {
    supabase: 'connected' | 'error_or_table_missing' | 'connection_failed' | 'not_configured';
    supabaseMessage: string;
    localCache: string;
  };
  stats: {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
  };
}

export const api = {
  // 0. Database & Supabase Health
  async getDbStatus(): Promise<DbStatusResponse | null> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // 1. Products (Multi-Device Shared + Supabase)
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      console.warn('API getProducts fallback to local:', err);
      const saved = localStorage.getItem('motoparts_user_products');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      // Also try direct client Supabase insert if configured
      const supabase = getClientSupabase();
      if (supabase && product.id) {
        try {
          await supabase.from('products').upsert({
            id: product.id,
            title: product.title,
            brand: product.brand || 'Aftermarket',
            sku: product.sku || `MP-${Math.floor(1000 + Math.random() * 9000)}`,
            price: product.price || 0,
            stock: product.stock || 1,
            category: product.category || 'All Parts',
            compatible_bikes: product.compatibleBikes || [],
            bike_type_target: product.bikeTypeTarget || ['universal'],
            description: product.description || '',
            images: product.images || [],
            rating: 5,
            seller_id: product.sellerId || '',
            seller_name: product.sellerName || 'Tuning Shop',
            seller_gcash: product.sellerGcash || '09XXXXXXXXX',
            condition: product.condition || 'Brand New',
            warranty_months: product.warrantyMonths || 6
          });
        } catch (err) {
          console.warn('[Direct Client Supabase Product Notice]:', err);
        }
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('Failed to upload product to server');
      return await res.json();
    } catch (err) {
      console.error('API createProduct error:', err);
      // Fallback local
      const newProd: Product = {
        id: product.id || `prod-${Date.now()}`,
        title: product.title || 'Motorcycle Part',
        brand: product.brand || 'Aftermarket',
        sku: product.sku || `MP-${Math.floor(1000 + Math.random() * 9000)}`,
        price: product.price || 0,
        stock: product.stock || 1,
        category: product.category || 'All Parts',
        compatibleBikes: product.compatibleBikes || ['Universal'],
        bikeTypeTarget: product.bikeTypeTarget || ['universal'],
        description: product.description || '',
        keyFeatures: product.keyFeatures || [],
        specifications: product.specifications || [],
        images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'],
        rating: 5,
        reviewCount: 0,
        reviews: [],
        sellerId: product.sellerId || 'seller-1',
        sellerName: product.sellerName || 'Tuning Shop',
        sellerGcash: product.sellerGcash || '09XXXXXXXXX',
        sellerVerified: true,
        condition: product.condition || 'Brand New',
        warrantyMonths: product.warrantyMonths || 6
      };
      return newProd;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const supabase = getClientSupabase();
      if (supabase) {
        try {
          await supabase.from('products').delete().eq('id', productId);
        } catch (err) {
          // ignore
        }
      }
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.error('API deleteProduct error:', err);
      return false;
    }
  },

  async addReview(productId: string, review: Omit<Review, 'id' | 'date' | 'helpfulCount'>): Promise<any> {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return await res.json();
    } catch (err) {
      console.error('API addReview error:', err);
      return null;
    }
  },

  // 2. Users & Authentication (Multi-Device Shared + Supabase)
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (err) {
      console.warn('API getUsers fallback to local:', err);
      const saved = localStorage.getItem('motoparts_registered_accounts');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async register(user: Partial<UserProfile>): Promise<{ user: UserProfile; supabaseStatus?: any }> {
    try {
      // 1. Direct client Supabase insertion if client keys are set
      const supabase = getClientSupabase();
      if (supabase) {
        try {
          const supabaseRow = {
            id: user.id || `usr-${Date.now()}`,
            name: user.name,
            email: (user.email || '').toLowerCase().trim(),
            password_hash: user.password || null,
            phone: user.phone || '',
            gcash_number: user.gcashNumber || '',
            role: user.role || 'buyer',
            store_name: user.storeName || null,
            address: user.address || '',
            barangay: user.barangay || null,
            city: user.city || '',
            province: user.province || '',
            zip_code: user.zipCode || null,
            garage_bikes: user.garageBikes || []
          };
          const { error } = await supabase.from('users').upsert(supabaseRow, { onConflict: 'email' });
          if (!error) {
            console.log('[Direct Client Supabase] Inserted user account successfully!');
          }
        } catch (clientErr) {
          console.warn('[Direct Client Supabase User Notice]:', clientErr);
        }
      }

      // 2. Server API Route (which has server-side Supabase bridge with service key)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register account');
      return {
        user: data.user,
        supabaseStatus: data.supabase
      };
    } catch (err: any) {
      console.error('API register error:', err);
      const localUser: UserProfile = {
        id: user.id || `usr-${Date.now()}`,
        name: user.name || 'Rider',
        email: user.email || 'user@example.com',
        phone: user.phone || '09XXXXXXXXX',
        gcashNumber: user.gcashNumber || '09XXXXXXXXX',
        role: user.role || 'buyer',
        storeName: user.storeName,
        address: user.address || 'Metro Manila',
        barangay: user.barangay || 'Brgy. Central',
        city: user.city || 'Quezon City',
        province: user.province || 'Metro Manila',
        zipCode: user.zipCode || '1100',
        garageBikes: user.garageBikes || ['Honda Click 125i / 160']
      };
      return { user: localUser };
    }
  },

  async login(credentials: { email: string; password?: string }): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data.user;
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 3. Orders (Multi-Device Shared + Supabase)
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (err) {
      console.warn('API getOrders fallback to local:', err);
      const saved = localStorage.getItem('motoparts_user_orders');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async createOrder(order: Order): Promise<boolean> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return res.ok;
    } catch (err) {
      console.error('API createOrder error:', err);
      return false;
    }
  },

  // 4. Reset to Clean Slate
  async clearAllData(): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/clear-all', { method: 'POST' });
      return res.ok;
    } catch (err) {
      return false;
    }
  }
};
