import React, { useState } from 'react';
import { ActiveView, User } from '../types';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  UserCheck,
  Film,
  CreditCard,
  Phone,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  LogIn,
  Menu,
  X,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickCheckout: (tool: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate remaining free trials
  const remainingTrialsCount = currentUser
    ? Object.values(currentUser.trials).filter(Boolean).length
    : 4;

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-black text-xl bg-gradient-to-tr from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  W
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                  WINER<span className="text-indigo-400">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Video Gen
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                AI Video & Face Swap Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => navigateTo('image_gen')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'image_gen'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>AI Images</span>
            </button>

            <button
              onClick={() => navigateTo('video_gen')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'video_gen'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>AI Videos</span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-mono">
                30s Free
              </span>
            </button>

            <button
              onClick={() => navigateTo('photo_swap')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'photo_swap'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Photo Swap</span>
            </button>

            <button
              onClick={() => navigateTo('video_swap')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'video_swap'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Film className="w-4 h-4 text-pink-400" />
              <span>Video Swap</span>
            </button>

            <button
              onClick={() => navigateTo('pricing')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'pricing'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pricing (NGN)</span>
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'contact'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Contact</span>
            </button>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Free Trial Badge */}
            <div
              onClick={() => navigateTo('dashboard')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-xs cursor-pointer hover:bg-slate-800 transition-colors"
              title="Click to view remaining free trials in Dashboard"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-slate-300 font-medium">Free Trials:</span>
              <span className="font-bold text-amber-400 font-mono">
                {remainingTrialsCount}/4
              </span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => navigateTo('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      activeView === 'admin'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2 ${
                    activeView === 'dashboard'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                  title={currentUser.email}
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover bg-slate-800"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title={`Log out from ${currentUser.email}`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                  <span className="hidden sm:inline">Google Sign In</span>
                  <span className="sm:hidden">Google</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2">
            <span className="text-xs text-slate-400 font-medium">Free Trials Remaining</span>
            <span className="text-xs font-bold text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {remainingTrialsCount} of 4 Available
            </span>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigateTo('image_gen')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>AI Image Generator (1 Free Trial)</span>
          </button>
          <button
            onClick={() => navigateTo('video_gen')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <Video className="w-4 h-4 text-cyan-400" />
            <span>AI Video Generator (30s Free Trial)</span>
          </button>
          <button
            onClick={() => navigateTo('photo_swap')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Photo Face Swap (1 Free Trial)</span>
          </button>
          <button
            onClick={() => navigateTo('video_swap')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <Film className="w-4 h-4 text-pink-400" />
            <span>Video Face Swap (1 Free Trial)</span>
          </button>
          <button
            onClick={() => navigateTo('pricing')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Video Pricing & OPay Info</span>
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>My Creations & Dashboard</span>
          </button>
          <button
            onClick={() => navigateTo('contact')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-3"
          >
            <Phone className="w-4 h-4 text-slate-400" />
            <span>Contact & Support</span>
          </button>
        </div>
      )}
    </header>
  );
};
