# PHASE 6.13 — Repository Cleanup, Push, Encounter Re-entry & Mobile Home World

Date: 17 November 2026
Build: Next.js 16.2.9 · React 19.2.4 · Turbopack
Verified against a **production build** (`next build` + `next start`, port 3100).

---

## 1. Repository audit

Inspected before touching anything:

| Item | Result |
| --- | --- |
| Branch | `main`, tracking `origin/main` |
| Origin | `https://github.com/PhenomDeekey27/Portfolio_Updated.git` |
| Divergence at start | `0 0` — origin and local were identical at `8f62d7a` |
| Recent history | `8f62d7a` resume updated · `496efbe` project changes · `fa29122` updated ecommerce project · `6b0c068` first stage done · `bade6fc` initial |
| Working tree at start | 16 modified tracked files, 1 deletion (`app/favicon.ico`), ~185 untracked entries |
| `package.json` scripts | `dev`, `validate:worlds`, `prebuild`, `build`, `start`, `lint` |
| Environment files | `.env.local` only (`NEXT_PUBLIC_WEB3FORMS_KEY`), already covered by `.env*` |

### Classification

**A. Required application source** — `app/*`, `components/**` (worlds, missions, transitions, motifs, ui, loading), `lib/**`.
**B. Required public assets** — `public/assets/**` (environment plates, mission screens, archive thumbnails, portrait, skill logos). Every plate named in `lib/worlds/environments.ts` is referenced; the `prebuild` guard (`scripts/validate-world-environments.mjs`) scans 91 source files and confirms 5 unique plates with no cross-section reuse.
**C. Required documentation** — `docs/` (14 files, including the phase 6.12 report and the contact-chamber image brief, both preserved).
**D. Useful validation scripts** — all 56 files in `scripts/`.
**E. Temporary screenshots / browser captures** — `screenshots/` (14 phase directories, 2,597 files) plus the scratch `.tmp-*` trees.
**F. Build / cache output** — `.next/`, `node_modules/`.
**G. Demonstrably disposable** — `.tmp-610/`, `.tmp-a612/`, `.tmp-audit/`, `.tmp-preview/`, `.tmp-audit{,2..9}.py`, `.tmp-wind{,2}.py`, `.tmp-{dev,prod,validate}.log`.
**H. Sensitive** — `.env.local` (only file; never staged).

`screenshots/` was checked against every reference before being classified: `grep` finds it cited in 9 docs and ~25 `scripts/capture-*.py` / `verify-*.py` files. It is therefore **validation evidence, not junk** — kept on disk, excluded from git.

The legacy one-shot scenes `LightningScene.tsx`, `NetworkScene.tsx` and `SealingScene.tsx` are not imported by any current page, but they are working transition components from earlier phases and were **not deleted**.

## 2. Safe cleanup performed

Removed (all generated scratch from previous validation sessions):

```
.tmp-610/  .tmp-a612/  .tmp-audit/  .tmp-preview/
.tmp-audit.py .tmp-audit2..9.py .tmp-wind.py .tmp-wind2.py
.tmp-dev.log .tmp-prod.log .tmp-validate.log
```

Nothing else was deleted. `.next/` was left in place (already ignored) because the production server serves from it.

### `.gitignore` additions (narrowly scoped)

```gitignore
# local validation captures (referenced by docs/ and scripts/, not published)
/screenshots/

# scratch audit artifacts from validation runs
/.tmp-*
*.log
```

No broad pattern hides a source asset: `/screenshots/` is root-anchored, `/.tmp-*` only matches root-level scratch, `*.log` cannot match an asset in `public/`.

## 3. C: drive / OpenCode findings (reported, not deleted)

| Path | Size / contents | Verdict |
| --- | --- | --- |
| `C:\Users\krang\.config\opencode` | `opencode.json`, `opencode.jsonc`, `cli.json`, `service.json`, `AGENTS.md`, locks, `node_modules/` | **Active configuration. Untouched.** |
| `C:\Users\krang\AppData\Roaming\ai.opencode.desktop` | `drafts.sqlite` (10.8 MB), `opencode.global.dat` (41 KB), Local/Session Storage, Network, Crashpad, logs, workspace `.dat` files | **User data / active sessions. Untouched.** |
| `C:\Users\krang\AppData\Local\@opencode-aidesktop-updater` | `installer.exe` (126 MB), `pending/`, `current.blockmap` | Disposable-looking (a downloaded update payload), but **not project-specific** and not covered by this task's remit. Left in place for your approval. |

