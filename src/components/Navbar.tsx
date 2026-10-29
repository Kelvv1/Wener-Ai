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
                    <span className="hidden sm:inline">Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    activeView === 'dashboard'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Start Free Trial</span>
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
