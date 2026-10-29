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

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');

  // Load user session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('winer_user_id');
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data.user) setCurrentUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('winer_user_id');
        });
    } else {
      // Auto-load demo user by default so the user is immediately authenticated with 4 trials ready!
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'creator@winerai.com', password: 'password123' }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('winer_user_id', data.token);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('winer_user_id', token);
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
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onQuickCheckout={handleOpenCheckout}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'home' && (
          <HeroHome
            onSelectTool={(tool) => setActiveView(tool)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeView === 'image_gen' && (
          <ImageGenerator
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'video_gen' && (
          <VideoGenerator
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'photo_swap' && (
          <PhotoFaceSwap
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'video_swap' && (
          <VideoFaceSwap
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {activeView === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            onNavigateTool={(tool) => setActiveView(tool)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeView === 'pricing' && (
          <PricingPage
            onOpenCheckout={handleOpenCheckout}
            onOpenAuth={() => setAuthModalOpen(true)}
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
