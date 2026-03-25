# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the app code.
  - `components/`: UI building blocks (`Graph.tsx`, `FilterPanel.tsx`, `SidePanel.tsx`, etc.).
  - `data/`: graph/domain datasets and mappers (`drugDatabase.ts`, `graphData.ts`, `colors.ts`).
  - `types/`: shared TypeScript types and third-party declarations.
  - `main.tsx` boots the app, `App.tsx` composes top-level layout/state.
- Root docs/data: `README.md`, `REQUIREMENTS.md`, and `crossreact_prediction_db.json`.
- Build output is written to `dist/` (generated; do not hand-edit).

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start Vite dev server (default: `http://localhost:5173`).
- `npm run build` — run TypeScript project build (`tsc -b`) and bundle production assets.
- `npm run preview` — serve the production build locally for smoke checks.

## Coding Style & Naming Conventions
- Language stack: React 19 + TypeScript + Vite.
- Use 2-space indentation and semicolons; prefer single quotes in TS/TSX.
- Component files and exported React components use **PascalCase** (`DrugTooltip.tsx`).
- Utility/data modules use **camelCase** (`graphData.ts`, `drugDatabase.ts`).
- Keep domain constants/types centralized in `src/data` and `src/types` instead of duplicating literals across components.

## Testing Guidelines
- There is currently no dedicated unit-test script in `package.json`.
- Minimum validation for every change:
  1. `npm run build` passes without TypeScript errors.
  2. Manual UI smoke test in `npm run dev` (search, select node, filter toggles, evidence modal).
- If you add tests, prefer Vitest + React Testing Library and name files `*.test.ts` / `*.test.tsx`.

## Commit & Pull Request Guidelines
- Follow the existing commit style from history: Conventional Commit prefixes such as `feat:`, `fix:`, `chore:`.
  - Example: `feat: add carbapenem edge evidence metadata`.
- Keep commits focused to one logical change.
- PRs should include:
  - concise summary and motivation,
  - screenshots/GIFs for UI changes,
  - verification notes (`npm run build`, manual flows),
  - linked issue or requirement when applicable.
