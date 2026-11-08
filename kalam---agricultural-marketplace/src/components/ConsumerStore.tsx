import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  PackageCheck, 
  Search, 
  Star, 
  MapPin, 
  Scale, 
  Carrot, 
  Apple, 
  Wheat, 
  Flame, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Receipt,
  Image as ImageIcon
} from 'lucide-react';
import { Crop, CropCategory, SupportedLanguage, Transaction, User } from '../types';
import { MarketplaceStore } from '../services/marketplaceStore';
import { t } from '../data/translations';
import { RenewalAlertBanner } from './RenewalAlertBanner';

interface ConsumerStoreProps {
  currentUser: User;
  lang: SupportedLanguage;
  activeTab: 'marketplace' | 'my_orders';
  setActiveTab: (tab: 'marketplace' | 'my_orders') => void;
  onViewCropDetails: (crop: Crop) => void;
}

export const ConsumerStore: React.FC<ConsumerStoreProps> = ({
  currentUser,
  lang,
  activeTab,
  setActiveTab,
  onViewCropDetails,
}) => {
  const [crops, setCrops] = useState<Crop[]>(MarketplaceStore.getCrops());
  const [txns, setTxns] = useState<Transaction[]>(MarketplaceStore.getTransactions());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [buyingCrop, setBuyingCrop] = useState<Crop | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(10);
  const [orderSuccess, setOrderSuccess] = useState<Transaction | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const refreshData = () => {
    setCrops(MarketplaceStore.getCrops());
    setTxns(MarketplaceStore.getTransactions());
  };

  // Real-time synchronization subscription across panels and tabs
  useEffect(() => {
    const unsubscribe = MarketplaceStore.subscribe(refreshData);
    const handleSync = () => refreshData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('kalam_marketplace_sync', handleSync);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('kalam_marketplace_sync', handleSync);
    };
  }, []);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    if (!buyingCrop || orderQuantity <= 0) return;

    if (orderQuantity > buyingCrop.quantity_available) {
      setOrderError(`Only ${buyingCrop.quantity_available} Kg available in stock!`);
      return;
    }

    const newTxn = MarketplaceStore.createTransaction({
      crop_id: buyingCrop.id,
      crop_name: buyingCrop.name,
      buyer_id: currentUser.id,
      buyer_name: currentUser.full_name,
      seller_id: buyingCrop.seller_id,
      seller_name: buyingCrop.seller_name,
      quantity_kg: Number(orderQuantity),
      unit_price_lkr: buyingCrop.price_per_kg,
      payment_method: 'AgriPay Direct Card',
    });

    setOrderSuccess(newTxn);
    setBuyingCrop(null);
    refreshData();
  };

  // Only approved crops with stock > 0
  const activeCrops = crops.filter(c => c.moderation_status !== 'rejected');

  const filteredCrops = activeCrops.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Consumer's own purchase orders
  const myOrders = txns.filter(t => t.buyer_id === currentUser.id || t.buyer_name === currentUser.full_name);

  return (
    <div className="bg-stone-100 min-h-[calc(100vh-4rem)] text-stone-900 font-sans pb-16">
      
      {/* 365-Day Membership Renewal Alert Banner */}
      <RenewalAlertBanner
        currentUser={currentUser}
        lang={lang}
        onRenewed={refreshData}
      />

      {/* Consumer Header Banner */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <h1 className="text-xl font-black text-stone-900 tracking-tight">
                  {t('direct_from_farm', lang)}
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Connecting you directly with local farmers. Zero middleman inflation.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'marketplace'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Browse Produce
              </button>

              <button
                onClick={() => setActiveTab('my_orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my_orders'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t('my_orders', lang)} ({myOrders.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* --- TAB 1: BROWSE PRODUCE --- */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            
            {/* Search and Category Filters */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder', lang)}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="text-xs text-stone-500 font-medium">
                  Showing <strong className="text-stone-900">{filteredCrops.length}</strong> verified farm listings
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === 'All'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-500'
                  }`}
                >
                  {t('all_categories', lang)}
                </button>

                <button
                  onClick={() => setSelectedCategory('Vegetables')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === 'Vegetables'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-500'
                  }`}
                >
                  <Carrot className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('vegetables', lang)}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('Fruits')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === 'Fruits'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-500'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5 text-red-500" />
                  <span>{t('fruits', lang)}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('Grains')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === 'Grains'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-500'
                  }`}
                >
                  <Wheat className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('grains', lang)}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('Spices')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === 'Spices'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-500'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('spices', lang)}</span>
                </button>
              </div>
            </div>

            {/* Produce Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCrops.map(crop => (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 p-4 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-40 rounded-xl bg-stone-100 overflow-hidden relative mb-3">
                      <img
                        src={crop.image_url || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'}
                        alt={crop.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {crop.category}
                      </span>
                      {crop.images && crop.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-amber-300" />
                          <span>{crop.images.length} Photos</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-stone-900 text-base">
                          {t(crop.name, lang)}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 font-medium">
                          {crop.seller_name}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{crop.rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1 text-xs text-stone-500">
                      <div className="flex items-center space-x-1.5">
                        <Scale className="w-3.5 h-3.5 text-stone-400" />
                        <span>Stock: <strong className="text-stone-800">{crop.quantity_available} Kg</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{crop.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Direct Price</span>
                      <div className="text-base font-black text-emerald-900">
                        LKR {crop.price_per_kg} <span className="text-xs font-semibold text-stone-500">/ Kg</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewCropDetails(crop)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        {t('details', lang)}
                      </button>

                      <button
                        onClick={() => {
                          setBuyingCrop(crop);
                          setOrderQuantity(Math.min(25, crop.quantity_available));
                        }}
                        disabled={crop.quantity_available <= 0}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                          crop.quantity_available > 0
                            ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        {crop.quantity_available > 0 ? t('buy_now', lang) : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCrops.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500 text-xs">
                No produce found matching your search. Try adjusting filters.
              </div>
            )}

          </div>
        )}

        {/* --- TAB 2: MY PURCHASE HISTORY --- */}
        {activeTab === 'my_orders' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200">
              <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <span>{t('my_orders', lang)} ({myOrders.length})</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Past orders executed directly with local farmers via Kalam Escrow.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Crop & Farmer</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Unit Rate</th>
                    <th className="py-3 px-4">Total Paid (LKR)</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-600">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{order.crop_name}</div>
                        <div className="text-[10px] text-stone-500">{order.seller_name}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {order.quantity_kg} Kg
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        LKR {order.unit_price_lkr}/Kg
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-900">
                        LKR {order.total_amount_lkr.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {order.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'shipped'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t(order.status, lang)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {myOrders.length === 0 && (
              <div className="p-10 text-center text-stone-500 text-xs">
                You haven't placed any orders yet. Browse produce and order direct from farm!
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- QUICK ORDER MODAL --- */}
      {buyingCrop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">{t('confirm_order', lang)}</h3>
                <p className="text-xs text-stone-500">Transaction Microservice (POST /transactions)</p>
              </div>
              <button
                onClick={() => setBuyingCrop(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <img
                  src={buyingCrop.image_url || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'}
                  alt={buyingCrop.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">{buyingCrop.name}</h4>
                  <p className="text-xs text-stone-500">{buyingCrop.seller_name} • {buyingCrop.location}</p>
                  <p className="text-xs font-black text-emerald-900 mt-0.5">LKR {buyingCrop.price_per_kg} / Kg</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Order Quantity (Kg)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 5))}
                    className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 font-black text-stone-700 cursor-pointer flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-28 px-2 py-1.5 border-2 border-emerald-600 rounded-xl text-sm font-black font-mono text-center focus:outline-hidden"
                  />
                  <span className="text-xs text-stone-600 font-bold">Kg</span>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(orderQuantity + 5)}
                    className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 font-black text-stone-700 cursor-pointer flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Available in farm stock: {buyingCrop.quantity_available} Kg
                </span>
              </div>

              {orderError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                  {orderError}
                </div>
              )}

              {/* Direct 0% Commission Order Breakdown */}
              {(() => {
                const subtotal = orderQuantity * buyingCrop.price_per_kg;

                return (
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-700">
                      <span>Produce Subtotal ({orderQuantity} Kg):</span>
                      <strong className="text-stone-900">LKR {subtotal.toLocaleString()}</strong>
                    </div>

                    <div className="flex justify-between text-emerald-800 text-[11px]">
                      <span>Platform Sales Commission:</span>
                      <span className="font-bold text-emerald-700">LKR 0 (0% Fee Member Network)</span>
                    </div>

                    <div className="flex justify-between text-stone-700 text-[11px]">
                      <span>{t('farmer_net', lang)}:</span>
                      <span className="font-bold text-emerald-950">LKR {subtotal.toLocaleString()} (100%)</span>
                    </div>

                    <div className="border-t border-emerald-200 pt-2 flex justify-between font-black text-sm text-emerald-950">
                      <span>{t('total_payable', lang)}:</span>
                      <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyingCrop(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1"
                >
                  <span>Pay & Complete Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Toast */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-700 max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">{t('order_success', lang)}</h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Order #{orderSuccess.id}: {orderSuccess.quantity_kg} Kg of {orderSuccess.crop_name}
                </p>
                <p className="text-[11px] text-amber-300 mt-1">
                  Total Paid: LKR {orderSuccess.total_amount_lkr.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOrderSuccess(null)}
              className="text-emerald-300 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
