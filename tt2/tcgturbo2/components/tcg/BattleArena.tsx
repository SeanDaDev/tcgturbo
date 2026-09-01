'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card } from './Card';
import { GameState, CardDef, CardInstance, GameMode } from '@/lib/tcg/types';
import {
  playCard,
  declareAttack,
  activateHeroPower,
  endTurn,
  calculateAscensionCost
} from '@/lib/tcg/gameEngine';
import { soundEngine } from '@/lib/tcg/soundEngine';
import { Zap, ShieldAlert, Sparkles, User, Bot, RotateCcw } from 'lucide-react';

interface BattleArenaProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onInspectCard: (card: CardDef | CardInstance) => void;
  onNewDuel: () => void;
}

export function BattleArena({
  gameState,
  setGameState,
  onInspectCard,
  onNewDuel
}: BattleArenaProps) {
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activePlayer = gameState.players[gameState.currentTurn - 1];
  const opponentPlayer = gameState.players[gameState.currentTurn === 1 ? 1 : 0];
  const isPlayer1Turn = gameState.currentTurn === 1;

  // Clear selections
  const clearSelections = useCallback(() => {
    setSelectedAttackerId(null);
    setSelectedHandCardId(null);
  }, []);

  // Global escape & click away
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelections();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelections]);

  // Track mouse coordinates for dynamic curved attack laser
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Render curved combat targeting laser arrow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!selectedAttackerId) return;

    const attackerEl = document.querySelector(`[data-id] .ready-to-attack, [data-id] .active-attacker`);
    // Find the specific card element
    const matchingCard = document.querySelector(`.card.active-attacker`);
    if (!matchingCard) return;

    const rect = matchingCard.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const targetX = mousePos.x;
    const targetY = mousePos.y;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const cpX = (startX + targetX) / 2 + (targetY - startY) * 0.15;
    const cpY = (startY + targetY) / 2 - (targetX - startX) * 0.15;

    ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 16;
    ctx.setLineDash([8, 5]);
    ctx.stroke();

    // Arrow Target Point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [selectedAttackerId, mousePos]);

  // Handlers
  const handleCardClick = (card: CardInstance, playerId: 1 | 2) => {
    if (gameState.winner) return;

    // Friendly hand card clicked
    if (gameState.currentTurn === playerId) {
      if (card.type === 'spell' || card.type === 'ward') {
        // Direct cast or ward
        setGameState(s => playCard(s, card.instanceId));
        clearSelections();
      } else {
        // Select creature to drop
        if (selectedHandCardId === card.instanceId) {
          // Double tap plays in first available lane
          setGameState(s => playCard(s, card.instanceId));
          clearSelections();
        } else {
          setSelectedHandCardId(card.instanceId);
          soundEngine.playHover();
        }
      }
    }
  };

  const handleBoardCreatureClick = (creature: CardInstance, playerId: 1 | 2, laneIdx: number) => {
    if (gameState.winner) return;

    const isFriendly = gameState.currentTurn === playerId;

    if (isFriendly) {
      // In-place ascension check: if friendly hand card selected, attempt ascension
      if (selectedHandCardId) {
        setGameState(s => playCard(s, selectedHandCardId, laneIdx));
        clearSelections();
        return;
      }

      // Ready attacker selection
      if (creature.canAttack && !creature.hasAttackedThisTurn && !creature.frozen && !activePlayer.isAI) {
        if (selectedAttackerId === creature.instanceId) {
          clearSelections();
        } else {
          setSelectedAttackerId(creature.instanceId);
          soundEngine.playHover();
        }
      }
    } else {
      // Opponent creature clicked as attack target
      if (selectedAttackerId) {
        setGameState(s => declareAttack(s, selectedAttackerId, 'creature', laneIdx));
        clearSelections();
      }
    }
  };

  const handleVanguardClick = (targetPlayerId: 1 | 2) => {
    if (gameState.winner) return;

    // Direct strike against opponent hero
    if (selectedAttackerId && gameState.currentTurn !== targetPlayerId) {
      setGameState(s => declareAttack(s, selectedAttackerId, 'vanguard', null));
      clearSelections();
    }
  };

  const handleLaneSlotClick = (laneIdx: number, playerId: 1 | 2) => {
    if (gameState.winner) return;
    if (selectedHandCardId && gameState.currentTurn === playerId) {
      setGameState(s => playCard(s, selectedHandCardId, laneIdx));
      clearSelections();
    }
  };

  // Selected hand card reference
  const selectedCardInHand = activePlayer.hand.find(c => c.instanceId === selectedHandCardId);

  // Check Taunt on opponent board
  const oppTaunters = opponentPlayer.board.filter(c => c && c.hasTaunt);

  // Safe Mana & MaxMana getters to prevent NaN in active sessions
  const p1Mana = gameState.players[0].mana ?? (gameState.players[0] as any).aether ?? 1;
  const p1MaxMana = gameState.players[0].maxMana ?? (gameState.players[0] as any).maxAether ?? 1;
  const p2Mana = gameState.players[1].mana ?? (gameState.players[1] as any).aether ?? 1;
  const p2MaxMana = gameState.players[1].maxMana ?? (gameState.players[1] as any).maxAether ?? 1;

  return (
    <div
      className="battle-arena-view flex flex-col flex-1 w-full max-w-[1560px] mx-auto p-2 md:p-4 gap-2 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Targeting Laser Canvas */}
      <canvas
        ref={canvasRef}
        className="combat-arrow-canvas fixed inset-0 pointer-events-none z-[400]"
      />

      {/* Arena Sub-Header Topbar */}
      <div className="arena-topbar flex flex-wrap items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 backdrop-blur-md gap-3 shadow-lg">
        <div className="match-info-pill flex items-center gap-2 md:gap-3 text-xs md:text-sm font-mono">
          <span className="mode-badge px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold flex items-center gap-1.5">
            {gameState.mode === 'couch_2p' ? <User className="w-3.5 h-3.5 text-purple-400" /> : <Bot className="w-3.5 h-3.5 text-sky-400" />}
            {gameState.mode === 'couch_2p' ? 'Local 2P Couch Duel' : 'Solo vs AI Tactician'}
          </span>
          <span className="turn-indicator-badge font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            {activePlayer.name}&apos;s Turn
          </span>
          <span className="text-slate-400">Round {gameState.round}</span>
        </div>

        <div className="phase-tracker flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800 text-xs font-mono">
          <span className="phase-step active bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-0.5 rounded-full uppercase">
            Main Phase
          </span>
          <span className="phase-step text-slate-400 px-2 py-0.5 uppercase">
            Combat Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewDuel}
            className="btn btn-outline px-3 py-1.5 text-xs flex items-center gap-1.5 hover:border-amber-500/60"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            New Duel
          </button>
        </div>
      </div>

      {/* Duel Mat Board */}
      <div className="duel-mat flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-3 md:p-5 relative shadow-2xl overflow-hidden">
        {/* Center Divider Line */}
        <div className="mat-center-divider absolute top-1/2 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent pointer-events-none" />

        {/* =========================================================================
            OPPONENT ZONE (PLAYER 2 / AI)
            ========================================================================= */}
        <div className="player-mat-zone opponent-zone flex flex-col gap-2 relative z-10">
          <div className="mat-row flex flex-wrap items-center justify-between gap-3">
            {/* Vanguard Hero Box (P2) */}
            <div
              className={`vanguard-box flex items-center gap-3 bg-slate-900/90 border rounded-xl p-2.5 min-w-[240px] md:min-w-[280px] shadow-lg cursor-pointer transition-all ${
                selectedAttackerId && isPlayer1Turn && oppTaunters.length === 0
                  ? 'border-red-500 ring-2 ring-red-500/60 animate-pulse'
                  : !isPlayer1Turn
                  ? 'border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => handleVanguardClick(2)}
              title={selectedAttackerId && isPlayer1Turn ? 'Click to declare DIRECT ATTACK on Vanguard!' : ''}
            >
              <div className="vanguard-avatar relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                <Image
                  src={gameState.players[1].vanguard.avatar}
                  alt={gameState.players[1].vanguard.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="vanguard-info flex flex-col flex-1 gap-1">
                <div className="vanguard-name text-xs md:text-sm font-bold text-slate-100 font-serif flex items-center justify-between">
                  <span>{gameState.players[1].name}</span>
                  <span className="text-[10px] text-purple-400 font-mono">({gameState.players[1].vanguard.name})</span>
                </div>
                <div className="vanguard-hp-bar-wrap w-full h-3 bg-rose-950/80 rounded-full overflow-hidden border border-rose-800/50 relative">
                  <div
                    className="vanguard-hp-bar h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, (gameState.players[1].vanguard.hp / gameState.players[1].vanguard.maxHp) * 100)}%`
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-black text-white drop-shadow">
                    {gameState.players[1].vanguard.hp} / {gameState.players[1].vanguard.maxHp} HP
                  </span>
                </div>
              </div>
            </div>

            {/* Secret Wards (P2) */}
            <div className="secret-wards-row flex items-center gap-2">
              {gameState.players[1].wards.map((ward, idx) => (
                <div
                  key={`p2_ward_${idx}`}
                  className={`ward-slot-chip w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs transition-all ${
                    ward
                      ? 'border-purple-500 bg-purple-950/80 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : 'border-dashed border-slate-800 bg-slate-950/40 text-slate-700'
                  }`}
                  title={ward ? 'Face-Down Secret Ward Active' : 'Empty Ward Slot'}
                >
                  <ShieldAlert className={`w-4 h-4 ${ward ? 'text-purple-400' : 'text-slate-700'}`} />
                </div>
              ))}
            </div>

            {/* Opponent Mana & Piles */}
            <div className="flex items-center gap-3">
              <div className="aether-meter-wrap flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="aether-count-text font-mono text-xs font-bold text-sky-400">
                  {p2Mana} / {p2MaxMana}
                </span>
                <div className="aether-crystals-row flex gap-1">
                  {Array.from({ length: p2MaxMana }).map((_, i) => (
                    <div
                      key={`p2_gem_${i}`}
                      className={`aether-gem w-2.5 h-3.5 rounded-sm border ${
                        i < p2Mana
                          ? 'bg-gradient-to-b from-sky-400 to-blue-600 border-sky-300 shadow-[0_0_6px_rgba(56,189,248,0.7)]'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="piles-group flex gap-2">
                <div
                  className="card-pile w-11 h-16 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-[9px] font-mono text-slate-400 shadow-sm"
                  title="Opponent Deck"
                >
                  <span>DECK</span>
                  <span className="pile-count-badge font-bold text-slate-200 text-xs">
                    {gameState.players[1].deck.length}
                  </span>
                </div>
                <div
                  className="card-pile w-11 h-16 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-[9px] font-mono text-slate-400 shadow-sm"
                  title="Opponent Graveyard"
                >
                  <span>GRAVE</span>
                  <span className="pile-count-badge font-bold text-slate-200 text-xs">
                    {gameState.players[1].graveyard.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Opponent Hand */}
          <div className="hand-container opponent-hand flex justify-center items-center gap-[-20px] min-h-[120px] py-1">
            {gameState.players[1].hand.map((card, idx) => {
              const hideCards = (gameState.mode === 'couch_2p' && isPlayer1Turn) || gameState.players[1].isAI;
              return (
                <div key={card.instanceId || `p2_card_${idx}`} className="transition-all -mx-2 hover:translate-y-1">
                  <Card
                    card={card}
                    isFaceDown={hideCards}
                    size="sm"
                    onInspect={onInspectCard}
                    onClick={() => {
                      if (!hideCards) handleCardClick(card, 2);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Opponent Lanes */}
          <div className="lanes-container flex justify-center gap-3 py-1">
            {gameState.players[1].board.map((creature, laneIdx) => {
              const isTargetCandidate = !!selectedAttackerId && isPlayer1Turn;
              const isTaunter = creature && creature.hasTaunt;
              const isTargetValid = isTargetCandidate && (oppTaunters.length === 0 || isTaunter);

              return (
                <div
                  key={`p2_lane_${laneIdx}`}
                  className={`creature-lane-slot w-[135px] h-[190px] rounded-xl border border-dashed flex items-center justify-center relative transition-all ${
                    creature
                      ? 'border-transparent'
                      : 'border-slate-800 bg-slate-950/30'
                  }`}
                >
                  {creature ? (
                    <Card
                      card={creature}
                      isValidTarget={!!isTargetValid}
                      onInspect={onInspectCard}
                      onClick={() => handleBoardCreatureClick(creature, 2, laneIdx)}
                    />
                  ) : (
                    <span className="lane-placeholder-num font-mono text-xl font-black text-slate-800 select-none">
                      {laneIdx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            ACTIVE PLAYER ZONE (PLAYER 1)
            ========================================================================= */}
        <div className="player-mat-zone active-player-zone flex flex-col gap-2 relative z-10">
          {/* Player 1 Lanes */}
          <div className="lanes-container flex justify-center gap-3 py-1">
            {gameState.players[0].board.map((creature, laneIdx) => {
              const isTurn = isPlayer1Turn;
              const isReady = !!(isTurn && creature && creature.canAttack && !creature.hasAttackedThisTurn && !creature.frozen);
              const isAttackerSelected = !!(creature && creature.instanceId === selectedAttackerId);

              // Ascension candidate check
              const isAscendable = !!(
                selectedCardInHand &&
                selectedCardInHand.type === 'creature' &&
                selectedCardInHand.form &&
                creature &&
                creature.form &&
                selectedCardInHand.form > creature.form &&
                calculateAscensionCost(selectedCardInHand, creature) <= activePlayer.mana
              );

              return (
                <div
                  key={`p1_lane_${laneIdx}`}
                  className={`creature-lane-slot w-[135px] h-[190px] rounded-xl border flex items-center justify-center relative transition-all cursor-pointer ${
                    creature
                      ? 'border-transparent'
                      : selectedHandCardId && isPlayer1Turn
                      ? 'border-sky-500/60 bg-sky-950/30 ring-2 ring-sky-400/40 animate-pulse'
                      : 'border-dashed border-slate-800 bg-slate-950/30 hover:border-slate-700'
                  }`}
                  onClick={() => {
                    if (!creature) handleLaneSlotClick(laneIdx, 1);
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (draggedCardId && isPlayer1Turn) {
                      setGameState(s => playCard(s, draggedCardId, laneIdx));
                      clearSelections();
                    }
                  }}
                >
                  {creature ? (
                    <Card
                      card={creature}
                      isReadyToAttack={isReady}
                      isSelectedAttacker={isAttackerSelected}
                      isAscensionCandidate={isAscendable}
                      onInspect={onInspectCard}
                      onClick={() => handleBoardCreatureClick(creature, 1, laneIdx)}
                    />
                  ) : (
                    <span className="lane-placeholder-num font-mono text-xl font-black text-slate-800 select-none">
                      {laneIdx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Player 1 Hand */}
          <div className="hand-container player-hand flex justify-center items-center gap-[-20px] min-h-[140px] py-1">
            {gameState.players[0].hand.map((card, idx) => {
              const isSelected = selectedHandCardId === card.instanceId;
              const discount = selectedCardInHand ? 0 : 0;

              return (
                <div
                  key={card.instanceId || `p1_card_${idx}`}
                  className={`transition-all -mx-2 hover:translate-y-[-16px] hover:scale-105 z-20 ${
                    isSelected ? 'translate-y-[-24px] scale-110 z-30 ring-2 ring-amber-400 rounded-xl' : ''
                  }`}
                >
                  <Card
                    card={card}
                    isFaceDown={false}
                    draggable={isPlayer1Turn}
                    onDragStart={() => {
                      setDraggedCardId(card.instanceId);
                      setSelectedHandCardId(card.instanceId);
                    }}
                    onInspect={onInspectCard}
                    onClick={() => handleCardClick(card, 1)}
                    discountAmount={discount}
                  />
                </div>
              );
            })}
          </div>

          {/* Player 1 Vanguard Row */}
          <div className="mat-row flex flex-wrap items-center justify-between gap-3">
            {/* Vanguard Box (P1) */}
            <div
              className={`vanguard-box flex items-center gap-3 bg-slate-900/90 border rounded-xl p-2.5 min-w-[240px] md:min-w-[280px] shadow-lg transition-all ${
                isPlayer1Turn
                  ? 'border-sky-500/80 shadow-[0_0_18px_rgba(56,189,248,0.3)]'
                  : 'border-slate-800'
              }`}
            >
              <div className="vanguard-avatar relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                <Image
                  src={gameState.players[0].vanguard.avatar}
                  alt={gameState.players[0].vanguard.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="vanguard-info flex flex-col flex-1 gap-1">
                <div className="vanguard-name text-xs md:text-sm font-bold text-slate-100 font-serif flex items-center justify-between">
                  <span>{gameState.players[0].name}</span>
                  <span className="text-[10px] text-amber-400 font-mono">({gameState.players[0].vanguard.name})</span>
                </div>
                <div className="vanguard-hp-bar-wrap w-full h-3 bg-rose-950/80 rounded-full overflow-hidden border border-rose-800/50 relative">
                  <div
                    className="vanguard-hp-fill h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, Math.min(100, (gameState.players[0].vanguard.hp / gameState.players[0].vanguard.maxHp) * 100))}%`
                    }}
                  />
                  <span className="vanguard-hp-text absolute inset-0 flex items-center justify-center text-[9px] font-black text-white font-mono drop-shadow">
                    {gameState.players[0].vanguard.hp} / {gameState.players[0].vanguard.maxHp} HP
                  </span>
                </div>
              </div>

              {/* Hero Power Button (P1) */}
              <button
                type="button"
                disabled={
                  gameState.players[0].vanguard.heroPowerUsed ||
                  gameState.players[0].mana < gameState.players[0].vanguard.heroPower.cost ||
                  !isPlayer1Turn
                }
                onClick={() => {
                  if (isPlayer1Turn) setGameState(s => activateHeroPower(s));
                }}
                className={`hero-power-btn w-11 h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                  !gameState.players[0].vanguard.heroPowerUsed &&
                  gameState.players[0].mana >= gameState.players[0].vanguard.heroPower.cost &&
                  isPlayer1Turn
                    ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-sky-400 text-sky-200 hover:scale-105 shadow-[0_0_12px_rgba(56,189,248,0.5)] cursor-pointer'
                    : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                }`}
                title={`${gameState.players[0].vanguard.heroPower.name} (2 Mana): ${gameState.players[0].vanguard.heroPower.desc}`}
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="hero-power-cost absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold border border-blue-300">
                  2
                </span>
              </button>
            </div>

            {/* Player 1 Wards */}
            <div className="wards-container flex gap-2">
              {gameState.players[0].wards.map((ward, idx) => (
                <div
                  key={`p1_ward_${idx}`}
                  className={`ward-slot w-12 h-16 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono transition-all ${
                    ward
                      ? 'border-purple-500/80 bg-purple-950/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'border-dashed border-slate-800 bg-slate-950/40 text-slate-700'
                  }`}
                  title={ward ? `${ward.name}: ${ward.desc}` : 'Empty Ward Slot'}
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${ward ? 'text-purple-400' : 'text-slate-700'}`} />
                  <span>{ward ? ward.name.substring(0, 5) : '[+]'}</span>
                </div>
              ))}
            </div>

            {/* Player 1 Mana & Actions */}
            <div className="flex items-center gap-3">
              <div className="aether-meter-wrap flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="aether-count-text font-mono text-xs font-bold text-sky-400">
                  {p1Mana} / {p1MaxMana}
                </span>
                <div className="aether-crystals-row flex gap-1">
                  {Array.from({ length: p1MaxMana }).map((_, i) => (
                    <div
                      key={`p1_gem_${i}`}
                      className={`aether-gem w-2.5 h-3.5 rounded-sm border ${
                        i < p1Mana
                          ? 'bg-gradient-to-b from-sky-400 to-blue-600 border-sky-300 shadow-[0_0_6px_rgba(56,189,248,0.7)]'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="piles-group flex gap-2">
                <div
                  className="card-pile w-11 h-16 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-[9px] font-mono text-slate-400 shadow-sm"
                  title="Your Deck"
                >
                  <span>DECK</span>
                  <span className="pile-count-badge font-bold text-slate-200 text-xs">
                    {gameState.players[0].deck.length}
                  </span>
                </div>
                <div
                  className="card-pile w-11 h-16 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-[9px] font-mono text-slate-400 shadow-sm"
                  title="Your Graveyard"
                >
                  <span>GRAVE</span>
                  <span className="pile-count-badge font-bold text-slate-200 text-xs">
                    {gameState.players[0].graveyard.length}
                  </span>
                </div>
              </div>

              {/* End Turn Action Button */}
              <div className="battle-actions-bar">
                <button
                  type="button"
                  disabled={gameState.winner !== null || activePlayer.isAI}
                  onClick={() => {
                    setGameState(s => endTurn(s));
                    clearSelections();
                  }}
                  className={`btn-end-turn px-6 py-3 rounded-xl font-bold font-mono tracking-wider transition-all shadow-lg ${
                    activePlayer.isAI
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer'
                  }`}
                >
                  {activePlayer.isAI ? 'AI Thinking...' : 'End Turn (Space)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Action Log Drawer (Top Left) */}
        <div className="battle-log-pane absolute top-3 left-3 w-64 max-h-44 bg-slate-950/85 border border-slate-800/80 rounded-xl p-2.5 overflow-y-auto font-mono text-[11px] flex flex-col gap-1.5 backdrop-blur-md shadow-2xl z-30 pointer-events-auto">
          {gameState.actionLogs.slice(0, 15).map(log => (
            <div
              key={log.id}
              className={`log-entry border-b border-slate-800/40 pb-1 ${
                log.type === 'log-attack'
                  ? 'text-rose-400'
                  : log.type === 'log-summon'
                  ? 'text-sky-300'
                  : log.type === 'log-ascend'
                  ? 'text-amber-300 font-semibold'
                  : log.type === 'log-trap'
                  ? 'text-purple-300 font-semibold'
                  : log.type === 'log-turn'
                  ? 'text-emerald-300 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-slate-500 mr-1">[{log.time}]</span>
              {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
