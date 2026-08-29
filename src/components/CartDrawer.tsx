import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-700 h-full flex flex-col shadow-2xl text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            <h2 className="font-black text-base text-white font-['Chakra_Petch']">
              SHOPPING CART ({items.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-4 h-4 text-emerald-400" />
              {remainingForFreeShipping === 0
                ? <span className="text-emerald-400 font-bold">You unlocked FREE Nationwide Delivery!</span>
                : <span>Add ₱{remainingForFreeShipping.toLocaleString()} for Free Shipping</span>}
            </span>
            <span className="text-[10px] text-slate-400">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">Your cart is empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore our catalog for Honda XRM 125, Click 125, Aerox, and Sniper motorcycle parts.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 text-xs"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white line-clamp-1">{item.product.title}</span>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 block">{item.product.brand}</span>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-rose-400 font-['Chakra_Petch'] text-sm">
                      ₱{(item.product.price * item.quantity).toLocaleString()} PHP
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Button */}
        {items.length > 0 && (
          <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white font-bold font-mono">₱{subtotal.toLocaleString()} PHP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Shipping:</span>
                <span className="text-emerald-400 font-semibold">
                  {subtotal > 5000 ? 'FREE' : '₱85.00 PHP'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-800">
                <span className="text-white">Total Amount:</span>
                <span className="text-rose-500 font-['Chakra_Petch'] text-base">
                  ₱{(subtotal + (subtotal > 5000 ? 0 : 85)).toLocaleString()} PHP
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-98"
            >
              <span>Proceed to GCash Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected by PayMongo 256-Bit Escrow</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
