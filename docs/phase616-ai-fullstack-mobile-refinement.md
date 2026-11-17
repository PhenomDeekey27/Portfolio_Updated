# PHASE 6.16 — Mobile Motion & AI Full-Stack Positioning

Scope: the interrupted Phase 6.16 run was recovered and continued, not restarted. This
document records the whole phase: what the earlier run had already completed, the four
defects the recovery audit found, the work added here, and the measured evidence from a
production build.

| Check | Result |
| --- | --- |
| Base commit (Phase 6.15) | `597b140` — `feat(portfolio): optimize cinematic encounters and mobile layouts` |
| Base push | `origin/main` = `597b140` (already pushed, not repeated) |
| Feature branch | `feat/ai-fullstack-portfolio-refinement` |
| Validation target | production build (`npm run build` → `npx next start -p 3100`) |
| Evidence | `screenshots/phase616/` (git-ignored), `scripts/verify-phase616.py`, `scripts/probe-phase616-*.py` |

---

## 1. Recovery audit

The previous run stopped mid-validation. Its uncommitted work was intact and was preserved:

- AI full-stack positioning across data, metadata and section copy.
- The compact BugWiser and ResQ records and their CSS.
- The freelance career chapter and `current`/`Present` rendering.
- The compact phone Home timeline, the plate veil and the phone no-wait scene path.
- The phone motion budget (ambient drift, navbar blur, portrait glow) and the raised
  encounter arm band.

The audit found four defects, all fixed here:

1. `components/Footer.tsx` still described the role as **“Frontend-focused full stack
   developer”**, contradicting the new positioning everywhere else.
2. `components/Hero.tsx` had lost the indentation on its discipline line
   (`Full Stack · AI · Integrations` sat flush against the margin).
3. The loader was still rendered on phones for the pre-hydration frame — a black screen
   for an intro that no longer waits for a WebGL scene.
4. The encounter observer could never arm on small screens (section 4.1), and the compact
   timeline ignored `prefers-reduced-motion`.

---

## 2. Mobile motion

### 2.1 What was budgeted

| Surface | Before | Phone behaviour now |
| --- | --- | --- |
| `.animate-seal` | 120s infinite rotation of the large portrait seal | settled frame, no animation, `will-change: auto` |
| `.about-drift` | 70s infinite drift of the full-section valley plate | settled frame |
| `.valley-mist` | 24s drift with an opacity ramp | settled frame |
| Navbar | full-width `backdrop-filter: blur-xl` while scrolling | opaque `bg-void/[0.94]`, blur restored from `lg` |
| Portrait glow | `blur-3xl` decoration behind the portrait | hidden below `sm`; the seal ring carries the halo |
| Home loader | full-screen black + 120px blur, awaiting a WebGL scene | not rendered below 1024px |

Nothing was switched off by disabling motion wholesale: the Flying Raijin, Nature Chakra,
Rasengan, Sand, Wind, Water and Fire sequences keep their timelines and geometry. What was
cut is ambient drift at 24–120s per cycle, which is imperceptible on a phone and held a
compositing layer for the life of the page.

The mission budgets from earlier phases are unchanged and were re-measured, not rebuilt:

| Stage (390×844, 4× CPU throttle, page still, 3.5s) | p50 | p95 | long frames (>33.4ms) |
| --- | --- | --- | --- |
| BugWiser — Sand Dominion (`bw-title-split` running) | 16.7ms | 16.8ms | 0.0% |
| ResQ — Wind Release (`wnd-title-in` running) | 16.7ms | 16.8ms | 1.0% |

Both rows were sampled only after the stage reported `data-active="true"` with its title
wipe playing, so these are animated frames, not an idle page. The measurement is headless
Chromium; it establishes that the sequences stay inside the frame budget on the tested
build, not that every physical phone performs identically.

### 2.2 Phone Home script

`COMPACT_STEPS` in `components/transitions/WorldRevealController.tsx` gives the phone its
own pacing while keeping the same phase names. Cumulative timings:

