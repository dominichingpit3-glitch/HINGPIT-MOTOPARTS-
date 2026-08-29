import React from 'react';
import { X, Truck, CheckCircle2, MapPin, Package, Clock, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-[11px] mb-1">
            <Truck className="w-4 h-4" />
            <span>LIVE MOTORCYCLE PARTS DELIVERY RADAR</span>
          </div>
          <h2 className="text-xl font-black text-white font-['Chakra_Petch']">
            WAYBILL TRACKING: {order.trackingNumber}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Handled by <strong className="text-white">{order.courier}</strong> • Estimated Delivery: {order.estimatedDelivery}
          </p>
        </div>

        {/* Delivery Waypoint Timeline */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Parcel Waypoint Log
          </h3>

          <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {order.timeline.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{step.title}</span>
                    {step.current && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-600/20 text-rose-400 text-[9px] font-bold border border-rose-500/40">
                        Current Status
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{step.location}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{step.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items in Package */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-slate-300 uppercase text-[10px] block">Items in this Package:</span>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-slate-300">
              <span>{item.quantity}x {item.title}</span>
              <span className="font-mono text-white">₱{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
        >
          Close Tracking Window
        </button>

      </div>
    </div>
  );
};
