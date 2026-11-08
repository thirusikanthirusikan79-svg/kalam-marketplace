import React from 'react';
import { 
  Sprout, 
  Languages, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  Tractor, 
  ShoppingBag,
  FileSpreadsheet, 
  PackageCheck, 
  Users
} from 'lucide-react';
import { SupportedLanguage, User, UserRole } from '../types';
import { t } from '../data/translations';

interface NavigationProps {
  currentUser: User | null;
  onLogout: () => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  activeAdminTab?: 'ledger' | 'inventory' | 'users';
  setActiveAdminTab?: (tab: 'ledger' | 'inventory' | 'users') => void;
  activeFarmerTab?: 'crops' | 'orders' | 'earnings';
  setActiveFarmerTab?: (tab: 'crops' | 'orders' | 'earnings') => void;
  activeConsumerTab?: 'marketplace' | 'my_orders';
  setActiveConsumerTab?: (tab: 'marketplace' | 'my_orders') => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  onLogout,
  lang,
  setLang,
  activeAdminTab = 'ledger',
  setActiveAdminTab,
  activeFarmerTab = 'crops',
  setActiveFarmerTab,
  activeConsumerTab = 'marketplace',
  setActiveConsumerTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Clean 'KALAM' Branding (Zero extra taglines or sub-text as requested) */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-6 h-6 text-amber-300 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-emerald-950 font-sans">
              KALAM
            </span>
          </div>

          {/* Dynamic Role-Based Nav Links for Authenticated Users */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
              {currentUser.role === 'admin' && setActiveAdminTab && (
                <>
                  <button
                    onClick={() => setActiveAdminTab('ledger')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'ledger'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{t('monthly_income', lang)}</span>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('inventory')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'inventory'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('stock_inventory', lang)}</span>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('users')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'users'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{t('user_directory', lang)}</span>
                  </button>
                </>
              )}

              {currentUser.role === 'farmer' && setActiveFarmerTab && (
                <>
                  <button
                    onClick={() => setActiveFarmerTab('crops')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeFarmerTab === 'crops'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Tractor className="w-4 h-4 text-emerald-600" />
                    <span>{t('my_crops', lang)}</span>
                  </button>

                  <button
                    onClick={() => setActiveFarmerTab('orders')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeFarmerTab === 'orders'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('orders_received', lang)}</span>
                  </button>

                  <button
                    onClick={() => setActiveFarmerTab('earnings')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeFarmerTab === 'earnings'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{t('earnings_ledger', lang)}</span>
                  </button>
                </>
              )}

              {currentUser.role === 'consumer' && setActiveConsumerTab && (
                <>
                  <button
                    onClick={() => setActiveConsumerTab('marketplace')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeConsumerTab === 'marketplace'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>{t('direct_from_farm', lang)}</span>
                  </button>

                  <button
                    onClick={() => setActiveConsumerTab('my_orders')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeConsumerTab === 'my_orders'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('my_orders', lang)}</span>
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Controls: Global Language Switcher + User Status / Logout */}
          <div className="flex items-center space-x-3">
            
            {/* Global Language Switcher (Available on all screens) */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
              <span className="px-1.5 text-stone-400">
                <Languages className="w-3.5 h-3.5" />
              </span>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'en' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'ta' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="தமிழ் (Tamil)"
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'si' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="සිංහල (Sinhala)"
              >
                සිංහල
              </button>
            </div>

            {/* Authenticated User Pill & Universal Logout Button (Visible across all views) */}
            {currentUser && (
              <div className="flex items-center space-x-2">
                {/* User & Role Badge */}
                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-950 border border-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : currentUser.role === 'farmer' ? (
                    <Tractor className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  )}
                  <span className="truncate max-w-[85px] sm:max-w-[140px] font-extrabold">{currentUser.full_name}</span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-emerald-200 text-emerald-950 rounded-md">
                    {t(currentUser.role, lang)}
                  </span>
                </div>

                {/* Visible Logout Button immediately next to User Badge */}
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
                  title="Logout / Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                  <span>{t('logout', lang)}</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
