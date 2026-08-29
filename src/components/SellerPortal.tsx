import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Wrench, 
  Wallet, 
  CheckCircle2, 
  Package, 
  Tag, 
  Bike, 
  Image as ImageIcon, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Layers,
  Store,
  LogIn,
  LogOut,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Product, MotorcycleCategory, UserProfile } from '../types';
import { CATEGORIES, MOTORCYCLE_MODELS, SELLER_IMAGE_PRESETS } from '../data/initialProducts';

interface SellerPortalProps {
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register' | 'switch') => void;
  onLogout?: () => void;
  sellerProducts: Product[];
  onOpenProductDetail?: (product: Product) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const SellerPortal: React.FC<SellerPortalProps> = ({
  onAddProduct,
  onDeleteProduct,
  currentUser,
  onOpenAuth,
  onLogout,
  sellerProducts,
  onOpenProductDetail,
  onUpdateUser
}) => {
  const [storeName, setStoreName] = useState(currentUser?.storeName || (currentUser?.name ? `${currentUser.name}'s Moto Shop` : ''));
  const [gcashNumber, setGcashNumber] = useState(currentUser?.gcashNumber || '');
  const [sellerName, setSellerName] = useState(currentUser?.name || '');

  // New Product Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<MotorcycleCategory>('Engine & Bore Kits');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(5);
  const [condition, setCondition] = useState<'Brand New' | 'Racing Spec' | 'OEM Surplus / Original'>('Brand New');
  const [description, setDescription] = useState('');
  const [selectedBikes, setSelectedBikes] = useState<string[]>(['Honda Click 125i / 160', 'Honda XRM 125']);
  const [imageUrl, setImageUrl] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(6);
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSellerName(currentUser.name);
      setGcashNumber(currentUser.gcashNumber);
      if (currentUser.storeName) {
        setStoreName(currentUser.storeName);
      } else if (!storeName) {
        setStoreName(`${currentUser.name}'s Moto Speed Shop`);
      }
    }
  }, [currentUser]);

  const toggleBikeSelection = (bikeName: string) => {
    if (selectedBikes.includes(bikeName)) {
      if (selectedBikes.length > 1) {
        setSelectedBikes(selectedBikes.filter(b => b !== bikeName));
      }
    } else {
      setSelectedBikes([...selectedBikes, bikeName]);
    }
  };

  const handlePostProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!title.trim() || !brand.trim() || !price || !stock || selectedBikes.length === 0) {
      return;
    }

    // Default image if none provided
    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80';

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      brand: brand.trim(),
      sku: `${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      category,
      compatibleBikes: selectedBikes,
      bikeTypeTarget: ['underbone', 'scooter'],
      description: description.trim() || `Authentic high-performance ${title} manufactured by ${brand}. Dyno-tested and verified for street and racing fitment.`,
      keyFeatures: [
        'CNC precision machined for exact bolt-on fitment',
        'Directly compatible with specified motorcycle models',
        'Tested for Philippine weather and road conditions',
        `Sold by GCash Verified Merchant: ${storeName || currentUser.name}`
      ],
      specifications: [
        { label: 'Brand', value: brand.trim() },
        { label: 'Condition', value: condition },
        { label: 'Target Fitment', value: selectedBikes.join(', ') },
        { label: 'Warranty', value: `${warrantyMonths} Months` }
      ],
      images: [finalImage],
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      sellerId: currentUser.id,
      sellerName: storeName || currentUser.name,
      sellerGcash: gcashNumber || currentUser.gcashNumber,
      sellerVerified: true,
      isNew: true,
      isHot: false,
      freeShipping: Number(price) > 3000,
      condition,
      warrantyMonths
    };

    onAddProduct(newProd);

    // If user's storeName is not set, update their profile
    if (onUpdateUser && (!currentUser.storeName || currentUser.role !== 'seller')) {
      onUpdateUser({
        ...currentUser,
        role: 'seller',
        storeName: storeName || `${currentUser.name}'s Moto Shop`
      });
    }

    // Reset Form
    setTitle('');
    setBrand('');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setImageUrl('');
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);
  };

  // Filter products posted by current user
  const myPostedProducts = currentUser 
    ? sellerProducts.filter(p => p.sellerId === currentUser.id || p.sellerGcash === currentUser.gcashNumber)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Seller Center & Payout Setup */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>MotoParts Philippines Merchant & Tuning Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Chakra_Petch']">
            SELLER CENTER & GCASH DISBURSEMENT
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Post your own motorcycle parts, specify exact fitments for Honda XRM 125, Click 125/160, Aerox, and underbones, and collect automated PayMongo GCash payouts.
          </p>
        </div>

        {/* Current User Merchant Status / CTA */}
        {currentUser ? (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs space-y-2.5 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Merchant Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[9px] border border-emerald-500/30">
                ACTIVE SELLER
              </span>
            </div>
            <div className="font-bold text-white text-sm">
              {currentUser.storeName || `${currentUser.name}'s Speed Shop`}
            </div>
            <div className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span>Payout GCash: {currentUser.gcashNumber}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Escrow released directly to GCash upon courier dispatch.
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onOpenAuth('switch')}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors text-center"
              >
                Switch
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-lg text-[11px] font-semibold border border-rose-800/60 transition-colors flex items-center justify-center gap-1 text-center"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-3 min-w-[260px] text-center">
            <p className="text-slate-200 font-bold">
              Sign in or create a seller account to list your parts
            </p>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-md shadow-rose-600/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Create / Sign In Account</span>
            </button>
          </div>
        )}
      </div>

      {/* Seller Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Your Active Listings</span>
            <div className="text-2xl font-black text-white font-['Chakra_Petch'] mt-1">
              {myPostedProducts.length} {myPostedProducts.length === 1 ? 'Part' : 'Parts'} Listed
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Marketplace Status</span>
            <div className="text-2xl font-black text-emerald-400 font-['Chakra_Petch'] mt-1">
              {sellerProducts.length} Total Live Parts
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">GCash Escrow Payouts</span>
            <div className="text-2xl font-black text-amber-400 font-['Chakra_Petch'] mt-1">
              Verified 100%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Form: Post New Motorcycle Part */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Columns: Form */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white font-['Chakra_Petch'] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-rose-500" />
                <span>POST A NEW MOTORCYCLE PART FOR SALE</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in exact specs and compatible models. Your product goes live on the marketplace immediately.
              </p>
            </div>
          </div>

          {successNotice && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Success! Your motorcycle part was published and is now available on the Store page with GCash checkout enabled.</span>
            </div>
          )}

          {!currentUser && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>You are currently not signed in. Create or sign in to an account to publish parts.</span>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 whitespace-nowrap"
              >
                Sign In / Register
              </button>
            </div>
          )}

          <form onSubmit={handlePostProduct} className="space-y-5 text-xs text-slate-200">
            
            {/* Title & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Part Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Koso High-Flow 32mm Throttle Body, Uma 54mm Block"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Uma Racing, RCB, Koso, OEM Honda"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MotorcycleCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-semibold cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== 'All Parts').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Condition <span className="text-rose-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-semibold cursor-pointer"
                >
                  <option value="Brand New">Brand New (Original Factory Box)</option>
                  <option value="Racing Spec">Racing Spec / High-Performance Upgrade</option>
                  <option value="OEM Surplus / Original">OEM Surplus / Clean Original</option>
                </select>
              </div>
            </div>

            {/* Price & Stock & Warranty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Selling Price (PHP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="3500"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-bold font-['Chakra_Petch']"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Original / SRP (Optional)
                </label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="4000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-semibold font-['Chakra_Petch']"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Available Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Motorcycle Compatibility Selection */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Bike className="w-4 h-4" />
                <span>Select Compatible Motorcycle Models *</span>
              </label>
              <p className="text-slate-400 text-[11px]">
                Select the street bikes or scooters this part is guaranteed to fit:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {MOTORCYCLE_MODELS.map(bike => {
                  const isChecked = selectedBikes.includes(bike.name);
                  return (
                    <button
                      type="button"
                      key={bike.id}
                      onClick={() => toggleBikeSelection(bike.name)}
                      className={`p-2 rounded-lg text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{bike.name}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Selection & Presets */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Product Photo (Enter URL or choose a preset below)</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs"
              />

              {/* Quick Image Presets */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">Or pick a ready category photo:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SELLER_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-2.5 py-1 rounded text-[10px] border transition-all ${
                        imageUrl === preset.url
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Item Description & Tuning Recommendations
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe material, dyno gain, carburetor jetting, or CVT roller weight recommendation..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Product to MotoParts Store</span>
            </button>

          </form>
        </div>

        {/* Right 4 Columns: Seller Settings & GCash Payout Setup */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Store Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-black text-sm text-white font-['Chakra_Petch'] uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>GCASH PAYOUT CONFIGURATION</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Store / Shop Name:</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Performance Moto"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Owner Name (GCash Account):</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Owner Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">GCash Mobile Number (09XX-XXX-XXXX):</label>
                <input
                  type="tel"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="0917-xxx-xxxx"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="text-emerald-400 font-bold">✓ PayMongo Merchant Escrow:</span>
                <p>When buyers purchase your parts using GCash or Card, funds are held in escrow and released directly to your GCash upon courier waybill dispatch.</p>
              </div>
            </div>
          </div>

          {/* Quick FAQ for Sellers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-xs space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-['Chakra_Petch']">
              Seller Guidelines
            </h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Ensure exact cylinder bore and pin dimensions (e.g. 54mm 13mm pin for XRM 125).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Pack items in bubblewrap with fragile stickers for J&T / LBC courier pickup.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Counterfeit or defective safety parts will result in immediate GCash payout freeze.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* SECTION: LIST OF PRODUCTS POSTED BY THIS SELLER */}
      {myPostedProducts.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-base text-white font-['Chakra_Petch']">
              YOUR POSTED MOTORCYCLE PARTS ({myPostedProducts.length})
            </h3>
            <span className="text-xs text-slate-400">Manage, review, or delete your active listings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPostedProducts.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <img src={p.images[0]} alt={p.title} className="w-16 h-16 rounded-lg object-cover bg-slate-900 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-rose-400 font-bold uppercase">{p.brand}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{p.title}</h4>
                    <p className="text-[11px] text-emerald-400 font-bold font-['Chakra_Petch']">₱{p.price.toLocaleString()} PHP</p>
                    <p className="text-[10px] text-slate-400">Stock: {p.stock} units</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  {onOpenProductDetail && (
                    <button
                      onClick={() => onOpenProductDetail(p)}
                      className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  )}

                  {onDeleteProduct && (
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Listing</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
