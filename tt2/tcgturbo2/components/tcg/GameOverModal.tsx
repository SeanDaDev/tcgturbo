'use client';

import React from 'react';
import { Trophy, Skull, RotateCcw, Swords } from 'lucide-react';
import { GameState } from '@/lib/tcg/types';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface GameOverModalProps {
  gameState: GameState;
  onRematch: () => void;
  onDeckBuilder: () => void;
}

export function GameOverModal({
  gameState,
  onRematch,
  onDeckBuilder
}: GameOverModalProps) {
  if (gameState.winner === null) return null;

  const isDraw = gameState.winner === 'draw';
  const isP1Winner = gameState.winner === 1;
  const isP2Winner = gameState.winner === 2;
  const winnerName = isP1Winner
    ? gameState.players[0].name
    : isP2Winner
    ? gameState.players[1].name
    : 'Nobody';

  return (
    <div className="gameover-modal fixed inset-0 z-[550] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="gameover-box bg-slate-900/95 border-2 border-slate-700/80 shadow-[0_0_80px_rgba(59,130,246,0.4)] rounded-3xl p-8 md:p-12 text-center max-w-lg w-full flex flex-col items-center gap-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Animated Glow Badge */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-2xl animate-bounce ${
            isDraw
              ? 'bg-purple-950/80 border-purple-400 text-purple-300'
              : isP1Winner
              ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.6)]'
              : 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_40px_rgba(239,68,68,0.6)]'
          }`}
        >
          {isDraw ? (
            <Skull className="w-12 h-12 text-purple-300" />
          ) : isP1Winner ? (
            <Trophy className="w-12 h-12 text-amber-400" />
          ) : (
            <Skull className="w-12 h-12 text-rose-400" />
          )}
        </div>

        {/* Title */}
        <div>
          <h2
            className={`gameover-title font-serif text-3xl md:text-5xl font-black uppercase tracking-wider ${
              isDraw
                ? 'text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]'
                : isP1Winner
                ? 'bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                : 'bg-gradient-to-r from-red-400 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]'
            }`}
          >
            {isDraw ? 'STALEMATE' : `${winnerName} WINS!`}
          </h2>
          <p className="gameover-desc text-slate-300 text-sm md:text-base mt-2 leading-relaxed">
            {isDraw
              ? 'Both Vanguards fell in simultaneous astral resonance.'
              : `The Astral Nexus acknowledges ${winnerName} as the supreme Vanguard Champion.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTurnChime();
              onRematch();
            }}
            className="btn btn-gold flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playHover();
              onDeckBuilder();
            }}
            className="btn btn-outline flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:border-sky-400 transition-colors"
          >
            <Swords className="w-4 h-4 text-sky-400" />
            Edit Deck
          </button>
        </div>
      </div>
    </div>
  );
}
