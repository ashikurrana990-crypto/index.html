export type UserRole = 'admin' | 'affiliate' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  referralId?: string; // For affiliates, their unique ID
  referredBy?: string; // For customers, who referred them
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  commissionRate: number; // e.g., 0.1 for 10%
  stock: number;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  affiliateId?: string;
  commissionAmount?: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
}

export interface AffiliateStats {
  totalEarnings: number;
  pendingEarnings: number;
  completedEarnings: number;
  referralCount: number;
}
