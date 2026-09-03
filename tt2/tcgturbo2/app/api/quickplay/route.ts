import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateQuickplayRoom,
  createCustomRoom,
  joinRoomByCode,
  getQuickplayRoom,
  executeRoomAction,
  sanitizeStateForPlayer
} from '@/lib/tcg/quickplayEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      userId,
      roomId,
      roomCode,
      playerNumber,
      gameAction,
      forceAi,
      playerName,
      deckKey,
      customCards
    } = body;

    const resolvedUserId = userId || `duellist_${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. CREATE PRIVATE ROOM
    if (action === 'create_private_room') {
      const room = createCustomRoom(
        resolvedUserId,
        playerName || 'Host Duellist',
        deckKey || 'solar_pyre',
        customCards,
        roomCode
      );
      const sanitizedState = sanitizeStateForPlayer(room.gameState, 1);

      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        roomCode: room.roomCode,
        playerNumber: 1,
        p1Name: room.p1Name,
        p2Name: room.p2Name,
        isP2AI: false,
        gameState: sanitizedState
      });
    }

    // 2. JOIN ROOM BY CODE
    if (action === 'join_by_code') {
      const code = roomCode || roomId;
      if (!code) {
        return NextResponse.json({ success: false, message: 'Room code is required.' }, { status: 400 });
      }

      const res = joinRoomByCode(
        code,
        resolvedUserId,
        playerName || 'Guest Duellist',
        deckKey || 'void_shadow',
        customCards
      );

      if (!res.success || !res.room) {
        return NextResponse.json({ success: false, message: res.message || 'Could not join room.' }, { status: 404 });
      }

      const room = res.room;
      const playerNum: 1 | 2 = room.player1Id === resolvedUserId ? 1 : 2;
      const sanitizedState = sanitizeStateForPlayer(room.gameState, playerNum);

      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        roomCode: room.roomCode,
        playerNumber: playerNum,
        p1Name: room.p1Name,
        p2Name: room.p2Name,
        isP2AI: room.isP2AI,
        gameState: sanitizedState
      });
    }

    // 3. MATCHMAKING / QUICKPLAY QUEUE
    if (action === 'join_queue' || action === 'create_room') {
      const room = getOrCreateQuickplayRoom(
        resolvedUserId,
        !!forceAi,
        playerName || 'Duellist',
        deckKey || 'solar_pyre',
        customCards
      );
      const playerNum: 1 | 2 = room.player1Id === resolvedUserId ? 1 : 2;
      const sanitizedState = sanitizeStateForPlayer(room.gameState, playerNum);

      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        roomCode: room.roomCode,
        playerNumber: playerNum,
        p1Name: room.p1Name,
        p2Name: room.p2Name,
        isP2AI: room.isP2AI,
        gameState: sanitizedState
      });
    }

    // 4. POLL ROOM STATE (Anti-Cheat Sanitized)
    if (action === 'poll_state') {
      const targetId = roomId || roomCode;
      if (!targetId) return NextResponse.json({ success: false, error: 'Missing roomId' }, { status: 400 });

      const room = getQuickplayRoom(targetId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const playerNum: 1 | 2 = (playerNumber as 1 | 2) || 1;
      const sanitizedState = sanitizeStateForPlayer(room.gameState, playerNum);

      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        roomCode: room.roomCode,
        playerNumber: playerNum,
        p1Name: room.p1Name,
        p2Name: room.p2Name,
        isP2AI: room.isP2AI,
        isOpponentConnected: room.player2Id !== 'waiting_opponent',
        gameState: sanitizedState
      });
    }

    // 5. EXECUTE GAME ACTION
    if (action === 'dispatch_action') {
      const targetId = roomId || roomCode;
      if (!targetId || !playerNumber || !gameAction) {
        return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
      }

      const res = executeRoomAction(targetId, playerNumber as 1 | 2, gameAction);
      if (!res.success || !res.room) {
        return NextResponse.json({ success: false, message: res.message }, { status: 400 });
      }

      const sanitizedState = sanitizeStateForPlayer(res.room.gameState, playerNumber as 1 | 2);
      return NextResponse.json({
        success: true,
        roomId: res.room.roomId,
        roomCode: res.room.roomCode,
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
