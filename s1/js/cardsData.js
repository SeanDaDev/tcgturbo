/**
 * Aetherbound TCG - Card Registry & Hero Definitions
 * Features 25 balanced cards with Form I/II/III evolution chains, Spells, and Secret Wards.
 */

const CARDS_DATA = [
  // ==========================================
  // SOLAR / PYRE FACTION
  // ==========================================
  {
    id: 'sol_initiate',
    name: 'Solar Spark Drake',
    element: 'solar',
    form: 1,
    type: 'creature',
    cost: 1,
    atk: 2,
    hp: 2,
    rarity: 'common',
    art: 'assets/cards/card_ignis.jpg',
    cropOffset: 'center 10%',
    keywords: [],
    desc: 'Battlecry: Deal 1 damage to an enemy.',
    lore: 'Born in the heart of solar flares, it hungers for cosmic fuel.',
    onPlay: (game, lane, isPlayer) => {
      game.dealDamageToLowestOpponent(1, isPlayer);
    }
  },
  {
    id: 'sol_paladin',
    name: 'Pyre Vanguard',
    element: 'solar',
    form: 2,
    ascendsFrom: 'solar',
    type: 'creature',
    cost: 4,
    atk: 4,
    hp: 4,
    rarity: 'rare',
    art: 'assets/cards/card_pyre_vanguard.jpg',
    cropOffset: 'center 20%',
    keywords: ['Aegis'],
    hasAegis: true,
    desc: 'Aegis (Immune to first damage). Ascension: Gain +2 ATK.',
    lore: 'Golden clad warriors wielding shields forged from dying supernovas.',
    onAscend: (creature) => {
      creature.atk += 2;
    }
  },
  {
    id: 'ignis_apex',
    name: 'Ignis, Astral Sovereign',
    element: 'solar',
    form: 3,
    ascendsFrom: 'solar',
    type: 'creature',
    cost: 7,
    atk: 8,
    hp: 8,
    rarity: 'legendary',
    art: 'assets/cards/card_ignis.jpg',
    cropOffset: 'center 20%',
    keywords: ['Rush'],
    canAttackOnSummon: true,
    desc: 'Rush. Ascension Burst: Deal 3 damage to all enemy units.',
    lore: 'The celestial dragon whose heartbeat ignites stars across the cosmos.',
    onAscend: (creature, game, isPlayer) => {
      game.dealAoEDamageToOpponentUnits(3, isPlayer);
    }
  },
  {
    id: 'spell_solar_lance',
    name: 'Solar Lance',
    element: 'solar',
    type: 'spell',
    cost: 2,
    rarity: 'common',
    art: 'assets/cards/spell_solar_lance.jpg',
    cropOffset: 'center 30%',
    desc: 'Deal 3 damage to target enemy unit or Vanguard.',
    lore: 'A concentrated beam of stellar plasma.',
    targetType: 'any_enemy',
    cast: (game, target, isPlayer) => {
      game.damageTarget(target, 3, isPlayer);
    }
  },
  {
    id: 'ward_sunfire_retribution',
    name: 'Sunfire Sigil',
    element: 'solar',
    type: 'ward',
    cost: 2,
    rarity: 'epic',
    art: 'assets/cards/ward_sunfire_sigil.jpg',
    cropOffset: 'center 25%',
    desc: 'Ward: When your Vanguard is attacked, deal 4 damage to the attacker.',
    lore: 'A hidden rune that retaliates with solar fury.',
    trigger: 'on_vanguard_attacked',
    onTrigger: (game, attacker, isPlayer) => {
      game.damageTarget(attacker, 4, isPlayer);
    }
  },

  // ==========================================
  // VOID / SHADOW FACTION
  // ==========================================
  {
    id: 'void_stalker',
    name: 'Voidling Assassin',
    element: 'void',
    form: 1,
    type: 'creature',
    cost: 2,
    atk: 3,
    hp: 2,
    rarity: 'common',
    art: 'assets/cards/card_valkyrie.jpg',
    cropOffset: 'center 45%',
    keywords: ['Stealth'],
    desc: 'Deathrattle: Draw a card.',
    lore: 'Skulks in the spaces between realities.',
    onDeath: (game, isPlayer) => {
      game.drawCard(isPlayer);
    }
  },
  {
    id: 'nyx_valkyrie',
    name: 'Nyx, Eclipse Valkyrie',
    element: 'void',
    form: 2,
    ascendsFrom: 'void',
    type: 'creature',
    cost: 5,
    atk: 5,
    hp: 4,
    rarity: 'epic',
    art: 'assets/cards/card_valkyrie.jpg',
    cropOffset: 'center 20%',
    keywords: ['Rush', 'Lifesteal'],
    canAttackOnSummon: true,
    lifesteal: true,
    desc: 'Rush. Lifesteal (Heals your Vanguard for damage dealt).',
    lore: 'A fallen seraph who dances through eclipse skies, harvesting souls.',
    onAscend: (creature) => {
      creature.hp += 2;
    }
  },
  {
    id: 'void_reaper_apex',
    name: 'Obsidian Dreadlord',
    element: 'void',
    form: 3,
    ascendsFrom: 'void',
    type: 'creature',
    cost: 8,
    atk: 7,
    hp: 9,
    rarity: 'legendary',
    art: 'assets/cards/card_valkyrie.jpg',
    cropOffset: 'center 15%',
    keywords: ['Lifesteal'],
    lifesteal: true,
    desc: 'Ascension Burst: Destroy the lowest health enemy creature.',
    lore: 'Master of the event horizon, dragging all light into oblivion.',
    onAscend: (creature, game, isPlayer) => {
      game.destroyLowestHealthEnemy(isPlayer);
    }
  },
  {
    id: 'spell_void_drain',
    name: 'Essence Drain',
    element: 'void',
    type: 'spell',
    cost: 3,
    rarity: 'rare',
    art: 'assets/cards/card_valkyrie.jpg',
    cropOffset: 'center 60%',
    desc: 'Deal 3 damage to an enemy unit. Restore 3 HP to your Vanguard.',
    lore: 'Siphon life directly into the dark crucible.',
    targetType: 'enemy_unit',
    cast: (game, target, isPlayer) => {
      game.damageTarget(target, 3, isPlayer);
      game.healVanguard(3, isPlayer);
    }
  },
  {
    id: 'ward_shadow_rift',
    name: 'Shadow Mirror Ward',
    element: 'void',
    type: 'ward',
    cost: 2,
    rarity: 'rare',
    art: 'assets/cards/card_valkyrie.jpg',
    cropOffset: 'center 35%',
    desc: 'Ward: When an enemy plays an Apex or Ascended creature, reduce its ATK to 1.',
    lore: 'The void swallows greatest strengths.',
    trigger: 'on_enemy_ascend',
    onTrigger: (game, enemyUnit) => {
      if (enemyUnit) enemyUnit.atk = 1;
    }
  },

  // ==========================================
  // VERDANT / NATURE FACTION
  // ==========================================
  {
    id: 'verdant_sprout',
    name: 'Moss Sprite',
    element: 'verdant',
    form: 1,
    type: 'creature',
    cost: 1,
    atk: 1,
    hp: 3,
    rarity: 'common',
    art: 'assets/cards/card_titan.jpg',
    cropOffset: 'center 60%',
    keywords: ['Taunt'],
    hasTaunt: true,
    desc: 'Taunt (Enemies must attack this unit first).',
    lore: 'A friendly guardian sprout with bark tough as ironwood.'
  },
  {
    id: 'yggdrasil_titan',
    name: 'Yggdrasil Ancient',
    element: 'verdant',
    form: 2,
    ascendsFrom: 'verdant',
    type: 'creature',
    cost: 6,
    atk: 4,
    hp: 8,
    rarity: 'legendary',
    art: 'assets/cards/card_titan.jpg',
    cropOffset: 'center 20%',
    keywords: ['Taunt', 'Regen'],
    hasTaunt: true,
    desc: 'Taunt. Ascension Burst: Restore 4 HP to all friendly characters.',
    lore: 'Awakened from millennial slumber to shield the sacred groves.',
    onAscend: (creature, game, isPlayer) => {
      game.healAllFriendly(4, isPlayer);
    }
  },
  {
    id: 'verdant_hydra_apex',
    name: 'Colossus of the Bloom',
    element: 'verdant',
    form: 3,
    ascendsFrom: 'verdant',
    type: 'creature',
    cost: 7,
    atk: 8,
    hp: 10,
    rarity: 'epic',
    art: 'assets/cards/card_titan.jpg',
    cropOffset: 'center 10%',
    keywords: ['Overpower'],
    desc: 'Ascension Burst: Gain +1 Maximum Aether Flow permanently.',
    lore: 'Its roots delve into the molten heart of the earth.',
    onAscend: (creature, game, isPlayer) => {
      game.grantPermanentAether(1, isPlayer);
    }
  },
  {
    id: 'spell_feral_surge',
    name: 'Primal Overgrowth',
    element: 'verdant',
    type: 'spell',
    cost: 2,
    rarity: 'common',
    art: 'assets/cards/card_titan.jpg',
    cropOffset: 'center 40%',
    desc: 'Give a friendly creature +2 ATK and +3 HP.',
    lore: 'Infuses blood with wild celestial chloroplasts.',
    targetType: 'friendly_unit',
    cast: (game, target) => {
      if (target) {
        target.atk += 2;
        target.hp += 3;
        target.maxHp += 3;
      }
    }
  },
  {
    id: 'ward_briar_trap',
    name: 'Thornsnare Ward',
    element: 'verdant',
    type: 'ward',
    cost: 2,
    rarity: 'common',
    art: 'assets/cards/card_titan.jpg',
    cropOffset: 'center 30%',
    desc: 'Ward: When an enemy creature attacks, destroy it if it has 3 or less HP.',
    lore: 'Razor thorns burst from the earth at the first tremor.',
    trigger: 'on_creature_attack',
    onTrigger: (game, attacker, isPlayer) => {
      if (attacker && attacker.hp <= 3) {
        game.destroyTarget(attacker, isPlayer);
      }
    }
  },

  // ==========================================
  // TIDE / WATER FACTION
  // ==========================================
  {
    id: 'tide_siren_initiate',
    name: 'Coral Nymph',
    element: 'tide',
    form: 1,
    type: 'creature',
    cost: 2,
    atk: 2,
    hp: 3,
    rarity: 'common',
    art: 'assets/cards/card_tide.jpg',
    cropOffset: 'center 60%',
    keywords: [],
    desc: 'Battlecry: Freeze target enemy for 1 turn (cannot attack).',
    lore: 'Sings a melody that chills the blood to ice.',
    onPlay: (game, lane, isPlayer) => {
      game.freezeOpponentCreature(isPlayer);
    }
  },
  {
    id: 'tethys_tide_weaver',
    name: 'Tethys, Tide Weaver',
    element: 'tide',
    form: 2,
    ascendsFrom: 'tide',
    type: 'creature',
    cost: 5,
    atk: 4,
    hp: 6,
    rarity: 'legendary',
    art: 'assets/cards/card_tide.jpg',
    cropOffset: 'center 20%',
    keywords: ['FreezeStrike'],
    desc: 'Ascension Burst: Draw 2 cards and Freeze all enemy units for 1 turn.',
    lore: 'Empress of the Abyssal Trenches, commanding tides of mystic liquid.',
    onAscend: (creature, game, isPlayer) => {
      game.drawCard(isPlayer);
      game.drawCard(isPlayer);
      game.freezeAllEnemyUnits(isPlayer);
    }
  },
  {
    id: 'kraken_apex',
    name: 'Leviathan of the Depths',
    element: 'tide',
    form: 3,
    ascendsFrom: 'tide',
    type: 'creature',
    cost: 8,
    atk: 9,
    hp: 9,
    rarity: 'epic',
    art: 'assets/cards/card_tide.jpg',
    cropOffset: 'center 10%',
    keywords: ['Overpower'],
    desc: 'Ascension: Return 1 non-Apex enemy creature back to owner hand.',
    lore: 'The ocean trembles when the ancient sovereign stirs.',
    onAscend: (creature, game, isPlayer) => {
      game.bounceOpponentUnit(isPlayer);
    }
  },
  {
    id: 'spell_tidal_wave',
    name: 'Abyssal Deluge',
    element: 'tide',
    type: 'spell',
    cost: 4,
    rarity: 'rare',
    art: 'assets/cards/card_tide.jpg',
    cropOffset: 'center 40%',
    desc: 'Deal 2 damage to all enemy units and freeze them.',
    lore: 'A towering tsunami infused with arctic frost.',
    cast: (game, target, isPlayer) => {
      game.dealAoEDamageToOpponentUnits(2, isPlayer);
      game.freezeAllEnemyUnits(isPlayer);
    }
  },
  {
    id: 'ward_frozen_tide',
    name: 'Glacial Stasis Ward',
    element: 'tide',
    type: 'ward',
    cost: 2,
    rarity: 'rare',
    art: 'assets/cards/card_tide.jpg',
    cropOffset: 'center 30%',
    desc: 'Ward: When an enemy declares direct attack, negate it and freeze the attacker.',
    lore: 'Instant permafrost turns incoming blows to brittle frost.',
    trigger: 'on_direct_attack',
    onTrigger: (game, attacker) => {
      if (attacker) attacker.frozen = true;
      return true; // Negates attack
    }
  },

  // ==========================================
  // ASTRAL / CHRONO FACTION
  // ==========================================
  {
    id: 'aurelius_chronomancer',
    name: 'Aurelius, Chronomancer',
    element: 'astral',
    form: 1,
    type: 'creature',
    cost: 3,
    atk: 2,
    hp: 4,
    rarity: 'legendary',
    art: 'assets/cards/card_time.jpg',
    cropOffset: 'center 20%',
    keywords: ['Resonance'],
    desc: 'Battlecry: Reduce the Aether cost of all cards in your hand by 1.',
    lore: 'Unravels threads of time to weave tomorrow into today.',
    onPlay: (game, lane, isPlayer) => {
      game.reduceHandCosts(1, isPlayer);
    }
  },
  {
    id: 'astral_seer',
    name: 'Starweaver Adept',
    element: 'astral',
    form: 2,
    ascendsFrom: 'astral',
    type: 'creature',
    cost: 4,
    atk: 3,
    hp: 5,
    rarity: 'rare',
    art: 'assets/cards/card_time.jpg',
    cropOffset: 'center 45%',
    keywords: [],
    desc: 'Ascension Burst: Discover 1 random high-tier card into your hand.',
    lore: 'Channels cosmic stardust into crystalline prophecies.',
    onAscend: (creature, game, isPlayer) => {
      game.discoverRandomCard(isPlayer);
    }
  },
  {
    id: 'astral_chronos_apex',
    name: 'Chronos, Lord of Eternity',
    element: 'astral',
    form: 3,
    ascendsFrom: 'astral',
    type: 'creature',
    cost: 9,
    atk: 10,
    hp: 10,
    rarity: 'legendary',
    art: 'assets/cards/card_time.jpg',
    cropOffset: 'center 10%',
    keywords: ['Rush', 'Aegis'],
    canAttackOnSummon: true,
    hasAegis: true,
    desc: 'Rush. Aegis. Ascension: Take an extra turn after this one!',
    lore: 'The architect of the cosmic timeline who bends eternity to his will.',
    onAscend: (creature, game, isPlayer) => {
      game.grantExtraTurn(isPlayer);
    }
  },
  {
    id: 'spell_temporal_rewind',
    name: 'Chronoshift',
    element: 'astral',
    type: 'spell',
    cost: 3,
    rarity: 'epic',
    art: 'assets/cards/card_time.jpg',
    cropOffset: 'center 60%',
    desc: 'Heal your Vanguard for 6 HP and draw 1 card.',
    lore: 'Reverses localized entropy to mend mortal wounds.',
    cast: (game, target, isPlayer) => {
      game.healVanguard(6, isPlayer);
      game.drawCard(isPlayer);
    }
  },
  {
    id: 'ward_astral_rift',
    name: 'Continuum Collapse Ward',
    element: 'astral',
    type: 'ward',
    cost: 2,
    rarity: 'epic',
    art: 'assets/cards/card_time.jpg',
    cropOffset: 'center 35%',
    desc: 'Ward: When your Vanguard would take lethal damage, survive with 1 HP and draw 2 cards.',
    lore: 'Rewinds time at the brink of death.',
    trigger: 'on_lethal_damage',
    onTrigger: (game, isPlayer) => {
      game.preventLethal(isPlayer);
    }
  }
];

