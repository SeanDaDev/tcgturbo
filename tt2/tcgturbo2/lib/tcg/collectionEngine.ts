import { CARDS_DATA } from './cardsData';
import { CardDef, EquippedCosmetics } from './types';
import { pseudoRandom } from './gameEngine';
import { supabase, isSupabaseConfigured } from '../supabase';
import { COSMETIC_ITEMS, DEFAULT_EQUIPPED_COSMETICS } from './cosmeticsData';

export interface PlayerCollection {
  userId: string;
  ownedCards: Record<string, number>; // cardId -> quantity
  unopenedPacks: number;
  gemBalance: number; // 100 Gems = $1.00 USD
  totalSpentUSD: number; // cumulative dollar support spent on cosmetics
  ownedCosmetics: string[]; // cosmetic item IDs
  equippedCosmetics: EquippedCosmetics;
}

const STARTER_CARD_IDS = [
  'sol_initiate', 'sol_initiate', 'sol_initiate',
  'sol_paladin', 'sol_paladin',
  'ignis_apex',
  'spell_solar_lance', 'spell_solar_lance', 'spell_solar_lance',
  'ward_sunfire_retribution', 'ward_sunfire_retribution',
  'aurelius_chronomancer', 'spell_temporal_rewind', 'void_stalker', 'verdant_sprout'
];

const LOCAL_STORAGE_KEY = 'tcg_turbo_player_collection_v2';

export function getInitialCollection(userId: string = 'player_1'): PlayerCollection {
  const owned: Record<string, number> = {};
  STARTER_CARD_IDS.forEach(id => {
    owned[id] = (owned[id] || 0) + 1;
  });

  return {
    userId,
    ownedCards: owned,
    unopenedPacks: 1, // 1 free starter pack
    gemBalance: 10000, // $100.00 starting cosmetic credit (10,000 Gems)
    totalSpentUSD: 0, // start with $0.00 spent
    ownedCosmetics: [
      'card_back_default',
      'avatar_border_default',
      'board_theme_default',
      'foil_style_default'
    ],
    equippedCosmetics: { ...DEFAULT_EQUIPPED_COSMETICS }
  };
}

export function loadPlayerCollection(userId: string = 'player_1'): PlayerCollection {
  if (typeof window === 'undefined') return getInitialCollection(userId);

  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...getInitialCollection(userId),
        ...parsed,
        equippedCosmetics: {
          ...DEFAULT_EQUIPPED_COSMETICS,
          ...(parsed.equippedCosmetics || {})
        }
      };
    }
  } catch (e) {
    console.error('Failed to load collection from localStorage', e);
  }

  const initial = getInitialCollection(userId);
  savePlayerCollection(initial);
  return initial;
}

