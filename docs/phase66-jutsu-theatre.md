# Phase 6.6 — Complete Shinobi Jutsu Theatre

All four Mission Showcase encounters are now character-led scenes. BugWiser's
approved Sand Dominion composition, animation and content are preserved; ResQ,
ENN Consultancy and Saravaraj AI each received a distinct composition of their
own. Project facts, illustrations, notes and links still come only from
`lib/data/missions.ts`.

---

## 1. Encounter identities

| # | Record | Scene component | Composition | Sequence (from `data-active`) |
| --- | --- | --- | --- | --- |
| 01 | BugWiser | `SandDominionScene` (unchanged) | desert chamber; figure right, title left, live screenshot plate lower left | 80 → 460 → 860 → 1250 → 1950 ms |
| 02 | ResQ | `LightningScene` | diagonal storm; figure left in a low stance, right-aligned title, receding artwork plate lower right | 80 → 620 → 900 → 1130 strike → 1230 title → 1850 plate |
| 03 | ENN Consultancy | `SealingScene` | axial shrine wall; centred hanging scroll and seal ring, title centred, figure right, parchment plate left | 120 scroll → 420 hands → 520 seal → 660 lines → 1300 title → 1900 plate |
| 04 | Saravaraj AI | `NetworkScene` | radial relay; crouched figure left, progressive node mesh right, artwork plate integrated lower right | 120 signal → 320 nodes → 520 links → 780 ripples → 1350 title → 1750 plate |

### Lightning Release — ResQ

* Figure on the left with a folded seal arm and one extended palm; blue-white
  chakra (core, dashed rings, spokes) gathers at that hand.
* Three arcs (wide glow pass + thin stroke) cross the chamber; a screen flash
  and the title mask coincide with the strike.
* Title wipes open right-to-left under the strike; the existing emergency
  beacon illustration floats on a `rotateY(-6deg)` plane.
* Classification stays **Hackathon Prototype · Android** and the project note is
  reproduced verbatim: the workflow does not dispatch ambulances or replace
  emergency services.

### Sealing Technique — ENN Consultancy

* Centred, ceremonial layout with a hanging scroll that unrolls vertically and
  a large seal ring inscribed from `stroke-dashoffset`.
* Gold sealing lines draw outward from the centre across the full width; the
  title is revealed by a centre-out clip and a drawn underline.
* Figure at the right in a two-handed seal; the existing CRM/workflow
  illustration is mounted as a parchment-toned plate at lower left.
* **Client Project · Business Automation**, "Client-owned platform", and the
  client-ownership note are preserved. No links are rendered because the data
  has none.

### Shadow Network — Saravaraj AI

* Crouched figure at the left, one hand raised to the ear and one arm extended
  toward the field; signal rings pulse at the raised hand.
* Nine deterministic nodes light in order and twelve links draw progressively
  from the hub; two dashed crimson paths carry the "signal" after connection.
* Title settles with a mask wipe and letter-spacing carry; the existing outreach
  and voice illustration floats at lower right over the node field.
* **Client Project · AI Outreach**, "Client-owned platform", and the client note
  are preserved; no links are invented.

---

## 2. Shared full-bleed fix

All four scene layers are `100vw` elements inside the 1250px content column.
The encounter article itself carried `overflow: clip`, which cropped each scene
back to the ~1154px column: the approved BugWiser title was cut on the left and
its figure on the right, and the new titles/characters were largely invisible.

`app/globals.css` now leaves the article overflow visible (`.sd` and `.jt`); the
scene keeps its own clip. No layout values, keyframes, timings or content in
`SandDominionScene` changed — the already-authored full-bleed composition simply
renders as designed. Record columns remain inside the content width.

---

## 3. Implementation

New files:

* `components/missions/LightningScene.tsx`
* `components/missions/SealingScene.tsx`
* `components/missions/NetworkScene.tsx`
* `components/missions/BoltShinobi.tsx`, `SealShinobi.tsx`, `SignalShinobi.tsx`
  — original ink-silhouette stand-ins, static SVGs.
* `components/missions/MissionRecord.tsx` — shared factual record (description,
  four highlights, note, stack, verified links or client label, operation meta).
* `components/missions/useEncounterActive.ts` — one `IntersectionObserver` plus
  the section reveal phase; arms once, never replays.
* `scripts/capture-jutsu-theatre.py` — capture + validation harness.

Edited:

* `components/Missions.tsx` — the four records now map to their scenes.
* `lib/data/characterArt.ts` — artwork slots for the three new plates
  (`base: null` until approved art is supplied; the SVG stand-in is rendered).
* `app/globals.css` — new `jt` / `lt` / `sl` / `nw` styles, ink reading pool for
  the three new records, mobile recomposition, reduced-motion rules.

Removed: the superseded framed `components/missions/MissionEncounter.tsx` and its
now-unused `enc-*` CSS block.

Motion is still one-shot CSS (`opacity` / `transform` / `clip-path` / masks),
gated on `data-active`. No canvas, no `requestAnimationFrame`, no per-frame
React state, no layout-thrashing properties.

---

## 4. Content preservation

* `lib/data/missions.ts` was **not** modified. Descriptions, highlights, notes,
  stacks, ranks, classifications and links are byte-identical.
* BugWiser keeps its live screenshot and both verified links.
* ResQ keeps its repository link, hackathon classification and the explicit
  "does not dispatch ambulances" note.
* ENN and Saravaraj keep `links: {}` and render "Client-owned platform"; no
  public URL was invented.
* The four-entry Field Archive is untouched: Financely, PhenomCommerce, Podcast
  Platform, Cara Clothing.

Verified link status (HTTP, follow redirects):

