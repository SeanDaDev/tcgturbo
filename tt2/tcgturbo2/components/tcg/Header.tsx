'use client';

import React from 'react';
import { GAME_TITLES } from '@/lib/tcg/titlesData';
import { GameMode } from '@/lib/tcg/types';
import { soundEngine } from '@/lib/tcg/soundEngine';
import { Volume2, VolumeX, Maximize, Swords, BookOpen, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'battle' | 'deckbuilder' | 'almanac' | 'lore';
  setActiveTab: (tab: 'battle' | 'deckbuilder' | 'almanac' | 'lore') => void;
  gameTitle: string;
  setGameTitle: (title: string) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onNewMatch: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  gameTitle,
  setGameTitle,
  gameMode,
  setGameMode,
  isMuted,
  setIsMuted,
  onNewMatch
}: HeaderProps) {
  const toggleSound = () => {
    const unmuted = soundEngine.toggleMute();
    setIsMuted(!unmuted);
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="app-header flex items-center justify-between px-4 md:px-8 py-2 sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      {/* Brand */}
      <div className="brand-section flex items-center gap-3">
        <div className="game-logo-gem" />
        <div className="brand-title-wrap">
          <h1 className="brand-title text-lg md:text-xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-200 via-sky-300 to-indigo-300 bg-clip-text text-transparent font-serif">
            {gameTitle}
          </h1>
          <span className="brand-subtitle text-[10px] text-slate-400 font-mono tracking-widest uppercase">
            Tactical Conduit & Ascension TCG
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="nav-tabs flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800 gap-1" aria-label="Main Navigation">
        <button
          className={`nav-tab-btn px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'battle'
              ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-sky-200 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          onClick={() => {
            setActiveTab('battle');
            soundEngine.playHover();
          }}
        >
          <Swords className="w-4 h-4 text-amber-400" />
          <span>Battle Arena</span>
        </button>

        <button
          className={`nav-tab-btn px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'deckbuilder'
              ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-sky-200 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          onClick={() => {
            setActiveTab('deckbuilder');
            soundEngine.playHover();
          }}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Deck Builder</span>
        </button>

        <button
          className={`nav-tab-btn px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'almanac'
              ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-sky-200 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          onClick={() => {
            setActiveTab('almanac');
            soundEngine.playHover();
          }}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>3D Showcase</span>
        </button>

        <button
          className={`nav-tab-btn px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'lore'
              ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-sky-200 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          onClick={() => {
            setActiveTab('lore');
            soundEngine.playHover();
          }}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>Rules & Lore</span>
        </button>
      </nav>

      {/* Utilities */}
      <div className="header-actions flex items-center gap-2 md:gap-3">
        {/* Title Switcher */}
        <select
          value={gameTitle}
          onChange={e => {
            setGameTitle(e.target.value);
            if (typeof document !== 'undefined') {
              document.title = `${e.target.value} | Modular Web TCG`;
            }
          }}
          className="title-select bg-slate-900 text-slate-300 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-mono outline-none hover:border-sky-500/60 transition-colors hidden lg:block"
          title="Switch Game Title Theme"
        >
          {GAME_TITLES.map((t, idx) => (
            <option key={t} value={t}>
              {idx + 1}. {t}
            </option>
          ))}
        </select>

        {/* Audio Mute Button */}
        <button
          type="button"
          onClick={toggleSound}
          className={`action-icon-btn p-2 rounded-lg border text-sm transition-all ${
            !isMuted
              ? 'bg-sky-950/60 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
        >
          {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="action-icon-btn p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors hidden sm:flex"
          title="Toggle Fullscreen (F)"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
