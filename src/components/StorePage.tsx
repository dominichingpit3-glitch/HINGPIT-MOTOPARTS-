import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Star, 
  Bike, 
  ShoppingCart, 
  Eye, 
  Zap, 
  Check, 
  ArrowUpDown,
  Sparkles,
  X
} from 'lucide-react';
import { Product, MotorcycleCategory } from '../types';
import { CATEGORIES, MOTORCYCLE_MODELS } from '../data/initialProducts';

interface StorePageProps {
  products: Product[];
  selectedBike: string;
  setSelectedBike: (bike: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenAiBot: () => void;
  onNavigateToSeller?: () => void;
}

export const StorePage: React.FC<StorePageProps> = ({
  products,
  selectedBike,
  setSelectedBike,
  searchQuery,
  setSearchQuery,
  onOpenProductDetail,
  onAddToCart,
  onOpenAiBot,
  onNavigateToSeller
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MotorcycleCategory>('All Parts');
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique brands
  const allBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand));
    return ['All Brands', ...Array.from(brands)];
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesBike = product.compatibleBikes.some(b => b.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBrand && !matchesSku && !matchesBike) return false;
      }

      // 2. Bike Model Fitment
      if (selectedBike !== 'All Models') {
        const bikeKeyword = selectedBike.toLowerCase().split(' ')[1] || selectedBike.toLowerCase();
        const matchesBike = product.compatibleBikes.some(b => b.toLowerCase().includes(bikeKeyword));
        if (!matchesBike) return false;
      }

      // 3. Category
      if (selectedCategory !== 'All Parts' && product.category !== selectedCategory) {
        return false;
      }

      // 4. Brand
      if (selectedBrand !== 'All Brands' && product.brand !== selectedBrand) {
        return false;
      }

      // 5. Rating
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }

      // 6. Max Price
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
    });
  }, [products, searchQuery, selectedBike, selectedCategory, selectedBrand, minRating, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner / Store Header */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Official Moto Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Chakra_Petch']">
            STREET BIKE & SCOOTER STORE
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Browse verified racing and replacement parts for Honda XRM 125, Click 125/160, Aerox 155, Sniper 155 & Suzuki Raider.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiBot}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Check Fitment with AI</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 3 Columns: Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-300 sticky top-28">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 font-['Chakra_Petch']">
              <Filter className="w-4 h-4 text-rose-500" />
              <span>FILTER STORE</span>
            </h3>
            {(selectedBike !== 'All Models' || selectedCategory !== 'All Parts' || selectedBrand !== 'All Brands' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBike('All Models');
                  setSelectedCategory('All Parts');
                  setSelectedBrand('All Brands');
                  setSearchQuery('');
                  setMinRating(0);
                  setMaxPrice(15000);
                }}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Motorcycle Model Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-rose-400" />
              <span>Target Motorcycle:</span>
            </label>
            <select
              value={selectedBike}
              onChange={(e) => setSelectedBike(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
            >
              <option value="All Models">All Street & Scooters</option>
              {MOTORCYCLE_MODELS.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Category:
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {selectedCategory === cat && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Brand:
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
            >
              {allBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Max Budget:</span>
              <span className="text-white font-bold font-['Chakra_Petch']">₱{maxPrice.toLocaleString()} PHP</span>
            </div>
            <input
              type="range"
              min={500}
              max={15000}
              step={250}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Minimum Star Rating */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Rating:
            </label>
            <div className="flex items-center gap-1.5">
              {[0, 4, 4.5, 4.8].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                    minRating === rating
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}★+`}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Right 9 Columns: Products Grid & Search Toolbar */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Controls Bar: Search, Sort, View, Result Count */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Search filter indicator & result count */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                Showing <strong className="text-white">{filteredProducts.length}</strong> motorcycle parts
              </span>
              {selectedBike !== 'All Models' && (
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold">
                  {selectedBike}
                </span>
              )}
            </div>

            {/* Sort Dropdown & View Mode */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="featured">Featured / Hot Upgrades</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {/* Grid / List toggle */}
              <div className="hidden sm:flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  aria-label="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  aria-label="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
                <span>Filters</span>
              </button>
            </div>

          </div>

          {/* Products Matrix */}
          {products.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <Bike className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                MARKETPLACE READY: NO PARTS LISTED YET
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Users and merchants can sell and post their own motorcycle parts. All listed items support instant PayMongo GCash checkout and bike fitment checks.
              </p>
              {onNavigateToSeller && (
                <button
                  onClick={onNavigateToSeller}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/30 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Go to Seller Center & Post a Product</span>
                </button>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <Bike className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                No parts match your current filter
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try clearing your search query, adjusting your motorcycle model, or asking the AI Mechanic for alternate compatible parts.
              </p>
              <button
                onClick={() => {
                  setSelectedBike('All Models');
                  setSelectedCategory('All Parts');
                  setSelectedBrand('All Brands');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-rose-500/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-rose-950/20"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-950 border-b border-slate-800">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {product.isHot && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider">
                            HOT DEAL
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 text-[9px] font-bold uppercase tracking-wider border border-slate-700">
                          {product.condition}
                        </span>
                      </div>

                      {/* Quick View Button */}
                      <button
                        onClick={() => onOpenProductDetail(product)}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-slate-900/90 hover:bg-rose-600 text-slate-200 hover:text-white backdrop-blur-sm border border-slate-700 transition-colors shadow-md"
                        title="Quick View & Reviews"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-rose-400 uppercase">{product.brand}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{product.rating.toFixed(1)}</span>
                          <span className="text-slate-500">({product.reviewCount})</span>
                        </div>
                      </div>

                      <h3 
                        onClick={() => onOpenProductDetail(product)}
                        className="text-xs font-bold text-white line-clamp-2 hover:text-rose-400 cursor-pointer transition-colors leading-snug"
                      >
                        {product.title}
                      </h3>

                      {/* Bike Fitment Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.compatibleBikes.slice(0, 2).map((bike, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            Fit: {bike}
                          </span>
                        ))}
                        {product.compatibleBikes.length > 2 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            +{product.compatibleBikes.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between">
                    <div>
                      {product.originalPrice && (
                        <span className="text-[10px] text-slate-500 line-through block leading-none">
                          ₱{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-base font-black text-white font-['Chakra_Petch']">
                        ₱{product.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">PHP</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onAddToCart(product, 1)}
                      className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all active:scale-95"
                      title="Add to Shopping Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-rose-400 uppercase">{product.brand}</span>
                        <span className="text-slate-500">•</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3
                        onClick={() => onOpenProductDetail(product)}
                        className="text-xs sm:text-sm font-bold text-white hover:text-rose-400 cursor-pointer"
                      >
                        {product.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">Fitment: {product.compatibleBikes.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-black text-white font-['Chakra_Petch']">
                        ₱{product.price.toLocaleString()} PHP
                      </span>
                      <span className="text-[10px] text-emerald-400 block">GCash Verified Seller</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenProductDetail(product)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onAddToCart(product, 1)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-slate-900 p-6 h-full overflow-y-auto space-y-6 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-400 uppercase">Target Motorcycle:</label>
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value="All Models">All Street & Scooters</option>
                {MOTORCYCLE_MODELS.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-400 uppercase">Category:</label>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs ${
                      selectedCategory === cat ? 'bg-rose-600 text-white font-bold' : 'text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
