/**
 * Aetherbound TCG - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Toast System
  window.showToast = (msg) => {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  function createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.className = 'toast-container';
    document.body.appendChild(div);
    return div;
  }

  // Initialize Game Subsystems
  let currentMode = 'couch_2p'; // Default to 2-Player Couch Play as requested
  let currentGame = new window.GameState(currentMode, 'solar_pyre', 'void_shadow');
  window.battleUI.init(currentGame);
  window.deckBuilderUI.init();
  window.loreCodexUI.init();

  // Navigation Tab Switching
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const views = document.querySelectorAll('.view-container');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetViewId = tab.dataset.view;

      navTabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
      }

      // Refresh subview contents
      if (targetViewId === 'deckbuilder-view' && window.deckBuilderUI) {
        window.deckBuilderUI.renderCatalog();
        window.deckBuilderUI.renderDeckList();
      } else if (targetViewId === 'almanac-view' && window.loreCodexUI) {
        window.loreCodexUI.render3DShowcase();
      } else if (targetViewId === 'battle-view' && window.battleUI) {
        window.battleUI.render();
      }

      if (window.soundEngine) window.soundEngine.playHover();
    });
  });

  // Mode Switcher (Local 2P Couch Co-op vs Solo AI)
  const modeSelect = document.getElementById('match-mode-select');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      currentMode = e.target.value;
      startNewMatch();
    });
  }

  // New Match Button
  const newMatchBtn = document.getElementById('btn-new-match');
  if (newMatchBtn) {
    newMatchBtn.addEventListener('click', () => {
      startNewMatch();
    });
  }

  const playAgainBtn = document.getElementById('btn-play-again');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      document.getElementById('gameover-modal').classList.remove('active');
      startNewMatch();
    });
  }

  function startNewMatch() {
    const p1Deck = window.customP1Deck ? 'custom' : 'solar_pyre';
    const p2Deck = window.customP2Deck ? 'custom' : 'void_shadow';

    currentGame = new window.GameState(currentMode, 'solar_pyre', 'void_shadow');
    window.battleUI.init(currentGame);

    // Switch to Battle Arena tab
    const battleTab = document.querySelector('[data-view="battle-view"]');
    if (battleTab) battleTab.click();

    window.showToast(`Started new ${currentMode === 'couch_2p' ? 'Local 2-Player Couch' : 'Solo vs AI'} match!`);
  }

  // Audio Mute Toggle
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isSoundOn = window.soundEngine.toggleMute();
      soundBtn.classList.toggle('active-sound', isSoundOn);
      soundBtn.innerHTML = isSoundOn ? '🔊' : '🔇';
      window.showToast(isSoundOn ? 'Sound Enabled' : 'Sound Muted');
    });
  }

  // Fullscreen Toggle
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Close Card Inspector Modal
  const inspectorModal = document.getElementById('card-inspector-modal');
  const inspectorCloseBtn = document.getElementById('inspector-close-btn');
  if (inspectorCloseBtn && inspectorModal) {
    inspectorCloseBtn.addEventListener('click', () => {
      inspectorModal.classList.remove('active');
    });
    inspectorModal.addEventListener('click', (e) => {
      if (e.target === inspectorModal) {
        inspectorModal.classList.remove('active');
      }
    });
  }

  // Keyboard Hotkeys
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    // Space or Enter to step phase / pass turn
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (currentGame && !currentGame.winner) {
        if (currentGame.isPrivacyCurtainActive) {
          currentGame.revealAndStartTurn();
        } else if (currentGame.phase === 'main' || currentGame.phase === 'draw') {
          currentGame.setPhase('battle');
        } else if (currentGame.phase === 'battle') {
          currentGame.endTurn();
        }
      }
    }
    // B to enter Battle Phase
    if (e.key === 'b' || e.key === 'B') {
      if (currentGame && !currentGame.winner && currentGame.phase === 'main') {
        currentGame.setPhase('battle');
      }
    }
    // E to end turn immediately
    if (e.key === 'e' || e.key === 'E') {
      if (currentGame && !currentGame.winner && !currentGame.isPrivacyCurtainActive) {
        currentGame.endTurn();
      }
    }
    // R to toggle Quick Rules
    if (e.key === 'r' || e.key === 'R') {
      const quickRulesModal = document.getElementById('quick-rules-modal');
      if (quickRulesModal) quickRulesModal.classList.toggle('active');
    }
    // M to toggle mute
    if (e.key === 'm' || e.key === 'M') {
      if (soundBtn) soundBtn.click();
    }
  });
});
