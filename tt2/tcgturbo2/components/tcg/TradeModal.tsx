'use client';

import React, { useState } from 'react';
import { CARDS_DATA } from '@/lib/tcg/cardsData';
import { PlayerCollection, tradeOrGiftCard } from '@/lib/tcg/collectionEngine';
import { Card } from './Card';
import { Gift, ShieldCheck, X } from 'lucide-react';
import { soundEngine } from '@/lib/tcg/soundEngine';

interface TradeModalProps {
  isOpen: boolean;
  collection: PlayerCollection;
  onUpdateCollection: (updated: PlayerCollection) => void;
  onClose: () => void;
}

export function TradeModal({
  isOpen,
  collection,
  onUpdateCollection,
  onClose
}: TradeModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>('player_2');
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const eligibleCards = CARDS_DATA.filter(c => (collection.ownedCards[c.id] || 0) > 1);
  const selectedCardDef = CARDS_DATA.find(c => c.id === selectedCardId);

  const handleSendGift = () => {
    if (!selectedCardId) return;

    soundEngine.playTurnChime();
    const result = tradeOrGiftCard(collection, selectedCardId, recipient);

    if (result.success) {
      onUpdateCollection(result.updatedSender);
      setTradeMessage(`Successfully gifted 1x ${selectedCardDef?.name} to ${recipient}!`);
      setSelectedCardId(null);
    } else {
      setTradeMessage('Could not trade. You must keep at least 1 copy of every card.');
    }
  };

  return (
    <div className="trade-modal fixed inset-0 z-[650] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="trade-box bg-slate-900/95 border-2 border-purple-500/50 shadow-[0_0_80px_rgba(168,85,247,0.3)] rounded-3xl p-6 md:p-8 max-w-2xl w-full flex flex-col gap-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-400/60 flex items-center justify-center text-purple-300">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-black text-white">
              Free Card Gifting & Trading
            </h2>
            <p className="text-slate-400 text-xs font-mono">
              Share duplicate cards with friends and rivals for free ($0.00 USD value).
            </p>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-purple-950/40 border border-purple-500/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-purple-200">
          <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>100% Free & Legal (US Entertainment Software Standard):</strong> All card trades/gifts are strictly peer-to-peer virtual transfers with zero real money, cash value, or financial exchange allowed.
          </span>
        </div>

        {tradeMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/60 p-3 rounded-xl text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span>{tradeMessage}</span>
            <button
              type="button"
              onClick={() => setTradeMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Card Selection Grid */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">
              Select Duplicate Card to Gift (Extra Copies):
            </span>
            <div className="catalog-scroll max-h-56 overflow-y-auto grid grid-cols-3 gap-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              {eligibleCards.map(c => {
                const count = collection.ownedCards[c.id] || 0;
                const isSelected = selectedCardId === c.id;

                return (
                  <div
                    key={`trade_${c.id}`}
                    onClick={() => {
                      soundEngine.playHover();
                      setSelectedCardId(c.id);
                    }}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-purple-400 scale-105' : 'hover:scale-102 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="scale-75 origin-top-left -mr-8 -mb-12">
                      <Card card={c} />
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 font-bold block text-center mt-1">
                      {count - 1} extra copy
                    </span>
                  </div>
                );
              })}
              {eligibleCards.length === 0 && (
                <div className="col-span-3 py-8 text-center text-slate-500 text-xs italic">
                  No duplicate cards available. Win duels to open booster packs!
                </div>
              )}
            </div>
          </div>

          {/* Recipient & Confirmation */}
          <div className="w-full md:w-64 flex flex-col gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 justify-between">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 block mb-1">
                  RECIPIENT PLAYER:
                </label>
                <select
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg outline-none"
                >
                  <option value="player_2">Player 2 (Local Rival)</option>
                  <option value="player_friend">Friend Account</option>
                </select>
              </div>

              {selectedCardDef && (
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                  <strong className="text-white block font-serif">{selectedCardDef.name}</strong>
                  <span className="text-slate-400 font-mono">{selectedCardDef.element} • {selectedCardDef.rarity}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedCardId}
              onClick={handleSendGift}
              className="btn btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Gift className="w-4 h-4 text-purple-300" />
              Gift Card (Free Transfer)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
