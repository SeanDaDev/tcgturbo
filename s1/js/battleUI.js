/**
 * Aetherbound TCG - Battlefield UI & Interactive Combat Manager
 */

class BattleUI {
  constructor() {
    this.game = null;
    this.selectedAttackerId = null;
    this.selectedHandCardId = null;
    this.targetedSpellCardId = null;
    this.lastObservedPhase = null;
    this.bannerTimeout = null;
  }

  init(gameState) {
    this.game = gameState;
    this.setupArrowCanvas();
    this.bindStaticEvents();
    this.render();

    // Subscribe to state changes and combat events
    this.game.subscribe((game, eventData) => {
      this.handleGameEvent(eventData);
      this.render();
    });
  }

  handleGameEvent(eventData) {
    if (!eventData) return;

    if (eventData.type === 'phase_change') {
      const hints = {
        draw: 'Aether is replenished and a card is drawn.',
        main: 'Play creatures, ascend forms, cast spells, or use hero powers.',
        battle: 'Command ready units to attack enemy lanes or the Vanguard!',
        end: 'Turn concluding. Prepare for handover.'
      };
      this.showPhaseBanner(eventData.phase.toUpperCase() + ' PHASE', hints[eventData.phase] || '');
    } else if (eventData.type === 'combat_hit') {
      if (eventData.targetType === 'vanguard') {
        const heroBox = document.getElementById(`p${eventData.targetId}-vanguard-box`);
        if (heroBox && eventData.damage > 0) {
          this.spawnFloatingNumber(heroBox, `-${eventData.damage}`, 'damage');
        }
      }
    } else if (eventData.type === 'combat_clash') {
      const oppId = this.game.currentTurn === 1 ? 2 : 1;
      const myId = this.game.currentTurn;
      const defSlot = document.querySelector(`#p${oppId}-lanes .creature-lane-slot[data-lane="${eventData.defenderLane}"]`);
      const atkSlot = document.querySelector(`#p${myId}-lanes .creature-lane-slot[data-lane="${eventData.attackerLane}"]`);

      if (defSlot && eventData.attackerDmg > 0) {
        this.spawnFloatingNumber(defSlot, `-${eventData.attackerDmg}`, 'damage');
      }
      if (atkSlot && eventData.retributionDmg > 0) {
        this.spawnFloatingNumber(atkSlot, `-${eventData.retributionDmg}`, 'damage');
      }
    }
  }

