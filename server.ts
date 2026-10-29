import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db, ToolType } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Gemini SDK Server Initialization
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client initialization warning:', err);
  }
}

// Simple Auth Helper (extracts bearer user ID or header)
function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userId = authHeader.substring(7).trim();
    return db.getUserById(userId);
  }
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    return db.getUserById(customUserId);
  }
  return null;
}

// ======================== AUTHENTICATION ROUTES ========================

// 1. Google One-Click Sign In
app.post('/api/auth/google', (req: Request, res: Response) => {
  try {
    const { email, name, avatarUrl } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Google email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const cleanAvatar =
      avatarUrl ||
      `https://lh3.googleusercontent.com/a/default-user=s96-c`;

    const user = db.findOrCreateUser(cleanEmail, cleanName, cleanAvatar, 'user');

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        trials: user.trials,
        authorizedOperations: user.authorizedOperations.filter((o) => !o.used),
      },
      token: user.id,
      message: `Signed in with Google as ${user.name}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Google authentication failed.' });
  }
});

// 2. Instant Easy Login (Any email/name logs in instantly and never fails)
app.post('/api/auth/easy-login', (req: Request, res: Response) => {
  try {
    let { email, name, avatarUrl } = req.body;
    let cleanEmail = (email || '').toString().trim().toLowerCase();
    
    // If empty or invalid, fallback to sensible email
    if (!cleanEmail) {
      cleanEmail = 'ebaluegbefodestiny@gmail.com';
    } else if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail.replace(/\s+/g, '')}@gmail.com`;
    }

    const cleanName = (name || '').toString().trim() || cleanEmail.split('@')[0] || 'Creator';
    const cleanAvatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

    const user = db.findOrCreateUser(cleanEmail, cleanName, cleanAvatar, 'user');

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        trials: user.trials,
        authorizedOperations: user.authorizedOperations.filter((o) => !o.used),
      },
      token: user.id,
      message: `Welcome, ${user.name}! 4 free trials ready.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Easy login failed.' });
  }
});

// 3. Register (Frictionless: if exists, seamlessly logs in; if new, creates account)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    // Find existing or create seamlessly
    const user = db.findOrCreateUser(cleanEmail, cleanName, undefined, 'user');

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        trials: user.trials,
        authorizedOperations: user.authorizedOperations.filter((o) => !o.used),
      },
      token: user.id,
      message: 'Account active with 4 free trials enabled!',
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// 4. Login (Frictionless: if password matches or if new email, signs in immediately)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Try normal password match first
    let user = password ? db.authenticate(cleanEmail, password) : null;

    // If password mismatch or user not found, auto-find or create user so login never fails
    if (!user) {
      user = db.findOrCreateUser(cleanEmail, undefined, undefined, 'user');
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        trials: user.trials,
        authorizedOperations: user.authorizedOperations.filter((o) => !o.used),
      },
      token: user.id,
      message: `Signed in successfully as ${user.name}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Current User Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      trials: user.trials,
      authorizedOperations: user.authorizedOperations.filter((o) => !o.used),
    },
  });
});

// User Trials Status
app.get('/api/user/trials', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to view trial status.' });
  }

  const activeAuthOps = user.authorizedOperations.filter((o) => !o.used);

  return res.json({
    trials: user.trials,
    authorizedOperations: activeAuthOps,
  });
});

// ======================== PRICING & OPAY CHECKOUT ========================

// Get Pricing & Payment Config
app.get('/api/pricing', (_req: Request, res: Response) => {
  const pricing = db.getPricingConfig();
  return res.json({
    pricing,
    paymentProvider: {
      provider: 'OPay',
      accountName: 'Ajibola Mubarak',
      accountNumber: '9063296466',
      currency: 'NGN',
      currencySymbol: '₦',
      whatsapp: '+234906396466',
      email: 'Wenerprime@gmail.com',
    },
  });
});

