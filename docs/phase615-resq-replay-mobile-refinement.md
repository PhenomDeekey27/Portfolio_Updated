# PHASE 6.15 — ResQ Wind Release, Replay & Mobile Composition Refinement

Scope: **Stage 2** (the remaining ResQ wind-stage cost, the decorative-intro replay, the
phone project layout) plus **Stage 3** (regression, documentation). Stage 1 was already
committed and pushed before this work started; nothing from Stage 2 has been committed.

| Check | Result |
| --- | --- |
| Base commit | `1caea3b` — `feat(portfolio): refine cinematic encounters and mobile performance` |
| `HEAD` vs `origin/main` | in sync (0 ahead / 0 behind) before Stage 2 |
| Stage 2 state | **uncommitted**, awaiting approval |
| Validation target | production build (`npm run build` → `npx next start -p 3100`) |
| Evidence | `screenshots/phase615/` (git-ignored) |

---

## 1. What Stage 2 had to fix

1. The ResQ wind stage was still the laggiest thing on the page, and the previous
   optimisation (6.14) had already been applied once — repeating that recipe was not
   allowed. The grand identity had to survive: gathering currents, protective formation,
   teal core, vortex rings, the directional wave, travelling motes and the RESQ title reveal.
   Secondary effects could be simplified on phones, the identity could not.
2. The decorative intro replayed on the way back up as well as on the way down, without
   hiding the project content and without a second observer system.
3. The phone project composition had to become a single readable column on five widths
   (320×655, 360×800, 375×812, 390×844, 430×932), and the composition had to be inspected,
   not just measured for horizontal overflow.

Constraints honoured throughout: no per-frame React state, no stacked filters, no blanket
`will-change`, nothing animating off screen.

---

## 2. Wind Release — six composited plates

### 2.1 Why the previous structure still cost so much

Phase 6.14 grouped the scene into SVG layers, but CSS `transform` on a `<g>` inside an
animated `<svg>` is **not** a compositing boundary: the browser repaints the parent SVG's
raster on every frame. The plates were structurally correct and physically useless.

The fix is structural, not stylistic:

- `components/missions/WindReleaseScene.tsx` now renders six **independent `<svg>` plates**
  — `air`, `flow`, `travel`, `form`, `impulse`, `release` — each wrapped in a
  `<div className="wnd-plate wnd-plate-…">`. The animated `transform` lands on the `<div>`,
  so each plate promotes to its own layer and animates without repainting its neighbours.
- Every plate carries a private copy of its gradients through `WindDefs({ id })` with a
  prefixed id. Cross-`<svg>` `<defs>` do not resolve, so sharing them was never an option.
- Geometry, data arrays and all copy are unchanged. Nothing was removed from the scene.

Also in the scene's stylesheet: `.wnd-mote` no longer uses a `box-shadow` bloom (a
per-frame, per-mote raster) — it is a `radial-gradient` on the element itself, same look.

### 2.2 Cost attribution (which layer is actually left)

Interleaved ablation, median of four samples per variant, `scripts/ab-phase615-wind.py`,
raw data `screenshots/phase615/ab-wind-after2.json`:

| Variant | Stage fps (median) | Δ vs control |
| --- | --- | --- |
| Control | 10.6 | — |
| Motes hidden | 10.95 | +3 % (noise) |
| All six plates hidden | 17.2 | **+62 %** |
| Off-screen animations paused | 10.3 | −3 % (noise) |

The remaining cost is the plates' **raster area**, not the motes and not forgotten
off-screen work — 22 off-screen animations are already paused. That is the honest ceiling
of what this phase could buy without deleting the visual identity, which was out of scope.

### 2.3 The other two R3F canvases

`components/HeroCanvas.tsx` and `components/SkillsCanvas.tsx` previously rendered at full
rate forever, including when scrolled far out of view. They now use the same mechanism
`HiddenLeafWorld` already used: a container ref plus an `IntersectionObserver`
(`threshold: 0.01`) driving `frameloop={isVisible ? "always" : "never"}`. `HeroCanvas` also
caps `dpr={[1, 1.5]}`. No new animation system was introduced.

---

## 3. Measured result

The machine is not a clean bench: 18 user Chrome processes and a software WebGL fallback
were present during every run, and absolute frame rates drifted by 2× between sessions.
Absolute fps is therefore reported but **not** claimed; the honest signal is the
**stage ÷ reference ratio**, measured in one session against `#contact` as the reference
section. Harness: `scripts/measure-phase615-wind.py` (paired samples, medians of four).

