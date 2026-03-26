# Drug Cross-Reactivity Graph

Interactive graph visualization of drug cross-reactivity relationships, designed for allergists and clinical immunologists. Covers antibiotic (beta-lactam) cross-reactivity and iodinated CT contrast media.

![Tech](https://img.shields.io/badge/React-TypeScript-blue) ![Graph](https://img.shields.io/badge/Cytoscape.js-Graph-green) ![License](https://img.shields.io/badge/license-MIT-gray)

## Features

### Antibiotic Mode

- **Interactive force graph** — 61 antibiotics across 14 drug classes with Cytoscape.js cose-bilkent layout
- **R1 side-chain model** — Beta-lactam cross-reactivity based on 15 R1 structural groups
- **4 risk levels** — High / Disputed / Moderate / Low with distinct edge styling
- **Spectrum tags** — MRSA, Pseudomonas, Anaerobe, Atypical, ESBL coverage badges on nodes
- **Evidence-linked** — PMID/DOI links to PubMed for every cross-reactivity claim (24+ references)
- **Subgroup clustering** — Ceph 1G→5G, Penicillin subtypes, organized by clinical spectrum
- **Safe alternatives** — Shows drugs with no reported cross-reactivity for a selected drug
- **Class & risk filtering** — Toggle 14 drug classes and 4 risk levels independently

### CT Contrast Mode

- **10 iodinated contrast agents** across 3 osmolality groups (non-ionic monomer, non-ionic dimer, ionic)
- **Separate graph/search/filter/side-panel** — Full viewer with same interaction patterns as antibiotic mode
- **Template database** — `contrast_crossreact_db.json` ready for literature pair curation

### Shared

- **Dual project mode** — Switch between Antibiotics and CT Contrast via header button
- **Ingredient + brand-name search** — Product-name queries auto-resolve to active ingredient nodes
- **Glass-morphism dark UI** — Tailwind CSS v4 dark theme with blur/transparency
- **DB freshness display** — Header shows last database update and monitoring timestamps
- **GitHub Pages deployment** — Automated via GitHub Actions

## Data Sources

### Antibiotic Database (`crossreact_prediction_db.json`)

| Key | Count |
|-----|-------|
| `literature_confirmed_pairs` | 39 curated edges |
| `r1_groups` | 15 structural groups |
| `drug_r1_map` | 32 drugs mapped |
| `drug_structures` | 25 SMILES structures |
| `prediction_rules` | 7 model rules |
| `literature_monitoring.records` | 16 monitored entries |
| Referenced PMIDs | 24+ |

Key papers: Trubiano 2017, Stevenson 2026, Hutten 2025, Romano, Zagursky

### Contrast Database (`contrast_crossreact_db.json`)

- 10 agents, 3 groups, template status (v0.1-draft)
- `literature_confirmed_pairs` to be populated after clinical review

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Deployment (GitHub Pages)

1. In GitHub → **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push to `main` or `master` (or run the workflow manually).
3. Workflow: `.github/workflows/deploy-pages.yml`

`vite.config.ts` automatically resolves the correct `base` path for both user/org pages and project pages.

## Scheduled Literature Monitoring

Two independent monitoring workflows watch PubMed for new cross-reactivity evidence:

| Workflow | Script | Schedule |
|----------|--------|----------|
| `.github/workflows/update-literature-monitoring.yml` | `scripts/update-literature-monitoring.mjs` | Weekly |
| `.github/workflows/update-contrast-literature-monitoring.yml` | `scripts/update-contrast-literature-monitoring.mjs` | Weekly |

Manual runs:

```bash
npm run update:literature           # antibiotic
npm run update:contrast:literature  # CT contrast
```

Each workflow updates its respective JSON database under `literature_monitoring.records` and opens an automated PR (`automation/literature-monitoring` or `automation/contrast-literature-monitoring`) for review.

### GitHub setup for monitoring

1. Repository → **Settings → Actions → General**
   - Workflow permissions: **Read and write permissions**
   - Enable: **Allow GitHub Actions to create and approve pull requests**
2. Repository → **Actions** → run each monitor manually once to validate.
3. Review auto-created PRs — only merge clinically relevant updates.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Cytoscape.js + cose-bilkent layout
- Tailwind CSS v4

## License

MIT
