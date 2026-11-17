# PHASE 6.14 — ResQ Wind Release Performance, Gallery Composition & Production Regression Pass

Scope: the uncommitted Phase 6.13 work plus this phase's changes, validated on a
production build (`next build` + `next start`), not the dev server.

Branch `main`, base commit `063bce7` (`feat: complete Naruto portfolio environments and
cinematic mission showcase`), in sync with `origin/main` (0 ahead / 0 behind) before this
work started. Nothing in this phase has been committed or pushed.

---

## 1. Repository audit (before any change)

| Check | Result |
| --- | --- |
| `git rev-parse --short HEAD` | `063bce7` |
| `git rev-list --left-right --count origin/main...HEAD` | `0  0` |
| Working tree vs `origin/main` | 9 modified, 4 untracked (all Phase 6.13) |
| Nested repos / stray worktrees | none |
| Ignored scratch dirs | `.tmp-*`, `screenshots/`, `node_modules`, `.next` |
| Tracked secrets | none (`.env.local` holds `NEXT_PUBLIC_WEB3FORMS_KEY`, ignored) |

The 6.13 change set was left exactly as found. No reset, clean, stash or revert was run at
any point in this phase.

## 2. Phase 6.13 work preserved

Everything from 6.13 is still in place and was re-exercised end to end:

- `components/missions/useEncounterActive.ts` — the IntersectionObserver stage gate
  (`arm` / reset) that pauses encounter animations while a mission is off screen.
- `components/worlds/MobileLeafWorld.tsx` — 17 windows, 4 lanterns, 6 motes, camera settle,
  and the `markSceneReady` path that releases the loader.
- `components/missions/FieldArchive.tsx` — archive reveal on scroll in both directions.
- `components/ui/Reveal.tsx` reveal timing, `HiddenLeafStage.tsx` stage wiring.

Only two files from the 6.13 set were touched in this phase, and only additively:
`components/missions/WindReleaseScene.tsx` (gallery markup + SVG layer grouping) and
`components/missions/ResQGallery.tsx` (`data-live` flag and neighbour offset). The
observer system was not replaced or re-implemented.

## 3. ResQ Wind Release — the actual bottleneck

The lag was diagnosed before any implementation change, with two Playwright + CDP harnesses
(`scripts/diagnose-phase614-resq.py`, `scripts/diagnose-phase614-resq-layers.py`) that inject
CSS variants into the running production page and sample frame timing plus long tasks while
the wind sequence plays.

Layer attribution on the pre-change build (1366×768, no CPU throttle, headless):

| Variant | frame p50 | frame p95 |
| --- | --- | --- |
| control | 362 ms | 416 ms |
| `.wnd-field` SVG hidden | **33 ms** | **~50 ms** |
| all stage animations off | 16.7 ms | 16.7 ms |

Hiding the single full-viewport field SVG removed almost all of the cost, and the effect was
independent of which internal group was hidden. The field SVG contained roughly **150
individually animated elements**, each with its own `animation` on `transform`, `opacity`,
`stroke-dashoffset` or a `drop-shadow` filter. Every frame, the browser had to re-resolve
~150 independent animation timelines, each forcing style + paint on a 1920×1080 composited
surface, and the `drop-shadow` filters re-rasterised large blurred regions per frame.

Root cause: **per-element animation count and per-frame filter rasterisation inside one large
SVG**, not layout, not React re-render, not Lenis, and not the gallery.

## 4. What was changed

`app/globals.css`:

- Per-element wind animations were collapsed into **one transform/opacity timeline per layer
  group** (new keyframes `wnd-layer-in-right`, `wnd-layer-in-left`, `wnd-turn-in`,
  `wnd-scale-in`, `wnd-gusts-in`, `wnd-travel-group`, `wnd-ribs-sweep`, `wnd-spray-group`).
  Children inside a group inherit motion from the group instead of running their own
  timeline. 14 obsolete per-element keyframes were removed.
- `drop-shadow` filters were removed from `.wnd-ribbon`, `.wnd-current` and `.wnd-arcs`
  (the animated strokes). Softness now comes from gradient stops and stroke opacity, so the
  look is preserved without per-frame blur rasterisation.
- `will-change: transform, opacity` is applied to only the 4 heavy layers, not to every
  animated node — enough to promote them without blowing the compositor budget.
- Transient layers fade as a group while their children stay painted, so a layer leaving does
  not retrigger a style recalc per child.

`components/missions/WindReleaseScene.tsx`:

- `WAVE_RIBS` and `SPRAY` children are wrapped in single `<g>` group nodes that carry the
  animation.
- Inert per-child `animationDelay` inline styles were dropped.

Geometry, gradients, stagger order and overall timing are unchanged: the teal core, the
directional wave, the travelling mote, the formation rings and the RESQ title reveal all
still read in the same order and at the same moments. Wind Release was not replaced with a
fade-in.