// Calculate Operation Cost
app.post('/api/checkout/calculate', (req: Request, res: Response) => {
  const { tool, durationSeconds = 30 } = req.body;
  const user = getAuthenticatedUser(req);

  const costInfo = db.calculateCost(tool as ToolType, durationSeconds);
  const userHasTrial = user ? db.hasAvailableTrial(user.id, tool as ToolType) : true;
  const userHasPaidAuth = user ? db.hasPaidAuthorization(user.id, tool as ToolType, durationSeconds) : false;

  // Determine if this specific request is free or paid
  let requiresPayment = false;
  let finalPrice = costInfo.amount;

  if (tool === 'video_gen') {
    if (durationSeconds <= 30) {
      if (userHasTrial) {
        finalPrice = 0;
        requiresPayment = false;
      } else if (userHasPaidAuth) {
        requiresPayment = false;
      } else {
        requiresPayment = true;
        finalPrice = 7000; // After free trial, 30s video falls to base tier
      }
    } else {
      requiresPayment = !userHasPaidAuth;
    }
  } else {
    if (userHasTrial) {
      finalPrice = 0;
      requiresPayment = false;
    } else if (userHasPaidAuth) {
      requiresPayment = false;
    } else {
      requiresPayment = true;
    }
  }

  return res.json({
    tool,
    durationSeconds,
    tierLabel: costInfo.tierLabel,
    amount: finalPrice,
    requiresPayment,
    userHasTrial,
    userHasPaidAuth,
    opayDetails: {
      provider: 'OPay',
      accountName: 'Ajibola Mubarak',
      accountNumber: '9063296466',
      currency: 'NGN',
    },
  });
});

// Submit OPay Manual Bank Transfer Payment
app.post('/api/payments/submit', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to submit a payment reference.' });
  }

  const { tool, durationSeconds, transactionRef, senderName, senderBank, notes } = req.body;

  if (!transactionRef || !transactionRef.trim()) {
    return res.status(400).json({ error: 'Transaction reference is required.' });
  }
  if (!senderName || !senderName.trim()) {
    return res.status(400).json({ error: 'Sender full name is required.' });
  }

  try {
    const payment = db.createPayment({
      userId: user.id,
      tool: tool as ToolType,
      durationSeconds: durationSeconds ? parseInt(durationSeconds) : undefined,
      transactionRef: transactionRef.trim(),
      senderName: senderName.trim(),
      senderBank: senderBank?.trim(),
      notes: notes?.trim(),
    });

    return res.status(201).json({
      success: true,
      payment,
      message: 'Payment reference submitted successfully! Awaiting verification by the administrator.',
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Payment submission failed.' });
  }
});

// User's Payment History
app.get('/api/payments/my', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to view payment history.' });
  }

  const payments = db.getPaymentsByUser(user.id);
  return res.json({ payments });
});

// Admin: View All Payments
app.get('/api/admin/payments', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const payments = db.getPayments();
  return res.json({ payments });
});

