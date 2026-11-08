import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AuthPage } from './components/AuthPage';
import { AdminAnalytics } from './components/AdminAnalytics';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerStore } from './components/ConsumerStore';
import { CropDetailModal } from './components/CropDetailModal';
import { Crop, SupportedLanguage, User } from './types';
import { MarketplaceStore } from './services/marketplaceStore';

export default function App() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(MarketplaceStore.getCurrentSession());

  // Role-specific active tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'ledger' | 'inventory' | 'users'>('ledger');
  const [activeFarmerTab, setActiveFarmerTab] = useState<'crops' | 'orders' | 'earnings'>('crops');
  const [activeConsumerTab, setActiveConsumerTab] = useState<'marketplace' | 'my_orders'>('marketplace');

  // Inspection modal
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  // Real-time session sync across windows, tabs, and components
  useEffect(() => {
    const syncSession = () => {
      const session = MarketplaceStore.getCurrentSession();
      setCurrentUser(session);
    };

    const unsubscribe = MarketplaceStore.subscribe(syncSession);
    window.addEventListener('storage', syncSession);
    window.addEventListener('kalam_marketplace_sync', syncSession);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('kalam_marketplace_sync', syncSession);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    MarketplaceStore.setCurrentSession(user);
    setCurrentUser(user);
    if (user.role === 'admin') setActiveAdminTab('ledger');
    else if (user.role === 'farmer') setActiveFarmerTab('crops');
    else setActiveConsumerTab('marketplace');
  };

  const handleLogout = () => {
    MarketplaceStore.setCurrentSession(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Clean 'KALAM' Branding Header (Available on every page with zero extra taglines or sub-text) */}
      <Navigation
        currentUser={currentUser}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
        activeFarmerTab={activeFarmerTab}
        setActiveFarmerTab={setActiveFarmerTab}
        activeConsumerTab={activeConsumerTab}
        setActiveConsumerTab={setActiveConsumerTab}
      />

      {/* Strict Access Control & Role-Based Routing */}
      <main className="flex-1">
        
        {/* 1. Unauthenticated: Root renders ONLY the Trilingual Login & Registration Page */}
        {!currentUser && (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            lang={lang}
          />
        )}

        {/* 2. Admin Role: Shows ONLY the Admin Dashboard (Hide all marketplace views completely) */}
        {currentUser && currentUser.role === 'admin' && (
          <AdminAnalytics
            lang={lang}
            activeTab={activeAdminTab}
            setActiveTab={setActiveAdminTab}
          />
        )}

        {/* 3. Farmer Role: Shows ONLY the Farmer Hub (Restricted from Admin panel) */}
        {currentUser && currentUser.role === 'farmer' && (
          <FarmerDashboard
            currentUser={currentUser}
            lang={lang}
            activeTab={activeFarmerTab}
            setActiveTab={setActiveFarmerTab}
            onViewCropDetails={(crop) => setSelectedCrop(crop)}
          />
        )}

        {/* 4. Consumer Role: Shows ONLY the Direct from Farm Marketplace (Restricted from Admin panel) */}
        {currentUser && currentUser.role === 'consumer' && (
          <ConsumerStore
            currentUser={currentUser}
            lang={lang}
            activeTab={activeConsumerTab}
            setActiveTab={setActiveConsumerTab}
            onViewCropDetails={(crop) => setSelectedCrop(crop)}
          />
        )}

      </main>

      {/* Crop Inspection Modal */}
      <CropDetailModal
        crop={selectedCrop}
        currentUser={currentUser}
        onClose={() => setSelectedCrop(null)}
        lang={lang}
      />

    </div>
  );
}
