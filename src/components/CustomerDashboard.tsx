import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  Truck, 
  Wallet, 
  Bike, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ExternalLink, 
  Search,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  CreditCard,
  LogIn,
  LogOut,
  Users,
  Settings,
  Store
} from 'lucide-react';
import { Order, UserProfile } from '../types';
import { MOTORCYCLE_MODELS } from '../data/initialProducts';

interface CustomerDashboardProps {
  currentUser: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void;
  orders: Order[];
  onOpenOrderTracker: (order: Order) => void;
  onExploreStore: () => void;
  onOpenAiBot: () => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'switch') => void;
  onLogout?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onUpdateUser,
  orders,
  onOpenOrderTracker,
  onExploreStore,
  onOpenAiBot,
  onOpenAuth,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'garage' | 'settings'>('orders');
  const [trackingQuery, setTrackingQuery] = useState('');
  const [newBikeModel, setNewBikeModel] = useState('Honda Click 125i / 160');
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editGcash, setEditGcash] = useState(currentUser?.gcashNumber || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editStoreName, setEditStoreName] = useState(currentUser?.storeName || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      setEditPhone(currentUser.phone);
      setEditGcash(currentUser.gcashNumber);
      setEditAddress(currentUser.address);
      setEditStoreName(currentUser.storeName || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-['Chakra_Petch']">
            SIGN IN TO ACCESS YOUR GARAGE & DASHBOARD
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Create an account or sign in to track your parcel deliveries, register your motorcycle models, and manage your GCash orders.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuth('register')}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Existing Account</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter orders for current user
  const userOrders = orders.filter(
    o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
         o.customerPhone === currentUser.phone ||
         o.customerGcash === currentUser.gcashNumber
  );

  // Search orders by tracking #
  const searchedOrder = trackingQuery.trim()
    ? orders.find(o => o.trackingNumber.toLowerCase().includes(trackingQuery.toLowerCase().trim()))
    : null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: editName,
      email: editEmail,
      phone: editPhone,
      gcashNumber: editGcash,
      address: editAddress,
      storeName: editStoreName || undefined
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddBikeToGarage = () => {
    if (!currentUser.garageBikes.includes(newBikeModel)) {
      onUpdateUser({
        ...currentUser,
        garageBikes: [...currentUser.garageBikes, newBikeModel]
      });
    }
  };

  const handleRemoveBike = (bikeName: string) => {
    onUpdateUser({
      ...currentUser,
      garageBikes: currentUser.garageBikes.filter(b => b !== bikeName)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white font-black text-xl shadow-lg border border-rose-500/30 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch']">
                {currentUser.name}
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                {currentUser.role === 'seller' ? 'Verified Merchant' : 'GCash Verified Rider'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.email} • {currentUser.phone} • {currentUser.city || 'Metro Manila'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => onOpenAuth('switch')}
            className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>Switch / Manage</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sign Out of your account"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          )}

          <button
            onClick={onOpenAiBot}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mechanic</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-rose-500 text-white bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'tracking'
              ? 'border-rose-500 text-white bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Parcel Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('garage')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'garage'
              ? 'border-rose-500 text-white bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>My Garage ({currentUser.garageBikes.length} Bikes)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'settings'
              ? 'border-rose-500 text-white bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & GCash Settings</span>
        </button>
      </div>

      {/* TAB CONTENT 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-['Chakra_Petch']">
              PURCHASE HISTORY & INVOICES
            </h2>
            <span className="text-xs text-slate-400">All PayMongo and GCash transactions</span>
          </div>

          {userOrders.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                No orders placed yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore the marketplace for cylinder blocks, CVT tuning parts, exhausts, and radial brake kits.
              </p>
              <button
                onClick={onExploreStore}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Browse Store Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{order.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{order.date}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        {order.paymentMethod} • Ref: {order.paymentRef}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[11px]">
                        {order.status}
                      </span>
                      <button
                        onClick={() => onOpenOrderTracker(order)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5 text-rose-400" />
                        <span>Track Waybill</span>
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800"
                          />
                          <div>
                            <div className="font-bold text-white line-clamp-1">{item.title}</div>
                            <div className="text-[11px] text-slate-400">
                              Qty: {item.quantity} × ₱{item.price.toLocaleString()} PHP
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-white font-['Chakra_Petch']">
                          ₱{(item.price * item.quantity).toLocaleString()} PHP
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total line */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Courier: {order.courier}</span>
                    <div className="text-sm font-black text-white font-['Chakra_Petch']">
                      Total: <span className="text-rose-400">₱{order.totalAmount.toLocaleString()} PHP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: LIVE TRACKING */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-['Chakra_Petch'] uppercase tracking-wider">
              Search Waybill Tracking Number
            </h3>
            <div className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  placeholder="e.g. MOTO-JT-..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {searchedOrder && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-rose-400 font-bold uppercase">{searchedOrder.courier}</span>
                  <h4 className="text-base font-bold text-white">Tracking #{searchedOrder.trackingNumber}</h4>
                </div>
                <button
                  onClick={() => onOpenOrderTracker(searchedOrder)}
                  className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg"
                >
                  Open Full Waybill GPS
                </button>
              </div>

              {/* Waybill Timeline */}
              <div className="space-y-4">
                {searchedOrder.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${step.completed ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                    <div>
                      <div className={`font-bold ${step.completed ? 'text-white' : 'text-slate-500'}`}>{step.title}</div>
                      <div className="text-[11px] text-slate-400">{step.location} • {step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: MY GARAGE */}
      {activeTab === 'garage' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                  YOUR MOTORCYCLE FLEET
                </h3>
                <p className="text-xs text-slate-400">
                  Products across the store are tailored to match the models in your garage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newBikeModel}
                  onChange={(e) => setNewBikeModel(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-semibold"
                >
                  {MOTORCYCLE_MODELS.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddBikeToGarage}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bike</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {currentUser.garageBikes.map((bikeName) => (
                <div
                  key={bikeName}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{bikeName}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Active Garage Model</div>
                    </div>
                  </div>

                  {currentUser.garageBikes.length > 1 && (
                    <button
                      onClick={() => handleRemoveBike(bikeName)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove bike from garage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
              ACCOUNT & GCASH PROFILE
            </h3>
            <p className="text-xs text-slate-400">
              Update your delivery address, phone number, and GCash account details.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Mobile Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-emerald-400">GCash Mobile Number</label>
                <input
                  type="tel"
                  value={editGcash}
                  onChange={(e) => setEditGcash(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-emerald-500/60 rounded-xl p-3 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {currentUser.role === 'seller' && (
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Shop / Store Name</label>
                <input
                  type="text"
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  placeholder="Store Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Delivery Address</label>
              <textarea
                rows={3}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors shadow-md shadow-rose-600/30"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Sign Out Card */}
          {onLogout && (
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out of this Device</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  End your current session as {currentUser.name} ({currentUser.email}).
                </p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-800/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Now</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
