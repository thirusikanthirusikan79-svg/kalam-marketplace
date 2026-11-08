import { AnalyticsSummary, Crop, LedgerEntry, MonthlyRegistrationReport, RegistrationSummary, Transaction, User } from '../types';

const INITIAL_CROPS: Crop[] = [
  {
    id: 1,
    name: 'Potatoes',
    category: 'Vegetables',
    price_per_kg: 200,
    quantity_available: 1250,
    initial_quantity: 2000,
    seller_id: 2,
    seller_name: "Thulasi's Farm",
    location: 'Jaffna Northern District',
    description: 'Directly harvested highland potatoes with optimal starch content.',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500&auto=format&fit=crop',
    ],
    rating: 4.8,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    moderation_status: 'approved',
  },
  {
    id: 2,
    name: 'Carrots',
    category: 'Vegetables',
    price_per_kg: 260,
    quantity_available: 850,
    initial_quantity: 1200,
    seller_id: 2,
    seller_name: "Thulasi's Farm",
    location: 'Nuwara Eliya High Plains',
    description: 'Crisp mountain carrots washed and packed fresh from the soil.',
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500&auto=format&fit=crop',
    ],
    rating: 4.9,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    moderation_status: 'approved',
  },
  {
    id: 3,
    name: 'Bulk Grains (Paddy)',
    category: 'Grains',
    price_per_kg: 150,
    quantity_available: 5000,
    initial_quantity: 6500,
    seller_id: 2,
    seller_name: 'Polonnaruwa Harvest Guild',
    location: 'Polonnaruwa Ancient Fields',
    description: 'Moisture-tested bulk Samba paddy bags ready for milling.',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&auto=format&fit=crop',
    ],
    rating: 4.7,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    moderation_status: 'approved',
  },
  {
    id: 4,
    name: 'Red Chillies',
    category: 'Spices',
    price_per_kg: 250,
    quantity_available: 420,
    initial_quantity: 600,
    seller_id: 2,
    seller_name: 'Dry Zone Agri Cooperative',
    location: 'Anuradhapura Agricultural Zone',
    description: 'Aromatic, sun-cured dry chillies with vibrant natural red heat.',
    image_url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=500&auto=format&fit=crop',
    ],
    rating: 4.9,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    moderation_status: 'approved',
  },
  {
    id: 5,
    name: 'Papayas',
    category: 'Fruits',
    price_per_kg: 120,
    quantity_available: 600,
    initial_quantity: 800,
    seller_id: 2,
    seller_name: 'Rajarata Fruits Group',
    location: 'Dambulla Economic Center',
    description: 'Naturally ripened Red Lady papayas rich in natural sugars.',
    image_url: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=500&auto=format&fit=crop',
    ],
    rating: 4.6,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    moderation_status: 'approved',
  },
  {
    id: 6,
    name: 'Yellow Bananas (Ambul)',
    category: 'Fruits',
    price_per_kg: 180,
    quantity_available: 900,
    initial_quantity: 1000,
    seller_id: 2,
    seller_name: 'Embilipitiya Orchards',
    location: 'Ratnapura Foothills',
    description: 'Traditional sweet-sour Ambul banana combs picked at peak ripeness.',
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop',
    ],
    rating: 5.0,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    moderation_status: 'approved',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 101,
    crop_id: 1,
    crop_name: 'Potatoes',
    buyer_id: 3,
    buyer_name: 'Dulan Wijesinghe',
    seller_id: 2,
    seller_name: "Thulasi's Organic Farm",
    quantity_kg: 250,
    unit_price_lkr: 200,
    subtotal_lkr: 50000,
    commission_rate: 0,
    commission_amount_lkr: 0,
    seller_payout_lkr: 50000,
    total_amount_lkr: 50000,
    payment_method: 'AgriPay Direct Card',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 102,
    crop_id: 2,
    crop_name: 'Carrots',
    buyer_id: 3,
    buyer_name: 'Dulan Wijesinghe',
    seller_id: 2,
    seller_name: "Thulasi's Organic Farm",
    quantity_kg: 60,
    unit_price_lkr: 260,
    subtotal_lkr: 15600,
    commission_rate: 0,
    commission_amount_lkr: 0,
    seller_payout_lkr: 15600,
    total_amount_lkr: 15600,
    payment_method: 'Direct Bank Wire',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 103,
    crop_id: 3,
    crop_name: 'Bulk Grains (Paddy)',
    buyer_id: 3,
    buyer_name: 'Central Millers Ltd',
    seller_id: 4,
    seller_name: 'Polonnaruwa Harvest Guild',
    quantity_kg: 45,
    unit_price_lkr: 150,
    subtotal_lkr: 6750,
    commission_rate: 0,
    commission_amount_lkr: 0,
    seller_payout_lkr: 6750,
    total_amount_lkr: 6750,
    payment_method: 'AgriPay Direct Card',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'admin_janon',
    email: 'admin@kalam.lk',
    role: 'admin',
    full_name: 'Janon Smith',
    phone: '+94 77 900 1100',
    location: 'Colombo Operations HQ',
    created_at: '2026-01-10T08:00:00Z',
    status: 'active',
  },
  {
    id: 2,
    username: 'farmer_thulasi',
    email: 'thulasi@kalam.lk',
    role: 'farmer',
    full_name: "Thulasi's Organic Farm",
    phone: '+94 71 450 7821',
    location: 'Jaffna Northern District',
    created_at: '2026-11-01T09:30:00Z',
    membership_expiry: '2027-11-01T09:30:00Z',
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 3,
    username: 'buyer_dulan',
    email: 'dulan@kalam.lk',
    role: 'consumer',
    full_name: 'Dulan Wijesinghe',
    phone: '+94 76 332 9901',
    location: 'Kandy Central',
    created_at: '2026-11-02T14:15:00Z',
    membership_expiry: '2027-11-02T14:15:00Z',
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 4,
    username: 'farmer_perera',
    email: 'perera@kalam.lk',
    role: 'farmer',
    full_name: 'Polonnaruwa Harvest Guild',
    phone: '+94 77 882 1104',
    location: 'Polonnaruwa District',
    created_at: '2025-11-20T10:00:00Z',
    membership_expiry: '2026-11-20T10:00:00Z', // Expiring in 16 days (< 30 days)
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 5,
    username: 'buyer_samadhi',
    email: 'samadhi@kalam.lk',
    role: 'consumer',
    full_name: 'Samadhi Jayasuriya',
    phone: '+94 72 443 8812',
    location: 'Galle Coastal District',
    created_at: '2025-10-15T16:20:00Z',
    membership_expiry: '2026-10-15T16:20:00Z', // Expired 20 days ago
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 6,
    username: 'farmer_shantha',
    email: 'shantha@kalam.lk',
    role: 'farmer',
    full_name: 'Uva Mountain Tea & Spices',
    phone: '+94 75 551 2289',
    location: 'Badulla Highland Zone',
    created_at: '2026-10-05T11:00:00Z',
    membership_expiry: '2027-10-05T11:00:00Z',
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 7,
    username: 'buyer_kaveen',
    email: 'kaveen@kalam.lk',
    role: 'consumer',
    full_name: 'Kaveen Fernando',
    phone: '+94 77 443 1198',
    location: 'Negombo Coastal',
    created_at: '2026-10-18T15:30:00Z',
    membership_expiry: '2027-10-18T15:30:00Z',
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 8,
    username: 'farmer_siva',
    email: 'siva@kalam.lk',
    role: 'farmer',
    full_name: 'Kilinochchi Green Agro',
    phone: '+94 71 889 0023',
    location: 'Kilinochchi Northern Area',
    created_at: '2026-09-12T08:00:00Z',
    membership_expiry: '2027-09-12T08:00:00Z',
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
  {
    id: 9,
    username: 'buyer_anoma',
    email: 'anoma@kalam.lk',
    role: 'consumer',
    full_name: 'Anoma Wickramasinghe',
    phone: '+94 76 220 9944',
    location: 'Kurunegala Central',
    created_at: '2026-09-25T14:00:00Z',
    membership_expiry: '2027-09-25T14:00:00Z',
    annual_fee_paid_lkr: 1000,
    status: 'active',
  },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 1,
    date: '2026-11-01',
    type: 'income',
    category: 'Annual Membership Fee',
    description: "Annual LKR 1,000 Registration Fee - Thulasi's Organic Farm (FARMER)",
    amount_lkr: 1000,
    reference_id: 'MEM-002',
  },
  {
    id: 2,
    date: '2026-11-02',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Dulan Wijesinghe (CONSUMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-003',
  },
  {
    id: 3,
    date: '2026-10-05',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Uva Mountain Tea & Spices (FARMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-006',
  },
  {
    id: 4,
    date: '2026-10-18',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Kaveen Fernando (CONSUMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-007',
  },
  {
    id: 5,
    date: '2026-09-12',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Kilinochchi Green Agro (FARMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-008',
  },
  {
    id: 6,
    date: '2026-09-25',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Anoma Wickramasinghe (CONSUMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-009',
  },
  {
    id: 7,
    date: '2025-11-20',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Polonnaruwa Harvest Guild (FARMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-004',
  },
  {
    id: 8,
    date: '2025-10-15',
    type: 'income',
    category: 'Annual Membership Fee',
    description: 'Annual LKR 1,000 Registration Fee - Samadhi Jayasuriya (CONSUMER)',
    amount_lkr: 1000,
    reference_id: 'MEM-005',
  },
];

export class MarketplaceStore {
  private static CROPS_KEY = 'kalam_crops_data';
  private static TXNS_KEY = 'kalam_transactions_data';
  private static USERS_KEY = 'kalam_users_data';
  private static LEDGER_KEY = 'kalam_ledger_data';
  private static SESSION_KEY = 'kalam_current_user_session';

  // Reactive Pub/Sub event listeners for instant cross-panel sync
  private static listeners: Set<() => void> = new Set();

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  static notify(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in marketplace sync listener', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kalam_marketplace_sync'));
    }
  }

  // Session
  static getCurrentSession(): User | null {
    try {
      const saved = localStorage.getItem(this.SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  }

  static setCurrentSession(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.SESSION_KEY);
      }
      this.notify();
    } catch {
      // ignore
    }
  }

  // Crops
  static getCrops(): Crop[] {
    try {
      const saved = localStorage.getItem(this.CROPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CROPS;
  }

  static saveCrops(crops: Crop[]): void {
    try {
      localStorage.setItem(this.CROPS_KEY, JSON.stringify(crops));
      this.notify();
    } catch {
      // ignore
    }
  }

  static addCrop(cropData: Omit<Crop, 'id' | 'created_at'>): Crop {
    const crops = this.getCrops();
    const newCrop: Crop = {
      ...cropData,
      id: crops.length > 0 ? Math.max(...crops.map(c => c.id)) + 1 : 1,
      initial_quantity: cropData.initial_quantity || cropData.quantity_available,
      moderation_status: cropData.moderation_status || 'approved',
      created_at: new Date().toISOString(),
    };
    const updated = [newCrop, ...crops];
    this.saveCrops(updated);
    return newCrop;
  }

  static updateCrop(id: number, updates: Partial<Crop>): Crop | null {
    const crops = this.getCrops();
    const idx = crops.findIndex(c => c.id === id);
    if (idx === -1) return null;
    crops[idx] = { ...crops[idx], ...updates };
    this.saveCrops(crops);
    return crops[idx];
  }

  static deleteCrop(id: number): boolean {
    const crops = this.getCrops();
    const updated = crops.filter(c => c.id !== id);
    this.saveCrops(updated);
    return true;
  }

  // Transactions
  static getTransactions(): Transaction[] {
    try {
      const saved = localStorage.getItem(this.TXNS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  }

  static saveTransactions(txns: Transaction[]): void {
    try {
      localStorage.setItem(this.TXNS_KEY, JSON.stringify(txns));
      this.notify();
    } catch {
      // ignore
    }
  }

  static createTransaction(params: {
    crop_id: number;
    crop_name: string;
    buyer_id: number;
    buyer_name: string;
    seller_id: number;
    seller_name: string;
    quantity_kg: number;
    unit_price_lkr: number;
    payment_method?: string;
  }): Transaction {
    const subtotal = Math.round(params.quantity_kg * params.unit_price_lkr * 100) / 100;
    // Strict 0% sales commission: 100% of purchase goes directly to the farmer
    const commission_rate = 0;
    const commission_amount = 0;
    const seller_payout = subtotal;

    const txns = this.getTransactions();
    const newTxn: Transaction = {
      id: txns.length > 0 ? Math.max(...txns.map(t => t.id)) + 1 : 101,
      crop_id: params.crop_id,
      crop_name: params.crop_name,
      buyer_id: params.buyer_id,
      buyer_name: params.buyer_name,
      seller_id: params.seller_id,
      seller_name: params.seller_name,
      quantity_kg: params.quantity_kg,
      unit_price_lkr: params.unit_price_lkr,
      subtotal_lkr: subtotal,
      commission_rate,
      commission_amount_lkr: commission_amount,
      seller_payout_lkr: seller_payout,
      total_amount_lkr: subtotal,
      payment_method: params.payment_method || 'AgriPay Direct Card',
      status: 'completed',
      timestamp: new Date().toISOString(),
    };

    const updated = [newTxn, ...txns];
    this.saveTransactions(updated);

    // Deduct stock from crop
    const crops = this.getCrops();
    const cropIdx = crops.findIndex(c => c.id === params.crop_id);
    if (cropIdx !== -1) {
      crops[cropIdx].quantity_available = Math.max(0, crops[cropIdx].quantity_available - params.quantity_kg);
      this.saveCrops(crops);
    }

    return newTxn;
  }

  static updateTransactionStatus(id: number, status: 'completed' | 'processing' | 'shipped' | 'cancelled'): void {
    const txns = this.getTransactions();
    const idx = txns.findIndex(t => t.id === id);
    if (idx !== -1) {
      txns[idx].status = status;
      this.saveTransactions(txns);
    }
  }

  // Monthly Income (Varavu) Ledger
  static getLedgerEntries(): LedgerEntry[] {
    try {
      const saved = localStorage.getItem(this.LEDGER_KEY);
      if (saved) {
        const parsed: LedgerEntry[] = JSON.parse(saved);
        // Exclusively retain pure '+ VARAVU' income entries
        const incomeOnly = parsed.filter(e => e.type === 'income');
        if (incomeOnly.length !== parsed.length) {
          localStorage.setItem(this.LEDGER_KEY, JSON.stringify(incomeOnly));
        }
        return incomeOnly;
      }
    } catch {
      // ignore
    }
    return INITIAL_LEDGER;
  }

  static saveLedgerEntries(entries: LedgerEntry[]): void {
    try {
      const incomeOnly = entries.filter(e => e.type === 'income');
      localStorage.setItem(this.LEDGER_KEY, JSON.stringify(incomeOnly));
      this.notify();
    } catch {
      // ignore
    }
  }

  static addLedgerEntry(entryData: Omit<LedgerEntry, 'id'>): LedgerEntry {
    const entries = this.getLedgerEntries();
    const newEntry: LedgerEntry = {
      ...entryData,
      type: 'income',
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
    };
    const updated = [newEntry, ...entries];
    this.saveLedgerEntries(updated);
    return newEntry;
  }

  static deleteLedgerEntry(id: number): boolean {
    const entries = this.getLedgerEntries();
    const updated = entries.filter(e => e.id !== id);
    this.saveLedgerEntries(updated);
    return true;
  }

  static getLedgerSummary(): { totalIncome: number } {
    const entries = this.getLedgerEntries();
    const totalIncome = entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount_lkr, 0);
    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
    };
  }

  // Users Directory & Membership Management
  static getUsers(): User[] {
    try {
      const saved = localStorage.getItem(this.USERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  }

  static saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      this.notify();
    } catch {
      // ignore
    }
  }

  static addUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const users = this.getUsers();
    const now = new Date();
    const created_at = now.toISOString();

    // 365-day membership validity
    const expiryDate = new Date(now.getTime() + 365 * 86400000).toISOString();

    const newUser: User = {
      ...userData,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      status: userData.status || 'active',
      created_at,
      membership_expiry: userData.role === 'admin' ? undefined : (userData.membership_expiry || expiryDate),
      annual_fee_paid_lkr: userData.role === 'admin' ? 0 : 1000,
    };

    const updated = [...users, newUser];
    this.saveUsers(updated);

    // Automatically record LKR 1,000 Annual Registration Fee in Varavu-Selavu Ledger
    if (newUser.role !== 'admin') {
      this.addLedgerEntry({
        date: created_at.split('T')[0],
        type: 'income',
        category: 'Annual Membership Fee',
        description: `Annual LKR 1,000 Registration Fee - ${newUser.full_name} (${newUser.role.toUpperCase()})`,
        amount_lkr: 1000,
        reference_id: `MEM-${newUser.id.toString().padStart(3, '0')}`,
      });
    }

    return newUser;
  }

  static renewMembership(userId: number, paymentMethod: string = 'AgriPay Card'): User | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    const user = users[idx];
    const now = Date.now();
    const currentExpiryTime = user.membership_expiry ? new Date(user.membership_expiry).getTime() : now;
    // If not yet expired, extend from existing expiry date; if expired, extend from now
    const baseTime = currentExpiryTime > now ? currentExpiryTime : now;
    const newExpiry = new Date(baseTime + 365 * 86400000).toISOString();

    const updatedUser: User = {
      ...user,
      membership_expiry: newExpiry,
      last_renewal_date: new Date().toISOString(),
      annual_fee_paid_lkr: (user.annual_fee_paid_lkr || 1000) + 1000,
    };

    users[idx] = updatedUser;
    this.saveUsers(users);

    // Record LKR 1,000 renewal income in Ledger
    this.addLedgerEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Annual Membership Fee',
      description: `Annual LKR 1,000 Membership 1-Year Renewal - ${user.full_name} (${user.role.toUpperCase()})`,
      amount_lkr: 1000,
      reference_id: `REN-${user.id}-${Date.now().toString().slice(-4)}`,
    });

    // Sync session if active user renewed
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.id === userId) {
      this.setCurrentSession(updatedUser);
    }

    return updatedUser;
  }

  static updateUserStatus(id: number, status: 'active' | 'suspended'): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx].status = status;
      this.saveUsers(users);
    }
  }

  // Registration Reporting & Analytics
  static getRegistrationSummary(): RegistrationSummary {
    const users = this.getUsers().filter(u => u.role !== 'admin');
    const now = Date.now();
    const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g., '2026-11'

    let currentMonthUsers = 0;
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let farmersCount = 0;
    let consumersCount = 0;

    users.forEach(u => {
      if (u.role === 'farmer') farmersCount++;
      if (u.role === 'consumer') consumersCount++;

      const isCurrentMonth = u.created_at && u.created_at.startsWith(currentMonthKey);
      if (isCurrentMonth) currentMonthUsers++;

      if (u.membership_expiry) {
        const expiryTime = new Date(u.membership_expiry).getTime();
        const diffDays = Math.ceil((expiryTime - now) / 86400000);
        if (diffDays <= 0) {
          expiredCount++;
        } else if (diffDays <= 30) {
          expiringSoonCount++;
          activeCount++;
        } else {
          activeCount++;
        }
      } else {
        activeCount++;
      }
    });

    const totalRegisteredUsers = users.length;
    const totalRevenueLkr = totalRegisteredUsers * 1000;
    const currentMonthRevenueLkr = currentMonthUsers * 1000;

    return {
      totalRegisteredUsers,
      totalRevenueLkr,
      currentMonthRegisteredUsers: currentMonthUsers,
      currentMonthRevenueLkr,
      activeMembershipsCount: activeCount,
      expiringSoonCount,
      expiredCount,
      farmersCount,
      consumersCount,
    };
  }

  static getMonthlyRegistrationReports(): MonthlyRegistrationReport[] {
    const users = this.getUsers().filter(u => u.role !== 'admin');
    const monthGroups: Record<string, { total: number; farmers: number; consumers: number }> = {};

    users.forEach(u => {
      const key = u.created_at ? u.created_at.slice(0, 7) : '2026-11';
      if (!monthGroups[key]) {
        monthGroups[key] = { total: 0, farmers: 0, consumers: 0 };
      }
      monthGroups[key].total++;
      if (u.role === 'farmer') monthGroups[key].farmers++;
      if (u.role === 'consumer') monthGroups[key].consumers++;
    });

    const monthKeys = Object.keys(monthGroups).sort().reverse();

    return monthKeys.map(key => {
      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const monthLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const stats = monthGroups[key];
      return {
        monthKey: key,
        monthLabel,
        totalRegisteredUsers: stats.total,
        farmersCount: stats.farmers,
        consumersCount: stats.consumers,
        totalRevenueLkr: stats.total * 1000,
      };
    });
  }

  static getAnalyticsSummary(): AnalyticsSummary {
    const txns = this.getTransactions();
    const total_volume = txns.reduce((acc, t) => acc + t.subtotal_lkr, 0);
    const total_commission = 0; // 0% commission
    const total_payout = total_volume; // 100% to farmer

    return {
      total_transactions_count: txns.length,
      total_volume_lkr: Math.round(total_volume * 100) / 100,
      total_commission_collected_lkr: 0,
      total_seller_payout_lkr: Math.round(total_payout * 100) / 100,
      commission_percentage: 0,
      currency: 'LKR',
    };
  }
}
