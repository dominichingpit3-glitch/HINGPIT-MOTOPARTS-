export type MotorcycleCategory =
  | 'All Parts'
  | 'Engine & Bore Kits'
  | 'Exhaust & Mufflers'
  | 'Transmission & CVT'
  | 'Braking System'
  | 'Suspension & Shocks'
  | 'Electrical & ECU'
  | 'Body & Fairings'
  | 'Tires & Wheels'
  | 'Lighting & Horns'
  | 'Maintenance & Oils';

export type BikeType = 'underbone' | 'scooter' | 'street' | 'universal';

export type ActiveView = 'home' | 'store' | 'seller' | 'dashboard';

export interface MotorcycleModel {
  id: string;
  name: string;
  brand: string;
  displacement: string;
  type: BikeType;
  popularYears: string;
  image?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  gcashVerified?: boolean;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  bikeModel: string;
  helpfulCount: number;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: MotorcycleCategory;
  compatibleBikes: string[]; // e.g. ['Honda XRM 125', 'Honda Click 125i', 'Yamaha Aerox 155']
  bikeTypeTarget: BikeType[];
  description: string;
  keyFeatures: string[];
  specifications: ProductSpecification[];
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  sellerId: string;
  sellerName: string;
  sellerGcash: string;
  sellerVerified: boolean;
  isHot?: boolean;
  isNew?: boolean;
  freeShipping?: boolean;
  condition: 'Brand New' | 'Racing Spec' | 'OEM Surplus / Original';
  warrantyMonths: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Verified (PayMongo/GCash)'
  | 'Packed by Seller'
  | 'Dispatched from Hub'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface TimelineStep {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  trackingNumber: string;
  date: string;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    brand: string;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'GCash (PayMongo)' | 'Maya (PayMongo)' | 'Credit / Debit Card' | 'Cash on Delivery (COD)';
  paymentRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGcash: string;
  shippingAddress: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    zipCode: string;
  };
  courier: 'J&T Express MotoCargo' | 'LBC Express Priority' | 'Flash Express PH';
  estimatedDelivery: string;
  timeline: TimelineStep[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  gcashNumber: string;
  role: 'buyer' | 'seller';
  storeName?: string;
  address: string;
  barangay?: string;
  city: string;
  province: string;
  zipCode?: string;
  garageBikes: string[];
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  recommendations?: Product[];
  actionLink?: {
    text: string;
    category?: MotorcycleCategory;
    bikeModel?: string;
  };
}
