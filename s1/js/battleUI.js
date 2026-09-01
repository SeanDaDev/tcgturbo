/**
 * Aetherbound TCG - Battlefield UI & Interactive Combat Manager
 */

class BattleUI {
  constructor() {
    this.game = null;
    this.selectedAttackerId = null;
    this.selectedHandCardId = null;
    this.isDraggingCard = false;
    this.draggedCardId = null;
  }

  init(gameState) {
    this.game = gameState;
    this.setupArrowCanvas();
    this.bindStaticEvents();
    this.render();

    // Subscribe to state changes
    this.game.subscribe(() => this.render());
  }

  bindStaticEvents() {
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        if (this.game && !this.game.winner) {
          this.game.endTurn();
        }
      });
    }

    const privacyReadyBtn = document.getElementById('privacy-ready-btn');
    if (privacyReadyBtn) {
      privacyReadyBtn.addEventListener('click', () => {
        if (this.game) {
          this.game.revealAndStartTurn();
        }
      });
    }

    const heroPowerBtn = document.getElementById('player-hero-power-btn');
    if (heroPowerBtn) {
      heroPowerBtn.addEventListener('click', () => {
        if (this.game && !this.game.winner) {
          this.game.activateHeroPower();
        }
      });
    }

    // Cancel targeting on escape or right click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.clearSelections();
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('.card') && !e.target.closest('.creature-lane-slot') && !e.target.closest('.vanguard-box')) {
        this.clearSelections();
      }
    });

    // Mouse movement for attack arrow
    window.addEventListener('mousemove', (e) => {
      if (this.selectedAttackerId) {
        this.updateAttackArrow(e.clientX, e.clientY);
      }
    });
  }

  clearSelections() {
    this.selectedAttackerId = null;
    this.selectedHandCardId = null;
    this.clearAttackArrow();
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

    // Update Topbar match info
    this.updateTopbar();

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

    // Update End Turn button state
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      const active = this.game.getActivePlayer();
      endTurnBtn.disabled = this.game.winner !== null || (active.isAI);
      endTurnBtn.textContent = active.isAI ? 'AI Thinking...' : 'End Turn';
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
    const isPlayerZone = (this.game.currentTurn === playerId) || (this.game.mode === 'solo_ai' && playerId === 1);
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
      powerBtn.disabled = player.vanguard.heroPowerUsed || player.aether < player.vanguard.heroPower.cost || this.game.currentTurn !== playerId;
    }

    // Targetable Hero click handler
    const heroBox = document.getElementById(`${prefix}-vanguard-box`);
    if (heroBox) {
      heroBox.onclick = () => {
        if (this.selectedAttackerId && this.game.currentTurn !== playerId) {
          // Declare direct attack on opponent hero
          this.game.declareAttack(this.selectedAttackerId, 'vanguard', null);
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
        const customClasses = `${isReady ? 'ready-to-attack' : ''} ${creature.instanceId === this.selectedAttackerId ? 'active-attacker' : ''}`;

        const cardEl = window.CardComponent.createCardElement(creature, { customClasses });

        // Click on friendly creature to select as attacker
        cardEl.onclick = (e) => {
          e.stopPropagation();
          if (isTurnOwner && isReady && (!player.isAI)) {
            if (this.selectedAttackerId === creature.instanceId) {
              this.clearSelections();
            } else {
              this.selectedAttackerId = creature.instanceId;
              this.updateTargetingHighlights();
              if (window.soundEngine) window.soundEngine.playHover();
            }
          } else if (this.selectedAttackerId && this.game.currentTurn !== playerId) {
            // Opponent creature clicked as attack target!
            this.game.declareAttack(this.selectedAttackerId, 'creature', laneIdx);
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
            // If spell or ward, play directly or select
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
    this.game.actionLogs.slice(0, 15).forEach(entry => {
      const line = document.createElement('div');
      line.className = `log-entry ${entry.type}`;
      line.textContent = `[${entry.time}] ${entry.text}`;
      logContainer.appendChild(line);
    });
  }

  updateTargetingHighlights() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('valid-target', 'ascension-candidate'));

    if (this.selectedAttackerId) {
      const opponentId = this.game.currentTurn === 1 ? 2 : 1;
      const opponent = this.game.players[opponentId - 1];
      const tauntBlockers = opponent.board.filter(c => c && c.hasTaunt);

      if (tauntBlockers.length > 0) {
        // Only Taunt creatures are valid
        document.querySelectorAll(`#p${opponentId}-lanes .card`).forEach(cardEl => {
          const id = cardEl.dataset.id;
          const def = window.CARDS_DATA.find(c => c.id === id);
          if (def && def.hasTaunt) cardEl.classList.add('valid-target');
        });
      } else {
        // All enemy creatures & hero are valid
        document.querySelectorAll(`#p${opponentId}-lanes .card`).forEach(cardEl => {
          cardEl.classList.add('valid-target');
        });
      }
    }
  }

  updateAttackArrow(mouseX, mouseY) {
    if (!this.ctx || !this.selectedAttackerId) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const attackerEl = document.querySelector(`.card-wrapper[data-instance-id="${this.selectedAttackerId}"]`);
    if (!attackerEl) return;

    const rect = attackerEl.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Draw glowing curved laser line
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);

    const cpX = (startX + mouseX) / 2 + (mouseY - startY) * 0.15;
    const cpY = (startY + mouseY) / 2 - (mouseX - startX) * 0.15;

    this.ctx.quadraticCurveTo(cpX, cpY, mouseX, mouseY);
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#ef4444';
    this.ctx.shadowBlur = 15;
    this.ctx.setLineDash([8, 4]);
    this.ctx.stroke();

    // Arrow head
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
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
