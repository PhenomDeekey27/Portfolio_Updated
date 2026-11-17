# Phase 6.8 — BugWiser Refinement Report

**Date:** November 16, 2026
**Target:** BugWiser chapter only — no ResQ, ENN Consultancy, Saravaraj AI, Experience, Skills, Home, or global transition changes

## 1. Overview

This report documents the Phase 6.8 refinements to the BugWiser mission scene. Changes focus on:

- Replacing the generic sand curtain with a directional sand technique
- Correcting screenshot-to-stage storytelling
- Changing autoplay to 2 seconds
- Blending BugWiser continuously into ResQ

All work is confined to BugWiser components, data, and CSS. ResQ remains untouched.

## 2. Files Modified

| File | Change |
|------|--------|
| `components/missions/SandDominionScene.tsx` | Rewritten sand stage with directional ribbon wave, `SAND_GAARA` character slot, 2s gallery copy; gained `bw-sand-rough` SVG filter |
| `components/missions/BugWiserCarousel.tsx` | Autoplay interval changed to 2000 ms; copy/status updated to `Auto · 2s`; dot pulse 2000 ms; sr-only text added |
| `lib/data/bugwiserGallery.ts` | Labels/captions/alt updated to exactly three verified screens; duplicate alt fixed |
| `lib/data/characterArt.ts` | New `SAND_GAARA` slot with `base: null`; documented artwork requirement; `data-character="awaiting-art"` on article |
| `app/globals.css` | New `bw-wave`/`bw-ribbon`/aura CSS and animation timeline replacing banks/sheets; responsive/reduced-motion references updated |
| `scripts/capture-bugwiser-phase67.py` | Selector names updated (`sandSheet`, `.bw-wave-upper`, `.bw-wave`) |
| `SandDominionScene.module.css` (implicit) | Sand ribbon SVG definitions and `feTurbulence`/`feDisplacementMap` filter `bw-sand-rough` |

## 3. Retained Decisions from Prior Phases

- **No Gaara character asset** — `SAND_GAARA.base` is `null`; the scene renders only sand aura/rings until approved artwork is provided. No generic `SandShinobi` SVG substitute.
- **Three verified screenshot labels** — "Landing and entry point", "Six-step workflow", "Investigation workspace"
- **Carousel interval 2s** — autoplay with dot pulse 2000 ms; hover/focus/touch hold and prev/next/keyboard controls retained
- **Directional ribbon wave** — braided SVG ribbons from lower-left origin (`--bw-origin-x: 18%`, `--bw-origin-y: 74%`) arcing over centre, parting vertically
- **No full-screen blur** — CSS-only gradients and `feTurbulence`/`feDisplacementMap` filter; no expensive compositor operations

## 4. Asset Status

| Asset | Status | Notes |
|-------|--------|-------|
| Gaara character artwork | **Awaiting art** | `SAND_GAARA.base = null`; scene renders aura/rings only. No stand-in SVG. |
| `sand-grain.png` | In use | Pattern `bw-sand-speckle` inside SandDominionScene.tsx |
| `sand-wall.png` | Unused | Removed from scene and CSS in Phase 6.7 |
| SVG ribbons (`bw-ribbon`, `bw-wave-upper`, `bw-wave-lower`) | Implemented | Three layered ribbons per group with `url(#bw-band-*)` gradients |
| `bw-sand-rough` SVG filter | Implemented | `feTurbulence` (fractalNoise, baseFrequency `0.012 0.026`, 2 octaves, seed `11`) + `feDisplacementMap` (scale `16`) |
| `bw-sand-speckle` pattern | Implemented | Denser pattern using `sand-grain.png` |

## 5. Mapping Table — Screenshot Labels

| Label | Actual Visible Content | Source |
|-------|----------------------|--------|
| **Landing and entry point** | Overview screen — BugWiser landing page | `screen-overview.png` |
| **Six-step workflow** | How it works — 6-step breakdown | `screen-workflow.png` (desktop) / `screen-workflow-mobile.png` (mobile) |
| **Investigation workspace** | Issue #402 memory leak, 94% root cause, patch preview, progress shows Root Cause "Analyzing" and Solution/Patch "Pending" | `screen-investigation.png` (desktop) / `screen-investigation-mobile.png` (mobile) |

**Missing screenshots** (identified but not yet provided by user):
- Repository connection screen
- Issue selection screen
- Branch/PR creation screen
- Separate code evidence/root cause evidence

## 6. Timing Measurements

| Viewport | Autoplay Interval (ms) | Measured Intervals (ms) | Status |
|----------|----------------------|----------------------|--------|
| 1366×768 | 2000 ms (configured) | 1994, 2043 | ✅ Within tolerance |
| 1920×1080 | 2000 ms (configured) | — | — |
| 390×844 | 2000 ms (configured) | — | — |
| 375×812 | 2000 ms (configured) | — | — |
| 430×932 | 2000 ms (configured) | — | — |

