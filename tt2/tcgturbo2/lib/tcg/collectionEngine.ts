import { CARDS_DATA } from './cardsData';
import { CardDef } from './types';
import { pseudoRandom } from './gameEngine';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface PlayerCollection {
  userId: string;
  ownedCards: Record<string, number>; // cardId -> quantity
  unopenedPacks: number;
}

const STARTER_CARD_IDS = [
  'sol_initiate', 'sol_initiate', 'sol_initiate',
  'sol_paladin', 'sol_paladin',
  'ignis_apex',
  'spell_solar_lance', 'spell_solar_lance', 'spell_solar_lance',
  'ward_sunfire_retribution', 'ward_sunfire_retribution',
  'aurelius_chronomancer', 'spell_temporal_rewind', 'void_stalker', 'verdant_sprout'
];

const LOCAL_STORAGE_KEY = 'tcg_turbo_player_collection_v1';

export function getInitialCollection(userId: string = 'player_1'): PlayerCollection {
  const owned: Record<string, number> = {};
  STARTER_CARD_IDS.forEach(id => {
    owned[id] = (owned[id] || 0) + 1;
  });

  return {
    userId,
    ownedCards: owned,
    unopenedPacks: 1 // 1 free starter pack
  };
}

export function loadPlayerCollection(userId: string = 'player_1'): PlayerCollection {
  if (typeof window === 'undefined') return getInitialCollection(userId);

  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (saved) {
      return JSON.parse(saved);
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
