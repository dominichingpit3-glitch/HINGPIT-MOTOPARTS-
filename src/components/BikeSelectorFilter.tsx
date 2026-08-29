import React from 'react';
import { Bike, Check, Filter, Zap, ChevronRight } from 'lucide-react';
import { MOTORCYCLE_MODELS } from '../data/initialProducts';
import { Product } from '../types';

interface BikeSelectorFilterProps {
  selectedBike: string;
  setSelectedBike: (bike: string) => void;
  products: Product[];
  onSelectAndExplore: (bike: string) => void;
}

export const BikeSelectorFilter: React.FC<BikeSelectorFilterProps> = ({
  selectedBike,
  setSelectedBike,
  products,
  onSelectAndExplore
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Guaranteed Fitment Filter</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch']">
            FILTER BY MOTORCYCLE MODEL
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Select your specific bike to verify 100% bolt-on compatibility with bore kits, pulleys, and electricals.
          </p>
        </div>

        {selectedBike !== 'All Models' && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-rose-400" />
              <span>Filtering for: <strong>{selectedBike}</strong></span>
            </div>
            <button
              onClick={() => setSelectedBike('All Models')}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOTORCYCLE_MODELS.map((bike) => {
          const isSelected = selectedBike === bike.name;
          const matchingCount = products.filter(p => 
            p.compatibleBikes.some(cb => cb.toLowerCase().includes(bike.name.toLowerCase().split(' ')[1] || bike.name.toLowerCase()))
          ).length;

          return (
            <div
              key={bike.id}
              onClick={() => {
                setSelectedBike(bike.name);
                onSelectAndExplore(bike.name);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left relative group ${
                isSelected
                  ? 'bg-rose-600/15 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded tracking-wider ${
                  bike.type === 'underbone' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {bike.type}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {matchingCount > 0 ? `${matchingCount} parts` : '12+ parts'}
                </span>
              </div>

              <h4 className={`text-xs font-black transition-colors ${
                isSelected ? 'text-rose-400' : 'text-white group-hover:text-rose-300'
              }`}>
                {bike.name}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{bike.displacement}</p>
              
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-white">
                <span className="text-[10px]">Browse Fitments</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