// Vanguard Champion Archetypes
const VANGUARDS = [
  {
    id: 'sol_champion',
    name: 'Sol Invictus',
    title: 'Radiant Sunlord',
    element: 'solar',
    avatar: 'assets/cards/card_ignis.jpg',
    hp: 30,
    heroPower: {
      name: 'Solar Flare',
      cost: 2,
      desc: 'Deal 2 damage to enemy Vanguard or a minion.',
      action: (game, isPlayer) => {
        game.dealDamageToOpponentHero(2, isPlayer);
      }
    }
  },
  {
    id: 'void_champion',
    name: 'Lady Nyx',
    title: 'Shadow Valkyrie',
    element: 'void',
    avatar: 'assets/cards/card_valkyrie.jpg',
    hp: 30,
    heroPower: {
      name: 'Shadow Infusion',
      cost: 2,
      desc: 'Give a friendly unit +2 ATK this turn.',
      action: (game, isPlayer) => {
        game.buffRandomFriendlyUnitAtk(2, isPlayer);
      }
    }
  },
  {
    id: 'verdant_champion',
    name: 'Yggdra Heartwarden',
    title: 'Primal Titan',
    element: 'verdant',
    avatar: 'assets/cards/card_titan.jpg',
    hp: 30,
    heroPower: {
      name: 'Living Growth',
      cost: 2,
      desc: 'Restore 3 HP to your Vanguard or a friendly minion.',
      action: (game, isPlayer) => {
        game.healVanguard(3, isPlayer);
      }
    }
  },
  {
    id: 'tide_champion',
    name: 'Empress Tethys',
    title: 'Siren of the Tides',
    element: 'tide',
    avatar: 'assets/cards/card_tide.jpg',
    hp: 30,
    heroPower: {
      name: 'Ocean Ward',
      cost: 2,
      desc: 'Give a friendly unit Aegis (shield from next damage).',
      action: (game, isPlayer) => {
        game.grantRandomFriendlyAegis(isPlayer);
      }
    }
  },
  {
    id: 'astral_champion',
    name: 'Grand Chronomancer',
    title: 'Weaver of Time',
    element: 'astral',
    avatar: 'assets/cards/card_time.jpg',
    hp: 30,
    heroPower: {
      name: 'Time Surge',
      cost: 2,
      desc: 'Gain 1 temporary Aether this turn and draw 1 card.',
      action: (game, isPlayer) => {
        game.grantTemporaryAether(1, isPlayer);
        game.drawCard(isPlayer);
      }
    }
  }
];

