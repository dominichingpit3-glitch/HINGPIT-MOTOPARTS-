import React from 'react';
import { X, Map, Compass, ArrowRight, Layers, Bike, Wrench, ShieldCheck, Database, Code, Globe, Cpu } from 'lucide-react';
import { ActiveView } from '../types';

interface SiteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ActiveView) => void;
  onOpenGuides: (tab?: string) => void;
}

export const SiteMapModal: React.FC<SiteMapModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenGuides
}) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Store & Market Experience',
      items: [
        { name: 'Home Page & Hero Spotlight', view: 'home' as ActiveView, desc: 'Rule of Thirds hero, brand highlights, and featured XRM/Click parts' },
        { name: 'Store Page & Multi-Filter Catalog', view: 'store' as ActiveView, desc: 'Filter by motorcycle, category, brand, price slider, and star rating' },
        { name: 'Motorcycle Compatibility Engine', view: 'store' as ActiveView, desc: 'Direct fitment match for Honda XRM 125, Click 125/160, Aerox, Sniper' },
        { name: 'Product Star Reviews & Ratings', view: 'store' as ActiveView, desc: 'Verified GCash buyer reviews and star feedback submission' }
      ]
    },
    {
      title: 'Merchant & Rider Portals',
      items: [
        { name: 'Seller Center & Product Poster', view: 'seller' as ActiveView, desc: 'Post new street bike/scooter parts with GCash payout setup' },
        { name: 'Rider Dashboard & Order History', view: 'dashboard' as ActiveView, desc: 'Manage past purchases, GCash profile, and saved garage' },
        { name: 'Live Courier Waybill Tracker', view: 'dashboard' as ActiveView, desc: 'Real-time J&T Express & LBC delivery waypoint log' },
        { name: 'PayMongo Secure GCash Checkout', view: 'store' as ActiveView, desc: 'Instant QR, Maya, and nationwide parcel delivery' }
      ]
    },
    {
      title: 'AI & Production Architecture',
      items: [
        { name: 'AI Mechanic Tuning Chatbot', isBot: true, desc: 'Voiceflow + Gemini interactive mechanical advisor for carburetor and CVT tuning' },
        { name: '1. GitHub Repository Source Files', guideTab: 'github', desc: 'Complete production repository structure and deployment commands' },
        { name: '2. Vercel Server & Hosting Config', guideTab: 'vercel', desc: 'SPA rewrite headers and edge deployment configuration' },
        { name: '3. Supabase Postgres Database & RLS', guideTab: 'supabase', desc: 'Full DDL schema, tables, orders, products, reviews, and triggers' },
        { name: '4. PayMongo GCash Payment Gateway', guideTab: 'paymongo', desc: 'Server-side payment intent and webhook endpoints' },
        { name: '5. Voiceflow Chatbot Assistant', guideTab: 'voiceflow', desc: 'Knowledge base JSON and widget embed script' },
        { name: '6. Gemini AI Code Engine', guideTab: 'gemini', desc: 'Prompt engineering and full application source codes' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs mb-1">
            <Compass className="w-4 h-4" />
            <span>Complete Architecture & Directory</span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Chakra_Petch']">
            MOTOPARTS EXPRESS SITE MAP & DIRECTORY
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Click on any module or technical component below to navigate directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-rose-400 font-['Chakra_Petch'] border-b border-slate-800 pb-2">
                  {sec.title}
                </h3>
                <ul className="space-y-2.5">
                  {sec.items.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        onClose();
                        if (item.guideTab) {
                          onOpenGuides(item.guideTab);
                        } else if (item.view) {
                          onNavigate(item.view);
                        }
                      }}
                      className="group cursor-pointer p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800/80 hover:border-rose-500/40 transition-all"
                    >
                      <div className="font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
                        <span>{item.name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">All 6 technical chatbot modules (GitHub, Vercel, Supabase, PayMongo, Voiceflow, Gemini) are live.</span>
          <button
            onClick={() => {
              onClose();
              onOpenGuides('github');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors"
          >
            View Full Tech Guides
          </button>
        </div>

      </div>
    </div>
  );
};
