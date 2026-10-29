import React, { useState, useRef } from 'react';
import { User, CreationRecord, CheckoutDetails } from '../types';
import {
  Film,
  Upload,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  DollarSign,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  Video,
  Camera,
  FileVideo,
} from 'lucide-react';

interface VideoFaceSwapProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenCheckout: (details: CheckoutDetails) => void;
}

export const VideoFaceSwap: React.FC<VideoFaceSwapProps> = ({
  currentUser,
  onOpenAuth,
  onOpenCheckout,
}) => {
  // Box 1: Target Video (Video Only)
  const [targetVideo, setTargetVideo] = useState<string | null>(null);
  const [targetVideoName, setTargetVideoName] = useState<string>('');
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);

  // Box 2: Face Photo (The replacement face)
  const [sourceFace, setSourceFace] = useState<string | null>(null);
  const [sourceFaceName, setSourceFaceName] = useState<string>('');

  const [preserveAudio, setPreserveAudio] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSwapping, setIsSwapping] = useState(false);
  const [currentCreation, setCurrentCreation] = useState<CreationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  const hasVideoSwapTrial = currentUser ? currentUser.trials.video_swap : true;

  // Pre-loaded sample demo video for testing without waiting for video upload
  const loadSampleVideo = () => {
    setTargetVideo('https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4');
    setTargetVideoName('Sample Studio Motion Clip.mp4');
    setSourceFace('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80');
    setSourceFaceName('Sample Face (Ajibola)');
    setErrorMsg(null);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Invalid file format. Please upload a video file (.mp4, .mov, .webm).');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setErrorMsg('Target video must be less than 80MB.');
      return;
    }

    setTargetVideoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setTargetVideo(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file format. Please upload an image (.jpg, .png, .webp).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Face photo must be less than 15MB.');
      return;
    }

    setSourceFaceName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSourceFace(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteVideoSwap = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!targetVideo) {
      setErrorMsg('Please upload the video you want to swap (Video Only).');
      return;
    }

    if (!sourceFace) {
      setErrorMsg('Please upload the face photo you want to swap into the video.');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('You must check affirmative consent before proceeding.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSwapping(true);

    try {
      const res = await fetch('/api/ai/video-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          sourceFaceUrl: sourceFace,
          targetVideoUrl: targetVideo,
          consent: consentGiven,
          preserveAudio,
        }),
      });

      const data = await res.json();

      if (res.status === 402 || data.code === 'PAYMENT_REQUIRED') {
        setIsSwapping(false);
        onOpenCheckout({
          tool: 'video_swap',
          tierLabel: 'Video Face Swap Plan',
          amount: 3000,
          reason: 'pay_required',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process video face swap');
      }

      setCurrentCreation(data.creation);
      setSuccessMsg(data.message || 'Video face swap completed successfully!');

      // User prompt requirement: "After they have done the free trials, the payment plan will pop up."
      if (data.creation?.isTrial) {
        setTimeout(() => {
          onOpenCheckout({
            tool: 'video_swap',
            tierLabel: 'Video Face Swap Plan',
            amount: 3000,
            reason: 'trial_completed',
          });
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Video face swap encountered an error.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Pricing */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Film className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Video Face Swap Studio</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload your target video (Video only) and replace the face across all frames with your photo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {hasVideoSwapTrial ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1 Free Trial Available
            </span>
          ) : (
            <button
              onClick={() =>
                onOpenCheckout({
                  tool: 'video_swap',
                  tierLabel: 'Video Face Swap Plan',
                  amount: 3000,
                  reason: 'manual',
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              ₦3,000 per Operation (OPay)
            </button>
          )}
        </div>
      </div>

      {/* Quick Demo Loader */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Test immediately with a preloaded sample video:
        </span>
        <button
          type="button"
          onClick={loadSampleVideo}
          className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors font-medium self-start cursor-pointer"
        >
          Load Demo Video & Face Pair
        </button>
      </div>

      {/* Dual Upload Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Target Video (Video Only) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-pink-400 uppercase font-bold tracking-wider">
                Box 1 • Video Only
              </span>
              <h3 className="font-bold text-white text-base">
                Upload Target Video (The video to swap)
              </h3>
            </div>
            {targetVideo && (
              <button
                onClick={() => {
                  setTargetVideo(null);
                  setTargetVideoName('');
                  setVideoDurationSec(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Upload the video file containing the face you want replaced (.mp4, .mov, .webm).
          </p>

          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoUpload}
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
            className="hidden"
          />

          {targetVideo ? (
            <div className="space-y-3">
              <div className="relative aspect-video max-h-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                <video
                  src={targetVideo}
                  controls
                  playsInline
                  onLoadedMetadata={(e) => {
                    const dur = Math.round((e.target as HTMLVideoElement).duration);
                    if (dur) setVideoDurationSec(dur);
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/85 text-[11px] text-white font-mono truncate max-w-[240px] pointer-events-none">
                  {targetVideoName || 'Uploaded Video'}
                  {videoDurationSec ? ` • ${videoDurationSec}s` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Change Target Video File
              </button>
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="aspect-video max-h-[280px] mx-auto border-2 border-dashed border-slate-800 hover:border-pink-500/70 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors"
            >
              <div className="p-3.5 rounded-2xl bg-pink-500/10 text-pink-400 mb-3">
                <FileVideo className="w-8 h-8" />
              </div>
              <span className="text-sm font-semibold text-white">
                Upload Video File
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-xs">
                Select MP4, MOV, or WebM video from your phone or laptop (Video Only)
              </span>
              <span className="mt-3 px-3.5 py-1.5 rounded-xl bg-pink-600/30 text-pink-300 text-xs font-bold border border-pink-500/30">
                Browse Video
              </span>
            </div>
          )}
        </div>

        {/* Box 2: Source Face Photo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                Box 2
              </span>
              <h3 className="font-bold text-white text-base">
                Upload Face Photo (The replacement face)
              </h3>
            </div>
            {sourceFace && (
              <button
                onClick={() => {
                  setSourceFace(null);
                  setSourceFaceName('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Clear portrait or selfie of the new face you want to place into the video.
          </p>

          <input
            type="file"
            ref={faceInputRef}
            onChange={handleFaceUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          {sourceFace ? (
            <div className="space-y-3">
              <div className="relative aspect-video max-h-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                <img src={sourceFace} alt="Source face" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[11px] text-white font-mono truncate max-w-[200px]">
                  {sourceFaceName || 'Face Loaded'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => faceInputRef.current?.click()}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Change Face Photo
              </button>
            </div>
          ) : (
            <div
              onClick={() => faceInputRef.current?.click()}
              className="aspect-video max-h-[280px] mx-auto border-2 border-dashed border-slate-800 hover:border-purple-500/70 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors"
            >
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-sm font-semibold text-white">
                Upload New Face Photo
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-xs">
                Select headshot or selfie (JPG, PNG, WEBP)
              </span>
              <span className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30">
                Browse Face Photo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Options & Consent */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Audio Preservation Toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div className="flex items-center gap-3">
            {preserveAudio ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Preserve Original Audio Stream
              </span>
              <span className="text-[11px] text-slate-400">
                Copies and syncs the original dialogue, sound effects, and music into the swapped video.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={preserveAudio}
            onChange={(e) => setPreserveAudio(e.target.checked)}
            className="h-4 w-4 rounded text-pink-600 focus:ring-pink-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
        </label>

        {/* Affirmative Consent */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-pink-600 focus:ring-pink-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="text-xs text-slate-200 leading-relaxed">
            <strong className="text-amber-300">Affirmative Consent Confirmation: </strong>
            I confirm that I have explicit permission from all individuals appearing in the uploaded video and face photo. I will not use this platform for deceptive impersonation, harassment, or non-consensual imagery.
          </div>
        </label>

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

        <button
          onClick={handleExecuteVideoSwap}
          disabled={isSwapping || !sourceFace || !targetVideo || !consentGiven}
          className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
            isSwapping || !sourceFace || !targetVideo || !consentGiven
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-pink-600/30 cursor-pointer hover:scale-[1.01]'
          }`}
        >
          {isSwapping ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin text-white" />
              <span>Tracking Facial Movement Across Frames & Rendering Video...</span>
            </>
          ) : (
            <>
              <Film className="w-5 h-5" />
              <span>
                {hasVideoSwapTrial
                  ? 'Swap Video Face Now (1 Free Trial - ₦0)'
                  : 'Swap Video Face Now (Pay ₦3,000 via OPay)'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Completed Video Result */}
      {currentCreation && (
        <div className="bg-slate-900 border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-pink-400 font-mono">
                Video Render Completed
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Swapped Video Playback
              </h3>
            </div>
            <a
              href={currentCreation.resultUrl}
              download={`winer-ai-videoswap-${currentCreation.id}.mp4`}
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>
          </div>

          <div className="relative aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            <video
              src={currentCreation.resultUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/80 text-[10px] text-white font-mono font-bold tracking-wider border border-white/20">
              WINER AI SWAP
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
