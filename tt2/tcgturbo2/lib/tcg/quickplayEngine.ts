import { GameState, CardInstance, PlayerState } from './types';
import { createInitialGame, playCard, declareAttack, activateHeroPower, endTurn } from './gameEngine';

export interface QuickplayRoom {
  roomId: string;
  createdAt: number;
  player1Id: string;
  player2Id: string;
  p1Name: string;
  p2Name: string;
  isP2AI: boolean;
  gameState: GameState;
}

// In-memory store for active Quickplay rooms
const ACTIVE_ROOMS = new Map<string, QuickplayRoom>();

// Hidden placeholder card definition for anti-cheat sanitization
const DUMMY_HIDDEN_CARD: CardInstance = {
  id: 'hidden_card',
  instanceId: 'hidden_instance',
  name: 'Hidden Card',
  element: 'astral',
  type: 'creature',
  cost: 0,
  rarity: 'common',
  art: '/assets/cards/card_ignis.jpg',
  desc: 'Card in opponent hand.',
  currentAtk: 0,
  currentHp: 0,
  maxHp: 0,
  canAttack: false,
  hasAttackedThisTurn: false,
  frozen: false,
  hasAegis: false
};

/**
 * Anti-Cheat State Sanitizer:
 * Completely strips private opponent hand card details before payload delivery to client.
 * Network packet inspection & DevTools memory inspection will reveal ZERO information about opponent's hand cards.
 */
export function sanitizeStateForPlayer(state: GameState, forPlayerId: 1 | 2): GameState {
  const opponentIndex = forPlayerId === 1 ? 1 : 0;
  const sanitizedPlayers = state.players.map((player, idx) => {
    if (idx === opponentIndex) {
      return {
        ...player,
        hand: player.hand.map((card, handIdx) => ({
          ...DUMMY_HIDDEN_CARD,
          instanceId: card.instanceId || `hidden_${handIdx}`
        }))
      };
    }
    return player;
  }) as [PlayerState, PlayerState];

  return {
    ...state,
    players: sanitizedPlayers
  };
}

export function getOrCreateQuickplayRoom(
  playerUserId: string = 'anon_duellist',
  forceAi: boolean = false
): QuickplayRoom {
  // Find open room waiting for opponent if not forcing AI
  if (!forceAi) {
    for (const room of ACTIVE_ROOMS.values()) {
      if (room.isP2AI && room.player1Id !== playerUserId && !room.gameState.winner) {
        // Match player 2 into existing room
        room.player2Id = playerUserId;
        room.p2Name = `Duellist_${playerUserId.slice(-4)}`;
        room.isP2AI = false;
        room.gameState.players[1].name = room.p2Name;
        room.gameState.players[1].isAI = false;
        return room;
      }
    }
  }

  // Create new room
  const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const p1Name = `Duellist_${playerUserId.slice(-4)}`;
  const p2Name = forceAi ? 'AI Tactician' : 'Anonymous Duellist';

  const initialGame = createInitialGame(
    forceAi ? 'solo_ai' : 'couch_2p',
    'solar_pyre',
    'void_shadow'
  );

  initialGame.players[0].name = p1Name;
  initialGame.players[1].name = p2Name;
  initialGame.players[1].isAI = forceAi;

  const newRoom: QuickplayRoom = {
    roomId,
    createdAt: Date.now(),
    player1Id: playerUserId,
    player2Id: forceAi ? 'ai_opponent' : 'waiting_opponent',
    p1Name,
    p2Name,
    isP2AI: forceAi,
    gameState: initialGame
  };

  ACTIVE_ROOMS.set(roomId, newRoom);
  return newRoom;
}

export function getQuickplayRoom(roomId: string): QuickplayRoom | undefined {
  return ACTIVE_ROOMS.get(roomId);
}

export function executeRoomAction(
  roomId: string,
  playerNumber: 1 | 2,
  action:
    | { type: 'playCard'; instanceId: string; targetLaneIndex?: number | null; targetUnitId?: string | null }
    | { type: 'declareAttack'; attackerInstanceId: string; targetType: 'vanguard' | 'creature'; targetLaneOrId?: number | string | null }
    | { type: 'activateHeroPower' }
    | { type: 'endTurn' }
): { success: boolean; message?: string; room?: QuickplayRoom } {
  const room = ACTIVE_ROOMS.get(roomId);
  if (!room) return { success: false, message: 'Room not found.' };

  if (room.gameState.winner) return { success: false, message: 'Game has concluded.' };
  if (room.gameState.currentTurn !== playerNumber) {
    return { success: false, message: 'Not your turn!' };
  }

  let nextState = room.gameState;

  if (action.type === 'playCard') {
    nextState = playCard(
      nextState,
      action.instanceId,
      action.targetLaneIndex ?? null,
      action.targetUnitId ?? null
    );
  } else if (action.type === 'declareAttack') {
    nextState = declareAttack(
      nextState,
      action.attackerInstanceId,
      action.targetType,
      action.targetLaneOrId ?? null
    );
  } else if (action.type === 'activateHeroPower') {
    nextState = activateHeroPower(nextState);
  } else if (action.type === 'endTurn') {
    nextState = endTurn(nextState);
  }

  room.gameState = nextState;
  ACTIVE_ROOMS.set(roomId, room);

  return { success: true, room };
}
