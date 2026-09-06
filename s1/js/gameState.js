/**
 * Aetherbound TCG - Core Rules & State Engine
 * Supports Solo vs AI and Local 2-Player Couch Co-op with Privacy Shield Handover.
 */

class GameState {
  constructor(mode = 'solo_ai', p1DeckKey = 'solar_pyre', p2DeckKey = 'void_shadow') {
    this.mode = mode; // 'solo_ai' | 'couch_2p'
    this.round = 1;
    this.currentTurn = 1; // 1 (P1) or 2 (P2/AI)
    this.phase = 'main'; // 'main' | 'battle' | 'end'
    this.isPrivacyCurtainActive = false;
    this.winner = null; // null | 1 | 2
    this.actionLogs = [];
    this.subscribers = [];
    this.instanceCounter = 1;

    this.players = [
      this.createPlayer(1, 'Player 1', false, p1DeckKey),
      this.createPlayer(2, mode === 'solo_ai' ? 'AI Tactician' : 'Player 2', mode === 'solo_ai', p2DeckKey)
    ];

    this.initGame();
  }

  createPlayer(id, name, isAI, deckKey) {
    const preset = window.PRESET_DECKS[deckKey] || window.PRESET_DECKS.solar_pyre;
    const vanguardDef = window.VANGUARDS.find(v => v.id === preset.vanguard) || window.VANGUARDS[0];

    // Build deck instances
    const deck = [];
    preset.cards.forEach(cardId => {
      const def = window.CARDS_DATA.find(c => c.id === cardId);
      if (def) {
        deck.push(this.instantiateCard(def));
      }
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return {
      id,
      name,
      isAI,
      vanguard: {
        id: vanguardDef.id,
        name: vanguardDef.name,
        title: vanguardDef.title,
        element: vanguardDef.element,
        avatar: vanguardDef.avatar,
        hp: vanguardDef.hp,
        maxHp: vanguardDef.hp,
        heroPower: vanguardDef.heroPower,
        heroPowerUsed: false
      },
      aether: 1,
      maxAether: 1,
      deck,
      hand: [],
      board: [null, null, null, null, null], // 5 creature lanes
      wards: [null, null, null], // 3 secret trap slots
      graveyard: [],
      extraTurns: 0
    };
  }

  instantiateCard(cardDef) {
    return {
      ...cardDef,
      instanceId: `card_${this.instanceCounter++}`,
      currentAtk: cardDef.atk || 0,
      currentHp: cardDef.hp || 0,
      maxHp: cardDef.hp || 0,
      canAttack: false,
      frozen: false,
      hasAttackedThisTurn: false,
      hasAegis: !!cardDef.hasAegis
    };
  }

  initGame() {
    // Initial draw: 4 cards each
    for (let i = 0; i < 4; i++) {
      this.drawCard(true, false);
      this.drawCard(false, false);
    }
    this.startTurn(false);
  }

  getActivePlayer() {
    return this.players[this.currentTurn - 1];
  }

  getOpponentPlayer() {
    return this.players[this.currentTurn === 1 ? 1 : 0];
  }

  startTurn(playSound = true) {
    const active = this.getActivePlayer();
    
    // Phase 1: Draw / Surge Step
    this.phase = 'draw';

    // Increase Max Aether (up to 10)
    if (this.round > 1 || active.id === 2) {
      if (active.maxAether < 10) {
        active.maxAether += 1;
      }
    }
    active.aether = active.maxAether;
    active.vanguard.heroPowerUsed = false;

    // Reset creature attack readiness & clear freeze
    active.board.forEach(creature => {
      if (creature) {
        if (creature.frozen) {
          creature.frozen = false;
          creature.canAttack = false;
        } else {
          creature.canAttack = true;
          creature.hasAttackedThisTurn = false;
        }
      }
    });

    // Draw 1 card at start of turn
    this.drawCard(active.id === 1, playSound);
    this.log(`--- Round ${this.round}: ${active.name}'s Turn ---`, 'log-turn');
    this.log(`[Phase 1: Draw & Surge] Aether replenished to ${active.aether}/${active.maxAether}.`, 'log-turn');

    if (playSound && window.soundEngine) {
      window.soundEngine.playTurnChime();
    }

    // Auto-advance Draw phase into Main Phase
    this.phase = 'main';
    this.log(`[Phase 2: Main Phase] Play cards, ascend units, or surge hero powers.`, 'log-summon');

    this.notify({ type: 'phase_change', phase: 'main', player: active });
  }

  setPhase(newPhase) {
    if (this.winner || this.isPrivacyCurtainActive) return;
    if (this.phase === newPhase) return;

    const validPhases = ['main', 'battle', 'end'];
    if (!validPhases.includes(newPhase)) return;

    this.phase = newPhase;
    const active = this.getActivePlayer();

    if (newPhase === 'main') {
      this.log(`[Phase 2: Main Phase] ${active.name} is preparing tactics.`, 'log-summon');
      if (window.soundEngine) window.soundEngine.playHover();
    } else if (newPhase === 'battle') {
      this.log(`[Phase 3: Battle Phase] ${active.name} engages combat readiness!`, 'log-attack');
      if (window.soundEngine) window.soundEngine.playAttack();
    } else if (newPhase === 'end') {
      this.endTurn();
      return;
    }

    this.notify({ type: 'phase_change', phase: newPhase, player: active });
  }

  advancePhase() {
    if (this.winner || this.isPrivacyCurtainActive) return;

    if (this.phase === 'draw' || this.phase === 'main') {
      this.setPhase('battle');
    } else if (this.phase === 'battle') {
      this.endTurn();
    }
  }

  drawCard(forPlayer1, playSound = true) {
    const player = this.players[forPlayer1 ? 0 : 1];
    if (!player.deck || player.deck.length === 0) {
      // Fatigue damage (Bug 4)
      player.fatigueCounter = (player.fatigueCounter || 0) + 1;
      const fatigueDamage = player.fatigueCounter;
      player.vanguard.hp = Math.max(0, player.vanguard.hp - fatigueDamage);
      this.log(`${player.name} takes ${fatigueDamage} Fatigue damage! (Deck Empty, Fatigue #${player.fatigueCounter})`, 'log-attack');
      this.notify({ type: 'combat_hit', targetType: 'vanguard', targetId: player.id, damage: fatigueDamage });
      if (player.vanguard.hp <= 0) this.checkWinCondition();
      return null;
    }

    if (player.hand.length >= 8) {
      const burned = player.deck.shift();
      player.graveyard.push(burned);
      this.log(`${player.name}'s hand is full! Burned ${burned.name}`, 'log-trap');
      return null;
    }

    const card = player.deck.shift();
    player.hand.push(card);
    if (playSound && window.soundEngine) {
      window.soundEngine.playCardDraw();
    }
    return card;
  }

  /**
   * Play a card from hand
   */
  playCard(instanceId, targetLaneIndex = null, spellTarget = null) {
    if (this.phase !== 'main') {
      this.log(`Cards can only be summoned or cast during Main Phase! (Currently in ${this.phase.toUpperCase()})`, 'log-trap');
      return false;
    }

    const active = this.getActivePlayer();
    const cardIndex = active.hand.findIndex(c => c.instanceId === instanceId);
    if (cardIndex === -1) return false;

    const card = active.hand[cardIndex];
    let actualCost = card.cost;

    // Check Ascension discount if played over existing creature
    const existingUnit = (targetLaneIndex !== null && targetLaneIndex >= 0) ? active.board[targetLaneIndex] : null;
    const isAscending = existingUnit && card.type === 'creature' && card.form > (existingUnit.form || 1);

    if (isAscending) {
      // Ascension discount: saves (Base Form * 2) Aether!
      actualCost = Math.max(1, card.cost - (existingUnit.form * 2));
    }

    if (active.aether < actualCost) {
      this.log(`Not enough Aether! (Needs ${actualCost}, has ${active.aether})`, 'log-trap');
      return false;
    }

    // Deduct Aether
    active.aether -= actualCost;
    active.hand.splice(cardIndex, 1);

    // SPELL CARD
    if (card.type === 'spell') {
      this.log(`${active.name} casts ${card.name}!`, 'log-summon');
      if (window.soundEngine) window.soundEngine.playSpell();
      if (card.cast) card.cast(this, spellTarget, active.id === 1);
      active.graveyard.push(card);
      this.notify({ type: 'spell_cast', card });
      return true;
    }

    // SECRET WARD / TRAP CARD
    if (card.type === 'ward') {
      const emptyWardSlot = active.wards.findIndex(w => w === null);
      if (emptyWardSlot !== -1) {
        active.wards[emptyWardSlot] = card;
        this.log(`${active.name} placed a Secret Ward!`, 'log-trap');
        if (window.soundEngine) window.soundEngine.playSpell();
        this.notify();
        return true;
      } else {
        // No ward slots open, refund
        active.aether += actualCost;
        active.hand.push(card);
        this.log('All Ward slots are occupied!', 'log-trap');
        return false;
      }
    }

    // CREATURE / ASCENSION
    if (card.type === 'creature') {
      let lane = targetLaneIndex;
      if (lane === null || lane < 0 || lane > 4) {
        lane = active.board.findIndex(slot => slot === null);
      }

      if (lane === -1 && !isAscending) {
        // Board full
        active.aether += actualCost;
        active.hand.push(card);
        this.log('Battlefield lanes are full!', 'log-trap');
        return false;
      }

      if (isAscending) {
        // ASCEND OVER EXISTING UNIT
        const oldName = existingUnit.name;
        // Transfer any existing buffs
        card.currentAtk = Math.max(card.atk, existingUnit.currentAtk + 1);
        card.currentHp = card.hp;
        card.maxHp = card.hp;
        card.canAttack = true; // Ascension rush!
        active.board[lane] = card;

        this.log(`${active.name} ASCENDED ${oldName} into ${card.name}!`, 'log-ascend');
        if (window.soundEngine) window.soundEngine.playAscend();
        
        // Trigger Ascension Burst
        if (card.onAscend) card.onAscend(card, this, active.id === 1);

        // Check opponent ward triggers for on_enemy_ascend
        this.checkWards('on_enemy_ascend', card, active.id !== 1);
      } else {
        // FRESH SUMMON
        card.canAttack = !!card.canAttackOnSummon; // Rush units can attack immediately
        active.board[lane] = card;
        this.log(`${active.name} summoned ${card.name} into Lane ${lane + 1}`, 'log-summon');
        if (window.soundEngine) window.soundEngine.playSummon();
        if (card.onPlay) card.onPlay(this, lane, active.id === 1);
      }

      this.notify();
      return true;
    }

    return false;
  }

  /**
   * Attack with a friendly creature against enemy target
   */
  declareAttack(attackerInstanceId, targetType, targetIdOrLane) {
    // If attacking while in Main Phase, automatically transition into Battle Phase
    if (this.phase === 'main') {
      this.setPhase('battle');
    }

    if (this.phase !== 'battle') {
      this.log(`Attacks can only be declared during the Battle Phase!`, 'log-trap');
      return false;
    }

    const active = this.getActivePlayer();
    const opponent = this.getOpponentPlayer();

    const attackerLane = active.board.findIndex(c => c && c.instanceId === attackerInstanceId);
    if (attackerLane === -1) return false;
    const attacker = active.board[attackerLane];

    if (!attacker.canAttack || attacker.hasAttackedThisTurn || attacker.frozen) {
      if (attacker.frozen) {
        this.log(`${attacker.name} is Frozen and cannot attack this turn!`, 'log-trap');
      } else if (attacker.hasAttackedThisTurn) {
        this.log(`${attacker.name} has already attacked this turn!`, 'log-trap');
      } else {
        this.log(`${attacker.name} has Summoning Sickness and must wait until next turn to attack!`, 'log-trap');
      }
      return false;
    }

    // Check for Taunt / Sentinel blockers
    const tauntCreatures = opponent.board.filter(c => c && c.hasTaunt);
    
    // Direct Attack against Opponent Vanguard
    if (targetType === 'vanguard') {
      if (tauntCreatures.length > 0) {
        this.log(`Must destroy enemy Taunt guardians before attacking Vanguard!`, 'log-trap');
        return false;
      }

      // Check Direct Attack Ward triggers
      const negated = this.checkWards('on_direct_attack', attacker, active.id !== 1);
      if (negated) {
        this.log(`Attack negated by Secret Ward!`, 'log-trap');
        attacker.hasAttackedThisTurn = true;
        attacker.canAttack = false;
        this.notify({ type: 'attack_negated', attacker });
        return true;
      }

      // Check Vanguard Attacked Ward triggers
      this.checkWards('on_vanguard_attacked', attacker, active.id !== 1);

      // Deal damage to hero
      const dmgDealt = attacker.currentAtk;
      opponent.vanguard.hp -= dmgDealt;
      attacker.hasAttackedThisTurn = true;
      attacker.canAttack = false;
      this.log(`${attacker.name} strikes ${opponent.vanguard.name} directly for ${dmgDealt} damage!`, 'log-attack');

      if (attacker.lifesteal) {
        this.healVanguard(dmgDealt, active.id === 1);
      }

      if (window.soundEngine) window.soundEngine.playAttack();
      this.checkWinCondition();
      this.notify({ type: 'combat_hit', targetType: 'vanguard', targetId: opponent.id, damage: dmgDealt, attackerLane });
      return true;
    }

    // Attack Opponent Creature in Lane
    if (targetType === 'creature') {
      const defenderLane = parseInt(targetIdOrLane, 10);
      const defender = opponent.board[defenderLane];
      if (!defender) return false;

      // If there's Taunt and target doesn't have Taunt, must target Taunt
      if (tauntCreatures.length > 0 && !defender.hasTaunt) {
        this.log(`Must target enemy Taunt guardian first!`, 'log-trap');
        return false;
      }

      // Check creature attack wards
      this.checkWards('on_creature_attack', attacker, active.id !== 1);

      this.log(`${attacker.name} (${attacker.currentAtk}/${attacker.currentHp}) attacks ${defender.name} (${defender.currentAtk}/${defender.currentHp})!`, 'log-attack');
      if (window.soundEngine) window.soundEngine.playAttack();

      // Resolve Combat Damage simultaneously
      let dmgToDefender = attacker.currentAtk;
      let dmgToAttacker = defender.currentAtk;

      // Defender damage taken
      if (defender.hasAegis) {
        defender.hasAegis = false;
        dmgToDefender = 0;
        this.log(`${defender.name}'s Aegis absorbed the blow!`, 'log-summon');
      } else {
        defender.currentHp -= dmgToDefender;
      }

      // Attacker retribution damage taken
      if (attacker.hasAegis) {
        attacker.hasAegis = false;
        dmgToAttacker = 0;
        this.log(`${attacker.name}'s Aegis absorbed the blow!`, 'log-summon');
      } else {
        attacker.currentHp -= dmgToAttacker;
      }

      attacker.hasAttackedThisTurn = true;
      attacker.canAttack = false;

      if (attacker.lifesteal && dmgToDefender > 0) {
        this.healVanguard(dmgToDefender, active.id === 1);
      }

      // Check for creature deaths
      if (defender.currentHp <= 0) {
        this.log(`${defender.name} was destroyed!`, 'log-attack');
        opponent.board[defenderLane] = null;
        opponent.graveyard.push(defender);
        if (defender.onDeath) defender.onDeath(this, opponent.id === 1);
      }

      if (attacker.currentHp <= 0) {
        this.log(`${attacker.name} was destroyed!`, 'log-attack');
        active.board[attackerLane] = null;
        active.graveyard.push(attacker);
        if (attacker.onDeath) attacker.onDeath(this, active.id === 1);
      }

      this.checkWinCondition();
      this.notify({ 
        type: 'combat_clash', 
        attackerLane, 
        defenderLane, 
        attackerDmg: dmgToDefender, 
        retributionDmg: dmgToAttacker,
        defenderDied: defender.currentHp <= 0,
        attackerDied: attacker.currentHp <= 0
      });
      return true;
    }

    return false;
  }

  /**
   * Activate Vanguard Hero Power
   */
  activateHeroPower() {
    if (this.phase !== 'main') {
      this.log('Hero Power can only be activated during Main Phase!', 'log-trap');
      return false;
    }
    const active = this.getActivePlayer();
    if (active.vanguard.heroPowerUsed) {
      this.log('Hero Power already used this turn!', 'log-trap');
      return false;
    }
    if (active.aether < active.vanguard.heroPower.cost) {
      this.log('Not enough Aether for Hero Power!', 'log-trap');
      return false;
    }

    active.aether -= active.vanguard.heroPower.cost;
    active.vanguard.heroPowerUsed = true;
    this.log(`${active.name} activated Hero Power: ${active.vanguard.heroPower.name}!`, 'log-summon');
    if (window.soundEngine) window.soundEngine.playSpell();

    active.vanguard.heroPower.action(this, active.id === 1);
    this.notify();
    return true;
  }

  /**
   * Check and trigger Secret Wards
   */
  checkWards(triggerType, eventPayload, forPlayer1) {
    const player = this.players[forPlayer1 ? 0 : 1];
    let triggeredAny = false;

    for (let i = 0; i < player.wards.length; i++) {
      const ward = player.wards[i];
      if (ward && ward.trigger === triggerType) {
        this.log(`SECRET WARD ACTIVATED: ${ward.name}!`, 'log-trap');
        if (window.soundEngine) window.soundEngine.playTrap();
        const result = ward.onTrigger ? ward.onTrigger(this, eventPayload, forPlayer1) : null;
        player.graveyard.push(ward);
        player.wards[i] = null; // Ward consumed
        triggeredAny = true || result;
      }
    }
    return triggeredAny;
  }

  /**
   * End current turn and pass to opponent
   */
  endTurn() {
    if (this.winner) return;

    const previousPlayer = this.getActivePlayer();

    // Switch turn
    this.currentTurn = this.currentTurn === 1 ? 2 : 1;
    if (this.currentTurn === 1) {
      this.round += 1;
    }

    // Check Couch Co-op privacy curtain requirement
    if (this.mode === 'couch_2p') {
      this.isPrivacyCurtainActive = true;
      this.log(`Turn ended. Information hidden for fairness. Pass device to ${this.getActivePlayer().name}.`, 'log-trap');
    } else {
      this.startTurn();
      // If AI turn, trigger AI thinking
      if (this.getActivePlayer().isAI && window.aiPlayer) {
        setTimeout(() => window.aiPlayer.takeTurn(this), 600);
      }
    }

    this.notify();
  }

  /**
   * Couch Co-op: Reveal privacy curtain and begin turn
   */
  revealAndStartTurn() {
    this.isPrivacyCurtainActive = false;
    this.startTurn();
    this.notify();
  }

  checkWinCondition() {
    if (this.players[0].vanguard.hp <= 0 && this.players[1].vanguard.hp <= 0) {
      this.winner = 'draw';
      this.log('Draw match! Both Vanguards have fallen.', 'log-trap');
    } else if (this.players[1].vanguard.hp <= 0) {
      this.winner = 1;
      this.log(`VICTORY! ${this.players[0].name} wins the clash!`, 'log-ascend');
      if (window.soundEngine) window.soundEngine.playVictory();
    } else if (this.players[0].vanguard.hp <= 0) {
      this.winner = 2;
      this.log(`DEFEAT! ${this.players[1].name} claims victory!`, 'log-attack');
      if (window.soundEngine) window.soundEngine.playAttack();
    }
  }

  // ==========================================
  // HELPER CARD EFFECTS
  // ==========================================
  healVanguard(amount, forPlayer1) {
    const player = this.players[forPlayer1 ? 0 : 1];
    player.vanguard.hp = Math.min(player.vanguard.maxHp, player.vanguard.hp + amount);
    this.log(`${player.name}'s Vanguard restored ${amount} HP!`, 'log-ascend');
  }

  dealDamageToOpponentHero(amount, isPlayer1) {
    const opponent = this.players[isPlayer1 ? 1 : 0];
    opponent.vanguard.hp -= amount;
    this.log(`${opponent.name}'s Vanguard took ${amount} damage!`, 'log-attack');
    this.checkWinCondition();
  }

  dealDamageToLowestOpponent(amount, isPlayer1) {
    const opponent = this.players[isPlayer1 ? 1 : 0];
    const liveMinions = opponent.board.filter(c => c !== null);
    if (liveMinions.length > 0) {
      liveMinions.sort((a, b) => a.currentHp - b.currentHp);
      liveMinions[0].currentHp -= amount;
      if (liveMinions[0].currentHp <= 0) {
        const lane = opponent.board.indexOf(liveMinions[0]);
        opponent.board[lane] = null;
        opponent.graveyard.push(liveMinions[0]);
      }
    } else {
      this.dealDamageToOpponentHero(amount, isPlayer1);
    }
  }

  dealAoEDamageToOpponentUnits(amount, isPlayer1) {
    const opponent = this.players[isPlayer1 ? 1 : 0];
    opponent.board.forEach((unit, idx) => {
      if (unit) {
        if (unit.hasAegis) {
          unit.hasAegis = false;
        } else {
          unit.currentHp -= amount;
          if (unit.currentHp <= 0) {
            opponent.board[idx] = null;
            opponent.graveyard.push(unit);
            if (unit.onDeath) unit.onDeath(this, opponent.id === 1);
          }
        }
      }
    });
  }

  freezeAllEnemyUnits(isPlayer1) {
    const opponent = this.players[isPlayer1 ? 1 : 0];
    opponent.board.forEach(unit => {
      if (unit) unit.frozen = true;
    });
    this.log(`All enemy units have been Frozen for 1 turn!`, 'log-trap');
  }

  freezeOpponentCreature(isPlayer1) {
    const opponent = this.players[isPlayer1 ? 1 : 0];
    const unit = opponent.board.find(c => c !== null);
    if (unit) {
      unit.frozen = true;
      this.log(`${unit.name} has been Frozen!`, 'log-trap');
    }
  }

  damageTarget(target, amount, isPlayer1) {
    const opponent = this.players[isPlayer1 ? 1 : 0];
    if (!target) {
      this.dealDamageToLowestOpponent(amount, isPlayer1);
      return;
    }

    if (target === 'vanguard' || (target && target.type === 'vanguard')) {
      this.dealDamageToOpponentHero(amount, isPlayer1);
      return;
    }

    // Target creature
    let unit = null;
    let lane = -1;
    if (typeof target === 'number') {
      lane = target;
      unit = opponent.board[lane];
    } else if (target.instanceId) {
      lane = opponent.board.findIndex(c => c && c.instanceId === target.instanceId);
      unit = lane !== -1 ? opponent.board[lane] : target;
    } else if (target.currentHp !== undefined) {
      unit = target;
      lane = opponent.board.indexOf(unit);
    }

    if (unit) {
      if (unit.hasAegis) {
        unit.hasAegis = false;
        this.log(`${unit.name}'s Aegis absorbed the ${amount} damage!`, 'log-summon');
      } else {
        unit.currentHp -= amount;
        this.log(`${unit.name} took ${amount} damage!`, 'log-attack');
        if (unit.currentHp <= 0) {
          this.log(`${unit.name} was destroyed!`, 'log-attack');
          if (lane !== -1) opponent.board[lane] = null;
          opponent.graveyard.push(unit);
          if (unit.onDeath) unit.onDeath(this, opponent.id === 1);
        }
      }
      this.checkWinCondition();
      this.notify({ type: 'target_damaged', unit, amount });
    }
  }

  buffRandomFriendlyUnitAtk(amount, isPlayer1) {
    const player = this.players[isPlayer1 ? 0 : 1];
    const unit = player.board.find(c => c !== null);
    if (unit) {
      unit.currentAtk += amount;
      this.log(`${unit.name} gained +${amount} ATK!`, 'log-ascend');
    }
  }

  grantRandomFriendlyAegis(isPlayer1) {
    const player = this.players[isPlayer1 ? 0 : 1];
    const unit = player.board.find(c => c !== null && !c.hasAegis);
    if (unit) {
      unit.hasAegis = true;
      this.log(`${unit.name} gained Aegis shield!`, 'log-ascend');
    }
  }

  grantTemporaryAether(amount, isPlayer1) {
    const player = this.players[isPlayer1 ? 0 : 1];
    player.aether += amount;
  }

  reduceHandCosts(amount, isPlayer1) {
    const player = this.players[isPlayer1 ? 0 : 1];
    player.hand.forEach(card => {
      card.cost = Math.max(0, card.cost - amount);
    });
    this.log(`${player.name}'s hand card costs reduced by ${amount}!`, 'log-ascend');
  }

  log(msg, type = '') {
    this.actionLogs.unshift({ text: msg, type, time: new Date().toLocaleTimeString() });
    if (this.actionLogs.length > 50) this.actionLogs.pop();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this));
  }
}

window.GameState = GameState;
