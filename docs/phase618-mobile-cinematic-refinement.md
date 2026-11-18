# PHASE 6.18 — Mobile Cinematic Experience, Visual Corrections & Content Refinement

Scope: the phone experience was treated as a cinematic version of the same portfolio, not a
reduced one. This document records each defect, its root cause, the change that fixed it, the
content corrections, and the measured evidence from a production build. Desktop composition was
held at the Phase 6.17 baseline; every rules change below is scoped to widths that need it.

| Check | Result |
| --- | --- |
| Base commit (Phase 6.17) | `bc07906` — `fix(portfolio): correct project stacks and full-stack positioning` |
| Feature branch | `feat/ai-fullstack-portfolio-refinement` (pushed; PR #2 left open, not merged) |
| Validation target | production build (`npm run build` → `npx next start -p 3100`) |
| Evidence | `screenshots/phase618/` (git-ignored), `scripts/verify-phase618.py`, `scripts/probe-phase618-flicker.py` |
| Dependencies added | none |

---

## 1. Home — hero text waited for the 3D scene

**Root cause.** Two mechanisms owned the same property. `Hero` gated its copy behind
`phase !== "LOADING"`, and the copy also carried `.hero-rise`, whose CSS mount animation
(`opacity: 0 → 1`, `animation-fill-mode: both`) started when the element mounted — long before
the phase opened. On phones the phase only opens once the mobile world reports ready, so the
name, role, intro and CTA were all held hostage by the scene, and the delayed mount animation
added a second wait on top.

**Change.** On compact widths (`max-width: 1023px`) the copy is released as soon as
`phase !== "LOADING"` and staggered with its own inline delays: name, role at 420 ms, intro at
560 ms, CTA at 840 ms, portrait at 640 ms. `.hero-rise` was removed from those phase-gated
elements so one mechanism owns opacity (`components/Hero.tsx`). The shared phase machine itself
is untouched, so desktop keeps its original timing.

The phone-only skip-intro control was also removed (`.skip-intro` in
`components/transitions/WorldRevealController.tsx`): with no scene to wait for there is nothing
to skip, and the button overlapped the portrait. It stays on tablet and desktop.

**Measured at 390×844** (sampled every 250 ms after first paint):

| Moment | Before | After |
| --- | --- | --- |
| Name readable | after the scene settled | ~250 ms |
| Role line | locked with the scene | ~250 ms |
| Intro paragraph complete | locked with the scene | ~1.0 s |
| Village buildings present | ~2 s | ~0.75 s |
| Window lights | after settle | ~1.75 s |
| World reported settled | ~2.6 s | ~2.5 s |

The text now leads the settle instead of trailing it, which is the requested hierarchy:
name → professional title → short intro → CTA. `prefers-reduced-motion` skips the stagger
entirely: the copy is present on the first frame with zero infinite animations.

---

## 2. About — the image band collapsed and pushed the copy down

**Root cause.** The band's height was derived from the section's own padding, which assumed the
sticky desktop frame. On phones the section is not sticky and the padding maths produced a band
that did not match the viewport width, leaving a torn strip and a heading pushed far below it.

**Change.** One shared custom property drives the phone band height
(`--about-band-h: clamp(176px, 54vw, 380px)`, `clamp(260px, 53vw, 430px)` for 640–1023 px), the
band becomes a non-sticky 16:10 window, and the section's top padding is computed from it:
`#about { padding-top: calc(var(--about-band-h) + 1.25rem) }`. Phone framing uses
`object-position: 50% 46%` so both statues survive the crop. Desktop keeps the sticky
`100svh` treatment (`62svh` padding, base `58svh`). Padding classes were removed from
`components/About.tsx`; the CSS is the single owner.

**Measured** — band width always equals the viewport, heading sits 55 px under the band edge:

| Viewport | Band | Ratio | Heading gap |
| --- | --- | --- | --- |
| 320×655 | 320×176 | 1.82 | 55 px |
| 390×844 | 390×211 | 1.85 | 55 px |
| 430×932 | 430×232 | 1.85 | 55 px |
| 1440×900 | 1430×805 (sticky) | 1.78 | desktop baseline |

---

## 3. BugWiser — flicker and frame drops on phones

**Root cause.** Three compounding costs on the sand scene: `will-change` promoted every one of
the ~40 drifting motes to its own compositor layer (memory pressure, layer churn); decorative
layers used `mix-blend-mode`, forcing full-surface rasterisation passes on each frame; and each
ribbon ran its own `stroke-dashoffset` draw alongside the wave, so the stage drew vector strokes
while the wave was already animating. A fourth, related cost: the Home leaf motes kept
animating off-screen.

**Change.** `will-change` dropped from `.bw-mote`; `mix-blend-mode` removed from decorative
layers; per-ribbon draw disabled (ribbons arrive with the wave); the ENN `.wtr-node::after` flow
is gated on `data-active`; `MobileLeafWorld` gained an `IntersectionObserver` that sets
`data-visible`, pausing `.lw-mote` when the world is off-screen.

**Measured** — Chrome DevTools Protocol screencast, 4× CPU throttle, three runs per variant on
the same production build (legacy properties re-applied at runtime, see
`scripts/probe-phase618-flicker.py`; medians below):

| Viewport | Legacy | Current | Worst luminance step (legacy → current) |
| --- | --- | --- | --- |
| 390×844 | 20.7 fps | **31.9 fps** | 1.82 → 1.27 |
| 320×655 | 33.3 fps | **57.6 fps** | 1.56 → 0.43 |

---

## 4. ResQ — composition and the technology/integration split

**Root cause.** The gallery's fixed grid stacked intro, deck and detail in an order that buried
the phone under the copy on phones, and the design-reference strip overflowed the viewport
instead of containing its scroll.

**Change.** Gallery reordered to intro → deck → detail, with named grid areas on desktop that
keep the two-column composition byte-for-byte. On ≤639 px the design references become a
snapped, contained filmstrip (`overflow-x: auto`, `scroll-snap-type`). The meta label “Stack”
became “Technology”, with a separate Integrations group — and the Android build
(Kotlin, Jetpack Compose, Android Sensors) is now listed apart from the Python/FastAPI service
rather than blended into one line.

**Measured** — deck centred on the phone (`centreOffset` 0) and still offset in the desktop
column (289 px), so the phone fix is not a desktop regression.

---

## 5. Professional identity

Audited every string for positioning. The portfolio already read **AI-focused Full-Stack
Software Developer** after Phase 6.17; the grep for `frontend-focused` / `Frontend Developer`
returns documentation and historical comments only, no rendered copy. The frontend work is
still described accurately — React, Next.js and Tailwind remain first-class stack entries —
but it is no longer framed as the limit of the role.

---

## 6. Technology vs integrations

Stacks now separate what the project is built with from what it talks to:

| Project | Technology | Integrations |
| --- | --- | --- |
| ENN Consultancy | Next.js · React · Python · FastAPI | Zoho CRM · WhatsApp · Telegram · Email · Google Drive |
| Saravaraj AI | Next.js · TypeScript · Python · FastAPI · Tailwind CSS | Vapi · Bolna · WhatsApp · Email |

`lib/data/missions.ts` carries `stackGroups` so the distinction is data, not markup, and the
ENN / Saravaraj encounter panels render both groups. BugWiser keeps its name.

---

## 7. Old Projects / Field Archive — rebuilt as a sealed vault

The old block was a grid of generic square cards, which read as a link list rather than part of
the world.

**Change** (`components/missions/FieldArchive.tsx`, replacing the PHASE 6.13 `.fa-*` styles):

- Ambient environment: a dome, three counter-rotating conic rings, a lattice, a drifting scan
  line and eight embers — the barrier the records are kept behind.
- Four mission seals as tabs, single column below 640 px, 2-up for 640–1023 px, vertical from
  1024 px. Each seal carries its index, name, stack and a `SEALED` / `UNSEALED` mark.
- Selecting a seal *opens* the record: a keyed `role="tabpanel"` with the real deployment
  screenshot, mission framing, technology and integrations meta, and a verified live link.
- Keyboard support with roving tabindex and Arrow/Home/End navigation; `aria-selected`,
  `aria-controls` and a labelled tablist.

The reveal animates opacity and transform only — no clip — so a device that stalls the timeline
shows a legible record rather than a half-masked one. All existing records, imagery and links
were kept; the links resolve to `financely-teal.vercel.app` and
`next-js-commerce-beta.vercel.app` as before.

---

## 8. Validation

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 errors, 2 pre-existing `<img>` warnings (`SkillsWorld.tsx`, `ValleyOfTheEnd.tsx`) |
| `npm run build` | succeeds (prebuild world validation included) |
| Page overflow | 0 px at 320, 375, 390, 430, 768, 1024, 1440 |
| Console errors | 0 at every viewport |
| Anchors + footer | all resolve at every viewport |
| Archive | present, tab selection updates the panel, ArrowRight moves Podcast Platform → next seal, links correct |
| ENN / Saravaraj groups | Technology and Integrations render as separate groups |
| Reduced motion | name visible immediately, 0 infinite animations, no skip button on phones |
| Replay | leave → away → return restores the stage at 390 and at 1440 |

Report: `screenshots/phase618/verify-report.json` (`scripts/verify-phase618.py`).

---

## 9. Limitations

- No physical iOS or Android device was available. Phone behaviour was validated in Chromium at
  320/375/390/430 px with touch emulation and 4× CPU throttling, plus the A/B screencast probe.
  Real-device GPU behaviour, Safari's paint costs and inertial scrolling were not exercised.
- The fps and luminance figures come from a headless screencast. They are consistent across
  three runs per variant and comparable to each other, but they are not a substitute for a
  device trace.
- Playwright occasionally times out capturing the WebGL Home at 1024 and 1440 while the scene
  runs; the two missing evidence images (`1024-home.png`, `1440-home.png`) are a capture
  limitation, not a page failure — the same views were inspected from separate captures.
- Headless Chromium only advances animations when it produces a frame, so evidence screenshots
  are taken with animations fast-forwarded to their settled state.

---

## 10. Files changed

| File | Change |
| --- | --- |
| `components/Hero.tsx` | compact copy release + stagger, `.hero-rise` removed from gated nodes |
| `components/About.tsx` | padding classes dropped, CSS owns the band |
| `components/worlds/ValleyOfTheEnd.tsx` | `.valley-band` / `.valley-img` hooks |
| `components/worlds/MobileLeafWorld.tsx` | visibility observer pauses off-screen motes |
| `components/transitions/WorldRevealController.tsx` | `.skip-intro` on the skip control |
| `components/missions/FieldArchive.tsx` | vault rebuild (environment, seals, tabpanel reveal) |
| `components/missions/WindReleaseScene.tsx` | gallery areas, Technology + Integrations |
| `components/missions/WaterReleaseScene.tsx` | Technology + Integrations |
| `components/missions/FireReleaseScene.tsx` | Technology + Integrations |
| `lib/data/missions.ts` | `stackGroups`, corrected ENN/Saravaraj stacks and integrations |
| `app/globals.css` | PHASE 6.18 blocks: About band, sand budget, reference rail, archive vault |
| `scripts/verify-phase618.py` | viewport/composition/timeline/a11y verification |
| `scripts/probe-phase618-flicker.py` | A/B screencast fps + luminance probe |
