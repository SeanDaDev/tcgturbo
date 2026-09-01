import { PresetDeck } from './types';

export const PRESET_DECKS: Record<string, PresetDeck> = {
  solar_pyre: {
    name: 'Solar Flare Aggro',
    vanguard: 'sol_champion',
    element: 'solar',
    description: 'Fast-paced aggressive deck dealing direct burns and overwhelming board presence with Aegis vanguard champions.',
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
    element: 'void',
    description: 'Lifesteal and destruction control strategy designed to whittle down enemy threats and turn death into card advantage.',
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
    element: 'verdant',
    description: 'Ramps maximum Mana quickly with Taunt protectors and massive Colossus avatars that overwhelm the opponent.',
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
    element: 'tide',
    description: 'Tempo and board-freeze combo deck that stalls enemy assaults while manipulating time for extra turns.',
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
