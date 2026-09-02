'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/tcg/Header';
import { BattleArena } from '@/components/tcg/BattleArena';
import { DeckBuilder } from '@/components/tcg/DeckBuilder';
import { CardAlmanac } from '@/components/tcg/CardAlmanac';
import { RulesCodex } from '@/components/tcg/RulesCodex';
import { CardInspectorModal } from '@/components/tcg/CardInspectorModal';
import { GameOverModal } from '@/components/tcg/GameOverModal';
import { AmbientBackground } from '@/components/tcg/AmbientBackground';
import { CosmeticsShopModal } from '@/components/tcg/CosmeticsShopModal';
import { PlayerProfileModal } from '@/components/tcg/PlayerProfileModal';
import { PackOpenerModal } from '@/components/tcg/PackOpenerModal';
import { TradeModal } from '@/components/tcg/TradeModal';

import { GameState, CardDef, CardInstance } from '@/lib/tcg/types';
import { GAME_TITLES } from '@/lib/tcg/titlesData';
import { soundEngine } from '@/lib/tcg/soundEngine';
import {
  PlayerCollection,
  getInitialCollection,
  loadPlayerCollection,
  openBoosterPack,
  addVictoryPackReward
} from '@/lib/tcg/collectionEngine';
import { Sparkles, ShieldCheck, Bot } from 'lucide-react';

