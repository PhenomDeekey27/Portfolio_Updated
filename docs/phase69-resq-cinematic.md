# Phase 6.9 — ResQ: Wind Release

Scope: **ResQ only.** BugWiser, ENN Consultancy, Saravaraj AI, Home, Skills,
Experience, Contact and the navigation were not changed.

## 1. Recovery findings

The previous pass was interrupted after the components had been written but
before the screenshot source was fixed. On inspection:

- `components/missions/WindReleaseScene.tsx`, `ResQRecord.tsx` and
  `ResQGallery.tsx` existed and compiled, but the gallery still pointed at
  device screencaps that contained a saved contact name, a phone number and a
  real GPS position.
- `app/globals.css` contained the `wnd-*` block. The gallery's neighbour logic
  collapsed every non-active slide to the same depth, so all nine screens were
  visible at 0.45 opacity instead of only the active screen and its two
  neighbours. The portrait deck was also still using the 486 × 1018 ratio.
- `lib/data/resqGallery.ts` described the device captures as frames of the
  running build.
- `docs/phase69-resq-cinematic.md` was an earlier, partly aspirational report
  written before those assets existed.
- A stale `next dev` server was serving cached CSS that did not include the
  newest rules. It was stopped, `.next/dev` was cleared, and validation was run
  against a clean production build on `http://localhost:3000`.

The work below continues from that state; nothing was reset or reverted.

## 2. Privacy-safe screenshot replacement

The device captures were removed entirely:

- deleted `public/assets/missions/resq/live/` (11 frames);
- deleted the old `screenshots/phase69/` evidence that contained them;
- the extracted design-system PNGs in `public/assets/missions/resq/screens/`
  were left untouched.

The gallery now uses only the supplied **design-system PDF** screens. Each one
was inspected at full size first:

| Page | File | Content checked |
| --- | --- | --- |
| 1 | `resq-home-light.png` | Protected home, light. No personal data. |
| 2 | `resq-home-dark.png` | Protected home, dark. No personal data. |
| 3 | `resq-settings-light.png` | Settings, light. Counts and toggles only. |
| 4 | `resq-settings-dark.png` | Settings, dark. Counts and toggles only. |
| 5 | `resq-test-mode.png` | Debug/test mode. Synthetic sensor and confidence values. |
| 6 | `resq-accident-detected.png` | Alert + countdown. No contact data. |
| 7 | `resq-emergency-active.png` | Emergency state. Generic demo hospital names, no phone numbers, no coordinates. |
| 8 | `resq-location-unavailable.png` | Fallback state. An age (“12 min ago”), no position. |
| 9 | `resq-hospital-details.png` | Demo address and phone (`+91 44 5550 0142`, fictional), no real provider or person. |
| 10 | `resq-page10.png` | Logo/identity sheet. Landscape, not a screen. |

**Excluded:** the eleven device frames (real contact name, real phone number,
real coordinates and real nearby providers) and page 10, which is a logo sheet
rather than an application screen and would break the portrait deck.

**Kept and labelled:** pages 1–9 appear as *application interface designs*, not
as APK captures. The gallery heading, the gallery note, every caption and the
record's source line say so explicitly.

## 3. Files changed

- `components/missions/WindReleaseScene.tsx` — full-viewport stage, layered
  wind ribbons/currents, protective formation, pulse, editorial introduction,
  gallery section, record mount.
- `components/missions/ResQGallery.tsx` — portrait floating deck; fixed depth
  decimation; design-screen data source.
- `components/missions/ResQRecord.tsx` — six-part editorial record plus access
  and classification.
- `lib/data/resqGallery.ts` — nine design screens with PDF page numbers,
  captions and alt text.
- `lib/data/missions.ts` — optional `release` link on the mission type; ResQ
  release URL.
- `app/globals.css` — the `wnd-*` block: stage, field, copy, deck, record,
  responsive and reduced-motion rules.
