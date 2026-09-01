/**
 * Aetherbound TCG - Deck Builder & Almanac UI
 */

class DeckBuilderUI {
  constructor() {
    this.currentDeck = [];
    this.deckName = 'Custom Astral Deck';
    this.selectedElement = 'all';
    this.selectedType = 'all';
    this.searchQuery = '';

    // Load default deck
    this.loadPreset('solar_pyre');
  }

  init() {
    this.bindEvents();
    this.renderCatalog();
    this.renderDeckList();
  }

  bindEvents() {
    // Filter chips
    document.querySelectorAll('.deckbuilder-view .filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const filterGroup = chip.dataset.filterGroup;
        const val = chip.dataset.filter;

        if (filterGroup === 'element') {
          this.selectedElement = val;
          document.querySelectorAll('.deckbuilder-view [data-filter-group="element"]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        } else if (filterGroup === 'type') {
          this.selectedType = val;
          document.querySelectorAll('.deckbuilder-view [data-filter-group="type"]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
        this.renderCatalog();
      });
    });

    // Search input
    const searchInput = document.getElementById('deck-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      });
    }

    // Preset selector
    const presetSelect = document.getElementById('deck-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.loadPreset(e.target.value);
      });
    }

    // Deck Name input
    const deckNameEl = document.getElementById('deck-name-input');
    if (deckNameEl) {
      deckNameEl.addEventListener('input', (e) => {
        this.deckName = e.target.value;
      });
    }

    // Save as P1 / P2 buttons
    const saveP1Btn = document.getElementById('btn-save-p1-deck');
    if (saveP1Btn) {
      saveP1Btn.addEventListener('click', () => {
        window.customP1Deck = [...this.currentDeck];
        window.showToast('Deck saved as Player 1 Loadout!');
      });
    }

    const saveP2Btn = document.getElementById('btn-save-p2-deck');
    if (saveP2Btn) {
      saveP2Btn.addEventListener('click', () => {
        window.customP2Deck = [...this.currentDeck];
        window.showToast('Deck saved as Player 2 Loadout!');
      });
    }

    // Clear Deck
    const clearBtn = document.getElementById('btn-clear-deck');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.currentDeck = [];
        this.renderDeckList();
      });
    }
  }

  loadPreset(presetKey) {
    const preset = window.PRESET_DECKS[presetKey];
    if (!preset) return;

    this.deckName = preset.name;
    const nameEl = document.getElementById('deck-name-input');
    if (nameEl) nameEl.value = preset.name;

    this.currentDeck = [...preset.cards];
    this.renderDeckList();
  }

  renderCatalog() {
    const catalogGrid = document.getElementById('deck-catalog-grid');
    if (!catalogGrid) return;

    catalogGrid.innerHTML = '';

    const filtered = window.CARDS_DATA.filter(card => {
      const matchElem = this.selectedElement === 'all' || card.element === this.selectedElement;
      const matchType = this.selectedType === 'all' || card.type === this.selectedType;
      const matchSearch = !this.searchQuery || card.name.toLowerCase().includes(this.searchQuery) || (card.desc && card.desc.toLowerCase().includes(this.searchQuery));
      return matchElem && matchType && matchSearch;
    });

    filtered.forEach(cardData => {
      const cardEl = window.CardComponent.createCardElement(cardData);

      // Left click to add to deck
      cardEl.onclick = () => {
        this.addCardToDeck(cardData.id);
      };

      catalogGrid.appendChild(cardEl);
    });
  }

  addCardToDeck(cardId) {
    if (this.currentDeck.length >= 20) {
      window.showToast('Max deck size is 20 cards!');
      return;
    }

    const countInDeck = this.currentDeck.filter(id => id === cardId).length;
    if (countInDeck >= 3) {
      window.showToast('Maximum 3 copies per card allowed!');
      return;
    }

    this.currentDeck.push(cardId);
    if (window.soundEngine) window.soundEngine.playCardDraw();
    this.renderDeckList();
  }

  removeCardFromDeck(cardId) {
    const idx = this.currentDeck.lastIndexOf(cardId);
    if (idx !== -1) {
      this.currentDeck.splice(idx, 1);
      if (window.soundEngine) window.soundEngine.playHover();
      this.renderDeckList();
    }
  }

  renderDeckList() {
    const listContainer = document.getElementById('deck-cards-list');
    const countBadge = document.getElementById('deck-count-badge');
    if (!listContainer) return;

    if (countBadge) {
      countBadge.textContent = `${this.currentDeck.length} / 14 cards`;
      countBadge.style.color = this.currentDeck.length >= 10 ? '#86efac' : '#fde047';
    }

    // Group deck by card ID
    const cardMap = {};
    this.currentDeck.forEach(id => {
      cardMap[id] = (cardMap[id] || 0) + 1;
    });

    listContainer.innerHTML = '';

    // Sort by cost then name
    const sortedCardIds = Object.keys(cardMap).sort((a, b) => {
      const cardA = window.CARDS_DATA.find(c => c.id === a);
      const cardB = window.CARDS_DATA.find(c => c.id === b);
      return (cardA?.cost || 0) - (cardB?.cost || 0);
    });

    sortedCardIds.forEach(id => {
      const card = window.CARDS_DATA.find(c => c.id === id);
      if (!card) return;

      const item = document.createElement('div');
      item.className = 'deck-list-item';
      item.innerHTML = `
        <div class="deck-item-left">
          <div class="deck-item-cost">${card.cost}</div>
          <span class="deck-item-name">${card.name}</span>
        </div>
        <div class="deck-item-count">x${cardMap[id]}</div>
      `;

      item.onclick = () => this.removeCardFromDeck(id);
      listContainer.appendChild(item);
    });

    this.renderManaCurve();
  }

  renderManaCurve() {
    const curveContainer = document.getElementById('deck-mana-curve');
    if (!curveContainer) return;

    const costs = [0, 0, 0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5, 6, 7+

    this.currentDeck.forEach(id => {
      const card = window.CARDS_DATA.find(c => c.id === id);
      if (card) {
        const c = Math.min(6, Math.max(0, card.cost - 1));
        costs[c]++;
      }
    });

    const maxVal = Math.max(1, ...costs);
    curveContainer.innerHTML = '';

    costs.forEach((count, idx) => {
      const col = document.createElement('div');
      col.className = 'curve-col';
      const pct = (count / maxVal) * 100;

      col.innerHTML = `
        <div class="curve-bar" style="height: ${Math.max(4, pct)}%;"></div>
        <span class="curve-label">${idx === 6 ? '7+' : idx + 1}</span>
      `;
      col.title = `Cost ${idx === 6 ? '7+' : idx + 1}: ${count} cards`;
      curveContainer.appendChild(col);
    });
  }
}

window.deckBuilderUI = new DeckBuilderUI();
