import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateQuickplayRoom,
  getQuickplayRoom,
  executeRoomAction,
  sanitizeStateForPlayer
} from '@/lib/tcg/quickplayEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, roomId, playerNumber, gameAction, forceAi } = body;

    // 1. MATCHMAKING / ROOM CREATION
    if (action === 'join_queue' || action === 'create_room') {
      const room = getOrCreateQuickplayRoom(userId || 'anon_guest', !!forceAi);
      const playerNum: 1 | 2 = room.player1Id === userId ? 1 : 2;
      const sanitizedState = sanitizeStateForPlayer(room.gameState, playerNum);

      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        playerNumber: playerNum,
        p1Name: room.p1Name,
        p2Name: room.p2Name,
        isP2AI: room.isP2AI,
        gameState: sanitizedState
      });
    }

    // 2. POLL ROOM STATE (Anti-Cheat Sanitized)
    if (action === 'poll_state') {
      if (!roomId) return NextResponse.json({ success: false, error: 'Missing roomId' }, { status: 400 });
      const room = getQuickplayRoom(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const playerNum: 1 | 2 = (playerNumber as 1 | 2) || 1;
      const sanitizedState = sanitizeStateForPlayer(room.gameState, playerNum);

      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        playerNumber: playerNum,
        p1Name: room.p1Name,
        p2Name: room.p2Name,
        isP2AI: room.isP2AI,
        gameState: sanitizedState
      });
    }

    // 3. EXECUTE GAME ACTION
    if (action === 'dispatch_action') {
      if (!roomId || !playerNumber || !gameAction) {
        return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
      }

      const res = executeRoomAction(roomId, playerNumber as 1 | 2, gameAction);
      if (!res.success || !res.room) {
        return NextResponse.json({ success: false, message: res.message }, { status: 400 });
      }

      const sanitizedState = sanitizeStateForPlayer(res.room.gameState, playerNumber as 1 | 2);
      return NextResponse.json({
        success: true,
        roomId: res.room.roomId,
        playerNumber,
        gameState: sanitizedState
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