- `scripts/capture-resq-phase69.py` — evidence and behaviour harness.
- `public/assets/missions/resq/live/` — **deleted**.
- `screenshots/phase69/` — regenerated evidence (`validation.json` + frames).
- `docs/phase69-resq-cinematic.md`, `docs/phase69-resq-audit.md` — this report
  and the audit.

BugWiser's files were not modified (`git diff` on `SandDominionScene.tsx`,
`BugWiserCarousel.tsx`, `BugWiserRecord.tsx`, `bugwiserGallery.ts` is empty).

## 4. Wind Release implementation

One `<article class="wnd">` in normal document flow, armed once by the existing
`useEncounterActive` hook. No canvas, no requestAnimationFrame, no per-frame
React state, no scroll listener, no scroll lock. `data-active` flips once and
never replays on small scroll reversals.

Layers, all authored SVG/CSS on a fixed 1440 × 900 viewBox:

1. **Environment** — charcoal gradient with teal/aqua radials and a vignette.
2. **Ribbons** — four long diagonal ribbons with a teal/aqua gradient, drawn
   with `stroke-dashoffset` so they sweep across the stage.
3. **Currents** — five mirrored pairs of thin curved currents converging on the
   centre (ten paths), each with its own delay and duration.
4. **Formation** — three dashed rings plus fourteen gust marks that close into
   a protective circle. The rings rotate very slowly (34–78 s) after settling.
5. **Pulse** — a filled teal disc and a stroked ring expanding from the centre.
6. **Copy** — kicker, `RESQ`, classification, introduction, two field notes and
   the prototype disclaimer. The title unmasks with a clip-path while its
   tracking tightens.

Timeline (one-shot):

| Beat | Time | What happens |
| --- | --- | --- |
| Currents | 0–1.4 s | ribbons and currents draw inward from both edges |
| Formation | 0.4–2.0 s | rings gather, gust marks close rank |
| Pulse | 1.2–3.1 s | teal core and ring expand outward |
| Title | 1.6–2.6 s | `RESQ` unmasks and settles |
| Introduction | 2.0–3.4 s | role, paragraph, notes and disclaimer rise |
| Settled | 2.8 s+ | rank, caption and cue arrive; currents stay calm |

Reduced motion: all entrance animations are skipped, the pulse is hidden, the
rings stop, and the base (settled) composition is shown — title opacity `1`,
clip `none`. There is no character illustration and no Gaara artwork; the wind
formation is the identity.

## 5. Screenshot → caption mapping

| # | Design page | File | Title | Caption |
| --- | --- | --- | --- | --- |
| 01 | 1 | `resq-home-light.png` | Protected home · light | Protection status with motion sensors and location, in the light appearance. |
| 02 | 2 | `resq-home-dark.png` | Protected home · dark | The same protection state in the dark appearance. |
| 03 | 5 | `resq-test-mode.png` | Test mode | Sensor rate, location fix, detection state, confidence and simulation controls. |
| 04 | 6 | `resq-accident-detected.png` | Possible accident detected | A countdown asks whether the user is okay, with cancel and help actions. |
| 05 | 7 | `resq-emergency-active.png` | Emergency active | The emergency state, with a shared location and the nearest hospitals. |
| 06 | 8 | `resq-location-unavailable.png` | Location unavailable | The fallback state when no current position is available, keeping the call action. |
| 07 | 9 | `resq-hospital-details.png` | Hospital details | A hospital record with its address, phone, call and directions actions. |
| 08 | 3 | `resq-settings-light.png` | Settings · light | Appearance, protection, emergency and permission preferences. |
| 09 | 4 | `resq-settings-dark.png` | Settings · dark | The settings structure in the dark appearance. |

The record reuses pages 1, 2, 5, 6, 7, 8 and 9 as captioned insets and names
the page in each caption.

### Where the designs and the build differ

The record states the implementation only from the repository source, and flags
the places where the design mockups are ahead of it:

