import React, { useState } from 'react';
import { ActiveView } from '../types';
import {
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  HeartHandshake,
  ExternalLink,
  Scale,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white font-mono">
                W
              </div>
              <span className="font-extrabold text-base text-white tracking-tight font-mono">
                WINER<span className="text-indigo-400">.AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Professional AI-powered creative platform for image generation, cinematic video synthesis, and responsible facial transformation in Nigerian Naira (NGN).
            </p>
          </div>

          {/* Core Tools */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Creative Tools
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('image_gen')} className="hover:text-white transition-colors">
                  AI Image Generator (1 Free Trial)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('video_gen')} className="hover:text-white transition-colors">
                  AI Video Generator (30s Free Trial)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('photo_swap')} className="hover:text-white transition-colors">
                  Photo Face Swap (1 Free Trial)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('video_swap')} className="hover:text-white transition-colors">
                  Video Face Swap (1 Free Trial)
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Direct Contact
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="tel:+234906396466" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+234906396466 (Call)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/234906396466"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+234906396466 (WhatsApp)</span>
                </a>
              </li>
              <li>
                <a href="mailto:Wenerprime@gmail.com" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate">Wenerprime@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* OPay Payment Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Official OPay Account
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-300 font-bold">OPay: Ajibola Mubarak</div>
              <div className="text-emerald-400 font-mono font-bold tracking-wider">
                Account: 9063296466
              </div>
              <p className="text-slate-500 text-[10px]">
                Manual bank transfer verification for all NGN paid operations.
              </p>
            </div>
          </div>
        </div>

        {/* Responsible AI, Legal & Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Winer AI Video Generator. All rights reserved. Built with ethical AI safeguards and affirmative consent verification.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors"
            >
              Support Center
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
