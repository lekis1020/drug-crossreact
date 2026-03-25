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
- **Safe alternatives** — Shows drugs with no reported cross-reactivity
- **Dual project mode** — Switch between Antibiotics and CT Contrast views in-app

## Data Sources

- 39 literature-confirmed cross-reactivity pairs
- 7 prediction rules
- 24+ referenced PMIDs
- Key papers: Trubiano 2017, Stevenson 2026, Hutten 2025, Romano, Zagursky

## Current Database Structure (`crossreact_prediction_db.json`)

The app currently loads one JSON database file via `src/data/drugDatabase.ts`.

### Top-level keys (current)

```text
metadata
r1_groups                      # 15
drug_r1_map                    # 32 drugs
drug_structures                # 25 structures
literature_confirmed_pairs     # 39 curated edges
prediction_rules               # 7 model rules
predict_function_logic         # explanatory text
```

### Key object shapes

```json
{
  "r1_groups[]": {
    "group_id": "G2",
    "name": "...",
    "drugs": ["amoxicillin", "..."],
    "expected_ige_cross_reactivity": "high",
    "pmids": ["..."]
  },
  "drug_r1_map.<drug>": {
    "group": "G2",
    "r1_name": "para-hydroxy-aminobenzyl",
    "confidence": "high"
  },
  "literature_confirmed_pairs[]": {
    "drug_a": "amoxicillin",
    "drug_b": "cefadroxil",
    "ige_cross_reactivity": "high|moderate|low|disputed",
    "rate_percent": null,
    "evidence_pmids": ["..."],
    "clinical_note": "..."
  }
}
```

> Note: Scheduled monitoring workflow proposes new evidence in PRs; only reviewed items should be promoted into `literature_confirmed_pairs`.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Deployment (GitHub Pages)

This repository is ready for GitHub Pages via Actions.

1. In GitHub → **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push to `main` or `master` (or run the workflow manually).
3. Workflow: `.github/workflows/deploy-pages.yml`

`vite.config.ts` automatically resolves the correct `base` path for both:
- user/org pages (`https://<user>.github.io/`)
- project pages (`https://<user>.github.io/<repo>/`)

## Scheduled Literature Monitoring

Weekly PubMed monitoring is automated with:
- workflow: `.github/workflows/update-literature-monitoring.yml`
- script: `scripts/update-literature-monitoring.mjs`

Manual run:

```bash
npm run update:literature
```

The workflow updates `crossreact_prediction_db.json` under `literature_monitoring.records` and opens an automated PR for review.

### GitHub-native bot monitoring setup (recommended)

1. Repository → **Settings → Actions → General**
   - Workflow permissions: **Read and write permissions**
   - Enable: **Allow GitHub Actions to create and approve pull requests**
2. Repository → **Actions**
   - Run `Monitor cross-reactivity literature` manually once to validate.
3. Review the auto-created PR (`automation/literature-monitoring`) and merge only clinically relevant updates.

The app header now shows:
- `DB 업데이트`: `metadata.last_database_update_at` (fallback: `last_literature_monitoring_at` → `created`)
- `모니터링`: `metadata.last_literature_monitoring_at`

## CT Contrast Cross-Reactivity Blueprint

Scaffold + MVP viewer artifacts for a second project (iodinated CT contrast media) are included:

- `docs/ct-contrast-project-plan.md` — implementation roadmap
- `contrast_crossreact_db.json` — starter schema/template dataset
- `scripts/update-contrast-literature-monitoring.mjs` — PubMed monitoring script
- `.github/workflows/update-contrast-literature-monitoring.yml` — scheduled review-first PR workflow
- `src/contrast/*` — CT contrast graph/search/filter/side-panel modules

Use the **`CT 조영제 보기`** button in the top header to open the contrast mode.

Manual monitoring run:

```bash
npm run update:contrast:literature
```

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Cytoscape.js + cose-bilkent layout
- Tailwind CSS v4

## License

MIT
