export type UserRole = 'farmer' | 'consumer' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  location?: string;
  created_at: string;
  status?: 'active' | 'suspended';
  membership_expiry?: string; // 365 days from registration or renewal
  annual_fee_paid_lkr?: number; // LKR 1,000
  last_renewal_date?: string;
  photos?: string[]; // Up to 5 uploaded farm/verification photos
}

export type CropCategory = 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Other';

export interface Crop {
  id: number;
  name: string;
  category: CropCategory;
  price_per_kg: number;
  quantity_available: number;
  initial_quantity?: number;
  seller_id: number;
  seller_name: string;
  location: string;
  description?: string;
  image_url?: string;
  images?: string[]; // Up to 5 crop listing photos
  rating?: number;
  created_at: string;
  moderation_status?: 'approved' | 'pending' | 'rejected';
}

export interface Transaction {
  id: number;
  crop_id: number;
  crop_name: string;
  buyer_id: number;
  buyer_name: string;
  seller_id: number;
  seller_name: string;
  quantity_kg: number;
  unit_price_lkr: number;
  subtotal_lkr: number;
  commission_rate: number; // 0% under Annual Membership model
  commission_amount_lkr: number; // 0 LKR
  seller_payout_lkr: number; // 100% of order goes to farmer
  total_amount_lkr: number;
  payment_method: string;
  status: 'completed' | 'processing' | 'shipped' | 'cancelled';
  timestamp: string;
}

export interface LedgerEntry {
  id: number;
  date: string;
  type: 'income';
  category: string;
  description: string;
  amount_lkr: number;
  reference_id?: string;
}

export interface MonthlyRegistrationReport {
  monthKey: string; // e.g., '2026-11'
  monthLabel: string; // e.g., 'November 2026'
  totalRegisteredUsers: number;
  farmersCount: number;
  consumersCount: number;
  totalRevenueLkr: number; // totalRegisteredUsers * 1000
}

export interface RegistrationSummary {
  totalRegisteredUsers: number;
  totalRevenueLkr: number; // count * 1000
  currentMonthRegisteredUsers: number;
  currentMonthRevenueLkr: number;
  activeMembershipsCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  farmersCount: number;
  consumersCount: number;
}

export interface AnalyticsSummary {
  total_transactions_count: number;
  total_volume_lkr: number;
  total_commission_collected_lkr: number;
  total_seller_payout_lkr: number;
  commission_percentage: number;
  currency: string;
}

export type SupportedLanguage = 'en' | 'ta' | 'si';
