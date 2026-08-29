import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiBot: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onOpenAiBot }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gcash, setGcash] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Customer & Seller Support</span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Chakra_Petch']">
            CONTACT MOTOPARTS EXPRESS
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Need fitment verification, bulk dealer pricing, or GCash seller disbursement help? Send us a direct dispatch.
          </p>
        </div>

        {isSent ? (
          <div className="p-8 text-center bg-slate-950/80 rounded-xl border border-emerald-500/40 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">Message Dispatched Successfully!</h3>
            <p className="text-xs text-slate-400">Our Manila technical support desk will reply to your GCash / Email within 2 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">GCash Mobile Number (Optional)</label>
              <input
                type="tel"
                value={gcash}
                onChange={(e) => setGcash(e.target.value)}
                placeholder="0917-882-9411"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Inquiry / Tuning Question *</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about XRM 125 cylinder bore clearance, Click 125 pulley angles, or merchant registration..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiBot();
                }}
                className="text-amber-400 text-xs hover:underline flex items-center gap-1"
              >
                <span>Need immediate mechanical reply? Ask AI Mechanic</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </div>
          </form>
        )}

        {/* Contact Info Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Caloocan City, Metro Manila</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>+63 (02) 8892-MOTO</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Mon-Sun: 8:00 AM - 8:00 PM</span>
          </div>
        </div>

      </div>
    </div>
  );
};
