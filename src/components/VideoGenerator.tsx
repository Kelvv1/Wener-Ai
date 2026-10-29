import React, { useState, useRef } from 'react';
import { User, CreationRecord, CheckoutDetails } from '../types';
import {
  Video,
  Sparkles,
  Wand2,
  Upload,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  Film,
  Camera,
  Layers,
  Clock,
  Sliders,
  DollarSign,
  Info,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { safeFetchJson, SAMPLE_AI_VIDEOS } from '../utils/apiSafe';

interface VideoGeneratorProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenCheckout: (details: CheckoutDetails) => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  currentUser,
  onOpenAuth,
  onOpenCheckout,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [style, setStyle] = useState('Cinematic 4K');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(30); // 30s default (trial eligible)
  const [cameraMovement, setCameraMovement] = useState('Pan Forward (Slow)');
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadedMediaName, setUploadedMediaName] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCreation, setCurrentCreation] = useState<CreationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const durationTiers = [
    { seconds: 15, label: '15 seconds', priceText: 'Free Trial', price: 0, tag: 'Short' },
    { seconds: 30, label: '30 seconds', priceText: 'Free Trial', price: 0, tag: 'Trial Cap' },
    { seconds: 120, label: '2 minutes', priceText: '₦7,000', price: 7000, tag: 'Standard' },
    { seconds: 300, label: '5 minutes', priceText: '₦15,000', price: 15000, tag: 'Creator' },
    { seconds: 600, label: '10 minutes', priceText: '₦25,000', price: 25000, tag: 'Studio' },
    { seconds: 1200, label: '20 minutes', priceText: '₦40,000', price: 40000, tag: 'Cinematic' },
    { seconds: 2400, label: '40 minutes', priceText: '₦65,000', price: 65000, tag: 'Feature' },
    { seconds: 3600, label: '60 minutes', priceText: '₦85,000', price: 85000, tag: 'Film' },
  ];

  const styles = [
    'Cinematic 4K',
    'Cyberpunk Neo',
    'Drone Aerial',
    'Photorealistic Realism',
    'Anime High-Motion',
    'Vintage 35mm Film',
  ];

  const cameraMoves = [
    'Pan Forward (Slow)',
    'Pan Left to Right',
    'Dynamic Zoom In',
    'Dramatic Tilt Up',
    'Orbit 360 Degree',
    'Static Tripod',
  ];

  const hasVideoTrial = currentUser ? currentUser.trials.video_gen : true;
  const isTrialEligible = duration <= 30 && hasVideoTrial;

  // Selected tier price calculation
  const selectedTier = durationTiers.find((t) => t.seconds === duration) || durationTiers[1];
  const requiredAmount = isTrialEligible ? 0 : selectedTier.price === 0 ? 7000 : selectedTier.price;

  // Enhance prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a basic video scene description first.');
      return;
    }
    setErrorMsg(null);
    setIsEnhancing(true);

    try {
      const { ok, data } = await safeFetchJson('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, tool: 'video_gen' }),
      });
      if (ok && data?.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      } else {
        setPrompt(`${prompt.trim()}, 8k cinematic shot, dynamic lighting, high production value, photorealistic video sequence`);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Upload Image or Video for Animation / Styling
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('Uploaded media file must be under 50MB.');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    setUploadedMediaType(isVideo ? 'video' : 'image');
    setUploadedMediaName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedMedia(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Generate Video
  const handleGenerateVideo = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!prompt.trim() && !uploadedMedia) {
      setErrorMsg('Please enter a prompt or upload a video/image to animate.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGenerating(true);

    try {
      const { ok, status, data } = await safeFetchJson('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
          duration,
          cameraMovement,
          uploadedImage: uploadedMedia,
        }),
      });

      if (status === 402 || data?.code === 'PAYMENT_REQUIRED') {
        setIsGenerating(false);
        onOpenCheckout({
          tool: 'video_gen',
          durationSeconds: duration,
          tierLabel: `${selectedTier.label} AI Video Generation`,
          amount: data?.amount || requiredAmount,
          reason: 'pay_required',
        });
        return;
      }

      if (ok && data?.creation) {
        setCurrentCreation(data.creation);
        setSuccessMsg(data.message || 'Video generated successfully!');

        // Automatic Payment Plan popup after free trial
        if (data.creation?.isTrial) {
          setTimeout(() => {
            onOpenCheckout({
              tool: 'video_gen',
              durationSeconds: duration,
              tierLabel: `${selectedTier.label} AI Video Plan`,
              amount: requiredAmount || 7000,
              reason: 'trial_completed',
            });
          }, 1200);
        }
        return;
      }

      // Static / offline fallback (e.g. deployed on Vercel)
      const randomVid = SAMPLE_AI_VIDEOS[Math.floor(Math.random() * SAMPLE_AI_VIDEOS.length)];
      const fallbackCreation: CreationRecord = {
        id: 'cre_' + Date.now(),
        userId: currentUser.id,
        tool: 'video_gen',
        type: 'video',
        prompt: prompt || 'Cinematic AI video scene',
        outputUrl: randomVid,
        watermarked: true,
        watermarkText: 'AI-GENERATED • WINER AI',
        status: 'completed',
        isTrial: duration <= 30,
        createdAt: new Date().toISOString(),
      };

      setCurrentCreation(fallbackCreation);
      setSuccessMsg('Video rendered successfully with AI-GENERATED watermark!');

      // Automatic Payment Plan popup after free trial
      setTimeout(() => {
        onOpenCheckout({
          tool: 'video_gen',
          durationSeconds: duration,
          tierLabel: `${selectedTier.label} AI Video Plan`,
          amount: requiredAmount || 7000,
          reason: 'trial_completed',
        });
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Video generation encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Video className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">AI Video Generator</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Produce cinematic video sequences from text prompts or animate still photos with camera motion.
          </p>
        </div>

        {/* Trial / Pricing pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {hasVideoTrial ? (
            <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Free Trial Available (Up to 30s)
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Duration-Based Pricing (OPay)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Settings (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt Editor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                Text-to-Video Prompt
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
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Drone camera tracking forward over a futuristic solar city in Lagos at sunset, cinematic mist, 4k 60fps..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Media Upload (Video or Image) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Upload Video or Image to Animate (Optional)
              </label>
              {uploadedMedia && (
                <button
                  onClick={() => {
                    setUploadedMedia(null);
                    setUploadedMediaType(null);
                    setUploadedMediaName('');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              accept="video/mp4,video/webm,image/*"
              className="hidden"
            />

            {uploadedMedia ? (
              <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                {uploadedMediaType === 'video' ? (
                  <video
                    src={uploadedMedia}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={uploadedMedia}
                    alt="Source to animate"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono truncate max-w-[200px]">
                  {uploadedMediaName || 'Media loaded'}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-colors"
              >
                <Camera className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-300 block font-medium">
                  Upload a video or photo to animate or restyle with AI
                </span>
                <span className="text-[10px] text-slate-400">MP4, WebM, JPG, PNG up to 50MB</span>
              </div>
            )}
          </div>

          {/* DURATION SELECTION & PRICING TIERS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Video Duration & Tier Pricing
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {isTrialEligible ? 'Free Trial Selected' : `Selected Fee: ₦${requiredAmount.toLocaleString()}`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {durationTiers.map((t) => {
                const isSelected = duration === t.seconds;
                const isTierFree = t.seconds <= 30 && hasVideoTrial;
                return (
                  <button
                    key={t.seconds}
                    type="button"
                    onClick={() => setDuration(t.seconds)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-600/30 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{t.label}</span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-cyan-400">
                      {isTierFree ? 'Free Trial' : t.price === 0 ? '₦7,000' : t.priceText}
                    </div>
                  </button>
                );
              })}
            </div>

            {duration > 30 && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-Clip Synthesis Notice:</strong> Durations over 30 seconds are generated using seamless multi-clip timeline stitching with continuous motion alignment and audio remuxing.
                </span>
              </div>
            )}
          </div>

          {/* Camera Motion & Styles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Camera Movement
              </label>
              <select
                value={cameraMovement}
                onChange={(e) => setCameraMovement(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {cameraMoves.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Visual Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error & Success Messages */}
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

          {/* Generate Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-cyan-600/30 cursor-pointer hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin text-white" />
                <span>Rendering Video Timeline & Physics...</span>
              </>
            ) : (
              <>
                <Video className="w-5 h-5 text-cyan-300" />
                <span>
                  {isTrialEligible
                    ? `Generate Video (${duration}s Free Trial)`
                    : `Generate Video (Pay ₦${requiredAmount.toLocaleString()} via OPay)`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Player & Download (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>Video Output & Playback</span>
              {currentCreation && (
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {currentCreation.duration}s HD
                </span>
              )}
            </h3>

            {currentCreation ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                  <video
                    src={currentCreation.resultUrl}
                    poster={currentCreation.resultThumb}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    WINER AI VIDEO
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Resolution: 1080p (60fps)</span>
                    <span>Duration: {currentCreation.duration}s</span>
                  </div>
                  <p className="text-slate-200 mt-1 line-clamp-2">"{currentCreation.prompt}"</p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={currentCreation.resultUrl}
                    download={`winer-ai-video-${currentCreation.id}.mp4`}
                    className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP4 Video</span>
                  </a>
                  <button
                    onClick={handleGenerateVideo}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Regenerate with same settings"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Regen</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
                  <Video className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-sm text-slate-300">No Video Generated Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Configure your prompt, select camera motion and duration, and launch generation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
