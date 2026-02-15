# Battle Pass Simulator

An interactive tool for game designers and product managers to model battle pass progression across different player archetypes.

[Live Tool](https://mmhchan.github.io/battlepass-simulator/)

## The Objective

Battle pass economies are difficult to balance by intuition alone. A season that feels fair to a daily player may be punishing to a weekend-only player — and the difference shows up in churn and conversion, not in spreadsheets. This tool simulates day-by-day progression for configurable player personas so you can visualize:
- *Which player types complete the pass, and which fall short?*
- *How much would a player need to spend to finish?*
- *What happens if someone misses a week?*

## Key Features

- **Player Personas:** Define up to 4 player archetypes with different session frequency, playtime, and start day.
- **Season Blueprint:** Tune XP rates, challenge rewards, tier costs, and monetization levers.
- **Narrative Insights:** Expandable summary with pace milestones, pace shift analysis, and miss tolerance per persona.
- **Presets:** Load preset economies (Balanced, Generous Grind, Time-Gated, Whale Bait) to explore different design philosophies.
- **Save/Load:** Export and import simulation snapshots as JSON files.
- **Hover Highlighting:** Mouse over any persona card, legend entry, or insight row to highlight the corresponding chart line.

## Tech Stack

- **Framework:** React 19 (Vite 7)
- **Language:** TypeScript
- **State:** Zustand (persisted to localStorage)
- **Visualization:** Recharts 3.x
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

## Local Installation

```bash
# Clone the repository
git clone https://github.com/mmhchan/battlepass-simulator.git

# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build
```

## Contact

Created by **Michael Chan**
- **LinkedIn:** [linkedin.com/in/mmhchan](https://linkedin.com/in/mmhchan)
