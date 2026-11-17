# Phase 6.4 — visual upgrade report

Date: 2026-11-15
Scope: Missions cinematic background, Experience archive environment, Flying Raijin kunai
Constraints held: section layouts, content, anchors, navigation, project data, links, ownership labels, transitions, reveal choreography and animation timings were not changed.

## Outcome

| Workstream | Result |
| --- | --- |
| Missions background | `mission-hq-cinematic-v3.png` validated against v1/v2 and kept active. Portrait crop moved `70% → 74%` so the Hokage window and mission table are in frame, with a mobile-only top scrim to hold AA contrast. |
| Experience environment | New hand-authored archive scene `career-archive-chamber-v3` active (WebP, 52 KB). Portrait crop `78% 46%` shows the arch edge and lit shelves; desktop stays `50% 46%`. |
| Flying Raijin kunai | Replaced with a layered metal illustration in `RaijinKunai.tsx`; same 120×300 viewBox, same loader/transition contracts. |

Photoreal raster generation was not available (the environment's image quota is exhausted). Both environments and the weapon are original vector artwork, not placeholders. Optional photographic generation briefs are recorded in `docs/ASSETS.md`.

## Changes

### Missions
- `public/assets/missions/mission-hq-cinematic-v3.png` — active background (1672×941, 1.91 MB).
- `components/worlds/MissionsWorld.tsx`:
  - mobile `background-position` `70% → 74%` (`sm` 66% and desktop centre unchanged);
  - added a `sm:hidden` top gradient band behind the heading/intro for the richer crop;
  - added a `data-missions-top-scrim` hook used only by the evidence harness.
- `scripts/compare-missions-bg.py` — real v1/v2/v3 harness with production scrims, text boxes and per-variant contrast.
- `scripts/probe-missions-mobile.py` — portrait crop/scrim probe.

Contrast at the active crop (mean / p95, WCAG):

| Viewport | Heading | Intro |
| --- | --- | --- |
| 1920×1080 | 14.66 / 13.62 | 6.33 / 5.58 |
| 1366×768 | 14.06 / 12.11 | 6.15 / 5.24 |
| 390×844 @ 74% | 14.13 / 10.09 | 6.29 / 5.34 |

At 78–86% the intro p95 drops to 3.56–2.93, so 74% is the furthest safe crop. Full data: `screenshots/phase64/missions/report.json`.

### Experience
- `public/assets/experience/career-archive-chamber-v3.svg` — editable source (517 KB).
- `public/assets/experience/career-archive-chamber-v3.webp` — active asset, 2560×1440, 52 KB.
- `app/globals.css` — `.exp-archive-image` points at the v3 WebP; portrait position `78% 46%`; desktop `50% 46%` unchanged. No new animation, listener, canvas or WebGL.
- `scripts/capture-experience-bg.py` — 3-viewport capture, plate luminance and contrast.
- `scripts/capture-experience-v3-compare.py` — injects v2 at the identical computed background position and captures the v2 → v3 pair.

Worst-case contrast behind live text (p95 ash; bone and gold are higher throughout):

| Viewport | Heading | Intro | Company | Body |
| --- | --- | --- | --- | --- |
| 1920×1080 | 5.96 | 6.22 | 6.57 | 6.94 |
| 1366×768 | 5.80 | 6.44 | 6.64 | 6.91 |
| 390×844 @ 78% | 6.07 | 6.45 | 6.79 | 6.78 |

Full data, including the portrait crop sweep (50–86%): `screenshots/phase64/experience/report.json`.

### Kunai
- `components/transitions/RaijinKunai.tsx` — new artwork: cylindrical steel gradient, three bevel faces, forged ridge and glints, clipped brushed striations, machined collars, cord-wrapped grip, torus pommel ring, engraved seal, restrained cyan/gold rim light.
- `components/transitions/RaijinArtwork.tsx` — re-exports `RaijinKunai`, so `KunaiTransition.tsx` and the loader keep their existing imports.
- Unchanged: `FlyingRaijinLoader` box, spin/pulse/progress, loader minimum duration, all `fr-*` keyframes and states, particles, veil, seal and lightning, identity mapping.

## Preserved originals

- Missions: `mission-hq-cinematic.png` (v1), `mission-hq-cinematic-v2.png`, `mission-hq.svg`, `mission-hq.png`.
- Experience: `career-archive-chamber.svg`, `career-archive-chamber.webp` (v1); `career-archive-chamber-v2.svg`, `career-archive-chamber-v2.webp` (previous candidate).
- Old kunai render retained as evidence at `screenshots/phase64/kunai/kunai-detail.png`.
- No original asset was overwritten or deleted.

## Before / after

- `screenshots/phase64/compare/kunai-before-after.png` — previous weapon vs new loader frame.
- `screenshots/phase64/compare/missions-mobile-before-after.png` — 70% (no band) vs 74% + band.
- `screenshots/phase64/compare/experience-mobile-before-after.png` — v1 @ 66% vs v2 @ 78%.
- `screenshots/phase64/compare/experience-desktop-before-after.png` — v1 vs v2 at 1366×768.
- `screenshots/phase64/compare/experience-v3-1366x768-before-after.png` — v2 vs v3 at the identical `50% 46%` crop.
- `screenshots/phase64/compare/experience-v3-390x844-before-after.png` — v2 vs v3 at the identical `78% 46%` crop.
- `screenshots/phase64/prod-probe/` — isolated production probe for the backward → home route.
- Per-section frames: `screenshots/phase64/missions/<viewport>/`, `screenshots/phase64/experience/<viewport>/`, `screenshots/phase64/kunai2/`.

The before/after pairs were captured in one session with the previous asset/crop re-applied live, so layout, fonts, scroll position and scrims are directly comparable.

## Regression validation

Final verification ran against the production build (`next build` → `next start -p 3001`), not only the dev server; the reduced-motion audit was run on the dev server on the same tree because the reduced-motion rules are global CSS.

- `npx tsc --noEmit` — clean (exit 0).
- `npm run lint` — 0 errors; 2 pre-existing `<img>` warnings in `SkillsWorld.tsx` and `ValleyOfTheEnd.tsx` (untouched).
- `npm run build` — compiled successfully (Next.js 16.2.9 / Turbopack, 11.5 s), TypeScript pass, 4/4 static pages generated, routes `/`, `/_not-found`, `/icon.svg`.
- Production transition sweep (`scripts/verify-transitions-prod.py`): **8/8 routes start with the correct identity at both viewports**, both directions — Flying Raijin (about, home), Nature Chakra (skills), Rasengan (missions), Shinobi Map (experience); settled state `None`, overlay count `0`, `overflowX: -10` everywhere, no opaque overlay root. At 1366×768 every captured frame passes the luminance floor. At 390×844 two frames captured mid-unfold read mean 10.1–11.2 (77–81% dark) because only part of the destination world has been revealed at that instant; both are above the harness's 90%-dark failure threshold, and the same routes pass in the dev regression with denser sampling. Frames: `screenshots/phase64/prod/prod-1366/`, `prod-390/`.
- Dev transition regression (`scripts/verify-transitions.py`): 8/8 pass at 1366×768 on the clean rerun and 8/8 at 390×844; all identities, settled state and overflow checks hold. Evidence: `screenshots/phase55/phase64c-1366b/`, `phase64c-390/`.
- Missions: 4 dossiers and 8 external archive links present at 1920×1080, 1366×768 and 390×844; heading/intro contrast 10.09–14.66 (p95); no horizontal overflow.
- Experience: three ledger records present, active chapter sync intact, `overflowX: -10` at all viewports; v3 contrast at worst p95 5.80 (heading 1366) — all body copy above AA.
- Reduced-motion (`scripts/verify-reduced-motion.py`, selector corrected this pass): transition collapses to a cut (`COVERING` with no kunai/particles), the Experience layer is static (`animationName: none`) and v3 is the served background. One pre-existing nuance: the loader's spin wrapper still carries its animation class after hydration, but the global reduced-motion rule collapses it to `animation-duration: 1e-06s; iteration-count: 1`, so no visible motion. Screenshot: `screenshots/phase64/reduced-motion-1366-loader.png`.
- Both directions of all four route identities were captured at 1920×1080, 1366×768 and 390×844; no horizontal overflow at any of the three viewports.

### Note on the intermittent luminance probe

The harness occasionally records `minMean 7.0 / maxDark 100%` on a random route. It is a probe-timing artifact, not a UI state. On `backward → home` the sample can land in the veil's darkest sub-frame: the same route re-captured frame-by-frame measures COVERING mean 37.6 / 8.5% dark, SEAL_ACTIVATION 25.2 / 4.4%, WORLD_SWITCH 28.9 / 2.8%, ARRIVAL 42.7 / 5.4%. The same signature appears in pre-Phase 6.4 reports (`prod1366` from Nov 10, `resume1366`, `phase62-390`), it moves between routes on each run, and identity, settled state and overlay checks stay correct. `backward → home` once reported "transition never started" while the machine was loaded; an isolated 12 ms-sampled probe on the same production server shows the full sequence (COVERING → KUNAI_DESCENT → SEAL_ACTIVATION → TELEPORT_FLASH → WORLD_SWITCH → ARRIVAL), and the lean production sweep above records all eight routes. Not caused by these assets.

## Performance

- Experience archive WebP: 52 KB (v2 was 43 KB, v1 42 KB). Missions v3 remains 1.91 MB. The kunai is inline SVG: no extra network request and no decode flash.
- No new scroll listeners, React state, canvas, WebGL or filters were added. The environment layers are static CSS backgrounds.
- Headless scroll sampling is indicative only: 390×844 averaged 22.2 ms/frame (p95 83 ms); 1366×768 averaged 96.1 ms (p95 417 ms) with the Three.js Home world active. The new layers do not animate, so they add no per-frame work.

## Remaining issues

1. Photoreal raster generation remains unavailable (free-tier quota). The shipped assets are hand-authored vectors; photographic briefs for Missions v4, Experience v4 and a kunai raster v2 are in `docs/ASSETS.md`.
2. The portrait Missions crop is at the AA boundary for intro text (p95 5.34). Moving further right needs a redesign of the copy area rather than more scrim, so it was not attempted.
3. Tablet widths 640–1023 retain the existing `66%` Missions crop and were not re-swept in this pass.
4. The dev overlay shows a pre-existing `THREE.Clock` deprecation warning; the production build is clean.
5. The kunai's brushed striations are sub-pixel at transition scale; they read at loader size, which is the intended detailed view.