No recursive deletion was run anywhere outside the repository.

## 4. Pre-push safety check

| Check | Result |
| --- | --- |
| Intended branch | `main` |
| Origin URL | `github.com/PhenomDeekey27/Portfolio_Updated.git` |
| Origin ahead of local? | No — `git rev-list --left-right --count origin/main...HEAD` → `0 0` |
| Force push | Not used |
| Secrets in staged files | Scanned for `api_key`, `secret`, `token`, `password`, `bearer`, private-key blocks, `sk-*`, `ghp_*`, `AKIA*`. Only prose hits ("installation-token authentication"). `.env*`, `*.log`, `screenshots/`, `.tmp*` verified absent from the staged set. |
| `package.json` ↔ `package-lock.json` | Consistent: both drop `gsap`, both add the `validate:worlds` / `prebuild` scripts; no `gsap` import remains in source. |
| `npx tsc --noEmit` | **PASS** (exit 0) |
| `npm run lint` | **PASS** (exit 0, 2 pre-existing `<img>` warnings in `SkillsWorld.tsx` / `ValleyOfTheEnd.tsx`) |
| `npm run build` | **PASS** (exit 0; `prebuild` guard reports 5 plates / 91 files, no cross-section reuse) |

## 5. Commit and push

```
commit 063bce7c45a7d4d9fc268d4b6b89a69a226aba9f
branch main  →  origin/main
feat: complete Naruto portfolio environments and cinematic mission showcase
202 files changed, 38228 insertions(+), 1127 deletions(-)
```

Push verification after `git fetch`:

```
local HEAD : 063bce7c45a7d4d9fc268d4b6b89a69a226aba9f
remote main: 063bce7c45a7d4d9fc268d4b6b89a69a226aba9f
divergence : 0 0
git branch -r --contains 063bce7 → origin/HEAD -> origin/main, origin/main
git status -sb → ## main...origin/main   (no dirty tracked files)
```

Push output: `8f62d7a..063bce7  main -> main`, exit 0. No `--force`, no `--force-with-lease`.
The Vercel checkpoint therefore received the complete phase 6.4–6.12 implementation before any of the animation work below.

## 6. Encounter re-entry (Part 5)

### Root cause

`useEncounterActive` armed the technique once and disconnected:

```ts
if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
```

Two separate problems:

1. **One-shot by construction.** Once disconnected there was no way back, so a re-entry could never replay.
2. **Observed the wrong element.** The observer watched the encounter `<article>`, which spans the title beat, the gallery and the editorial record — three or more viewports. Entering from below armed the sequence as soon as the *record* appeared, so the 4.3s sand sequence and the 2.25s-delayed title reveal burned themselves off-screen above. This is why "re-entry from below" looked like nothing happened even though the attribute had flipped.

### Implementation

`components/missions/useEncounterActive.ts` is now a lifecycle hook:

* observes the **stage** (`bw-stage`, `wnd-stage`, `wtr-stage`, `fyr-stage`), one observer per stage, no scroll listeners;
* **enter** — `isIntersecting` against a root shaved at the bottom (`0px 0px -6% 0px`) plus a size-aware minimum overlap `min(stageHeight × 0.5, viewportHeight × 0.12)`, so neither a one-pixel sliver nor a stage taller than the viewport arms it early or fails to arm at all;
* **exit** — `isIntersecting === false`, i.e. the stage is completely gone. That hysteresis is what prevents a restart while the element is still visible;
* the only React state change is one attribute flip on entry and one on exit — no per-frame state;
* `active = inView && sectionPhase === "content"` is kept, so a replay still waits for the teleport veil to lift.

Each of the four scenes keeps `data-active` on the `<article>` (all 34/43/18/18 CSS rules key off it) and now attaches the observer ref to the stage.

