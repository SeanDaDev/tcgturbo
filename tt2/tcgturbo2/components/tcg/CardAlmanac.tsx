'use client';

import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { CARDS_DATA } from '@/lib/tcg/cardsData';
import { CardDef, CardInstance } from '@/lib/tcg/types';
import { Sparkles, Search, Compass } from 'lucide-react';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface CardAlmanacProps {
  onInspectCard: (card: CardDef | CardInstance) => void;
}

export function CardAlmanac({ onInspectCard }: CardAlmanacProps) {
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = useMemo(() => {
    return CARDS_DATA.filter(card => {
      const matchElem = selectedElement === 'all' || card.element === selectedElement;
      const matchSearch =
        !searchQuery ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.lore && card.lore.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (card.desc && card.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchElem && matchSearch;
    });
  }, [selectedElement, searchQuery]);

  return (
    <div className="almanac-view flex flex-col flex-1 w-full max-w-[1560px] mx-auto p-4 md:p-6 gap-6 h-[calc(100vh-70px)] overflow-y-auto">
      {/* Hero Banner */}
      <div className="codex-hero-banner bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-blue-950/70 border border-purple-500/40 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            Interactive 3D Holographic Codex
          </div>
          <h2 className="codex-title text-2xl md:text-3xl font-black font-serif uppercase tracking-wider bg-gradient-to-r from-amber-200 via-sky-300 to-purple-300 bg-clip-text text-transparent">
            ✨ Holographic Card Almanac
          </h2>
          <p className="codex-text text-slate-300 text-sm md:text-base leading-relaxed">
            Hover and tilt cards with your cursor to engage interactive 3D parallax lighting, responsive perspective physics, and dynamic multi-layer foil shaders. Click or right-click any card to unlock the high-definition inspection archives and lore quotes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            FACTION:
          </span>
          {['all', 'solar', 'void', 'verdant', 'tide', 'astral'].map(elem => (
            <button
              key={elem}
              type="button"
              className={`filter-chip px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedElement === elem
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => {
                setSelectedElement(elem);
                soundEngine.playHover();
              }}
            >
              {elem}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lore or abilities..."
            className="search-input bg-slate-950/80 border border-slate-800 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl outline-none focus:border-purple-500 transition-colors w-48 md:w-64"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-12 content-start">
        {filtered.map(cardDef => (
          <div key={cardDef.id} className="flex flex-col items-center">
            <Card card={cardDef} onInspect={onInspectCard} onClick={() => onInspectCard(cardDef)} />
          </div>
        ))}
      </div>
    </div>
  );
}
