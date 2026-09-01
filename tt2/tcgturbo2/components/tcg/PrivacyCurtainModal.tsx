'use client';

import React from 'react';
import { Lock, Eye } from 'lucide-react';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface PrivacyCurtainModalProps {
  isOpen: boolean;
  playerName: string;
  onRevealAndStart: () => void;
}

export function PrivacyCurtainModal({
  isOpen,
  playerName,
  onRevealAndStart
}: PrivacyCurtainModalProps) {
  if (!isOpen) return null;

  return (
    <div className="privacy-curtain-modal fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="privacy-card bg-slate-900/95 border border-purple-500/40 shadow-[0_0_50px_rgba(139,92,246,0.3)] rounded-3xl max-w-lg w-full p-8 md:p-10 text-center relative overflow-hidden">
        {/* Top Gradient Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />

        <div className="privacy-lock-icon w-20 h-20 mx-auto mb-6 rounded-full bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-bounce">
          <Lock className="w-10 h-10 text-purple-300" />
        </div>

        <h2 className="privacy-title font-serif text-2xl md:text-3xl font-black text-white tracking-wide mb-2">
          {playerName}&apos;s Turn
        </h2>

        <p className="privacy-subtitle text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          Information hidden for fairness. Hand cards, secret wards, and tactical combat setups are concealed. Please pass the device to {playerName}.
        </p>

        <div className="privacy-badge inline-flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-mono mb-8">
          ✦ LOCAL COUCH CO-OP PRIVACY SHIELD ✦
        </div>

        <div className="privacy-actions flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTurnChime();
              onRevealAndStart();
            }}
            className="btn btn-primary py-4 px-8 text-sm md:text-base font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
          >
            <Eye className="w-5 h-5 text-sky-200" />
            I am {playerName} — Reveal Hand & Begin Turn
          </button>
        </div>
      </div>
    </div>
  );
}