  bindStaticEvents() {
    // Dynamic Phase Progression Button
    const phaseActionBtn = document.getElementById('btn-phase-action');
    if (phaseActionBtn) {
      phaseActionBtn.addEventListener('click', () => {
        this.handlePhaseAction();
      });
    }

    // End Turn Secondary Button
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        if (this.game && !this.game.winner) {
          this.game.endTurn();
        }
      });
    }

    // Phase Bar Clickable Step Pills
    const phaseSteps = document.querySelectorAll('.phase-step');
    phaseSteps.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPhase = btn.dataset.phase;
        if (!this.game || this.game.winner || this.game.getActivePlayer().isAI) return;

        if (targetPhase === 'main') {
          this.game.setPhase('main');
        } else if (targetPhase === 'battle') {
          this.game.setPhase('battle');
        } else if (targetPhase === 'end') {
          this.game.endTurn();
        }
      });
    });

    // Quick Rules Dialog
    const quickRulesBtn = document.getElementById('btn-quick-rules');
    const quickRulesModal = document.getElementById('quick-rules-modal');
    const quickRulesClose = document.getElementById('quick-rules-close-btn');

    if (quickRulesBtn && quickRulesModal) {
      quickRulesBtn.addEventListener('click', () => {
        quickRulesModal.classList.add('active');
        if (window.soundEngine) window.soundEngine.playHover();
      });
    }
    if (quickRulesClose && quickRulesModal) {
      quickRulesClose.addEventListener('click', () => {
        quickRulesModal.classList.remove('active');
      });
      quickRulesModal.addEventListener('click', (e) => {
        if (e.target === quickRulesModal) quickRulesModal.classList.remove('active');
      });
    }

    // Privacy Shield Ready Button
    const privacyReadyBtn = document.getElementById('privacy-ready-btn');
    if (privacyReadyBtn) {
      privacyReadyBtn.addEventListener('click', () => {
        if (this.game) {
          this.game.revealAndStartTurn();
        }
      });
    }

    // Hero Power Buttons
    ['p1', 'p2'].forEach((prefix, idx) => {
      const heroPowerBtn = document.getElementById(`${prefix}-hero-power-btn`);
      if (heroPowerBtn) {
        heroPowerBtn.addEventListener('click', () => {
          if (this.game && !this.game.winner && this.game.currentTurn === idx + 1) {
            this.game.activateHeroPower();
          }
        });
      }
    });

    // Cancel targeting on escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSelections();
        if (quickRulesModal) quickRulesModal.classList.remove('active');
      }
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('.card') && 
          !e.target.closest('.creature-lane-slot') && 
          !e.target.closest('.vanguard-box') && 
          !e.target.closest('.btn-phase-action') &&
          !e.target.closest('.phase-step')) {
        this.clearSelections();
      }
    });

    // Mouse movement for attack arrow & forecast tooltip
    window.addEventListener('mousemove', (e) => {
      if (this.selectedAttackerId || this.targetedSpellCardId) {
        this.updateAttackArrow(e.clientX, e.clientY);
        this.updateForecastTooltip(e.clientX, e.clientY, e.target);
      }
    });
  }

  handlePhaseAction() {
    if (!this.game || this.game.winner || this.game.getActivePlayer().isAI) return;

    if (this.game.phase === 'main' || this.game.phase === 'draw') {
      this.game.setPhase('battle');
    } else if (this.game.phase === 'battle') {
      this.game.endTurn();
    }
  }

  showPhaseBanner(title, hint) {
    const banner = document.getElementById('phase-banner-overlay');
    if (!banner) return;

    const titleEl = document.getElementById('phase-banner-title');
    const hintEl = document.getElementById('phase-banner-hint');

    if (titleEl) titleEl.textContent = title;
    if (hintEl) hintEl.textContent = hint;

    banner.classList.add('show');
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      banner.classList.remove('show');
    }, 1100);
  }

  spawnFloatingNumber(targetEl, text, type = 'damage') {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const floatEl = document.createElement('div');
    floatEl.className = `floating-combat-num ${type}`;
    floatEl.textContent = text;
    floatEl.style.left = `${rect.left + rect.width / 2 - 20}px`;
    floatEl.style.top = `${rect.top + 10}px`;
    document.body.appendChild(floatEl);

    setTimeout(() => floatEl.remove(), 1000);
  }

  clearSelections() {
    this.selectedAttackerId = null;
    this.selectedHandCardId = null;
    this.targetedSpellCardId = null;
    this.clearAttackArrow();
    this.hideForecastTooltip();
    this.updateTargetingHighlights();
  }

  setupArrowCanvas() {
    this.canvas = document.getElementById('combat-arrow-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  render() {
    if (!this.game) return;

    // Check game over
    this.updateGameOverModal();

    // Check Couch Co-Op Privacy Curtain
    this.updatePrivacyCurtain();

    // Update Topbar match info & Phase Tracker
    this.updateTopbar();
    this.updatePhaseTrackerUI();

    // Update Both Vanguards
    this.updateVanguardUI(1);
    this.updateVanguardUI(2);

    // Update Board Lanes
    this.renderLanes(1);
    this.renderLanes(2);

    // Update Wards
    this.renderWards(1);
    this.renderWards(2);

    // Update Hands
    this.renderHand(1);
    this.renderHand(2);

    // Update Piles
    this.updatePiles();

    // Update Logs
    this.renderLogs();

    // Update Dynamic Action Buttons
    this.updateActionButtons();
  }

  updatePhaseTrackerUI() {
    const activePhase = this.game.phase || 'main';
    const steps = document.querySelectorAll('.phase-step');
    steps.forEach(step => {
      const p = step.dataset.phase;
      if (p === activePhase) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  updateActionButtons() {
    const phaseActionBtn = document.getElementById('btn-phase-action');
    const phaseActionText = document.getElementById('btn-phase-action-text');
    const phaseActionIcon = document.getElementById('btn-phase-action-icon');
    const endTurnBtn = document.getElementById('btn-end-turn');

    const active = this.game.getActivePlayer();
    const isAI = active.isAI;
    const isGameOver = this.game.winner !== null;

    if (phaseActionBtn && phaseActionText) {
      phaseActionBtn.disabled = isGameOver || isAI;

      if (isAI) {
        phaseActionText.textContent = 'AI Thinking...';
        if (phaseActionIcon) phaseActionIcon.textContent = '🤖';
        phaseActionBtn.className = 'btn-phase-action';
      } else if (this.game.phase === 'main' || this.game.phase === 'draw') {
        phaseActionText.textContent = 'Battle Phase (Space)';
        if (phaseActionIcon) phaseActionIcon.textContent = '⚔️';
        phaseActionBtn.className = 'btn-phase-action btn-to-battle';
      } else if (this.game.phase === 'battle') {
        phaseActionText.textContent = 'End Turn (Space)';
        if (phaseActionIcon) phaseActionIcon.textContent = '🛡️';
        phaseActionBtn.className = 'btn-phase-action btn-to-end';
      }
    }

    if (endTurnBtn) {
      endTurnBtn.disabled = isGameOver || isAI;
    }
  }

  updatePrivacyCurtain() {
    const modal = document.getElementById('privacy-curtain-modal');
    if (!modal) return;

    if (this.game.isPrivacyCurtainActive) {
      const active = this.game.getActivePlayer();
      modal.querySelector('.privacy-title').textContent = `${active.name}'s Turn`;
      modal.querySelector('.privacy-subtitle').textContent = `Hand, secret wards, and tactical plans are concealed for fairness. Pass the device to ${active.name}.`;
      document.getElementById('privacy-ready-btn').textContent = `I am ${active.name} — Reveal & Begin Turn`;
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
    }
  }

  updateTopbar() {
    const modeBadge = document.getElementById('arena-mode-badge');
    const turnBadge = document.getElementById('arena-turn-badge');
    const roundBadge = document.getElementById('arena-round-badge');

    if (modeBadge) modeBadge.textContent = this.game.mode === 'couch_2p' ? 'Local 2P Couch Duel' : 'Solo vs AI';
    if (turnBadge) turnBadge.textContent = `${this.game.getActivePlayer().name}'s Turn`;
    if (roundBadge) roundBadge.textContent = `Round ${this.game.round}`;
  }

  updateVanguardUI(playerId) {
    const player = this.game.players[playerId - 1];
    const prefix = playerId === 1 ? 'p1' : 'p2';

    // Health
    const hpBar = document.getElementById(`${prefix}-hp-fill`);
    const hpText = document.getElementById(`${prefix}-hp-text`);
    const nameEl = document.getElementById(`${prefix}-vanguard-name`);
    const avatarEl = document.getElementById(`${prefix}-vanguard-avatar`);

    if (hpBar) {
      const pct = Math.max(0, Math.min(100, (player.vanguard.hp / player.vanguard.maxHp) * 100));
      hpBar.style.width = `${pct}%`;
    }
    if (hpText) hpText.textContent = `${player.vanguard.hp} / ${player.vanguard.maxHp} HP`;
    if (nameEl) nameEl.textContent = `${player.name} (${player.vanguard.name})`;
    if (avatarEl && player.vanguard.avatar) avatarEl.src = player.vanguard.avatar;

    // Aether Meter
    const aetherText = document.getElementById(`${prefix}-aether-count`);
    const aetherGems = document.getElementById(`${prefix}-aether-gems`);
    if (aetherText) aetherText.textContent = `${player.aether} / ${player.maxAether}`;
    if (aetherGems) {
      aetherGems.innerHTML = '';
      for (let i = 0; i < player.maxAether; i++) {
        const gem = document.createElement('div');
        gem.className = `aether-gem ${i < player.aether ? 'filled' : ''}`;
        aetherGems.appendChild(gem);
      }
    }

    // Hero Power Button
    const powerBtn = document.getElementById(`${prefix}-hero-power-btn`);
    if (powerBtn) {
      powerBtn.title = `${player.vanguard.heroPower.name} (${player.vanguard.heroPower.cost} Aether): ${player.vanguard.heroPower.desc}`;
      powerBtn.disabled = player.vanguard.heroPowerUsed || 
                          player.aether < player.vanguard.heroPower.cost || 
                          this.game.currentTurn !== playerId || 
                          this.game.phase !== 'main';
    }

    // Targetable Hero click handler
    const heroBox = document.getElementById(`${prefix}-vanguard-box`);
    if (heroBox) {
      heroBox.classList.toggle('active-turn', this.game.currentTurn === playerId);
      heroBox.onclick = () => {
        if (this.selectedAttackerId && this.game.currentTurn !== playerId) {
          // Declare direct attack on opponent hero
          this.game.declareAttack(this.selectedAttackerId, 'vanguard', null);
          this.clearSelections();
        } else if (this.targetedSpellCardId && this.game.currentTurn !== playerId) {
          // Cast targeted spell on Vanguard
          this.game.playCard(this.targetedSpellCardId, null, 'vanguard');
          this.clearSelections();
        }
      };
    }
  }

  renderLanes(playerId) {
    const player = this.game.players[playerId - 1];
    const prefix = playerId === 1 ? 'p1' : 'p2';
    const lanesWrap = document.getElementById(`${prefix}-lanes`);
    if (!lanesWrap) return;

    lanesWrap.innerHTML = '';

    player.board.forEach((creature, laneIdx) => {
      const slot = document.createElement('div');
      slot.className = 'creature-lane-slot';
      slot.dataset.lane = laneIdx;
      slot.dataset.player = playerId;

      if (creature) {
        const isTurnOwner = this.game.currentTurn === playerId;
        const isReady = isTurnOwner && creature.canAttack && !creature.hasAttackedThisTurn && !creature.frozen;
        const isAttacker = creature.instanceId === this.selectedAttackerId;
        const customClasses = `${isReady ? 'ready-to-attack' : ''} ${isAttacker ? 'active-attacker' : ''}`;

        const cardEl = window.CardComponent.createCardElement(creature, { 
          isOnBoard: true, 
          customClasses 
        });

        // Click on friendly creature to select as attacker
        cardEl.onclick = (e) => {
          e.stopPropagation();
          if (isTurnOwner && (!player.isAI)) {
            if (isReady) {
              if (this.selectedAttackerId === creature.instanceId) {
                this.clearSelections();
              } else {
                // If currently in main phase, transition to battle phase
                if (this.game.phase === 'main') {
                  this.game.setPhase('battle');
                }
                this.selectedAttackerId = creature.instanceId;
                this.targetedSpellCardId = null;
                this.updateTargetingHighlights();
                if (window.soundEngine) window.soundEngine.playHover();
              }
            } else if (creature.frozen) {
              window.showToast(`${creature.name} is Frozen and cannot attack!`);
            } else if (creature.hasAttackedThisTurn) {
              window.showToast(`${creature.name} has already attacked this turn.`);
            } else {
              window.showToast(`${creature.name} has Summoning Sickness. Ready next turn!`);
            }
          } else if (this.selectedAttackerId && this.game.currentTurn !== playerId) {
            // Opponent creature clicked as attack target!
            this.game.declareAttack(this.selectedAttackerId, 'creature', laneIdx);
            this.clearSelections();
          } else if (this.targetedSpellCardId && this.game.currentTurn !== playerId) {
            // Target of spell
            this.game.playCard(this.targetedSpellCardId, null, creature);
            this.clearSelections();
          }
        };

        slot.appendChild(cardEl);
      } else {
        // Empty slot placeholder
        slot.innerHTML = `<span class="lane-placeholder-num">${laneIdx + 1}</span>`;

        // Click to play card from hand into this lane
        slot.onclick = () => {
          if (this.selectedHandCardId && this.game.currentTurn === playerId) {
            this.game.playCard(this.selectedHandCardId, laneIdx);
            this.clearSelections();
          }
        };

        // Dragover / drop support
        slot.ondragover = (e) => {
          e.preventDefault();
          slot.classList.add('highlight-drop');
        };
        slot.ondragleave = () => slot.classList.remove('highlight-drop');
        slot.ondrop = (e) => {
          e.preventDefault();
          slot.classList.remove('highlight-drop');
          const cardId = e.dataTransfer.getData('text/plain');
          if (cardId && this.game.currentTurn === playerId) {
            this.game.playCard(cardId, laneIdx);
            this.clearSelections();
          }
        };
      }

      lanesWrap.appendChild(slot);
    });
  }

  renderWards(playerId) {
    const player = this.game.players[playerId - 1];
    const prefix = playerId === 1 ? 'p1' : 'p2';
    const wardsWrap = document.getElementById(`${prefix}-wards`);
    if (!wardsWrap) return;

    wardsWrap.innerHTML = '';
    player.wards.forEach((ward, idx) => {
      const slot = document.createElement('div');
      slot.className = `ward-slot ${ward ? 'has-ward' : ''}`;
      if (ward) {
        const isCurrentView = this.game.currentTurn === playerId;
        slot.innerHTML = isCurrentView ? `<span>✦ ${ward.name.substring(0, 7)}..</span>` : `<span>✦ WARD</span>`;
        slot.title = isCurrentView ? `${ward.name}: ${ward.desc}` : 'Secret Ward (Facedown)';
      } else {
        slot.innerHTML = `<span>[+]</span>`;
      }
      wardsWrap.appendChild(slot);
    });
  }

  renderHand(playerId) {
    const player = this.game.players[playerId - 1];
    const prefix = playerId === 1 ? 'p1' : 'p2';
    const handWrap = document.getElementById(`${prefix}-hand`);
    if (!handWrap) return;

    handWrap.innerHTML = '';

    const isCurrentActive = this.game.currentTurn === playerId;
    const hideCards = (!isCurrentActive && this.game.mode === 'couch_2p') || (player.isAI);

    player.hand.forEach(card => {
      const cardEl = window.CardComponent.createCardElement(card, {
        isFaceDown: hideCards
      });

      if (!hideCards) {
        cardEl.draggable = true;
        cardEl.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', card.instanceId);
          this.selectedHandCardId = card.instanceId;
        };

        cardEl.onclick = (e) => {
          e.stopPropagation();
          if (this.game.currentTurn === playerId) {
            if (this.game.phase !== 'main') {
              window.showToast('Cards can only be summoned or cast in Main Phase!');
              return;
            }

            // If spell with target
            if (card.type === 'spell' && card.targetType === 'any_enemy') {
              if (this.targetedSpellCardId === card.instanceId) {
                this.clearSelections();
              } else {
                this.targetedSpellCardId = card.instanceId;
                this.selectedAttackerId = null;
                this.updateTargetingHighlights();
                window.showToast(`Select enemy target for ${card.name}`);
              }
              return;
            }

            // Instant spell or ward
            if (card.type === 'spell' || card.type === 'ward') {
              this.game.playCard(card.instanceId);
              this.clearSelections();
            } else {
              // Creature: select to place in lane
              if (this.selectedHandCardId === card.instanceId) {
                // Double click plays in first available lane
                this.game.playCard(card.instanceId);
                this.clearSelections();
              } else {
                this.selectedHandCardId = card.instanceId;
                this.updateTargetingHighlights();
              }
            }
          }
        };
      }

      handWrap.appendChild(cardEl);
    });
  }

  updatePiles() {
    const p1Deck = document.getElementById('p1-deck-count');
    const p2Deck = document.getElementById('p2-deck-count');
    const p1Grave = document.getElementById('p1-grave-count');
    const p2Grave = document.getElementById('p2-grave-count');

    if (p1Deck) p1Deck.textContent = this.game.players[0].deck.length;
    if (p2Deck) p2Deck.textContent = this.game.players[1].deck.length;
    if (p1Grave) p1Grave.textContent = this.game.players[0].graveyard.length;
    if (p2Grave) p2Grave.textContent = this.game.players[1].graveyard.length;
  }

  renderLogs() {
    const logContainer = document.getElementById('battle-log-pane');
    if (!logContainer) return;

    logContainer.innerHTML = '';
    this.game.actionLogs.slice(0, 18).forEach(entry => {
      const line = document.createElement('div');
      line.className = `log-entry ${entry.type}`;
      line.textContent = `[${entry.time}] ${entry.text}`;
      logContainer.appendChild(line);
    });
  }

  updateTargetingHighlights() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('valid-target', 'ascension-candidate'));
    document.querySelectorAll('.vanguard-box').forEach(v => v.classList.remove('valid-target'));

    if (this.selectedAttackerId || this.targetedSpellCardId) {
      const opponentId = this.game.currentTurn === 1 ? 2 : 1;
      const opponent = this.game.players[opponentId - 1];
      const tauntBlockers = opponent.board.filter(c => c && c.hasTaunt);

      if (tauntBlockers.length > 0 && this.selectedAttackerId) {
        // Only Taunt creatures are valid targets for physical attack
        document.querySelectorAll(`#p${opponentId}-lanes .card`).forEach(cardEl => {
          const id = cardEl.dataset.id;
          const def = window.CARDS_DATA.find(c => c.id === id);
          if (def && def.hasTaunt) cardEl.classList.add('valid-target');
        });
      } else {
        // All enemy creatures & enemy vanguard are valid
        document.querySelectorAll(`#p${opponentId}-lanes .card`).forEach(cardEl => {
          cardEl.classList.add('valid-target');
        });
        const oppVanguard = document.getElementById(`p${opponentId}-vanguard-box`);
        if (oppVanguard) oppVanguard.classList.add('valid-target');
      }
    }
  }

  updateAttackArrow(mouseX, mouseY) {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let startX = 0;
    let startY = 0;

    if (this.selectedAttackerId) {
      const attackerEl = document.querySelector(`.card-wrapper[data-instance-id="${this.selectedAttackerId}"]`);
      if (!attackerEl) return;
      const rect = attackerEl.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if (this.targetedSpellCardId) {
      const spellEl = document.querySelector(`.card-wrapper[data-instance-id="${this.targetedSpellCardId}"]`);
      if (!spellEl) return;
      const rect = spellEl.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else {
      return;
    }

    // Draw glowing curved laser line
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);

    const cpX = (startX + mouseX) / 2 + (mouseY - startY) * 0.15;
    const cpY = (startY + mouseY) / 2 - (mouseX - startX) * 0.15;

    this.ctx.quadraticCurveTo(cpX, cpY, mouseX, mouseY);
    this.ctx.strokeStyle = this.targetedSpellCardId ? 'rgba(59, 130, 246, 0.85)' : 'rgba(239, 68, 68, 0.85)';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = this.targetedSpellCardId ? '#3b82f6' : '#ef4444';
    this.ctx.shadowBlur = 15;
    this.ctx.setLineDash([8, 4]);
    this.ctx.stroke();

    // Arrow head
    this.ctx.fillStyle = this.targetedSpellCardId ? '#3b82f6' : '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  updateForecastTooltip(mouseX, mouseY, targetEl) {
    const tooltip = document.getElementById('combat-forecast-tooltip');
    if (!tooltip || !this.selectedAttackerId) {
      this.hideForecastTooltip();
      return;
    }

    const targetCardEl = targetEl.closest('.card');
    const targetVanguardBox = targetEl.closest('.vanguard-box');

    const activePlayer = this.game.getActivePlayer();
    const attacker = activePlayer.board.find(c => c && c.instanceId === this.selectedAttackerId);
    if (!attacker) {
      this.hideForecastTooltip();
      return;
    }

    const opponentId = this.game.currentTurn === 1 ? 2 : 1;
    const opponent = this.game.players[opponentId - 1];

    if (targetVanguardBox && targetVanguardBox.id === `p${opponentId}-vanguard-box`) {
      // Forecast vs Vanguard
      tooltip.style.left = `${mouseX + 16}px`;
      tooltip.style.top = `${mouseY - 20}px`;
      document.getElementById('forecast-atk-dmg').textContent = `-${attacker.currentAtk}`;
      document.getElementById('forecast-retrib-dmg').textContent = `0 (Hero)`;
      document.getElementById('forecast-outcome').textContent = `Direct Vanguard Strike!`;
      tooltip.classList.add('active');
      return;
    }

    if (targetCardEl) {
      const laneSlot = targetCardEl.closest('.creature-lane-slot');
      if (laneSlot && parseInt(laneSlot.dataset.player, 10) === opponentId) {
        const laneIdx = parseInt(laneSlot.dataset.lane, 10);
        const defender = opponent.board[laneIdx];
        if (defender) {
          tooltip.style.left = `${mouseX + 16}px`;
          tooltip.style.top = `${mouseY - 20}px`;

          const dmgToDef = defender.hasAegis ? 0 : attacker.currentAtk;
          const dmgToAtk = attacker.hasAegis ? 0 : defender.currentAtk;

          document.getElementById('forecast-atk-dmg').textContent = defender.hasAegis ? 'Aegis Block' : `-${dmgToDef}`;
          document.getElementById('forecast-retrib-dmg').textContent = attacker.hasAegis ? 'Aegis Block' : `-${dmgToAtk}`;

          let outcome = 'Clash';
          if (dmgToDef >= defender.currentHp && dmgToAtk < attacker.currentHp) outcome = '⚔️ Destroys Enemy!';
          else if (dmgToDef >= defender.currentHp && dmgToAtk >= attacker.currentHp) outcome = '💥 Mutual Destruction!';
          else if (dmgToDef < defender.currentHp && dmgToAtk >= attacker.currentHp) outcome = '💀 Attacker Falls!';
          else outcome = '🛡️ Both Survive';

          document.getElementById('forecast-outcome').textContent = outcome;
          tooltip.classList.add('active');
          return;
        }
      }
    }

    this.hideForecastTooltip();
  }

  hideForecastTooltip() {
    const tooltip = document.getElementById('combat-forecast-tooltip');
    if (tooltip) tooltip.classList.remove('active');
  }

  clearAttackArrow() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  updateGameOverModal() {
    const modal = document.getElementById('gameover-modal');
    if (!modal) return;

    if (this.game.winner !== null) {
      const title = modal.querySelector('.gameover-title');
      const desc = modal.querySelector('.gameover-desc');

      if (this.game.winner === 'draw') {
        title.className = 'gameover-title';
        title.textContent = 'STALEMATE';
        desc.textContent = 'Both Vanguards fell in simultaneous resonance.';
      } else {
        const winnerPlayer = this.game.players[this.game.winner - 1];
        title.className = `gameover-title ${this.game.winner === 1 ? 'victory' : 'defeat'}`;
        title.textContent = `${winnerPlayer.name} WINS!`;
        desc.textContent = `The Astral Nexus acknowledges the superior Vanguard.`;
      }
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
    }
  }
}

window.battleUI = new BattleUI();
