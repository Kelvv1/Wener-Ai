import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Payment / Operation Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit support request');

      setSubmittedTicket(data.ticketId);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-bold text-indigo-400 font-mono tracking-wider">
          Contact & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          We're Here to Help You Create
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Questions about your free trial, OPay bank transfer verification, or custom enterprise video generation? Contact our support team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Phone / Call */}
          <a
            href="tel:+234906396466"
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center gap-4 group shadow-xl block"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Direct Phone Call</span>
              <strong className="text-white text-sm sm:text-base font-bold font-mono">
                +234906396466
              </strong>
              <span className="text-[10px] text-indigo-400 block mt-0.5">Click to call directly</span>
            </div>
          </a>

          {/* WhatsApp Direct Link */}
          <a
            href="https://wa.me/234906396466"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center gap-4 group shadow-xl block"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">WhatsApp Chat</span>
              <strong className="text-white text-sm sm:text-base font-bold font-mono">
                +234906396466
              </strong>
              <span className="text-[10px] text-emerald-400 block mt-0.5 flex items-center gap-1">
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>

          {/* Email Link */}
          <a
            href="mailto:Wenerprime@gmail.com"
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center gap-4 group shadow-xl block"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-semibold text-slate-400 block">Email Support</span>
              <strong className="text-white text-sm sm:text-base font-bold truncate block">
                Wenerprime@gmail.com
              </strong>
              <span className="text-[10px] text-purple-400 block mt-0.5">Send email inquiry</span>
            </div>
          </a>

          {/* Bank Transfer Reference Note */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <span className="text-slate-300 font-bold block">Payment Provider Account:</span>
            <div className="text-slate-400">
              OPay • Ajibola Mubarak • <strong className="text-white font-mono">9063296466</strong>
            </div>
          </div>
        </div>

        {/* Contact & Support Form (7 Cols) */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="font-bold text-white text-lg">Send Us a Support Message</h3>
            <p className="text-xs text-slate-400">We respond to all tickets within 24 hours.</p>
          </div>

          {submittedTicket ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Support Ticket Created!</h4>
              <p className="text-xs text-slate-300">
                Ticket Reference: <strong className="font-mono text-emerald-400">{submittedTicket}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Our team will reply to your provided email address shortly.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subject Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Payment / Operation Inquiry">Payment & OPay Verification</option>
                  <option value="Free Trial Questions">Free Trial Eligibility</option>
                  <option value="Technical Support">Technical Generation Issue</option>
                  <option value="Commercial / Custom Video">Custom Length Video Request</option>
                  <option value="Other">General Feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today? If inquiring about an OPay transfer, include your transaction reference number..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Request...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