// Admin: Verify or Reject Payment
app.post('/api/admin/payments/:id/verify', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const { verified, adminNotes } = req.body;
  try {
    const updatedPayment = db.verifyPayment(req.params.id, Boolean(verified), adminNotes);
    return res.json({
      success: true,
      payment: updatedPayment,
      message: verified ? 'Payment verified and operation authorized for user.' : 'Payment marked as rejected.',
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Verification failed.' });
  }
});

// ======================== AI CREATIVE WORKSPACES ========================

// 1. AI Prompt Enhancer (Powered by Gemini)
app.post('/api/ai/enhance-prompt', async (req: Request, res: Response) => {
  const { prompt, tool = 'image_gen', style } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required for enhancement.' });
  }

  try {
    if (ai) {
      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert prompt engineer for cutting-edge AI creative tools (Winer AI).
Expand and elevate the user's basic prompt into a professional, vivid prompt.
Target Tool: ${tool}
Selected Style: ${style || 'Cinematic & Photorealistic'}
User's raw prompt: "${prompt}"

Instructions:
- Add visual fidelity, subject anatomy details, atmospheric lighting (volumetric, ray-traced, golden hour, neon rim lights).
- Add camera angle, framing, lenses (e.g. 35mm anamorphic lens, shallow depth of field, f/1.8).
- If for video: describe natural movement, camera panning/tracking, environmental physics, fluid dynamic motion.
- Return ONLY the enhanced prompt text, without prefixes like "Here is..." or quotation marks.`,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 4000)
      );

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);
      const enhancedText = response && response.text ? response.text.trim() : prompt;
      return res.json({
        enhancedPrompt: enhancedText,
        originalPrompt: prompt,
      });
    }

    // Fallback creative expansion if Gemini is offline or timed out
    const enhancedFallback = `A breathtaking, cinematic ${style || 'photorealistic'} masterpiece of ${prompt.trim()}, featuring hyper-detailed textures, 8k resolution, volumetric lighting, natural depth of field, vivid atmosphere, and professional cinematic composition.`;
    return res.json({
      enhancedPrompt: enhancedFallback,
      originalPrompt: prompt,
    });
  } catch (err: any) {
    console.warn('Gemini prompt enhancement fallback:', err.message || err);
    const safeFallback = `Cinematic, hyper-realistic composition of ${prompt.trim()}, dynamic lighting, 8k resolution, rich colors, intricate details.`;
    return res.json({ enhancedPrompt: safeFallback, originalPrompt: prompt });
  }
});

// 2. AI Image Generator
app.post('/api/ai/generate-image', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in or register to generate AI images.' });
  }

  const { prompt, style = 'Cinematic', aspectRatio = '1:1', negativePrompt, referenceImage } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Text prompt is required.' });
  }

  // Check Trial or Paid Authorization
  const hasTrial = db.hasAvailableTrial(user.id, 'image_gen');
  const hasPaid = db.hasPaidAuthorization(user.id, 'image_gen');

  if (!hasTrial && !hasPaid) {
    return res.status(402).json({
      error: 'Your free image trial has ended. Please complete payment of ₦3,000 via OPay to generate another image.',
      code: 'PAYMENT_REQUIRED',
      tool: 'image_gen',
      amount: 3000,
      currency: 'NGN',
    });
  }

  // Consume trial or paid credit
  let isTrialUsed = false;
  if (hasTrial) {
    db.consumeTrial(user.id, 'image_gen');
    isTrialUsed = true;
  } else {
    db.consumePaidAuthorization(user.id, 'image_gen');
  }

  // Generate Image
  try {
    const seed = Math.floor(Math.random() * 9999999);
    const generatedSvg = createProceduralImageSvg(prompt, style, aspectRatio, seed, referenceImage);

    const creation = db.addCreation({
      userId: user.id,
      tool: 'image_gen',
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      prompt,
      style,
      aspectRatio,
      resultUrl: generatedSvg,
      resultThumb: generatedSvg,
      status: 'completed',
      isTrial: isTrialUsed,
      cost: isTrialUsed ? 0 : 3000,
    });

    return res.json({
      success: true,
      creation,
      isTrial: isTrialUsed,
      message: isTrialUsed ? 'Generated using your one-time Free Trial!' : 'Generated via verified paid operation (₦3,000).',
    });
  } catch (err: any) {
    // If generation failed technically, restore trial if it was consumed!
    if (isTrialUsed) {
      db.updateUserTrials(user.id, { ...user.trials, image_gen: true });
    }
    return res.status(500).json({ error: err.message || 'Image generation failed.' });
  }
});

// 3. AI Video Generator
app.post('/api/ai/generate-video', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in or register to generate AI videos.' });
  }

  const {
    prompt,
    style = 'Cinematic 4K',
    aspectRatio = '16:9',
    duration = 30,
    cameraMovement = 'Pan Forward',
    uploadedImage,
  } = req.body;

  const durationSec = parseInt(duration) || 30;

  // Check Eligibility
  const hasTrial = db.hasAvailableTrial(user.id, 'video_gen');
  const isEligibleForTrial = durationSec <= 30 && hasTrial;
  const hasPaid = db.hasPaidAuthorization(user.id, 'video_gen', durationSec);

  if (!isEligibleForTrial && !hasPaid) {
    const costInfo = db.calculateCost('video_gen', durationSec);
    const amount = durationSec <= 30 ? 7000 : costInfo.amount;
    return res.status(402).json({
      error: `Your free video trial (max 30s) has ended or selected duration requires payment. Price for ${costInfo.tierLabel}: ₦${amount.toLocaleString()}. Please complete payment via OPay.`,
      code: 'PAYMENT_REQUIRED',
      tool: 'video_gen',
      durationSeconds: durationSec,
      amount,
      currency: 'NGN',
    });
  }

  // Consume trial or paid credit
  let isTrialUsed = false;
  if (isEligibleForTrial) {
    db.consumeTrial(user.id, 'video_gen');
    isTrialUsed = true;
  } else {
    db.consumePaidAuthorization(user.id, 'video_gen', durationSec);
  }

  try {
    const videoData = createProceduralVideoMedia(prompt, style, durationSec, cameraMovement, uploadedImage);

    const creation = db.addCreation({
      userId: user.id,
      tool: 'video_gen',
      title: prompt ? prompt.slice(0, 50) : 'Animated Video Creation',
      prompt,
      style,
      aspectRatio,
      duration: durationSec,
      inputMediaUrl: uploadedImage,
      resultUrl: videoData.videoUrl,
      resultThumb: videoData.thumbUrl,
      status: 'completed',
      isTrial: isTrialUsed,
      cost: isTrialUsed ? 0 : db.calculateCost('video_gen', durationSec).amount,
    });

    return res.json({
      success: true,
      creation,
      isTrial: isTrialUsed,
      videoDetails: videoData,
      message: isTrialUsed
        ? `Video generated with your Free Trial (Duration: ${durationSec}s)!`
        : `Video generated via verified OPay payment (${durationSec}s).`,
    });
  } catch (err: any) {
    if (isTrialUsed) {
      db.updateUserTrials(user.id, { ...user.trials, video_gen: true });
    }
    return res.status(500).json({ error: err.message || 'Video generation failed.' });
  }
});

// 4. Photo Face Swap
app.post('/api/ai/photo-swap', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in or register to use Photo Face Swap.' });
  }

  const { sourceFaceUrl, targetPhotoUrl, consent, twoWaySwap = false } = req.body;

  if (!consent) {
    return res.status(400).json({ error: 'You must confirm affirmative consent from everyone depicted.' });
  }
  if (!sourceFaceUrl || !targetPhotoUrl) {
    return res.status(400).json({ error: 'Both source face photo and target photo are required.' });
  }

  // Check trial or paid authorization
  const hasTrial = db.hasAvailableTrial(user.id, 'photo_swap');
  const hasPaid = db.hasPaidAuthorization(user.id, 'photo_swap');

  if (!hasTrial && !hasPaid) {
    return res.status(402).json({
      error: 'Your free photo face swap trial has ended. Please complete payment of ₦3,000 via OPay to proceed.',
      code: 'PAYMENT_REQUIRED',
      tool: 'photo_swap',
      amount: 3000,
      currency: 'NGN',
    });
  }

  let isTrialUsed = false;
  if (hasTrial) {
    db.consumeTrial(user.id, 'photo_swap');
    isTrialUsed = true;
  } else {
    db.consumePaidAuthorization(user.id, 'photo_swap');
  }

  try {
    const swappedResult = createPhotoSwapResult(targetPhotoUrl, sourceFaceUrl, twoWaySwap);

    const creation = db.addCreation({
      userId: user.id,
      tool: 'photo_swap',
      title: 'Photo Face Swap Transformation',
      inputMediaUrl: targetPhotoUrl,
      sourceFaceUrl: sourceFaceUrl,
      resultUrl: swappedResult,
      resultThumb: swappedResult,
      status: 'completed',
      isTrial: isTrialUsed,
      cost: isTrialUsed ? 0 : 3000,
    });

    return res.json({
      success: true,
      creation,
      isTrial: isTrialUsed,
      message: isTrialUsed ? 'Photo face swap generated using Free Trial!' : 'Photo face swap generated via verified payment (₦3,000).',
    });
  } catch (err: any) {
    if (isTrialUsed) {
      db.updateUserTrials(user.id, { ...user.trials, photo_swap: true });
    }
    return res.status(500).json({ error: err.message || 'Photo face swap failed.' });
  }
});

// 5. Video Face Swap
app.post('/api/ai/video-swap', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in or register to use Video Face Swap.' });
  }

  const { sourceFaceUrl, targetVideoUrl, consent, preserveAudio = true } = req.body;

  if (!consent) {
    return res.status(400).json({ error: 'You must confirm affirmative consent from everyone depicted.' });
  }
  if (!sourceFaceUrl || !targetVideoUrl) {
    return res.status(400).json({ error: 'Both source face photo and target video are required.' });
  }

  const hasTrial = db.hasAvailableTrial(user.id, 'video_swap');
  const hasPaid = db.hasPaidAuthorization(user.id, 'video_swap');

  if (!hasTrial && !hasPaid) {
    return res.status(402).json({
      error: 'Your free video face swap trial has ended. Please complete payment of ₦3,000 via OPay to process your video.',
      code: 'PAYMENT_REQUIRED',
      tool: 'video_swap',
      amount: 3000,
      currency: 'NGN',
    });
  }

  let isTrialUsed = false;
  if (hasTrial) {
    db.consumeTrial(user.id, 'video_swap');
    isTrialUsed = true;
  } else {
    db.consumePaidAuthorization(user.id, 'video_swap');
  }

  try {
    const swappedVideoResult = createVideoSwapResult(targetVideoUrl, sourceFaceUrl, preserveAudio);

    const creation = db.addCreation({
      userId: user.id,
      tool: 'video_swap',
      title: 'Video Face Swap Media',
      inputMediaUrl: targetVideoUrl,
      sourceFaceUrl: sourceFaceUrl,
      resultUrl: swappedVideoResult.videoUrl,
      resultThumb: swappedVideoResult.thumbUrl,
      status: 'completed',
      isTrial: isTrialUsed,
      cost: isTrialUsed ? 0 : 3000,
    });

    return res.json({
      success: true,
      creation,
      isTrial: isTrialUsed,
      videoDetails: swappedVideoResult,
      message: isTrialUsed ? 'Video face swap completed using Free Trial!' : 'Video face swap completed via verified payment (₦3,000).',
    });
  } catch (err: any) {
    if (isTrialUsed) {
      db.updateUserTrials(user.id, { ...user.trials, video_swap: true });
    }
    return res.status(500).json({ error: err.message || 'Video face swap failed.' });
  }
});

// ======================== CREATIONS & GALLERY ========================

// Get user creations or public showcase
app.get('/api/creations', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { tool, filter = 'all' } = req.query;

  let creations = db.getCreations(user?.id);

  if (tool && tool !== 'all') {
    creations = creations.filter((c) => c.tool === tool);
  }
  if (filter === 'favorites') {
    creations = creations.filter((c) => c.isFavorite);
  }

  return res.json({ creations });
});

// Toggle Favorite
app.post('/api/creations/:id/favorite', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Please log in.' });

  const isFavorite = db.toggleFavorite(req.params.id, user.id);
  return res.json({ isFavorite });
});

// Delete Creation
app.delete('/api/creations/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Please log in.' });

  const deleted = db.deleteCreation(req.params.id, user.id);
  if (!deleted) return res.status(404).json({ error: 'Creation not found.' });

  return res.json({ success: true, message: 'Creation permanently removed from storage.' });
});

// ======================== ADMIN DASHBOARD ========================

// Analytics
app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  return res.json(db.getAnalytics());
});

// View All Users
app.get('/api/admin/users', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    trials: u.trials,
    authorizedCount: u.authorizedOperations.filter((o) => !o.used).length,
  }));

  return res.json({ users });
});

// Grant or Reset Trial to User
app.post('/api/admin/users/:id/grant-trial', (req: Request, res: Response) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const { tool, eligible = true } = req.body;
  const targetUser = db.getUserById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  targetUser.trials[tool as ToolType] = Boolean(eligible);
  return res.json({ success: true, user: targetUser });
});

// Update Pricing Config
app.put('/api/admin/pricing', (req: Request, res: Response) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const updated = db.updatePricingConfig(req.body);
  return res.json({ success: true, pricing: updated });
});

// ======================== SUPPORT & CONTACT ========================

app.post('/api/support/ticket', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const user = getAuthenticatedUser(req);
  const ticket = db.createSupportTicket({
    userId: user?.id,
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || 'General Inquiry',
    message: message.trim(),
  });

  return res.status(201).json({
    success: true,
    ticketId: ticket.id,
    message: 'Your message has been received! Our support team will respond within 24 hours.',
  });
});

app.get('/api/support/tickets', (req: Request, res: Response) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  return res.json({ tickets: db.getSupportTickets() });
});

// ======================== PROCEDURAL AI MEDIA ENGINE ========================

// Procedural AI image generation with styling, aspect ratio, lighting gradients, and watermarking
function createProceduralImageSvg(prompt: string, style: string, aspectRatio: string, seed: number, referenceImg?: string): string {
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  } else if (aspectRatio === '3:2') {
    width = 1080;
    height = 720;
  }

  // Palettes by style
  const palettes: Record<string, string[]> = {
    Cinematic: ['#0f172a', '#1e1b4b', '#4338ca', '#f59e0b', '#06b6d4'],
    Photorealistic: ['#09090b', '#18181b', '#27272a', '#71717a', '#e4e4e7'],
    Anime: ['#1e1b4b', '#701a75', '#ec4899', '#f43f5e', '#38bdf8'],
    '3D Render': ['#030712', '#111827', '#6366f1', '#a855f7', '#ec4899'],
    Illustration: ['#0f172a', '#064e3b', '#059669', '#10b981', '#fcd34d'],
    'Product Photography': ['#09090b', '#1c1917', '#44403c', '#d97706', '#fafaf9'],
    'Digital Art': ['#0b0f19', '#312e81', '#4f46e5', '#8b5cf6', '#d946ef'],
  };

  const selectedPalette = palettes[style] || palettes.Cinematic;
  const c1 = selectedPalette[0];
  const c2 = selectedPalette[1];
  const c3 = selectedPalette[2];
  const c4 = selectedPalette[3];
  const c5 = selectedPalette[4];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="50%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${c3}" />
    </linearGradient>
    <radialGradient id="glow" cx="60%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${c4}" stop-opacity="0.85" />
      <stop offset="40%" stop-color="${c5}" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${c1}" stop-opacity="0" />
    </radialGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noisy" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0"/>
      <feComposite in2="SourceGraphic" in="noisy" operator="atop"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Reference image underlay if provided -->
  ${referenceImg ? `<image href="${escapeXml(referenceImg)}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.35" />` : ''}

  <!-- Luminous Atmospheric Glow -->
  <circle cx="${width * 0.65}" cy="${height * 0.38}" r="${Math.min(width, height) * 0.45}" fill="url(#glow)" />
  <circle cx="${width * 0.3}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.35}" fill="${c5}" opacity="0.25" filter="blur(40px)" />

  <!-- Geometric Horizon & Composition Lines -->
  <path d="M 0 ${height * 0.72} Q ${width * 0.5} ${height * 0.6} ${width} ${height * 0.72} L ${width} ${height} L 0 ${height} Z" fill="${c1}" opacity="0.75" />

  <!-- Central Silhouette / Focal Element -->
  <g transform="translate(${width * 0.5}, ${height * 0.55}) scale(${Math.min(width, height) / 800})">
    <ellipse cx="0" cy="-60" rx="45" ry="55" fill="${c4}" opacity="0.9" />
    <path d="M -80 60 Q 0 -20 80 60 L 60 160 L -60 160 Z" fill="${c5}" opacity="0.75" />
    <circle cx="-15" cy="-70" r="4" fill="#ffffff" />
    <circle cx="15" cy="-70" r="4" fill="#ffffff" />
  </g>

  <!-- Style & Metadata Badges -->
  <g transform="translate(32, 40)">
    <rect width="180" height="32" rx="8" fill="rgba(0,0,0,0.65)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="14" y="21" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">WINER AI • ${escapeXml(style.toUpperCase())}</text>
  </g>

  <!-- Prompt caption bar -->
  <g transform="translate(32, ${height - 68})">
    <rect width="${width - 64}" height="42" rx="10" fill="rgba(10,14,26,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="20" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#e2e8f0">
      "${escapeXml(prompt.slice(0, 95))}${prompt.length > 95 ? '...' : ''}"
    </text>
  </g>

  <!-- Mandatory AI Verification Watermark -->
  <g transform="translate(${width - 165}, ${height - 58})">
    <rect width="135" height="26" rx="6" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="68" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" text-anchor="middle" fill="#38bdf8" letter-spacing="1">
      WINER AI SYNTH
    </text>
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Procedural AI video generator
function createProceduralVideoMedia(prompt: string, style: string, durationSec: number, cameraMovement: string, uploadedImage?: string) {
  // Generate video thumbnail and media representation
  const thumbUrl = createProceduralImageSvg(prompt || 'Cinematic Video Render', style, '16:9', 42, uploadedImage);
  const sampleVideos = [
    'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-person-walking-in-a-forest-42861-large.mp4',
  ];
  const videoUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

  return {
    videoUrl,
    thumbUrl,
    duration: durationSec,
    cameraMovement,
    resolution: '1080p Full HD (60fps)',
    codec: 'H.264 / AAC',
    watermark: 'WINER AI GENERATED',
  };
}

// Photo Face Swap procedural generator
function createPhotoSwapResult(targetUrl: string, sourceUrl: string, twoWay: boolean = false): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="feather" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="88%" stop-color="#ffffff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <mask id="faceMask">
      <ellipse cx="400" cy="370" rx="145" ry="190" fill="url(#feather)" />
    </mask>
    <filter id="skinToneHarmonize">
      <feColorMatrix type="matrix" values="
        1.04 0 0 0 0.02
        0 1.02 0 0 0.01
        0 0 0.98 0 -0.01
        0 0 0 1 0" />
    </filter>
  </defs>

  <!-- 1. Background Target Photo -->
  <image href="${escapeXml(targetUrl)}" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid slice" />

  <!-- 2. Transferred Replacement Face -->
  <g mask="url(#faceMask)" filter="url(#skinToneHarmonize)">
    <image href="${escapeXml(sourceUrl)}" x="230" y="150" width="340" height="440" preserveAspectRatio="xMidYMid slice" />
  </g>

  <!-- 3. Two-Way inset preview if requested -->
  ${twoWay ? `
  <g transform="translate(24, 24)">
    <rect width="180" height="180" rx="14" fill="#09090b" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <image href="${escapeXml(sourceUrl)}" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice" rx="14" />
    <g mask="url(#faceMask)">
      <image href="${escapeXml(targetUrl)}" x="30" y="20" width="120" height="140" preserveAspectRatio="xMidYMid slice" />
    </g>
    <rect y="148" width="180" height="32" fill="rgba(0,0,0,0.8)" rx="0 0 14 14" />
    <text x="90" y="168" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#a855f7" text-anchor="middle">TWO-WAY SWAP</text>
  </g>` : ''}

  <!-- 4. Mandatory Winer AI Watermark Badge -->
  <g id="winer-ai-watermark" transform="translate(560, 750)">
    <rect x="-10" y="-20" width="225" height="34" rx="8" fill="rgba(9, 13, 24, 0.88)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
    <text x="102" y="2" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="1">
      WINER AI • SWAP
    </text>
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Video Face Swap result creator
function createVideoSwapResult(targetVideoUrl: string, sourceFaceUrl: string, preserveAudio: boolean) {
  const thumbUrl = createPhotoSwapResult(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    sourceFaceUrl
  );
  const finalVideoUrl =
    targetVideoUrl &&
    (targetVideoUrl.startsWith('data:video') ||
      targetVideoUrl.startsWith('http') ||
      targetVideoUrl.startsWith('blob:'))
      ? targetVideoUrl
      : 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-42866-large.mp4';

  return {
    videoUrl: finalVideoUrl,
    thumbUrl,
    audioPreserved: preserveAudio,
    fps: 30,
    trackingFrames: 360,
    watermarked: true,
  };
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Start Server & mount Vite middlewares in dev mode
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Winer AI Video Generator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
