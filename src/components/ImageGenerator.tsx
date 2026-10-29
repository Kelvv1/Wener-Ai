import React, { useState, useRef } from 'react';
import { User, CreationRecord, CheckoutDetails } from '../types';
import {
  Sparkles,
  Wand2,
  Upload,
  Image as ImageIcon,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Heart,
  Sliders,
  DollarSign,
  Maximize2,
  Trash2,
  Layers,
} from 'lucide-react';

interface ImageGeneratorProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenCheckout: (details: CheckoutDetails) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  currentUser,
  onOpenAuth,
  onOpenCheckout,
}) => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCreation, setCurrentCreation] = useState<CreationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    'Cinematic',
    'Photorealistic',
    'Anime',
    '3D Render',
    'Illustration',
    'Product Photography',
    'Digital Art',
  ];

  const aspectRatios = [
    { label: '1:1 Square', value: '1:1', desc: 'Instagram / Profile' },
    { label: '16:9 Landscape', value: '16:9', desc: 'YouTube / Widescreen' },
    { label: '9:16 Portrait', value: '9:16', desc: 'TikTok / Story / Reel' },
    { label: '4:3 Standard', value: '4:3', desc: 'Desktop / Classic' },
    { label: '3:2 Photo', value: '3:2', desc: 'DSLR Print' },
  ];

  // User trial eligibility
  const hasFreeTrial = currentUser ? currentUser.trials.image_gen : true;

  // Handle Prompt Enhancement with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a basic prompt description first.');
      return;
    }
    setErrorMsg(null);
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, tool: 'image_gen' }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        setPrompt(data.enhancedPrompt);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Reference Image Upload
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Reference image must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Generate Image Request
  const handleGenerate = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!prompt.trim()) {
      setErrorMsg('Please provide a prompt description.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
          negativePrompt,
          referenceImage,
        }),
      });

      const data = await res.json();

      if (res.status === 402 || data.code === 'PAYMENT_REQUIRED') {
        // Trigger OPay payment modal for ₦3,000
        setIsGenerating(false);
        onOpenCheckout({
          tool: 'image_gen',
          tierLabel: 'AI Image Generation Plan',
          amount: 3000,
          reason: 'pay_required',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setCurrentCreation(data.creation);
      setSuccessMsg(data.message);

      // Automatic Payment Plan popup after free trial
      if (data.creation?.isTrial) {
        setTimeout(() => {
          onOpenCheckout({
            tool: 'image_gen',
            tierLabel: 'AI Image Generation Plan',
            amount: 3000,
            reason: 'trial_completed',
          });
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation encountered an error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Studio Header & Pricing pill */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">AI Image Generator</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transform text prompts or reference pictures into high-resolution photorealistic and artistic imagery.
          </p>
        </div>

        {/* Pricing state badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {hasFreeTrial ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              1 Free Trial Eligible
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              ₦3,000 per Operation (OPay)
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Prompt Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Text Prompt Description
              </label>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  isEnhancing
                    ? 'bg-purple-900/40 text-purple-300 border-purple-500/30'
                    : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer'
                }`}
                title="Use Gemini AI to enhance lighting, lenses, and composition"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A futuristic cyber-samurai standing in neon rain in Victoria Island, Lagos, photorealistic reflections, cinematic 8k..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />

            {/* Quick Inspiration Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Try:</span>
              {[
                'Afrofuturistic queen in golden armor',
                'Hypercar cruising coastal highway sunset',
                'Macro photograph of emerald robotic chameleon',
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Artistic Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {styles.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStyle(st)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    style === st
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    aspectRatio === ar.value
                      ? 'bg-indigo-600/30 text-white border-indigo-500'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{ar.label}</div>
                  <div className="text-[10px] text-slate-400">{ar.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image-to-Image Reference (Optional) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                Reference Image (Image-to-Image, Optional)
              </label>
              {referenceImage && (
                <button
                  onClick={() => setReferenceImage(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleReferenceUpload}
              accept="image/*"
              className="hidden"
            />

            {referenceImage ? (
              <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={referenceImage}
                  alt="Reference uploaded"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-300 block font-medium">
                  Click to upload a reference photo for structure guidance
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 10MB</span>
              </div>
            )}
          </div>

          {/* Negative Prompt (Collapsible) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <details className="group">
              <summary className="text-xs font-bold text-slate-400 cursor-pointer list-none flex items-center justify-between">
                <span>Advanced: Negative Prompt (Excluded Elements)</span>
                <span className="text-indigo-400 text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pt-3">
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blurry, low quality, artifacts, distorted hands, bad anatomy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </details>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Generate Button with Price Display */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-600/30 cursor-pointer hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin text-white" />
                <span>Synthesizing Image Neural Latents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>
                  {hasFreeTrial
                    ? 'Generate Image (Free Trial - ₦0)'
                    : 'Generate Image (Pay ₦3,000 via OPay)'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generation Result & History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>Result Output</span>
              {currentCreation && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              )}
            </h3>

            {currentCreation ? (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                  <img
                    src={currentCreation.resultUrl}
                    alt={currentCreation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/80 text-[10px] text-white font-mono font-bold tracking-wider border border-white/20">
                    WINER AI SYNTH
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-semibold">Prompt:</span>
                  <p className="text-xs text-slate-200 line-clamp-3">"{currentCreation.prompt}"</p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={currentCreation.resultUrl}
                    download={`winer-ai-image-${currentCreation.id}.png`}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </a>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Generate another variation"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Variation</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-sm text-slate-300">No Image Generated Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Enter your prompt on the left, pick your favorite artistic style, and click Generate to see your creation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
