'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/tcg/Header';
import { BattleArena } from '@/components/tcg/BattleArena';
import { DeckBuilder } from '@/components/tcg/DeckBuilder';
import { CardAlmanac } from '@/components/tcg/CardAlmanac';
import { RulesCodex } from '@/components/tcg/RulesCodex';
import { PrivacyCurtainModal } from '@/components/tcg/PrivacyCurtainModal';
import { CardInspectorModal } from '@/components/tcg/CardInspectorModal';
import { GameOverModal } from '@/components/tcg/GameOverModal';
import { AmbientBackground } from '@/components/tcg/AmbientBackground';

import {
  createInitialGame,
  revealPrivacyAndStartTurn,
  endTurn
} from '@/lib/tcg/gameEngine';
import { executeAiTurn } from '@/lib/tcg/aiPlayer';
import { GameState, CardDef, CardInstance, GameMode } from '@/lib/tcg/types';
import { GAME_TITLES } from '@/lib/tcg/titlesData';
import { soundEngine } from '@/lib/tcg/soundEngine';

import { PackOpenerModal } from '@/components/tcg/PackOpenerModal';
import { TradeModal } from '@/components/tcg/TradeModal';
import { CosmeticsShopModal } from '@/components/tcg/CosmeticsShopModal';
import { PlayerProfileModal } from '@/components/tcg/PlayerProfileModal';
import {
  PlayerCollection,
  loadPlayerCollection,
  openBoosterPack,
  addVictoryPackReward
} from '@/lib/tcg/collectionEngine';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'battle' | 'deckbuilder' | 'almanac' | 'lore'>('battle');
  const [gameTitle, setGameTitle] = useState<string>(GAME_TITLES[0]);
  const [gameMode, setGameMode] = useState<GameMode>('couch_2p');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inspectedCard, setInspectedCard] = useState<CardDef | CardInstance | null>(null);

  const [collection, setCollection] = useState<PlayerCollection>(() =>
    loadPlayerCollection('player_1')
  );
  const [isPackModalOpen, setIsPackModalOpen] = useState<boolean>(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [customP1Deck, setCustomP1Deck] = useState<string[] | undefined>(undefined);
  const [customP2Deck, setCustomP2Deck] = useState<string[] | undefined>(undefined);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGame('couch_2p', 'solar_pyre', 'void_shadow')
  );

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // New Duel Initializer
  const handleStartNewDuel = useCallback(
    (mode: GameMode = gameMode, p1Cards = customP1Deck, p2Cards = customP2Deck) => {
      soundEngine.playTurnChime();
      const newGame = createInitialGame(mode, 'solar_pyre', 'void_shadow', p1Cards, p2Cards);
      setGameState(newGame);
      setActiveTab('battle');
    },
    [gameMode, customP1Deck, customP2Deck]
  );

  const handleSwitchGameMode = useCallback(
    (mode: GameMode) => {
      setGameMode(mode);
      handleStartNewDuel(mode);
    },
    [handleStartNewDuel]
  );

  // Victory Reward listener
  const rewardedRef = useRef<boolean>(false);
  useEffect(() => {
    if (gameState.winner === 1 && !rewardedRef.current) {
      rewardedRef.current = true;
      setCollection(current => addVictoryPackReward(current));
    } else if (gameState.winner === null) {
      rewardedRef.current = false;
    }
  }, [gameState.winner]);

  // AI Turn Execution in Solo Mode
  useEffect(() => {
    if (
      gameState.mode === 'solo_ai' &&
      gameState.currentTurn === 2 &&
      !gameState.winner &&
      !gameState.isPrivacyCurtainActive
    ) {
      const timer = setTimeout(() => {
        executeAiTurn(
          () => gameStateRef.current,
          updater => setGameState(updater)
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState.mode, gameState.currentTurn, gameState.winner, gameState.isPrivacyCurtainActive]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Space to end turn or pass privacy curtain (only when in battle tab and no modal active)
      if (e.code === 'Space') {
        if (isPackModalOpen || isTradeModalOpen || isShopModalOpen || isProfileModalOpen || inspectedCard || activeTab !== 'battle') {
          return;
        }
        e.preventDefault();
        setGameState(current => {
          if (current.winner) return current;
          if (current.isPrivacyCurtainActive) {
            return revealPrivacyAndStartTurn(current);
          } else if (!current.players[current.currentTurn - 1].isAI) {
            return endTurn(current);
          }
          return current;
        });
      }

      // M to toggle audio
      if (e.key === 'm' || e.key === 'M') {
        const unmuted = soundEngine.toggleMute();
        setIsMuted(!unmuted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPackModalOpen, isTradeModalOpen, isShopModalOpen, isProfileModalOpen, inspectedCard, activeTab]);

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
        {activeTab === 'battle' && (
          <BattleArena
            gameState={gameState}
            setGameState={setGameState}
            onInspectCard={card => setInspectedCard(card)}
            onNewDuel={() => handleSwitchGameMode(gameMode)}
            equippedCosmetics={collection.equippedCosmetics}
            totalSpentUSD={collection.totalSpentUSD}
          />
        )}

        {activeTab === 'deckbuilder' && (
          <DeckBuilder
            onInspectCard={card => setInspectedCard(card)}
            onSaveP1Deck={cards => {
              setCustomP1Deck(cards);
            }}
            onSaveP2Deck={cards => {
              setCustomP2Deck(cards);
            }}
            onTestBattle={cards => {
              setCustomP1Deck(cards);
              handleStartNewDuel(gameMode, cards, customP2Deck);
            }}
          />
        )}

        {activeTab === 'almanac' && (
          <CardAlmanac onInspectCard={card => setInspectedCard(card)} />
        )}

        {activeTab === 'lore' && <RulesCodex />}
      </main>

      {/* Local Couch Co-Op Privacy Handover Modal */}
      <PrivacyCurtainModal
        isOpen={gameState.isPrivacyCurtainActive}
        playerName={gameState.players[gameState.currentTurn - 1].name}
        onRevealAndStart={() => setGameState(s => revealPrivacyAndStartTurn(s))}
      />

      {/* High Definition Card Inspector Modal */}
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

      {/* Real-Money Cosmetics Shop & Gem Exchange Modal */}
      <CosmeticsShopModal
        isOpen={isShopModalOpen}
        collection={collection}
        onUpdateCollection={updated => setCollection(updated)}
        onClose={() => setIsShopModalOpen(false)}
      />

      {/* Player Profile & Supporter Status Modal */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        collection={collection}
        onOpenShop={() => setIsShopModalOpen(true)}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Victory / Defeat Game Over Modal */}
      <GameOverModal
        gameState={gameState}
        onRematch={() => handleStartNewDuel()}
        onDeckBuilder={() => {
          setGameState(s => ({ ...s, winner: null }));
          setActiveTab('deckbuilder');
        }}
      />
    </div>
  );
}
