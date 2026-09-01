/**
 * Aetherbound TCG - Smart AI Decision Matrix
 * Evaluates board trades, resource curves, card combos, and lethal attacks.
 */

class AIPlayer {
  constructor() {
    this.isThinking = false;
  }

  async takeTurn(game) {
    if (game.winner || game.currentTurn !== 2 || this.isThinking) return;
    this.isThinking = true;

    try {
      // Small pause before AI acts
      await this.sleep(600);

      // Step into Main Phase
      if (game.phase !== 'main') {
        game.setPhase('main');
        await this.sleep(700);
      }

      // Phase 2: Play Cards & Ascend
      await this.playCardsPhase(game);

      // Try Hero Power
      await this.tryHeroPower(game);

      // Transition to Phase 3: Battle Phase
      await this.sleep(600);
      game.setPhase('battle');
      await this.sleep(700);

      // Declare Attacks
      await this.declareAttacksPhase(game);

      // Finish Turn
      await this.sleep(700);
      game.endTurn();
    } catch (e) {
      console.error("AI turn error:", e);
      game.endTurn();
    } finally {
      this.isThinking = false;
    }
  }

  async playCardsPhase(game) {
    const ai = game.players[1];
    let cardsPlayed = 0;
    let keepTrying = true;

    while (keepTrying && cardsPlayed < 6 && !game.winner) {
      keepTrying = false;

      // 1. Look for Ascension possibilities
      for (let i = 0; i < ai.board.length; i++) {
        const boardUnit = ai.board[i];
        if (boardUnit) {
          const ascensionCard = ai.hand.find(c => 
            c.type === 'creature' && 
            c.form > (boardUnit.form || 1) && 
            Math.max(1, c.cost - (boardUnit.form * 2)) <= ai.aether
          );

          if (ascensionCard) {
            game.playCard(ascensionCard.instanceId, i);
            cardsPlayed++;
            keepTrying = true;
            await this.sleep(650);
            break;
          }
        }
      }

      if (keepTrying) continue;

      // 2. Play Secret Wards if slot available
      const emptyWardSlot = ai.wards.indexOf(null);
      if (emptyWardSlot !== -1) {
        const wardCard = ai.hand.find(c => c.type === 'ward' && c.cost <= ai.aether);
        if (wardCard) {
          game.playCard(wardCard.instanceId);
          cardsPlayed++;
          keepTrying = true;
          await this.sleep(650);
          continue;
        }
      }

      // 3. Play Spells if beneficial
      const spellCard = ai.hand.find(c => c.type === 'spell' && c.cost <= ai.aether);
      if (spellCard) {
        // If spell targets any enemy, target lowest opponent or vanguard
        const target = game.players[0].board.find(c => c !== null) || 'vanguard';
        game.playCard(spellCard.instanceId, null, target);
        cardsPlayed++;
        keepTrying = true;
        await this.sleep(650);
        continue;
      }

      // 4. Play standard Form 1 creatures into empty lanes
      const emptyLane = ai.board.indexOf(null);
      if (emptyLane !== -1) {
        const affordableMinion = ai.hand
          .filter(c => c.type === 'creature' && c.cost <= ai.aether)
          .sort((a, b) => b.cost - a.cost)[0]; // Play highest cost affordable

        if (affordableMinion) {
          game.playCard(affordableMinion.instanceId, emptyLane);
          cardsPlayed++;
          keepTrying = true;
          await this.sleep(650);
          continue;
        }
      }
    }
  }

  async tryHeroPower(game) {
    const ai = game.players[1];
    if (!ai.vanguard.heroPowerUsed && ai.aether >= ai.vanguard.heroPower.cost) {
      game.activateHeroPower();
      await this.sleep(500);
    }
  }

  async declareAttacksPhase(game) {
    const ai = game.players[1];
    const opponent = game.players[0];

    const attackers = ai.board.filter(c => c && c.canAttack && !c.hasAttackedThisTurn && !c.frozen);

    for (const attacker of attackers) {
      if (game.winner) break;

      // Check if opponent has Taunt blockers
      const taunters = opponent.board
        .map((c, idx) => ({ card: c, lane: idx }))
        .filter(entry => entry.card && entry.card.hasTaunt);

      if (taunters.length > 0) {
        // Attack the Taunt creature
        const target = taunters[0];
        game.declareAttack(attacker.instanceId, 'creature', target.lane);
        await this.sleep(700);
        continue;
      }

      // If no taunt, check for favorable trades (can kill enemy without dying, or kill high threat)
      const enemyUnits = opponent.board
        .map((c, idx) => ({ card: c, lane: idx }))
        .filter(entry => entry.card !== null);

      const killableHighThreat = enemyUnits.find(e => 
        e.card.currentHp <= attacker.currentAtk && e.card.currentAtk >= 3
      );

      if (killableHighThreat) {
        game.declareAttack(attacker.instanceId, 'creature', killableHighThreat.lane);
        await this.sleep(700);
      } else {
        // Direct attack to opponent Vanguard!
        game.declareAttack(attacker.instanceId, 'vanguard', null);
        await this.sleep(700);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.aiPlayer = new AIPlayer();
