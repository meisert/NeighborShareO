export type ItemCategory = 'Tools' | 'Outdoor' | 'Kitchen' | 'Party' | 'Camping' | 'Other';

export type ItemCondition = 'Like New' | 'Excellent' | 'Good' | 'Well-loved';

export interface LenderProfile {
  id: string;
  name: string;
  avatar: string;
  trustScore: number; // e.g. 98 -> 98%
  totalLends: number;
  responseTime: string;
  neighborhood: string;
  zipCode: string;
  isVerifiedNeighbor: boolean;
}

export interface ShareItem {
  id: string;
  title: string;
  category: ItemCategory;
  condition: ItemCondition;
  description: string;
  rules: string;
  dailyFee: number; // 0 for free
  refundableDeposit: number; // 0 for none
  depositNote?: string;
  neighborhood: string;
  zipCode: string;
  imageUrl: string;
  lender: LenderProfile;
  isAvailable: boolean;
  createdAt: string;
  isMyGarageItem?: boolean;
  isDemo?: boolean;
}

export type RequestStatus = 'pending' | 'approved' | 'picked_up' | 'returned' | 'declined';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'lender' | 'borrower';
  text: string;
  timestamp: string;
}

export interface BorrowRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCategory: ItemCategory;
  itemImageUrl: string;
  lenderId: string;
  lenderName: string;
  borrowerId: string;
  borrowerName: string;
  borrowerNeighborhood: string;
  borrowerTrustScore: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyFee: number;
  deposit: number;
  message: string;
  pickupPreference: 'Porch pickup' | 'Front gate handoff' | 'Flexible meet-up';
  status: RequestStatus;
  createdAt: string;
  messages: ChatMessage[];
  handoffAddress?: string;
  isDemo?: boolean;
}

export interface IsoRequest {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  neededByDate: string;
  neighborhood: string;
  zipCode: string;
  posterName: string;
  posterTrustScore: number;
  posterAvatar: string;
  responsesCount: number;
  createdAt: string;
  status: 'open' | 'fulfilled';
  isDemo?: boolean;
}

export interface NeighborhoodProposal {
  id: string;
  zipCode: string;
  neighborhoodName: string;
  areaName?: string;
  requesterName: string;
  requesterEmail?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  neighborhood: string;
  zipCode: string;
  avatar: string;
  trustScore: number;
  totalLends: number;
  isVerifiedNeighbor: boolean;
  isAdmin?: boolean;
  isDemo?: boolean;
  bio?: string;
  authProvider?: 'google' | 'email';
  createdAt: string;
}