No CSS was rewritten for this: every technique animation lives under `prefers-reduced-motion: no-preference` and the **base styles are the settled composition**, so clearing the attribute leaves the description, gallery, links and record fully readable — only the decorative technique replays.

### Evidence (production build, real wheel scrolling)

`animations` = `stage.getAnimations({subtree:true}).length`.

| Viewport | Encounter | armed (1st) | animations while away | re-armed from below |
| --- | --- | --- | --- | --- |
| 1366×768 | BugWiser | `true` | `0` | `true` |
| 1366×768 | ResQ | `true` | `0` | `true` |
| 1366×768 | ENN Consultancy | `true` | `0` | `true` |
| 1366×768 | Saravaraj AI | `true` | `0` | `true` |
| 390×844 | BugWiser | `true` | `0` | `true` |
| 390×844 | ResQ | `true` | `0` | `true` |
| 390×844 | ENN Consultancy | `true` | `0` | `true` |
| 390×844 | Saravaraj AI | `true` | `0` | `true` |

After re-entry the stage holds 45–159 live animations again (BugWiser 45–62, ResQ 123–159, ENN 45–49, Saravaraj 46), confirming a genuine replay rather than an attribute flip. `contentReadable` is `true` in every "away" sample.

**No restart while visible:** with the BugWiser stage parked in view for 7.8 s, `playState` was `finished` for all 45 animations on both samples (`restarted: false`).

## 7. Performance work (Part 6)

### Changed

| Layer | Change |
| --- | --- |
| Sand (`bw`) | `filter: none` on `.bw-wave-upper` / `.bw-wave-lower` below 1024px — drops the `feTurbulence` + `feDisplacementMap` pass. Ribbons keep shape, gradient and the speckle stroke. Motes 34 → 18. |
| Wind (`wnd`) | `filter: none` on `.wnd-ribbon` / `.wnd-current` (drop-shadows on strokes that animate `stroke-dashoffset`). Gusts 28 → 16, travel motes 18 → 12, spray 22 → 14, motes 26 → 16. |
| Water (`wtr`) | Droplets 16 → 12. |
| Badges | `backdrop-filter` removed from the three rank badges below 1024px. |
| Ambient loops | Cue drift, water vortex rotation (54 s) and fire spiral rotation (46 s) now run only while the encounter is armed. Off-screen they were pure waste. |
| `Reveal` | `will-change` is released to `auto` on `transitionend` instead of staying on every revealed block for the life of the page. |
| Carousels | Audited, unchanged — already correct: interval cleared on unmount/deps, autoplay only while in view + tab visible, non-active slides `loading="lazy"` + `decoding="async"`, `aspect-ratio` reserved, `next/image` art direction via `getPictureProps`. |

Element counts measured on the served page at 390×844 (elements with `display != none`):

```
sandMotes 18 · windGusts 16 · windTravel 12 · windSpray 14 · windMotes 16 · waterDrops 12
.sandDisplacementFilter  "none"      (was url("#bw-sand-rough"))
.windStrokeFilter        "none"      (was drop-shadow)
```

### Measured result — honest reading

Two measurement passes, both on the production build at 390×844 with **4× CPU throttling**, interleaved A/B on the same page (6.12 behaviour forced back on via an injected override, then removed):

1. Whole-page scroll pass (`scripts/verify-phase613.py`): baseline p95 100.1 ms → optimised 89.0 ms; run-to-run p50 varied between 16.7 and 50.0 ms **within a single condition**, because scroll, Lenis and headless compositing dominate.
2. Stationary rAF sampling during the sand sequence only (`scripts/measure-phase613-mobile-budget.py`): p50 25.0 ms → 25.0 ms, p95 45.9 ms → 50.0 ms, long-frame share 18.1 % → 18.0 %.

**Conclusion: I cannot claim a measured speed-up.** The stationary test shows no difference, and the whole-page test's apparent gain is inside its own variance. The most likely explanation is that Chromium caches the filtered raster of the static ribbon geometry and only transforms it, so removing the displacement filter does not recover frame time *in this environment*. The budget reductions are kept because they strictly remove GPU/CPU work on devices that do not cache filters, and they are visually lossless — but they are presented as a budget cut, not as a proven optimisation.

