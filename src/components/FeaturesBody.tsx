import React from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  Zap, 
  Bike, 
  Wallet, 
  Star, 
  Truck, 
  Bot, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Product } from '../types';

interface FeaturesBodyProps {
  onExploreStore: () => void;
  onOpenSeller: () => void;
  onOpenAiBot: () => void;
  onOpenGuides: (tab?: string) => void;
  onOpenProductDetail: (product: Product) => void;
  featuredProducts: Product[];
}

export const FeaturesBody: React.FC<FeaturesBodyProps> = ({
  onExploreStore,
  onOpenSeller,
  onOpenAiBot,
  onOpenGuides,
  onOpenProductDetail,
  featuredProducts
}) => {
  return (
    <div className="space-y-16 py-12">
      
      {/* SECTION 1: 4-PILLAR CONTRAST FEATURE GRID (Contrast & Hierarchical Typography) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            <span>Built for the Philippine Street & Drag Racing Culture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Chakra_Petch'] leading-tight">
            WHY RIDERS TRUST MOTOPARTS EXPRESS
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            From daily commuting in Metro Manila traffic to weekend spirited rides in Marilaque Highway, we deliver dyno-proven street bike and scooter components.
          </p>
        </div>

        {/* 4 Contrast Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all duration-300 group shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors font-['Chakra_Petch']">
                100% Guaranteed PH Fitment
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Specifically cataloged for <strong className="text-white">Honda XRM 125</strong>, <strong className="text-white">Click 125i/160</strong>, Aerox 155, Sniper 155, and Raider 150. No trial-and-error guessing.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-rose-400 font-bold flex items-center gap-1">
              <span>Bolt-on verified</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors font-['Chakra_Petch']">
                PayMongo GCash Escrow
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pay via instant GCash QR, Maya, or Card. Seller payouts are automatically credited directly to their GCash upon verified courier dispatch.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span>PayMongo PCI-DSS L1</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 group shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors font-['Chakra_Petch']">
                Star Rating & Buyer Reviews
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Read authentic reviews from fellow Philippine riders on top-end power gains, acceleration feel, and longevity before buying.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <span>4.9 / 5.0 Average Rating</span>
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all duration-300 group shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors font-['Chakra_Petch']">
                AI Mechanic Assistant
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Voiceflow and Gemini-driven tuning bot answers your technical queries on carburetor jetting, CVT flyball weights, and piston clearance in real time.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-rose-400 font-bold flex items-center gap-1">
              <span>Available 24/7</span>
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </section>

      {/* SECTION 2: RULE OF THIRDS HIGHLIGHT (Featured Performance Upgrades Showcase) */}
      <section className="bg-slate-950 py-12 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4" />
                <span>Underbone & Scooter Spotlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Chakra_Petch']">
                TOP-RATED TUNING UPGRADES
              </h2>
            </div>

            <button
              onClick={onExploreStore}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <span>View All 24+ Street Parts</span>
              <ArrowRight className="w-4 h-4 text-rose-500" />
            </button>
          </div>

          {/* Product Cards Grid or Empty Marketplace Invitation */}
          {featuredProducts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
              <Bike className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                MARKETPLACE IS LIVE — BE THE FIRST TO SELL
              </h3>
              <p className="text-xs text-slate-400">
                Are you a rider or tuning shop with motorcycle parts to sell? Create a seller account, list cylinder kits, CVT pulleys, exhausts, or calipers, and receive automated GCash payouts.
              </p>
              <button
                onClick={onOpenSeller}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all inline-flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Open Seller Center & Post Parts</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  onClick={() => onOpenProductDetail(product)}
                  className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-rose-500/60 p-4 space-y-3 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                        {product.condition}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="text-rose-400 font-bold uppercase">{product.brand}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors">
                        {product.title}
                      </h3>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Fit: <span className="text-slate-200 font-semibold">{product.compatibleBikes.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-base font-black text-white font-['Chakra_Petch']">
                      ₱{product.price.toLocaleString()} PHP
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">GCash Ready</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* SECTION 3: CALL TO ACTION (CTA) BAR WITH ASYMMETRIC CONTRAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border border-rose-500/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                Motorcycle Parts Merchant Network
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-['Chakra_Petch'] leading-tight">
                ARE YOU A MOTORCYCLE PARTS SELLER OR TUNING SHOP?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Post your underbone & scooter performance inventory on MotoParts Express. Receive direct payments into your GCash account via PayMongo with automated waybill printing.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenSeller}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Start Selling Your Parts Now</span>
                </button>

                <button
                  onClick={() => onOpenGuides('github')}
                  className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Inspect Production Tech Stack</span>
                </button>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm font-['Chakra_Petch'] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Seller Benefits</span>
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero listing fees for first 20 products</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Automated GCash disbursement via PayMongo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Door-to-door J&T / LBC courier pickup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Supabase Postgres real-time inventory synchronization</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
