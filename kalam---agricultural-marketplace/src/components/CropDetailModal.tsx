import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Scale, 
  ShieldCheck, 
  ShoppingCart, 
  Check, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2,
  Tractor,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Crop, SupportedLanguage, User } from '../types';
import { MarketplaceStore } from '../services/marketplaceStore';
import { t } from '../data/translations';

interface CropDetailModalProps {
  crop: Crop | null;
  currentUser?: User | null;
  onClose: () => void;
  lang: SupportedLanguage;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  currentUser,
  onClose,
  lang,
}) => {
  const [ordered, setOrdered] = useState(false);
  // Editable quantity state allowing direct typing of any number (e.g., 12345 down to 54321)
  const [qty, setQty] = useState<number | string>(25);

  // Direct Farmer Contact & Message state
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  if (!crop) return null;

  // Retrieve farmer profile from store for verified phone and contact
  const allUsers = MarketplaceStore.getUsers();
  const farmerUser = allUsers.find(
    u => u.id === crop.seller_id || u.full_name.toLowerCase() === crop.seller_name.toLowerCase()
  ) || {
    id: crop.seller_id,
    full_name: crop.seller_name,
    phone: '+94 71 450 7821',
    email: 'farmer@kalam.lk',
    location: crop.location,
    role: 'farmer' as const,
  };

  const farmerPhone = farmerUser.phone || '+94 71 450 7821';

  // Compute numeric quantity safely for real-time calculations
  const numericQty = typeof qty === 'number' ? qty : (parseInt(qty as string, 10) || 0);
  const subtotal = numericQty * crop.price_per_kg;

  const handleQuickBuy = () => {
    if (numericQty <= 0) return;

    MarketplaceStore.createTransaction({
      crop_id: crop.id,
      crop_name: crop.name,
      buyer_id: currentUser ? currentUser.id : 3,
      buyer_name: currentUser ? currentUser.full_name : 'Dulan Wijesinghe',
      seller_id: crop.seller_id,
      seller_name: crop.seller_name,
      quantity_kg: numericQty,
      unit_price_lkr: crop.price_per_kg,
    });
    setOrdered(true);
    setTimeout(() => {
      setOrdered(false);
      onClose();
    }, 1800);
  };

  const handleIncrement = () => {
    const cur = typeof qty === 'number' ? qty : (parseInt(qty as string, 10) || 0);
    setQty(cur + 5);
  };

  const handleDecrement = () => {
    const cur = typeof qty === 'number' ? qty : (parseInt(qty as string, 10) || 0);
    setQty(Math.max(1, cur - 5));
  };

  // Produce Photos Gallery (up to 5 photos)
  const cropPhotos: string[] = (crop.images && crop.images.length > 0)
    ? crop.images
    : (crop.image_url ? [crop.image_url] : ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600']);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowMessageBox(false);
      setMessageText('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-stone-800 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Tablet Frame Header */}
        <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">Kalam Crop Inspection Tablet</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white font-bold cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Hero Image with Active Photo */}
          <div className="h-48 w-full bg-stone-100 relative overflow-hidden shrink-0">
            <img
              src={cropPhotos[activePhotoIdx] || crop.image_url || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600'}
              alt={crop.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
              {crop.category}
            </div>
            <div className="absolute bottom-3 right-3 bg-emerald-900/90 text-white font-black text-sm px-3 py-1 rounded-xl shadow-lg border border-emerald-700">
              LKR {crop.price_per_kg} / Kg
            </div>
            {cropPhotos.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Photo {activePhotoIdx + 1} of {cropPhotos.length}
              </div>
            )}
          </div>

          {/* Multi-Photo Thumbnail Strip (Up to 5 Photos) */}
          {cropPhotos.length > 1 && (
            <div className="flex items-center space-x-2 px-5 py-2.5 bg-stone-100/90 border-b border-stone-200 overflow-x-auto">
              <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider shrink-0">
                Produce Photos ({cropPhotos.length}):
              </span>
              <div className="flex items-center space-x-2">
                {cropPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activePhotoIdx === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-xs'
                        : 'border-stone-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5 space-y-4">
            
            {/* Title & Seller Header */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-stone-900">
                  {t(crop.name, lang)}
                </h3>
                <div className="flex items-center space-x-1 text-xs font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{crop.rating || 4.8} / 5.0</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 mt-1 flex items-center space-x-2">
                <span className="font-semibold text-stone-700">{crop.seller_name}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{crop.location}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-emerald-800 font-bold">
                  {crop.quantity_available.toLocaleString()} Kg in Stock
                </span>
              </p>
            </div>

            {/* DIRECT FARMER CONTACT SECTION */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-stone-50 to-emerald-50 rounded-2xl border border-emerald-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-stone-900 flex items-center space-x-1.5">
                      <span>{crop.seller_name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-stone-500">Verified Kalam Farmer Producer</span>
                  </div>
                </div>

                {/* Visible Contact Number */}
                <a
                  href={`tel:${farmerPhone.replace(/\s+/g, '')}`}
                  className="flex items-center space-x-1.5 bg-white hover:bg-emerald-100 text-emerald-900 px-2.5 py-1.5 rounded-xl border border-emerald-300 font-mono text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Call farmer directly"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{farmerPhone}</span>
                </a>
              </div>

              {/* Action Buttons: Direct Call & Send Message */}
              <div className="flex items-center space-x-2 pt-1 border-t border-emerald-100">
                <a
                  href={`tel:${farmerPhone.replace(/\s+/g, '')}`}
                  className="flex-1 py-1.5 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3 h-3 text-emerald-700" />
                  <span>Call {farmerPhone}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowMessageBox(!showMessageBox);
                    if (!messageText) {
                      setMessageText(`Hello ${crop.seller_name}, I am interested in purchasing ${crop.name} from your field in ${crop.location}. Can you confirm quality and dispatch timing?`);
                    }
                  }}
                  className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-200" />
                  <span>{showMessageBox ? 'Close Chat' : 'Send Message'}</span>
                </button>
              </div>

              {/* In-Modal Direct Message Composer */}
              {showMessageBox && (
                <form onSubmit={handleSendMessage} className="pt-2 border-t border-emerald-200 space-y-2 animate-in fade-in">
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message to the farmer..."
                      className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-500">
                      Direct SMS & In-App WhatsApp Notification to {farmerPhone}
                    </span>
                    <button
                      type="submit"
                      disabled={messageSent}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      {messageSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Sent to Farmer!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
              {crop.description || 'Pesticide-tested, farm-grade agricultural produce direct from verified local fields.'}
            </p>

            {/* EDITABLE QUANTITY (KG) SELECTOR WITH REAL-TIME TOTAL */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-stone-800 block">
                    Order Quantity (Kg)
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Type any quantity directly or use buttons
                  </span>
                </div>

                {/* Editable Input + Increment/Decrement Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-8 h-8 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 font-black text-stone-700 cursor-pointer flex items-center justify-center transition-colors shadow-2xs text-sm"
                    title="Decrease by 5 Kg"
                  >
                    -
                  </button>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setQty('');
                        } else {
                          const parsed = parseInt(val, 10);
                          setQty(isNaN(parsed) ? '' : Math.max(0, parsed));
                        }
                      }}
                      className="w-28 text-center font-mono font-black text-base py-1 px-2 bg-white border-2 border-emerald-600 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 shadow-inner"
                      placeholder="e.g. 50"
                    />
                    <span className="text-xs font-bold text-stone-600 ml-1.5">Kg</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-8 h-8 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 font-black text-stone-700 cursor-pointer flex items-center justify-center transition-colors shadow-2xs text-sm"
                    title="Increase by 5 Kg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic Real-Time Breakdown */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-700">
                  <span>Unit Price:</span>
                  <span className="font-mono font-bold">LKR {crop.price_per_kg} / Kg</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Selected Volume:</span>
                  <span className="font-mono font-bold">{numericQty.toLocaleString()} Kg</span>
                </div>
                <div className="flex justify-between text-emerald-800 text-[11px]">
                  <span>Platform Commission:</span>
                  <span className="font-bold text-emerald-700">LKR 0 (0% Fee Member Network)</span>
                </div>
                <div className="flex justify-between items-center text-emerald-950 font-black text-sm pt-1.5 border-t border-emerald-200">
                  <span>Total Amount:</span>
                  <span className="text-base font-black text-emerald-900">
                    LKR {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleQuickBuy}
                disabled={ordered || numericQty <= 0}
                className="flex-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {ordered ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
                    <span>Order Confirmed!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {lang === 'ta' ? 'வாங்கு' : lang === 'si' ? 'මිලදී ගන්න' : 'Direct Buy Order'} ({numericQty.toLocaleString()} Kg)
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