| Run | Reference fps | Stage fps | Ratio |
| --- | --- | --- | --- |
| 6.14 baseline (same session, before this change) | 48.45 | 8.45 | 0.17 |
| 6.15 after (same session) | 22.50 | 10.95 | **0.49** |

Same machine, same harness, same session: the stage went from **0.17×** to **0.49×** of the
reference cost. The reference itself got ~2× slower between runs, which is exactly why the
ratio is the claim and the raw numbers are context. Raw files:
`screenshots/phase615/perf-before-6.14.json`, `screenshots/phase615/perf-after-6.15.json`.

**Not claimed:** any absolute fps figure, and any claim that the wind stage is now cheap. It
is roughly 2.9× cheaper relative to the page's own baseline cost, and the plate raster area
is still the dominant term.

### Visual identity, verified after the refactor

`screenshots/phase615/wind-desktop-0{1..6}-*.png` (downscaled previews `preview-*.jpg`)
step through gather → currents → formation → impulse → release → settled and show the
gathering currents, the protective formation rings, the teal core, the travelling motes and
the RESQ title reveal all intact.

---

## 4. Decorative intro replay, both directions

The bug looked like a missing observer event; it was **commit latency**. `setInView` was
queued behind a busy frame, so `data-active` still described the previous scroll position
and the "return" state arrived one frame late — sometimes not at all on a fast upward flick.

`components/missions/useEncounterActive.ts` now wraps both `setInView(false)` and
`setInView(true)` in `flushSync`, so the attribute that drives the CSS animation is written
in the same frame the observer fires. The observer itself
(`rootMargin "0px 0px -6% 0px"`, thresholds `[0, 0.05, 0.15]`, needed overlap
`min(stageHeight*0.5, vh*0.12)`, `active = inView && phase === "content"`) is unchanged — the
existing system is reused, no second observer was added.

Content is never hidden by the replay: the intro and title animate, the copy stays readable
at all times. Verified in `scripts/verify-phase615.py`:

```
replay sand:  entry true / away false / return true
replay wind:  entry true / away false / return true
replay water: entry true / away false / return true
replay fire:  entry true / away false / return true
```

### Reverse travel lands on the section bottom — by design

Returning to `#home` from `#contact` ends at `scrollY 421` on 390×844 and `199` on
1366×768. Those are exactly `sectionHeight − viewportHeight` (1265−844, 967−768): reverse
travel uses `scrollToSectionInstant(destination, "end")` so the visitor is returned to where
they were reading, not thrown to the top of a multi-screen section. Confirmed as pre-existing
behaviour, not a Stage 2 regression.

---

## 5. Phone project composition

Three separate defects produced the "pushed left with a dead strip" look and the collided
badge. All three are fixed in `app/globals.css`.

### 5.1 The 320px dead strip

`html { scrollbar-gutter: stable }` reserved a 10 px gutter on phones, so the root box was
310 px inside a 320 px viewport while `100vw` stages bled 5 px each side: `stage.x = −5`,
`scrollWidth − innerWidth = −10`. The gutter clearly belongs to desktop only:

```css
html { scrollbar-gutter: auto; }
@media (min-width: 768px) { html { scrollbar-gutter: stable; } }

```

After: root box 320, stage `x = 0`, overflow 0.

### 5.2 The rank badge collision

Below 768 px the copy column goes full width, so the absolutely-positioned rank badge landed
on top of the kicker on every phone width. It is now a 30 px centred seal above the kicker
(`position: static; order: -1; justify-self: center; margin-bottom: 12px` at ≤767 px).

### 5.3 The empty band under short stages

`.bw-stage` had a fixed `min-height` that, once the copy reflowed to one column, left a
large empty band. At ≤639 px it becomes `min-height: auto; padding-block: 92px 88px`, and the
wind/water/fire stages take 88 px top and bottom. Section rhythm is preserved; the dead space
is not.

### 5.4 Inspected, not just measured

Still captures at 320×655 for every project (downscaled previews in the same folder):

- `enc-m320-bugwiser-{1,2,3}.png</br>`→ `pv-enc-m320-bugwiser-*.jpg`
- `enc-m320-resq-*`, `enc-m320-enn-consultancy-*`, `enc-m320-saravaraj-ai-*`
- `gal-m320-bw-*`, `gal-m320-wnd-*` — the gallery decks

They show the intended single column: rank seal, number/label, title, description, feature
details, screenshot below the intro, caption, links; consistent side padding; no detached
absolutely-positioned image; original aspect ratios; centred deck.

