# Phase 6.5 — Reverse-scroll fix + Shinobi Mission Showcase

Two workstreams, delivered on top of the accepted Phase 6.4 state. No reset,
revert, stash or asset deletion was performed. Transition identities, Career
Ledger animations, the Flying Raijin kunai and the loader were not redesigned.

---

## 1. Root cause of the reverse-scroll jump

`scrollToSectionInstant(id)` in `lib/scroll.ts` aligned **the destination
section's top edge to the viewport top** on every transition, in both
directions. The teleport timeline is direction-agnostic for the snap:

```
TELEPORT_FLASH → scrollToSectionInstant(destination)   // top alignment, always
```

Forward travel that is correct — the arriving world should fill the screen.
Reverse travel it is not: the visitor is scrolling **up** out of the lower
section, so the section being returned to must arrive at the part they came
from (its end), not its far top. Because sections are 1.2k–6.2k px tall, the
result was a jump of up to **6,154 px** on a phone, exactly the reported
"teleports to the top of the destination section".

The reverse trigger fires when the previous section's bottom is within
`-0.35 × viewportHeight` of the viewport top, i.e. while the reader is still
just inside the lower section. Snapping to the top of a multi-screen section
therefore discarded the whole reading position.

Nothing in the animation, the veil, the overlay lifetime or the scroll lock was
at fault. Measured with real wheel input before the fix (production build):

| Route (reverse) | Viewport | scrollY at trigger | scrollY after snap | Jump | Destination top after |
| --- | --- | --- | --- | --- | --- |
| Experience → Missions | 1366×768 | 8139 | 4477 | **−3662** | 0 |
| Missions → Skills | 1366×768 | 4446 | 2496 | **−1950** | 0 |
| Skills → About | 1366×768 | 2465 | 967 | **−1498** | 0 |
| About → Home | 1366×768 | 936 | 0 | **−936** | 0 |
| Experience → Missions | 390×844 | 12172 | 6018 | **−6154** | 1 |
| Missions → Skills | 390×844 | 5987 | 3668 | **−2319** | 0 |
| Skills → About | 390×844 | 3637 | 1254 | **−2383** | 0 |
| About → Home | 390×844 | 1223 | 0 | **−1223** | 0 |

---

## 2. Fix (narrowly scoped)

* `lib/scroll.ts` — `scrollToSectionInstant(id, align = "start")` now takes the
  landing edge:
  * `"start"` → section top, clamped to `[0, maxScroll]` (unchanged behaviour),
  * `"end"` → `sectionTop + sectionHeight − innerHeight`, clamped to the same
    range, so the section's bottom lands on the viewport bottom.
* `components/transitions/TeleportationController.tsx` — the `TELEPORT_FLASH`
  snap passes `transition.direction === "backward" ? "end" : "start"`. Nothing
  else in the transition architecture changed.

Everything else is untouched: trigger thresholds, phase durations, identities,
cooldown, scroll lock, Lenis sync and anchor navigation (`scrollToSection`,
which still lands on the section top as intentional navigation).

### After the fix (final production build, real wheel input)

| Route (reverse) | Viewport | Trigger → end | Travel | Destination bottom after |
| --- | --- | --- | --- | --- |
| Experience → Missions | 1920×1080 | 9841 → 8792 | −1049 | 1080 (= vh) |
| Missions → Skills | 1920×1080 | 5151 → 3703 | −1448 | 1081 |
| Skills → About | 1920×1080 | 3167 → 1723 | −1444 | 1080 |
| About → Home | 1920×1080 | 1449 → 0 | −1449 | 1080 |
| Experience → Missions | 1366×768 | 9534 → 8797 | −737 | 769 |
| Missions → Skills | 1366×768 | 4733 → 3709 | −1024 | 768 |
| Skills → About | 1366×768 | 2729 → 1728 | −1001 | 769 |
| About → Home | 1366×768 | 1224 → 199 | −1025 | 768 |
| Experience → Missions | 430×932 | 12212 → 11372 | −840 | 933 |
| Missions → Skills | 430×932 | 6139 → 4919 | −1220 | 932 |
| Skills → About | 430×932 | 3802 → 2568 | −1234 | 932 |
| About → Home | 430×932 | 1578 → 320 | −1258 | 932 |
| Experience → Missions | 390×844 | 12373 → 11683 | −690 | 845 |
| Missions → Skills | 390×844 | 6314 → 5174 | −1140 | 845 |
| Skills → About | 390×844 | 3954 → 2824 | −1130 | 844 |
| About → Home | 390×844 | 1530 → 410 | −1120 | 844 |
| Experience → Missions | 375×812 | 12287 → 11685 | −602 | 813 |
| Missions → Skills | 375×812 | 6288 → 5223 | −1065 | 812 |
| Skills → About | 375×812 | 3963 → 2872 | −1091 | 812 |
| About → Home | 375×812 | 1512 → 425 | −1087 | 813 |