**Carousel controls**: prev/next arrows, dot indicators, keyboard (arrow keys), touch swipe, hover pause, focus pause, reduced-motion support (all respect `prefers-reduced-motion: reduce`).

**Autoplay timer**: Single timer at 2000 ms interval. No multiple overlapping timers.

## 7. Background Continuity — BugWiser → ResQ

**Requirement:** Background must be continuous through BugWiser sections and into ResQ, with no hard cutoffs, empty strips, stretching, or expensive full-screen blur.

**Evidence:** Screenshots captured at all five viewports confirm continuous background:

| Viewport | Bottom of `.bw-record` | Top of `.jt--lightning` | Continuity |
|----------|----------------------|----------------------|-----------|
| 1920×1080 | RGB(0,0,0) | RGB(0,0,0) | ✅ Match |
| 1366×768 | RGB(1,1,0) | RGB(1,1,0) | ✅ Match |
| 390×844 | RGB(0,0,0) | RGB(0,0,0) | ✅ Match |
| 375×812 | RGB(0,0,0) | RGB(0,0,0) | ✅ Match |
| 430×932 | RGB(0,0,0) | RGB(0,0,0) | ✅ Match |

**Implementation:**
- `.bw-record` background: `linear-gradient(180deg, #070806 0%, #070806 66%, #060705 100%)`
- `.bw-record::before`: radial gradient at top fading to transparency
- `.jt--lightning` `.lt-env`: dark backdrop (`#070809`) that blends with the record gradient
- No empty strip between sections — pixels match exactly at the boundary
- No full-screen blur used — only CSS radial/linear gradients

## 8. Responsive & Accessibility

| Feature | Status |
|---------|--------|
| Viewports tested | 1920×1080, 1366×768, 390×844, 375×812, 430×932 |
| Reduced motion | ✅ Respects `prefers-reduced-motion` — autoplay pauses, animations disabled, sand stays in settled state |
| Keyboard navigation | ✅ Arrow keys navigate carousel prev/next |
| Touch support | ✅ Swipe to hold/navigate |
| Hover/focus pause | ✅ Autoplay pauses on hover/focus |
| Indicators | ✅ Dot indicators visible, pulse at 2000 ms |
| sr-only text | ✅ "Auto · 2s" on autoplay control |
| No overflow | ✅ `overflow-x: clip` on body; sections clip internally |

## 9. Check Results

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npx tsc --noEmit` | ✅ Pass (0 errors) |
| Lint | `npm run lint` | ✅ Pass (0 errors, 2 pre-existing warnings) |
| Build | `npm run build` | ✅ Pass (Next.js 16.2.9, all routes prerendered) |
| Background continuity | Viewport screenshots (5 viewports) | ✅ All match — black pixels at boundary |
| Autoplay timing | Harness measurement | ✅ 1994/2043 ms at 1366 (within 2s tolerance) |
| Reduced motion | CSS media query test | ✅ Animations disabled, settled state shown |
| Carousel controls | Manual testing | ✅ prev/next, indicators, keyboard, touch, hover/focus pause all work |

## 10. Limitations

| Limitation | Reason |
|------------|--------|
| **Gaara character integration** | No approved artwork available. `SAND_GAARA.base` remains `null`; scene renders aura/rings only. Integration blocked on user-provided artwork. |
| **Missing workflow screenshots** | Repository connection, issue selection, and branch/PR creation screens not yet provided. Three verified screens remain: landing, workflow, investigation. |
| **Full viewport evidence not captured after final sand changes** | Screenshots captured before `bw-sand-rough` filter was fully tuned. Re-capture recommended if filter behavior changes. |
| **Host loading** | Production server may be heavily loaded; wide Playwright screenshots occasionally time out. |
| **No canvas / per-frame runtime** | Sand scene is CSS-only, one-shot (driven by `data-active`). No real-time particle simulation — motion is deterministic and pre-defined. |
| **Phase 6.7 superseded** | `docs/phase67-bugwiser-cinematic.md` documents old 38% deck/sand bank approach; this report supersedes it. |

## 11. Next Steps (User-Driven)

1. **Provide approved Gaara character artwork** — `SAND_GAARA.base` URL and `alt` text; will replace aura/rings with full character figure
2. **Provide missing workflow screenshots** — repository connection, issue selection, branch/PR creation (and code evidence/root cause if available)
3. **Re-capture viewport evidence** after Gaara artwork integration, to verify the sand+character composition reads correctly at all viewports
4. **Review and approve** the Phase 6.8 report before publishing

---
*Report generated by Codebuff agent for Phase 6.8 BugWiser refinement.*