The water and fire records carry no screenshots at all (client projects, no public build) —
`.wtr-flow` and `.fyr-net` contain zero `<img>` elements and are centred full-width sections
at 320 and 390. Nothing to reflow there.

---

## 6. Regression matrix

`scripts/verify-phase615.py` drives the production server; raw results in
`screenshots/phase615/regression.json`.

| Viewport | Horizontal overflow | Badge/copy collisions | Decks centred |
| --- | --- | --- | --- |
| 320×655 | 0 px | none | yes |
| 360×800 | 0 px | none | yes |
| 375×812 | 0 px | none | yes |
| 390×844 | 0 px | none | yes |
| 430×932 | 0 px | none | yes |
| 768×1024 | −10 px (reserved gutter) | none | yes |
| 1024×768 | −10 px (reserved gutter) | none | yes |
| 1366×768 | −10 px (reserved gutter) | none | yes |

The −10 px desktop figure is not overflow: at ≥768 the stable gutter means `innerWidth`
includes the 10 px scrollbar strip while the document is only as wide as the content, so the
difference is negative — there is no horizontal scrolling.

| Check | Result |
| --- | --- |
| Replay, both directions, all four encounters | pass (§4) |
| ResQ carousel next control | `02 / 09 → 03 / 09` |
| Nav journey → `#missions`, `#contact` | lands at top 0 |
| Archive (`#fa-title`) present | yes |
| Reduced motion: intro/title opacity | `1` for sand, wind, water, fire; `data-active="true"` |

Two earlier "failures" turned out to be probe bugs and are recorded here so the numbers are
not misread later:

1. *Decks off-centre on desktop* — the probe compared the deck against `innerWidth / 2`.
   The ResQ deck shares a two-column gallery on desktop by design, and `innerWidth` includes
   the gutter. It now compares against the content-box centre and only requires centring
   when the deck owns the row.
2. *Carousel went `02 → 01`* — the probe clicked `button` index 1, which is the first
   pagination dot, not the next arrow. It now targets `aria-label="Next ResQ screenshot"`.

---

## 7. Verification run

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 errors, 2 pre-existing `@next/next/no-img-element` warnings (`ValleyOfTheEnd.tsx`) |
| `npm run build` (runs `scripts/validate-world-environments.mjs`) | green, 4/4 static pages |
| `npx next start -p 3100` + full matrix | green (§6) |

All of the above were re-run **after** the last CSS edit, on a freshly restarted production
server built from the final working tree.

---

## 8. Limitations

- **Frame rates on this machine are not a benchmark.** With 18 Chrome processes and software
  WebGL present, absolute fps moved ~2× between sessions. Only the stage÷reference ratio
  (0.17 → 0.49) and the ablation deltas are quoted.
- **The plate raster area is still the main cost.** Removing the six plates recovers +62 % of
  the stage's frame time; the only further win would come from shrinking the animated SVG
  area or dropping secondary plates on phones, which changes the identity and needs a
  decision, not a patch.
- **Mobile secondary effects were kept, not cut.** The phone layout simplified the
  *composition* (badge, spacing, gutter), not the effects; if 320 px classes still feel
  heavy on real hardware, thinning the mote/impulse plates at ≤639 px is the next lever.
- **Evidence folder is git-ignored.** `screenshots/` is not committed, so the report is the
  durable record; re-running the harnesses regenerates the files.
- **The production server must be restarted after `npm run build`.** `next start` keeps the
  previous `.next` chunks in memory; a stale server silently serves the old CSS and produces
  misleading measurements.

---

## 9. Files changed in Stage 2 (uncommitted)

| File | Change |
| --- | --- |
| `components/missions/WindReleaseScene.tsx` | six independently composited `<svg>` plates, per-plate `<defs>` |
| `components/missions/useEncounterActive.ts` | `flushSync` on both `setInView` transitions |
| `components/HeroCanvas.tsx` | visibility-gated `frameloop`, `dpr` cap |
| `components/SkillsCanvas.tsx` | visibility-gated `frameloop` |
| `app/globals.css` | mote gradient glow, phone gutter, rank seal, stage padding |

New untracked harnesses (tooling, not shipped): `scripts/measure-phase615-wind.py`,
`scripts/ab-phase615-wind.py`, `scripts/verify-phase615.py`,
`scripts/shoot-phase615-wind.py`, `scripts/shoot-phase615-encounters.py`.

**Nothing has been committed or pushed.** Awaiting approval.
