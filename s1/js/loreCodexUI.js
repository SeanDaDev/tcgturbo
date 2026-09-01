/**
 * TCG Turbo - 3D Almanac Showcase & Lore Codex
 */

class LoreCodexUI {
  constructor() {
    this.gameTitles = [
      'TCG Turbo',
      'TCG Turbo: Rift of Runes',
      'TCG Turbo: Shattered Echoes',
      'Aetherbound: Rift of Runes',
      'Conduit: Shattered Echoes',
      'Resonants: The Astral Spark',
      'Prismfall: Sovereign Tides',
      'Vanguard Continuum',
      'Grimoire Eclipse',
      'Sigilforge: Clash of Spheres',
      'Astral Ascendants',
      'Chroma Shard: Realm of Titans',
      'Aethelgard: The Living Loom',
      'Runic Horizon',
      'Soulbound Conduits',
      'Nexus Pulse: Battle of the Spheres',
      'Veilbreaker: Sovereign Sparks',
      'Aura Clash: Chronicles of Eden',
      'Arcane Flux: The Prime Wardens',
      'Voidweave: Celestial Duel',
      'Ethereal Gambit: Realm of Shards',
      'Novabound: Astral Tides',
      'Runekind: Clash of the Ascended'
    ];
  }

  init() {
    this.populateTitleSwitcher();
    this.render3DShowcase();
  }

  populateTitleSwitcher() {
    const select = document.getElementById('title-switcher-select');
    if (!select) return;

    select.innerHTML = '';
    this.gameTitles.forEach((title, idx) => {
      const opt = document.createElement('option');
      opt.value = title;
      opt.textContent = `${idx + 1}. ${title}`;
      if (idx === 0) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      this.setTitle(e.target.value);
    });
  }

  setTitle(newTitle) {
    const brandTitle = document.querySelector('.brand-title');
    if (brandTitle) brandTitle.textContent = newTitle;
    document.title = `${newTitle} | Modular Web TCG`;
    window.showToast(`Active title set to: "${newTitle}"`);
  }

  render3DShowcase() {
    const showcaseGrid = document.getElementById('almanac-cards-grid');
    if (!showcaseGrid) return;

    showcaseGrid.innerHTML = '';
    window.CARDS_DATA.forEach(cardData => {
      const cardEl = window.CardComponent.createCardElement(cardData);
      showcaseGrid.appendChild(cardEl);
    });
  }
}

window.loreCodexUI = new LoreCodexUI();