**Not measured at all:** real iOS/Android hardware, Safari, and Firefox. The headless Chromium numbers above say nothing about those.

## 8. Mobile Home world (Part 7)

### What was wrong

`HiddenLeafStage` mounted the live three.js village only when `min-width: 1024px` **and** motion was welcome. Below that the Home background was a still plate — the construction story was desktop-only.

A second, unreported problem surfaced during the audit: readiness is reported by the R3F scene via `markSceneReady()`. On the DOM path no scene ever mounted, so the intro fell through to the controller's **9-second fallback timeout**, meaning phones sat on the loader for 9 s before anything happened.

### What was built

`components/worlds/MobileLeafWorld.tsx` — the same story, in DOM/CSS, driven by the **same reveal phases** as the desktop scene:

```
WORLD_REVEAL            sunset bloom + haze ramp lift
MOUNTAIN_CONSTRUCTION   far ridge + pagoda rise
TERRAIN_CONSTRUCTION    mid terrace of homes rises
BUILDING_CONSTRUCTION   near rooftops + torii + lantern posts rise
ENVIRONMENT_ACTIVATION  17 windows and 4 lanterns illuminate
CAMERA_MOVEMENT         the layer settles out of a 1.035 push-in
```

Budget: 3 silhouette layers (one SVG, hand-placed coordinates, no `Math.random` → SSR-stable), 17 windows, 4 lanterns, 6 motes, no canvas, no blur, no SVG filters, `transform`/`opacity` only. Silhouettes carry a warm rim stroke instead of a filter so rooftops read as sunset-lit rather than flat black. The layer reports `markSceneReady()` after 800 ms, so the intro no longer waits out the fallback.

`HiddenLeafStage` now resolves a `mode` (`pending → live | dom`) in an effect, so neither branch is committed during hydration and the still plate carries the first frame either way. The diorama is `display: none` above 1023px.

### Evidence

Fresh load, 390×844, sampling every 700 ms:

```
0.7s  ready=true  mountains=false terrain=false buildings=false lit=false camera=false
1.4s  ready=true  mountains=true  terrain=false buildings=false lit=false camera=false  (ridge opacity 0.67)
2.1s  ready=true  mountains=true  terrain=true  buildings=true  lit=false camera=false
4.2s  ... lit=true  camera=false
4.9s  ... lit=true  camera=true
9.1s  all six true, heroOpacity = 1
```

Reduced motion: the layer renders settled immediately (`ridge opacity 1`), `.lw-motes` is `display: none`, and no construction transitions run.

## 9. Field Archive (Part 8)

Extracted to `components/missions/FieldArchive.tsx` (Missions.tsx is 83 lines smaller and now just composes).

* **Transition in:** a "Declassified records" seam — hairlines either side of a kunai mark — separates the last encounter from the archive, then the existing header, revealed on scroll.
* **Entries:** each card gets one `IntersectionObserver` (`threshold 0.16`, `rootMargin 0 0 -10% 0`), one-shot, with the title **unmasking from below** inside a clipped line (`translateY 108% → 0`), a gold rule drawing under it (`scaleX 0 → 1`), the screenshot lifting out of a 1.06 scale + dimmer frame, then description/stack/link following on a 190/280 ms beat.
* **Hover/focus:** card lifts 4px, border and shadow warm, image `scale(1.04)` and un-greys, arrow nudges. Focus-visible gets an explicit outline.
* **Unchanged:** all four projects, names, descriptions, stacks, verified live URLs, `aspect-ratio: 16/9` reserved boxes, `loading="lazy"`.

Measured at 1366×768: 4 cards, 4 armed, all four titles unmasked (`matrix m42 = 0`), aspect ratio `1.78` on all, links intact (`financely-teal`, `next-js-commerce-beta`, `podcast-platform-ten`, `ecommerce-website-five-sable`).

## 10. Viewport results

