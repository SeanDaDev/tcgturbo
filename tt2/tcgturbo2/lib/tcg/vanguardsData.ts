import { VanguardHero } from './types';

export const VANGUARDS_DATA: VanguardHero[] = [
  {
    id: 'sol_champion',
    name: 'Sol Invictus',
    title: 'Radiant Sunlord',
    element: 'solar',
    avatar: '/assets/cards/card_ignis.jpg',
    hp: 30,
    maxHp: 30,
    heroPower: {
      name: 'Solar Flare',
      cost: 2,
      desc: 'Deal 2 direct damage to enemy Vanguard or lowest health enemy creature.'
    }
  },
  {
    id: 'void_champion',
    name: 'Lady Nyx',
    title: 'Shadow Valkyrie',
    element: 'void',
    avatar: '/assets/cards/card_valkyrie.jpg',
    hp: 30,
    maxHp: 30,
    heroPower: {
      name: 'Shadow Infusion',
      cost: 2,
      desc: 'Grant a friendly creature +2 ATK this turn.'
    }
  },
  {
    id: 'verdant_champion',
    name: 'Yggdra Heartwarden',
    title: 'Primal Titan',
    element: 'verdant',
    avatar: '/assets/cards/card_titan.jpg',
    hp: 30,
    maxHp: 30,
    heroPower: {
      name: 'Living Growth',
      cost: 2,
      desc: 'Restore 3 HP to your Vanguard Champion.'
    }
  },
  {
    id: 'tide_champion',
    name: 'Empress Tethys',
    title: 'Siren of the Tides',
    element: 'tide',
    avatar: '/assets/cards/card_tide.jpg',
    hp: 30,
    maxHp: 30,
    heroPower: {
      name: 'Ocean Ward',
      cost: 2,
      desc: 'Grant a friendly creature an Aegis shield.'
    }
  },
  {
    id: 'astral_champion',
    name: 'Grand Chronomancer',
    title: 'Weaver of Time',
    element: 'astral',
    avatar: '/assets/cards/card_time.jpg',
    hp: 30,
    maxHp: 30,
    heroPower: {
      name: 'Time Surge',
      cost: 2,
      desc: 'Gain +1 temporary Mana this turn and draw 1 card.'
    }
  }
];
