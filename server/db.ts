import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'winer_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type ToolType = 'image_gen' | 'video_gen' | 'photo_swap' | 'video_swap';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  trials: {
    image_gen: boolean; // true = unused (eligible), false = used
    video_gen: boolean; // true = unused (eligible), false = used (max 30s)
    photo_swap: boolean; // true = unused (eligible), false = used
    video_swap: boolean; // true = unused (eligible), false = used
  };
  authorizedOperations: Array<{
    id: string;
    tool: ToolType;
    durationSeconds?: number;
    paymentId: string;
    used: boolean;
    createdAt: string;
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
  image_gen: number; // 3000 NGN
  photo_swap: number; // 3000 NGN
  video_swap: number; // 3000 NGN
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
  provider: string; // 'OPay'
  accountName: string; // 'Ajibola Mubarak'
  accountNumber: string; // '9063296466'
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

export interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  payments: PaymentRecord[];
  creations: CreationRecord[];
  supportTickets: SupportTicket[];
  pricingConfig: PricingConfig;
}

const DEFAULT_PRICING: PricingConfig = {
  image_gen: 3000,
  photo_swap: 3000,
  video_swap: 3000,
  video_tiers: [
    { id: 'tier_30s', label: 'Up to 30 seconds', maxSeconds: 30, price: 0, isFreeTrial: true },
    { id: 'tier_2m', label: 'Over 30 seconds to 2 minutes', maxSeconds: 120, price: 7000 },
    { id: 'tier_5m', label: 'Over 2 minutes to 5 minutes', maxSeconds: 300, price: 15000 },
    { id: 'tier_10m', label: 'Over 5 minutes to 10 minutes', maxSeconds: 600, price: 25000 },
    { id: 'tier_20m', label: 'Over 10 minutes to 20 minutes', maxSeconds: 1200, price: 40000 },
    { id: 'tier_40m', label: 'Over 20 minutes to 40 minutes', maxSeconds: 2400, price: 65000 },
    { id: 'tier_60m', label: 'Over 40 minutes to 60 minutes', maxSeconds: 3600, price: 85000 },
  ],
};

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial Sample Creations to showcase capabilities in user galleries and homepage
const SEED_CREATIONS: CreationRecord[] = [
  {
    id: 'creation_sample_1',
    userId: 'admin_1',
    tool: 'image_gen',
    title: 'Cyberpunk Cyber-Samurai in Neo Lagos',
    prompt: 'A cyberpunk warrior standing under holographic neon signs in futuristic Lagos, cinematic volumetric lighting, 8k',
    style: 'Cinematic',
    aspectRatio: '16:9',
    resultUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    resultThumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    isFavorite: true,
    status: 'completed',
    isTrial: true,
    cost: 0,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'creation_sample_2',
    userId: 'admin_1',
    tool: 'video_gen',
    title: 'Cosmic Nebula Hyperlapse Drone Shot',
    prompt: 'Drone camera flying forward through violet stardust and alien planetary ring systems, photorealistic motion',
    style: 'Drone Aerial',
    aspectRatio: '16:9',
    duration: 30,
    resultUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    resultThumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    isFavorite: true,
    status: 'completed',
    isTrial: true,
    cost: 0,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'creation_sample_3',
    userId: 'admin_1',
    tool: 'photo_swap',
    title: 'Renaissance Masterpiece Face Swap',
    prompt: 'Face swap with classical oil painting portrait',
    inputMediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    sourceFaceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    resultUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    resultThumb: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    isFavorite: false,
    status: 'completed',
    isTrial: true,
    cost: 0,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          payments: parsed.payments || [],
          creations: parsed.creations || [],
          supportTickets: parsed.supportTickets || [],
          pricingConfig: parsed.pricingConfig || DEFAULT_PRICING,
        };
      }
    } catch (err) {
      console.error('Error loading DB file, initializing defaults:', err);
    }

    // Default Seed Database
    const initialDb: DatabaseSchema = {
      users: [
        {
          id: 'admin_1',
          name: 'Ajibola Mubarak (Admin)',
          email: 'admin@winerai.com',
          passwordHash: hashPassword('winerAdmin2026!'),
          role: 'admin',
          createdAt: new Date().toISOString(),
          trials: {
            image_gen: true,
            video_gen: true,
            photo_swap: true,
            video_swap: true,
          },
          authorizedOperations: [],
        },
        {
          id: 'demo_user_1',
          name: 'Demo Creator',
          email: 'creator@winerai.com',
          passwordHash: hashPassword('password123'),
          role: 'user',
          createdAt: new Date().toISOString(),
          trials: {
            image_gen: true,
            video_gen: true,
            photo_swap: true,
            video_swap: true,
          },
          authorizedOperations: [],
        },
      ],
      payments: [
        {
          id: 'pay_sample_1',
          userId: 'demo_user_1',
          userEmail: 'creator@winerai.com',
          userName: 'Demo Creator',
          tool: 'video_gen',
          durationSeconds: 120,
          durationLabel: 'Over 30 seconds to 2 minutes',
          amount: 7000,
          currency: 'NGN',
          provider: 'OPay',
          accountName: 'Ajibola Mubarak',
          accountNumber: '9063296466',
          transactionRef: 'OPAY-TRX-98234190',
          senderName: 'Mubarak Ajibola',
          senderBank: 'Access Bank',
          notes: 'Payment for 2-minute promotional clip',
          status: 'verified',
          adminNotes: 'Confirmed via OPay ledger',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          verifiedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
        },
      ],
      creations: SEED_CREATIONS,
      supportTickets: [
        {
          id: 'ticket_1',
          userId: 'demo_user_1',
          name: 'Demo Creator',
          email: 'creator@winerai.com',
          subject: 'Video face swap format inquiry',
          message: 'Can I upload a 4K 60fps MP4 video for face replacement?',
          status: 'resolved',
          createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        },
      ],
      pricingConfig: DEFAULT_PRICING,
    };

    this.save(initialDb);
    return initialDb;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing DB file:', err);
    }
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(name: string, email: string, password: string, role: 'user' | 'admin' = 'user'): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role,
      createdAt: new Date().toISOString(),
      trials: {
        image_gen: true, // 1 free trial eligible
        video_gen: true, // 1 free trial eligible (up to 30s)
        photo_swap: true, // 1 free trial eligible
        video_swap: true, // 1 free trial eligible
      },
      authorizedOperations: [],
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public authenticate(email: string, password: string): User | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== hashPassword(password)) return null;
    return user;
  }

  public updateUserTrials(userId: string, trials: User['trials']): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.trials = { ...user.trials, ...trials };
    this.save();
    return user;
  }

  public consumeTrial(userId: string, tool: ToolType): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    if (!user.trials[tool]) {
      return false; // Trial already used
    }
    user.trials[tool] = false;
    this.save();
    return true;
  }

  public hasAvailableTrial(userId: string, tool: ToolType): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    return !!user.trials[tool];
  }

  public hasPaidAuthorization(userId: string, tool: ToolType, durationSeconds?: number): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    // Check if user has an unused authorized operation for this tool
    return user.authorizedOperations.some((op) => {
      if (op.used) return false;
      if (op.tool !== tool) return false;
      if (tool === 'video_gen' && durationSeconds) {
        return (op.durationSeconds || 0) >= durationSeconds;
      }
      return true;
    });
  }

  public consumePaidAuthorization(userId: string, tool: ToolType, durationSeconds?: number): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    const op = user.authorizedOperations.find((o) => {
      if (o.used) return false;
      if (o.tool !== tool) return false;
      if (tool === 'video_gen' && durationSeconds) {
        return (o.durationSeconds || 0) >= durationSeconds;
      }
      return true;
    });

    if (!op) return false;
    op.used = true;
    this.save();
    return true;
  }

  public grantAuthorizedOperation(userId: string, tool: ToolType, paymentId: string, durationSeconds?: number): void {
    const user = this.getUserById(userId);
    if (!user) return;

    user.authorizedOperations.push({
      id: 'auth_op_' + crypto.randomUUID().slice(0, 8),
      tool,
      durationSeconds,
      paymentId,
      used: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
  }

  // --- Pricing Configuration ---
  public getPricingConfig(): PricingConfig {
    return this.data.pricingConfig;
  }

  public updatePricingConfig(newPricing: Partial<PricingConfig>): PricingConfig {
    this.data.pricingConfig = {
      ...this.data.pricingConfig,
      ...newPricing,
    };
    this.save();
    return this.data.pricingConfig;
  }

  public calculateCost(tool: ToolType, durationSeconds: number = 30): { amount: number; isEligibleFreeTrial: boolean; tierLabel?: string } {
    const config = this.data.pricingConfig;

    if (tool === 'image_gen') {
      return { amount: config.image_gen, isEligibleFreeTrial: true, tierLabel: 'Single AI Image Operation' };
    }
    if (tool === 'photo_swap') {
      return { amount: config.photo_swap, isEligibleFreeTrial: true, tierLabel: 'Photo Face Swap Operation' };
    }
    if (tool === 'video_swap') {
      return { amount: config.video_swap, isEligibleFreeTrial: true, tierLabel: 'Video Face Swap Operation' };
    }

    // Video Generator Pricing Tiers
    if (durationSeconds <= 30) {
      return { amount: 0, isEligibleFreeTrial: true, tierLabel: 'Up to 30 seconds (Free Trial Eligible)' };
    }

    const tiers = config.video_tiers;
    for (const t of tiers) {
      if (!t.isFreeTrial && durationSeconds <= t.maxSeconds) {
        return { amount: t.price, isEligibleFreeTrial: false, tierLabel: t.label };
      }
    }

    // Default to highest tier if exceeding 40 minutes
    const highest = tiers[tiers.length - 1];
    return { amount: highest.price, isEligibleFreeTrial: false, tierLabel: highest.label };
  }

  // --- Payments (OPay Manual Transfer) ---
  public getPayments(): PaymentRecord[] {
    return this.data.payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPaymentsByUser(userId: string): PaymentRecord[] {
    return this.data.payments
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createPayment(data: {
    userId: string;
    tool: ToolType;
    durationSeconds?: number;
    transactionRef: string;
    senderName: string;
    senderBank?: string;
    notes?: string;
  }): PaymentRecord {
    const user = this.getUserById(data.userId);
    if (!user) throw new Error('User not found');

    const costInfo = this.calculateCost(data.tool, data.durationSeconds);

    const payment: PaymentRecord = {
      id: 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      tool: data.tool,
      durationSeconds: data.durationSeconds,
      durationLabel: costInfo.tierLabel,
      amount: costInfo.amount,
      currency: 'NGN',
      provider: 'OPay',
      accountName: 'Ajibola Mubarak',
      accountNumber: '9063296466',
      transactionRef: data.transactionRef.trim(),
      senderName: data.senderName.trim(),
      senderBank: data.senderBank,
      notes: data.notes,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };

    this.data.payments.unshift(payment);
    this.save();
    return payment;
  }

  public verifyPayment(paymentId: string, verified: boolean, adminNotes?: string): PaymentRecord {
    const payment = this.data.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment record not found');

    payment.status = verified ? 'verified' : 'rejected';
    payment.adminNotes = adminNotes;
    payment.verifiedAt = new Date().toISOString();

    if (verified) {
      // Authorize operation for the user
      this.grantAuthorizedOperation(payment.userId, payment.tool, payment.id, payment.durationSeconds);
    }

    this.save();
    return payment;
  }

  // --- Creations Gallery ---
  public getCreations(userId?: string): CreationRecord[] {
    let list = this.data.creations;
    if (userId) {
      list = list.filter((c) => c.userId === userId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getCreationById(id: string): CreationRecord | undefined {
    return this.data.creations.find((c) => c.id === id);
  }

  public addCreation(creation: Omit<CreationRecord, 'id' | 'createdAt'>): CreationRecord {
    const newCreation: CreationRecord = {
      ...creation,
      id: 'cr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      createdAt: new Date().toISOString(),
    };
    this.data.creations.unshift(newCreation);
    this.save();
    return newCreation;
  }

  public toggleFavorite(creationId: string, userId: string): boolean {
    const creation = this.data.creations.find((c) => c.id === creationId && c.userId === userId);
    if (!creation) return false;
    creation.isFavorite = !creation.isFavorite;
    this.save();
    return creation.isFavorite;
  }

  public deleteCreation(creationId: string, userId: string): boolean {
    const index = this.data.creations.findIndex((c) => c.id === creationId && c.userId === userId);
    if (index === -1) return false;
    this.data.creations.splice(index, 1);
    this.save();
    return true;
  }

  // --- Support Tickets ---
  public getSupportTickets(): SupportTicket[] {
    return this.data.supportTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): SupportTicket {
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'tkt_' + crypto.randomUUID().slice(0, 8),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.data.supportTickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  // --- Analytics ---
  public getAnalytics() {
    const usersCount = this.data.users.length;
    const payments = this.data.payments;
    const verifiedPayments = payments.filter((p) => p.status === 'verified');
    const totalRevenueNGN = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingPaymentsCount = payments.filter((p) => p.status === 'pending_verification').length;
    const creationsCount = this.data.creations.length;

    // Tool breakdown
    const toolCounts: Record<string, number> = {
      image_gen: 0,
      video_gen: 0,
      photo_swap: 0,
      video_swap: 0,
    };
    this.data.creations.forEach((c) => {
      if (toolCounts[c.tool] !== undefined) {
        toolCounts[c.tool]++;
      }
    });

    return {
      usersCount,
      creationsCount,
      totalRevenueNGN,
      pendingPaymentsCount,
      verifiedPaymentsCount: verifiedPayments.length,
      toolCounts,
      paymentProvider: 'OPay',
      accountNumber: '9063296466',
      accountName: 'Ajibola Mubarak',
    };
  }
}

export const db = new Database();
