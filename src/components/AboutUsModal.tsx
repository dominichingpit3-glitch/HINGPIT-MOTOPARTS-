import React from 'react';
import { X, ShieldCheck, Wrench, Award, Users, Bike, MapPin, Zap, Flame } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreStore: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose, onExploreStore }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs mb-1">
            <Flame className="w-4 h-4" />
            <span>Built by Riders, For Riders</span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Chakra_Petch']">
            ABOUT MOTOPARTS EXPRESS PHILIPPINES
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            The premier decentralized marketplace for underbone & scooter performance tuning in the Philippines.
          </p>
        </div>

        {/* Story */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <p>
            Founded in 2024 in Caloocan City (the Motorcycle Parts Capital of the Philippines), <strong>MotoParts Express</strong> was engineered to solve the chronic issue of counterfeit and ill-fitting motorcycle upgrades.
          </p>
          <p>
            Whether you are squeezing maximum top speed from a <strong>Honda XRM 125</strong> with a 54mm ceramic bore kit or eliminating CVT drag on a <strong>Honda Click 125i / 160</strong>, our dyno-tested fitment database ensures every bolt, piston pin, and radial master pump fits 100% plug-and-play.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white">GCash Escrow Protection</h4>
            <p className="text-[11px] text-slate-400">Funds are held safely via PayMongo until your parcel is delivered and inspected.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <Wrench className="w-5 h-5 text-rose-500" />
            <h4 className="font-bold text-white">Dyno-Proven Parts</h4>
            <p className="text-[11px] text-slate-400">Authentic Uma Racing, JVT, RCB, KOSO, and YSS factory direct components.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <Bike className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-white">PH Model Fitment Engine</h4>
            <p className="text-[11px] text-slate-400">Precise fitment algorithms specifically for Philippine market underbones and scooters.</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] text-slate-400">Headquarters: 10th Avenue, Caloocan City, Metro Manila</span>
          <button
            onClick={() => {
              onClose();
              onExploreStore();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
          >
            Explore Parts Catalog
          </button>
        </div>

      </div>
    </div>
  );
};
