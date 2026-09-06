'use client';

import React from 'react';
import Link from 'next/link';
import { soundEngine } from '@/lib/tcg/soundEngine';
import {
  Swords,
  Layers,
  Sparkles,
  BookOpen,
  Gamepad2,
  Wand2,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Cpu
} from 'lucide-react';
import { MainNavTab } from './Header';

interface FooterProps {
  onNavigateTab?: (tab: MainNavTab) => void;
  onOpenShopModal?: () => void;
  onOpenTradeModal?: () => void;
}

export function Footer({
  onNavigateTab,
  onOpenShopModal,
}: FooterProps) {
  return (
    <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 mt-16 text-slate-400 relative z-20 backdrop-blur-xl">
      {/* Top Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-bold text-slate-950 text-sm shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                ⚡
              </div>
              <span className="font-serif font-black text-lg text-white tracking-wider">
                TCG TURBO 2.0
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The next-generation modular tactical card battler with in-place creature ascension, secret trap wards, 3D specular holographic cards, and instant server matchmaking.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero Pay-to-Win • 100% Free Play</span>
            </div>
          </div>

          {/* Direct Game Modes */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Battle Arenas
            </span>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  href="/battle/quickplay"
                  onClick={() => soundEngine.playTurnChime()}
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Online Quickplay (PvP)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/battle/splitscreen"
                  onClick={() => soundEngine.playHover()}
                  className="hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 text-sky-400" />
                  <span>Local Couch 2P Duel</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('arcade')}
                  className="hover:text-rose-300 flex items-center gap-1.5 transition-colors text-left"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cosmic Card Arcade Hub</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Explore & Tools */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Codex & Tools
            </span>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('deckbuilder')}
                  className="hover:text-emerald-300 flex items-center gap-1.5 transition-colors text-left"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tactical Deck Builder</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('almanac')}
                  className="hover:text-purple-300 flex items-center gap-1.5 transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>3D Holographic Almanac</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('lore')}
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>Official Rules & Lore Codex</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('outfitter')}
                  className="hover:text-amber-400 flex items-center gap-1.5 transition-colors text-left"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Card Outfitter Studio</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Live System Diagnostics */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              System Engine
            </span>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Matchmaking
                </span>
                <span className="text-emerald-400 font-bold">Online (Active)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-sky-400" /> WebGL 2.0 Foil
                </span>
                <span className="text-sky-300">Supported</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-400" /> Version
                </span>
                <span className="text-slate-300 font-semibold">v2.4.0 (Turbopack)</span>
              </div>
            </div>

            {onOpenShopModal && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playHover();
                  onOpenShopModal();
                }}
                className="mt-1 text-xs text-amber-400 hover:text-amber-300 font-mono text-left underline underline-offset-4"
              >
                Claim $100 Starter Cosmetic Credit →
              </button>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Badges */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© 2026 TCG Turbo. Modular Tactical Card Engine.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Next.js 16 • React 19 • Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
