# Phase 6.11 — Missions environment, Grand Wind Release, elemental project transitions

Status: implemented, built for production and validated at 1920×1080, 1366×768,
430×932, 390×844 and 375×812 (plus a reduced-motion pass at every viewport).

Scope of this document: the Missions background, the ResQ wind scene, the new
project-to-project transitions, verification, and what is still imperfect.

---

## 1. Root cause

Two separate defects were reported as one "background problem", and they have
different causes. Both are recorded here exactly as measured, including the part
of the premise that did **not** hold.

### 1a. Missions was already painting its own asset

The Missions section resolves its plate through `components/worlds/MissionsWorld.tsx`
and has done since Phase 6.4/6.9:

```
/assets/missions/mission-hq-cinematic-v3.png
```

Measured in the browser (production build, all five viewports):

```json
{ "missions": "/assets/missions/mission-hq-cinematic-v3.png",
  "missionsPlate": "url(http://localhost:3000/assets/missions/mission-hq-cinematic-v3.png)" }
```

`grep` over `components/` and `app/` shows the Training Grounds artwork
(`/assets/skills-training-grounds-cinematic.png`) referenced only by
`components/worlds/SkillsWorld.tsx`. Missions never referenced it.

So the shipped Missions image was correct; the report that "Missions uses the
Skills background" was a symptom of the real defect below. `docs/missions-background-brief.md`
still contains an older statement that v3 was never received — `docs/ASSETS.md`
and `screenshots/phase64/missions/report.json` confirm it was, and it is what the
section renders today. That stale paragraph should be read as superseded.

### 1b. What actually broke the boundary: the Skills plate's framing

`SkillsWorld` painted its 1672×941 artwork with `h-full w-full` inside an
`absolute inset-0` layer sized to the **whole section** (~1980 px at 1366). The
section is therefore ~2.1× taller than the image, so the artwork was upscaled
2.1× to cover it:

- the top of the section showed a heavily blurred, abstract fragment of the
  painting instead of a composed view of the Training Grounds;
- the bottom of the section fell past the painting's composed content into a
  near-black crop that ended **directly above** the Missions plate.

Because the skills plate's tail and the missions plate's top are both dark, the
eye read one continuous, murky environment across the section boundary — and
because the tail was empty black, the last viewport of Skills looked like a
missing background strip immediately before Missions. That is the "empty strip /
abrupt jump between Skills and Missions" in the brief.

