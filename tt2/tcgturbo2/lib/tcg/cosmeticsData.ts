import { CosmeticItem, CurrencyPackage, EquippedCosmetics } from './types';

export const DEFAULT_EQUIPPED_COSMETICS: EquippedCosmetics = {
  cardBack: 'card_back_default',
  avatarBorder: 'avatar_border_default',
  boardTheme: 'board_theme_default',
  foilStyle: 'foil_style_default'
};

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // ==========================================
  // CARD BACKS
  // ==========================================
  {
    id: 'card_back_default',
    name: 'Astral Classic Back',
    type: 'card_back',
    rarity: 'common',
    priceGems: 0,
    priceUSD: 0,
    desc: 'The timeless standard runic mandala back of the Astral Nexus.',
    previewColor: 'from-indigo-900 to-slate-900',
    badge: 'DEFAULT'
  },
  {
    id: 'card_back_sol_core',
    name: 'Solar Flare Core',
    type: 'card_back',
    rarity: 'rare',
    priceGems: 1200,
    priceUSD: 12.00,
    desc: 'Forged from dying supernovas with radiant golden solar energy.',
    previewColor: 'from-amber-600 via-yellow-500 to-orange-700',
    badge: 'HOT'
  },
  {
    id: 'card_back_void_eclipse',
    name: 'Obsidian Void Eclipse',
    type: 'card_back',
    rarity: 'epic',
    priceGems: 1800,
    priceUSD: 18.00,
    desc: 'Absorbs surrounding ambient light with an event horizon shadow pattern.',
    previewColor: 'from-purple-950 via-slate-950 to-indigo-950',
    badge: 'POPULAR'
  },
  {
    id: 'card_back_cyber_neon',
    name: 'Cyberpunk Matrix Pulse',
    type: 'card_back',
    rarity: 'legendary',
    priceGems: 2500,
    priceUSD: 25.00,
    desc: 'Animated cyan holographic circuitry with pulsing quantum nodes.',
    previewColor: 'from-cyan-900 via-sky-600 to-blue-950',
    badge: 'EXCLUSIVE'
  },

  // ==========================================
  // AVATAR BORDERS
  // ==========================================
  {
    id: 'avatar_border_default',
    name: 'Gold Ring Classic',
    type: 'avatar_border',
    rarity: 'common',
    priceGems: 0,
    priceUSD: 0,
    desc: 'Standard polished brass border for Vanguard Champions.',
    previewColor: 'from-amber-400 to-amber-600',
    badge: 'DEFAULT'
  },
  {
    id: 'avatar_border_dragon_scale',
    name: 'Obsidian Dragon Crest',
    type: 'avatar_border',
    rarity: 'epic',
    priceGems: 1500,
    priceUSD: 15.00,
    desc: 'Draconic serrated obsidian scales infused with dark magic.',
    previewColor: 'from-rose-600 via-red-900 to-slate-950',
    badge: 'EPIC'
  },
  {
    id: 'avatar_border_quantum_halo',
    name: 'Quantum Celestial Halo',
    type: 'avatar_border',
    rarity: 'legendary',
    priceGems: 2200,
    priceUSD: 22.00,
    desc: 'Orbiting celestial ring with floating stardust particles.',
    previewColor: 'from-sky-300 via-indigo-400 to-purple-400',
    badge: 'LEGENDARY'
  },

  // ==========================================
  // ARENA BOARD THEMES
  // ==========================================
  {
    id: 'board_theme_default',
    name: 'Astral Void Mat',
    type: 'board_theme',
    rarity: 'common',
    priceGems: 0,
    priceUSD: 0,
    desc: 'The baseline cosmic duel arena battlefield.',
    previewColor: 'from-slate-950 via-slate-900 to-slate-950',
    badge: 'DEFAULT'
  },
  {
    id: 'board_theme_citadel_light',
    name: 'Citadel of Sunfire',
    type: 'board_theme',
    rarity: 'rare',
    priceGems: 2000,
    priceUSD: 20.00,
    desc: 'Bask in golden solar sanctuary marble floors with blazing ley lines.',
    previewColor: 'from-amber-950 via-slate-900 to-yellow-950',
    badge: 'RARE'
  },
  {
    id: 'board_theme_cyber_arena',
    name: 'Neo-Tokyo Cyber Grid',
    type: 'board_theme',
    rarity: 'legendary',
    priceGems: 3000,
    priceUSD: 30.00,
    desc: 'Futuristic neon holographic duel grid with dynamic ambient lasers.',
    previewColor: 'from-cyan-950 via-slate-900 to-purple-950',
    badge: 'BEST SELLER'
  },

  // ==========================================
  // HOLOGRAPHIC FOIL STYLES
  // ==========================================
  {
    id: 'foil_style_default',
    name: 'Standard Prism Shimmer',
    type: 'foil_style',
    rarity: 'common',
    priceGems: 0,
    priceUSD: 0,
    desc: 'Original 3D tilt specular sheen foil.',
    previewColor: 'from-slate-700 to-slate-800',
    badge: 'DEFAULT'
  },
  {
    id: 'foil_style_rainbow_hyper',
    name: 'Hyper Spectrum Foil',
    type: 'foil_style',
    rarity: 'epic',
    priceGems: 1600,
    priceUSD: 16.00,
    desc: 'Vibrant chromatic rainbow diffraction that reacts to cursor tilt.',
    previewColor: 'from-rose-500 via-yellow-400 to-cyan-500',
    badge: 'EPIC'
  },
  {
    id: 'foil_style_diamond_glint',
    name: 'Diamond Starlight Glint',
    type: 'foil_style',
    rarity: 'legendary',
    priceGems: 2400,
    priceUSD: 24.00,
    desc: 'Crystalline diamond facets reflecting blinding stellar glints.',
    previewColor: 'from-sky-200 via-indigo-100 to-purple-200',
    badge: 'PREMIUM'
  }
];

export const CURRENCY_PACKAGES: CurrencyPackage[] = [
  {
    id: 'gems_p1',
    name: 'Starter Gem Pouch',
    gems: 500,
    bonusGems: 0,
    priceUSD: 4.99,
    badge: 'STARTER'
  },
  {
    id: 'gems_p2',
    name: 'Duellist Gem Cache',
    gems: 1000,
    bonusGems: 100,
    priceUSD: 9.99,
    badge: '+10% BONUS',
    popular: true
  },
  {
    id: 'gems_p3',
    name: 'Champion Gem Chest',
    gems: 2200,
    bonusGems: 300,
    priceUSD: 19.99,
    badge: '+15% BONUS'
  },
  {
    id: 'gems_p4',
    name: 'Sovereign Gem Vault',
    gems: 5500,
    bonusGems: 1000,
    priceUSD: 49.99,
    badge: '+20% BEST VALUE'
  }
];
