import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Wallet, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  QrCode, 
  Lock, 
  Receipt, 
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order, UserProfile } from '../types';

interface CheckoutModalProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (order: Order) => void;
  currentUser: UserProfile | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  isOpen,
  onClose,
  onOrderComplete,
  currentUser
}) => {
  if (!isOpen || items.length === 0) return null;

  const [paymentMethod, setPaymentMethod] = useState<'GCash (PayMongo)' | 'Maya (PayMongo)' | 'Credit / Debit Card' | 'Cash on Delivery (COD)'>('GCash (PayMongo)');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '09');
  const [customerGcash, setCustomerGcash] = useState(currentUser?.gcashNumber || '09');
  
  // Address
  const [street, setStreet] = useState(currentUser?.address || '');
  const [barangay, setBarangay] = useState(currentUser?.barangay || 'Brgy. Central');
  const [city, setCity] = useState(currentUser?.city || 'Quezon City');
  const [province, setProvince] = useState(currentUser?.province || 'Metro Manila');
  const [zipCode, setZipCode] = useState(currentUser?.zipCode || '1100');
  const [courier, setCourier] = useState<'J&T Express MotoCargo' | 'LBC Express Priority' | 'Flash Express PH'>('J&T Express MotoCargo');

  // Coupon / Promo
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Processing state & completion
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 5000 ? 0 : 85;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'XRM125' || code === 'CLICK125' || code === 'MOTOPRO') {
      setDiscountAmount(250);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid voucher code. Try "XRM125" or "CLICK125" for ₱250 off!');
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const trackingNo = `PH-MOTO-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        trackingNumber: trackingNo,
        date: dateStr,
        items: items.map(i => ({
          productId: i.product.id,
          title: i.product.title,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.images[0],
          brand: i.product.brand
        })),
        subtotal,
        shippingFee,
        discount: discountAmount,
        totalAmount,
        status: paymentMethod.includes('PayMongo') ? 'Payment Verified (PayMongo/GCash)' : 'Order Placed',
        paymentMethod,
        paymentRef: `PAYM-${Math.floor(10000000 + Math.random() * 90000000)}`,
        customerName,
        customerEmail,
        customerPhone,
        customerGcash,
        shippingAddress: {
          street,
          barangay,
          city,
          province,
          zipCode
        },
        courier,
        estimatedDelivery: '2 - 3 Days (Metro Manila / Luzon Priority)',
        timeline: [
          {
            title: 'Order Verified with PayMongo GCash',
            location: 'MotoParts Manila Gateway Hub',
            time: 'Just Now',
            completed: true
          },
          {
            title: 'Warehouse Picking & Bubblewrap Packing',
            location: 'Caloocan Parts Depot',
            time: 'In Progress',
            completed: true,
            current: true
          },
          {
            title: 'Courier Handover & Hub Dispatch',
            location: `${courier} Logistics Hub`,
            time: 'Expected Tomorrow',
            completed: false
          },
          {
            title: 'Out for Delivery to Customer',
            location: `${barangay}, ${city}`,
            time: 'Expected in 2 Days',
            completed: false
          }
        ]
      };

      setIsProcessing(false);
      setCompletedOrder(newOrder);
      onOrderComplete(newOrder);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback if blocked
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          /* SUCCESS RECEIPT VIEW */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">PayMongo Payment Successful</span>
              <h2 className="text-2xl font-black text-white font-['Chakra_Petch']">
                MOTORCYCLE PARTS ORDER CONFIRMED!
              </h2>
              <p className="text-xs text-slate-300">
                Your payment of <strong className="text-white">₱{completedOrder.totalAmount.toLocaleString()} PHP</strong> was processed via {completedOrder.paymentMethod}.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Waybill Tracking Number:</span>
                <span className="font-mono font-bold text-rose-400">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PayMongo Reference ID:</span>
                <span className="font-mono text-slate-200">{completedOrder.paymentRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Courier:</span>
                <span className="font-semibold text-white">{completedOrder.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="text-slate-200">{completedOrder.shippingAddress.barangay}, {completedOrder.shippingAddress.city}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30"
              >
                Track in My Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <form onSubmit={handleProcessPayment} className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto text-xs">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted PayMongo Checkout</span>
              </div>
              <h2 className="text-xl font-black text-white font-['Chakra_Petch']">
                SECURE CHECKOUT & GCASH PAYMENT
              </h2>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Select Payment Gateway:</span>
                <span className="text-emerald-400 font-normal">Instant GCash QR & Maya Enabled</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'GCash (PayMongo)', label: 'GCash (PayMongo Instant)', icon: Wallet, sub: 'Scan QR or Auto-Debit' },
                  { id: 'Maya (PayMongo)', label: 'Maya Wallet', icon: Wallet, sub: 'Pay with Maya App / QR' },
                  { id: 'Credit / Debit Card', label: 'Visa / Mastercard', icon: CreditCard, sub: 'PayMongo Card Gateway' },
                  { id: 'Cash on Delivery (COD)', label: 'Cash on Delivery (COD)', icon: Truck, sub: 'Pay upon courier arrival' }
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-rose-600/15 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-rose-500' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-bold text-white text-xs">{m.label}</div>
                        <div className="text-[10px] text-slate-400">{m.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {paymentMethod.includes('GCash') && (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Pay with GCash Number:</span>
                      <input
                        type="tel"
                        value={customerGcash}
                        onChange={(e) => setCustomerGcash(e.target.value)}
                        placeholder="0917-882-9411"
                        className="bg-transparent border-b border-emerald-500/50 text-emerald-400 font-mono font-bold text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800 font-bold">
                    GCash Verified
                  </span>
                </div>
              )}
            </div>

            {/* Customer & Shipping Information */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Shipping & Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Recipient Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1 text-[10px]">Street / House No. / Building *</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Barangay *</label>
                  <input
                    type="text"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">City / Municipality *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Province / Region *</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Courier Selection */}
              <div>
                <label className="text-slate-400 block mb-1 text-[10px]">Choose Logistics Partner:</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-semibold"
                >
                  <option value="J&T Express MotoCargo">J&T Express MotoCargo (Fastest 1-3 Days)</option>
                  <option value="LBC Express Priority">LBC Express Priority (Nationwide Branch Pickup Available)</option>
                  <option value="Flash Express PH">Flash Express PH (Economical)</option>
                </select>
              </div>
            </div>

            {/* Voucher Code Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>Rider Discount Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter 'XRM125' or 'CLICK125'"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-bold"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="text-emerald-400 text-[11px] font-bold">✓ Voucher applied: ₱250 discount activated!</p>
              )}
              {couponError && (
                <p className="text-rose-400 text-[11px]">{couponError}</p>
              )}
            </div>

            {/* Order Total Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Parts Subtotal ({items.length} item{items.length > 1 ? 's' : ''}):</span>
                <span className="text-white font-semibold">₱{subtotal.toLocaleString()} PHP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Nationwide Shipping ({courier.split(' ')[0]}):</span>
                <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-white'}>
                  {shippingFee === 0 ? 'FREE DELIVERY' : `₱${shippingFee}.00 PHP`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Rider Voucher Discount:</span>
                  <span>-₱{discountAmount}.00 PHP</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black">
                <span className="text-white">Total Amount to Pay:</span>
                <span className="text-rose-500 font-['Chakra_Petch'] text-base">
                  ₱{totalAmount.toLocaleString()} PHP
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <span>Connecting to PayMongo Gateway...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Pay ₱{totalAmount.toLocaleString()} via {paymentMethod.split(' ')[0]}</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