Every landing now has `destinationBottom == viewportHeight` (one-screen travel,
the equivalent of continuing upward), instead of `destinationTop == 0`.
`About → Home` at 1920×1080 legitimately lands at 0 because Home is exactly one
viewport tall there.

### Real touch input (CDP `Input.dispatchTouchEvent`, mobile emulation)

| Viewport | scrollY before reverse | scrollY after arrival | Travel | Missions bottom after | Next upward swipe |
| --- | --- | --- | --- | --- | --- |
| 390×844 | 12294 | 11534 | −760 | 844 | −272 px, unlocked |
| 430×932 | 12297 | 11365 | −932 | 933 | −302 px, unlocked |

No residual scroll lock (`documentElement.overflow` returns `visible`), no
horizontal overflow (`scrollWidth − innerWidth = 0` on touch runs; the
production harness reports `-10` from the reserved scrollbar gutter).

Evidence: `screenshots/phase65/probe/before-*`, `after-*`, `final-*`;
`screenshots/phase65/touch/390|430/`.

---

## 3. Shinobi Mission Showcase — Jutsu Encounter Archive

`components/Missions.tsx` no longer renders four dossier cards. Each project is
a full-width encounter (`components/missions/MissionEncounter.tsx`), separated
by hairline rules, with its own stage plate and treatment:

| # | Record | Treatment | Stage artefact | Title formation |
| --- | --- | --- | --- | --- |
| 01 | BugWiser (featured) | Sand Dominion — sand vortex, sweeping sand wash, rising grains | **Real live screenshot** `bugwiser-live.png` | sand gather: blur + rise into place |
| 02 | ResQ | Lightning Release — charge glow, two drawn arcs with glow pass, strike line | Original emergency-beacon illustration | clip reveal left → right |
| 03 | ENN Consultancy | Sealing Technique — parchment leaves unroll, seal stamp, ink line | Original CRM/workflow illustration | unroll from the centre line |
| 04 | Saravaraj AI | Shadow Network — drawn links, node pulses, crimson signal | Original outreach/voice illustration | spacing settle + fade |

Layout varies instead of repeating: the featured BugWiser record leads with its
title, then a full-width 16:9 stage, then details plus an "Operation record"
metadata panel; ResQ is stage-left, ENN is stage-right (flipped), Saravaraj
returns to stage-left. Mobile recomposes each to a single vertical column with
the title and description directly under the stage.

Each encounter keeps the real content: description, first four highlights,
client/hackathon notes, stack and verified links, with accessible labels
(`BugWiser repository on GitHub`, `BugWiser live build`, …). The jutsu label is
shown as an explicit archive motif (`Jutsu motif · Sand Dominion`) so it can
never read as a project capability.

### Implementation constraints honoured

* One `IntersectionObserver` per encounter, disconnected after the first
  intersection → the reveal plays once and never restarts. Verified by scrolling
  away two viewports and back: `data-active` stayed `true`.
* CSS only (`opacity`/`transform`/`clip-path`/masks). No canvas, no
  requestAnimationFrame, no particle library, no per-frame React state.
* The treatment is also gated on the section reveal phase, so it cannot spend
  itself behind the transition veil.
* Reduced motion: all encounter animations collapse (0 running animations
  > 0.01 s), titles are fully visible (`opacity: 1`), decorative vortex/leaves/
  network layers are `display: none`, and the stage artwork stays composed.
* Semantic structure: `h2` section heading → `h3` per encounter → `h4` archive
  records; all links keyboard reachable in DOM order with the site's focus ring.
* Reading pool: a masked ink gradient behind each record because the HQ
  wallpaper is bright around the lantern and window. Sampled record-region
  luminance after the fix: median 13–23/255 with text highlights up to p90 57
  (a dark, even backdrop for the `ash` body copy).

