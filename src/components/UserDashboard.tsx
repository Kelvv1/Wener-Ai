import React, { useState, useEffect } from 'react';
import { User, CreationRecord, PaymentRecord, ActiveView } from '../types';
import {
  LayoutDashboard,
  Sparkles,
  Video,
  Image as ImageIcon,
  UserCheck,
  Film,
  FolderHeart,
  Receipt,
  Settings,
  HelpCircle,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User | null;
  onNavigateTool: (tool: ActiveView) => void;
  onOpenAuth: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onNavigateTool,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'creations' | 'payments' | 'settings'>('overview');
  const [creations, setCreations] = useState<CreationRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedCreation, setSelectedCreation] = useState<CreationRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    // Fetch user creations
    fetch('/api/creations', {
      headers: { Authorization: `Bearer ${currentUser.id}` },
    })
      .then((res) => res.json())
      .then((data) => setCreations(data.creations || []))
      .catch((e) => console.error(e));

    // Fetch user payments
    fetch('/api/payments/my', {
      headers: { Authorization: `Bearer ${currentUser.id}` },
    })
      .then((res) => res.json())
      .then((data) => setPayments(data.payments || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Please Sign In to Access Your Dashboard</h2>
        <p className="text-slate-400 text-sm">Track your free trials, creations gallery, and payment history.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleDeleteCreation = async (id: string) => {
    try {
      await fetch(`/api/creations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser.id}` },
      });
      setCreations(creations.filter((c) => c.id !== id));
      if (selectedCreation?.id === id) setSelectedCreation(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-400 font-mono tracking-wider">
            Creator Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {currentUser.email} • Member since {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        {/* Free Trials Pill Matrix */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-slate-300 font-medium">Free Trials Remaining:</span>
            <span className="font-bold font-mono text-amber-400">
              {Object.values(currentUser.trials).filter(Boolean).length} of 4
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Navigation (3 Cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 space-y-1 shadow-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('creations')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'creations'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderHeart className="w-4 h-4" />
                <span>My Creations</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-300">
                {creations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'payments'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4" />
                <span>Payment History</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-300">
                {payments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Quick Tool Launchers in Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2 shadow-xl">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block px-2">
              Launch Creative Tools
            </span>
            <button
              onClick={() => onNavigateTool('image_gen')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Image Generator</span>
            </button>
            <button
              onClick={() => onNavigateTool('video_gen')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Video Generator</span>
            </button>
            <button
              onClick={() => onNavigateTool('photo_swap')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Photo Face Swap</span>
            </button>
            <button
              onClick={() => onNavigateTool('video_swap')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 transition-colors"
            >
              <Film className="w-3.5 h-3.5 text-pink-400" />
              <span>Video Face Swap</span>
            </button>
          </div>
        </div>

        {/* Right Content Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Free Trial Status Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        currentUser.trials.image_gen
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentUser.trials.image_gen ? '1 Free' : 'Used'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">AI Images</h4>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.trials.image_gen ? 'Ready to use' : '₦3,000 / op'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        currentUser.trials.video_gen
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentUser.trials.video_gen ? '30s Free' : 'Used'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">AI Videos</h4>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.trials.video_gen ? 'Up to 30s' : 'From ₦7,000'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        currentUser.trials.photo_swap
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentUser.trials.photo_swap ? '1 Free' : 'Used'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Photo Swap</h4>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.trials.photo_swap ? 'Ready to use' : '₦3,000 / op'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <Film className="w-4 h-4 text-pink-400" />
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        currentUser.trials.video_swap
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentUser.trials.video_swap ? '1 Free' : 'Used'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Video Swap</h4>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.trials.video_swap ? 'Ready to use' : '₦3,000 / op'}
                  </p>
                </div>
              </div>

              {/* Recent Creations Showcase */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Recent Creations</h3>
                  <button
                    onClick={() => setActiveTab('creations')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>View All ({creations.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {creations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {creations.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCreation(c)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer"
                      >
                        <img
                          src={c.resultThumb || c.resultUrl}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                          <span className="text-[10px] font-bold text-white truncate">{c.title}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-mono">{c.tool}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No creations yet. Launch a tool to start creating!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY CREATIONS GALLERY */}
          {activeTab === 'creations' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-bold text-white text-lg">My Creations Gallery</h3>
                <span className="text-xs text-slate-400 font-mono">{creations.length} items</span>
              </div>

              {creations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {creations.map((c) => (
                    <div
                      key={c.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between"
                    >
                      <img
                        src={c.resultThumb || c.resultUrl}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteCreation(c.id)}
                            className="p-1 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600 transition-colors"
                            title="Delete creation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-white block truncate">{c.title}</span>
                          <a
                            href={c.resultUrl}
                            download={`winer-ai-${c.id}.png`}
                            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-2">
                  <FolderHeart className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-300">Your gallery is empty</h4>
                  <p className="text-xs text-slate-500">Generate an image or video to save creations here.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENT HISTORY */}
          {activeTab === 'payments' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">OPay Transfer History</h3>
                  <p className="text-xs text-slate-400">All submitted transactions and verification records</p>
                </div>
                <span className="text-xs font-mono text-emerald-400">OPay • Ajibola Mubarak</span>
              </div>

              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold">{p.durationLabel || p.tool}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'verified'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : p.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {p.status === 'verified'
                              ? 'Verified'
                              : p.status === 'rejected'
                              ? 'Rejected'
                              : 'Awaiting Verification'}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          Ref: <span className="text-slate-300">{p.transactionRef}</span> • Sender: {p.senderName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Submitted on {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-emerald-400 block">
                          ₦{p.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">via OPay (9063296466)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-2">
                  <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-300">No payment records found</h4>
                  <p className="text-xs text-slate-500">Your submitted OPay bank transfers will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-4">
                Account & Privacy Settings
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Full Name</span>
                  <div className="text-white font-medium">{currentUser.name}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Email Address</span>
                  <div className="text-white font-medium">{currentUser.email}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Account Role</span>
                  <div className="text-white font-medium capitalize">{currentUser.role}</div>
                </div>

                {/* Privacy & Zero Retention */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Privacy & Data Sovereignty Guarantee</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    You have full sovereignty over your personal facial images and videos. Uploads are strictly used for your authorized generation operations and never shared or sold. You can purge all media instantly via the My Creations tab.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
