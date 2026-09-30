<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🎼 TCG TURBO 2: MULTI-AGENT SYMPHONY PROTOCOL
> **"Four Humans. Four AI Agents. One Harmonious Codebase."**

This repository is orchestrated for **four human developers and their dedicated AI agents** coding simultaneously in `tt2/tcgturbo2`. To ensure maximum velocity without merge conflicts, regressions, or cross-domain collisions, every AI agent operating here MUST strictly adhere to the following Prime Directives.

---

## 🏛️ Prime Directive 1: Strict Quadrant Sovereignty

The codebase is partitioned into four autonomous domains. **NEVER modify or delete files outside your assigned quadrant without explicit human instruction.**

```
                                  ┌───────────────────────────────┐
                                  │      THE 4 HUMAN DIRECTORS    │
                                  └──────────────┬────────────────┘
                                                 │
            ┌────────────────────────────┬───────┴────────────────────┬────────────────────────────┐
            ▼                            ▼                            ▼                            ▼
  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │   Developer 1    │         │   Developer 2    │         │   Developer 3    │         │   Developer 4    │
  │  + Engine Agent  │         │    + UI/VFX Agent│         │ + Network Agent  │         │   + Meta Agent   │
  └─────────┬────────┘         └─────────┬────────┘         └─────────┬────────┘         └─────────┬────────┘
            │                            │                            │                            │
            ▼                            ▼                            ▼                            ▼
  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │   QUADRANT 1     │         │   QUADRANT 2     │         │   QUADRANT 3     │         │   QUADRANT 4     │
  │  RULES & ENGINE  │         │  ARENA & AUDIO   │         │ MULTIPLAYER/SYNC │         │  DECKS & ECONOMY │
  └──────────────────┘         └──────────────────┘         └──────────────────┘         └──────────────────┘
            │                            │                            │                            │
            └────────────────────────────┴───────┬────────────────────┴────────────────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │       THE SHEET MUSIC         │
                                  │     `lib/tcg/types.ts`        │
                                  │  (Shared Contract Interface)  │
                                  └───────────────────────────────┘
```

### File Territory Map

| Quadrant | Lead Developer | Agent Persona | Exclusive File Territory | Core Responsibilities |
|---|---|---|---|---|
| **Quadrant 1: Engine** | **Dev 1 (Concertmaster)** | **Rules Engine Specialist** | `lib/tcg/gameEngine.ts`<br>`lib/tcg/aiPlayer.ts`<br>`lib/tcg/tcgWorkerManager.ts`<br>`__tests__/engine/**` | Pure deterministic state transitions, combat math, turn phases, keyword triggers (`Taunt`, `Rush`, `Ascend`, `Aegis`), AI heuristics, worker threads. **Zero React/DOM code.** |
| **Quadrant 2: UI & Audio** | **Dev 2 (Visual Virtuoso)** | **Arena & Graphics Virtuoso** | `components/tcg/BattleArena.tsx`<br>`components/tcg/Card.tsx`<br>`components/tcg/AmbientBackground.tsx`<br>`components/tcg/GameOverModal.tsx`<br>`components/tcg/PrivacyCurtainModal.tsx`<br>`lib/tcg/soundEngine.ts`<br>`app/battle/**` | 3D holographic card physics, mouse tilt parallax, holographic foil shaders, drag-and-drop targeting, lane animations, floating combat text, synthesized Web Audio SFX. |
| **Quadrant 3: Network** | **Dev 3 (Networking Maestro)** | **Multiplayer & Sync Architect** | `lib/tcg/quickplayEngine.ts`<br>`app/api/**`<br>`app/auth/**`<br>`app/protected/**`<br>`lib/supabase/**`<br>`lib/network/**` | Supabase Realtime channel management, 2-player lobby matchmaking, WebSocket state replication, turn timers, reconnection recovery, latency compensation, auth session validation. |
| **Quadrant 4: Meta & Economy** | **Dev 4 (Systems Architect)** | **Meta & Progression Designer** | `components/tcg/DeckBuilder.tsx`<br>`components/tcg/DeckSelectLobby.tsx`<br>`components/tcg/PackOpenerModal.tsx`<br>`components/tcg/CosmeticsShopModal.tsx`<br>`components/tcg/CardAlmanac.tsx`<br>`components/tcg/CardOutfitterStudio.tsx`<br>`components/tcg/RulesCodex.tsx`<br>`components/tcg/TradeModal.tsx`<br>`lib/tcg/cardsData.ts`<br>`lib/tcg/vanguardsData.ts`<br>`lib/tcg/presetDecks.ts`<br>`lib/tcg/collectionEngine.ts`<br>`lib/tcg/cosmeticsData.ts`<br>`lib/tcg/titlesData.ts` | Deck builder interface & mana curve analytics, booster pack opening physics/animations, cosmetic studio, card almanac/codex, player inventory, card database balancing. |

