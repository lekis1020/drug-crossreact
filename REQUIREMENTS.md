# Drug Cross-Reactivity Graph Visualizer

## Overview
A single-page web app that visualizes antibiotic cross-reactivity relationships as an interactive graph (Obsidian graph view style). User inputs a drug name → sees connected drugs with cross-reactivity risk levels.

## Tech Stack
- **Vite + React + TypeScript**
- **Cytoscape.js** for graph rendering (force-directed layout, cose-bilkent)
- **Tailwind CSS** for styling
- Dark theme (like Obsidian)

## Data Sources (already in project root)
- `crossreact_prediction_db.json` — 15 R1 groups, 25 beta-lactam drugs, prediction rules, literature-confirmed pairs
- `antibiotic_cross_reactivity_db_2026.md` — additional non-beta-lactam classes (sulfonamides, quinolones, glycopeptides, etc.)

## Core Features

### 1. Graph Visualization
- **Nodes:** Each drug is a node
  - Color-coded by R1 group (beta-lactams) or drug class (non-beta-lactams)
  - Node size: slightly larger for searched drug
  - Label: drug name (English, generic name)
- **Edges:** Cross-reactivity relationships
  - **Red solid (thick):** High cross-reactivity (same R1 group)
  - **Orange dashed:** Moderate cross-reactivity (similar R1, e.g., G1↔G2)
  - **Gray thin:** Low cross-reactivity
  - **No edge:** Safe (no reported cross-reactivity)
- **Layout:** Force-directed (cose-bilkent) — drugs in same group cluster naturally
- **Interactions:** 
  - Hover node → tooltip with drug info (class, R1 group, formula)
  - Click node → highlight that drug's connections, dim unrelated nodes
  - Zoom/pan support
  - Double-click → set as new search target

### 2. Search
- Top search bar with autocomplete
- English generic names for now (Korean/brand name mapping later)
- On search: animate focus to the drug, highlight connections

### 3. Side Panel (right side)
- Shows when a drug is selected
- **🔴 Cross-reactive drugs:** Listed by risk level (high → moderate → low), each with:
  - Drug name
  - Risk level badge
  - R1 group name
  - PMID evidence links (clickable, opens PubMed)
- **🟢 Safe alternatives:** Drugs with NO reported cross-reactivity to the selected drug
  - Grouped by drug class
  - "No cross-reactivity reported" label

### 4. Filters
- Toggle drug classes on/off (beta-lactams, quinolones, glycopeptides, etc.)
- Toggle edge visibility by risk level

## Data Transformation
Build a `src/data/graphData.ts` that:
1. Reads `crossreact_prediction_db.json`
2. Generates nodes from `drug_r1_map` (all 25 drugs)
3. Generates edges using `prediction_rules`:
   - Same R1 group → high (red)
   - G1↔G2 (aminobenzyl variants) → moderate (orange)
   - Different R1 group → no edge (safe)
4. Adds non-beta-lactam drugs from the markdown data:
   - Quinolones: ciprofloxacin, moxifloxacin, levofloxacin (cross-react with each other at ~2-10%)
   - Glycopeptides: vancomycin, teicoplanin, dalbavancin (cross-react)
   - Sulfonamides: antibiotic vs non-antibiotic sulfonamides (low/unproven cross-reactivity)
5. Export as Cytoscape-compatible elements (nodes + edges arrays)

## UI Layout
```
┌─────────────────────────────────────────────────────┐
│  🔍 Search drug...                    [Filters ▼]   │
├───────────────────────────────┬─────────────────────┤
│                               │  Drug: amoxicillin  │
│                               │  Group: G2          │
│     [Cytoscape Graph]         │  Class: Penicillin  │
│     (dark background)         │                     │
│                               │  🔴 Cross-reactive: │
│                               │  • ampicillin (High)│
│                               │  • cefadroxil (High)│
│                               │  ...                │
│                               │                     │
│                               │  🟢 Safe alternatives│
│                               │  • ceftriaxone      │
│                               │  • cefazolin        │
│                               │  ...                │
└───────────────────────────────┴─────────────────────┘
```

## Color Palette (per R1 group)
Use distinct, visually separable colors for 15+ groups. Example:
- G1 aminobenzyl: #FF6B6B
- G2 para-hydroxy-aminobenzyl: #FF8E53
- G3 aminothiazolyl-methoxyimino: #4ECDC4
- G4 aminothiazolyl-carboxypropoxyimino: #45B7D1
- G5-G15: assign from a curated palette
- Quinolones: #A855F7
- Glycopeptides: #EC4899
- Sulfonamides: #F59E0B

## Non-functional
- No backend needed — all data is static/bundled
- Responsive but desktop-first
- Performance: <500ms initial render for full graph
- Accessible: keyboard navigation for search

## File Structure
```
src/
  components/
    Graph.tsx          — Cytoscape graph component
    SearchBar.tsx      — Drug search with autocomplete
    SidePanel.tsx      — Drug detail + cross-reactivity info
    FilterPanel.tsx    — Class/risk level toggles
    DrugTooltip.tsx    — Hover tooltip
  data/
    graphData.ts       — Data transformation logic
    drugDatabase.ts    — Raw data types and imports
    colors.ts          — Group color mapping
  types/
    index.ts           — TypeScript interfaces
  App.tsx
  main.tsx
  index.css            — Tailwind + custom dark theme
```
