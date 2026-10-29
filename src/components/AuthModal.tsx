import React, { useState } from 'react';
import { User, ActiveView } from '../types';
import {
  Sparkles,
  Mail,
  User as UserIcon,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string, targetTool?: ActiveView) => void;
  targetTool?: ActiveView;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  targetTool = 'video_gen',
}) => {
  const [name, setName] = useState('Destiny Ebaluegbefo');
  const [email, setEmail] = useState('ebaluegbefodestiny@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Google 1-Click Login
  const handleGoogleSignIn = async (userEmail?: string, userName?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const targetEmail = (userEmail || email || 'ebaluegbefodestiny@gmail.com').trim().toLowerCase();
    const targetName = userName || (name.trim() ? name.trim() : 'Destiny Ebaluegbefo');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(targetEmail)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      setSuccessMsg(`Success! Taking you to the studio...`);
      setTimeout(() => {
        onAuthSuccess(data.user, data.token, targetTool);
        onClose();
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Put your name and email -> Takes you directly to the next page!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const targetEmail = email.trim() || 'ebaluegbefodestiny@gmail.com';
    const targetName = name.trim() || 'Destiny Ebaluegbefo';

    try {
      const res = await fetch('/api/auth/easy-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setSuccessMsg(`Welcome, ${data.user.name}! Redirecting to studio...`);
      setTimeout(() => {
        onAuthSuccess(data.user, data.token, targetTool);
        onClose();
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-base font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Access • 4 Free AI Trials</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            Start Winer AI
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Put your <span className="text-white font-semibold">name and email</span> below. As soon as you click Start, it will immediately carry you to the studio!
          </p>
        </div>

        {/* 1-Click Google Sign-In */}
        <div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleGoogleSignIn()}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.87c2.27-2.09 3.675-5.17 3.675-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.04c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.13C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.25c-.25-.72-.38-1.49-.38-2.25 0-.76.13-1.53.38-2.25V6.62H1.24C.45 8.19 0 9.99 0 12s.45 3.81 1.24 5.38l4.03-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.24 6.62l4.03 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>Continue with Google (Destiny Ebaluegbefo)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] font-mono uppercase text-slate-400">
            or enter your name and email
          </span>
          <div className="border-t border-slate-800 w-full"></div>
        </div>

        {/* Form: Name & Email only */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Your Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Destiny Ebaluegbefo"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Your Email Address</span>
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ebaluegbefodestiny@gmail.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <span>Connecting to Studio...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Start Feature & Continue to Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 leading-normal">
          No password needed. Includes 4 one-time free trials (AI Images, Videos, Photo Face Swap, Video Face Swap).
        </p>
      </div>
    </div>
  );
};