export function savePlayerCollection(collection: PlayerCollection): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${collection.userId}`, JSON.stringify(collection));
  } catch (e) {
    console.error('Failed to save collection to localStorage', e);
  }

  // Async sync with Supabase if configured
  if (isSupabaseConfigured && supabase) {
    supabase
      .from('user_collections')
      .upsert({
        user_id: collection.userId,
        owned_cards: collection.ownedCards,
        unopened_packs: collection.unopenedPacks,
        updated_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) console.error('Supabase collection sync error:', error);
      });
  }
}

export function generateBoosterPackCards(count: number = 3): CardDef[] {
  const pack: CardDef[] = [];
  for (let i = 0; i < count; i++) {
    const randIdx = Math.floor(pseudoRandom() * CARDS_DATA.length);
    pack.push(CARDS_DATA[randIdx]);
  }
  return pack;
}

export function openBoosterPack(collection: PlayerCollection): {
  updatedCollection: PlayerCollection;
  unlockedCards: CardDef[];
} {
  if (collection.unopenedPacks <= 0) {
    return { updatedCollection: collection, unlockedCards: [] };
  }

  const unlockedCards = generateBoosterPackCards(3);
  const updatedOwned = { ...collection.ownedCards };

  unlockedCards.forEach(card => {
    updatedOwned[card.id] = (updatedOwned[card.id] || 0) + 1;
  });

  const updatedCollection: PlayerCollection = {
    ...collection,
    ownedCards: updatedOwned,
    unopenedPacks: collection.unopenedPacks - 1
  };

  savePlayerCollection(updatedCollection);
  return { updatedCollection, unlockedCards };
}

export function addVictoryPackReward(collection: PlayerCollection): PlayerCollection {
  const updated: PlayerCollection = {
    ...collection,
    unopenedPacks: collection.unopenedPacks + 1
  };
  savePlayerCollection(updated);
  return updated;
}

export function tradeOrGiftCard(
  senderCollection: PlayerCollection,
  cardId: string,
  recipientId: string
): { updatedSender: PlayerCollection; success: boolean } {
  const senderCount = senderCollection.ownedCards[cardId] || 0;
  if (senderCount <= 1) {
    // Keep at least 1 copy or fail if 0
    return { updatedSender: senderCollection, success: false };
  }

  const updatedSenderOwned = { ...senderCollection.ownedCards };
  updatedSenderOwned[cardId] = senderCount - 1;

  const updatedSender: PlayerCollection = {
    ...senderCollection,
    ownedCards: updatedSenderOwned
  };
  savePlayerCollection(updatedSender);

  // Load recipient collection and add card
  const recipientColl = loadPlayerCollection(recipientId);
  const updatedRecipientOwned = { ...recipientColl.ownedCards };
  updatedRecipientOwned[cardId] = (updatedRecipientOwned[cardId] || 0) + 1;

  savePlayerCollection({
    ...recipientColl,
    ownedCards: updatedRecipientOwned
  });

  return { updatedSender, success: true };
}

export function buyCosmeticItem(
  collection: PlayerCollection,
  cosmeticId: string
): { updatedCollection: PlayerCollection; success: boolean; message: string } {
  const item = COSMETIC_ITEMS.find(c => c.id === cosmeticId);
  if (!item) {
    return { updatedCollection: collection, success: false, message: 'Item not found.' };
  }

  if (collection.ownedCosmetics.includes(cosmeticId)) {
    return { updatedCollection: collection, success: false, message: 'Item already unlocked!' };
  }

  if (collection.gemBalance < item.priceGems) {
    return {
      updatedCollection: collection,
      success: false,
      message: `Insufficient Astral Gems! Requires ${item.priceGems} Gems ($${item.priceUSD.toFixed(2)} USD).`
    };
  }

  const updated: PlayerCollection = {
    ...collection,
    gemBalance: collection.gemBalance - item.priceGems,
    ownedCosmetics: [...collection.ownedCosmetics, cosmeticId]
  };

  savePlayerCollection(updated);
  return {
    updatedCollection: updated,
    success: true,
    message: `Unlocked ${item.name}!`
  };
}

export function equipCosmeticItem(
  collection: PlayerCollection,
  cosmeticId: string
): PlayerCollection {
  const item = COSMETIC_ITEMS.find(c => c.id === cosmeticId);
  if (!item || !collection.ownedCosmetics.includes(cosmeticId)) return collection;

  const nextEquipped = { ...collection.equippedCosmetics };
  if (item.type === 'card_back') nextEquipped.cardBack = cosmeticId;
  else if (item.type === 'avatar_border') nextEquipped.avatarBorder = cosmeticId;
  else if (item.type === 'board_theme') nextEquipped.boardTheme = cosmeticId;
  else if (item.type === 'foil_style') nextEquipped.foilStyle = cosmeticId;

  const updated: PlayerCollection = {
    ...collection,
    equippedCosmetics: nextEquipped
  };

  savePlayerCollection(updated);
  return updated;
}

export interface SupporterTierInfo {
  tierId: 'standard' | 'bronze' | 'silver' | 'gold' | 'diamond';
  name: string;
  badge: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  minUSD: number;
}

export function getSupporterTier(totalSpentUSD: number = 0): SupporterTierInfo {
  if (totalSpentUSD >= 100) {
    return {
      tierId: 'diamond',
      name: 'Diamond Founder Supporter',
      badge: '💎 DIAMOND FOUNDER',
      color: 'text-cyan-300',
      borderColor: 'border-cyan-400',
      bgGradient: 'from-cyan-950 via-sky-900 to-indigo-950',
      minUSD: 100
    };
  } else if (totalSpentUSD >= 50) {
    return {
      tierId: 'gold',
      name: 'Gold Supporter',
      badge: '🥇 GOLD SUPPORTER',
      color: 'text-amber-300',
      borderColor: 'border-amber-400',
      bgGradient: 'from-amber-950 via-yellow-900 to-slate-950',
      minUSD: 50
    };
  } else if (totalSpentUSD >= 15) {
    return {
      tierId: 'silver',
      name: 'Silver Supporter',
      badge: '🥈 SILVER SUPPORTER',
      color: 'text-slate-200',
      borderColor: 'border-slate-300',
      bgGradient: 'from-slate-800 via-slate-900 to-slate-950',
      minUSD: 15
    };
  } else if (totalSpentUSD >= 4.99) {
    return {
      tierId: 'bronze',
      name: 'Bronze Supporter',
      badge: '🥉 BRONZE SUPPORTER',
      color: 'text-amber-500',
      borderColor: 'border-amber-600',
      bgGradient: 'from-amber-950 to-slate-950',
      minUSD: 4.99
    };
  } else {
    return {
      tierId: 'standard',
      name: 'Standard Duellist',
      badge: '⚔️ FOUNDING DUELLIST',
      color: 'text-slate-400',
      borderColor: 'border-slate-700',
      bgGradient: 'from-slate-900 to-slate-950',
      minUSD: 0
    };
  }
}

export function addGemPackage(
  collection: PlayerCollection,
  gemsAmount: number,
  priceUSD: number = 0
): PlayerCollection {
  const updated: PlayerCollection = {
    ...collection,
    gemBalance: collection.gemBalance + gemsAmount,
    totalSpentUSD: (collection.totalSpentUSD || 0) + priceUSD
  };
  savePlayerCollection(updated);
  return updated;
}
