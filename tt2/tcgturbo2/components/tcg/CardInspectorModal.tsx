'use client';

import React, { useEffect } from 'react';
import { Card } from './Card';
import { CardDef, CardInstance } from '@/lib/tcg/types';
import { X, Sparkles, Compass, ShieldAlert } from 'lucide-react';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface CardInspectorModalProps {
  card: CardDef | CardInstance | null;
  onClose: () => void;
}

export function CardInspectorModal({ card, onClose }: CardInspectorModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  return (
    <div
      className="card-inspector-modal fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="inspector-content relative flex flex-col md:flex-row items-center gap-8 max-w-4xl w-full bg-slate-900/95 border border-slate-700/80 p-6 md:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playHover();
            onClose();
          }}
          className="inspector-close-btn absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 3D Card Preview */}
        <div className="inspector-card-view scale-110 md:scale-125 my-4 md:my-0 flex items-center justify-center">
          <Card card={card} />
        </div>

        {/* Card Details & Lore */}
        <div className="inspector-details flex-1 flex flex-col gap-4 text-slate-200">
          <div className="inspector-header border-b border-slate-800 pb-3">
            <h2 className="inspector-card-name font-serif text-2xl md:text-3xl font-black text-white tracking-wide">
              {card.name}
            </h2>
            <div className="inspector-meta flex items-center gap-3 text-xs md:text-sm font-mono text-sky-400 mt-1 uppercase font-semibold">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                {card.element}
              </span>
              <span>•</span>
              <span>{card.cost} Mana</span>
              <span>•</span>
              <span className="text-purple-400">{card.rarity}</span>
              {card.form && (
                <>
                  <span>•</span>
                  <span className="text-amber-400">Form {card.form}</span>
                </>
              )}
            </div>
          </div>

          {/* Lore Quote */}
          <div className="inspector-lore bg-slate-950/60 p-4 rounded-xl border-l-4 border-sky-400 text-slate-300 italic text-sm leading-relaxed">
            &quot;{card.lore || 'An ancient relic of the Nexus realm.'}&quot;
          </div>

          {/* Abilities */}
          <div className="inspector-ability-block flex flex-col gap-1.5">
            <span className="inspector-ability-title font-mono font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Abilities & Mechanics
            </span>
            <p className="inspector-ability-desc text-sm md:text-base text-slate-200 leading-relaxed">
              {(card.keywords || []).map(k => (
                <strong key={k} className="text-amber-300 mr-1.5 font-mono">
                  [{k}]
                </strong>
              ))}
              <span>{card.desc || 'Standard tactical creature without additional activated abilities.'}</span>
            </p>
          </div>

          {/* Secret Ward Trigger note */}
          {card.trigger && (
            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/40 p-3 rounded-xl text-xs text-purple-300 font-mono">
              <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Trigger condition: {card.trigger}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
