import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { BikeSelectorFilter } from './components/BikeSelectorFilter';
import { FeaturesBody } from './components/FeaturesBody';
import { StorePage } from './components/StorePage';
import { SellerPortal } from './components/SellerPortal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AiMechanicChatbot } from './components/AiMechanicChatbot';
import { TechnicalStackGuidesModal } from './components/TechnicalStackGuidesModal';
import { AboutUsModal } from './components/AboutUsModal';
import { ContactModal } from './components/ContactModal';
import { SiteMapModal } from './components/SiteMapModal';
import { AuthModal } from './components/AuthModal';

import { Product, Order, UserProfile, CartItem, ActiveView, Review } from './types';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // One-time cleanup of legacy demo storage to ensure a clean state
  useEffect(() => {
    const isCleaned = localStorage.getItem('motoparts_clean_v3');
    if (!isCleaned) {
      localStorage.removeItem('motoparts_products');
      localStorage.removeItem('motoparts_orders');
      localStorage.removeItem('motoparts_user');
      localStorage.removeItem('motoparts_cart');
      localStorage.setItem('motoparts_clean_v3', 'true');
    }
  }, []);
  
  // Data State with LocalStorage Persistence — Clean State (No preloaded products/accounts)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('motoparts_user_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('motoparts_user_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('motoparts_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('motoparts_registered_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('motoparts_user_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter & Search State
  const [selectedBike, setSelectedBike] = useState<string>('All Models');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackOrder, setActiveTrackOrder] = useState<Order | null>(null);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [isTechGuidesOpen, setIsTechGuidesOpen] = useState(false);
  const [techGuidesDefaultTab, setTechGuidesDefaultTab] = useState<string>('github');
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSiteMapOpen, setIsSiteMapOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register' | 'switch'>('register');

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('motoparts_user_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('motoparts_user_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('motoparts_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('motoparts_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('motoparts_registered_accounts', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  useEffect(() => {
    localStorage.setItem('motoparts_user_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' | 'switch' = 'register') => {
    setAuthDefaultMode(mode);
    setIsAuthOpen(true);
  };

  const handleRegister = (newUser: UserProfile) => {
    setRegisteredAccounts(prev => {
      const exists = prev.some(a => a.id === newUser.id || a.email.toLowerCase() === newUser.email.toLowerCase());
      if (!exists) return [...prev, newUser];
      return prev.map(a => a.id === newUser.id ? newUser : a);
    });
    setCurrentUser(newUser);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDeleteAccount = (userId: string) => {
    setRegisteredAccounts(prev => prev.filter(a => a.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    setRegisteredAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Direct Checkout from Modal
  const handleDirectCheckout = (product: Product, quantity: number) => {
    setCartItems([{ product, quantity }]);
    setIsCheckoutOpen(true);
  };

  // On Order Complete
  const handleOrderComplete = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    
    // Decrement stock for ordered products
    newOrder.items.forEach(orderedItem => {
      setProducts(prevProds =>
        prevProds.map(p =>
          p.id === orderedItem.productId
            ? { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) }
            : p
        )
      );
    });

    setCartItems([]);
  };

  // Add Product from Seller Portal
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setActiveView('store');
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  // Add Star Review
  const handleAddReview = (productId: string, newReview: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
    const reviewObj: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const updatedReviews = [reviewObj, ...p.reviews];
          const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...p,
            reviews: updatedReviews,
            rating: Number(avgRating.toFixed(1)),
            reviewCount: updatedReviews.length
          };
        }
        return p;
      })
    );

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => prev ? {
        ...prev,
        reviews: [reviewObj, ...prev.reviews],
        reviewCount: prev.reviewCount + 1
      } : null);
    }
  };

  const openTechGuidesWithTab = (tab?: string) => {
    if (tab) setTechGuidesDefaultTab(tab);
    setIsTechGuidesOpen(true);
  };

  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-rose-600 selection:text-white">
      
      {/* Header with Navigation Links */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={totalCartQuantity}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSeller={() => setActiveView('seller')}
        onOpenAiBot={() => setIsAiBotOpen(true)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenSiteMap={() => setIsSiteMapOpen(true)}
        onOpenTechGuides={() => openTechGuidesWithTab('github')}
        onOpenAuth={handleOpenAuth}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBike={selectedBike}
        setSelectedBike={setSelectedBike}
        currentUser={currentUser}
      />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {activeView === 'home' && (
          <div>
            {/* Rule of Thirds Hero */}
            <HeroSection
              onExploreStore={() => setActiveView('store')}
              onOpenSeller={() => setActiveView('seller')}
              onOpenAiBot={() => setIsAiBotOpen(true)}
              selectedBike={selectedBike}
              setSelectedBike={setSelectedBike}
            />

            {/* Motorcycle Fitment Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
              <BikeSelectorFilter
                selectedBike={selectedBike}
                setSelectedBike={setSelectedBike}
                products={products}
                onSelectAndExplore={(bike) => {
                  setSelectedBike(bike);
                  setActiveView('store');
                }}
              />
            </div>

            {/* Features Body & CTAs */}
            <FeaturesBody
              onExploreStore={() => setActiveView('store')}
              onOpenSeller={() => setActiveView('seller')}
              onOpenAiBot={() => setIsAiBotOpen(true)}
              onOpenGuides={openTechGuidesWithTab}
              onOpenProductDetail={(prod) => setSelectedProduct(prod)}
              featuredProducts={products}
            />
          </div>
        )}

        {/* VIEW 2: STORE PAGE */}
        {activeView === 'store' && (
          <StorePage
            products={products}
            selectedBike={selectedBike}
            setSelectedBike={setSelectedBike}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenProductDetail={(prod) => setSelectedProduct(prod)}
            onAddToCart={handleAddToCart}
            onOpenAiBot={() => setIsAiBotOpen(true)}
            onNavigateToSeller={() => setActiveView('seller')}
          />
        )}

        {/* VIEW 3: SELLER PORTAL */}
        {activeView === 'seller' && (
          <SellerPortal
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('register')}
            sellerProducts={products}
            onOpenProductDetail={(prod) => setSelectedProduct(prod)}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {/* VIEW 4: CUSTOMER DASHBOARD */}
        {activeView === 'dashboard' && (
          <CustomerDashboard
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            orders={orders}
            onOpenOrderTracker={(order) => setActiveTrackOrder(order)}
            onExploreStore={() => setActiveView('store')}
            onOpenAiBot={() => setIsAiBotOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        )}

      </main>

      {/* Footer with Site Map and Tech Integration Links */}
      <Footer
        onNavigate={(view) => setActiveView(view)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenSiteMap={() => setIsSiteMapOpen(true)}
        onOpenTechGuides={openTechGuidesWithTab}
        setSelectedBike={setSelectedBike}
      />

      {/* MODALS & DRAWERS */}

      {/* 1. Authentication & Account Management Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        registeredAccounts={registeredAccounts}
        onDeleteAccount={handleDeleteAccount}
        defaultMode={authDefaultMode}
      />

      {/* 2. Product Detail & Star Review Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectCheckout={handleDirectCheckout}
        selectedBike={selectedBike}
        onAddReview={handleAddReview}
        currentUser={currentUser}
      />

      {/* 3. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 4. Checkout Modal with PayMongo GCash */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderComplete={handleOrderComplete}
        currentUser={currentUser}
      />

      {/* 5. Live Parcel Order Tracking Modal */}
      <OrderTrackerModal
        order={activeTrackOrder}
        onClose={() => setActiveTrackOrder(null)}
      />

      {/* 6. AI Mechanic Tuning Chatbot */}
      <AiMechanicChatbot
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        products={products}
        selectedBike={selectedBike}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* 7. Technical Stack Integration Guides (GitHub, Vercel, Supabase, PayMongo, Voiceflow, Gemini) */}
      <TechnicalStackGuidesModal
        isOpen={isTechGuidesOpen}
        onClose={() => setIsTechGuidesOpen(false)}
        defaultTab={techGuidesDefaultTab}
      />

      {/* 8. About Us Modal */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        onExploreStore={() => setActiveView('store')}
      />

      {/* 9. Contact Us Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onOpenAiBot={() => setIsAiBotOpen(true)}
      />

      {/* 10. Site Map Modal */}
      <SiteMapModal
        isOpen={isSiteMapOpen}
        onClose={() => setIsSiteMapOpen(false)}
        onNavigate={(view) => setActiveView(view)}
        onOpenGuides={openTechGuidesWithTab}
      />

    </div>
  );
}
