'use client';

import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { CardDef, CardInstance } from '@/lib/tcg/types';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface CardProps {
  card: CardDef | CardInstance | null;
  isFaceDown?: boolean;
  isReadyToAttack?: boolean;
  isSelectedAttacker?: boolean;
  isValidTarget?: boolean;
  isAscensionCandidate?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onInspect?: (card: CardDef | CardInstance) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  discountAmount?: number;
  equippedCardBack?: string;
  equippedFoilStyle?: string;
  isPlayable?: boolean;
}

export function Card({
  card,
  isFaceDown = false,
  isReadyToAttack = false,
  isSelectedAttacker = false,
  isValidTarget = false,
  isAscensionCandidate = false,
  isPlayable = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onInspect,
  draggable = false,
  onDragStart,
  className = '',
  size = 'md',
  discountAmount = 0,
  equippedCardBack = 'card_back_default',
  equippedFoilStyle = 'foil_style_default'
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [px, setPx] = useState(50);
  const [py, setPy] = useState(50);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFaceDown) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pointerX = (x / rect.width) * 100;
    const pointerY = (y / rect.height) * 100;

    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -14;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 14;

    setPx(pointerX);
    setPy(pointerY);
    setRx(rotX);
    setRy(rotY);
    setOpacity(1);
  }, [isFaceDown]);

  const handleMouseLeave = useCallback(() => {
    setRx(0);
    setRy(0);
    setOpacity(0);
  }, []);

  const handleMouseEnter = useCallback(() => {
    soundEngine.playHover();
  }, []);

  if (isFaceDown || !card) {
    return (
      <div className={`card-wrapper select-none ${className}`}>
        <div
          className={`card card-back size-${size} relative overflow-hidden flex items-center justify-center`}
          data-card-back={equippedCardBack}
          onClick={onClick}
        >
          <div className="card-back-inner">
            <div className="card-back-mandala">
              <div className="card-back-symbol" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const instance = card as Partial<CardInstance>;
  const isCreature = card.type === 'creature';
  const isSpell = card.type === 'spell';
  const isWard = card.type === 'ward';

  const formLabel = card.form === 1 ? 'I' : card.form === 2 ? 'II' : card.form === 3 ? 'III' : null;

  const currentAtk = instance.currentAtk !== undefined ? instance.currentAtk : card.atk || 0;
  const currentHp = instance.currentHp !== undefined ? instance.currentHp : card.hp || 0;
  const maxHp = instance.maxHp !== undefined ? instance.maxHp : card.hp || 0;

  const isDamaged = currentHp < maxHp;
  const isBuffed = currentHp > maxHp || (card.atk !== undefined && currentAtk > card.atk);
  const hasAegis = !!instance.hasAegis;
  const isFrozen = !!instance.frozen;

  const displayCost = discountAmount > 0 ? Math.max(1, card.cost - discountAmount) : card.cost;

  return (
    <div
      className={`card-wrapper select-none ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div
        ref={cardRef}
        className={`card size-${size} ${isReadyToAttack ? 'ready-to-attack' : ''} ${
          isSelectedAttacker ? 'active-attacker' : ''
        } ${isValidTarget ? 'valid-target' : ''} ${
          isAscensionCandidate ? 'ascension-candidate' : ''
        } ${isPlayable ? 'is-playable' : ''} ${hasAegis ? 'has-aegis' : ''} ${isFrozen ? 'is-frozen' : ''}`}
        data-id={card.id}
        data-element={card.element}
        data-rarity={card.rarity}
        data-type={card.type}
        data-foil-style={equippedFoilStyle}
        style={
          {
            '--card-rx': `${rx.toFixed(2)}deg`,
            '--card-ry': `${ry.toFixed(2)}deg`,
            '--pointer-x': `${px.toFixed(1)}%`,
            '--pointer-y': `${py.toFixed(1)}%`,
            '--card-opacity': opacity
          } as React.CSSProperties
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={onClick}
        onDoubleClick={e => {
          e.stopPropagation();
          if (onDoubleClick) onDoubleClick(e);
          else if (onInspect) onInspect(card);
        }}
        onContextMenu={e => {
          e.preventDefault();
          if (onContextMenu) onContextMenu(e);
          else if (onInspect) onInspect(card);
        }}
      >
        <div className="card-inner">
          {/* Holographic foil & glare dynamic shaders */}
          <div className={`card-foil foil-${equippedFoilStyle}`} />
          <div className="card-glare" />

          {/* Header */}
          <div className="card-frame-header">
            <span className="card-title" title={card.name}>
              {card.name}
            </span>
            <div
              className={`card-cost-gem ${discountAmount > 0 ? 'bg-amber-500 text-yellow-100 ring-2 ring-yellow-300' : ''}`}
              title={discountAmount > 0 ? `Cost discounted from ${card.cost} to ${displayCost}!` : `Mana Cost: ${card.cost}`}
            >
              {displayCost}
            </div>
          </div>

          {/* Artwork Box */}
          <div className="card-art-box">
            {onInspect && (
              <button
                type="button"
                className="card-inspect-btn"
                title="Inspect Card & Lore (Right-Click / 🔍)"
                onClick={e => {
                  e.stopPropagation();
                  onInspect(card);
                }}
              >
                🔍
              </button>
            )}

            <div className="relative w-full h-full">
              <Image
                src={card.art}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 140px, 160px"
                className="card-art-img"
                style={{ objectPosition: card.cropOffset || 'center 20%' }}
                priority={false}
              />
            </div>

            {formLabel && (
              <div className="card-form-badge" title={`Ascension Tier: Form ${formLabel}`}>
                Form {formLabel}
              </div>
            )}

            <div className="card-type-tag">
              {card.element} {card.type}
            </div>

            {isFrozen && (
              <div className="absolute inset-0 bg-cyan-500/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
                <span className="text-xl font-bold drop-shadow">❄️</span>
              </div>
            )}
          </div>

          {/* Ability / Rules Box */}
          <div className="card-text-box">
            <div>
              {(card.keywords || []).map(kw => (
                <span key={kw} className="card-keyword mr-1">
                  [{kw}]
                </span>
              ))}
              <span>{card.desc || ''}</span>
            </div>
          </div>

          {/* Bottom Bar */}
          {isCreature ? (
            <div className="card-stats-bar">
              <div className={`card-stat card-stat-atk ${currentAtk > (card.atk || 0) ? 'buffed' : ''}`} title="Attack Power">
                {currentAtk}
              </div>
              <div className="card-rarity-gem" title={`Rarity: ${card.rarity}`} />
              <div
                className={`card-stat card-stat-hp ${isDamaged ? 'damaged' : isBuffed ? 'buffed' : ''}`}
                title="Health"
              >
                {currentHp}
              </div>
            </div>
          ) : isSpell ? (
            <div className="card-stats-bar">
              <span className="card-spell-label">✦ SPELL ✦</span>
              <div className="card-rarity-gem" />
            </div>
          ) : isWard ? (
            <div className="card-stats-bar">
              <span className="card-spell-label">✦ SECRET WARD ✦</span>
              <div className="card-rarity-gem" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
