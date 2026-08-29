import React, { useState } from 'react';
import { 
  Wrench, 
  ShoppingCart, 
  Search, 
  User, 
  Bike, 
  Sparkles, 
  Layers, 
  Menu, 
  X, 
  Wallet,
  Code2,
  Info,
  Phone
} from 'lucide-react';
import { MOTORCYCLE_MODELS } from '../data/initialProducts';
import { UserProfile, ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSeller?: () => void;
  onOpenAiBot: () => void;
  onOpenAboutUs?: () => void;
  onOpenContact?: () => void;
  onOpenSiteMap?: () => void;
  onOpenTechGuides?: () => void;
  onOpenSqlSchema?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register' | 'switch') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBike: string;
  setSelectedBike: (bike: string) => void;
  currentUser: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  cartCount,
  onOpenCart,
  onOpenSeller,
  onOpenAiBot,
  onOpenAboutUs,
  onOpenContact,
  onOpenSiteMap,
  onOpenTechGuides,
  onOpenSqlSchema,
  onOpenAuth,
  searchQuery,
  setSearchQuery,
  selectedBike,
  setSelectedBike,
  currentUser
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'home' || id === 'store' || id === 'seller' || id === 'dashboard') {
      setActiveView(id as ActiveView);
    } else if (id === 'about' && onOpenAboutUs) {
      onOpenAboutUs();
    } else if (id === 'contact' && onOpenContact) {
      onOpenContact();
    } else if (id === 'sitemap' && onOpenSiteMap) {
      onOpenSiteMap();
    } else if (id === 'sql' && onOpenSqlSchema) {
      onOpenSqlSchema();
    } else if (id === 'docs' && onOpenTechGuides) {
      onOpenTechGuides();
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'store', label: 'Store Page' },
    { id: 'seller', label: 'Seller Center' },
    { id: 'dashboard', label: 'Dashboard & Tracker' },
    { id: 'sql', label: 'SQL Database & Sync', badge: 'Multi-Device' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
    { id: 'sitemap', label: 'Site Map' },
    { id: 'docs', label: 'Dev Tech Stack' }
  ];

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Rider';
  const gcashLast4 = currentUser?.gcashNumber ? currentUser.gcashNumber.slice(-4) : '9411';

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner: GCash Verification & Fast Express Delivery in PH */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 text-xs py-1.5 px-4 border-b border-rose-900/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              PHILIPPINES STREET BIKE & SCOOTER PERFORMANCE
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">
              Specialized for Honda XRM 125, Click 125/160, Aerox, Sniper & Underbones
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              <Wallet className="w-3.5 h-3.5" />
              <span>GCash & PayMongo Verified</span>
            </div>
            <button
              onClick={onOpenAiBot}
              className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>AI Mechanic Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-red-900 flex items-center justify-center shadow-lg shadow-rose-600/20 group-hover:scale-105 transition-transform border border-rose-500/30">
              <Wrench className="w-6 h-6 text-white transform -rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-wider text-white font-['Chakra_Petch']">
                  MOTOPARTS
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white rounded">
                  EXPRESS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Street Bike & Scooter Performance Hub
              </p>
            </div>
          </div>

          {/* Quick Motorcycle Filter Dropdown */}
          <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-700/70 rounded-lg px-3 py-2 text-xs text-slate-200 gap-2 shrink-0">
            <Bike className="w-4 h-4 text-rose-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Your Motorcycle:</span>
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-2"
              >
                <option value="All Models" className="bg-slate-900 text-white">All Street & Scooters</option>
                {MOTORCYCLE_MODELS.map(m => (
                  <option key={m.id} value={m.name} className="bg-slate-900 text-white">
                    {m.name} ({m.displacement})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instant Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'store') setActiveView('store');
                }}
                placeholder="Search bore kit, pulley, master cylinder, XRM 125, Click 125..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: AI Chat, Seller, User & Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* AI Mechanic Quick Trigger */}
            <button
              onClick={onOpenAiBot}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-semibold transition-all shadow-sm"
              title="Ask AI Mechanic about fitment, jetting, or CVT tuning"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Mechanic</span>
            </button>

            {/* User Profile / GCash Badge / Sign In Button */}
            {currentUser ? (
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:flex flex-col text-left text-[11px] leading-tight">
                  <span className="font-bold text-white truncate max-w-[100px]">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400">
                    {currentUser.role === 'seller' ? 'Merchant' : `GCash: ••${currentUser.gcashNumber.slice(-4)}`}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth ? onOpenAuth('register') : setActiveView('dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In / Register</span>
              </button>
            )}

            {/* Cart Drawer Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-slate-900/90 border border-slate-700/80 hover:border-rose-500/80 rounded-xl text-slate-200 hover:text-white transition-all group"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-rose-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-[#0B0F19] shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 border-t border-slate-800/80 py-2.5 overflow-x-auto text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600 text-white font-bold shadow-sm shadow-rose-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.id === 'docs' && <Code2 className="w-3.5 h-3.5 text-amber-400" />}
                {link.id === 'sitemap' && <Layers className="w-3.5 h-3.5" />}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-black border border-amber-400/30">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          {/* Mobile Motorcycle selector */}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1.5">
              <Bike className="w-4 h-4 text-rose-400" /> Filter Motorcycle:
            </label>
            <select
              value={selectedBike}
              onChange={(e) => {
                setSelectedBike(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="All Models">All Street & Scooters</option>
              {MOTORCYCLE_MODELS.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.displacement})
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'store') setActiveView('store');
              }}
              placeholder="Search parts, XRM 125, Click 125..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-2.5 rounded-lg text-left text-xs font-semibold ${
                  activeView === link.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-slate-200'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
