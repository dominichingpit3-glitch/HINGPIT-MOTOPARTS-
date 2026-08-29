import React from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  PhoneCall, 
  MapPin, 
  Mail, 
  Clock,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { MOTORCYCLE_MODELS } from '../data/initialProducts';
import { ActiveView } from '../types';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAboutUs?: () => void;
  onOpenContact?: () => void;
  onOpenSiteMap?: () => void;
  onOpenTechGuides?: (tab?: string) => void;
  setSelectedBike?: (bike: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenAboutUs, 
  onOpenContact, 
  onOpenSiteMap, 
  onOpenTechGuides,
  setSelectedBike 
}) => {
  return (
    <footer className="bg-[#070A10] border-t border-slate-800/80 text-slate-400 text-xs">
      
      {/* 3-Column Trust & Quality Pillars (Rule of Thirds Design) */}
      <div className="border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1: Verified Fitment */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">100% Fitment Guarantee</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Every bore kit, pulley, and brake cylinder is dyno-tested and verified for Honda XRM 125, Click 125/160, and top street bikes.
                </p>
              </div>
            </div>

            {/* Pillar 2: GCash & PayMongo Security */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">PayMongo & GCash Protected</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Real-time encrypted checkout supporting GCash QR, Maya, Bank Debit/Credit, and Cash on Delivery with seller payout escrow.
                </p>
              </div>
            </div>

            {/* Pillar 3: Express Luzon, Visayas, Mindanao Logistics */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Nationwide Express Dispatch</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Direct partnership with J&T MotoCargo, LBC Express, and Flash Express with live GPS waypoint parcel tracking.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Matrix & Sitemap Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2 (2/5 Span): Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-wider text-white font-['Chakra_Petch']">
                MOTOPARTS EXPRESS
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              The premier marketplace and tuning directory for Philippine motorcycle enthusiasts. Specializing in high-performance bolt-ons, ceramic bore kits, racing CVT setups, and genuine OEM parts for underbones and scooters.
            </p>
            
            <div className="space-y-2 pt-2 text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>10th Avenue Moto Strip, Caloocan City, Metro Manila, Philippines</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Hotline: +63 (02) 8892-MOTO / +63 917 882 9411</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Mon - Sun: 7:00 AM - 9:00 PM (Emergency Delivery Available)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Popular Street Bike Models */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider font-['Chakra_Petch']">
              Shop by Motorcycle
            </h5>
            <ul className="space-y-2">
              {MOTORCYCLE_MODELS.slice(0, 6).map((bike) => (
                <li key={bike.id}>
                  <button
                    onClick={() => {
                      if (setSelectedBike) setSelectedBike(bike.name);
                      onNavigate('store');
                    }}
                    className="hover:text-rose-400 transition-colors text-left"
                  >
                    {bike.name} Parts
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Navigation & Portals */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider font-['Chakra_Petch']">
              Navigation & Portals
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('store')} className="hover:text-white transition-colors">
                  Store Catalog & Filters
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller')} className="hover:text-rose-400 font-semibold transition-colors flex items-center gap-1">
                  <span>Seller Center (Post Parts)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  Order Tracking & Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAboutUs && onOpenAboutUs()} className="hover:text-white transition-colors">
                  About Our Racing Heritage
                </button>
              </li>
              <li>
                <button onClick={() => onOpenContact && onOpenContact()} className="hover:text-white transition-colors">
                  Contact & Garage Support
                </button>
              </li>
              <li>
                <button onClick={() => onOpenSiteMap && onOpenSiteMap()} className="hover:text-white transition-colors flex items-center gap-1 text-slate-400">
                  <Layers className="w-3 h-3" />
                  <span>Site Map Directory</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTechGuides && onOpenTechGuides('supabase')} className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Supabase & PayMongo Hub</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Payment & Courier Badges */}
          <div className="space-y-4">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider font-['Chakra_Petch']">
              Accepted Payment
            </h5>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-[10px] font-bold text-blue-400">
                GCash (PayMongo)
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-[10px] font-bold text-emerald-400">
                Maya (PayMongo)
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-[10px] font-bold text-indigo-400">
                Visa / Mastercard
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-[10px] font-bold text-amber-400">
                Cash on Delivery
              </div>
            </div>

            <h5 className="text-white font-bold text-xs uppercase tracking-wider font-['Chakra_Petch'] pt-2">
              Express Couriers
            </h5>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-400">
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">J&T Express</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">LBC Priority</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Flash Express</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Security Line */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 MotoParts Express Philippines Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Award className="w-3.5 h-3.5 text-rose-500" />
              Certified Motorcycle Mechanics Network
            </span>
            <span>•</span>
            <button onClick={() => onOpenTechGuides && onOpenTechGuides('github')} className="text-amber-400/90 hover:underline">
              System Architecture & SQL
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};