> 🛑 **Hard Enforcement**: If an agent is asked to fix a bug or add a feature in another quadrant's territory, it MUST STOP and ask the human to coordinate with that quadrant's developer.

---

## 📜 Prime Directive 2: The Sheet Music (`lib/tcg/types.ts`)

`lib/tcg/types.ts` is the single source of truth ("The Sheet Music") binding all four quadrants together.

1. **Contract Freezing**: No agent may unilaterally edit `lib/tcg/types.ts`.
2. **Schema Extension Protocol**:
   - If Quadrant 1 adds a new keyword or action type, or Quadrant 3 adds a network message type, the human developer must review the proposed interface addition first.
   - All shared properties must be strictly typed (avoid `any` at all costs).
3. **Event-Driven Decoupling**:
   - Cross-quadrant communication must use discrete event types (`GameAction`, `GameEvent`, `ActionLog`, `FloatingCombatText`) rather than direct module coupling.

---

## 🎭 Prime Directive 3: Mock-First Independence

No developer or agent should ever wait for another quadrant to finish. Code against mocks:

* **Engine (Dev 1)**: Test purely headless using automated unit test runners without any browser or server dependencies.
* **UI & Audio (Dev 2)**: Render `BattleArena.tsx` and `Card.tsx` using local mock `GameState` objects; do not block on the live game engine.
* **Network (Dev 3)**: Test realtime room handshakes using an in-memory loopback transport or mock opponent client.
* **Meta (Dev 4)**: Validate deck rules and pack opening rates using mock card catalogs and local storage state.

---

## 🌿 Prime Directive 4: Branching & Symphony Synchronization

### Git Collaboration Rhythm
* **Quadrant Branches**:
  - Dev 1: `feat/engine-rules`
  - Dev 2: `feat/arena-ui-vfx`
  - Dev 3: `feat/multiplayer-realtime`
  - Dev 4: `feat/meta-deckbuilder`
* **The 15-Minute Tuning Fork**:
  - Humans hold a 5-minute alignment check-in every 90 minutes.
  - Review any proposed additions to `lib/tcg/types.ts`.
  - Harmonize integration points before opening PRs into `main`.

---

## 🚀 Copy-Paste Agent Prompts for Each Human

### Prompt for Developer 1's Agent (Engine):
```
You are the Concertmaster AI for Quadrant 1 (Core Engine & Game Rules). Your exclusive domain is tt2/tcgturbo2/lib/tcg/gameEngine.ts, aiPlayer.ts, and tcgWorkerManager.ts. Your goal is pure deterministic rules execution, combat math, turn phase progression, and unit tests. Do not touch UI components, networking, or meta files. Always respect types in lib/tcg/types.ts.
```

### Prompt for Developer 2's Agent (UI/VFX):
```
You are the Visual Virtuoso AI for Quadrant 2 (Arena UI, 3D Physics & Audio). Your exclusive domain is tt2/tcgturbo2/components/tcg/BattleArena.tsx, Card.tsx, AmbientBackground.tsx, soundEngine.ts, and app/battle/. Your goal is rich 3D card tilt physics, holographic foil shaders, drag-and-drop combat arrows, and audio effects. Use mock GameState for testing. Do not touch gameEngine.ts or API routes.
```

### Prompt for Developer 3's Agent (Networking):
```
You are the Networking Maestro AI for Quadrant 3 (Multiplayer & Realtime Sync). Your exclusive domain is tt2/tcgturbo2/lib/tcg/quickplayEngine.ts, app/api/, app/auth/, and Supabase realtime channels. Your goal is peer room synchronization, action message dispatch over WebSocket, reconnect recovery, and latency compensation. Do not touch UI components or core card rules directly.
```

### Prompt for Developer 4's Agent (Meta & Economy):
```
You are the Systems Architect AI for Quadrant 4 (Deck Builder, Packs & Shop). Your exclusive domain is tt2/tcgturbo2/components/tcg/DeckBuilder.tsx, PackOpenerModal.tsx, CosmeticsShopModal.tsx, CardAlmanac.tsx, and data files (cardsData.ts, vanguardsData.ts, cosmeticsData.ts). Your goal is deck construction UX, pack opening excitement, and inventory management.
```

