# Drug Cross-Reactivity Graph

Interactive graph visualization of antibiotic cross-reactivity relationships, designed for allergists and clinical immunologists.

![Tech](https://img.shields.io/badge/React-TypeScript-blue) ![Graph](https://img.shields.io/badge/Cytoscape.js-Graph-green) ![License](https://img.shields.io/badge/license-MIT-gray)

## Features

- **Interactive graph** — Obsidian-style force graph with ~60 antibiotics
- **R1 side-chain model** — Beta-lactam cross-reactivity based on structural similarity
- **4 risk levels** — High / Disputed / Moderate / Low with visual edge styling
- **Spectrum tags** — 🛡️ MRSA, 🦠 Pseudomonas, 🔬 Anaerobe, 🫁 Atypical, 💊 ESBL coverage badges
- **Evidence-linked** — PMID/DOI links to PubMed for every cross-reactivity claim
- **Subgroup clustering** — Ceph 1G→5G, Penicillin subtypes, organized by clinical spectrum
- **Evidence Manager** — Add new cross-reactivity data and export as JSON
- **Safe alternatives** — Shows drugs with no reported cross-reactivity

## Data Sources

- 39 literature-confirmed cross-reactivity pairs
- 7 prediction rules
- 24+ referenced PMIDs
- Key papers: Trubiano 2017, Stevenson 2026, Hutten 2025, Romano, Zagursky

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Cytoscape.js + cose-bilkent layout
- Tailwind CSS v4

## License

MIT
