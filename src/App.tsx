import React, { useState, useEffect } from 'react';
import { ActiveView, User, CheckoutDetails } from './types';
import { Navbar } from './components/Navbar';
import { HeroHome } from './components/HeroHome';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { PhotoFaceSwap } from './components/PhotoFaceSwap';
import { VideoFaceSwap } from './components/VideoFaceSwap';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PricingPage } from './components/PricingPage';
import { ContactUs } from './components/ContactUs';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';
import { Footer } from './components/Footer';

import { safeFetchJson } from './utils/apiSafe';

const DEFAULT_USER: User = {
  id: 'usr_destiny',
  name: 'Destiny Ebaluegbefo',
  email: 'ebaluegbefodestiny@gmail.com',
  avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
  role: 'user',
  trials: {
    image_gen: true,
    video_gen: true,
    photo_swap: true,
    video_swap: true,
  },
  authorizedOperations: [],
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('winer_user_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER;
  });

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetToolAfterAuth, setTargetToolAfterAuth] = useState<ActiveView>('video_gen');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');

  // Sync user session on mount
  useEffect(() => {
    // Ensure default user is in local storage
    if (!localStorage.getItem('winer_user_data')) {
      localStorage.setItem('winer_user_data', JSON.stringify(currentUser));
      localStorage.setItem('winer_user_id', currentUser.id);
    }

    const syncWithBackend = async () => {
      const savedToken = localStorage.getItem('winer_user_id') || currentUser.id;
      const { ok, data } = await safeFetchJson('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      if (ok && data?.user) {
        setCurrentUser(data.user);
        localStorage.setItem('winer_user_data', JSON.stringify(data.user));
        return;
      }

      // If /api/auth/me failed (e.g. on static Vercel), try registering or keep local
      const googleRes = await safeFetchJson('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
        }),
      });

      if (googleRes.ok && googleRes.data?.user) {
        setCurrentUser(googleRes.data.user);
        localStorage.setItem('winer_user_data', JSON.stringify(googleRes.data.user));
        localStorage.setItem('winer_user_id', googleRes.data.token || googleRes.data.user.id);
      }
    };

    syncWithBackend();
  }, []);

  const handleOpenAuth = (tool: ActiveView = 'video_gen') => {
    setTargetToolAfterAuth(tool);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User, token: string, destinationTool?: ActiveView) => {
    setCurrentUser(user);
    localStorage.setItem('winer_user_data', JSON.stringify(user));
    localStorage.setItem('winer_user_id', token);
    setAuthModalOpen(false);
    // TAKE USER DIRECTLY TO THE TARGET TOOL PAGE!
    const destination = destinationTool || targetToolAfterAuth || 'video_gen';
    setActiveView(destination);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('winer_user_id');
    setActiveView('home');
  };

  const handleOpenCheckout = (details: CheckoutDetails) => {
    setCheckoutDetails(details);
    setCheckoutModalOpen(true);
  };

  const handlePaymentSubmitted = () => {
    // Refresh user trials and active authorizations
    if (currentUser) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentUser.id}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    }
  };

  const handleOpenLegal = (type: 'terms' | 'privacy') => {
    setLegalType(type);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('video_gen')}
        onLogout={handleLogout}
        onQuickCheckout={handleOpenCheckout}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'home' && (
          <HeroHome
            currentUser={currentUser}
            onSelectTool={(tool) => setActiveView(tool)}
            onOpenAuth={(tool) => handleOpenAuth(tool || 'video_gen')}
          />
        )}

        {activeView === 'image_gen' && (
          <ImageGenerator
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('image_gen')}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'video_gen' && (
          <VideoGenerator
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('video_gen')}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'photo_swap' && (
          <PhotoFaceSwap
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('photo_swap')}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'video_swap' && (
          <VideoFaceSwap
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('video_swap')}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            onNavigateTool={(tool) => setActiveView(tool)}
            onOpenAuth={() => handleOpenAuth('video_gen')}
          />
        )}

        {activeView === 'pricing' && (
          <PricingPage
            onOpenCheckout={handleOpenCheckout}
            onOpenAuth={() => handleOpenAuth('video_gen')}
          />
        )}

        {activeView === 'contact' && <ContactUs />}

        {activeView === 'admin' && <AdminDashboard currentUser={currentUser} />}
      </main>

      {/* Global Modals */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        details={checkoutDetails}
        currentUser={currentUser}
        onPaymentSubmitted={handlePaymentSubmitted}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        targetTool={targetToolAfterAuth}
      />

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalType}
      />

      {/* Footer */}
      <Footer onNavigate={(view) => setActiveView(view)} onOpenLegal={handleOpenLegal} />
    </div>
  );
}
