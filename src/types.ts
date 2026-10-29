export type ToolType = 'image_gen' | 'video_gen' | 'photo_swap' | 'video_swap';

export type ActiveView =
  | 'home'
  | 'image_gen'
  | 'video_gen'
  | 'photo_swap'
  | 'video_swap'
  | 'dashboard'
  | 'pricing'
  | 'admin'
  | 'contact';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  trials: {
    image_gen: boolean;
    video_gen: boolean;
    photo_swap: boolean;
    video_swap: boolean;
  };
  authorizedOperations?: Array<{
    id: string;
    tool: ToolType;
    durationSeconds?: number;
    paymentId: string;
    used: boolean;
  }>;
}

export interface VideoPricingTier {
  id: string;
  label: string;
  maxSeconds: number;
  price: number;
  isFreeTrial?: boolean;
}

export interface PricingConfig {
  image_gen: number;
  photo_swap: number;
  video_swap: number;
  video_tiers: VideoPricingTier[];
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  tool: ToolType;
  durationSeconds?: number;
  durationLabel?: string;
  amount: number;
  currency: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  transactionRef: string;
  senderName: string;
  senderBank?: string;
  notes?: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface CreationRecord {
  id: string;
  userId: string;
  tool: ToolType;
  title: string;
  prompt?: string;
  enhancedPrompt?: string;
  style?: string;
  aspectRatio?: string;
  duration?: number;
  inputMediaUrl?: string;
  sourceFaceUrl?: string;
  resultUrl: string;
  resultThumb?: string;
  isFavorite?: boolean;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  isTrial: boolean;
  cost: number;
  createdAt: string;
}

export interface CheckoutDetails {
  tool: ToolType;
  durationSeconds?: number;
  tierLabel?: string;
  amount: number;
  reason?: 'trial_completed' | 'pay_required' | 'manual';
  onSuccess?: () => void;
}

