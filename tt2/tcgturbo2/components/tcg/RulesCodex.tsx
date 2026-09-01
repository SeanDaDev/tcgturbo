'use client';

import React from 'react';
import { BookOpen, ShieldCheck, Flame, Zap, Droplets, Sparkles, Sword } from 'lucide-react';

export function RulesCodex() {
  return (
    <div className="lore-view flex flex-col flex-1 w-full max-w-[1100px] mx-auto p-4 md:p-8 gap-8 h-[calc(100vh-70px)] overflow-y-auto">
      {/* Hero Header */}
      <div className="codex-hero-banner bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-700/80 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-widest font-bold mb-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Official Rulebook & Astral Lore Archives
        </div>
        <h2 className="codex-title text-2xl md:text-3xl font-black font-serif uppercase tracking-wider bg-gradient-to-r from-amber-200 via-sky-200 to-purple-300 bg-clip-text text-transparent mb-3">
          📜 Official Rulebook & Nexus Codex
        </h2>
        <p className="codex-text text-slate-300 text-sm md:text-base leading-relaxed">
          Welcome to the official rules compendium. TCG Turbo fuses the strategic foundations of{' '}
          <strong className="text-sky-300">Magic: The Gathering</strong> (mana curves & turn phases),{' '}
          <strong className="text-purple-300">Yu-Gi-Oh!</strong> (lane combat & facedown trap wards),{' '}
          <strong className="text-amber-300">Hearthstone</strong> (Vanguard heroes & direct minion trades), and{' '}
          <strong className="text-emerald-300">Pokémon</strong> (in-place creature ascension evolution) into a fast-paced, standalone tactical card game.
        </p>
      </div>

      {/* SECTION 1: OBJECTIVE & MATCH SETUP */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-sky-400 flex items-center gap-2">
          <Sword className="w-5 h-5 text-sky-400" />
          1. Objective of the Game & Match Setup
        </h3>
        <p className="codex-text text-slate-300 text-sm leading-relaxed">
          Each player commands a <strong className="text-white">Vanguard Champion</strong> starting with <strong className="text-rose-400">30 Health (HP)</strong>. Your primary objective is to reduce the enemy Vanguard to <strong className="text-rose-400">0 HP</strong> through tactical creature summons, in-place ascensions, direct attacks, and lethal arcane spells.
        </p>

        <div className="codex-step-list flex flex-col gap-3">
          <div className="codex-step-item flex gap-4 bg-slate-950/60 p-4 rounded-xl border-l-4 border-sky-400">
            <span className="codex-step-num font-mono font-black text-sky-400 text-lg">01</span>
            <div className="text-xs md:text-sm">
              <strong className="text-white block mb-1">Deck Construction:</strong>
              <p className="text-slate-400">
                Standard decks consist of 14 to 20 cards. You can include up to 3 copies of any individual card. Choose 1 Vanguard Champion whose passive identity and activated Hero Power fit your strategy.
              </p>
            </div>
          </div>

          <div className="codex-step-item flex gap-4 bg-slate-950/60 p-4 rounded-xl border-l-4 border-sky-400">
            <span className="codex-step-num font-mono font-black text-sky-400 text-lg">02</span>
            <div className="text-xs md:text-sm">
              <strong className="text-white block mb-1">Starting Hand & Hand Limit:</strong>
              <p className="text-slate-400">
                Both players begin the duel by drawing <strong className="text-white">4 cards</strong>. Maximum hand size is <strong className="text-white">8 cards</strong>. Any card drawn while your hand has 8 cards is immediately burned into your Graveyard.
              </p>
            </div>
          </div>

          <div className="codex-step-item flex gap-4 bg-slate-950/60 p-4 rounded-xl border-l-4 border-sky-400">
            <span className="codex-step-num font-mono font-black text-sky-400 text-lg">03</span>
            <div className="text-xs md:text-sm">
              <strong className="text-white block mb-1">Fatigue Rule:</strong>
              <p className="text-slate-400">
                If you attempt to draw a card when your deck is empty (0 cards remaining), your Vanguard takes <strong className="text-rose-400">2 Fatigue damage</strong> per draw.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE 4 TURN PHASES */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-sky-400 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          2. Turn Structure & Step Flow
        </h3>
        <p className="codex-text text-slate-300 text-sm leading-relaxed">
          Turns alternate sequentially between Player 1 and Player 2 (or AI). Every turn follows a rigid four-step cycle:
        </p>

        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/60 p-4 rounded-xl border-l-4 border-blue-400 text-xs md:text-sm">
            <strong className="text-blue-300 block font-bold mb-1">Phase 1: Mana Surge & Draw Step</strong>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Max Mana Growth:</strong> Max Mana increases by +1 each round up to a maximum cap of 10.<br />
              • <strong>Full Replenish:</strong> Current Mana refills to 100% of your Max Mana.<br />
              • <strong>Draw:</strong> Automatically draw 1 card from your deck.<br />
              • <strong>Awaken:</strong> All friendly non-frozen creatures on the battlefield become ready to attack. Any unit frozen from the prior turn thaws out.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border-l-4 border-yellow-400 text-xs md:text-sm">
            <strong className="text-yellow-300 block font-bold mb-1">Phase 2: Main Action Phase</strong>
            <p className="text-slate-400 leading-relaxed">
              Spend your available Mana in any order to perform actions:<br />
              • <strong>Summon Form I Initiates:</strong> Place a Form I creature onto any of your 5 battlefield lanes.<br />
              • <strong>In-Place Ascension:</strong> Play a Form II or Form III creature over an existing ally on the field.<br />
              • <strong>Cast Spells:</strong> Activate instant damage, card draws, heals, or mass freeze spells.<br />
              • <strong>Set Secret Wards:</strong> Place facedown reactive trap runes in your 3 Ward slots (Cost: 2 Mana).<br />
              • <strong>Hero Power (Surge):</strong> Pay 2 Mana to activate your Vanguard&apos;s unique ability (once per turn).
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border-l-4 border-rose-400 text-xs md:text-sm">
            <strong className="text-rose-300 block font-bold mb-1">Phase 3: Combat / Battle Phase</strong>
            <p className="text-slate-400 leading-relaxed">
              • Click on any ready creature (highlighted with a pulsing green glow) to engage the targeting laser.<br />
              • Target an enemy creature in any lane, OR click the enemy Vanguard&apos;s portrait for a direct strike.<br />
              • Combat damage is <strong>simultaneous</strong>: both the attacking unit and defending unit deal their ATK value to each other&apos;s HP!
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border-l-4 border-purple-400 text-xs md:text-sm">
            <strong className="text-purple-300 block font-bold mb-1">Phase 4: End Turn & Couch Co-Op Handover</strong>
            <p className="text-slate-400 leading-relaxed">
              • Click <strong>End Turn</strong> (or press <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-mono">Space</kbd>).<br />
              • In Local 2-Player Couch Co-op, the <strong>Privacy Shield Curtain</strong> immediately obscures the board so Player 1 can pass the keyboard/mouse to Player 2 without exposing secret wards or hand cards!
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: ASCENSION SYSTEM */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-sky-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          3. In-Place Ascension & Evolution Engine
        </h3>
        <p className="codex-text text-slate-300 text-sm leading-relaxed">
          Ascension is the central mechanic that allows low-cost initiates to evolve directly into titanic game-ending avatars:
        </p>

        <div className="bg-slate-950/80 border-l-4 border-amber-400 p-4 rounded-r-xl">
          <strong className="text-amber-300 text-sm md:text-base block mb-2">The Ascension Discount Formula</strong>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-2">
            When you summon a Form II or Form III creature <em>into an empty lane</em>, you pay its full printed Mana cost. However, when you <strong>Ascend</strong> it by dropping it directly onto an active friendly creature of the same element in a lane, you receive a discount:
          </p>
          <code className="bg-slate-900 text-yellow-300 px-3 py-1.5 rounded-lg font-mono text-xs font-bold inline-block border border-slate-800">
            Actual Cost = Max(1, Printed Cost - (Base Form Level × 2))
          </code>
        </div>

        <div className="bg-slate-950/80 border-l-4 border-sky-400 p-4 rounded-r-xl">
          <strong className="text-sky-300 text-sm md:text-base block mb-2">Ascension Rush & Ascension Bursts</strong>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            • <strong>Instant Attack:</strong> Unlike freshly summoned units that experience summoning sickness, an Ascended creature can attack immediately on the turn it ascends!<br />
            • <strong>Ascension Burst:</strong> Triggers an exclusive ultimate ability. For example: <em>Ignis, Astral Sovereign</em> deals 3 AoE damage to all enemy units upon ascension; <em>Tethys</em> draws 2 cards and freezes the entire enemy board.
          </p>
        </div>
      </section>

      {/* SECTION 4: KEYWORDS */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-sky-400 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          4. Keyword Glossary & Combat Mechanics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-950/60 text-amber-300 font-serif">
                <th className="p-3">Keyword</th>
                <th className="p-3">Effect Description</th>
                <th className="p-3">Example Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-3 text-amber-300 font-bold font-mono">[Taunt]</td>
                <td className="p-3 text-slate-300">Enemies MUST attack this unit before they can attack other friendly creatures or declare direct strikes on your Vanguard.</td>
                <td className="p-3 text-slate-400">Moss Sprite, Yggdrasil Ancient</td>
              </tr>
              <tr>
                <td className="p-3 text-yellow-400 font-bold font-mono">[Aegis]</td>
                <td className="p-3 text-slate-300">Divine energy shield. Completely absorbs and negates the next instance of damage, then breaks.</td>
                <td className="p-3 text-slate-400">Pyre Vanguard, Chronos</td>
              </tr>
              <tr>
                <td className="p-3 text-rose-400 font-bold font-mono">[Rush]</td>
                <td className="p-3 text-slate-300">Can attack enemy creatures or the Vanguard immediately on the turn it is summoned.</td>
                <td className="p-3 text-slate-400">Nyx Valkyrie, Ignis Apex</td>
              </tr>
              <tr>
                <td className="p-3 text-purple-400 font-bold font-mono">[Lifesteal]</td>
                <td className="p-3 text-slate-300">Whenever this creature deals damage, it restores an equal amount of HP to your Vanguard Champion.</td>
                <td className="p-3 text-slate-400">Nyx Eclipse Valkyrie, Dreadlord</td>
              </tr>
              <tr>
                <td className="p-3 text-sky-400 font-bold font-mono">[Freeze]</td>
                <td className="p-3 text-slate-300">Frozen units cannot declare attacks on their next turn. Thaws at the start of the following turn.</td>
                <td className="p-3 text-slate-400">Coral Nymph, Abyssal Deluge</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold font-mono">[Deathrattle]</td>
                <td className="p-3 text-slate-300">Triggers an automatic effect when this creature is destroyed and sent to the Graveyard.</td>
                <td className="p-3 text-slate-400">Voidling Assassin (Draws 1 Card)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: SECRET WARDS */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-sky-400 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-purple-400" />
          5. Secret Wards & Trap Timing Rules
        </h3>
        <p className="codex-text text-slate-300 text-sm leading-relaxed">
          Wards are placed facedown in your 3 Rune slots for 2 Mana. Opponents only see a glowing runic seal. Wards automatically trigger and resolve on the stack when specific trigger conditions occur:
        </p>

        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border-l-4 border-amber-400 text-xs md:text-sm">
            <strong className="text-amber-400 block font-bold mb-1">☀️ Sunfire Sigil (Solar)</strong>
            <p className="text-slate-300"><em>Trigger:</em> When your Vanguard is attacked directly.<br /><em>Effect:</em> Deals 4 retaliatory damage to the attacking unit before damage resolves.</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border-l-4 border-purple-400 text-xs md:text-sm">
            <strong className="text-purple-400 block font-bold mb-1">🌑 Shadow Mirror Ward (Void)</strong>
            <p className="text-slate-300"><em>Trigger:</em> When an opponent Ascends a Form II or Form III Apex monster.<br /><em>Effect:</em> Siphons the titan&apos;s strength, reducing its ATK to 1.</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border-l-4 border-emerald-400 text-xs md:text-sm">
            <strong className="text-emerald-400 block font-bold mb-1">🌿 Thornsnare Ward (Verdant)</strong>
            <p className="text-slate-300"><em>Trigger:</em> When an enemy creature declares an attack.<br /><em>Effect:</em> Instantly destroys the attacker if it has 3 or less remaining HP.</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border-l-4 border-sky-400 text-xs md:text-sm">
            <strong className="text-sky-400 block font-bold mb-1">🌊 Glacial Stasis Ward (Tide)</strong>
            <p className="text-slate-300"><em>Trigger:</em> When an enemy declares a direct strike on your Vanguard.<br /><em>Effect:</em> Completely negates the incoming attack and Freezes the attacker.</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border-l-4 border-rose-400 text-xs md:text-sm">
            <strong className="text-rose-400 block font-bold mb-1">✨ Continuum Collapse Ward (Astral)</strong>
            <p className="text-slate-300"><em>Trigger:</em> When your Vanguard would take fatal lethal damage.<br /><em>Effect:</em> Prevents death, locks Vanguard HP at 1, and draws 2 emergency cards.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: VANGUARD CHAMPIONS */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md mb-8">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-sky-400 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          6. The 5 Vanguard Champions & Hero Powers
        </h3>
        <p className="codex-text text-slate-300 text-sm leading-relaxed">
          Every Vanguard Champion has 30 HP and a 2-Mana Hero Power (Surge) that can be activated once per turn:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-950/60 text-amber-300 font-serif">
                <th className="p-3">Champion</th>
                <th className="p-3">Element</th>
                <th className="p-3">Hero Power</th>
                <th className="p-3">Cost & Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-3 text-white font-bold">Sol Invictus</td>
                <td className="p-3 text-amber-400 font-semibold">Solar / Pyre</td>
                <td className="p-3 text-slate-200">Solar Flare</td>
                <td className="p-3 text-slate-400"><strong>(2 Mana)</strong> Deal 2 direct damage to enemy Vanguard or lowest minion.</td>
              </tr>
              <tr>
                <td className="p-3 text-white font-bold">Lady Nyx</td>
                <td className="p-3 text-purple-400 font-semibold">Void / Shadow</td>
                <td className="p-3 text-slate-200">Shadow Infusion</td>
                <td className="p-3 text-slate-400"><strong>(2 Mana)</strong> Grant a friendly unit +2 ATK this turn.</td>
              </tr>
              <tr>
                <td className="p-3 text-white font-bold">Yggdra Heartwarden</td>
                <td className="p-3 text-emerald-400 font-semibold">Verdant / Nature</td>
                <td className="p-3 text-slate-200">Living Growth</td>
                <td className="p-3 text-slate-400"><strong>(2 Mana)</strong> Restore 3 HP to your Vanguard Champion.</td>
              </tr>
              <tr>
                <td className="p-3 text-white font-bold">Empress Tethys</td>
                <td className="p-3 text-sky-400 font-semibold">Tide / Water</td>
                <td className="p-3 text-slate-200">Ocean Ward</td>
                <td className="p-3 text-slate-400"><strong>(2 Mana)</strong> Grant a friendly creature an Aegis shield.</td>
              </tr>
              <tr>
                <td className="p-3 text-white font-bold">Grand Chronomancer</td>
                <td className="p-3 text-rose-400 font-semibold">Astral / Time</td>
                <td className="p-3 text-slate-200">Time Surge</td>
                <td className="p-3 text-slate-400"><strong>(2 Mana)</strong> Gain +1 temporary Mana and draw 1 card.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 7: US LEGAL COMPLIANCE & FAIR PLAY CHARTER */}
      <section className="codex-section bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-lg backdrop-blur-md mb-8">
        <h3 className="codex-heading text-lg md:text-xl font-bold font-serif text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          7. US Legal Compliance & Free Fair Play Charter
        </h3>
        <div className="bg-slate-950/80 border-l-4 border-emerald-400 p-4 rounded-r-xl text-xs md:text-sm text-slate-300 leading-relaxed flex flex-col gap-3">
          <p>
            <strong>100% Free-to-Play Entertainment Software:</strong> TCG Turbo is operated strictly as a non-gambling, free-to-play video game. Under United States federal and state laws (including UIGEA, FTC Gaming Guidelines, and COPPA):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>Zero Monetary Value ($0.00 USD):</strong> All cards, booster packs, stardust, and avatars are virtual game items with zero real-world monetary value and cannot be exchanged or redeemed for fiat currency.</li>
            <li><strong>No Real-Money Purchases / No Loot Box Microtransactions:</strong> Booster packs cannot be bought with real money; they are unlocked exclusively by winning duels or reaching gameplay milestones.</li>
            <li><strong>Free Peer-to-Peer Trading:</strong> Card gifting and trading between players is 100% free with no financial transactions or secondary market valuations permitted.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
