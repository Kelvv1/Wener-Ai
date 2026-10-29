import React, { useState, useEffect } from 'react';
import { User, PaymentRecord, PricingConfig } from '../types';
import {
  ShieldAlert,
  Users,
  CreditCard,
  DollarSign,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  TrendingUp,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'pricing' | 'analytics'>('payments');
  const [analytics, setAnalytics] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});

  const fetchAdminData = () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setLoading(true);

    Promise.all([
      fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${currentUser.id}` } }).then((r) => r.json()),
      fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${currentUser.id}` } }).then((r) => r.json()),
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${currentUser.id}` } }).then((r) => r.json()),
      fetch('/api/pricing').then((r) => r.json()),
    ])
      .then(([analyticsData, paymentsData, usersData, pricingData]) => {
        setAnalytics(analyticsData);
        setPayments(paymentsData.payments || []);
        setUsers(usersData.users || []);
        setPricing(pricingData.pricing || null);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-24 space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          This portal is restricted to authorized platform administrators.
        </p>
      </div>
    );
  }

  // Verify or Reject Payment
  const handleVerifyPayment = async (paymentId: string, verified: boolean) => {
    try {
      const note = adminNoteInput[paymentId] || (verified ? 'Approved via OPay ledger' : 'Declined');
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({ verified, adminNotes: note }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset or grant free trial to a user
  const handleToggleUserTrial = async (userId: string, tool: string, currentEligible: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/grant-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({ tool, eligible: !currentEligible }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Winer AI Administration Hub</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              OPay manual bank transfer verification, trial management, and platform analytics
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 self-start"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics KPI Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium">Verified Revenue (NGN)</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₦{analytics.totalRevenueNGN.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">OPay Account: 9063296466</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium">Pending Transfers</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {analytics.pendingPaymentsCount}
            </div>
            <span className="text-[10px] text-slate-500">Requires verification</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium">Registered Creators</span>
            <div className="text-2xl font-black text-white font-mono">
              {analytics.usersCount}
            </div>
            <span className="text-[10px] text-slate-500">Active accounts</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium">Total Media Synthesized</span>
            <div className="text-2xl font-black text-indigo-400 font-mono">
              {analytics.creationsCount}
            </div>
            <span className="text-[10px] text-slate-500">Images, videos, swaps</span>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>OPay Payment Queue ({payments.filter((p) => p.status === 'pending_verification').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Trial Limits</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'pricing'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configure Pricing (NGN)</span>
        </button>
      </div>

      {/* TAB 1: OPAY PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">OPay Bank Transfer Verification</h3>
              <p className="text-xs text-slate-400">
                Review submitted transaction references and approve to authorize operations
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">Account: 9063296466 (Ajibola Mubarak)</span>
          </div>

          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm text-white font-bold">{p.durationLabel || p.tool}</strong>
                      <span className="font-black text-emerald-400 font-mono text-sm">
                        ₦{p.amount.toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>
                        Sender: <strong>{p.senderName}</strong> ({p.senderBank || 'OPay'})
                      </div>
                      <div>
                        User: {p.userName} ({p.userEmail})
                      </div>
                      <div className="sm:col-span-2 font-mono text-indigo-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                        Transaction Ref: <strong>{p.transactionRef}</strong>
                      </div>
                      {p.notes && (
                        <div className="sm:col-span-2 text-slate-400">Note: "{p.notes}"</div>
                      )}
                    </div>
                  </div>

                  {/* Actions for Pending Verification */}
                  {p.status === 'pending_verification' ? (
                    <div className="flex items-center gap-2 self-start lg:self-center">
                      <button
                        onClick={() => handleVerifyPayment(p.id, true)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Transfer</span>
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(p.id, false)}
                        className="px-3 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] text-slate-400">
                      <span>Verified: {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : 'Yes'}</span>
                      {p.adminNotes && <div className="text-slate-500">Note: {p.adminNotes}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-10 text-center">No payment records yet.</p>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT & TRIAL LIMITS */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-4">
            Registered Users & Free Trial Grants
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">AI Image Trial</th>
                  <th className="pb-3">AI Video Trial</th>
                  <th className="pb-3">Photo Swap Trial</th>
                  <th className="pb-3">Video Swap Trial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/40">
                    <td className="py-3 pr-4">
                      <strong className="text-white block">{u.name}</strong>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </td>
                    <td className="py-3 text-slate-300 capitalize">{u.role}</td>

                    {/* Image Trial Toggle */}
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleUserTrial(u.id, 'image_gen', u.trials.image_gen)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          u.trials.image_gen
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {u.trials.image_gen ? 'Eligible' : 'Used (Click to Reset)'}
                      </button>
                    </td>

                    {/* Video Trial Toggle */}
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleUserTrial(u.id, 'video_gen', u.trials.video_gen)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          u.trials.video_gen
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {u.trials.video_gen ? '30s Eligible' : 'Used (Click to Reset)'}
                      </button>
                    </td>

                    {/* Photo Swap Trial Toggle */}
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleUserTrial(u.id, 'photo_swap', u.trials.photo_swap)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          u.trials.photo_swap
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {u.trials.photo_swap ? 'Eligible' : 'Used (Click to Reset)'}
                      </button>
                    </td>

                    {/* Video Swap Trial Toggle */}
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleUserTrial(u.id, 'video_swap', u.trials.video_swap)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          u.trials.video_swap
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {u.trials.video_swap ? 'Eligible' : 'Used (Click to Reset)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING CONFIGURATION */}
      {activeTab === 'pricing' && pricing && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-base">Active Nigerian Naira (NGN) Pricing</h3>
            <p className="text-xs text-slate-400">Enforced by backend payment validation algorithms</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">AI Image Operation</span>
              <div className="text-xl font-bold font-mono text-white">₦{pricing.image_gen.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Post-trial rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Photo Face Swap</span>
              <div className="text-xl font-bold font-mono text-white">₦{pricing.photo_swap.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Post-trial rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Video Face Swap</span>
              <div className="text-xl font-bold font-mono text-white">₦{pricing.video_swap.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Post-trial rate</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Video Duration Tiers (Enforced on Checkout)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pricing.video_tiers.map((tier) => (
                <div key={tier.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white block">{tier.label}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Max: {tier.maxSeconds}s</span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">
                    {tier.isFreeTrial ? 'Free Trial' : `₦${tier.price.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
