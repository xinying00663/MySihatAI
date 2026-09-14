# AGENTS.md — MySihat AI

> Read this first if you are an AI agent working in this repo.

## Project Snapshot

**MySihat AI — Voice-first care (NafasCheck voice triage)** — a single-page demo that simulates a rural toll-free hotline (`1-800-88-SIHAT`). A patient "calls", speaks or uploads audio, and gets a preliminary triage banner (RED FLAG vs GREEN) with mock voice-jitter/breath metrics. **Not a medical diagnosis** — marked as `Buildability demo · Not a medical diagnosis` in the footer.

- **Purpose:** Buildability/design demo for low-bandwidth, login-free voice triage. Bilingual EN / Bahasa Melayu.
- **Live concept:** `Call → Speak → Analyze → Guidance`. No auth, no backend, no persistence.
- **Repo:** `https://github.com/xinying00663/MySihatAI.git` — active branch is `daniel` (2 commits ahead of `origin/daniel` at last check). `main` auto-deploys to GitHub Pages.
- **Type:** Frontend-only prototype. No tests, no API, no DB.

## Stack

- **Runtime:** Node `v24`, npm `11` (`package.json:1-18`)
- **Build:** Vite `latest` + `@vitejs/plugin-react` (`vite.config.js:1-6` — minimal config: `plugins: [react()]`)
- **UI:** React `latest`, ReactDOM `latest`, `lucide-react` for icons, custom CSS (no Tailwind, no component library)
- **Fonts:** `DM Sans` + `Space Grotesk` via Google Fonts import (`src/styles.css:1`)
- **Deployment:** GitHub Pages via `.github/workflows/deploy-pages.yml:1-46` — triggers on push to `main` + manual dispatch. Node 22 in CI, `npm ci` → `npm run build` → upload `dist`.

## Structure

```
index.html          # entry — <div id="root">, loads /src/main.jsx (index.html:10-11)
vite.config.js      # vite + react plugin only
src/main.jsx        # entire app — single <App> component (~166 lines)
src/styles.css      # all styles — 64 lines, custom CSS, responsive @ 600px
.github/workflows/deploy-pages.yml
```

No router, no state library, no env files. `dist/` and `node_modules/` are gitignored.

## Commands

```bash
npm install          # install
npm run dev          # vite dev server (default http://localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview built dist
```

No lint, format, or test scripts. Verify with `npm run build` after changes.

## App Architecture (`src/main.jsx:1-166`)

### Data Model
- `scenarios` object (`src/main.jsx:6-17`): two cases — `serious` and `mild` — each with `en`/`bm` variants containing `transcript`, `reply`, `title`, `detail`, `metrics[]`, plus `tone: 'danger'|'success'`. This is the entire "AI analysis" — no real ML, just mocked lookup.

### State Machine
- `stage` (`src/main.jsx:20`): `'start' → 'connected' → 'recording' → 'analyzing' → 'result'` — drives progress bar (`src/main.jsx:35`: 0/25/50/75/100), `stageLabel`, and conditional rendering.
- Other state: `recording`, `audioUrl`/`audioName`, `selectedScenario`, `result`, `recordSeconds`, `callerNumber`, `language ('en'|'bm')`.
- Refs: `mediaRecorder`, `stream`, `chunks`, `timer`, `fileInput`.

### Key Functions
- `connectCall()` (`src/main.jsx:43-55`): sets `connected`, clears result, speaks prompt via `speechSynthesis` (`ms-MY`/`en-US`).
- `startRecording()` (`src/main.jsx:61-93`): toggles `MediaRecorder` on `getUserMedia({audio:true})`, intervals `recordSeconds`, creates blob URL on stop and moves to `recording` stage. Graceful fallback to `alert()` if APIs missing.
- `attachFile()` (`src/main.jsx:95-102`): file upload alternative — creates object URL from `<input type=file>`.
- `analyzeVoice(scenario)` (`src/main.jsx:104-112`): picks `scenarios[scenario][language]`, 1400ms `setTimeout` fake analysis, then sets `result` + `stage='result'`.
- `reset()` (`src/main.jsx:114-128`): stops media, revokes URLs, cancels speech, resets all state to `start`.

### UI Flow (render)
- Topbar brand + Reset button (`src/main.jsx:134`)
- Hero + trust row (`src/main.jsx:139-143`)
- Journey progress bar/steps (`src/main.jsx:145-149`)
- Call card (`src/main.jsx:151-160`):
  - `start`: dialer with language picker, number pad (0-9/*/#), callerNumber display, green Call button (disabled until number entered)
  - `connected|recording`: AI callout + voice-prompt + Record button + sample case buttons (Serious/Mild) + upload link + optional audio preview + Analyze button
  - `analyzing`: orbit animation + signal bars
  - `result`: banner by `tone`, transcript/reply grid, metrics chips, next-step box, Try again button

### Styling (`src/styles.css:1-64`)
- Tokens: bg `#f4faf7`, dark `#092d29`/`#0a2d29`, accent `#6fe0c3`/`#20b695`/`#18b596`/`#159b83`, danger `#cf594e`/`#9d443d`.
- Layout: centered max-width `750px` (hero/journey/call-card), topbar `1080px`. Card with `border #d9eae4`, `shadow rgba(22,66,57,.08)`.
- Key classes: `.topbar`, `.hero`, `.journey`, `.progress-line`, `.call-card`, `.dialer-block`, `.voice-prompt`, `.record-btn.recording`, `.result-banner.danger|success`, `.analyzing`.
- Responsive breakpoint `600px` — collapses grid, hides status text.

## Conventions & Gotchas

- **Single-file app:** All logic lives in `src/main.jsx`. Don't create new entry points without updating `index.html:11`.
- **No JSX file extension config needed** — Vite handles `.jsx` via plugin.
- **Bilingual:** Always keep `en` and `bm` in sync when editing `scenarios` or UI strings. Language toggle is in dialer + voice prompts.
- **Audio URLs:** Revoke with `URL.revokeObjectURL` on reset/unmount (`src/main.jsx:37-41`, `114-118`). Don't leak blob URLs.
- **Browser APIs:** `MediaRecorder`, `getUserMedia`, `speechSynthesis` — all guarded with feature checks + alerts. Don't assume availability in SSR/tests.
- **No backend:** "Analysis" is deterministic lookup. If adding real inference, replace `analyzeVoice` timeout but preserve the stage machine and `tone` contract (`danger`/`success` drives CSS).
- **A11y:** Keep `aria-label` on dialer/call buttons.
- **Don't add heavy deps** — demo must stay low-bandwidth. Prefer CSS over JS libraries.
- **Git:** Work happens on `daniel` branch; `main` is deploy branch. Don't push to `main` without intent to deploy.

## What Not To Do

- Don't claim diagnostic accuracy — footer disclaimer must stay.
- Don't add auth/login/forms — the brief is "No login, no form, no medical jargon".
- Don't break the 4-step journey (`Call → Speak → Analyze → Guidance`) or progress percentages.
- Don't commit `node_modules/` or `dist/` (ignored).

## Future Work Hints

- If wiring real STT/triage: replace `scenarios` + `analyzeVoice` with API call; keep `tone`/`metrics` shape for UI.
- For PWA/offline or low-bandwidth: consider lazy-loading fonts, `MediaRecorder` polyfill, and `dist` size budget.
- Tests: none exist — add Vitest + Testing Library if needed (no config yet).

## Quick Check After Edits

```bash
npm run build   # must pass — CI uses this
npm run dev     # manual smoke: dial number → Call → Record/sample → Analyze → result banner
```
