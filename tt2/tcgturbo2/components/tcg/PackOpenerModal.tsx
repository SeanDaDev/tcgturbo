'use client';

import React, { useState } from 'react';
import { CardDef } from '@/lib/tcg/types';
import { Card } from './Card';
import { Sparkles, Gift, Check, PackageOpen } from 'lucide-react';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface PackOpenerModalProps {
  isOpen: boolean;
  unopenedPacks: number;
  onOpenPack: () => CardDef[];
  onClose: () => void;
}

export function PackOpenerModal({
  isOpen,
  unopenedPacks,
  onOpenPack,
  onClose
}: PackOpenerModalProps) {
  const [revealedCards, setRevealedCards] = useState<CardDef[] | null>(null);

  if (!isOpen) return null;

  const handleOpenClick = () => {
    soundEngine.playTurnChime();
    const cards = onOpenPack();
    setRevealedCards(cards);
  };

  const handleDone = () => {
    soundEngine.playHover();
    setRevealedCards(null);
    onClose();
  };

  return (
    <div className="pack-opener-modal fixed inset-0 z-[650] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="pack-opener-box bg-slate-900/95 border-2 border-amber-500/50 shadow-[0_0_80px_rgba(245,158,11,0.3)] rounded-3xl p-6 md:p-10 max-w-3xl w-full flex flex-col items-center gap-6 relative overflow-hidden backdrop-blur-2xl text-center">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest font-extrabold">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          ASTRAL NEXUS REWARD CRATE
        </div>

        {!revealedCards ? (
          <div className="flex flex-col items-center gap-6 my-6">
            <div className="w-32 h-44 rounded-2xl bg-gradient-to-tr from-amber-900 via-yellow-600 to-amber-500 border-2 border-yellow-300 shadow-[0_0_40px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center gap-2 text-slate-950 font-black animate-bounce cursor-pointer hover:scale-105 transition-transform">
              <PackageOpen className="w-12 h-12 text-slate-950" />
              <span className="font-serif text-sm tracking-wider">BOOSTER PACK</span>
              <span className="font-mono text-xs bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded-full">
                3 CARDS
              </span>
            </div>

            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-black text-white">
                Unopened Booster Packs: {unopenedPacks}
              </h2>
              <p className="text-slate-300 text-xs md:text-sm max-w-md mt-1 leading-relaxed">
                Win duels to earn free Booster Packs! Each pack contains 3 random cards for your permanent collection.
              </p>
            </div>

            <button
              type="button"
              disabled={unopenedPacks <= 0}
              onClick={handleOpenClick}
              className="btn btn-gold py-3.5 px-8 text-base font-extrabold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform disabled:opacity-40"
            >
              <Gift className="w-5 h-5 text-slate-950" />
              Open 1 Booster Pack!
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-90 duration-300">
            <h2 className="font-serif text-2xl md:text-3xl font-black text-amber-300 drop-shadow">
              🎉 Unlocked 3 New Cards!
            </h2>

            <div className="cards-reveal-grid flex flex-wrap justify-center gap-4 my-2">
              {revealedCards.map((card, idx) => (
                <div key={`reveal_${card.id}_${idx}`} className="scale-105 hover:scale-110 transition-transform">
                  <Card card={card} />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {unopenedPacks > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTurnChime();
                    const cards = onOpenPack();
                    setRevealedCards(cards);
                  }}
                  className="btn btn-gold py-3 px-6 text-sm font-bold flex items-center gap-2"
                >
                  <PackageOpen className="w-4 h-4" />
                  Open Another ({unopenedPacks} left)
                </button>
              )}

              <button
                type="button"
                onClick={handleDone}
                className="btn btn-primary py-3 px-6 text-sm font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Done & Collect Cards
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-mono text-slate-400 hover:text-white underline mt-2"
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
