'use client';

import React from 'react';
import { PlayerCollection, getSupporterTier } from '@/lib/tcg/collectionEngine';
import { COSMETIC_ITEMS } from '@/lib/tcg/cosmeticsData';
import { soundEngine } from '@/lib/tcg/soundEngine';
import {
  User,
  ShieldCheck,
  X,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  collection: PlayerCollection;
  onOpenShop: () => void;
  onClose: () => void;
}

export function PlayerProfileModal({
  isOpen,
  collection,
  onOpenShop,
  onClose
}: PlayerProfileModalProps) {
  if (!isOpen) return null;

  const totalSpent = collection.totalSpentUSD || 0;
  const supporterTier = getSupporterTier(totalSpent);

  const totalUnlockedCosmetics = collection.ownedCosmetics.length;
  const totalCosmeticsCount = COSMETIC_ITEMS.length;

  const equippedCardBackItem = COSMETIC_ITEMS.find(
    c => c.id === collection.equippedCosmetics.cardBack
  );
  const equippedBoardItem = COSMETIC_ITEMS.find(
    c => c.id === collection.equippedCosmetics.boardTheme
  );
  const equippedFoilItem = COSMETIC_ITEMS.find(
    c => c.id === collection.equippedCosmetics.foilStyle
  );

  // Next Tier calculation
  let nextTierTargetUSD = 4.99;
  let nextTierName = 'Bronze Supporter';
  if (totalSpent >= 100) {
    nextTierTargetUSD = 100;
    nextTierName = 'Max Tier Reached!';
  } else if (totalSpent >= 50) {
    nextTierTargetUSD = 100;
    nextTierName = 'Diamond Founder ($100)';
  } else if (totalSpent >= 15) {
    nextTierTargetUSD = 50;
    nextTierName = 'Gold Supporter ($50)';
  } else if (totalSpent >= 4.99) {
    nextTierTargetUSD = 15;
    nextTierName = 'Silver Supporter ($15)';
  }

  const progressPercent =
    totalSpent >= 100 ? 100 : Math.min(100, Math.max(0, (totalSpent / nextTierTargetUSD) * 100));

  return (
    <div className="player-profile-modal fixed inset-0 z-[660] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="profile-box bg-slate-900/95 border-2 border-amber-500/50 shadow-[0_0_90px_rgba(245,158,11,0.25)] rounded-3xl p-6 md:p-8 max-w-2xl w-full flex flex-col gap-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Profile Banner */}
        <div className={`profile-banner p-6 rounded-2xl bg-gradient-to-br ${supporterTier.bgGradient} border ${supporterTier.borderColor} flex flex-wrap items-center justify-between gap-4 shadow-xl relative overflow-hidden`}>
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
              <User className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-2xl text-white tracking-wide">
                  {collection.userId === 'player_1' ? 'Player 1' : collection.userId}
                </h2>
                <span className={`font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full border ${supporterTier.borderColor} ${supporterTier.color} bg-slate-950/80 shadow-md uppercase`}>
                  {supporterTier.badge}
                </span>
              </div>
              <p className="text-slate-300 text-xs font-mono">
                Cosmetic Support Contributed: <strong className="text-emerald-300">${totalSpent.toFixed(2)} USD</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShop();
              soundEngine.playTurnChime();
            }}
            className="z-10 btn bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            Upgrade Support
          </button>
        </div>

        {/* Supporter Progress Bar */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Supporter Status Tier Progress
            </span>
            <span className="text-amber-300 font-extrabold">
              Next Goal: {nextTierName}
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700/80 overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Current: ${totalSpent.toFixed(2)} USD</span>
            <span>Target: ${nextTierTargetUSD.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Equipped Cosmetics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Equipped Card Back</span>
            <span className="font-serif font-bold text-xs text-amber-300 truncate">
              {equippedCardBackItem?.name || 'Astral Classic'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Equipped Arena</span>
            <span className="font-serif font-bold text-xs text-amber-300 truncate">
              {equippedBoardItem?.name || 'Astral Void Mat'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Equipped Foil</span>
            <span className="font-serif font-bold text-xs text-purple-300 truncate">
              {equippedFoilItem?.name || 'Standard Prism'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Unlocked</span>
            <span className="font-mono font-bold text-xs text-emerald-400">
              {totalUnlockedCosmetics} / {totalCosmeticsCount} Items
            </span>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="leading-snug">
            <strong className="text-emerald-300">Fair Play Supporter Charter:</strong> Supporter Status badges acknowledge voluntary aesthetic contributions to game development. Zero card stats, deck bonuses, or competitive gameplay advantages are granted.
          </p>
        </div>
      </div>
    </div>
  );
}