Evidence: `screenshots/phase65/missions/1366`, `.../390` (per-encounter viewport,
stage and record captures), `screenshots/phase65/frames/final` (timed frames
showing each sequence mid-flight), `screenshots/phase65/verify/report.json`.

---

## 4. E-Invite Editor removed from the Field Archive

* `lib/data/missions.ts`: the `e-invite-editor` entry was removed from
  `archiveProjects`. The archive now holds exactly four records: Financely,
  PhenomCommerce, Podcast Platform, Cara Clothing.
* The Field Archive heading derives its count (`04 records`) from
  `archiveProjects.length`; the mission count chip still reads `04 mission
  records` (four mission encounters, unchanged source).
* The archive grid moved from `lg:grid-cols-3` to two columns so four records
  form a clean 2×2 instead of a 3 + 1 orphan row.
* No other project data, link, description or ownership label was touched.
* `/assets/E-Invite.png` is **not** an orphan: the legacy, unimported
  `components/Projects.tsx` still references it, so the asset was preserved.
  Nothing on the live page references E-Invite any more (`e-invite` absent from
  the rendered section text at every tested viewport).

---

## 5. Preserved

* All Phase 6.4 assets: `mission-hq-cinematic-v3.png` (active), v1/v2/`svg`/`png`
  preserved; `career-archive-chamber-v3.webp` (active) with v1/v2 preserved.
* Experience: Career Ledger, sticky rail, chapter sync, ember sweep, golden fog,
  reveal choreography — untouched.
* Flying Raijin kunai/loader, all four transition identities and their timeline.
* Navbar, Lenis, scroll lock, skip link, grain, world reveal.
* Legacy `components/Projects.tsx` and `MissionCover.tsx` illustrations (still
  the active artwork for the three non-screenshot encounters).

---

## 6. Verification

### Transition regression (production harness, final build)

`scripts/verify-transitions-prod.py` — 8/8 routes at 1366×768 and 8/8 at
390×844, all with the correct identity in both directions, `settledState=None`,
`settledOverlays=0`, `overflowX=-10`, transparent overlay root.
Evidence: `screenshots/phase64/prod/final1366`, `.../final390`.

| Route | Forward | Backward |
| --- | --- | --- |
| Home ⇄ About | flying-raijin | flying-raijin |
| About ⇄ Skills | nature-chakra | nature-chakra |
| Skills ⇄ Missions | rasengan | rasengan |
| Missions ⇄ Experience | shinobi-map | shinobi-map |

### Static checks

* `npx tsc --noEmit` — exit 0.
* `npm run lint` — exit 0 (2 pre-existing `<img>` warnings in
  `components/worlds/SkillsWorld.tsx`, `components/worlds/ValleyOfTheEnd.tsx`).
* `npm run build` — Next 16.2.9 / Turbopack, compiled successfully, 4/4 static
  pages.

### Showcase checks (`scripts/verify-missions-showcase.py`)

At 1920×1080, 1366×768, 390×844, 375×812, 430×932: four encounters in order with
treatments `sand, lightning, scroll, network`; headings and ranks correct; every
stage has `alt`/`aria-label`; 7 in-section links (4 archive + 3 project);
`e-invite` absent; `overflowX = -10`; reduced motion clean; reveal stable.
Report: `screenshots/phase65/verify/report.json`.

---

## 7. Remaining limitations

* **No character artwork.** Gaara/Sasuke were used as art direction only. The
  treatments are original CSS/SVG motif layers over the existing project
  artwork; no copyrighted anime frames, screenshots or character images were
  introduced. Dedicated character art would need separate approval and an
  asset-generation source.
* The page is longer in Missions by design (four cinematic encounters). The
  section is now the tallest on the page.
* The reverse snap intentionally travels about one viewport: showing the
  previous section requires moving one screen; what changed is that it no longer
  travels thousands of pixels to the section top.
* Touch measurements come from Chromium mobile emulation with CDP touch events,
  not a physical handset.
* The record-luminance numbers are a sampled backdrop measurement, not a formal
  WCAG contrast pass.
* Tablet widths 640–1023 retain the existing Missions 66% background crop from
  Phase 6.4; that crop was not re-swept.
* The production sweep still reports high dark-frame percentages on some
  mid-unfold frames (e.g. forward → experience); this is the established
  luminance-sampling artifact of the diagonal unveil, not a black-out — the
  isolated frame captures and settled-state checks pass.