## 5. Measured result

Same harness, same viewport (1366×768), same production build, headless Chromium, no CPU
throttle. Three runs after the change, final run shown:

| Variant | frame p50 | frame p95 | long-frame share |
| --- | --- | --- | --- |
| control (final run) | 33.3 ms | 58.4 ms | 49.5 % |
| control (rerun in the same session) | 25.0 ms | 33.5 ms | 22.1 % |
| control (layer harness) | 25.0 ms | 41.8 ms | 30.5 % |
| `.wnd-field` SVG hidden | 16.7 ms | 16.7 ms | 0.0 % |
| all stage animations off | 16.7 ms | 16.7 ms | 0.0 % |
| BugWiser sand stage (calibration) | 16.7 ms | 83.3 ms | 16.6 % |

Before: p50 362 ms / p95 416 ms on the same harness. After: p50 25–33 ms / p95 33–58 ms.
The gap between control and "all animations off" narrowed from ~345 ms to ~8–17 ms, i.e. the
wind scene now costs about the same order of magnitude as every other animated section.

Honest caveats:

- These are **headless CPU-raster numbers with no GPU**. Absolute values are inflated and
  vary run to run (25 vs 33 ms p50 on the same build); the useful signal is the before/after
  ratio and the collapse of the control-vs-hidden gap.
- The pre-change JSON was overwritten when the harness was re-run against the fixed build.
  The pre-change figures above are the values the harness printed at the time; they can be
  reproduced by checking out `063bce7` and running the same scripts.
- No real-device or GPU-throttled measurement was taken, and no claim is made about a
  specific FPS on a specific phone. The Phase 6.13 mobile budget figure (stationary p95
  45.9 ms → 50.0 ms) is unchanged and is **not** presented as an improvement.

## 6. Gallery redesign

Desktop is now a two-column composition instead of a centred stack:

- **Left:** kicker, `Inside the build.` heading, one explanatory lede, three numbered feature
  points (`Watches the journey`, `Asks before it acts`, `Escalates through the phone`), and a
  technical row built from `mission.stack` plus the interface count.
- **Right:** the 3D carousel with a large active screen; neighbours peek in from both sides.
- Mobile stacks the deck after its intro copy, deck first in reading order.

Measured geometry on the final build (from `production-validation.json`):

| Viewport | copy column (x) | deck (x) | active frame | frame ratio |
| --- | --- | --- | --- | --- |
| 1920×1080 | 350–877 | 941–1560 | 407×880 | 0.462 |
| 1366×768 | 73–604 | 659–1283 | 291×630 | 0.462 |
| 1024×768 | 15–449 | 490–999 | 290×628 | 0.462 |
| 430×932 | stacked | full | 324 wide | 0.462 |
| 390×844 | stacked | full | 304 wide | 0.462 |
| 375×812 | stacked | full | 293 wide | 0.462 |

`frameRatio` 0.462 equals the source screenshot ratio at every width, i.e. the device frame
is not stretched or cropped. The active phone grew from 263 px to 291 px at 1366 and from
210 px to 290 px at 1024. Neighbour offset was reduced from 62 % to 46 % so the peeking edges
land inside the narrower right column instead of being clipped by it. Both desktop columns
are top-aligned, which removed the large empty top-left quadrant that centring produced.

Carousel behaviour retained and re-checked: 2 s autoplay, prev/next controls, dot navigation,
arrow-key support, swipe, pause on hover and on focus, and a static presentation under
`prefers-reduced-motion`. `will-change` on slides is now scoped to `data-live="true"` (the
in-view carousel) rather than all 9 slides permanently.

Carousel continuity across a decorative title replay was sampled every 400 ms across a forced
encounter reset: `02, 02, 02, 02, 02, 03 … 09` — strictly +1. The carousel does not restart.

## 7. Reverse-scroll results

Scrolling back up through the mission stack (journey B) on the production build:

- Each encounter re-arms on entry and resets while off screen; after leaving, the measured
  in-stage animation count returns to 0.
- Encounters re-arm correctly when entered from below, not only from above.
- Titles are visible in both directions; no mask or reveal is left stuck.
- Identity node counts per encounter: BugWiser sand 200, ResQ wind 394, ENN water 133,
  Saravaraj fire 130 — each encounter keeps its own material language, none collapsed into a
  shared effect.
- Field Archive: 4/4 items visible scrolling down and 4/4 scrolling up, links unchanged,
  media aspect 1.78 (no crop), titles unmasked.

## 8. Per-encounter regression results

| Encounter | Arms on entry | Resets away | Re-arms from below | Title | Identity |
| --- | --- | --- | --- | --- | --- |
| BugWiser (sand) | yes | yes (0 anims) | yes | visible | 200 nodes |
| ResQ (wind) | yes | yes (0 anims) | yes | visible | 394 nodes |
| ENN (water) | yes | yes (0 anims) | yes | visible | 133 nodes |
| Saravaraj (fire) | yes | yes (0 anims) | yes | visible | 130 nodes |

