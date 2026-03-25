# CT Contrast Cross-Reactivity Project Plan

## Goal
Build a production-ready web viewer for iodinated CT contrast-media cross-reactivity using the current antibiotic graph architecture (React + TypeScript + Cytoscape + static JSON + GitHub Actions monitoring).

## Scope (MVP)
- Interactive graph of CT contrast agents.
- Risk edges: `high`, `disputed`, `moderate`, `low`.
- Evidence-linked side panel (PMID/DOI + notes).
- Conservative wording: "No known signal" (avoid guaranteed-safe language).
- Weekly literature monitoring with review-first pull request flow.

## File/Module Mapping
- `crossreact_prediction_db.json` → `contrast_crossreact_db.json`
- `src/data/drugDatabase.ts` → `src/data/contrastDatabase.ts`
- `src/data/graphData.ts` → `src/data/contrastGraphData.ts`
- `src/components/SidePanel.tsx` → keep component, replace domain text/fields

## Delivery Phases
### Phase 1 — Data foundation
1. Finalize CT contrast agent inventory (ionic/non-ionic, monomer/dimer, osmolality class).
2. Build schema + seed metadata.
3. Add clinical review checklist for each candidate edge.

### Phase 2 — UI migration
1. Replace antibiotic labels/classes with contrast groups.
2. Keep existing graph interactions (search, select, filter, tooltip).
3. Update panel copy and legends for contrast domain.

### Phase 3 — Evidence operations
1. Enable `update-contrast-literature-monitoring` workflow.
2. Auto-create PR branch for newly found records.
3. Promote only reviewed records to `literature_confirmed_pairs`.

### Phase 4 — Validation and release
1. Build/typecheck + manual scenario QA.
2. Clinical sanity review of edge list.
3. Deploy on GitHub Pages.

## Acceptance Criteria
- Users can identify agent-level cross-reactivity evidence within 3 clicks.
- All displayed edges have traceable evidence metadata.
- Monitoring updates create PRs, not silent production mutations.
