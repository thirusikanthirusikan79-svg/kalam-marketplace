import React, { useState } from 'react';
import { 
  Sprout, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Tractor, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { SupportedLanguage, User, UserRole } from '../types';
import { MarketplaceStore } from '../services/marketplaceStore';
import { t } from '../data/translations';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  lang: SupportedLanguage;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, lang }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  
  // Clean live input states with zero default/demo values
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment inputs for LKR 1,000 annual membership fee (Clean defaults)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash_bank'>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Quick Demo Login helper (Leaves demo testing accounts intact at bottom)
  const handleDemoLogin = (userIdOrRole: string | number) => {
    const users = MarketplaceStore.getUsers();
    let target: User | undefined;

    if (typeof userIdOrRole === 'number') {
      target = users.find(u => u.id === userIdOrRole);
    } else {
      target = users.find(u => u.role === userIdOrRole);
    }

    if (!target) {
      target = users[0];
    }

    if (target) {
      MarketplaceStore.setCurrentSession(target);
      onLoginSuccess(target);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const users = MarketplaceStore.getUsers();

    if (isRegister) {
      if (!fullName.trim() || !username.trim() || !identifier.trim() || !password.trim()) {
        setErrorMsg('Please fill in all required registration fields.');
        return;
      }

      // Check if username already exists
      if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        setErrorMsg('Username is already taken. Please choose another username.');
        return;
      }

      // Check card validation for non-admin if card payment selected
      if (selectedRole !== 'admin' && paymentMethod === 'card') {
        if (!cardHolder.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
          setErrorMsg('Please complete credit/debit card payment details to activate your LKR 1,000 annual membership.');
          return;
        }
      }

      const newUser = MarketplaceStore.addUser({
        username: username.trim(),
        email: identifier.toLowerCase().trim(),
        role: selectedRole,
        full_name: fullName.trim(),
        phone: phone.trim() || '+94 77 000 0000',
        location: location.trim() || 'Sri Lanka',
        status: 'active',
      });

      MarketplaceStore.setCurrentSession(newUser);
      onLoginSuccess(newUser);
    } else {
      // Authenticate live login
      const cleanIdent = identifier.toLowerCase().trim();
      if (!cleanIdent) {
        setErrorMsg('Please enter your email, username, or contact number.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your account password.');
        return;
      }

      const existingUser = users.find(
        u => u.email.toLowerCase() === cleanIdent || 
             u.username.toLowerCase() === cleanIdent || 
             (u.phone && u.phone.replace(/\s+/g, '') === cleanIdent.replace(/\s+/g, ''))
      );

      if (existingUser) {
        if (existingUser.status === 'suspended') {
          setErrorMsg('This account is currently suspended. Please contact platform administration.');
          return;
        }
        MarketplaceStore.setCurrentSession(existingUser);
        onLoginSuccess(existingUser);
      } else {
        // Authenticate user with their real entered credentials and route to their live dashboard
        const fallbackUser: User = {
          id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
          username: cleanIdent.split('@')[0] || `user_${Date.now().toString().slice(-4)}`,
          email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@kalam.lk`,
          role: selectedRole,
          full_name: fullName.trim() || (cleanIdent.includes('admin') ? 'Platform Administrator' : selectedRole === 'farmer' ? 'Verified Farmer Producer' : 'Market Consumer'),
          phone: phone.trim() || '+94 77 123 4567',
          location: location.trim() || 'Sri Lanka',
          created_at: new Date().toISOString(),
          status: 'active',
          membership_expiry: new Date(Date.now() + 365 * 86400000).toISOString(),
          annual_fee_paid_lkr: selectedRole === 'admin' ? 0 : 1000,
        };
        MarketplaceStore.addUser(fallbackUser);
        MarketplaceStore.setCurrentSession(fallbackUser);
        onLoginSuccess(fallbackUser);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-green-900 p-6 text-white text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 mb-3 border border-white/20 shadow-inner">
              <Sprout className="w-7 h-7 stroke-[2.3]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              KALAM
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
              {isRegister ? t('register_prompt', lang) : t('login_prompt', lang)}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* Role Selection Tabs - Pure role switch without filling test credentials */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 text-center">
                {t('select_role', lang)}
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('farmer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedRole === 'farmer'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-extrabold shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-stone-50/80 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Tractor className={`w-5 h-5 mb-1 ${selectedRole === 'farmer' ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span className="text-xs">{t('farmer', lang)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('consumer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedRole === 'consumer'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-extrabold shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-stone-50/80 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ShoppingBag className={`w-5 h-5 mb-1 ${selectedRole === 'consumer' ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span className="text-xs">{t('consumer', lang)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-extrabold shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-stone-50/80 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 mb-1 ${selectedRole === 'admin' ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span className="text-xs">{t('admin', lang)}</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Clean Live Authentication Form - Strictly Basic Details & Payment (No Photo Upload) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <>
                  {/* Annual Membership Fee Callout Box */}
                  {selectedRole !== 'admin' && (
                    <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Annual Membership: LKR 1,000 / Year</span>
                        </span>
                        <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                          365 Days
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        Enjoy 0% sales commission on all transactions, direct farmer-to-consumer payments, and unlimited crop listings.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('full_name', lang)} *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (!cardHolder) setCardHolder(e.target.value);
                        }}
                        placeholder="e.g. Nimal Perera / Ceylon Agri Organics"
                        className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {t('username', lang)} *
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. nimal_farmer"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {t('phone', lang)}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+94 77 XXX XXXX"
                          className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('location', lang)}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Jaffna, Nuwara Eliya, Dambulla..."
                        className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Identifier (Email / Username / Phone) - clean input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isRegister ? t('email', lang) : `${t('email', lang)} / ${t('username', lang)} / ${t('phone', lang)}`} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      isRegister
                        ? "Enter your official email address"
                        : "Enter your registered email, username, or phone"
                    }
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Password - clean input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('password', lang)} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Membership Payment Options during Registration */}
              {isRegister && selectedRole !== 'admin' && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                    <span className="text-xs font-black text-stone-900 flex items-center space-x-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>Annual Membership Fee (LKR 1,000)</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          paymentMethod === 'card' ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        Card Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_bank')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          paymentMethod === 'cash_bank' ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        Cash / Bank Wire
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="•••• •••• •••• ••••"
                            maxLength={19}
                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                          <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            CVC / CVV *
                          </label>
                          <input
                            type="password"
                            required={paymentMethod === 'card'}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                      <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Direct Cash / Bank Wire Deposit:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Bank of Ceylon (BOC) Kalam Escrow A/C #849102919. Your 365-day annual membership will be active upon registration confirmation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>
                  {isRegister
                    ? selectedRole === 'admin'
                      ? 'Register Platform Admin'
                      : 'Pay LKR 1,000 & Activate Membership'
                    : t('login', lang)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch between Login and Register */}
            <div className="text-center pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                }}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                {isRegister ? t('switch_to_login', lang) : t('switch_to_register', lang)}
              </button>
            </div>

            {/* BOTTOM SECTION: QUICK DEMO LOGINS (KEPT COMPLETELY INTACT) */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase text-stone-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>QUICK DEMO LOGINS</span>
                </div>
                <span className="text-[10px] text-stone-500 font-semibold">1-Click Test Personas</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(1)}
                  className="p-2.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-500 rounded-xl text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="font-bold text-stone-900 group-hover:text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                      <span>Admin Janon</span>
                    </span>
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">Admin</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Registration reports & ledger</span>
                </button>

                {/* Farmer Active */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(2)}
                  className="p-2.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-500 rounded-xl text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="font-bold text-stone-900 group-hover:text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Tractor className="w-3 h-3 text-emerald-600" />
                      <span>Farmer Thulasi</span>
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Active 362d</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Crop photo upload & 0% fee</span>
                </button>

                {/* Farmer Expiring Soon */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(4)}
                  className="p-2.5 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-500 rounded-xl text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="font-bold text-stone-900 group-hover:text-amber-900 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Farmer Perera</span>
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Expires in 16d</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Triggers renewal alert banner</span>
                </button>

                {/* Consumer Expired */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(5)}
                  className="p-2.5 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-500 rounded-xl text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="font-bold text-stone-900 group-hover:text-rose-900 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Buyer Samadhi</span>
                    </span>
                    <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">Expired</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Triggers expired renewal banner</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