Zero console errors and zero page errors on every viewport tested.

## 9. Mobile Home world

390×844, production build:

- Loader present at first paint, gone by ~2.1 s.
- Construction sequence runs through the camera settle and reaches its resting composition by
  ~5.6 s.
- 17 windows, 4 lanterns, 6 motes present at rest.
- A full top-to-bottom wheel traverse at 390×844 lands each section at the viewport top with
  no horizontal overflow (`scrollWidth - clientWidth = -10`, i.e. inside the scrollbar
  allowance) and no stuck overlay. The `body { overflow: hidden }` + Lenis stop that appears
  during section transitions is a deliberate transition lock and clears ~1.5 s later; the
  final state is `scrollY: 0` with no lock held.

## 10. Field Archive

Covered in §7. 4/4 entries, correct aspect ratio, links intact, reveals in both directions,
titles never left masked.

## 11. Reduced motion

`prefers-reduced-motion: reduce` at 1366×768: all four encounters report active with **0
running animations**, all copy and media remain visible, gallery is presented statically with
no autoplay. Nothing is hidden behind an animation that will never run.

## 12. Viewport matrix

| Viewport | Overflow | Layout | Errors |
| --- | --- | --- | --- |
| 1920×1080 | none | pass | 0 |
| 1366×768 | none | pass | 0 |
| 1024×768 | none | pass | 0 |
| 430×932 | none | pass | 0 |
| 390×844 | none | pass | 0 |
| 375×812 | none | pass | 0 |

Journeys A (top → contact) and B (contact → top) were driven with real wheel events at
1366×768 and 390×844; every section resolved to the viewport top, scroll returned to 0, and
no console or page errors were produced.

## 13. Checks

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 (2 pre-existing `<img>` warnings: `SkillsWorld.tsx`, `ValleyOfTheEnd.tsx`) |
| `npm run build` | exit 0 — Next.js 16.2.9, prebuild world-environment guard passed, `/` static |
| `npx next start -p 3100` | production server; all validation below run against it, not `next dev` |
| `python scripts/verify-phase614.py` | pass, twice, against the final build |

A successful build is not treated as proof of visual correctness — the visual results above
come from screenshots of the running production build.

## 14. Evidence

All under `screenshots/phase614/` (ignored by git, not published):

- `gallery-1920x1080.png`, `gallery-1366x768.png`, `gallery-1024x768.png`,
  `gallery-430x932.png`, `gallery-390x844.png`, `gallery-375x812.png`
- `before-resq-gallery-1366x768.png`, `before-resq-gallery-390x844.png` (+ `small-before-*`)
- `resq-sequence-1366x768-00..09.png`, `resq-sequence-390x844-00..09.png`
- `reduced-motion-1366x768.png`, `home-mobile-390x844.png`, `archive-1366x768.png`
- `preview/` — downscaled copies used for review
- `production-validation.json`, `resq-diagnosis.json`, `resq-layer-attribution.json`,
  `journeys.json`

Scripts added this phase: `scripts/verify-phase614.py`,
`scripts/capture-phase614-resq-sequence.py`, `scripts/diagnose-phase614-resq.py`,
`scripts/diagnose-phase614-resq-layers.py`.

## 15. Remaining limitations

- **No GPU / real-device measurement.** The wind numbers come from headless CPU raster.
  A device run (or a GPU-enabled Chrome profile) is still the only way to state a real FPS
  figure, and none is claimed here.
- **Mobile ResQ text ghosting** (doubled glyph edges in evidence screenshots) was investigated
  and dismissed as a pre-existing headless rasterisation artifact: the markup contains a single
  copy (the second string match is the Next.js RSC `<script>`), computed styles show no
  text-shadow, filter or pseudo-element duplication, and the same artifact is present in
  `screenshots/phase613/encounter-390x844.png`. Not a 6.14 regression, not fixed here.
- **Pre-change perf JSON was overwritten** by re-runs against the fixed build. The before
  numbers in §3/§5 are the values printed at the time; reproducing them requires checking out
  `063bce7`.
- **Mobile gallery evidence**: the 430/390/375 gallery screenshots were captured before the
  desktop columns were switched to top alignment. Mobile layout was unaffected by that change
  (values in §6 re-measured afterwards), but the images themselves predate it.
- **Headless page idling**: the site never reaches network idle (canvas + infinite motes), so
  screenshots require `animations="disabled"` and long timeouts. Element-level screenshots
  mis-frame the fixed canvas; all captures use viewport screenshots.
- Nothing has been committed or pushed. This report and the 6.13 report are both uncommitted.
