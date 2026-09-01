import { GameState, CardInstance } from './types';
import {
  playCard,
  activateHeroPower,
  declareAttack,
  endTurn,
  calculateAscensionCost
} from './gameEngine';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function executeAiTurn(
  getGameState: () => GameState,
  updateGameState: (updater: (s: GameState) => GameState) => void
) {
  const initial = getGameState();
  if (initial.winner || initial.currentTurn !== 2) return;

  try {
    await sleep(600);

    // Phase 1: Play Cards & In-Place Ascensions
    let keepPlaying = true;
    let iterations = 0;

    while (keepPlaying && iterations < 5) {
      iterations++;
      keepPlaying = false;
      const state = getGameState();
      if (state.winner || state.currentTurn !== 2) return;

      const ai = state.players[1];

      // 1. Look for In-Place Ascension combos
      for (let laneIdx = 0; laneIdx < ai.board.length; laneIdx++) {
        const boardUnit = ai.board[laneIdx];
        if (boardUnit && boardUnit.form) {
          const ascensionCard = ai.hand.find(c => {
            if (c.type !== 'creature' || !c.form || c.form <= boardUnit.form!) return false;
            const cost = calculateAscensionCost(c, boardUnit);
            return cost <= ai.mana;
          });

          if (ascensionCard) {
            updateGameState(s => playCard(s, ascensionCard.instanceId, laneIdx));
            keepPlaying = true;
            await sleep(650);
            break;
          }
        }
      }

      if (keepPlaying) continue;

      // 2. Play Secret Wards
      const emptyWardSlot = ai.wards.indexOf(null);
      if (emptyWardSlot !== -1) {
        const wardCard = ai.hand.find(c => c.type === 'ward' && c.cost <= ai.mana);
        if (wardCard) {
          updateGameState(s => playCard(s, wardCard.instanceId));
          keepPlaying = true;
          await sleep(650);
          continue;
        }
      }

      // 3. Play Spells if affordable
      const spellCard = ai.hand.find(c => c.type === 'spell' && c.cost <= ai.mana);
      if (spellCard) {
        updateGameState(s => playCard(s, spellCard.instanceId));
        keepPlaying = true;
        await sleep(650);
        continue;
      }

      // 4. Play standard Form 1 creatures into empty lanes
      const emptyLane = ai.board.indexOf(null);
      if (emptyLane !== -1) {
        const affordableCreatures = ai.hand
          .filter(c => c.type === 'creature' && c.cost <= ai.mana)
          .sort((a, b) => (b.cost || 0) - (a.cost || 0));

        if (affordableCreatures.length > 0) {
          const best = affordableCreatures[0];
          updateGameState(s => playCard(s, best.instanceId, emptyLane));
          keepPlaying = true;
          await sleep(650);
          continue;
        }
      }
    }

    // Phase 2: Hero Power
    const stateAfterSummons = getGameState();
    if (stateAfterSummons.winner || stateAfterSummons.currentTurn !== 2) return;
    const aiPlayer = stateAfterSummons.players[1];

    if (!aiPlayer.vanguard.heroPowerUsed && aiPlayer.mana >= aiPlayer.vanguard.heroPower.cost) {
      updateGameState(s => activateHeroPower(s));
      await sleep(550);
    }

    // Phase 3: Declare Attacks
    const stateBeforeCombat = getGameState();
    if (stateBeforeCombat.winner || stateBeforeCombat.currentTurn !== 2) return;

    const readyAttackers = (getGameState().players[1].board.filter(
      (c): c is CardInstance => !!c && c.canAttack && !c.hasAttackedThisTurn && !c.frozen
    ) as CardInstance[]);

    for (const attacker of readyAttackers) {
      const currentState = getGameState();
      if (currentState.winner || currentState.currentTurn !== 2) break;

      const opp = currentState.players[0];
      const tauntBlockers = opp.board
        .map((c, idx) => ({ card: c, lane: idx }))
        .filter(entry => entry.card && entry.card.hasTaunt);

      if (tauntBlockers.length > 0) {
        // Attack Taunt guardian
        const target = tauntBlockers[0];
        updateGameState(s => declareAttack(s, attacker.instanceId, 'creature', target.lane));
        await sleep(700);
        continue;
      }

      // If no Taunt, check favorable trades
      const enemyUnits = opp.board
        .map((c, idx) => ({ card: c, lane: idx }))
        .filter(entry => entry.card !== null);

      const killableHighThreat = enemyUnits.find(
        e => e.card!.currentHp <= attacker.currentAtk && e.card!.currentAtk >= 3
      );

      if (killableHighThreat) {
        updateGameState(s => declareAttack(s, attacker.instanceId, 'creature', killableHighThreat.lane));
        await sleep(700);
      } else {
        // Direct attack to enemy Vanguard
        updateGameState(s => declareAttack(s, attacker.instanceId, 'vanguard', null));
        await sleep(700);
      }
    }

    // End AI Turn
    await sleep(600);
    updateGameState(s => endTurn(s));
  } catch (err) {
    console.error('AI execution error:', err);
    updateGameState(s => endTurn(s));
  }
}