| Viewport | Overflow | Console errors | Page errors | Hydration warnings |
| --- | --- | --- | --- | --- |
| 1920×1080 | none | 0 | 0 | 0 |
| 1366×768 | none | 0 | 0 | 0 |
| 1024×768 | none | 0 | 0 | 0 |
| 430×932 | none | 0 | 0 | 0 |
| 390×844 | none | 0 | 0 | 0 |
| 375×812 | none | 0 | 0 | 0 |

Scroll health after a full pass to the bottom at 390×844:

```
htmlOverflow ""   bodyOverflow ""   teleport state null   atBottom true   scrollY 34205
```

No stuck overlay, no scroll lock left behind, no horizontal overflow.

Behaviour checked at both 1366×768 and 390×844: first entry, re-entry from below, reverse scrolling, fast and slow wheel scrolling, carousel autoplay (unchanged), archive reveal.

### Reduced motion (1366×768, `reduced_motion: reduce`)

```
encounterAnimations 0      titleOpacity 1   titleHeight 118.7
introVisible true          leafWorld true   motesVisible none   ridgeOpacity 1
```

Settled state shown immediately; no technique, no motes, no construction.

## 11. Checks

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS — 0 errors, 2 pre-existing `<img>` warnings |
| `npm run build` | PASS — 9.4 s compile, 4 static routes generated |
| `node scripts/validate-world-environments.mjs` (prebuild) | PASS — 5 plates, 91 files, no cross-section reuse |

## 12. Screenshots

In `screenshots/phase613/` (kept locally, git-ignored):

```
home-{1920x1080,1366x768,1024x768,430x932,390x844,375x812}.png
mobile-world-390x844.png      mobile construction layer
encounter-{1366x768,390x844}.png
archive-{1366x768,390x844}.png
sand-idle-390x844.png         stage parked in view (no restart)
reduced-motion-1366.png
report.json                   full audit output
perf-mobile-budget.json       stationary frame-time A/B
```

Also added, and committed as useful validation tooling:

* `scripts/verify-phase613.py` — the full audit above.
* `scripts/measure-phase613-mobile-budget.py` — the stationary A/B.

## 13. Remaining limitations

1. **No proven mobile performance win.** Measured p95 is unchanged within noise; see §7. The encounter budget reductions are justified structurally, not by benchmark.
2. **Encounter animations were not profiled on real phones.** All numbers come from headless Chromium with synthetic 4× CPU throttling. Real iOS Safari with a live R3F canvas elsewhere on the page is untested.
3. **Mobile Home construction is hand-drawn.** It is a layered silhouette diorama, not the three.js village. It tells the same story with the same phase timing, but the buildings are not the same geometry — deliberate, since a WebGL village on a phone is the wrong trade.
4. **The archive "parallax" is hover-driven, not scroll-driven.** Scroll-linked image parallax was rejected on cost grounds (layout reads per frame); depth comes from the scale/filter lift and the card register instead.
5. **`wtr-flow` / `fyr-flow` connector loops still run continuously.** They belong to the flow/record sub-sections rather than the stage, so gating them on the stage's armed state would freeze them while visible. Left alone.
6. **Phase 6.13 work is not committed.** The Git checkpoint (063bce7) covers everything up to and including phase 6.12 by design; the 9 modified + 4 new files listed in §14 are uncommitted, so you can review before the next push.
7. Only `prefers-reduced-motion` was tested for accessibility; no screen-reader pass was run on the new archive markup (the cards keep their `aria-label` and link semantics).

## 14. Phase 6.13 change set (uncommitted)

```
modified  app/globals.css                            +701
modified  components/Missions.tsx                     -83
modified  components/missions/useEncounterActive.ts   rewrite
modified  components/missions/SandDominionScene.tsx
modified  components/missions/WindReleaseScene.tsx
modified  components/missions/WaterReleaseScene.tsx
modified  components/missions/FireReleaseScene.tsx
modified  components/ui/Reveal.tsx
modified  components/worlds/HiddenLeafStage.tsx
new       components/missions/FieldArchive.tsx
new       components/worlds/MobileLeafWorld.tsx
new       scripts/verify-phase613.py
new       scripts/measure-phase613-mobile-budget.py
```