| Phase | Starts at | Duration |
| --- | --- | --- |
| WORLD_REVEAL | 0.00s | 240ms |
| MOUNTAIN_CONSTRUCTION | 0.24s | 520ms |
| TERRAIN_CONSTRUCTION | 0.76s | 420ms |
| BUILDING_CONSTRUCTION | 1.18s | 1250ms |
| ENVIRONMENT_ACTIVATION | 2.43s | 700ms |
| CAMERA_MOVEMENT (final settle) | 3.13s | 240ms + 1700ms CSS push |
| NAVIGATION_REVEAL | 3.37s | 240ms |
| HERO_TEXT_REVEAL | 3.61s | 900ms |
| PORTRAIT / CTA / COMPLETE | 4.51s / 4.91s / 5.21s | — |

The phone no longer waits for `markSceneReady`: the compact sequence starts on mount, and
`MobileLeafWorld`'s readiness report is only a fallback for the desktop-width
reduced-motion path. The loader is hidden below 1024px entirely, so no black frame is
painted before hydration.

### 2.3 Construction is visible

`components/worlds/HiddenLeafStage.tsx` adds `data-world-mode` / `data-world-settled` and a
single `.leaf-plate-veil` overlay. The still plate is the *finished* village, so without the
veil the silhouettes rose over an already-built render. The veil covers the plate for the
construction beats and transitions out when `CAMERA_MOVEMENT` begins.

Measured at 390×844 on the production build (`scripts/probe-phase616-home.py`, samples
every 250ms):

| Milestone | Without reduced motion | With `prefers-reduced-motion: reduce` |
| --- | --- | --- |
| Loader visible at any sample | no | no |
| Ridge construction | 0 → 1 between 0.7s and 1.8s | settled frame |
| Street construction | 0 → 1 between 1.8s and 2.9s | settled frame |
| World settled | 3.5s | 1.1s |
| Veil fully clear | 5.36s | 1.1s |
| Hero letters readable | 4.30s | 1.11s |
| **Text lead before the settle finishes** | **1.06s** | intro complete in 1.1s |

The target was “text appears roughly 1–2 seconds before the background settles”; 1.06s is
inside it, and the reduced-motion path has no wait and no animation at all.

---

## 3. Reverse-scroll replay

Four encounters — BugWiser (Sand), ResQ (Wind), ENN Consultancy (Water) and Saravaraj AI
(Fire) — must replay on entry from either direction, without restarting while the section
stays visible, and without hiding the record copy.

### 3.1 Why small phones never replayed

`useEncounterActive` arms a stage when pixel overlap reaches
`min(stageHeight * 0.6, viewportHeight * 0.25)`. That floor is correct, but the observer
used `threshold: [0, 0.05, 0.15]`, and an observer only reports *crossings*. At 320×655 the
sand stage is 453px tall with a 164px floor; its first intersecting callback reported
**116px** — below the floor — and no later callback fired, even with the stage filling the
screen. Instrumented entries:

```
320px: { inter: 116, bound: 453, root: 616, isInt: true }  → below 163.75 floor, never re-fired
390px: { inter: 294, bound: 438, root: 794, isInt: true }  → above 211 floor, armed
```

The fix is a finer threshold ladder (`0` → `1` in steps no larger than 0.1 through the low
ratios tall stages reach) plus an `armedRef` guard, so extra crossings do not flush React
again. The arm band itself, the `flushSync` commit and the exit hysteresis are unchanged.

### 3.2 Measured replay, all required widths

`scripts/probe-phase616-replay.py` enters each stage with real gestures only — CDP touch
drags on phones, wheel events on desktop — parks below it and scrolls **up** into it, then
scrolls down until it is completely gone, then scrolls **down** into it again. Every cell
below is the decorative title animation actually running after the second entry:

