'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from './Card';
import { CARDS_DATA } from '@/lib/tcg/cardsData';
import { soundEngine } from '@/lib/tcg/soundEngine';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Users,
  Flame,
  Moon,
  Trees,
  Waves,
  Hourglass,
  ShoppingBag,
  ArrowRight,
  Star,
  Layers
} from 'lucide-react';

import { CardDef, CardInstance } from '@/lib/tcg/types';
import { MainNavTab } from './Header';

interface LandingHomepageProps {
  onOpenShopModal?: () => void;
  onInspectCard?: (card: CardDef | CardInstance) => void;
  onNavigateTab?: (tab: MainNavTab) => void;
}

export function LandingHomepage({ onOpenShopModal, onInspectCard, onNavigateTab }: LandingHomepageProps) {
  const [selectedFaction, setSelectedFaction] = useState<'solar' | 'void' | 'verdant' | 'tide' | 'astral'>('solar');

  // Sample cards for 3D showcase
  const ignisCard = CARDS_DATA.find(c => c.id === 'ignis_apex') || CARDS_DATA[0];
  const voidCard = CARDS_DATA.find(c => c.id === 'nyx_valkyrie') || CARDS_DATA[1];
  const chronosCard = CARDS_DATA.find(c => c.id === 'astral_chronos_apex') || CARDS_DATA[2];

  const factionDetails = {
    solar: {
      name: 'Solar Pyre Faction',
      title: 'Radiant Ignition & Aggressive Superiority',
      desc: 'Channel the blinding flames of dying stars. Wield aggressive Drake initiates and Aegis paladins to overwhelm enemy lines before they can establish board control.',
      icon: Flame,
      color: 'from-amber-500 via-yellow-500 to-orange-600',
      borderColor: 'border-amber-500/60',
      heroCard: ignisCard
    },
    void: {
      name: 'Void Eclipse Faction',
      title: 'Shadow Lifesteal & Fatal Entropy',
      desc: 'Harness event horizon shadows to siphon enemy Vanguard life force. Slay enemy high-threat champions and draw strength from the grave.',
      icon: Moon,
      color: 'from-purple-600 via-slate-900 to-indigo-950',
      borderColor: 'border-purple-500/60',
      heroCard: voidCard
    },
    verdant: {
      name: 'Verdant Overgrowth Faction',
      title: 'Primal Mana Ramp & Colossal Avatars',
      desc: 'Accelerate maximum Mana flow to summon colossal Titans and multi-headed Hydras protected by serrated Taunt guardians.',
      icon: Trees,
      color: 'from-emerald-500 via-teal-600 to-green-950',
      borderColor: 'border-emerald-500/60',
      heroCard: CARDS_DATA.find(c => c.id === 'yggdrasil_titan') || CARDS_DATA[0]
    },
    tide: {
      name: 'Tide Siren Faction',
      title: 'Glacial Stasis & Tidal Wave Combo',
      desc: 'Freeze hostile unit lines in ice stasis while controlling the battlefield rhythm with wave bouncers and secret traps.',
      icon: Waves,
      color: 'from-sky-400 via-cyan-600 to-blue-950',
      borderColor: 'border-sky-500/60',
      heroCard: CARDS_DATA.find(c => c.id === 'tethys_tide_weaver') || CARDS_DATA[0]
    },
    astral: {
      name: 'Astral Chronos Faction',
      title: 'Temporal Shifts & Extra Turn Masterclass',
      desc: 'Manipulate cosmic time itself. Discover high-tier Legendary cards, heal mortal wounds before impact, and claim consecutive extra turns.',
      icon: Hourglass,
      color: 'from-indigo-500 via-purple-600 to-slate-950',
      borderColor: 'border-indigo-500/60',
      heroCard: chronosCard
    }
  };

  const activeFaction = factionDetails[selectedFaction];

  return (
    <div className="landing-homepage flex flex-col w-full max-w-[1400px] mx-auto p-4 md:p-8 gap-12 text-slate-100 relative z-20 animate-in fade-in duration-500">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="hero-banner flex flex-col lg:flex-row items-center justify-between gap-10 bg-slate-950/80 border-2 border-amber-500/40 rounded-3xl p-6 md:p-12 shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-hidden backdrop-blur-2xl">
        {/* Glow Accents */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-500" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Left Sales Copy */}
        <div className="flex-1 flex flex-col gap-6 z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 self-center lg:self-start bg-slate-900/90 border border-amber-500/50 px-4 py-1.5 rounded-full font-mono text-xs text-amber-300 font-extrabold shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>NEXT-GEN TACTICAL ASCENSION WEB TCG</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent leading-[1.1] tracking-tight drop-shadow-lg">
            Master the Cosmos. <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Evolve Your Champions.
            </span> <br />
            Rule the Nexus.
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-sans">
            Step into the Astral Nexus. Experience revolutionary <strong className="text-amber-300">In-Place Creature Ascension</strong>, secret ward traps, 3D specular foil physics, and anti-cheat server matchmaking. Pure tactical mastery with zero pay-to-win mechanics.
          </p>

          {/* Primary Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/battle/quickplay"
              onClick={() => soundEngine.playTurnChime()}
              className="btn bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-sm md:text-base font-black px-7 py-4 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-105"
            >
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
              <span>⚡ Quickplay Online (Anti-Cheat)</span>
            </Link>

            <Link
              href="/battle/splitscreen"
              onClick={() => soundEngine.playHover()}
              className="btn bg-slate-900/90 border border-slate-700 hover:border-sky-400 text-slate-100 font-mono text-sm md:text-base font-extrabold px-6 py-4 rounded-2xl flex items-center gap-2.5 shadow-lg transition-all hover:scale-105"
            >
              <Users className="w-5 h-5 text-sky-400" />
              <span>👥 Local Splitscreen (Couch 2P)</span>
            </Link>

            {onOpenShopModal && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playHover();
                  onOpenShopModal();
                }}
                className="btn bg-purple-950/80 border border-purple-500/60 text-purple-200 font-mono text-xs md:text-sm font-bold px-5 py-4 rounded-2xl flex items-center gap-2 hover:bg-purple-900/80 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4 text-purple-300" />
                <span>Cosmetics Store ($100 Credit)</span>
              </button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% Free-to-Play
            </span>
            <span className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Lock className="w-4 h-4" /> Server-Validated Anti-Cheat
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" /> $100 Starting Credit
            </span>
          </div>
        </div>

        {/* Hero Right 3D Interactive Card Tilt Showcase */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-md">
          <div className="text-[11px] font-mono font-bold text-amber-400 mb-2 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Click any card to inspect 3D Holo Foil
          </div>
          <div className="relative w-full h-[380px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Stack of 3D Cards */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute -left-4 top-6 -rotate-12 hover:rotate-0 hover:z-30 transition-all duration-300 scale-90 md:scale-100 cursor-pointer"
                onClick={() => onInspectCard?.(voidCard)}
              >
                <Card card={voidCard} size="lg" onInspect={onInspectCard} />
              </div>
              <div 
                className="absolute right-0 top-12 rotate-12 hover:rotate-0 hover:z-30 transition-all duration-300 scale-90 md:scale-100 cursor-pointer"
                onClick={() => onInspectCard?.(chronosCard)}
              >
                <Card card={chronosCard} size="lg" onInspect={onInspectCard} />
              </div>
              <div 
                className="relative z-20 shadow-[0_0_50px_rgba(245,158,11,0.5)] scale-105 hover:scale-110 transition-all duration-300 cursor-pointer"
                onClick={() => onInspectCard?.(ignisCard)}
              >
                <Card card={ignisCard} size="lg" onInspect={onInspectCard} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAST MODE SELECTOR TILES
          ========================================================================= */}
      <section className="mode-selector-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/battle/quickplay"
          onClick={() => soundEngine.playTurnChime()}
          className="group bg-slate-950/80 border border-amber-500/40 hover:border-amber-400 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-300 font-black">
              ⚡
            </span>
            <span className="text-[10px] font-mono uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              Ranked / Casual
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base group-hover:text-amber-300 transition-colors">
              Online Quickplay
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Low-latency server matches with automated anti-cheat & authoritative turn clocks.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Play Match</span> <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/battle/splitscreen"
          onClick={() => soundEngine.playHover()}
          className="group bg-slate-950/80 border border-sky-500/40 hover:border-sky-400 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all hover:scale-[1.02] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/60 flex items-center justify-center text-sky-300 font-black">
              👥
            </span>
            <span className="text-[10px] font-mono uppercase bg-sky-950/80 border border-sky-500/40 text-sky-300 px-2 py-0.5 rounded-full font-bold">
              Local Co-Op
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base group-hover:text-sky-300 transition-colors">
              Splitscreen 2P Duel
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pass-and-play duel with smart privacy curtains to hide cards from your opponent.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Start Couch Duel</span> <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            soundEngine.playHover();
            onNavigateTab?.('deckbuilder');
          }}
          className="group text-left bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-300 font-black">
              🗂️
            </span>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Builder
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
              Deck Builder & Presets
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Construct 20-card tactical loadouts, test mana curves, and import/export deck codes.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Open Builder</span> <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playHover();
            onNavigateTab?.('arcade');
          }}
          className="group text-left bg-slate-950/80 border border-rose-500/40 hover:border-rose-400 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.25)] transition-all hover:scale-[1.02] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-300 font-black">
              🎮
            </span>
            <span className="text-[10px] font-mono uppercase bg-rose-950/80 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full font-bold">
              Arcade Hub
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base group-hover:text-rose-300 transition-colors">
              Cosmic Mini-Games
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Astral Blackjack, Chrono Solitaire, and Rune Memory Match with zero downloads.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>Play Arcade</span> <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </section>

      {/* =========================================================================
          KEY MECHANICS & SENSE OF WONDER GRID
          ========================================================================= */}
      <section className="mechanics-grid flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <h2 className="font-serif text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-200 bg-clip-text text-transparent uppercase tracking-wider">
            ⚔️ Tactical Innovations Built for Master Duellists
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl font-mono">
            Elevating browser card combat with instant mid-turn evolution, hidden secret wards, and zero pay-to-win shortcuts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => onNavigateTab?.('lore')}
            className="feature-card bg-slate-950/80 border border-amber-500/30 rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden backdrop-blur-xl group hover:border-amber-400 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-xl shadow-lg">
              🐉
            </div>
            <h3 className="font-serif font-bold text-xl text-white group-hover:text-amber-300 transition-colors">
              In-Place Creature Ascension
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Evolve Form 1 initiates into Form 3 Mythic Apex Sovereigns directly in their battlefield lane for reduced mana costs. Ascended units retain Rush and trigger devastating Ascension Burst abilities upon evolving.
            </p>
            <div className="mt-auto text-xs font-mono text-amber-400 flex items-center gap-1">
              <span>Read rules in Codex</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab?.('lore')}
            className="feature-card bg-slate-950/80 border border-purple-500/30 rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden backdrop-blur-xl group hover:border-purple-400 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-400 flex items-center justify-center text-purple-300 font-black text-xl shadow-lg">
              🛡️
            </div>
            <h3 className="font-serif font-bold text-xl text-white group-hover:text-purple-300 transition-colors">
              Secret Ward Traps
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Lay down hidden continuum traps in your secret slots that trigger on enemy attacks, direct strikes, or fatal Vanguard damage to rewrite fate and reverse momentum at crucial moments.
            </p>
            <div className="mt-auto text-xs font-mono text-purple-400 flex items-center gap-1">
              <span>Explore Ward mechanics</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab?.('almanac')}
            className="feature-card bg-slate-950/80 border border-sky-500/30 rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden backdrop-blur-xl group hover:border-sky-400 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-400 flex items-center justify-center text-sky-300 font-black text-xl shadow-lg">
              ✨
            </div>
            <h3 className="font-serif font-bold text-xl text-white group-hover:text-sky-300 transition-colors">
              3D Holographic Specular Foils
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Tilt interactive cards under your cursor to admire real-time 3D specular light reflection, rainbow diffraction shaders, and golden solar sheens.
            </p>
            <div className="mt-auto text-xs font-mono text-sky-400 flex items-center gap-1">
              <span>View full 3D Showcase</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5 FACTIONS SPOTLIGHT & LORE
          ========================================================================= */}
      <section className="factions-spotlight bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col gap-8 relative overflow-hidden backdrop-blur-2xl">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
            ✦ THE 5 COSMIC FACTIONS ✦
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-white">
            Choose Your Vanguard & Faction Strategy
          </h2>
        </div>

        {/* Faction Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          {(Object.keys(factionDetails) as Array<keyof typeof factionDetails>).map(key => {
            const f = factionDetails[key];
            const Icon = f.icon;
            const isSelected = selectedFaction === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedFaction(key);
                  soundEngine.playHover();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  isSelected
                    ? `bg-slate-900 border ${f.borderColor} text-white shadow-lg scale-105`
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{key}</span>
              </button>
            );
          })}
        </div>

        {/* Active Faction Banner & Card Showcase */}
        <div className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${activeFaction.color} border ${activeFaction.borderColor} flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden`}>
          <div className="flex-1 flex flex-col gap-4 z-10">
            <h3 className="font-serif font-black text-2xl md:text-3xl text-white">
              {activeFaction.name}
            </h3>
            <span className="font-mono text-xs font-bold text-amber-300 uppercase">
              {activeFaction.title}
            </span>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              {activeFaction.desc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/battle/quickplay"
                onClick={() => soundEngine.playTurnChime()}
                className="btn bg-slate-950 text-amber-300 border border-amber-400 font-mono text-xs font-black px-5 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                Duel with {activeFaction.name} <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playHover();
                  onNavigateTab?.('deckbuilder');
                }}
                className="btn bg-black/40 hover:bg-black/60 border border-white/20 text-white font-mono text-xs font-bold px-4 py-3 rounded-xl inline-flex items-center gap-2 transition-transform"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Build {activeFaction.name} Deck</span>
              </button>
            </div>
          </div>

          <div className="z-10 scale-105 hover:scale-110 transition-transform cursor-pointer">
            <Card card={activeFaction.heroCard} size="lg" onInspect={onInspectCard} onClick={() => onInspectCard?.(activeFaction.heroCard)} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRESS ACCOLADES & DUELLIST REVIEWS
          ========================================================================= */}
      <section className="reviews-section grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="review-card bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-slate-300 text-sm italic leading-relaxed">
            &ldquo;The cleanest, most tactical web card game I&apos;ve played. In-place Ascension changes everything — evolving a Form 1 Drake into an Apex Sovereign mid-fight is purely exhilarating.&rdquo;
          </p>
          <span className="font-mono text-xs text-amber-300 font-extrabold">— Nexus Gaming Digest</span>
        </div>

        <div className="review-card bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-slate-300 text-sm italic leading-relaxed">
            &ldquo;Zero pay-to-win, gorgeous 3D card tilt physics, pre-loaded $100 cosmetic credit, and anti-cheat server sanitization. Absolute web TCG masterpiece.&rdquo;
          </p>
          <span className="font-mono text-xs text-emerald-400 font-extrabold">— Indie TCG Corner</span>
        </div>
      </section>

      {/* =========================================================================
          FINAL BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section className="bottom-cta bg-gradient-to-r from-amber-950 via-slate-950 to-indigo-950 border-2 border-amber-500/50 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center gap-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] relative overflow-hidden backdrop-blur-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl">
          ⚔️
        </div>

        <div className="flex flex-col gap-2 max-w-2xl">
          <h2 className="font-serif text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
            Ready to Claim Your Celestial Vanguard?
          </h2>
          <p className="text-slate-300 text-sm md:text-base font-sans">
            Jump directly into anonymous online quickplay or challenge a friend in local splitscreen. Instant access — no registration required.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/battle/quickplay"
            onClick={() => soundEngine.playTurnChime()}
            className="btn bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-base font-black px-8 py-4 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5 text-slate-950 fill-current" />
            <span>Play Quickplay Online Now</span>
          </Link>

          <Link
            href="/battle/splitscreen"
            onClick={() => soundEngine.playHover()}
            className="btn bg-slate-900 border border-slate-700 hover:border-sky-400 text-slate-100 font-mono text-base font-extrabold px-7 py-4 rounded-2xl flex items-center gap-2.5 shadow-lg transition-all hover:scale-105"
          >
            <Users className="w-5 h-5 text-sky-400" />
            <span>Local Couch 2P Duel</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
