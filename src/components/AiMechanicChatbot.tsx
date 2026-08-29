import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  Bike, 
  Wrench, 
  Check, 
  Copy, 
  ExternalLink, 
  Code, 
  MessageSquare,
  HelpCircle,
  Zap,
  Volume2
} from 'lucide-react';
import { Product } from '../types';

interface AiMechanicChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedBike: string;
  onSelectProduct: (product: Product) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedParts?: Product[];
}

export const AiMechanicChatbot: React.FC<AiMechanicChatbotProps> = ({
  isOpen,
  onClose,
  products,
  selectedBike,
  onSelectProduct
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Kumusta rider! 🏍️ Ako ang iyong MotoParts AI Master Mechanic. Tanungin mo ako tungkol sa bore kits, CVT tuning (roller weights/springs), carburetor jetting, brake upgrades, o fitment para sa **Honda XRM 125**, **Honda Click 125/160**, **Yamaha Aerox**, **Sniper 155**, at **Raider 150**. Paano kita matutulungan ngayon?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let suggested: Product[] = [];

      const q = query.toLowerCase();

      if (q.includes('xrm') || q.includes('xrm 125') || q.includes('wave')) {
        reply = `Para sa **Honda XRM 125** / Wave 125: Ang pinakasikat na bolt-on power upgrade ay ang **Uma Racing 54mm Ceramic Bore Kit** (13mm pin). Nagbibigay ito ng ~130cc displacement nang hindi kailangang mag-kaskas ng crankcase (plug and play)! Mainam itong ipares sa **Keihin PWK 28mm Carburetor** na may Main Jet 115 at Slow Jet 38 para sa solidong arangkada at dulo.`;
        suggested = products.filter(p => p.compatibleBikes.some(b => b.includes('XRM 125')));
      } else if (q.includes('click') || q.includes('click 125') || q.includes('click 160') || q.includes('cvt')) {
        reply = `Para sa **Honda Click 125i / 160**: Para sa matinding arangkada at walang drag sa overtaking, inirerekomenda ang **JVT V3 Lightened Pulley & Drive Face Set (13.8° Angle)** na may halo ng **9g at 11g flyball rollers** at **1000 RPM Center Spring**. Kung gusto mo ng malinis na preno, i-upgrade ang front caliper sa **RCB S-Series 2-Piston Radial Caliper**.`;
        suggested = products.filter(p => p.compatibleBikes.some(b => b.includes('Click 125i')));
      } else if (q.includes('aerox') || q.includes('nmax') || q.includes('yamaha')) {
        reply = `Para sa **Yamaha Aerox 155 / NMAX**: Rekomendado ang **RCB 14mm Radial Master Brake Pump** para sa 1-finger sharp braking. Para sa shock suspension na hindi tumatagtag sa lubak ng Pilipinas, gamitin ang **YSS G-Series Subtank Rear Shock Absorbers (305mm)**.`;
        suggested = products.filter(p => p.compatibleBikes.some(b => b.includes('Aerox 155')));
      } else if (q.includes('raider') || q.includes('suzuki') || q.includes('sniper')) {
        reply = `Para sa **Suzuki Raider 150 Fi** at **Sniper 155**: Inirerekomenda ang **KOSO Racing High Flow Fuel Injector (160cc)** at **JVT Racing Ignition Coil** para sa malakas na spark arc at agarang throttle response.`;
        suggested = products.filter(p => p.compatibleBikes.some(b => b.includes('Raider') || b.includes('Sniper')));
      } else if (q.includes('payout') || q.includes('gcash') || q.includes('paymongo')) {
        reply = `Ang MotoParts Express ay 100% integrated sa **PayMongo GCash Gateway**! Bawat buyer ay pwedeng magbayad gamit ang GCash QR o Mobile, at ang mga Sellers ay makakatanggap ng awtomatikong disbursement sa kanilang GCash account tuwing matagumpay na nade-deliver ang pyesa.`;
      } else {
        reply = `Naiintindihan ko! Para sa pinakamahusay na performance sa kalsada o karera, laging suriin ang fitment clearance at tamang torque specs. Narito ang mga inirerekomendang high-performance parts na may mataas na buyer star rating:`;
        suggested = products.slice(0, 3);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedParts: suggested.slice(0, 3)
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] text-slate-200">
        
        {/* Chatbot Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white font-['Chakra_Petch']">
                  MOTOPARTS AI MECHANIC
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px] border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Voiceflow + Gemini AI Engine • Specializing in XRM 125, Click 125, Aerox & Scooter Tuning
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

        {/* Quick Question Chips */}
        <div className="p-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-bold text-[10px] uppercase shrink-0">Quick Ask:</span>
          {[
            'Bore kit for Honda XRM 125?',
            'Best CVT set for Honda Click 125i?',
            'Shock upgrade for Aerox 155?',
            'Paano mag-payout sa GCash?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-rose-600/30 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-br-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line">{msg.text}</div>

                {/* Suggested Parts Cards inside Chat */}
                {msg.suggestedParts && msg.suggestedParts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                      Compatible Parts in Stock:
                    </span>
                    <div className="space-y-1.5">
                      {msg.suggestedParts.map((part) => (
                        <div
                          key={part.id}
                          onClick={() => {
                            onSelectProduct(part);
                            onClose();
                          }}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={part.images[0]} alt={part.title} className="w-8 h-8 rounded object-cover" />
                            <span className="text-[11px] font-bold text-white truncate">{part.title}</span>
                          </div>
                          <span className="text-[11px] font-black text-rose-400 font-mono shrink-0">
                            ₱{part.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl w-fit border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>AI Mechanic is formulating dyno & tuning specs...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about XRM 125, Click 125, CVT tuning, bore kit specs..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md shadow-rose-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
