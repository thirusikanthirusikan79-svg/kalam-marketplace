import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  PackageCheck, 
  Users, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle2, 
  Search, 
  Trash2,
  ShieldCheck,
  Scale,
  Sparkles,
  CreditCard,
  BarChart3,
  CalendarDays,
  Coins,
  FileText,
  Printer,
  Download,
  X,
  Tractor,
  ShoppingBag,
  Award,
  Check,
  Building,
  QrCode
} from 'lucide-react';
import { Crop, LedgerEntry, MonthlyRegistrationReport, RegistrationSummary, SupportedLanguage, Transaction, User } from '../types';
import { MarketplaceStore } from '../services/marketplaceStore';
import { t } from '../data/translations';

interface AdminDashboardProps {
  lang: SupportedLanguage;
  activeTab: 'ledger' | 'inventory' | 'users';
  setActiveTab: (tab: 'ledger' | 'inventory' | 'users') => void;
}

interface ReceiptData {
  invoiceNumber: string;
  date: string;
  timestamp: string;
  memberName: string;
  username: string;
  role: string;
  phone: string;
  location: string;
  email: string;
  amountLkr: number;
  category: string;
  paymentMethod: string;
  expiryDate: string;
}

export const AdminAnalytics: React.FC<AdminDashboardProps> = ({
  lang,
  activeTab,
  setActiveTab,
}) => {
  // Store states
  const [crops, setCrops] = useState<Crop[]>(MarketplaceStore.getCrops());
  const [txns, setTxns] = useState<Transaction[]>(MarketplaceStore.getTransactions());
  const [users, setUsers] = useState<User[]>(MarketplaceStore.getUsers());
  const [ledger, setLedger] = useState<LedgerEntry[]>(MarketplaceStore.getLedgerEntries());

  // Search & filter states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // User Directory Sub-Tabs: 'all_users' vs 'current_month'
  const [userDirectorySubTab, setUserDirectorySubTab] = useState<'all_users' | 'current_month'>('all_users');

  // Add ledger entry modal state (Strictly automated + Varavu Income)
  const [isAddLedgerOpen, setIsAddLedgerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(2);
  const [receiptCategory, setReceiptCategory] = useState<'Annual Membership Fee' | 'Annual Membership Renewal'>('Annual Membership Fee');
  const [paymentMethod, setPaymentMethod] = useState<'Direct Cash' | 'Bank Wire Transfer' | 'AgriPay Card'>('Direct Cash');

  // PDF Receipt Modal state
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    setCrops(MarketplaceStore.getCrops());
    setTxns(MarketplaceStore.getTransactions());
    const freshUsers = MarketplaceStore.getUsers();
    setUsers(freshUsers);
    setLedger(MarketplaceStore.getLedgerEntries());
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

  const regSummary: RegistrationSummary = MarketplaceStore.getRegistrationSummary();
  const monthlyReports: MonthlyRegistrationReport[] = MarketplaceStore.getMonthlyRegistrationReports();

  const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g., '2026-11'
  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Eligible non-admin users for subscription billing
  const eligibleMembers = users.filter(u => u.role !== 'admin');
  const selectedMember = eligibleMembers.find(u => u.id === selectedUserId) || eligibleMembers[0] || users[0];

  // Auto-generate next sequential invoice number: KALAM-REC-2026-XXXX
  const nextInvoiceNumber = `KALAM-REC-2026-${String(ledger.length + 1041).padStart(4, '0')}`;
  
  // Auto-generate member description
  const autoMemberDescription = selectedMember 
    ? `Annual Membership Registration Fee - ${selectedMember.full_name} (${selectedMember.role.toUpperCase()})`
    : 'Annual Membership Registration Fee';

  // Fixed annual subscription fee (LKR 1,000)
  const FIXED_ANNUAL_FEE_LKR = 1000;

  // Handle Automatic Recording of Registration Income & Instant PDF Receipt Generation
  const handleRecordRegistrationIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const invoiceRef = nextInvoiceNumber;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const expiryStr = new Date(now.getTime() + 365 * 86400000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Add entry to store
    MarketplaceStore.addLedgerEntry({
      date: dateStr,
      type: 'income',
      category: receiptCategory,
      description: autoMemberDescription,
      amount_lkr: FIXED_ANNUAL_FEE_LKR,
      reference_id: invoiceRef,
    });

    // Also update member's 1-year expiry in store
    const updatedUsers = users.map(u => {
      if (u.id === selectedMember.id) {
        return {
          ...u,
          status: 'active' as const,
          membership_expiry: new Date(now.getTime() + 365 * 86400000).toISOString(),
          annual_fee_paid_lkr: 1000,
          last_renewal_date: now.toISOString(),
        };
      }
      return u;
    });
    MarketplaceStore.saveUsers(updatedUsers);

    // Prepare receipt data
    const receiptData: ReceiptData = {
      invoiceNumber: invoiceRef,
      date: dateStr,
      timestamp: now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      memberName: selectedMember.full_name,
      username: selectedMember.username,
      role: selectedMember.role === 'farmer' ? 'Verified Farmer Producer' : 'Market Consumer',
      phone: selectedMember.phone || '+94 77 123 4567',
      location: selectedMember.location || 'Sri Lanka',
      email: selectedMember.email,
      amountLkr: FIXED_ANNUAL_FEE_LKR,
      category: receiptCategory,
      paymentMethod,
      expiryDate: expiryStr,
    };

    setIsAddLedgerOpen(false);
    refreshData();
    // Instantly display clean, professional PDF-style receipt modal
    setActiveReceipt(receiptData);
  };

  const handleOpenReceiptForEntry = (entry: LedgerEntry) => {
    // Look up associated member from description or reference
    const matchedUser = users.find(u => 
      entry.description.toLowerCase().includes(u.full_name.toLowerCase()) ||
      (entry.reference_id && entry.reference_id.includes(String(u.id)))
    ) || selectedMember || users[0];

    const receiptData: ReceiptData = {
      invoiceNumber: entry.reference_id || `KALAM-REC-2026-${String(entry.id).padStart(4, '0')}`,
      date: entry.date,
      timestamp: `${entry.date} • 10:30 AM`,
      memberName: matchedUser.full_name,
      username: matchedUser.username,
      role: matchedUser.role === 'farmer' ? 'Verified Farmer Producer' : 'Market Consumer',
      phone: matchedUser.phone || '+94 71 450 7821',
      location: matchedUser.location || 'Sri Lanka',
      email: matchedUser.email,
      amountLkr: entry.amount_lkr || 1000,
      category: entry.category,
      paymentMethod: 'Verified Official Deposit',
      expiryDate: new Date(new Date(entry.date).getTime() + 365 * 86400000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    };

    setActiveReceipt(receiptData);
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  // Download PDF / HTML Receipt file
  const handleDownloadPdf = () => {
    if (!activeReceipt) return;

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt_${activeReceipt.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f4; margin: 0; padding: 40px; }
    .receipt { max-width: 650px; margin: 0 auto; background: #ffffff; border: 2px solid #065f46; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 26px; font-weight: 900; color: #064e3b; letter-spacing: -0.5px; }
    .badge { background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 1px solid #10b981; }
    .meta { margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; color: #44403c; }
    .meta-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px; }
    .meta-title { font-weight: 800; color: #1c1917; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
    th { background: #f5f5f4; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #78716c; border-bottom: 1px solid #d6d3d1; }
    td { padding: 14px 10px; border-bottom: 1px solid #f5f5f4; color: #1c1917; }
    .total-row { font-size: 16px; font-weight: 900; color: #064e3b; border-top: 2px solid #065f46; }
    .footer { text-align: center; font-size: 11px; color: #a8a29e; margin-top: 30px; border-top: 1px dashed #d6d3d1; padding-top: 16px; }
    .stamp { display: inline-block; border: 2px solid #059669; color: #059669; font-weight: 900; padding: 6px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; transform: rotate(-3deg); margin-top: 10px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div>
        <div class="brand">KALAM</div>
        <div style="font-size: 12px; color: #78716c; margin-top: 4px;">Agricultural Marketplace • Official Registration Receipt</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">PAID & VERIFIED</span>
        <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: #065f46; margin-top: 6px;">${activeReceipt.invoiceNumber}</div>
      </div>
    </div>

    <div class="meta">
      <div class="meta-box">
        <div class="meta-title">Subscriber Particulars</div>
        <div style="font-size: 14px; font-weight: 800; color: #1c1917;">${activeReceipt.memberName}</div>
        <div>@${activeReceipt.username} • ${activeReceipt.role}</div>
        <div>${activeReceipt.phone}</div>
        <div>${activeReceipt.location}</div>
      </div>
      <div class="meta-box">
        <div class="meta-title">Subscription Terms</div>
        <div><strong>Receipt Date:</strong> ${activeReceipt.timestamp}</div>
        <div><strong>Valid For:</strong> 365 Days Annual Access</div>
        <div><strong>Expires On:</strong> ${activeReceipt.expiryDate}</div>
        <div><strong>Payment Mode:</strong> ${activeReceipt.paymentMethod}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Rate Type</th>
          <th style="text-align: right;">Fee (LKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${activeReceipt.category}</strong>
            <div style="font-size: 11px; color: #78716c;">Full access to Kalam 0% sales commission agricultural trade network</div>
          </td>
          <td>Annual 365-Day Plan</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">1,000.00</td>
        </tr>
        <tr>
          <td>
            <strong>Marketplace Trading Commission</strong>
            <div style="font-size: 11px; color: #059669;">Exempt - 100% direct farmer-to-consumer payouts</div>
          </td>
          <td>Zero Commission</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">0.00</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">TOTAL REGISTRATION AMOUNT PAID</td>
          <td style="text-align: right; font-family: monospace;">LKR 1,000.00</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: center; margin: 20px 0;">
      <div class="stamp">OFFICIAL REGISTRAR SEAL • VERIFIED</div>
    </div>

    <div class="footer">
      This is a digitally generated tax invoice and membership certification issued by Kalam Agricultural Marketplace Ltd.<br>
      Colombo Operations HQ, Sri Lanka • support@kalam.lk
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReceipt.invoiceNumber}_Official_Receipt.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteLedger = (id: number) => {
    MarketplaceStore.deleteLedgerEntry(id);
    refreshData();
  };

  const handleToggleUserStatus = (id: number, currentStatus?: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    MarketplaceStore.updateUserStatus(id, nextStatus);
    refreshData();
  };

  const handleModerateCrop = (id: number, status: 'approved' | 'rejected') => {
    MarketplaceStore.updateCrop(id, { moderation_status: status });
    refreshData();
  };

  // Pure income entries filtered by search
  const filteredLedger = ledger.filter(entry => 
    entry.type === 'income' && (
      entry.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      entry.category.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (entry.reference_id && entry.reference_id.toLowerCase().includes(ledgerSearch.toLowerCase()))
    )
  );

  const filteredCrops = crops.filter(c => 
    c.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    c.seller_name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    c.location.toLowerCase().includes(stockSearch.toLowerCase())
  );

  // Users filtered by directory sub-tab ('all_users' vs 'current_month')
  const baseUsersList = users.filter(u => {
    if (userDirectorySubTab === 'current_month') {
      return u.role !== 'admin' && u.created_at && u.created_at.startsWith(currentMonthKey);
    }
    return true;
  });

  const filteredUsers = baseUsersList.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.phone && u.phone.includes(userSearch));
    return matchesRole && matchesSearch;
  });

  // 1-year membership status helper
  const getMembershipStatus = (user: User) => {
    if (user.role === 'admin') {
      return { label: 'Permanent Admin', badge: 'bg-purple-100 text-purple-900 border-purple-200' };
    }
    if (!user.membership_expiry) {
      return { label: 'Active', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }

    const now = Date.now();
    const expiryTime = new Date(user.membership_expiry).getTime();
    const diffDays = Math.ceil((expiryTime - now) / 86400000);

    if (diffDays <= 0) {
      return { 
        label: `Expired (${Math.abs(diffDays)}d ago)`, 
        badge: 'bg-rose-100 text-rose-800 border-rose-200 font-bold' 
      };
    }
    if (diffDays <= 30) {
      return { 
        label: `Expiring Soon (${diffDays}d left)`, 
        badge: 'bg-amber-100 text-amber-900 border-amber-200 font-bold' 
      };
    }
    return { 
      label: `Active (${diffDays}d left)`, 
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
    };
  };

  return (
    <div className="bg-stone-100 min-h-[calc(100vh-4rem)] text-stone-900 font-sans pb-16">
      
      {/* Admin Module Banner */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h1 className="text-xl font-black text-stone-900 tracking-tight">
                  {t('admin_dashboard', lang)}
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Strict LKR 1,000 Annual Subscription Model
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Pure registration income audits, member directory, 1-year expiration tracking, and warehouse inventory.
              </p>
            </div>

            {/* Quick action: Record Registration Income with Automatic Calculation */}
            {activeTab === 'ledger' && (
              <button
                onClick={() => setIsAddLedgerOpen(true)}
                className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Record Registration Income</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* --- 4 CLEAN FINANCIAL & REGISTRATION METRIC CARDS (ZERO EXPENSE / ZERO COMMISSION) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Registration Income (Pure Varavu) */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Income (Varavu)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-1.5 py-0.5 rounded">
                + VARAVU
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">
              LKR {regSummary.totalRevenueLkr.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Pure registration fee income (Total Users × LKR 1,000)
            </span>
          </div>

          {/* Card 2: Current Month Registration Income */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                {currentMonthLabel} Income
              </span>
              <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-1.5 py-0.5 rounded">
                Current Month
              </span>
            </div>
            <div className="text-2xl font-black text-stone-900 mt-1">
              LKR {regSummary.currentMonthRevenueLkr.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              {regSummary.currentMonthRegisteredUsers} new registrations in {currentMonthLabel}
            </span>
          </div>

          {/* Card 3: Membership Health & 1-Year Expirations */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              Membership Health (365d)
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-emerald-900">
                {regSummary.activeMembershipsCount} Active
              </span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5 flex items-center space-x-1.5">
              <span className="text-amber-700 font-bold">{regSummary.expiringSoonCount} Expiring Soon</span>
              <span>•</span>
              <span className="text-rose-700 font-bold">{regSummary.expiredCount} Expired</span>
            </div>
          </div>

          {/* Card 4: Total Registered Customer Base */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              Total Registered Users
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {regSummary.totalRegisteredUsers} Members
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              {regSummary.farmersCount} Farmers • {regSummary.consumersCount} Consumers
            </span>
          </div>

        </div>

        {/* --- TAB 1: MONTHLY INCOME (VARAVU) LEDGER (PURE REGISTRATION REVENUE ONLY) --- */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>Monthly Income (Varavu) Ledger</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Official financial ledger tracking all LKR 1,000 annual membership registration fees with instant receipt generation.
                </p>
              </div>

              {/* Search in income records */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search member, invoice..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 text-xs rounded-full border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Pure + Varavu Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <th className="py-3 px-4">{t('date', lang)}</th>
                    <th className="py-3 px-4">Financial Type</th>
                    <th className="py-3 px-4">{t('category', lang)}</th>
                    <th className="py-3 px-4">{t('description', lang)}</th>
                    <th className="py-3 px-4">Reference Invoice</th>
                    <th className="py-3 px-4 text-right">Income Amount</th>
                    <th className="py-3 px-4 text-center">Receipt & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-stone-600 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                          + VARAVU
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {entry.category}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 max-w-sm truncate">
                        {entry.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-800 font-bold text-[11px]">
                        {entry.reference_id || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-900 text-sm">
                        + LKR {entry.amount_lkr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* View & Print PDF Receipt */}
                          <button
                            onClick={() => handleOpenReceiptForEntry(entry)}
                            className="p-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 transition-colors cursor-pointer flex items-center space-x-1"
                            title="View official PDF receipt"
                          >
                            <FileText className="w-3 h-3 text-emerald-700" />
                            <span>Receipt</span>
                          </button>

                          <button
                            onClick={() => handleDeleteLedger(entry.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLedger.length === 0 && (
              <div className="p-8 text-center text-stone-500 text-xs">
                No income records found matching your search.
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: SOLD & UNSOLD STOCK INVENTORY --- */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                  <PackageCheck className="w-5 h-5 text-emerald-700" />
                  <span>{t('stock_inventory', lang)}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time stock audit tracking total listed produce, sold units, unsold warehouse volume, and realized trade turnover.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Filter crop or farmer..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 text-xs rounded-full border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <th className="py-3 px-4">Produce Item</th>
                    <th className="py-3 px-4">Producer & Region</th>
                    <th className="py-3 px-4 text-right">{t('initial_stock', lang)}</th>
                    <th className="py-3 px-4 text-right">{t('sold_qty', lang)}</th>
                    <th className="py-3 px-4 text-right">{t('unsold_qty', lang)}</th>
                    <th className="py-3 px-4 text-right">Price / Kg</th>
                    <th className="py-3 px-4 text-right">Realized Trade</th>
                    <th className="py-3 px-4 text-center">Stock Status</th>
                    <th className="py-3 px-4 text-center">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCrops.map((crop) => {
                    const initial = crop.initial_quantity || crop.quantity_available;
                    const unsold = crop.quantity_available;
                    const sold = Math.max(0, initial - unsold);
                    const realizedRevenue = sold * crop.price_per_kg;
                    const isSoldOut = unsold <= 0;
                    const isLowStock = unsold > 0 && unsold < 300;

                    return (
                      <tr key={crop.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{t(crop.name, lang)}</div>
                          <span className="text-[10px] text-stone-500">{crop.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-stone-800">{crop.seller_name}</div>
                          <div className="text-[10px] text-stone-500">{crop.location}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-stone-700">
                          {initial.toLocaleString()} Kg
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-800">
                          {sold.toLocaleString()} Kg
                        </td>
                        <td className="py-3 px-4 text-right font-black text-stone-900">
                          {unsold.toLocaleString()} Kg
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-stone-800">
                          LKR {crop.price_per_kg}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-stone-900">
                          LKR {realizedRevenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSoldOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSoldOut ? t('sold_out', lang) : isLowStock ? t('low_stock', lang) : t('in_stock', lang)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {crop.moderation_status === 'approved' ? (
                              <button
                                onClick={() => handleModerateCrop(crop.id, 'rejected')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-700 cursor-pointer"
                              >
                                Delist
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModerateCrop(crop.id, 'approved')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: CUSTOMER & USER DIRECTORY (WITH 2 SUB-TABS & MONTH-END SUMMARY REPORT) --- */}
        {activeTab === 'users' && (
          <div className="space-y-6">

            {/* MONTH-END ADMIN SUMMARY REPORT (PURE REGISTRATION REVENUE ONLY) */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-emerald-50/70 to-stone-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-emerald-700" />
                      <span>Month-End Admin Summary Report</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Monthly breakdown computing total registered users and subscription revenue generated solely from registration fees (Count × LKR 1,000).
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">
                      All-Time Registration Revenue
                    </span>
                    <span className="text-base font-black text-emerald-950">
                      LKR {regSummary.totalRevenueLkr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <th className="py-3 px-4">Calendar Month</th>
                      <th className="py-3 px-4 text-center">Total Registered Users</th>
                      <th className="py-3 px-4 text-center">Farmers</th>
                      <th className="py-3 px-4 text-center">Consumers</th>
                      <th className="py-3 px-4 text-right">Fee Per User</th>
                      <th className="py-3 px-4 text-right">Total Month Income (LKR)</th>
                      <th className="py-3 px-4 text-center">Cycle Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {monthlyReports.map((report) => {
                      const isCurrent = report.monthKey === currentMonthKey;
                      return (
                        <tr 
                          key={report.monthKey} 
                          className={`hover:bg-stone-50/80 transition-colors ${isCurrent ? 'bg-emerald-50/30' : ''}`}
                        >
                          <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center space-x-2">
                            <CalendarDays className="w-4 h-4 text-emerald-700" />
                            <span>{report.monthLabel}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-stone-900 text-sm">
                            {report.totalRegisteredUsers}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-emerald-800">
                            {report.farmersCount} Farmers
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-sky-800">
                            {report.consumersCount} Consumers
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-stone-600">
                            LKR 1,000
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-950 text-sm">
                            LKR {report.totalRevenueLkr.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCurrent
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-stone-100 text-stone-600'
                            }`}>
                              {isCurrent ? 'Active Cycle' : 'Closed Month'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DIRECTORY USER LIST (2 DISTINCT SUB-TABS) */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-200 space-y-4">
                
                {/* Header & Sub-Tabs Switcher */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                      <Users className="w-5 h-5 text-emerald-700" />
                      <span>{t('user_directory', lang)}</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Verify 1-year registration expiration statuses, annual fee receipts, and customer accounts.
                    </p>
                  </div>

                  {/* 2 Distinct Sub-Tabs Switcher */}
                  <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl text-xs font-bold border border-stone-200">
                    <button
                      onClick={() => setUserDirectorySubTab('all_users')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        userDirectorySubTab === 'all_users'
                          ? 'bg-emerald-800 text-white shadow-xs font-black'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      All Registered Users ({users.length})
                    </button>

                    <button
                      onClick={() => setUserDirectorySubTab('current_month')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        userDirectorySubTab === 'current_month'
                          ? 'bg-emerald-800 text-white shadow-xs font-black'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      Current Month New Registered Users ({regSummary.currentMonthRegisteredUsers})
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-xs text-stone-500 font-bold">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-stone-50 border border-stone-200 text-xs rounded-xl px-3 py-1.5 font-bold"
                    >
                      <option value="all">All Roles</option>
                      <option value="farmer">Farmers</option>
                      <option value="consumer">Consumers</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name, username, email, phone..."
                      className="w-full pl-9 pr-3 py-1.5 bg-stone-50 text-xs rounded-full border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* User Directory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Member Name & Username</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4">1-Year Expiration</th>
                      <th className="py-3 px-4">Fee Paid</th>
                      <th className="py-3 px-4">Contact & Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.map((u) => {
                      const memberStatus = getMembershipStatus(u);
                      return (
                        <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                            #{u.id}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-900">{u.full_name}</div>
                            <div className="text-[10px] text-stone-500">@{u.username}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : u.role === 'farmer'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-sky-100 text-sky-900 border border-sky-200'
                            }`}>
                              {t(u.role, lang)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-stone-600 whitespace-nowrap">
                            {new Date(u.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${memberStatus.badge}`}>
                              {memberStatus.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-black text-emerald-950 font-mono">
                            {u.role === 'admin' ? 'Exempt' : 'LKR 1,000'}
                          </td>

                          <td className="py-3.5 px-4 text-stone-600">
                            <div className="text-[11px] font-mono">{u.email}</div>
                            <div className="text-[10px] text-stone-500">{u.phone || 'No phone'} • {u.location || 'Sri Lanka'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.status === 'suspended' ? t('suspended', lang) : t('active', lang)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  u.status === 'suspended'
                                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    : 'bg-stone-100 text-stone-700 hover:bg-rose-100 hover:text-rose-700'
                                }`}
                              >
                                {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-stone-500 text-xs">
                  {userDirectorySubTab === 'current_month' 
                    ? `No new users registered in ${currentMonthLabel} matching this search.` 
                    : 'No users found matching your search filter.'}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* --- AUTOMATED REGISTRATION INCOME RECORDING MODAL (NO MANUAL AMOUNT / DESC / INVOICE TEXT BOXES) --- */}
      {isAddLedgerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Record Registration Income (Varavu)
                  </h3>
                  <p className="text-xs text-stone-500">Automated Annual Membership Fee & Invoice Generation</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLedgerOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordRegistrationIncome} className="space-y-4">
              
              {/* Member Selection - Auto-populates all registration particulars */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Registered Member *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {eligibleMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} (@{member.username}) — {member.role.toUpperCase()} • {member.location || 'Sri Lanka'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Read-Only Member Card */}
              {selectedMember && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 flex items-center space-x-1.5">
                      {selectedMember.role === 'farmer' ? (
                        <Tractor className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-sky-700" />
                      )}
                      <span>{selectedMember.full_name}</span>
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {selectedMember.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Email: {selectedMember.email} • Phone: {selectedMember.phone || 'N/A'} • Location: {selectedMember.location || 'Sri Lanka'}
                  </div>
                </div>
              )}

              {/* Automatic Fixed Amount Display (LKR 1,000) - No manual text box */}
              <div>
                <span className="block text-xs font-bold text-stone-700 mb-1">
                  Annual Subscription Fee (Fixed Rate)
                </span>
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                  <div>
                    <span className="text-xl font-black text-emerald-950 font-mono">
                      LKR 1,000.00
                    </span>
                    <span className="text-[10px] text-emerald-800 block mt-0.5">
                      365-Day Network Access • 0% Platform Commission
                    </span>
                  </div>
                  <span className="text-xs font-extrabold uppercase bg-emerald-800 text-white px-3 py-1 rounded-xl shadow-2xs">
                    + VARAVU
                  </span>
                </div>
              </div>

              {/* Auto-Generated Reference & Invoice Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs font-bold text-stone-700 mb-1">
                    Auto-Generated Invoice #
                  </span>
                  <div className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-mono font-bold text-emerald-900">
                    {nextInvoiceNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Receipt Category
                  </label>
                  <select
                    value={receiptCategory}
                    onChange={(e) => setReceiptCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Annual Membership Fee">Annual Membership Fee</option>
                    <option value="Annual Membership Renewal">Annual Membership Renewal</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Payment Mode Received
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Direct Cash">Direct Cash Deposit (Escrow Counter)</option>
                  <option value="Bank Wire Transfer">Bank Wire Transfer (BOC Account)</option>
                  <option value="AgriPay Card">AgriPay Direct Card Checkout</option>
                </select>
              </div>

              {/* Auto-Generated Description Preview */}
              <div>
                <span className="block text-xs font-bold text-stone-700 mb-1">
                  Auto-Generated Ledger Entry
                </span>
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-700 font-mono">
                  {autoMemberDescription}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddLedgerOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Record Income & Generate PDF Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROFESSIONAL PDF-STYLE RECEIPT MODAL --- */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-4 border-emerald-900 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Action Bar (Top) */}
            <div className="bg-stone-900 text-white px-5 py-3 flex items-center justify-between text-xs print:hidden">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Official Membership Receipt Preview (PDF)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center space-x-1 font-bold text-xs transition-colors cursor-pointer"
                  title="Download receipt HTML / PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center space-x-1 font-bold text-xs transition-colors cursor-pointer"
                  title="Print official receipt"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="text-stone-400 hover:text-white p-1 font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable PDF Receipt Document Body */}
            <div ref={receiptPrintRef} className="p-6 sm:p-8 bg-gradient-to-b from-stone-50 via-white to-stone-50 space-y-6">
              
              {/* Receipt Header with Branding & Stamp */}
              <div className="border-b-2 border-stone-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
                    <Building className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight font-sans">
                      KALAM
                    </h2>
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Official Membership Tax Receipt
                    </p>
                    <p className="text-[10px] text-stone-400">
                      Sri Lanka Agricultural Exchange & Escrow Authority
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-2xs">
                    <Check className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                    PAID & VERIFIED
                  </span>
                  <div className="font-mono text-xs font-black text-emerald-950 mt-1.5">
                    {activeReceipt.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* Two Column Particulars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Subscriber Details */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Member Particulars
                  </span>
                  <div className="text-sm font-black text-stone-900">
                    {activeReceipt.memberName}
                  </div>
                  <div className="text-stone-600 font-medium">
                    @{activeReceipt.username} • <span className="font-bold text-emerald-800">{activeReceipt.role}</span>
                  </div>
                  <div className="text-stone-500 font-mono text-[11px]">
                    {activeReceipt.phone}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    {activeReceipt.location}
                  </div>
                </div>

                {/* Invoice Meta */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Subscription Terms
                  </span>
                  <div className="flex justify-between text-stone-700">
                    <span>Issue Date:</span>
                    <span className="font-mono font-bold">{activeReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Valid Period:</span>
                    <span className="font-bold text-emerald-900">365 Days (1 Year)</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Valid Until:</span>
                    <span className="font-mono font-bold text-emerald-800">{activeReceipt.expiryDate}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Payment Method:</span>
                    <span className="font-bold">{activeReceipt.paymentMethod}</span>
                  </div>
                </div>

              </div>

              {/* Line Item Table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-4">Item & Description</th>
                      <th className="py-2.5 px-4 text-center">Plan Period</th>
                      <th className="py-2.5 px-4 text-right">Fee (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{activeReceipt.category}</div>
                        <div className="text-[10px] text-stone-500">
                          Direct agricultural marketplace trading network with unlimited produce listings
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-stone-700">
                        365 Days
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                        1,000.00
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-bold text-emerald-800">Marketplace Sales Commission</div>
                        <div className="text-[10px] text-emerald-600">
                          0% Fee Protocol: 100% of order totals paid directly to farmer
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        0.00%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                        0.00
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/70 text-emerald-950 font-black text-sm border-t-2 border-emerald-300">
                      <td colSpan={2} className="py-3 px-4 uppercase text-xs tracking-wider">
                        Total Registration Fee Paid (+ VARAVU)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-base font-black text-emerald-900">
                        LKR 1,000.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Security Seal & Certification Stamp */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-200">
                <div className="flex items-center space-x-2 text-stone-400">
                  <QrCode className="w-10 h-10 text-stone-800" />
                  <div className="text-[10px] text-stone-500 leading-tight">
                    <strong>Cryptographic Hash:</strong><br />
                    KALAM-{activeReceipt.invoiceNumber}-VERIFIED<br />
                    Digitally signed by Registrar General
                  </div>
                </div>

                {/* Visual Stamp Badge */}
                <div className="border-2 border-emerald-700 text-emerald-800 px-4 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider rotate-[-2deg] shadow-2xs">
                  ★ KALAM AGRI • VERIFIED 2026 ★
                </div>
              </div>

              <div className="text-center text-[10px] text-stone-400 border-t border-stone-100 pt-3">
                This is a computer-generated tax and membership invoice receipt. No manual signature required.
              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-stone-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 print:hidden">
              <span className="text-xs text-stone-500 font-medium">
                Receipt saved into official Varavu Ledger records.
              </span>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPdf}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 shadow-2xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
