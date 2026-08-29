import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Truck, 
  Bike, 
  ShoppingCart, 
  CreditCard, 
  Check, 
  Wrench, 
  MessageSquare, 
  ThumbsUp, 
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Product, Review, UserProfile } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectCheckout: (product: Product, quantity: number) => void;
  selectedBike: string;
  onAddReview: (productId: string, newReview: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
  currentUser: UserProfile | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectCheckout,
  selectedBike,
  onAddReview,
  currentUser
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');

  // Review Form State
  const [reviewerName, setReviewerName] = useState(currentUser?.name || 'Rider');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewBike, setReviewBike] = useState(selectedBike !== 'All Models' ? selectedBike : 'Honda Click 125i / 160');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Fitment Check
  const isBikeCompatible = selectedBike === 'All Models' || 
    product.compatibleBikes.some(b => b.toLowerCase().includes(selectedBike.toLowerCase().split(' ')[1] || selectedBike.toLowerCase()));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    onAddReview(product.id, {
      productId: product.id,
      userName: currentUser?.name || reviewerName.trim() || 'Verified Rider',
      rating: reviewRating,
      comment: reviewComment.trim(),
      bikeModel: reviewBike,
      gcashVerified: true,
    });

    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left 5 Columns: Images Gallery & Fitment Badge */}
          <div className="md:col-span-5 p-6 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 space-y-4">
            
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                {product.condition}
              </span>
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-rose-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Bike Fitment Indicator */}
            <div className={`p-3.5 rounded-xl border text-xs ${
              isBikeCompatible
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {isBikeCompatible ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                <span>
                  {selectedBike !== 'All Models' 
                    ? (isBikeCompatible ? `Verified 100% Fit for ${selectedBike}` : `May require bracket modification for ${selectedBike}`)
                    : 'Select bike to verify fitment'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Compatible Models: {product.compatibleBikes.join(', ')}
              </p>
            </div>

            {/* Seller Details with GCash verification */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sold & Shipped by:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  GCash Verified Seller
                </span>
              </div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-rose-500" />
                <span>{product.sellerName}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>GCash Payout: {product.sellerGcash}</span>
                <span>Warranty: {product.warrantyMonths} Mos.</span>
              </div>
            </div>

          </div>

          {/* Right 7 Columns: Product Specs, Buying Box & Reviews */}
          <div className="md:col-span-7 p-6 space-y-5">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">
                <span>{product.brand}</span>
                <span>•</span>
                <span className="text-slate-400">SKU: {product.sku}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug font-['Chakra_Petch']">
                {product.title}
              </h2>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{product.rating.toFixed(1)} / 5.0</span>
              </div>
              <span className="text-slate-400">({product.reviewCount} Verified Buyer Reviews)</span>
              <span className="text-emerald-400 font-medium">In Stock ({product.stock} units)</span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Online Promo Price:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-['Chakra_Petch']">
                    ₱{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ₱{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-rose-400 font-bold">PHP</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Instant GCash / PayMongo Checkout or Add to Cart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onDirectCheckout(product, quantity);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Now with GCash / Card</span>
              </button>

              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-600 flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-rose-400" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Tab Navigation: Overview vs Specs vs Reviews */}
            <div className="border-t border-slate-800 pt-4">
              <div className="flex border-b border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 px-4 border-b-2 transition-colors ${
                    activeTab === 'overview' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview & Features
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 px-4 border-b-2 transition-colors ${
                    activeTab === 'specs' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'reviews' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Customer Reviews</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-rose-400">
                    {product.reviews.length}
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="pt-4 text-xs space-y-4">
                
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <p className="text-slate-300 leading-relaxed">{product.description}</p>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-white">Key Performance Highlights:</h4>
                      <ul className="space-y-1 text-slate-300">
                        {product.keyFeatures.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Specs Tab */}
                {activeTab === 'specs' && (
                  <div className="divide-y divide-slate-800 rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between p-2.5">
                        <span className="text-slate-400 font-medium">{spec.label}</span>
                        <span className="text-white font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reviews & Star Rating Submission Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-5">
                    
                    {/* Submit Review Form */}
                    <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                          <span>Write a Product Review</span>
                        </h4>
                        <span className="text-[10px] text-emerald-400">Posting as {currentUser.name}</span>
                      </div>

                      {/* Star selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="p-1 text-amber-400 hover:scale-125 transition-transform"
                            >
                              <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-white">{reviewRating} Star{reviewRating > 1 ? 's' : ''}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {!currentUser && (
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Your Name / Handle:</label>
                            <input
                              type="text"
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="e.g. Mark Rider"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Your Motorcycle Model:</label>
                          <input
                            type="text"
                            value={reviewBike}
                            onChange={(e) => setReviewBike(e.target.value)}
                            placeholder="e.g. Honda Click 125i V2"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        {currentUser && (
                          <div className="flex items-end">
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> GCash Verified Badge Active ({currentUser.name})
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How did this part perform on your bike? (acceleration, fitment, quality, sound)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>

                      {reviewSubmitted && (
                        <p className="text-emerald-400 text-xs font-bold">Review submitted successfully! Thank you.</p>
                      )}

                      <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Review</span>
                      </button>
                    </form>

                    {/* Existing Reviews List */}
                    <div className="space-y-3">
                      {product.reviews.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">No reviews yet. Be the first rider to review this part!</p>
                      ) : (
                        product.reviews.map((rev) => (
                          <div key={rev.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{rev.userName}</span>
                                {rev.gcashVerified && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                                    GCash Buyer
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{rev.date}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-400">Tested on: <strong>{rev.bikeModel}</strong></span>
                            </div>

                            <p className="text-slate-300 text-xs leading-relaxed">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