Evidence: `screenshots/phase611/before/1366-skills-missions-boundary.png` (the
Skills section's final viewport is pure black; the Missions HQ begins below it).

Fix: Skills now uses the **same sticky viewport band pattern** as About,
Missions and Experience — `sticky top-0 h-[100lvh]`, `object-cover` with the
existing `center 46%/44%/42%` anchors, identical overlays, identical dust. Same
asset, same art direction, but the plate is now always a full viewport of
correctly-scaled artwork, with no upscaled blur and no black tail.

### 1c. Project-to-project transitions did not exist

There was no elemental transition between the four project encounters at all —
they simply stacked. `lib/transitions/identity.ts` only maps **section** pairs
(home|about raijin, about|skills nature-chakra, skills|missions rasengan,
missions|experience shinobi-map). Requirement 3 was therefore an addition, not a
repair; see §5.

---

## 2. Active asset

| Section  | Asset                                                   | Owned by |
| -------- | ------------------------------------------------------- | -------- |
| Skills   | `/assets/skills-training-grounds-cinematic.png` (1672×941) | `lib/worlds/environments.ts` → `SkillsWorld` |
| Missions | `/assets/missions/mission-hq-cinematic-v3.png`            | `lib/worlds/environments.ts` → `MissionsWorld` |

`lib/worlds/environments.ts` is now the single source of truth for both plates.
Each world tags its rendered layer with `data-world-asset`, so the mapping can be
asserted from the DOM (that is what the validation harness reads) instead of being
inferred from source. The module also throws at import time if two sections ever
share an asset, so a copy/paste error fails the build rather than producing a
silently duplicated environment.

The Skills art direction is unchanged: same file, same object-position anchors,
same overlays, same amber dust. Only its framing changed (sticky viewport band).

---

## 3. Animation changes — ResQ "Grand Wind Release"

`components/missions/WindReleaseScene.tsx` stage A was rebuilt from scratch as a
five-stage sequence. Everything is static SVG + CSS keyframes: no canvas, no
per-frame React state, no scroll listener, no `requestAnimationFrame` loop, no
new dependency, no image or character art (the formation is drawn with arcs,
ellipses, ribbons and circle fields).

The scene is a fixed 1440×900 SVG (`viewBox`) behind the copy, so composition is
identical at every viewport; the field is lifted (`translateY(-13%)`, `-24%` under
640 px) so the formation sits behind the wordmark rather than on the body copy.

| Stage | Window | What happens | Elements |
| --- | --- | --- | --- |
| 1 · Atmosphere | 0 – 900 ms | Nothing but a dark plateau, a soft teal bloom and drifting motes | `.wnd-atmos`, `.wnd-bloom`, 26 `.wnd-mote` |
| 2 · Gathering | 260 – 2000 ms | Currents sweep in from both edges and converge; two spirals and four strata wind inward | `.wnd-current`, `.wnd-stratum`, `.wnd-spiral`, `.wnd-vortex-ring` |
| 3 · Protective formation | 520 – 2700 ms | The segmented ring formation closes (11 arcs + 2 vortex rings), a bright teal core ignites (1180 ms) and two shockwaves ring outward (1560/1780 ms), then a protective pulse fires (1500/1440 ms) | `.wnd-formation`, `.wnd-arc`, `.wnd-core`, `.wnd-ignite`, `.wnd-shock-a/b`, `.wnd-pulse`, `.wnd-pulse-core` |
| 4 · Directional release | 2260 – 4100 ms | The formation opens and a wind sheet + two wave rings + four wave ribs sweep outward, dispersing into 18 travelling motes and 22 spray dots (four variants) | `.wnd-sheet`, `.wnd-wave-ring-a/b`, `.wnd-wave-rib`, `.wnd-travel-mote`, `.wnd-spray` |
| 5 · Title reveal | 2180 – 4160 ms | The wordmark unmask-clips up through the gap (2380 ms), then the role, intro, two note columns, disclaimer, rank, caption and scroll cue rise in | `.wnd-kicker`, `.wnd-title-text`, `.wnd-role`, `.wnd-intro`, `.wnd-notes`, `.wnd-disclaimer`, `.wnd-rank`, `.wnd-stage-caption`, `.wnd-cue` |

Implementation notes:

- **Plays once.** The whole sequence hangs off `data-active="true"` on
  `[data-encounter="resq"]`, set by the existing `useEncounterActive` observer.
  Re-entering the section after leaving it re-arms the timeline, but scrolling
  inside the encounter never re-triggers it.
- **No layout/animation risk.** Every animated property is `opacity`,
  `transform`, `stroke-dashoffset` or `clip-path`. Only one `filter: drop-shadow`
  remains (on the core); everything else is drawn, not blurred, so the sequence
  costs no compositing layers beyond the SVG.
- **Deterministic.** All particle/streak/rib positions are integer-derived module
  constants, so server and client markup match (no hydration drift).
- **Reduced motion.** `@media (prefers-reduced-motion: reduce)` forces
  `animation: none`, removes the title `clip-path`, and hides the wave, spray and
  motes: the reader gets the settled formation and all copy immediately.
- **Phones.** The field is lifted further and the core dimmed under 640 px so the
  ignition never lands on the paragraph text.
- **Hydration fix (incidental).** `WaterReleaseScene`'s droplet `cx`/`cy` were
  unrounded `Math.cos`/`Math.sin` floats, which produced a React hydration
  mismatch warning in dev. They are now rounded to two decimals.

---

## 4. Before / after

| | Before | After |
| --- | --- | --- |
| Skills → Missions boundary | `before/1366-skills-missions-boundary.png` — the last Skills viewport is empty black; the upscaled plate had ended | `1366/skills-missions-arrival.png` and `1366/skills-environment.png` — Skills is a full, correctly framed Training Grounds viewport right up to the boundary; the section change is carried by the existing Rasengan |
| Missions header | `before/1366-missions-header.png` — correct v3 HQ, but reached from a black strip | `1366/missions-header.png` — same v3 HQ, now preceded by a real environment |
| ResQ wind, settled | `before/1366-resq-settled.png` (Phase 6.9) — one thin ring, a handful of streaks, flat field | `1366/resq-05-reveal.png` — segmented formation, halo band, converging currents, wave ribs, core |
| ResQ wind, mobile | `before/390-resq-settled.png` — same flat scene | `390/resq-05-reveal.png` — same composition, field lifted behind the wordmark |
| Project boundaries | no transition at all | `*/seam-sand-wind.png`, `*/seam-wind-water.png`, `*/seam-water-fire.png` and their reverse counterparts |

Stage-by-stage frames (`*/resq-01-atmosphere.png` … `resq-05-reveal.png`) are
captured by scrubbing the real CSS timeline with the Web Animations API, so each
file is the true composition at that millisecond, not a timing-dependent grab.

---

## 5. Transition mapping

### Section transitions (unchanged, verified)

| Pair | Identity | Status |
| --- | --- | --- |
| Home ↔ About | Flying Raijin (kunai) | untouched |
| About ↔ Skills | Nature Chakra | untouched |
| Skills ↔ Missions | Rasengan | untouched — `*/skills-missions-crossing.png` shows the orb mid-crossing |
| Missions ↔ Experience | Shinobi Map | untouched |

### Project transitions (new)

`components/transitions/ElementalSeam.tsx` renders a short band at each encounter
boundary. `components/Missions.tsx` mounts it between consecutive articles, so
there are exactly three seams:

| Travel | Pair rendered | Elements |
| --- | --- | --- |
| BugWiser → ResQ | `sand-wind` | sand grains and dune lines disperse upward, wind streaks and ribbons take over below the seal |
| ResQ → ENN Consultancy | `wind-water` | wind thins into a last gust, then water condenses into pooling lines and droplets |
| ENN Consultancy → Saravaraj | `water-fire` | water recedes into vapour, embers and flame tongues rise from the boundary |

Reverse travel renders the *same ordered pair swapped* (`wind-sand`,
`water-wind`, `fire-water`) rather than mirroring an image, so the element the
reader is leaving is always the one on their side of the seal. Verified in every
viewport: forward `{pair, dir: "forward"}` / reverse `{pair: swapped, dir: "reverse"}`.

Architecture (deliberately an extension, not a parallel system):

- one `IntersectionObserver` per seam with `rootMargin: "-36% 0px -36% 0px"` —
  the band only plays when the seam is the centre of interest;
- direction is derived from the seam's own viewport `top` between observations
  (decreasing = scrolling down), so no scroll listener is added to the page;
- playback is a one-shot CSS timeline armed by `data-active` (820 ms out /
  900 ms in), identical in shape to the encounter animations;
- no scroll lock, no overlay, no blocking loader, no layout shift — the band is
  `clamp(146px, 18vh, 204px)` tall on desktop (`clamp(128px, 15vh, 168px)` under
  640 px) and sits inside the existing article flow;
- fully static SVG, deterministic integer scatter, `data-elemental-seam`,
  `data-seam-from`, `data-seam-to`, `data-direction` and `data-active` for
  diagnostics;
- `prefers-reduced-motion: reduce` renders the finished band with zero running
  animations.

No Kunai, Flying Raijin or other section identity is used for these boundaries.

---

## 6. Files modified

| File | Change |
| --- | --- |
| `lib/worlds/environments.ts` | **new** — authoritative section → plate map, `getSectionEnvironment`, duplicate-asset build guard |
| `components/worlds/SkillsWorld.tsx` | rewritten — sticky `h-[100lvh]` band, registry asset, `data-world-asset`; same overlays/dust/art |
| `components/worlds/MissionsWorld.tsx` | reads the registry, tags `data-world-asset`; scrims and object-positions untouched |
| `components/missions/WindReleaseScene.tsx` | stage A rebuilt (atmosphere → gathering → formation → release → reveal); copy, gallery, record untouched |
| `components/missions/WaterReleaseScene.tsx` | rounded droplet coordinates (hydration fix) |
| `components/transitions/ElementalSeam.tsx` | **new** — ordered elemental seams with direction-aware pair swap |
| `components/Missions.tsx` | mounts `<ElementalSeam>` between encounters; all project content untouched |
| `app/globals.css` | `wnd-*` stage styles, one-shot timeline, reduced-motion block, phone field offset; new `.esm*` seam block |
| `scripts/capture-phase611.py` | **new** — five-viewport evidence + assertions harness |
| `screenshots/phase611/**` | **new** — before/after evidence and `validation.json` |
| `docs/phase611-missions-resq-transition-refinement.md` | this report |

No assets were added, replaced or deleted; no dependencies were added.

---

## 7. Verification

Harness: `python scripts/capture-phase611.py` against the **production** build
(`next build && next start`). Output: `screenshots/phase611/validation.json`.

### Desktop

| Check | 1920×1080 | 1366×768 |
| --- | --- | --- |
| Skills plate | `skills-training-grounds-cinematic.png` | same |
| Missions plate (`data-world-asset` + computed `background-image`) | `mission-hq-cinematic-v3.png` | same |
| Skills/Missions document gap | 0 px | 0 px |
| Skills plate covers its section / Missions plate starts at its section | yes / yes | yes / yes |
| Horizontal overflow | −10 px (none) | −10 px (none) |
| Elements wider than the viewport (`.wnd-*`, `.esm`, other stages) | none | none |
| Seam heights | 194 px | 146 px |
| Seams armed forward / reverse | 3/3 , 3/3 | 3/3 , 3/3 |
| Page/console errors | 0 | 0 |

### Mobile

| Check | 430×932 | 390×844 | 375×812 |
| --- | --- | --- | --- |
| Missions plate | v3 | v3 | v3 |
| Document gap | 0 px | 0 px | 0 px |
| Horizontal overflow | none | none | none |
| Seam heights | 140 px | 128 px | 128 px |
| Seams forward/reverse | 3/3 , 3/3 | 3/3 , 3/3 | 3/3 , 3/3 |
| Wind stage | full-bleed, copy legible, core behind the wordmark | same | same |
| Errors | 0 | 0 | 0 |

### Reduced motion (all five viewports)

| Probe | Result |
| --- | --- |
| `[data-encounter="resq"]` running animations | 0 |
| Title animation | `none`, opacity 1, no clip |
| Pulse / wave sheet / motes | `display: none` |
| Formation | visible, opacity 0.9 (settled) |
| Seam running animations | 0 (finished band) |

### Accessibility and continuity

- The seam band is `aria-hidden` decoration; the seal glyph is not focusable and
  adds no tab stop. All project headings, copy, galleries, records and links are
  unchanged.
- No scroll locks, no fixed overlays, no layout shift: the band lives in normal
  flow, so `scrollY` and section offsets are unaffected.
- Nothing blocks: the longest timed sequence is the ResQ reveal (~4.2 s), which
  runs while the reader is already reading.

---

## 8. Check results

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0, no output |
| `npm run lint` | exit 0 — 0 errors, 2 warnings, both pre-existing `@next/next/no-img-element` (`SkillsWorld.tsx`, `ValleyOfTheEnd.tsx`) |
| `npm run build` | success — `next build` (Turbopack) compiled, TypeScript passed, `/` prerendered static |
| `python scripts/capture-phase611.py` | exit 0, five viewports, `validation.json` written |
| Production smoke | `next start` → HTTP 200, no page errors, no hydration warning |

---

## 9. Other projects — intact

Checked in the production build by DOM inspection:

| Encounter | Gallery / screens | External links | Record |
| --- | --- | --- | --- |
| BugWiser (`data-encounter="bugwiser"`) | 3 images | GitHub repo + live build | present |
| ResQ (`data-encounter="resq"`) | 6 chapters, 16 images | Source repo + APK release | present |
| ENN Consultancy | CSS-drawn screens (no imagery by design) | none by design (client work) | present |
| Saravaraj | CSS-drawn screens (no imagery by design) | none by design (client work) | present |

No copy, screenshot, link, tag, role, date, disclaimer or record was edited in
this phase. The only ResQ change outside stage A is the droplet rounding.
No client data was introduced, and no project fact was invented.

---

## 10. Remaining limitations

- **The seam is a boundary, not a section transition.** It is ~130–195 px tall by
  design so it never delays the reader. A reader who jumps more than a viewport at
  a time (keyboard `End`, a nav jump to a deep anchor) can cross a boundary without
  the band entering the activation band, and therefore without seeing it.
- **Re-entry replays.** Leaving and re-entering an encounter boundary replays that
  seam. This is intentional (it is a scroll transition, not a one-per-session
  effect), but it is not "played exactly once per page load".
- **Motion quality is judged from stills.** Headless Chromium cannot be assessed
  for smoothness; frames were captured by scrubbing the real timeline, and the
  timing/easing values were reviewed in source. A human pass on a real GPU is
  still the only way to judge how the wave reads in motion.
- **Small-phone composition is a compromise.** At 375–390 px the copy column is
  taller than the formation, so the field is lifted and the core dimmed; the rings
  read more as a halo behind the title than as a full protective formation.
- **The seam artwork is schematic.** Sand, wind, water and fire are abstract SVG
  lines and particles — no photographs, no character art, no borrowed assets — so
  they suggest the elements rather than depict them. That was the constraint, but
  it does mean the water and fire seams are more atmospheric than illustrative.
- **Stale doc left in place.** `docs/missions-background-brief.md` still says v3
  was never received. It is superseded by `docs/ASSETS.md` and this report; it was
  not rewritten in this phase to avoid silently editing a historical brief.
