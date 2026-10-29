import React from 'react';
import { ShieldCheck, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              {type === 'terms' ? 'Winer AI Terms of Service' : 'Winer AI Privacy Policy & Ethics'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {type === 'terms' ? (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
              <strong className="block font-bold">1. Affirmative Consent & Strict Compliance</strong>
              <p className="text-xs text-slate-300">
                You affirm that you have obtained verifiable permission from every person depicted in any photo or video uploaded to Winer AI.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white">2. Prohibited Content & Violations</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                <li>Non-consensual sexual, intimate, or defamatory synthetic media.</li>
                <li>Impersonation of living or deceased individuals without legal consent.</li>
                <li>Fraudulent financial deception, election interference, or deepfake scams.</li>
                <li>Any processing of media depicting minors.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white">3. Nigerian Naira (NGN) Payment Policy</h4>
              <p className="text-xs text-slate-400">
                Winer AI operates a one-time free trial system per eligible user account, followed by pay-per-use manual bank transfers via OPay (Account Name: Ajibola Mubarak, Account: 9063296466). Operation authorization commences upon administrative verification.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white">4. Watermarking & Attribution</h4>
              <p className="text-xs text-slate-400">
                All synthetic outputs are embedded with a visible Winer AI verification badge to promote media transparency.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-white">1. Data Sovereignty & Zero Commercial Exploitation</h4>
              <p className="text-xs text-slate-400">
                Your uploaded face photos and personal videos are processed strictly to perform your requested generation or face-swap operation. We never sell, license, or use your private biometric data for commercial advertising.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white">2. Media Deletion & Retention</h4>
              <p className="text-xs text-slate-400">
                You can permanently delete any generated image or video at any time from your Creator Dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white">3. Security</h4>
              <p className="text-xs text-slate-400">
                We implement server-side transaction verification, hashed authentication credentials, and encrypted communications.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
