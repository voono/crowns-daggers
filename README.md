# Crowns & Daggers

**Betray Your Friends.** A game of hidden orders, ruthless diplomacy, and inevitable backstabbing.

Crowns & Daggers is a **2–4 player** strategy game played on a shared device. Each turn you secretly issue orders to your territories—attack, defend, support, or muster—then reveal them all at once. Alliances are made and broken in the same breath. First house to control enough territories claims the throne.

---

## Quick Start

```bash
npm install
npm run dev
```

Open the URL in your browser (usually `http://localhost:5173`). Choose 2, 3, or 4 players and **Start Game**. Pass the device when prompted so each player can place their orders in secret.

---

## How to Play

### Turn structure

1. **War Room (Diplomacy)** — See the map, discuss (or lie), plan. When ready, begin secret orders.
2. **Secret Orders** — Players take turns one-by-one. When it’s your turn, **pass the device** so only you see the screen. Click your territories and choose one order per territory:
   - **March / Attack** — Move into an adjacent territory (conquer if enemy/neutral, or reinforce if friendly).
   - **Defend** — Stay put; your strength counts **double** when defending this territory.
   - **Support** — Add this territory’s strength to an **adjacent** friendly territory (attack or defense).
   - **Muster** — Add +1 unit here (or +2 when **Bountiful Harvest** is active). Not available during **Harsh Winter**.
3. **Reveal** — All orders are shown. Click **Resolve Bloodshed** to run combat and apply moves/musters.
4. **Resolution** — Battles are resolved (attack vs defense + support, castles +1 defense). Territory counts update. If no one has won yet, a new random **event** is drawn and you return to the War Room for the next turn.

### Winning

- **2 players:** First to control **5** territories wins.
- **3 or 4 players:** First to control **6** territories wins.

### Combat

- **Attack strength** = units in attacking territory + any **Support** pointed at that attacker + house bonuses (e.g. Dragon +1 attack).
- **Defense strength** = units in defending territory + any **Support** on the defender + **Defend** bonus (defender’s units count twice) + **Castle** (+1) + house bonuses (e.g. Wolf +1 on Defend).
- **Rebellion** event: all **neutral** territories get +1 defense.
- Highest attack wins only if it **beats the defender and is strictly higher than the next attacker** (no ties). Winner takes the territory; attacking army leaves 1 unit behind. Losers lose 1 unit.

---

## The Houses

| House    | Power            | Effect                          |
|----------|------------------|----------------------------------|
| **Stag** | Ours is the Fury | +1 unit when you successfully conquer. |
| **Wolf** | Winter is Coming | +1 strength on **Defend** orders.     |
| **Dragon** | Fire and Blood | +1 strength on all **Attack** orders.  |
| **Kraken** | Iron Fleet    | +1 strength on **Support** orders.     |

*(Kraken is only in play in 4-player games.)*

---

## Events

Each turn a random event modifies the rules:

| Event              | Effect |
|--------------------|--------|
| Clear Skies        | No special rules. |
| Harsh Winter       | **Muster** orders cannot be played this turn. |
| Fog of War         | **Support** orders cannot be played this turn. |
| Bountiful Harvest  | **Muster** grants +2 units instead of +1. |
| Rebellion          | All **neutral** territories get +1 defense. |

---

## Tech

- **React 19** + **Vite 7**
- **Tailwind CSS** for layout and styling
- **Lucide React** for icons

```bash
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # ESLint
```

---

## License

Private project. All rights reserved.
