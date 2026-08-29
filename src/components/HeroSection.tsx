import React from 'react';
import { 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Bike, 
  Flame, 
  Zap, 
  ChevronRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { MOTORCYCLE_MODELS } from '../data/initialProducts';

interface HeroSectionProps {
  onExploreStore: () => void;
  onOpenSeller: () => void;
  onOpenAiBot: () => void;
  selectedBike: string;
  setSelectedBike: (bike: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreStore,
  onOpenSeller,
  onOpenAiBot,
  selectedBike,
  setSelectedBike
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B0F19] via-[#0e1424] to-[#0B0F19] py-12 lg:py-20 border-b border-slate-800/80">
      
      {/* Background Subtle Racing Grid & Glow Elements */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Rule of Thirds Asymmetric Grid (2/3 Hero Content vs 1/3 Featured Intersection Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left 8/12 Columns (2/3 of visual space): Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* High Contrast Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Next-Gen Street Bike & Scooter Parts Market</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Philippines #1</span>
            </div>

            {/* Display Title with Hierarchical Typography */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-['Chakra_Petch']">
              MAXIMIZE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-amber-400">
                HORSEPOWER & TORQUE
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Engineered bolt-on upgrades, 54mm ceramic bore kits, lightened CVT pulley sets, and radial braking systems specifically curated for <strong className="text-white">Honda XRM 125</strong>, <strong className="text-white">Honda Click 125/160</strong>, <strong className="text-white">Yamaha Aerox</strong>, and underbones.
            </p>

            {/* Quick Model Selector Pills */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Bike className="w-4 h-4 text-rose-500" />
                <span>Select Your Motorcycle for Instant Fitment:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOTORCYCLE_MODELS.slice(0, 5).map((bike) => {
                  const isSelected = selectedBike === bike.name;
                  return (
                    <button
                      key={bike.id}
                      onClick={() => {
                        setSelectedBike(bike.name);
                        onExploreStore();
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-400'
                          : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80'
                      }`}
                    >
                      <span>{bike.name}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action CTAs (Call to Actions) */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onExploreStore}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-sm shadow-xl shadow-rose-600/25 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                <span>Shop Performance Parts</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSeller}
                className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/90 flex items-center gap-2 transition-all"
              >
                <Wrench className="w-4 h-4 text-rose-400" />
                <span>Sell Your Parts (GCash Payout)</span>
              </button>

              <button
                onClick={onOpenAiBot}
                className="px-4 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/30 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask AI Mechanic</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GCash & PayMongo Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-Time GPS Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dyno-Proven Compatibility</span>
              </div>
            </div>

          </div>

          {/* Right 4/12 Columns (1/3 Golden Section): Featured Spec Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 border border-slate-700/80 shadow-2xl shadow-black/60 group">
              
              {/* Highlight Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3" /> FEATURED FITMENT
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 (140+ Reviews)</span>
                </div>
              </div>

              {/* Product Visual */}
              <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden mb-4 bg-slate-950 border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
                  alt="Uma Racing Ceramic Cylinder Kit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-700 text-xs font-semibold text-white">
                  Compatible: Honda XRM 125 & Wave 125
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Uma Racing Original</span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    54mm Ceramic Cylinder Block & Forged Piston Upgrade Kit
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                  <div className="text-slate-400">
                    Displacement: <span className="text-white font-semibold">~130cc</span>
                  </div>
                  <div className="text-slate-400">
                    Piston Pin: <span className="text-white font-semibold">13mm Pin</span>
                  </div>
                  <div className="text-slate-400">
                    Heat Reduction: <span className="text-emerald-400 font-semibold">-30% Temp</span>
                  </div>
                  <div className="text-slate-400">
                    Shipping: <span className="text-rose-400 font-semibold">Free PH Delivery</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-400 line-through">₱4,400</span>
                    <div className="text-2xl font-black text-white font-['Chakra_Petch']">
                      ₱3,850 <span className="text-xs text-slate-400 font-normal">PHP</span>
                    </div>
                  </div>
                  <button
                    onClick={onExploreStore}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30"
                  >
                    View in Store
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
