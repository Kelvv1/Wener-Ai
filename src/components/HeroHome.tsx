import React, { useState } from 'react';
import { ActiveView } from '../types';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  UserCheck,
  Film,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  HelpCircle,
  Clock,
  ChevronDown,
  Layers,
  Camera,
  Download,
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface HeroHomeProps {
  onSelectTool: (tool: ActiveView) => void;
  onOpenAuth: () => void;
}

export const HeroHome: React.FC<HeroHomeProps> = ({ onSelectTool, onOpenAuth }) => {
  const [selectedDurationTab, setSelectedDurationTab] = useState(30);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Video pricing duration tiers as specified in Section 8
  const pricingTiers = [
    { label: 'Up to 30 seconds', duration: 30, priceText: 'One Free Trial Only', price: 0, tag: 'Free Trial' },
    { label: 'Over 30s to 2 mins', duration: 120, priceText: '₦7,000', price: 7000, tag: 'Standard' },
    { label: 'Over 2m to 5 mins', duration: 300, priceText: '₦15,000', price: 15000, tag: 'Creator' },
    { label: 'Over 5m to 10 mins', duration: 600, priceText: '₦25,000', price: 25000, tag: 'Pro Studio' },
    { label: 'Over 10m to 20 mins', duration: 1200, priceText: '₦40,000', price: 40000, tag: 'Cinematic' },
    { label: 'Over 20m to 40 mins', duration: 2400, priceText: '₦65,000', price: 65000, tag: 'Feature Length' },
    { label: 'Over 40m to 60 mins', duration: 3600, priceText: '₦85,000', price: 85000, tag: 'Master Film' },
  ];

  const faqs = [
    {
      q: 'How does the Winer AI Free Trial system work?',
      a: 'Every new user gets four independent one-time free trials: 1 free AI image generation, 1 free AI video generation (up to 30 seconds duration), 1 free photo face swap, and 1 free video face swap. Once you use a trial for a tool, you can continue creating via our pay-per-use Nigerian Naira (NGN) model.',
    },
    {
      q: 'How do I pay in Nigerian Naira (NGN) using OPay?',
      a: 'We accept manual bank transfers via OPay (Account Name: Ajibola Mubarak, Account Number: 9063296466). When checking out, transfer the exact fee via your OPay app or bank app/USSD, and submit your transaction reference. Our administrators verify transfers promptly to authorize your operation.',
    },
    {
      q: 'Can I upload my own face and video files?',
      a: 'Yes! Winer AI supports uploading any clear front-facing portrait from your phone gallery or computer, along with your target photo or video (MP4/WebM). We do not restrict you to preset faces.',
    },
    {
      q: 'What happens if an AI generation fails due to a system error?',
      a: 'If a generation experiences a confirmed technical or model failure, your free trial is never deducted. For paid operations, you receive an automatic retry or credit authorization so you are never charged twice.',
    },
    {
      q: 'Can Winer AI generate longer videos up to 60 minutes?',
      a: 'Yes. For extended durations exceeding standard 30-second model limits, Winer AI utilizes sequential multi-clip generation and timeline stitching with audio synchronization to deliver your requested duration reliably.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-5xl mx-auto space-y-6">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Next-Generation AI Creative Studio • Nigerian Naira (NGN)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Main Headline & Supporting copy */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Turn Your Imagination <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Into Reality.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Create stunning AI images, generate cinematic videos, and transform photos with powerful AI
          face-swapping tools—all in one place.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Start Free Trial</span>
          </button>

          <button
            onClick={() => onSelectTool('video_gen')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-base transition-all flex items-center justify-center gap-2 hover:border-slate-500 cursor-pointer"
          >
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Explore AI Tools</span>
          </button>
        </div>

        {/* Free trial highlight banner */}
        <div className="pt-2 text-xs sm:text-sm text-slate-400 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            1 Free Trial for Each Tool
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Up to 30s Video Free
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            OPay Bank Transfer Supported
          </span>
        </div>
      </section>

      {/* ================= 4 MAIN PROMINENT TOOLS ================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Core AI Creative Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose a workspace to launch your creative flow with full controls, prompt enhancement, and download options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tool 1: AI Image Generator */}
          <div
            onClick={() => onSelectTool('image_gen')}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">AI Image Generator</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    1 Free Trial
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate photorealistic, anime, 3D render, and cinematic art from text or reference images with prompt enhancement.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Launch Studio (₦3,000/op after)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 2: AI Video Generator */}
          <div
            onClick={() => onSelectTool('video_gen')}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-cyan-500/80 rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-xl hover:shadow-cyan-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-md">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">AI Video Generator</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    30s Free
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Turn text prompts or photos into high-definition cinematic videos with dynamic camera pans, zooms, and custom durations.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
              <span>Launch Video Gen (Up to 60m)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 3: Photo Face Swap */}
          <div
            onClick={() => onSelectTool('photo_swap')}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-purple-500/80 rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-xl hover:shadow-purple-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Photo Face Swap</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    1 Free Trial
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Replace faces in any photo naturally with lighting, skin-tone matching, and optional two-way swap comparison.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
              <span>Swap Photo Faces (₦3,000/op)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 4: Video Face Swap */}
          <div
            onClick={() => onSelectTool('video_swap')}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-pink-500/80 rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-xl hover:shadow-pink-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-md">
                <Film className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Video Face Swap</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    1 Free Trial
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Replace a face throughout an entire video clip while preserving body movement, camera motion, and original audio.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-pink-400 group-hover:text-pink-300">
              <span>Swap Video Face (₦3,000/op)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE SHOWCASE GALLERY ================= */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 font-mono">
              Live Interactive Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Sample Media & Face Swap Comparison
            </h2>
          </div>
          <button
            onClick={() => onSelectTool('photo_swap')}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-2 self-start"
          >
            <span>Try Face Swap Yourself</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Interactive Before & After Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Photo Face Swap: Renaissance Painting + Modern Portrait
              </span>
              <span>Slide horizontally to inspect</span>
            </div>
            <BeforeAfterSlider
              beforeUrl="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"
              afterUrl="https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80"
            />
          </div>

          {/* AI Video Preview Showcase */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80"
                alt="Cyberpunk AI Video Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold w-fit mb-2">
                  CINEMATIC AI VIDEO • 1080P
                </span>
                <h4 className="font-bold text-white text-base sm:text-lg">
                  "Neon Cyberpunk Rain in Neo-Lagos at Night"
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  Generated from text prompt using Winer AI's camera tracking and fluid lighting physics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Frame Rate</span>
                <strong className="text-white text-xs font-mono">60 FPS Ultra-Smooth</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Max Duration</span>
                <strong className="text-white text-xs font-mono">Up to 60 Mins</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Free Trial</span>
                <strong className="text-cyan-400 text-xs font-mono">30s Included</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW WINER AI WORKS ================= */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
            Streamlined Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How Winer AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From imagination to final downloadable MP4 or high-resolution PNG in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="font-bold text-white text-base">Select Your Tool & Prompt</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick Image Generator, Video Generator, or Face Swap. Enter your idea or use our <strong>AI Prompt Enhancer</strong> to add cinematic lighting and lenses.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-mono font-bold flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="font-bold text-white text-base">Instant Free Trial or OPay Checkout</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              New creators use their <strong>1-time free trial</strong> immediately. For continued creations, pay seamlessly in Nigerian Naira (NGN) via OPay manual bank transfer.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-mono font-bold flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="font-bold text-white text-base">Preview, Compare & Download</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Watch your video render or inspect your swapped photo with our split-screen comparison slider. Download in full 1080p resolution anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ================= VIDEO PRICING TABLE ================= */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 font-mono">
            Transparent Nigerian Naira (NGN) Rates
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Video Generation Pricing Table
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Choose your desired video length. The first 30 seconds are 100% free for new creators.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.duration}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                tier.price === 0
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-600/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">{tier.tag}</span>
                  {tier.price === 0 && (
                    <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Included
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-sm">{tier.label}</h4>
                <div className="text-2xl font-black text-white font-mono">
                  {tier.priceText}
                </div>
                <p className="text-[11px] text-slate-400">
                  {tier.price === 0
                    ? 'Available once per eligible user account.'
                    : `Verified OPay transfer to Ajibola Mubarak (9063296466).`}
                </p>
              </div>

              <button
                onClick={() => onSelectTool('video_gen')}
                className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tier.price === 0
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {tier.price === 0 ? 'Use Free Trial' : `Select ${tier.priceText}`}
              </button>
            </div>
          ))}
        </div>

        {/* Other Tools Rate Summary Callout */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <strong className="text-white block font-semibold">
              Additional Tools Pricing (After 1-Time Free Trial):
            </strong>
            <p className="text-slate-400">
              • AI Image Generator: <strong>₦3,000</strong> per operation • Photo Face Swap: <strong>₦3,000</strong> • Video Face Swap: <strong>₦3,000</strong>
            </p>
          </div>
          <button
            onClick={() => onSelectTool('pricing')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold shrink-0"
          >
            Full Pricing Breakdown
          </button>
        </div>
      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need to know about trials, OPay payments, and AI capabilities.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="bg-gradient-to-r from-violet-950/60 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Ready to Create Your First AI Masterpiece?
        </h2>
        <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Sign up today to claim your four free trials across AI Images, Videos, and Face Swaps.
          Fast, photorealistic, and mobile-friendly.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
        >
          Claim Your Free Trials Now
        </button>
      </section>
    </div>
  );
};
