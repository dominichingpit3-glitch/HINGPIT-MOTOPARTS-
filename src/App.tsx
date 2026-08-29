import React, { useState, useEffect, useCallback } from 'react';
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
import { SqlSchemaModal } from './components/SqlSchemaModal';

import { Product, Order, UserProfile, CartItem, ActiveView, Review } from './types';
import { api } from './services/api';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Shared Multi-Device Data State — starts completely empty (0 preloaded items)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredAccounts, setRegisteredAccounts] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('motoparts_active_user');
    return saved ? JSON.parse(saved) : null;
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
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register' | 'switch'>('register');

  // Fetch live server products, orders, and users across all devices
  const syncServerData = useCallback(async () => {
    try {
      const [serverProds, serverOrders, serverUsers] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getUsers()
      ]);
      setProducts(serverProds);
      setOrders(serverOrders);
      setRegisteredAccounts(serverUsers);
    } catch (err) {
      console.warn('Server sync notice:', err);
    }
  }, []);

  // Initial fetch and gentle 4-second polling for real-time multi-device sync
  useEffect(() => {
    syncServerData();
    const interval = setInterval(syncServerData, 4000);
    return () => clearInterval(interval);
  }, [syncServerData]);

  // Sync active user & cart to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('motoparts_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('motoparts_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('motoparts_user_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' | 'switch' = 'register') => {
    setAuthDefaultMode(mode);
    setIsAuthOpen(true);
  };

  const handleRegister = async (newUser: UserProfile) => {
    const result = await api.register(newUser);
    const savedUser = result.user || newUser;
    setCurrentUser(savedUser);
    syncServerData();
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDeleteAccount = async (userId: string) => {
    await api.deleteUser(userId);
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    syncServerData();
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    setCurrentUser(updated);
    await api.updateUser(updated.id, updated);
    syncServerData();
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
  const handleOrderComplete = async (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    await api.createOrder(newOrder);
    setCartItems([]);
    syncServerData();
  };

  // Add Product from Seller Portal — Broadcasts to all devices
  const handleAddProduct = async (newProduct: Product) => {
    const created = await api.createProduct(newProduct);
    setProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    setActiveView('store');
    syncServerData();
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    await api.deleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
    syncServerData();
  };

  // Add Star Review
  const handleAddReview = async (productId: string, newReview: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
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

    await api.addReview(productId, newReview);
    syncServerData();
  };

  // Clear All Data back to clean slate
  const handleClearAllData = async () => {
    await api.clearAllData();
    setProducts([]);
    setOrders([]);
    setRegisteredAccounts([]);
    setCurrentUser(null);
    setCartItems([]);
    localStorage.removeItem('motoparts_active_user');
    localStorage.removeItem('motoparts_user_cart');
    setIsSqlModalOpen(false);
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
        onOpenSqlSchema={() => setIsSqlModalOpen(true)}
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
        onOpenSqlSchema={() => setIsSqlModalOpen(true)}
        setSelectedBike={setSelectedBike}
      />

      {/* MODALS & DRAWERS */}

      {/* 1. SQL Database Schema & Multi-Device Sync Modal */}
      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        productCount={products.length}
        userCount={registeredAccounts.length}
        orderCount={orders.length}
        onRefreshData={syncServerData}
        onClearAll={handleClearAllData}
      />

      {/* 2. Authentication & Account Management Modal */}
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

      {/* 3. Product Detail & Star Review Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectCheckout={handleDirectCheckout}
        selectedBike={selectedBike}
        onAddReview={handleAddReview}
        currentUser={currentUser}
      />

      {/* 4. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 5. Checkout Modal with PayMongo GCash */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderComplete={handleOrderComplete}
        currentUser={currentUser}
      />

      {/* 6. Live Parcel Order Tracking Modal */}
      <OrderTrackerModal
        order={activeTrackOrder}
        onClose={() => setActiveTrackOrder(null)}
      />

      {/* 7. AI Mechanic Tuning Chatbot */}
      <AiMechanicChatbot
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        products={products}
        selectedBike={selectedBike}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* 8. Technical Stack Integration Guides (GitHub, Vercel, Supabase, PayMongo, Voiceflow, Gemini) */}
      <TechnicalStackGuidesModal
        isOpen={isTechGuidesOpen}
        onClose={() => setIsTechGuidesOpen(false)}
        defaultTab={techGuidesDefaultTab}
      />

      {/* 9. About Us Modal */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        onExploreStore={() => setActiveView('store')}
      />

      {/* 10. Contact Us Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onOpenAiBot={() => setIsAiBotOpen(true)}
      />

      {/* 11. Site Map Modal */}
      <SiteMapModal
        isOpen={isSiteMapOpen}
        onClose={() => setIsSiteMapOpen(false)}
        onNavigate={(view) => setActiveView(view)}
        onOpenGuides={openTechGuidesWithTab}
      />

    </div>
  );
}
