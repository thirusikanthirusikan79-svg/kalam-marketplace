import React, { useState, useEffect } from 'react';
import { 
  Tractor, 
  Plus, 
  Package, 
  PackageCheck, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Scale, 
  Coins, 
  Search,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Camera,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { Crop, CropCategory, SupportedLanguage, Transaction, User } from '../types';
import { MarketplaceStore } from '../services/marketplaceStore';
import { t } from '../data/translations';
import { RenewalAlertBanner } from './RenewalAlertBanner';

interface FarmerDashboardProps {
  currentUser: User;
  lang: SupportedLanguage;
  activeTab: 'crops' | 'orders' | 'earnings';
  setActiveTab: (tab: 'crops' | 'orders' | 'earnings') => void;
  onViewCropDetails: (crop: Crop) => void;
}

const PRESET_CROP_IMAGES = [
  { name: 'Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop' },
  { name: 'Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop' },
  { name: 'Grains/Paddy', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop' },
  { name: 'Red Chillies', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop' },
  { name: 'Papayas', url: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&auto=format&fit=crop' },
  { name: 'Yellow Bananas', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop' },
  { name: 'Tomatoes', url: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=500&auto=format&fit=crop' },
  { name: 'Green Beans', url: 'https://images.unsplash.com/photo-1551893478-d726eaf0442c?w=500&auto=format&fit=crop' },
];

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentUser,
  lang,
  activeTab,
  setActiveTab,
  onViewCropDetails,
}) => {
  const [crops, setCrops] = useState<Crop[]>(MarketplaceStore.getCrops());
  const [txns, setTxns] = useState<Transaction[]>(MarketplaceStore.getTransactions());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  // Farmer's farm & verification photos state (up to 5 photos)
  const [isProfilePhotosOpen, setIsProfilePhotosOpen] = useState(false);
  const [userPhotos, setUserPhotos] = useState<string[]>(
    currentUser.photos || [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
    ]
  );

  const saveUserPhotosToStore = (photosToSave: string[]) => {
    const allUsers = MarketplaceStore.getUsers();
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? { ...u, photos: photosToSave } : u);
    MarketplaceStore.saveUsers(updatedUsers);
    const updatedSession = { ...currentUser, photos: photosToSave };
    MarketplaceStore.setCurrentSession(updatedSession);
  };

  const handleFarmerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remainingSlots = 5 - userPhotos.length;
    if (remainingSlots <= 0) return;

    const filesToRead = Array.from(files).slice(0, remainingSlots);
    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setUserPhotos(prev => {
            if (prev.length >= 5) return prev;
            const updated = [...prev, res];
            saveUserPhotosToStore(updated);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveFarmerPhoto = (index: number) => {
    const updated = userPhotos.filter((_, i) => i !== index);
    setUserPhotos(updated);
    saveUserPhotosToStore(updated);
  };

  const handleAddFarmerPresetPhoto = (url: string) => {
    if (userPhotos.length >= 5) return;
    const updated = [...userPhotos, url];
    setUserPhotos(updated);
    saveUserPhotosToStore(updated);
  };

  // New crop form state matching Pydantic CropCreate
  // New crop form state matching Pydantic CropCreate with up to 5 photos
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables' as CropCategory,
    price_per_kg: 200,
    quantity_available: 500,
    location: currentUser.location || 'Jaffna Northern District',
    description: '',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
    ] as string[],
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
  });

  // Photo upload mode
  const [uploadMode, setUploadMode] = useState<'upload' | 'url' | 'presets'>('upload');

  // Edit crop form state
  const [editPrice, setEditPrice] = useState<number>(200);
  const [editQty, setEditQty] = useState<number>(500);
  const [editDesc, setEditDesc] = useState<string>('');

  const refreshData = () => {
    setCrops(MarketplaceStore.getCrops());
    setTxns(MarketplaceStore.getTransactions());
  };

  // Real-time synchronization subscription across all panels
  useEffect(() => {
    refreshData();
    const unsubscribe = MarketplaceStore.subscribe(refreshData);
    window.addEventListener('storage', refreshData);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', refreshData);
    };
  }, []);

  const handleStartEdit = (crop: Crop, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCrop(crop);
    setEditPrice(crop.price_per_kg);
    setEditQty(crop.quantity_available);
    setEditDesc(crop.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop || editPrice <= 0 || editQty < 0) return;

    MarketplaceStore.updateCrop(editingCrop.id, {
      price_per_kg: Number(editPrice),
      quantity_available: Number(editQty),
      description: editDesc.trim(),
    });

    setEditingCrop(null);
    refreshData();
  };

  // Crop multi-photo upload handler: allows selecting and uploading up to 5 photos simultaneously
  const handleCropImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 5 - formData.images.length;
    if (remaining <= 0) return;

    const filesToRead = Array.from(files).slice(0, remaining);
    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setFormData(prev => {
            if (prev.images.length >= 5) return prev;
            const updatedImages = [...prev.images, res];
            return {
              ...prev,
              images: updatedImages,
              image_url: updatedImages[0] || prev.image_url,
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveCropImage = (index: number) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || '',
      };
    });
  };

  const handleReplaceCropImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const res = reader.result;
        setFormData(prev => {
          const updated = [...prev.images];
          updated[index] = res;
          return {
            ...prev,
            images: updated,
            image_url: updated[0],
          };
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddPresetCropImage = (url: string) => {
    if (formData.images.length >= 5) return;
    setFormData(prev => {
      const updated = [...prev.images, url];
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || prev.image_url,
      };
    });
  };

  // Farmer's crops
  const farmerCrops = crops.filter(c => c.seller_id === currentUser.id || c.seller_id === 2);
  const filteredCrops = farmerCrops.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Orders received for this farmer's produce (100% payout to farmer)
  const receivedOrders = txns.filter(t => t.seller_id === currentUser.id || t.seller_id === 2);
  const totalEarned = receivedOrders.reduce((acc, t) => acc + t.seller_payout_lkr, 0);

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price_per_kg <= 0 || formData.quantity_available <= 0) return;

    MarketplaceStore.addCrop({
      name: formData.name.trim(),
      category: formData.category,
      price_per_kg: Number(formData.price_per_kg),
      quantity_available: Number(formData.quantity_available),
      initial_quantity: Number(formData.quantity_available),
      seller_id: currentUser.id,
      seller_name: currentUser.full_name,
      location: formData.location.trim() || 'Northern Province',
      description: formData.description.trim() || 'Fresh farm-graded harvest.',
      image_url: formData.images[0] || formData.image_url || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
      images: formData.images.length > 0 ? formData.images : [formData.image_url],
      rating: 4.9,
      moderation_status: 'approved',
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      category: 'Vegetables',
      price_per_kg: 200,
      quantity_available: 500,
      location: currentUser.location || 'Jaffna Northern District',
      description: '',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop'],
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
    });
    refreshData();
  };

  const handleDeleteCrop = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    MarketplaceStore.deleteCrop(id);
    refreshData();
  };

  const handleFulfillOrder = (orderId: number) => {
    MarketplaceStore.updateTransactionStatus(orderId, 'shipped');
    refreshData();
  };

  return (
    <div className="bg-stone-100 min-h-[calc(100vh-4rem)] text-stone-900 font-sans pb-16">
      
      {/* 365-Day Membership Renewal Alert Banner (Triggered if expiring within 30 days or expired) */}
      <RenewalAlertBanner
        currentUser={currentUser}
        lang={lang}
        onRenewed={refreshData}
      />

      {/* Farmer Hub Header Banner */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Tractor className="w-5 h-5 text-emerald-700" />
                <h1 className="text-xl font-black text-stone-900 tracking-tight">
                  {currentUser.full_name} - {t('farmer_dashboard', lang)}
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  0% Commission Member
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Strict 0% Sales Commission: As an active Annual Member (LKR 1,000/Yr), you retain 100% of all produce sales proceeds.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsProfilePhotosOpen(true)}
                className="flex items-center space-x-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Farm Photos ({userPhotos.length}/5)</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t('add_crop', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Active Crops Listed
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {farmerCrops.length} Produce Items
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Available directly to registered consumers
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Orders Received
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {receivedOrders.length} Completed / Shipped
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Direct farm-to-consumer escrow shipments
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-300 bg-emerald-50/50 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Total Net Farmer Earnings (100%)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                0% Fee Kept
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">
              LKR {totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-800 mt-0.5 block">
              Zero commission deducted under your annual subscription
            </span>
          </div>
        </div>

        {/* --- TAB 1: MY CROP LISTINGS --- */}
        {activeTab === 'crops' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  {t('my_crops', lang)} ({filteredCrops.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Manage inventory stock, adjust live pricing per Kg, and publish new harvests.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your crop listings..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-100 text-xs rounded-full border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredCrops.map(crop => (
                <div
                  key={crop.id}
                  onClick={() => onViewCropDetails(crop)}
                  className="bg-stone-50 hover:bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 p-3.5 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-36 rounded-xl bg-stone-200 overflow-hidden relative mb-3">
                      <img
                        src={crop.image_url || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'}
                        alt={crop.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {crop.category}
                      </span>
                      {crop.images && crop.images.length > 1 && (
                        <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-amber-300" />
                          <span>{crop.images.length} Photos</span>
                        </span>
                      )}
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <button
                          onClick={(e) => handleStartEdit(crop, e)}
                          className="p-1.5 rounded-full bg-white/90 hover:bg-emerald-600 hover:text-white text-stone-700 transition-colors shadow-2xs cursor-pointer"
                          title="Edit price & stock"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCrop(crop.id, e)}
                          className="p-1.5 rounded-full bg-white/90 hover:bg-rose-600 hover:text-white text-stone-700 transition-colors shadow-2xs cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-stone-900 text-sm">
                      {t(crop.name, lang)}
                    </h4>

                    <div className="text-xs text-stone-500 flex items-center space-x-1 mt-1">
                      <Scale className="w-3.5 h-3.5 text-stone-400" />
                      <span>Stock Available: <strong className="text-stone-800">{crop.quantity_available} Kg</strong></span>
                    </div>

                    <div className="text-xs text-stone-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{crop.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-medium">Direct Price</span>
                      <div className="text-sm font-black text-emerald-900">
                        LKR {crop.price_per_kg}/Kg
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCropDetails(crop);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      {t('details', lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCrops.length === 0 && (
              <div className="text-center py-10 text-stone-500 text-xs">
                No crops listed yet. Click "+ Add New Crop" to publish your first produce listing!
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: ORDERS RECEIVED (100% FARMER PAYOUT, 0% COMMISSION) --- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200">
              <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                <PackageCheck className="w-5 h-5 text-emerald-700" />
                <span>{t('orders_received', lang)} ({receivedOrders.length})</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time purchase orders placed by consumers. You receive 100% of order totals with zero commissions deducted.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Produce & Buyer</th>
                    <th className="py-3 px-4">Qty Ordered</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Your Net Payout (100%)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {receivedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-600">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{order.crop_name}</div>
                        <div className="text-[10px] text-stone-500">Buyer: {order.buyer_name}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {order.quantity_kg} Kg
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        LKR {order.unit_price_lkr}/Kg
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-900 text-sm">
                        LKR {order.seller_payout_lkr.toLocaleString()}
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
                      <td className="py-3 px-4 text-center">
                        {order.status !== 'shipped' && order.status !== 'completed' ? (
                          <button
                            onClick={() => handleFulfillOrder(order.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                          >
                            {t('mark_shipped', lang)}
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-stone-400">
                            Dispatched
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: EARNINGS & PAYOUTS LEDGER --- */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>{t('earnings_ledger', lang)}</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Individual trade payouts credited directly to your registered bank account (100% of order totals).
              </p>
            </div>

            <div className="space-y-3">
              {receivedOrders.map(order => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-stone-600">#{order.id}</span>
                      <span className="font-black text-stone-900 text-sm">{order.crop_name}</span>
                      <span className="text-xs text-stone-500">({order.quantity_kg} Kg @ LKR {order.unit_price_lkr}/Kg)</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Buyer: {order.buyer_name} • Paid via: {order.payment_method} • {new Date(order.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-900">
                      +LKR {order.seller_payout_lkr.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">
                      100% Net Direct Farmer Payout (0% Commission)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- ADD NEW CROP MODAL (WITH PHOTO FILE UPLOAD & PRESETS) --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">{t('add_crop', lang)}</h3>
                <p className="text-xs text-stone-500">Attach photos, configure stock, and publish listing</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="space-y-4">
              
              {/* Multi-Photo Upload Section (Up to 5 Photos Simultaneously) */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black text-stone-800">
                      Crop Produce Photos (Up to 5 Photos) *
                    </span>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {formData.images.length} / 5 Slots
                  </span>
                </div>

                {/* Upload Action Row */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl bg-white cursor-pointer transition-colors text-xs font-bold text-stone-700 hover:text-emerald-800">
                    <Upload className="w-4 h-4 text-stone-400" />
                    <span>Upload up to 5 photos ({5 - formData.images.length} slots left)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={formData.images.length >= 5}
                      onChange={handleCropImagesUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-stone-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setUploadMode(uploadMode === 'presets' ? 'upload' : 'presets')}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                        uploadMode === 'presets' ? 'bg-emerald-800 text-white' : 'text-stone-600'
                      }`}
                    >
                      Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode(uploadMode === 'url' ? 'upload' : 'url')}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                        uploadMode === 'url' ? 'bg-emerald-800 text-white' : 'text-stone-600'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Preset Picker Drawer */}
                {uploadMode === 'presets' && (
                  <div className="pt-1 grid grid-cols-4 gap-1.5">
                    {PRESET_CROP_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={formData.images.length >= 5}
                        onClick={() => handleAddPresetCropImage(preset.url)}
                        className="p-1 rounded-lg border border-stone-200 hover:border-emerald-500 bg-white text-left transition-all cursor-pointer group"
                        title={`Add ${preset.name}`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-10 object-cover rounded-md group-hover:opacity-90"
                        />
                        <span className="text-[9px] font-bold text-stone-600 truncate block mt-0.5">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* URL input drawer */}
                {uploadMode === 'url' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            handleAddPresetCropImage(val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        if (input && input.value.trim()) {
                          handleAddPresetCropImage(input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Thumbnail Preview Grid showing all uploaded photos (up to 5 slots) with remove/replace */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Uploaded Crop Photos ({formData.images.length} / 5):
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-stone-300 aspect-square bg-stone-100 shadow-2xs">
                        <img
                          src={img}
                          alt={`Produce photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                          <label
                            className="p-1 rounded-full bg-white/90 text-stone-800 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
                            title="Replace this image"
                          >
                            <Upload className="w-3 h-3" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleReplaceCropImage(idx, e)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveCropImage(idx)}
                            className="p-1 rounded-full bg-white/90 text-stone-800 hover:bg-rose-600 hover:text-white cursor-pointer transition-colors"
                            title="Remove this image"
                          >
                            <X className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 right-1 bg-emerald-900/90 text-white text-[8px] font-black uppercase text-center py-0.2 rounded">
                            Cover
                          </span>
                        )}
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* Placeholder slots for remaining */}
                    {Array.from({ length: Math.max(0, 5 - formData.images.length) }).map((_, i) => (
                      <label
                        key={`empty-${i}`}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-emerald-400 rounded-xl bg-white hover:bg-emerald-50/30 cursor-pointer transition-colors aspect-square text-stone-300 hover:text-emerald-700"
                        title="Upload photo"
                      >
                        <Plus className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] font-bold">Slot {formData.images.length + i + 1}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleCropImagesUpload}
                          className="hidden"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('crop_name', lang)} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Potatoes, Carrots, Samba Paddy, Red Chillies..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('category', lang)}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CropCategory })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('price_per_kg', lang)} *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('quantity', lang)} *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('location', lang)} *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('description', lang)}</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Harvest date, grading, packing specifications..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Zero Sales Commission:</strong> Under your Kalam Annual Membership, 100% of all sales proceeds are deposited directly to you.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Crop Modal */}
      {editingCrop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Update Listing: {editingCrop.name}
                </h3>
                <p className="text-xs text-stone-500">FastAPI Crop Service (PUT /crops/{editingCrop.id})</p>
              </div>
              <button
                onClick={() => setEditingCrop(null)}
                className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Price per Kg (LKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Available Quantity in Stock (Kg) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Harvest & Quality Notes
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="e.g. Moisture level graded, sorted for immediate dispatch..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCrop(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FARM PROFILE & MULTI-PHOTO MANAGEMENT MODAL (UP TO 5 PHOTOS) --- */}
      {isProfilePhotosOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Farm & Field Photos Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload up to 5 verified photos of your land, produce, and certifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProfilePhotosOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">
                  Current Uploads: <strong className="text-emerald-900">{userPhotos.length} / 5 Photos</strong>
                </span>
                <span className="text-[10px] text-stone-500">
                  {5 - userPhotos.length} slots remaining
                </span>
              </div>

              {/* Upload button */}
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl bg-stone-50 hover:bg-emerald-50/40 cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-stone-400 group-hover:text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-stone-800 group-hover:text-emerald-900">
                  Choose photo from device
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5">
                  PNG, JPG, WEBP from your camera roll or files
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={userPhotos.length >= 5}
                  onChange={handleFarmerPhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Quick Preset Samples */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-600 mb-2 block">
                  Or select verified agri presets:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_CROP_IMAGES.slice(0, 4).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={userPhotos.length >= 5}
                      onClick={() => handleAddFarmerPresetPhoto(preset.url)}
                      className="p-1 rounded-xl border border-stone-200 hover:border-emerald-500 bg-white text-left transition-all cursor-pointer group"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-12 object-cover rounded-lg"
                      />
                      <span className="text-[9px] font-bold text-stone-600 truncate block mt-0.5">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Gallery Grid with Removal Buttons */}
              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-700 mb-2 block">
                  Your Farm Photo Gallery ({userPhotos.length})
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {userPhotos.map((photo, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-stone-300 aspect-square bg-stone-100 shadow-2xs">
                      <img
                        src={photo}
                        alt={`Farm Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFarmerPhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 right-1 bg-emerald-900/90 text-white text-[8px] font-black uppercase text-center py-0.2 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProfilePhotosOpen(false)}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