| Link | Status |
| --- | --- |
| BugWiser GitHub | 200 |
| BugWiser live build | 200 |
| ResQ GitHub | 200 |
| Financely | 200 |
| PhenomCommerce | 200 |
| Podcast Platform | 200 |
| Cara Clothing | 200 |

Record links use `target="_blank"`, `rel="noopener noreferrer"`, accessible
labels, and a 44px minimum hit height. All are revealed by the record's
one-time reveal when scrolled into the reading band.

---

## 5. Validation

### Static

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0, 0 errors; the same 2 pre-existing `<img>` warnings in `SkillsWorld.tsx` / `ValleyOfTheEnd.tsx` |
| `npm run build` | exit 0; Next 16.2.9, 4/4 static pages |

### Layout / overflow / text

`screenshots/phase66/report.json`, three viewports.

| Viewport | Scene heights (BugWiser / ResQ / ENN / Saravaraj) | Clipped text | Text outside viewport | Min text | overflowX |
| --- | --- | --- | --- | --- | --- |
| 1920×1080 | 960 / 940 / 994 / 960 | 0 | 0 | 8px | −10 |
| 1366×768 | 691 / 691 / 707 / 707 | 0 | 0 | 8px | −10 |
| 390×844 | 782 / 744 / 812 / 717 | 0 | 0 | 8px | −10 |

* Copy/plate overlap: false for all 12 combinations.
* Record visibility after scrolling into the reading band: 19/19 elements
  (BugWiser, ResQ), 18/18 (ENN, Saravaraj; no links).
* Mobile is intentionally recomposed:
  * ResQ: character → title → artwork plate.
  * ENN: centred title → character → parchment plate, scroll and seal behind.
  * Saravaraj: title → character → artwork plate, node field behind.
  * BugWiser: unchanged mobile composition.

### Sequence proof (`report.json → sequence`)

Sampled ~300ms after arming and again after settling, with
`prefers-reduced-motion: no-preference`:

| Encounter | Early title | Settled title | Early plate | Settled plate |
| --- | --- | --- | --- | --- |
| ResQ | opacity 0.25, mask 100% | opacity 1 | clipped 100% | open |
| ENN | opacity 0.4, clip 50% | opacity 1 | clipped 100% | open |
| Saravaraj | opacity 0.2, mask 100% | opacity 1 | clipped 100% | open |

This proves the beats run rather than only showing the settled composition.

### Reduced motion

All 12 encounter × viewport combinations:

* running animations > 0.01s: **none**
* title opacity: **1**
* title mask: **none**
* figure and plate opacity: **1**
* overflowX: **−10**
* settled composition remains complete; flash/ripple layers are hidden.

### Transition regression (production build)

`scripts/verify-transitions-prod.py`, 8 routes × both directions.

* **390×844**: 8/8 PASS. Correct identities: flying-raijin, nature-chakra,
  rasengan, shinobi-map; `settledState=None`, `settledOverlays=0`,
  `overflowX=-10`, overlay paint transparent on every route.
* **1366×768**: 8/8 correct identities and settled states on every run. The
  luminance gate flagged a transient first-frame sample on some backward routes
  in each run (11.77 vs a 12 threshold in one run; two 100%-dark samples in the
  latest run). The failing sample is the unsaved frame taken in the same tick as
  the state flip; every saved `WORLD_SWITCH` frame and settled frame for those
  routes is healthy (mean 25–28, dark 1–4%). A different route flagged in each
  repeat, which identifies this as the sampling artifact already documented in
  Phase 6.5, not a reproducible black-out.
* The reverse-scroll fix and all transition code (`lib/scroll.ts`,
  `TeleportationController`, identity components) were not touched.

---

## 6. Screenshots

Root: `screenshots/phase66/`.

For each viewport folder (`1920`, `1366`, `390`) and each encounter
(`bugwiser`, `resq`, `enn-consultancy`, `saravaraj-ai`):

* `viewport-settled.png` — settled scene in the viewport
* `scene.png` — full scene layer
* `record.png` — full factual record
* `record-viewport.png` — record in page context
* `reduced-motion.png` — reduced-motion result

The three new encounters additionally have sequence frames at 1920 and 390:
`seq-01-enter.png`, `seq-02-sign.png`, `seq-03-reveal.png`, `seq-04-plate.png`.

`report.json` holds the full metrics, reduced-motion results and sequence proof.
The previously approved BugWiser frames remain under
`screenshots/phase66/bugwiser/`.

---

## 7. Preserved

* Mission HQ v3 environment (`MissionsWorld`, `mission-hq-cinematic-v3.png`).
* Four-entry Field Archive and its links.
* Reverse-scroll landing fix and all four transition identities/timelines.
* Navbar, Lenis, scroll lock, skip link, grain, world reveal.
* BugWiser Sand Dominion composition, timings, live screenshot, links and copy.
* ResQ hackathon classification and safety note.
* Client-owned labels and notes for ENN Consultancy and Saravaraj AI.

---

## 8. Limitations

* **Character art is an original stand-in.** `data-character="stand-in"` and the
  "Stand-in silhouette" record row are shown deliberately; no licensed anime or
  third-party character artwork was added. Approved plates can be dropped in via
  `lib/data/characterArt.ts` without touching the scenes.
* **No fabricated project screenshots.** Only BugWiser has a verified live
  screenshot. ResQ, ENN and Saravaraj show their existing original project
  illustrations, labelled "Project artwork · original illustration".
* **Transition luminance sampling is flaky at 1366** as described above; this
  predates Phase 6.6 and is a measurement artifact, not a rendered black-out.
* Measurements and screenshots come from headless Chromium emulation at the
  requested viewports, not physical devices.
* The encounter sequence plays once per page load by design; scrolling away and
  back does not replay it.
