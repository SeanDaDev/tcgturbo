'use client';

import React, { useState } from 'react';
import {
  PlayerCollection,
  buyCosmeticItem,
  equipCosmeticItem,
  addGemPackage
} from '@/lib/tcg/collectionEngine';
import { COSMETIC_ITEMS, CURRENCY_PACKAGES } from '@/lib/tcg/cosmeticsData';
import { CosmeticType, CosmeticItem, CurrencyPackage } from '@/lib/tcg/types';
import { soundEngine } from '@/lib/tcg/soundEngine';
import {
  ShoppingBag,
  Sparkles,
  CreditCard,
  CheckCircle2,
  X,
  ShieldCheck,
  Check,
  PlusCircle,
  Gem,
  Lock
} from 'lucide-react';

interface CosmeticsShopModalProps {
  isOpen: boolean;
  collection: PlayerCollection;
  onUpdateCollection: (updated: PlayerCollection) => void;
  onClose: () => void;
}

export function CosmeticsShopModal({
  isOpen,
  collection,
  onUpdateCollection,
  onClose
}: CosmeticsShopModalProps) {
  const [activeTab, setActiveTab] = useState<CosmeticType | 'buy_gems'>('card_back');
  const [selectedPackage, setSelectedPackage] = useState<CurrencyPackage | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyItem = (item: CosmeticItem) => {
    const res = buyCosmeticItem(collection, item.id);
    if (res.success) {
      soundEngine.playVictory();
      onUpdateCollection(res.updatedCollection);
      showToast(`🎉 ${res.message}`);
    } else {
      soundEngine.playTrap();
      showToast(`⚠️ ${res.message}`);
    }
  };

  const handleEquipItem = (item: CosmeticItem) => {
    soundEngine.playHover();
    const updated = equipCosmeticItem(collection, item.id);
    onUpdateCollection(updated);
    showToast(`✨ Equipped ${item.name}!`);
  };

  const handleSimulateCheckout = () => {
    if (!selectedPackage) return;

    soundEngine.playVictory();
    const totalGems = selectedPackage.gems + selectedPackage.bonusGems;
    const updated = addGemPackage(collection, totalGems, selectedPackage.priceUSD);
    onUpdateCollection(updated);

    setCheckoutSuccessMessage(
      `Payment Successful! +${totalGems.toLocaleString()} Astral Gems added to your account.`
    );

    setTimeout(() => {
      setCheckoutSuccessMessage(null);
      setIsCheckoutOpen(false);
      setSelectedPackage(null);
    }, 2500);
  };

  const usdValue = (collection.gemBalance / 100).toFixed(2);
  const filteredItems = COSMETIC_ITEMS.filter(c => c.type === activeTab);

  return (
    <div className="cosmetics-shop-modal fixed inset-0 z-[650] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300">
      <div className="shop-box bg-slate-900/95 border-2 border-amber-500/40 shadow-[0_0_90px_rgba(245,158,11,0.25)] rounded-3xl p-5 md:p-8 max-w-5xl w-full h-[90vh] flex flex-col gap-5 relative overflow-hidden backdrop-blur-2xl">
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="absolute top-16 right-8 z-50 bg-slate-950/95 border border-amber-400 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs backdrop-blur-md animate-in slide-in-from-top">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            {toastMessage}
          </div>
        )}

        {/* Store Header & Balance Row */}
        <div className="shop-header flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-yellow-300 flex items-center justify-center text-slate-950 shadow-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-200 via-sky-300 to-indigo-200 bg-clip-text text-transparent uppercase tracking-wider">
                🛍️ Cosmetics Vault & Gem Exchange
              </h2>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                100% Visual Cosmetics • Zero Pay-to-Win • Pure Style & Customization
              </span>
            </div>
          </div>

          {/* Currency Balance Badge */}
          <div className="balance-pill flex items-center gap-3 bg-slate-950/90 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-lg">
            <Gem className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                COSMETIC BALANCE:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm md:text-base font-black text-amber-300">
                  {collection.gemBalance.toLocaleString()} Gems
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                  ${usdValue} Credit
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('buy_gems');
                soundEngine.playHover();
              }}
              className="btn btn-gold px-3 py-1 text-xs font-extrabold flex items-center gap-1 rounded-xl shadow-md hover:scale-105 transition-transform"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Gems
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="shop-tabs flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'card_back', label: '🂠 Card Backs' },
            { id: 'avatar_border', label: '👑 Avatar Borders' },
            { id: 'board_theme', label: '⚔️ Arena Themes' },
            { id: 'foil_style', label: '✨ Foil Shaders' },
            { id: 'buy_gems', label: '💳 Buy Gems ($ USD)' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`shop-tab-btn px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
              onClick={() => {
                setActiveTab(tab.id as CosmeticType | 'buy_gems');
                soundEngine.playHover();
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="shop-content-area flex-1 overflow-y-auto pr-1">
          {activeTab !== 'buy_gems' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
              {filteredItems.map(item => {
                const isOwned = collection.ownedCosmetics.includes(item.id);
                const isEquipped =
                  (item.type === 'card_back' && collection.equippedCosmetics.cardBack === item.id) ||
                  (item.type === 'avatar_border' && collection.equippedCosmetics.avatarBorder === item.id) ||
                  (item.type === 'board_theme' && collection.equippedCosmetics.boardTheme === item.id) ||
                  (item.type === 'foil_style' && collection.equippedCosmetics.foilStyle === item.id);

                return (
                  <div
                    key={item.id}
                    className={`cosmetic-card bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between gap-3 relative transition-all group hover:scale-[1.02] ${
                      isEquipped
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : isOwned
                        ? 'border-slate-700 bg-slate-900/60'
                        : 'border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Badge */}
                    {item.badge && (
                      <span className="absolute top-3 right-3 font-mono text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                        {item.badge}
                      </span>
                    )}

                    {/* Preview Graphic Box */}
                    <div
                      className={`preview-box h-32 rounded-xl bg-gradient-to-tr ${item.previewColor} border border-slate-700/60 flex items-center justify-center relative overflow-hidden shadow-inner`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/40 pointer-events-none" />
                      <span className="font-serif font-bold text-white text-xs uppercase text-center px-2 drop-shadow">
                        {item.name}
                      </span>
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-slate-100">{item.name}</span>
                        <span className="font-mono text-[10px] uppercase font-bold text-purple-400">
                          {item.rarity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-snug">{item.desc}</p>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="mt-2">
                      {isEquipped ? (
                        <div className="w-full py-2 bg-amber-950/80 border border-amber-400 text-amber-300 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-amber-400" />
                          EQUIPPED
                        </div>
                      ) : isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleEquipItem(item)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Equip Item
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyItem(item)}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-105"
                        >
                          <Gem className="w-3.5 h-3.5 text-slate-950" />
                          Unlock for {item.priceGems.toLocaleString()} Gems (${item.priceUSD.toFixed(2)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* REAL-MONEY GEM PACKAGES BUY TAB */
            <div className="flex flex-col gap-6 py-2">
              <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-300">
                    💳 Real-Money Cosmetic Currency Store (Placeholder Gateway)
                  </h3>
                  <p className="text-slate-300 text-xs font-mono">
                    Purchase additional Astral Gems to unlock exclusive Card Backs, Holographic Foils, and Arena Skins.
                  </p>
                </div>
                <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold">
                  Pre-loaded Credit: $100.00 USD (10,000 Gems)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {CURRENCY_PACKAGES.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`pkg-card bg-slate-950/90 border rounded-2xl p-5 flex flex-col justify-between gap-4 relative transition-all hover:scale-105 ${
                      pkg.popular
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-3 right-4 font-mono text-[9px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 uppercase shadow-md">
                        {pkg.badge}
                      </span>
                    )}

                    <div className="flex flex-col items-center text-center gap-2 pt-2">
                      <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg">
                        <Gem className="w-8 h-8 text-amber-400 animate-pulse" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-white">{pkg.name}</h4>
                      <div className="font-mono text-2xl font-black text-amber-300">
                        {(pkg.gems + pkg.bonusGems).toLocaleString()} Gems
                      </div>
                      {pkg.bonusGems > 0 && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ({pkg.gems} Base + {pkg.bonusGems} Bonus)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setIsCheckoutOpen(true);
                        soundEngine.playTurnChime();
                      }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-sm font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
                    >
                      <CreditCard className="w-4 h-4" />
                      Buy for ${pkg.priceUSD.toFixed(2)} USD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="shop-footer bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="leading-snug">
            <strong className="text-emerald-300">FTC & Fair Play Cosmetics Charter:</strong> 100% Visual Cosmetics Only. Purchasing Astral Gems or cosmetics grants zero card strength, stat bonuses, or competitive gameplay advantages. Virtual items cannot be redeemed or cashed out for fiat currency.
          </p>
        </div>
      </div>

      {/* REAL-MONEY CHECKOUT PLACEHOLDER MODAL */}
      {isCheckoutOpen && selectedPackage && (
        <div className="fixed inset-0 z-[750] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="checkout-box bg-slate-900 border-2 border-emerald-500/60 shadow-[0_0_80px_rgba(16,185,129,0.3)] rounded-3xl p-6 md:p-8 max-w-md w-full flex flex-col gap-5 relative backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Simulated Stripe Checkout</h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  ✦ Real-Money Payment Gateway Placeholder ✦
                </span>
              </div>
            </div>

            {checkoutSuccessMessage ? (
              <div className="py-8 flex flex-col items-center text-center gap-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <h4 className="font-serif font-bold text-xl text-white">Payment Approved!</h4>
                <p className="text-xs font-mono text-emerald-300">{checkoutSuccessMessage}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{selectedPackage.name}</span>
                  <span className="font-bold text-amber-300">
                    {(selectedPackage.gems + selectedPackage.bonusGems).toLocaleString()} Gems
                  </span>
                  <span className="font-black text-white">${selectedPackage.priceUSD.toFixed(2)} USD</span>
                </div>

                {/* Mock Credit Card Form */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Payment Method Placeholder:
                  </label>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Test Card)"
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-mono cursor-not-allowed opacity-70"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      value="MM/YY: 12/28"
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-mono flex-1 cursor-not-allowed opacity-70"
                    />
                    <input
                      type="text"
                      disabled
                      value="CVC: 888"
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-mono w-24 cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit SSL Encrypted Simulated Transaction</span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-sm font-black rounded-xl flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  Simulate ${selectedPackage.priceUSD.toFixed(2)} USD Purchase
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
