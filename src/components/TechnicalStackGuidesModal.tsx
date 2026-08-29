import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Copy, 
  Check, 
  Database, 
  CreditCard, 
  Globe, 
  Bot, 
  Github, 
  Terminal, 
  ExternalLink,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { TECHNICAL_GUIDES, SUPABASE_SCHEMA_SQL } from '../data/guidesData';

interface TechnicalStackGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export const TechnicalStackGuidesModal: React.FC<TechnicalStackGuidesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'github'
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tabs = [
    { id: 'github', label: '1. GitHub (Repo)', icon: Github, color: 'text-white' },
    { id: 'vercel', label: '2. Vercel (Hosting)', icon: Globe, color: 'text-cyan-400' },
    { id: 'supabase', label: '3. Supabase (DB/SQL)', icon: Database, color: 'text-emerald-400' },
    { id: 'paymongo', label: '4. PayMongo (GCash)', icon: CreditCard, color: 'text-emerald-300' },
    { id: 'voiceflow', label: '5. Voiceflow (Bot)', icon: Bot, color: 'text-blue-400' },
    { id: 'gemini', label: '6. Gemini (AI Code)', icon: Sparkles, color: 'text-amber-400' }
  ];

  const currentGuide = TECHNICAL_GUIDES.find(g => g.id === activeTab) || TECHNICAL_GUIDES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-white font-['Chakra_Petch']">
                PRODUCTION INTEGRATION GUIDES & REPOSITORY EXPORT
              </h2>
              <p className="text-xs text-slate-400">
                Full configuration codes for GitHub, Vercel, Supabase, PayMongo, Voiceflow, and Gemini.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          <div>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">{currentGuide.badge}</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{currentGuide.title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentGuide.description}</p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px]">Integration Steps:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentGuide.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Block Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">Filename: <strong className="text-white">{currentGuide.filename}</strong></span>
              <button
                onClick={() => handleCopy(currentGuide.codeSnippet, currentGuide.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === currentGuide.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === currentGuide.id ? 'Copied to Clipboard!' : 'Copy Code Snippet'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-72">
              <code>{currentGuide.codeSnippet}</code>
            </pre>
          </div>

          {/* Full Supabase Schema SQL (if on Supabase tab) */}
          {activeTab === 'supabase' && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-xs uppercase">Full Supabase Postgres Schema (DDL + RLS Policies):</span>
                <button
                  onClick={() => handleCopy(SUPABASE_SCHEMA_SQL, 'supabase-full')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedKey === 'supabase-full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Full Schema SQL</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-emerald-300/90 font-mono text-xs overflow-x-auto leading-relaxed max-h-60">
                <code>{SUPABASE_SCHEMA_SQL}</code>
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">All configurations are 100% production-ready for GitHub, Vercel & Supabase.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