export default function QuickplayPage() {
  const [activeTab, setActiveTab] = useState<'battle' | 'deckbuilder' | 'almanac' | 'lore'>('battle');
  const [gameTitle, setGameTitle] = useState<string>(GAME_TITLES[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inspectedCard, setInspectedCard] = useState<CardDef | CardInstance | null>(null);

  const [collection, setCollection] = useState<PlayerCollection>(() =>
    getInitialCollection('player_1')
  );

  useEffect(() => {
    setCollection(loadPlayerCollection('player_1'));
  }, []);

  const [isPackModalOpen, setIsPackModalOpen] = useState<boolean>(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Quickplay Room State
  const [anonUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let saved = localStorage.getItem('tcg_anon_user_id');
      if (!saved) {
        saved = `duellist_${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem('tcg_anon_user_id', saved);
      }
      return saved;
    }
    return 'duellist_7777';
  });

  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [isMatching, setIsMatching] = useState<boolean>(true);
  const [matchStatusText, setMatchStatusText] = useState<string>('Searching for Online Duellists...');
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Matchmaking API Call
  const handleJoinMatchmaking = useCallback(
    async (forceAi: boolean = false) => {
      setIsMatching(true);
      setMatchStatusText(forceAi ? 'Initializing Solo AI Duel...' : 'Searching for Online Duellist...');

      try {
        const res = await fetch('/api/quickplay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join_queue',
            userId: anonUserId,
            forceAi
          })
        });

        const data = await res.json();
        if (data.success && data.gameState) {
          setRoomId(data.roomId);
          setPlayerNumber(data.playerNumber);
          setGameState(data.gameState);

          if (data.isP2AI) {
            setMatchStatusText('Matched with AI Tactician!');
            setTimeout(() => setIsMatching(false), 800);
          } else {
            setMatchStatusText('Duellist Found! Connecting to Room...');
            setTimeout(() => setIsMatching(false), 1000);
          }
        }
      } catch (err) {
        console.error('Matchmaking error:', err);
        setMatchStatusText('Matchmaking fallback to AI...');
        setTimeout(() => handleJoinMatchmaking(true), 1200);
      }
    },
    [anonUserId]
  );

  // Initial Matchmaking trigger
  useEffect(() => {
    handleJoinMatchmaking(false);
  }, [handleJoinMatchmaking]);

  // Polling Server-Sanitized State Loop (Anti-Cheat Encapsulation)
  useEffect(() => {
    if (!roomId || isMatching) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/quickplay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'poll_state',
            roomId,
            playerNumber
          })
        });

        const data = await res.json();
        if (data.success && data.gameState) {
          setGameState(data.gameState);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [roomId, playerNumber, isMatching]);

  // Dispatch Action Helper
  const handleDispatchAction = async (updaterOrState: GameState | ((s: GameState) => GameState)) => {
    // Optimistic local state preview
    setGameState(prev => (typeof updaterOrState === 'function' ? updaterOrState(prev!) : updaterOrState));
  };

  // Victory Reward Listener
  const rewardedRef = useRef<boolean>(false);
  useEffect(() => {
    if (gameState?.winner === playerNumber && !rewardedRef.current) {
      rewardedRef.current = true;
      soundEngine.playVictory();
      setCollection(current => addVictoryPackReward(current));
    } else if (gameState?.winner === null) {
      rewardedRef.current = false;
    }
  }, [gameState?.winner, playerNumber]);

  return (
    <div id="app" className="relative flex flex-col min-h-screen w-full bg-[#080911] text-slate-100 overflow-x-hidden">
      {/* Ambient Cosmic Background */}
      <AmbientBackground />

      {/* Top Header Navigation & Utilities */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gameTitle={gameTitle}
        setGameTitle={setGameTitle}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        unopenedPacks={collection.unopenedPacks}
        gemBalance={collection.gemBalance}
        totalSpentUSD={collection.totalSpentUSD}
        onOpenPackModal={() => setIsPackModalOpen(true)}
        onOpenTradeModal={() => setIsTradeModalOpen(true)}
        onOpenShopModal={() => setIsShopModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col w-full relative z-10">
        {/* Matchmaking Queue Overlay */}
        {isMatching && (
          <div className="matchmaking-overlay fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border-2 border-amber-500/50 shadow-[0_0_90px_rgba(245,158,11,0.3)] rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-6 text-center backdrop-blur-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-spin">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-serif font-black text-2xl text-white">Online Quickplay Matchmaking</h3>
                <span className="font-mono text-xs text-amber-300 font-extrabold">{matchStatusText}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Anti-Cheat Active: Opponent hand payload is server-sanitized.</span>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleJoinMatchmaking(true)}
                  className="btn bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-mono font-bold flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-4 h-4 text-amber-400" />
                  Duel AI Immediately
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'battle' && gameState && (
          <BattleArena
            gameState={gameState}
            setGameState={handleDispatchAction}
            onInspectCard={card => setInspectedCard(card)}
            onNewDuel={() => handleJoinMatchmaking(false)}
            equippedCosmetics={collection.equippedCosmetics}
            totalSpentUSD={collection.totalSpentUSD}
          />
        )}

        {activeTab === 'deckbuilder' && (
          <DeckBuilder
            onInspectCard={card => setInspectedCard(card)}
            onSaveP1Deck={() => {}}
            onSaveP2Deck={() => {}}
            onTestBattle={() => {
              handleJoinMatchmaking(false);
            }}
          />
        )}

        {activeTab === 'almanac' && (
          <CardAlmanac onInspectCard={card => setInspectedCard(card)} />
        )}

        {activeTab === 'lore' && <RulesCodex />}
      </main>

      {/* Card Inspector Modal */}
      <CardInspectorModal
        card={inspectedCard}
        onClose={() => setInspectedCard(null)}
      />

      {/* Booster Pack Opener Modal */}
      <PackOpenerModal
        isOpen={isPackModalOpen}
        unopenedPacks={collection.unopenedPacks}
        onOpenPack={() => {
          const { updatedCollection, unlockedCards } = openBoosterPack(collection);
          setCollection(updatedCollection);
          return unlockedCards;
        }}
        onClose={() => setIsPackModalOpen(false)}
      />

      {/* Free Card Gifting & Trading Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        collection={collection}
        onUpdateCollection={updated => setCollection(updated)}
        onClose={() => setIsTradeModalOpen(false)}
      />

      {/* Real-Money Cosmetics Shop Modal */}
      <CosmeticsShopModal
        isOpen={isShopModalOpen}
        collection={collection}
        onUpdateCollection={updated => setCollection(updated)}
        onClose={() => setIsShopModalOpen(false)}
      />

      {/* Player Profile Modal */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        collection={collection}
        onOpenShop={() => setIsShopModalOpen(true)}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* GameOver Modal */}
      {gameState && (
        <GameOverModal
          gameState={gameState}
          onRematch={() => handleJoinMatchmaking(false)}
          onDeckBuilder={() => {
            setGameState(s => (s ? { ...s, winner: null } : null));
            setActiveTab('deckbuilder');
          }}
        />
      )}
    </div>
  );
}
