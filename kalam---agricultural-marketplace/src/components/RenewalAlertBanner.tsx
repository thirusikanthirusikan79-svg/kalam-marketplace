import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  X, 
  ArrowRight,
  Lock
} from 'lucide-react';
import { SupportedLanguage, User } from '../types';
import { MarketplaceStore } from '../services/marketplaceStore';
import { t } from '../data/translations';

interface RenewalAlertBannerProps {
  currentUser: User;
  lang: SupportedLanguage;
  onRenewed?: () => void;
}

export const RenewalAlertBanner: React.FC<RenewalAlertBannerProps> = ({
  currentUser,
  lang,
  onRenewed,
}) => {
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('742');
  const [cardHolder, setCardHolder] = useState(currentUser.full_name || 'Cardholder');
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Admins do not require annual membership renewal
  if (currentUser.role === 'admin') return null;

  const expiryDateStr = currentUser.membership_expiry;
  if (!expiryDateStr) return null;

  const now = Date.now();
  const expiryTime = new Date(expiryDateStr).getTime();
  const daysRemaining = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));

  // Only display if expiring within 30 days or already expired
  if (daysRemaining > 30) return null;

  const isExpired = daysRemaining <= 0;
  const formattedExpiryDate = new Date(expiryDateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      MarketplaceStore.renewMembership(currentUser.id, 'AgriPay Visa/Mastercard');
      setIsProcessing(false);
      setRenewSuccess(true);
      setTimeout(() => {
        setRenewSuccess(false);
        setIsRenewModalOpen(false);
        if (onRenewed) onRenewed();
      }, 1400);
    }, 600);
  };

  return (
    <>
      {/* Alert Banner at Top of Screen */}
      <div className={`border-b px-4 py-3 sm:px-6 transition-all ${
        isExpired 
          ? 'bg-rose-50 border-rose-200 text-rose-950' 
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
            }`}>
              {isExpired ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Clock className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs sm:text-sm">
                  {isExpired 
                    ? 'Annual Membership Expired' 
                    : `Annual Membership Expiring Soon (${daysRemaining} Days Left)`}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isExpired ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isExpired ? 'Action Required' : 'Renewal Due'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {isExpired ? (
                  <>Your Kalam membership expired on <strong>{formattedExpiryDate}</strong>. Renew your annual membership for <strong>LKR 1,000</strong> to continue direct 0% commission operations.</>
                ) : (
                  <>Valid until <strong>{formattedExpiryDate}</strong>. Renew your annual registration fee for <strong>LKR 1,000</strong> to extend your membership for 365 days.</>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer ${
                isExpired
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'bg-amber-800 hover:bg-amber-900 text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Renew Membership (LKR 1,000)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Renewal Card Payment Modal */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Annual Membership Renewal
                  </h3>
                  <p className="text-xs text-stone-500">
                    Extend validity by 365 Days • 0% Sales Commission
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renewSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-stone-900">
                  Membership Successfully Renewed!
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  LKR 1,000 received. Your account has been credited with an additional 365 days of active membership.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRenewSubmit} className="space-y-4">
                {/* Membership Pricing Box */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      Annual Renewal Fee
                    </span>
                    <span className="text-base font-black text-emerald-950">
                      LKR 1,000 <span className="text-xs font-semibold text-stone-600">/ Year</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-white text-emerald-800 px-2 py-1 rounded-lg border border-emerald-300">
                    +365 Days Validity
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Full name as printed on card"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      CVC / CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>256-bit encrypted secure bank transmission</span>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsRenewModalOpen(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>{isProcessing ? 'Processing Payment...' : 'Pay LKR 1,000 & Renew'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
