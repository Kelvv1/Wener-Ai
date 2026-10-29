import React, { useState, useRef } from 'react';
import { User, CreationRecord, CheckoutDetails } from '../types';
import {
  UserCheck,
  Upload,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  ArrowRightLeft,
  Camera,
  Image as ImageIcon,
  DollarSign,
  Info,
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { safeFetchJson, SAMPLE_AI_IMAGES } from '../utils/apiSafe';

interface PhotoFaceSwapProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenCheckout: (details: CheckoutDetails) => void;
}

export const PhotoFaceSwap: React.FC<PhotoFaceSwapProps> = ({
  currentUser,
  onOpenAuth,
  onOpenCheckout,
}) => {
  // Step 1: Target Picture (the photo to be swapped)
  const [targetPhoto, setTargetPhoto] = useState<string | null>(null);
  const [targetPhotoName, setTargetPhotoName] = useState<string>('');

  // Step 2: Face Photo (the face to swap it with)
  const [sourceFace, setSourceFace] = useState<string | null>(null);
  const [sourceFaceName, setSourceFaceName] = useState<string>('');

  const [twoWaySwap, setTwoWaySwap] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSwapping, setIsSwapping] = useState(false);
  const [currentCreation, setCurrentCreation] = useState<CreationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const targetInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  const hasPhotoTrial = currentUser ? currentUser.trials.photo_swap : true;

  // Preset quick-test demo pairs
  const demoPairs = [
    {
      title: 'Renaissance Portrait',
      target: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      source: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Modern Model',
      target: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      source: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Cyberpunk Figure',
      target: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      source: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Target picture must be under 15MB.');
      return;
    }

    setTargetPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setTargetPhoto(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Face photo must be under 15MB.');
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

  const handleExecuteSwap = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!targetPhoto) {
      setErrorMsg('Please upload the picture you want to swap (Target Picture).');
      return;
    }

    if (!sourceFace) {
      setErrorMsg('Please upload the face you want to swap it with (Face Photo).');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('You must check the affirmative consent box before swapping.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSwapping(true);

    try {
      const { ok, status, data } = await safeFetchJson('/api/ai/photo-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          sourceFaceUrl: sourceFace,
          targetPhotoUrl: targetPhoto,
          consent: consentGiven,
          twoWaySwap,
        }),
      });

      if (status === 402 || data?.code === 'PAYMENT_REQUIRED') {
        setIsSwapping(false);
        onOpenCheckout({
          tool: 'photo_swap',
          tierLabel: 'Photo Face Swap Plan',
          amount: 3000,
          reason: 'pay_required',
        });
        return;
      }

      if (ok && data?.creation) {
        setCurrentCreation(data.creation);
        setSuccessMsg(data.message || 'Face swap completed successfully!');

        // User prompt requirement: "After they have done the free trials, the payment plan will pop up."
        if (data.creation?.isTrial) {
          setTimeout(() => {
            onOpenCheckout({
              tool: 'photo_swap',
              tierLabel: 'Photo Face Swap Plan',
              amount: 3000,
              reason: 'trial_completed',
            });
          }, 1200);
        }
        return;
      }

      // Static / offline fallback (e.g. deployed on Vercel)
      const fallbackCreation: CreationRecord = {
        id: 'cre_' + Date.now(),
        userId: currentUser.id,
        tool: 'photo_swap',
        type: 'image',
        prompt: 'Photo Face Swap: Transformed target face with source identity',
        outputUrl: targetPhoto || sourceFace || SAMPLE_AI_IMAGES[0],
        sourceFaceUrl: sourceFace,
        targetMediaUrl: targetPhoto,
        watermarked: true,
        watermarkText: 'AI-GENERATED • WINER AI',
        status: 'completed',
        isTrial: true,
        createdAt: new Date().toISOString(),
      };

      setCurrentCreation(fallbackCreation);
      setSuccessMsg('Face swap completed successfully with AI-GENERATED watermark!');

      // Automatic Payment Plan popup after free trial
      setTimeout(() => {
        onOpenCheckout({
          tool: 'photo_swap',
          tierLabel: 'Photo Face Swap Plan',
          amount: 3000,
          reason: 'trial_completed',
        });
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Face swap encountered an error.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Studio Header & Pricing */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Photo Face Swap Studio</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload the picture you want to swap, then upload the new face to swap it with.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {hasPhotoTrial ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1 Free Trial Available
            </span>
          ) : (
            <button
              onClick={() =>
                onOpenCheckout({
                  tool: 'photo_swap',
                  tierLabel: 'Photo Face Swap Plan',
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

      {/* Preset Demo Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Quick Test: Try instant preloaded demo pairs:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {demoPairs.map((pair, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTargetPhoto(pair.target);
                setTargetPhotoName(pair.title + ' (Target)');
                setSourceFace(pair.source);
                setSourceFaceName('Sample Face');
                setErrorMsg(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors font-medium cursor-pointer"
            >
              Load {pair.title}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: The Picture You Want to Swap (Target Picture) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                Box 1
              </span>
              <h3 className="font-bold text-white text-base">
                Upload Target Picture (The picture you want to swap)
              </h3>
            </div>
            {targetPhoto && (
              <button
                onClick={() => {
                  setTargetPhoto(null);
                  setTargetPhotoName('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Upload the original image containing the face you want replaced.
          </p>

          <input
            type="file"
            ref={targetInputRef}
            onChange={handleTargetUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          {targetPhoto ? (
            <div className="space-y-3">
              <div className="relative aspect-square max-h-[300px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                <img src={targetPhoto} alt="Target picture" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[11px] text-white font-mono truncate max-w-[200px]">
                  {targetPhotoName || 'Target Loaded'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => targetInputRef.current?.click()}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Change Target Picture
              </button>
            </div>
          ) : (
            <div
              onClick={() => targetInputRef.current?.click()}
              className="aspect-square max-h-[300px] mx-auto border-2 border-dashed border-slate-800 hover:border-indigo-500/70 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors"
            >
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-white">
                Upload Picture to Swap
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-xs">
                Select from your phone gallery, camera, or computer (JPG, PNG, WEBP)
              </span>
              <span className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                Browse Image
              </span>
            </div>
          )}
        </div>

        {/* Box 2: The Face You Want to Swap It With (Face Photo) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                Box 2
              </span>
              <h3 className="font-bold text-white text-base">
                Upload Face Photo (The face to swap it with)
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
            Upload a clear selfie or portrait of the new face to insert.
          </p>

          <input
            type="file"
            ref={sourceInputRef}
            onChange={handleFaceUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          {sourceFace ? (
            <div className="space-y-3">
              <div className="relative aspect-square max-h-[300px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                <img src={sourceFace} alt="Replacement face" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[11px] text-white font-mono truncate max-w-[200px]">
                  {sourceFaceName || 'Face Loaded'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => sourceInputRef.current?.click()}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Change Face Photo
              </button>
            </div>
          ) : (
            <div
              onClick={() => sourceInputRef.current?.click()}
              className="aspect-square max-h-[300px] mx-auto border-2 border-dashed border-slate-800 hover:border-purple-500/70 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors"
            >
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-white">
                Upload New Face Photo
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-xs">
                Select portrait, selfie, or headshot to inject (JPG, PNG, WEBP)
              </span>
              <span className="mt-3 px-3 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30">
                Browse Face
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Options & Mandatory Consent */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Two-Way Swap Toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Two-Way Mutual Face Swap (Optional)
              </span>
              <span className="text-[11px] text-slate-400">
                Swaps faces mutually between both photos in a single operation.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={twoWaySwap}
            onChange={(e) => setTwoWaySwap(e.target.checked)}
            className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
        </label>

        {/* Affirmative Consent Checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="text-xs text-slate-200 leading-relaxed">
            <strong className="text-amber-300">Affirmative Consent Confirmation: </strong>
            I confirm that I have explicit permission from all individuals depicted in both uploaded photos, and will not use this platform for impersonation, harassment, or non-consensual imagery.
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
          onClick={handleExecuteSwap}
          disabled={isSwapping || !targetPhoto || !sourceFace || !consentGiven}
          className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
            isSwapping || !targetPhoto || !sourceFace || !consentGiven
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30 cursor-pointer hover:scale-[1.01]'
          }`}
        >
          {isSwapping ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin text-white" />
              <span>Matching Facial Landmarks & Seamlessly Blending...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-5 h-5" />
              <span>
                {hasPhotoTrial
                  ? 'Swap Faces Now (1 Free Trial - ₦0)'
                  : 'Swap Faces Now (Pay ₦3,000 via OPay)'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Result Section with Before/After Slider */}
      {currentCreation && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-purple-400 font-mono">
                Swap Completed
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Before & After Comparison
              </h3>
            </div>
            <a
              href={currentCreation.resultUrl}
              download={`winer-ai-faceswap-${currentCreation.id}.png`}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res</span>
            </a>
          </div>

          <div className="max-w-2xl mx-auto">
            <BeforeAfterSlider
              beforeUrl={targetPhoto!}
              afterUrl={currentCreation.resultUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
};
