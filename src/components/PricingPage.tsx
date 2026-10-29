import React, { useState } from 'react';
import { CheckoutDetails, ToolType } from '../types';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  HelpCircle,
  ArrowRight,
  Video,
  Image as ImageIcon,
  UserCheck,
  Film,
} from 'lucide-react';

interface PricingPageProps {
  onOpenCheckout: (details: CheckoutDetails) => void;
  onOpenAuth: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenCheckout, onOpenAuth }) => {
  const [selectedVideoDuration, setSelectedVideoDuration] = useState(120);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const videoTiers = [
    { label: 'Up to 30 seconds', maxSeconds: 30, priceText: 'One Free Trial Only', price: 0, tag: 'Free Trial', desc: 'Claimable once per verified account.' },
    { label: 'Over 30 seconds to 2 minutes', maxSeconds: 120, priceText: '₦7,000', price: 7000, tag: 'Standard', desc: 'Ideal for social media reels & ads.' },
    { label: 'Over 2 minutes to 5 minutes', maxSeconds: 300, priceText: '₦15,000', price: 15000, tag: 'Creator', desc: 'Explainer videos & promotional trailers.' },
    { label: 'Over 5 minutes to 10 minutes', maxSeconds: 600, priceText: '₦25,000', price: 25000, tag: 'Studio', desc: 'Deep-dive documentaries & music clips.' },
    { label: 'Over 10 minutes to 20 minutes', maxSeconds: 1200, priceText: '₦40,000', price: 40000, tag: 'Cinematic', desc: 'Short-film productions & corporate videos.' },
    { label: 'Over 20 minutes to 40 minutes', maxSeconds: 2400, priceText: '₦65,000', price: 65000, tag: 'Feature', desc: 'Extended presentations & narratives.' },
    { label: 'Over 40 minutes to 60 minutes', maxSeconds: 3600, priceText: '₦85,000', price: 85000, tag: 'Master Film', desc: 'Full broadcast & documentary episodes.' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('9063296466');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="space-y-16 max-w-6xl mx-auto py-4">
      {/* Pricing Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <CreditCard className="w-4 h-4" />
          <span>Transparent Nigerian Naira (NGN) Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Simple, Predictable Pay-Per-Use Rates
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Start with our generous <strong>one-time free trials</strong> for all four AI tools. Afterwards, pay strictly for what you generate with zero monthly subscription lock-ins.
        </p>
      </div>

      {/* Free Trial Summary Card */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-amber-400 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-amber-400" />
              Four Independent One-Time Free Trials
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Every New User Enjoys 4 Free Operations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-200">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="block text-indigo-400">1 Image Gen</strong>
                <span className="text-[10px] text-slate-400">Any Style or Ratio</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="block text-cyan-400">1 Video Gen</strong>
                <span className="text-[10px] text-slate-400">Up to 30 Seconds</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="block text-purple-400">1 Photo Swap</strong>
                <span className="text-[10px] text-slate-400">High-Res Blending</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="block text-pink-400">1 Video Swap</strong>
                <span className="text-[10px] text-slate-400">Full Audio Preserved</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shrink-0 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start md:self-auto"
          >
            Claim Free Trials
          </button>
        </div>
      </div>

      {/* SECTION 8: VIDEO DURATION PRICING TABLE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Video Generation Duration Tiers</h2>
            <p className="text-xs text-slate-400">Enforced by backend duration calculation</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">1080p HD • 60 FPS • Multi-Clip Stitching</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videoTiers.map((tier) => (
            <div
              key={tier.maxSeconds}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-xl ${
                tier.price === 0
                  ? 'bg-slate-900 border-indigo-500/50 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold">{tier.tag}</span>
                  {tier.price === 0 && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Free Trial
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-base">{tier.label}</h3>
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {tier.priceText}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.desc}</p>
              </div>

              <button
                onClick={() => {
                  if (tier.price === 0) {
                    onOpenAuth();
                  } else {
                    onOpenCheckout({
                      tool: 'video_gen',
                      durationSeconds: tier.maxSeconds,
                      tierLabel: `${tier.label} AI Video`,
                      amount: tier.price,
                    });
                  }
                }}
                className={`mt-6 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  tier.price === 0
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <span>{tier.price === 0 ? 'Start 30s Free' : `Authorize ${tier.priceText}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ADDITIONAL TOOLS PRICING: IMAGES & FACE SWAP */}
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Images & Face Swapping Operations</h2>
          <p className="text-xs text-slate-400">Fixed Nigerian Naira (NGN) rate per completed operation after free trial</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Gen */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">AI Image Operation</h3>
                <span className="text-xs text-slate-400">Text-to-Image & Variations</span>
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">₦3,000</div>
            <p className="text-xs text-slate-400">
              1 free trial eligible. Thereafter ₦3,000 per completed high-resolution image generation.
            </p>
            <button
              onClick={() =>
                onOpenCheckout({
                  tool: 'image_gen',
                  tierLabel: 'AI Image Generation',
                  amount: 3000,
                })
              }
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Order Image (₦3,000)
            </button>
          </div>

          {/* Photo Swap */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Photo Face Swap</h3>
                <span className="text-xs text-slate-400">Single & Two-Way Swaps</span>
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">₦3,000</div>
            <p className="text-xs text-slate-400">
              1 free trial eligible. Thereafter ₦3,000 per completed face-swapping transformation.
            </p>
            <button
              onClick={() =>
                onOpenCheckout({
                  tool: 'photo_swap',
                  tierLabel: 'Photo Face Swap',
                  amount: 3000,
                })
              }
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Order Photo Swap (₦3,000)
            </button>
          </div>

          {/* Video Swap */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Video Face Swap</h3>
                <span className="text-xs text-slate-400">Frame-by-Frame Tracking</span>
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">₦3,000</div>
            <p className="text-xs text-slate-400">
              1 free trial eligible. Thereafter ₦3,000 per completed video face swap with audio preserved.
            </p>
            <button
              onClick={() =>
                onOpenCheckout({
                  tool: 'video_swap',
                  tierLabel: 'Video Face Swap',
                  amount: 3000,
                })
              }
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Order Video Swap (₦3,000)
            </button>
          </div>
        </div>
      </div>

      {/* OFFICIAL OPAY PAYMENT METHOD DETAILS */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base sm:text-lg">
            <CreditCard className="w-5 h-5" />
            <span>Official Manual Bank Transfer Details (OPay)</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
            Verified Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Payment Provider:</span>
            <strong className="text-base text-white font-bold block mt-1">OPay</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Account Name:</span>
            <strong className="text-base text-white font-bold block mt-1">Ajibola Mubarak</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Account Number:</span>
              <strong className="text-lg text-emerald-400 font-mono font-black block mt-1">
                9063296466
              </strong>
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Copy Account Number"
            >
              {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