- The design's alert countdown shows 28 s; the code defaults to 10 s at
  `POSSIBLE` and 5 s at `HIGH_CONFIDENCE`, configurable in settings.
- The design's emergency screen describes contacts seeing a “live location”;
  the release build sends one position line in the alert SMS, not continuous
  tracking.
- The hospital names, address and phone in the design are demo content. In the
  build, results are labelled “Not verified” and Call/Directions appear only
  when the provider returned a phone or coordinates.
- The build's resource-details screen was not captured, so page 9 is shown as a
  design reference.

## 6. Gallery behaviour and measurements

- Nine screens stay mounted; changing index is a transform/opacity transition.
- Active screen full size, neighbours at ±62 % offset, −190 px z, ±13° rotateY,
  0.86 scale, 0.45 opacity, dimmed overlay. Further screens are mounted at
  opacity 0 so they cannot stack up.
- Autoplay 2,000 ms, single interval. Pauses on hover, on `:focus-visible`
  inside the carousel, during a touch gesture, when the deck is out of view and
  when the tab is hidden. Status reads `Auto · 2s` / `Paused` / `Manual`.
- Prev/next buttons, nine dot indicators, ArrowLeft/ArrowRight, touch swipe.
- Reduced motion: no autoplay, no perspective/transition; manual controls work.
- Non-active images lazy-load; the frame reserves `813 / 1759`; alt text
  describes each design.

Measured intervals (2 per viewport, from live DOM changes):

| Viewport | Active frame | Deck | Intervals |
| --- | --- | --- | --- |
| 1920 × 1080 | 409 × 886 | 980 × 886 | 1976 ms, 2060 ms |
| 1366 × 768 | 291 × 630 | 980 × 630 | 2059 ms, 1979 ms |
| 430 × 932 | 324 × 700 | 390 × 700 | 1973 ms, 2051 ms |
| 390 × 844 | 304 × 658 | 350 × 658 | 1976 ms, 2075 ms |
| 375 × 812 | 293 × 633 | 335 × 633 | 1980 ms, 2064 ms |

Controls at every viewport: hover held (`Paused`), next/prev advanced, dot 5
selected `05 / 09`, ArrowRight advanced one step. Swipe advanced `06 / 09` →
`07 / 09` at 430, 390 and 375.

## 7. Continuity and responsive results

- Stage, gallery and record all compute to `rgb(7, 8, 6)`; the next encounter is
  `enn-consultancy`, so there is no strip or colour jump at the boundary.
- The gallery has an opaque background, so no other scenery shows through the
  deck.
- Horizontal overflow: `scrollWidth − innerWidth = −10 px` at all five
  viewports.
- No page errors were recorded in any run.
- The title renders at 184 px (1920), 177.6 px (1366) and 63.8–73.1 px on
  phones.
- The active portrait screen keeps its own ratio at every size (409 × 886 down
  to 293 × 633) — no stretching, no landscape cropping.

## 8. Validation commands

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | pass, 0 errors |
| `npm run lint` | pass, 0 errors; only the two pre-existing `no-img-element` warnings in `SkillsWorld.tsx` and `ValleyOfTheEnd.tsx` |
| `npm run build` | pass (Next.js 16.2.9), `/` prerendered |

Evidence: `screenshots/phase69/<viewport>/` (`scene-01-currents` …
`scene-15-technical`, `reduced-01-gallery`) and
`screenshots/phase69/validation.json`.

## 9. Remaining limitations

- The gallery shows design-system screens, not captures of the released APK.
  No genuine, privacy-safe build capture exists in the project, and no Android
  emulator or SDK is installed on this machine to produce one.
- Because the screens are designs, the countdown, “live location” wording and
  hospital data do not match the implemented behaviour; the record says so
  rather than presenting the mockups as shipped UI.
- The design system contains no screen for the build's resource-details state,
  so that screen is described, not shown.
- The wind field is a stylised SVG/CSS composition, not a physics simulation.
- The slow ring rotation continues after settling; reduced motion stops it.