// Pre-built Archetype Deck Presets
const PRESET_DECKS = {
  solar_pyre: {
    name: 'Solar Flare Aggro',
    vanguard: 'sol_champion',
    cards: [
      'sol_initiate', 'sol_initiate', 'sol_initiate',
      'sol_paladin', 'sol_paladin',
      'ignis_apex', 'ignis_apex',
      'spell_solar_lance', 'spell_solar_lance', 'spell_solar_lance',
      'ward_sunfire_retribution', 'ward_sunfire_retribution',
      'aurelius_chronomancer', 'spell_temporal_rewind'
    ]
  },
  void_shadow: {
    name: 'Void Eclipse Control',
    vanguard: 'void_champion',
    cards: [
      'void_stalker', 'void_stalker', 'void_stalker',
      'nyx_valkyrie', 'nyx_valkyrie',
      'void_reaper_apex', 'void_reaper_apex',
      'spell_void_drain', 'spell_void_drain',
      'ward_shadow_rift', 'ward_shadow_rift',
      'aurelius_chronomancer', 'spell_temporal_rewind', 'sol_initiate'
    ]
  },
  verdant_ramp: {
    name: 'Verdant Overgrowth Ramp',
    vanguard: 'verdant_champion',
    cards: [
      'verdant_sprout', 'verdant_sprout', 'verdant_sprout',
      'yggdrasil_titan', 'yggdrasil_titan',
      'verdant_hydra_apex', 'verdant_hydra_apex',
      'spell_feral_surge', 'spell_feral_surge',
      'ward_briar_trap', 'ward_briar_trap',
      'tide_siren_initiate', 'spell_tidal_wave', 'sol_initiate'
    ]
  },
  tide_astral: {
    name: 'Tidal Chrono Combo',
    vanguard: 'tide_champion',
    cards: [
      'tide_siren_initiate', 'tide_siren_initiate',
      'tethys_tide_weaver', 'tethys_tide_weaver',
      'kraken_apex', 'kraken_apex',
      'aurelius_chronomancer', 'aurelius_chronomancer',
      'astral_seer', 'astral_chronos_apex',
      'spell_tidal_wave', 'spell_temporal_rewind',
      'ward_frozen_tide', 'ward_astral_rift'
    ]
  }
};

window.CARDS_DATA = CARDS_DATA;
window.VANGUARDS = VANGUARDS;
window.PRESET_DECKS = PRESET_DECKS;