| Width | Sand | Wind | Water | Fire |
| --- | --- | --- | --- | --- |
| 320×655 | ✓ `bw-title-split` | ✓ `wnd-title-in` | ✓ `wtr-title` | ✓ `fyr-title` |
| 360×800 | ✓ | ✓ | ✓ | ✓ |
| 375×812 | ✓ | ✓ | ✓ | ✓ |
| 390×844 | ✓ | ✓ | ✓ | ✓ |
| 430×932 | ✓ | ✓ | ✓ | ✓ |
| 1024×768 | ✓ | ✓ | ✓ | ✓ |
| 1366×768 | ✓ | ✓ | ✓ | ✓ |
| 1920×1080 | ✓ | ✓ | ✓ | ✓ |

“✓” covers both directions: entering from above and entering from below both replayed.
For each stage the probe also recorded `data-active="false"` and zero animations while the
stage was fully gone, then a fresh title animation on re-entry.

The continuous journey probe (`scripts/probe-phase616-journey.py`, 390×844, touch) scrolls
the whole page down and back up with real gestures:

| Encounter | Arms going down | Arms coming back up | Title animation on return |
| --- | --- | --- | --- |
| Sand | 1 | 1 | `bw-title-split` |
| Wind | 1 | 1 | `wnd-title-in` |
| Water | 1 | 1 | `wtr-title` |
| Fire | 1 | 1 | `fyr-title` |

Exactly one arm per pass proves it does not restart while the section remains visible, and
all 8 “away” samples kept the record copy at opacity 1 — the technique resets, the content
never disappears.

---

## 4. AI-focused full-stack positioning

| Surface | Change |
| --- | --- |
| `lib/data/profile.ts` | role → **AI-Focused Full-Stack Developer**; intro and `siteMetadata` title/description/keywords rewritten around complete applications, backend services and AI workflows |
| `app/layout.tsx` | metadata now reads from `siteMetadata` and `profile.name` |
| `app/page.tsx` | JSON-LD `knowsAbout` covers Node.js, FastAPI, PostgreSQL, Supabase, LLM integrations, RAG, workflow automation |
| Hero | discipline line reads `Full Stack · AI · Integrations` |
| About | heading and three chapters rewritten; disciplines are now full-stack delivery, backend/data systems and AI/integrations |
| Skills | four capability groups — full-stack engineering, backend & data, cloud/integrations/automation, AI & LLM engineering — each entry traceable to the résumé or a project here |
| Experience | section copy starts from full-stack internships, end-to-end delivery and independent work |
| Missions | BugWiser/ResQ categories, descriptions, highlights and notes match what the builds implement |
| Contact | invitation is about building an application, adding AI or untangling an integration |
| Footer | role now comes from `profile.role` instead of the old frontend label |

No proficiency levels, years-per-skill or aspirational claims were added.

---

## 5. Project content reduction

Both records now follow the same short structure: **01 problem and solution → 02 key
implementation → 03 interfaces, stack and links**.

**BugWiser** went from four sections (what it is, three audience profiles, six features,
access) to three, with the audience profiles folded into one sentence of the stage copy and
six features condensed to the five the deployed build implements. Repository, live build,
the “patches are generated for review, never applied automatically” boundary and the
hackathon association are preserved.

**ResQ** went from six technical chapters with two to three paragraphs each to three
sections. The implementation detail that was cut — sample windows, countdown lengths,
permission paths — is condensed into five feature paragraphs, not invented. The two design
references that carry the interface story are kept (home, alert countdown), still labelled
as **design references**, and the prototype/112/safety limits are unchanged.

| Record height, 390×844 | Height | Words |
| --- | --- | --- |
| BugWiser | 2228px (≈2.6 screens) | 300 |
| ResQ | 3271px (≈3.9 screens, including two design screenshots) | 543 |

Previous runs documented ResQ at eleven phone screens of reading; the reduction is in
repetition and exhaustive implementation narration, not in verified capability or evidence.

The duplicated stage copy was removed from `SandDominionScene` and `WindReleaseScene`: the
one-paragraph pitch stays on the stage, the detail lives once in the record below.

---

## 6. Experience and freelance

A `freelance` chapter was added at the top of the ledger:

- **Freelance Full-Stack Developer**, Jul 2026 — Present (renders “Present” through
  `current: true`), independent full-stack and AI integration work.
