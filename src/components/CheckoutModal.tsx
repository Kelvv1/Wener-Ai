import React, { useState, useEffect } from 'react';
import { User, CheckoutDetails, ToolType } from '../types';
import {
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Zap,
  Phone,
  MessageCircle,
  ExternalLink,
  Layers,
  Film,
  Camera,
  UserCheck,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: CheckoutDetails | null;
  currentUser: User | null;
  onPaymentSubmitted: () => void;
}

interface PlanOption {
  tool: ToolType;
  durationSeconds?: number;
  label: string;
  category: string;
  price: number;
}

const ALL_PLANS: PlanOption[] = [
  { tool: 'image_gen', label: 'AI Image Generation', category: 'Single Operation', price: 3000 },
  { tool: 'photo_swap', label: 'Photo Face Swap', category: 'Single Operation', price: 3000 },
  { tool: 'video_swap', label: 'Video Face Swap', category: 'Single Operation', price: 3000 },
  { tool: 'video_gen', durationSeconds: 120, label: 'AI Video (Up to 2 Mins)', category: 'Video Duration', price: 7000 },
  { tool: 'video_gen', durationSeconds: 300, label: 'AI Video (2 to 5 Mins)', category: 'Video Duration', price: 15000 },
  { tool: 'video_gen', durationSeconds: 600, label: 'AI Video (5 to 10 Mins)', category: 'Video Duration', price: 25000 },
  { tool: 'video_gen', durationSeconds: 1200, label: 'AI Video (10 to 20 Mins)', category: 'Video Duration', price: 40000 },
  { tool: 'video_gen', durationSeconds: 2400, label: 'AI Video (20 to 40 Mins)', category: 'Video Duration', price: 65000 },
  { tool: 'video_gen', durationSeconds: 3600, label: 'AI Video (40 to 60 Mins)', category: 'Video Duration', price: 85000 },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  details,
  currentUser,
  onPaymentSubmitted,
}) => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('photo_swap');
  const [selectedDuration, setSelectedDuration] = useState<number | undefined>(undefined);
  const [selectedAmount, setSelectedAmount] = useState<number>(3000);
  const [selectedLabel, setSelectedLabel] = useState<string>('Photo Face Swap');

  const [transactionRef, setTransactionRef] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('OPay');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever details change
  useEffect(() => {
    if (details) {
      setSelectedTool(details.tool);
      setSelectedDuration(details.durationSeconds);
      setSelectedAmount(details.amount);
      setSelectedLabel(details.tierLabel || details.tool);
      setSubmittedSuccess(false);
      setErrorMsg(null);
    }
  }, [details]);

  useEffect(() => {
    if (currentUser?.name && !senderName) {
      setSenderName(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen || !details) return null;

  const isTrialFinishedNotice = details.reason === 'trial_completed';

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedTool(plan.tool);
    setSelectedDuration(plan.durationSeconds);
    setSelectedAmount(plan.price);
    setSelectedLabel(plan.label);
    setErrorMsg(null);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('9063296466');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!transactionRef.trim()) {
      setErrorMsg('Please enter your OPay transfer transaction reference number.');
      return;
    }
    if (!senderName.trim()) {
      setErrorMsg('Please enter the sender name appearing on your bank transfer.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          tool: selectedTool,
          durationSeconds: selectedDuration,
          transactionRef,
          senderName,
          senderBank,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment submission failed');
      }

      setSubmittedSuccess(true);
      onPaymentSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant simulation verification for testing/demo evaluation
  const handleSimulateInstantVerify = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const testRef = 'DEMO-OPAY-' + Math.floor(100000 + Math.random() * 900000);
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          tool: selectedTool,
          durationSeconds: selectedDuration,
          transactionRef: testRef,
          senderName: currentUser.name,
          senderBank: 'OPay App (Instant Demo)',
          notes: 'Auto-verified evaluation transaction',
        }),
      });

      const data = await res.json();
      if (data.payment) {
        await fetch(`/api/admin/payments/${data.payment.id}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'admin_1',
          },
          body: JSON.stringify({
            verified: true,
            adminNotes: 'Instant reviewer verification mode',
          }),
        });

        setSubmittedSuccess(true);
        onPaymentSubmitted();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Simulation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Winer AI Payment Plan</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OPay NGN
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose your creative plan & authorize directly via OPay bank transfer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Free Trial Completed Banner */}
        {isTrialFinishedNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-cyan-900/40 border border-purple-500/30 text-xs sm:text-sm text-purple-200 flex items-start gap-3 shadow-lg">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">
                🎉 You've Completed Your Free Trial!
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your creation was generated! To keep generating unlimited videos, images, and face swaps, select a plan below and complete payment via OPay.
              </p>
            </div>
          </div>
        )}

        {submittedSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Payment Reference Submitted!</h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Your OPay payment reference has been recorded for <strong className="text-white">{selectedLabel}</strong> (₦{selectedAmount.toLocaleString()}).
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Account Activated & Operation Authorized</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Start Creating Now
              </button>
              <a
                href="https://wa.me/234906396466"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Instant Support</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="space-y-5">
            {/* Interactive Plan Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Select Payment Plan
                </label>
                <span className="text-xs text-slate-400">Click to switch plans</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ALL_PLANS.slice(0, 3).map((plan) => {
                  const isSelected = selectedTool === plan.tool && !selectedDuration;
                  return (
                    <button
                      key={plan.tool}
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white truncate">{plan.label}</div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
                        ₦{plan.price.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Video Duration Tiers dropdown / buttons */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                  AI Video Generation Duration Plans:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_PLANS.slice(3).map((plan) => {
                    const isSelected =
                      selectedTool === 'video_gen' && selectedDuration === plan.durationSeconds;
                    return (
                      <button
                        key={plan.durationSeconds}
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">{plan.label}</div>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold">
                          ₦{plan.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Total Amount Due Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Selected Order:</span>
                <strong className="text-sm text-white font-bold">{selectedLabel}</strong>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Due:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₦{selectedAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Official OPay Bank Details Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  Official Winer AI Payment Account (OPay)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Instant Transfer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Account Name:</span>
                  <strong className="text-sm text-white font-bold block mt-0.5">
                    Ajibola Mubarak
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Account Number:</span>
                    <strong className="text-base text-emerald-400 font-mono font-black tracking-wider block mt-0.5">
                      9063296466
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transfer exactly <strong className="text-white">₦{selectedAmount.toLocaleString()}</strong> via OPay app or any Nigerian bank app/USSD code to the account above. Then enter your transaction reference below.
              </p>
            </div>

            {/* Reference Submission Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Transaction Reference Number / Session ID *
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. OPAY-TRX-123456789 or 100004938294829"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sender Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Full name on sender account"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sender Bank (Optional)
                  </label>
                  <input
                    type="text"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    placeholder="OPay, Kuda, GTBank, Zenith, Access"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Submitting Payment...'
                    : `Submit ₦${selectedAmount.toLocaleString()} Payment Reference`}
                </span>
              </button>

              <div className="flex gap-2">
                {/* Instant Demo Simulation Button */}
                <button
                  type="button"
                  onClick={handleSimulateInstantVerify}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Demo Auto-Verify</span>
                </button>

                {/* WhatsApp Support Direct Button */}
                <a
                  href="https://wa.me/234906396466"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
