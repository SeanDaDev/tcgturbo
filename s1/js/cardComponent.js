/**
 * Aetherbound TCG - Interactive 3D Card Component
 * Handles rendering, mouse-parallax holographic tilt, and card inspection.
 */

class CardComponent {
  /**
   * Render an interactive card DOM element
   * @param {Object} cardData - The card definition object
   * @param {Object} options - Options: isFaceDown, size, customClasses, instanceId
   */
  static createCardElement(cardData, options = {}) {
    const isFaceDown = options.isFaceDown || false;
    const instanceId = options.instanceId || (cardData ? cardData.instanceId : null);

    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';
    if (instanceId) wrapper.dataset.instanceId = instanceId;

    if (isFaceDown) {
      wrapper.innerHTML = `
        <div class="card card-back">
          <div class="card-back-inner">
            <div class="card-back-mandala">
              <div class="card-back-symbol"></div>
            </div>
          </div>
        </div>
      `;
      return wrapper;
    }

    if (!cardData) return wrapper;

    const element = cardData.element || 'astral';
    const rarity = cardData.rarity || 'common';
    const formLabel = cardData.form === 1 ? 'I' : cardData.form === 2 ? 'II' : cardData.form === 3 ? 'III' : null;
    const isSpell = cardData.type === 'spell';
    const isWard = cardData.type === 'ward';

    const card = document.createElement('div');
    card.className = `card ${options.customClasses || ''}`;
    card.dataset.id = cardData.id;
    card.dataset.element = element;
    card.dataset.rarity = rarity;
    card.dataset.type = cardData.type || 'creature';
    if (cardData.hasAegis) card.classList.add('has-aegis');

    // Artwork and Crop
    const elementDefaultArt = {
      solar: 'assets/cards/card_ignis.jpg',
      void: 'assets/cards/card_valkyrie.jpg',
      verdant: 'assets/cards/card_titan.jpg',
      tide: 'assets/cards/card_tide.jpg',
      astral: 'assets/cards/card_time.jpg'
    };
    const artSrc = cardData.art || elementDefaultArt[element] || 'assets/cards/card_ignis.jpg';
    const cropStyle = cardData.cropOffset ? `style="object-position: ${cardData.cropOffset};"` : '';

    // Keywords badges HTML
    const keywordsHtml = (cardData.keywords || []).map(kw => `<span class="card-keyword">[${kw}]</span>`).join(' ');

    // Bottom bar (ATK/HP vs Spell/Ward label)
    let bottomBarHtml = '';
    if (isSpell) {
      bottomBarHtml = `
        <div class="card-stats-bar">
          <span class="card-spell-label">✦ SPELL ✦</span>
          <div class="card-rarity-gem"></div>
        </div>
      `;
    } else if (isWard) {
      bottomBarHtml = `
        <div class="card-stats-bar">
          <span class="card-spell-label">✦ SECRET WARD ✦</span>
          <div class="card-rarity-gem"></div>
        </div>
      `;
    } else {
      const currentAtk = cardData.currentAtk !== undefined ? cardData.currentAtk : cardData.atk;
      const currentHp = cardData.currentHp !== undefined ? cardData.currentHp : cardData.hp;
      const maxHp = cardData.maxHp !== undefined ? cardData.maxHp : cardData.hp;
      const hpDamagedClass = currentHp < maxHp ? 'damaged' : currentHp > maxHp ? 'buffed' : '';

      bottomBarHtml = `
        <div class="card-stats-bar">
          <div class="card-stat card-stat-atk" title="Attack Power">${currentAtk}</div>
          <div class="card-rarity-gem"></div>
          <div class="card-stat card-stat-hp ${hpDamagedClass}" title="Health">${currentHp}</div>
        </div>
      `;
    }

    // Status badges on board
    let statusBadgesHtml = '';
    if (cardData.type === 'creature') {
      if (cardData.frozen) {
        card.classList.add('is-frozen');
        statusBadgesHtml += `<span class="card-status-badge status-frozen">❄️ Frozen</span>`;
      }
      if (cardData.hasAegis) {
        statusBadgesHtml += `<span class="card-status-badge status-aegis">✨ Aegis</span>`;
      }
      if (cardData.hasTaunt || (cardData.keywords && cardData.keywords.includes('Taunt'))) {
        card.classList.add('has-taunt');
        statusBadgesHtml += `<span class="card-status-badge status-taunt">🛡️ Taunt</span>`;
      }
      if (options.isOnBoard) {
        if (cardData.canAttack && !cardData.hasAttackedThisTurn && !cardData.frozen) {
          statusBadgesHtml += `<span class="card-status-badge status-ready">⚡ Ready</span>`;
        } else if (!cardData.canAttack && !cardData.hasAttackedThisTurn && !cardData.frozen) {
          card.classList.add('has-sickness');
          statusBadgesHtml += `<span class="card-status-badge status-sickness" title="Summoning Sickness (Can attack next turn)">💤 Sleep</span>`;
        } else if (cardData.hasAttackedThisTurn) {
          card.classList.add('is-exhausted');
          statusBadgesHtml += `<span class="card-status-badge status-exhausted">✓ Done</span>`;
        }
      }
    }

    card.innerHTML = `
      <div class="card-inner">
        <!-- 3D Foil & Glare Layers -->
        <div class="card-foil"></div>
        <div class="card-glare"></div>

        <!-- Header Frame -->
        <div class="card-frame-header">
          <span class="card-title" title="${cardData.name}">${cardData.name}</span>
          <div class="card-cost-gem" title="Aether Cost">${cardData.cost}</div>
        </div>

        <!-- Art Box -->
        <div class="card-art-box">
          <button class="card-inspect-btn" title="Inspect Full Card & Lore" type="button">🔍</button>
          <img src="${artSrc}" alt="${cardData.name}" class="card-art-img" ${cropStyle} loading="lazy" />
          ${formLabel ? `<div class="card-form-badge" title="Ascension Form ${formLabel}">Form ${formLabel}</div>` : ''}
          <div class="card-type-tag">${cardData.element} ${cardData.type}</div>
          ${statusBadgesHtml ? `<div class="card-status-badges-row">${statusBadgesHtml}</div>` : ''}
        </div>

        <!-- Ability Box -->
        <div class="card-text-box">
          <div>${keywordsHtml} ${cardData.desc || ''}</div>
        </div>

        <!-- Stats Bar -->
        ${bottomBarHtml}
      </div>
    `;

    CardComponent.attach3DPhysics(card);

    // Inspect button click
    const inspectBtn = card.querySelector('.card-inspect-btn');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        CardComponent.openInspector(cardData);
      });
    }

    // Double click or right click to inspect
    wrapper.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      CardComponent.openInspector(cardData);
    });

    wrapper.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      CardComponent.openInspector(cardData);
    });

    wrapper.appendChild(card);
    return wrapper;
  }

  /**
   * Attach 3D mouse parallax and foil sheen physics to a card element
   */
  static attach3DPhysics(cardElement) {
    const handleMouseMove = (e) => {
      const rect = cardElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;

      // Rotations (-15deg to +15deg)
      const rx = ((y - rect.height / 2) / (rect.height / 2)) * -14;
      const ry = ((x - rect.width / 2) / (rect.width / 2)) * 14;

      cardElement.style.setProperty('--pointer-x', `${px}%`);
      cardElement.style.setProperty('--pointer-y', `${py}%`);
      cardElement.style.setProperty('--card-opacity', '1');
      cardElement.style.setProperty('--card-rx', `${rx.toFixed(2)}deg`);
      cardElement.style.setProperty('--card-ry', `${ry.toFixed(2)}deg`);
    };

    const handleMouseLeave = () => {
      cardElement.style.setProperty('--card-opacity', '0');
      cardElement.style.setProperty('--card-rx', '0deg');
      cardElement.style.setProperty('--card-ry', '0deg');
    };

    const handleMouseEnter = () => {
      if (window.soundEngine) {
        window.soundEngine.playHover();
      }
    };

    cardElement.addEventListener('mousemove', handleMouseMove);
    cardElement.addEventListener('mouseleave', handleMouseLeave);
    cardElement.addEventListener('mouseenter', handleMouseEnter);
  }

  /**
   * Open high definition card inspection modal
   */
  static openInspector(cardData) {
    const modal = document.getElementById('card-inspector-modal');
    if (!modal || !cardData) return;

    const cardView = modal.querySelector('.inspector-card-view');
    cardView.innerHTML = '';
    const inspectCard = CardComponent.createCardElement(cardData);
    cardView.appendChild(inspectCard);

    modal.querySelector('.inspector-card-name').textContent = cardData.name;
    modal.querySelector('.inspector-meta').textContent = `Element: ${cardData.element.toUpperCase()} | Cost: ${cardData.cost} Aether | ${cardData.rarity.toUpperCase()}`;
    modal.querySelector('.inspector-lore').textContent = `"${cardData.lore || 'An ancient relic of the Nexus realm.'}"`;
    modal.querySelector('.inspector-ability-desc').innerHTML = `${(cardData.keywords || []).map(k => `<strong>[${k}]</strong>`).join(' ')} ${cardData.desc || 'No additional effect.'}`;

    modal.classList.add('active');
    if (window.soundEngine) window.soundEngine.playCardDraw();
  }
}

window.CardComponent = CardComponent;