- Claims only work documented elsewhere in this portfolio: BugWiser, ResQ, and maintained
  personal full-stack applications with authentication, payment and media integrations.
- No studio name, no client list, no invented achievements, no overlap with the Simplita
  engagement.

The task text said “after July 2025”; the ledger itself records Simplita as **Jul 2025 —
Jul 2026**, so a July 2025 freelance start would have overlapped a full-time role. The
chapter therefore begins July 2026, the first month after the recorded employment ends.
All existing dates are untouched.

---

## 7. Validation actually run

Production build served with `npx next start -p 3100`.

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | pass, no output |
| Lint | `npm run lint` | 0 errors, 2 pre-existing warnings (`SkillsWorld.tsx`, `ValleyOfTheEnd.tsx` `<img>`), both in files not touched by this phase |
| Build | `npm run build` | pass (prebuild world validation: 5 unique plates, 93 files) |
| Composition | `scripts/verify-phase616.py` | `FAILURES []` |
| Reduced motion | same script, `prefers-reduced-motion: reduce` at 390 and 1920 | settled world, hero copy visible, 0 infinite animations, no loader |
| Frame budget | same script, sand + wind at 390, 4× throttle | table in 2.1 |
| Replay | `scripts/probe-phase616-replay.py` at 8 widths | table in 3.2 |
| Journey | `scripts/probe-phase616-journey.py` at 390, touch | table in 3.2 |
| Home timeline | `scripts/probe-phase616-home.py`, motion and reduced | table in 2.3 |

Composition at the eight required viewports (no horizontal page overflow, all six section
anchors present, no console errors, mission record present, footer present):

| Viewport | Horizontal overflow | Console errors |
| --- | --- | --- |
| 1920×1080 | none (−10px scrollbar gutter) | none |
| 1366×768 | none (−10px) | none |
| 1024×768 | none (−10px) | none |
| 430×932 | none | none |
| 390×844 | none | none |
| 375×812 | none | none |
| 360×800 | none | none |
| 320×655 | none | none |

Decorative SVG layers extend beyond their clipped section boxes by design; the page scroll
width never exceeds the viewport.

---

## 8. Files changed

- Positioning and copy: `lib/data/profile.ts`, `lib/data/skills.ts`, `lib/data/missions.ts`,
  `lib/data/experience.ts`, `app/layout.tsx`, `app/page.tsx`, `components/About.tsx`,
  `components/Skills.tsx`, `components/Experience.tsx`, `components/ContactUs.tsx`,
  `components/Hero.tsx`, `components/Footer.tsx`.
- Records: `components/missions/BugWiserRecord.tsx`, `components/missions/ResQRecord.tsx`,
  `components/missions/SandDominionScene.tsx`, `components/missions/WindReleaseScene.tsx`.
- Motion: `components/transitions/WorldRevealController.tsx`,
  `components/worlds/HiddenLeafStage.tsx`, `components/worlds/MobileLeafWorld.tsx`,
  `components/missions/useEncounterActive.ts`, `components/loading/FlyingRaijinLoader.tsx`,
  `components/Navbar.tsx`, `app/globals.css`.
- Validation: `scripts/probe-phase616-home.py`, `scripts/probe-phase616-replay.py`,
  `scripts/probe-phase616-journey.py`, `scripts/verify-phase616.py`.

---

## 9. Limitations

- Frame timing was measured in headless Chromium with 4× CPU throttling, not on a physical
  phone. It shows the sequences fit the frame budget on this build; it is not a device
  benchmark.
- The replay probes synthesise touch and wheel gestures through CDP. They exercise the same
  IntersectionObserver paths as a finger or mouse, but a real device's inertial scrolling
  can overshoot differently.
- `screenshots/phase616/` is git-ignored evidence, like every earlier phase.
- The removed stage notes and audience list leave a few unused rules
  (`.bw-stage-notes`, `.bw-audiences`, `.wnd-notes`) in `app/globals.css`; they are inert
  and were left in place rather than risk touching selectors outside this phase's scope.
