# Phase 6.12 — Hokage Contact Redesign

**Date:** 2026-11-17  
**Build:** production (`npm run build && npx next start -p 3000`), Next.js 16.2.9 (Turbopack), static `/`.  
**Scope:** Stages A–G of the Phase 6.12 brief (Skills/Missions environment audit, Experience ↔ Contact "Hokage Message Summoning" identity, Hokage Communication Chamber, parchment transmission form, validation, report).

---

## 1. Stage A — environment audit and root cause

### What the brief asked to prove

> "identify exactly why the Skills Training Grounds background still appears in the Missions/project encounter area"

### Audit result (measured, contradicts the premise)

The Skills plate **never** painted inside Missions or a project encounter. Evidence (Playwright, production build, 1366×768, intro skipped, Lenis driven by wheel; 9 offsets sampled inside `#missions` from the section header to ~78% through its scroll range):

| Sample | `section` in view | `data-world-asset` | band top / height |
| --- | --- | --- | --- |
| missions-header | missions | `/assets/missions/mission-hq-cinematic-v3.png` | 0 / 768 |
| missions-encounter-1 (~18%) | missions | `/assets/missions/mission-hq-cinematic-v3.png` | 0 / 768 |
| missions-encounter-2 (~45%) | missions | `/assets/missions/mission-hq-cinematic-v3.png` | 0 / 768 |
| missions-encounter-4 (~78%) | missions | `/assets/missions/mission-hq-cinematic-v3.png` | 0 / 768 |

Across all six required viewports (1920×1080, 1366×768, 1024×768, 430×932, 390×844, 375×812) and every Missions encounter sample, the only environment intersecting the viewport inside Missions was the Mission HQ plate. The Skills plate (`/assets/skills-training-grounds-cinematic.png`) was never observed on any non-`skills` section (`scripts/capture-phase612.py`, 0 errors).

### Real root cause found and fixed

**`#skills` could not pin its environment band.** `components/Skills.tsx` used `overflow-hidden` on the section root. In CSS, `overflow: hidden` establishes a scrollport, so the 100lvh sticky band inside it became sticky to the *section* rather than the document — it rode up with the section and scrolled away, leaving ~1,100 px of flat `#0a120d` body background visible inside the long Skills run. Measured before the fix (ad-hoc probe, 1366): the band top equalled the section top (e.g. +128 px) instead of 0, and drifted with scroll.

This is the same failure mode already corrected on About/Missions/Experience; Skills was the outlier.

**Fix:** `components/Skills.tsx` — section root `overflow-hidden` → `overflow-clip`. `overflow-clip` preserves clipping without creating a scrollport, so the sticky band pins to the document viewport exactly as in the other plate sections. After rebuild: `skills-mid` band `top: 0, h: <viewport>` at 1366 (and all validated viewports once sampled inside the section), and the band releases only at the section end as intended.

### Environment registry and build-time validation

- **`lib/worlds/environments.ts`** — extended to all six sections (`home`, `about`, `skills`, `missions`, `experience`, `contact`) in scroll order. Each entry carries `id`, `label`, `scene`, `kind: "plate" | "inline"`, and `plate?`. `SECTION_ENVIRONMENT_ORDER` drives iteration; duplicate ids, duplicate plates, duplicate scenes and mismatched order throw at module evaluation. `environmentAssetTag(section)` returns the plate path or `inline:<scene>` (Contact = `inline:hokage-communication-chamber`).
- **Plate ownership moved into the registry:** `components/worlds/ValleyOfTheEnd.tsx` (`--valley-backdrop`), `components/worlds/HiddenLeafStage.tsx` (`--hidden-leaf-photo`), `components/Experience.tsx` (`--exp-plate` on `.exp-archive-image`, `app/globals.css` now reads `var(--exp-plate, none)`), `components/worlds/SkillsWorld.tsx` and `components/worlds/MissionsWorld.tsx` all read from `SECTION_ENVIRONMENTS.*.plate`. No plate path remains hardcoded in a renderer.
- **`scripts/validate-world-environments.mjs`** — scans `app/`, `components/`, `lib/` (`.ts/.tsx/.js/.jsx/.mjs/.cjs/.css`) and fails the build if any registered plate filename appears outside `lib/worlds/environments.ts`. Wired as `"validate:worlds"` and `"prebuild"` in `package.json`. It caught and forced the removal of a plate filename from a doc comment in `MissionsWorld.tsx`. Current result: `✓ worlds: 5 unique environment plates, 91 source files scanned, no cross-section reuse.`

**Note:** this guards against path/asset reuse. It cannot prove that a component never mounts in the wrong section at runtime; the runtime ownership check for that is the per-viewport `data-world-asset` probe in Stage F (below), which found no cross-section painting.

---

## 2. Asset-to-section mapping

| Section | Environment identity | Kind | Asset / tag |
| --- | --- | --- | --- |
| Home | Konoha Landing | plate | `/assets/hidden-leaf-village.jpg` |
| About | Valley of the End | plate | `/assets/valley-of-the-end-wide.png` |
| Skills | Training Grounds | plate | `/assets/skills-training-grounds-cinematic.png` |
| Missions | Hidden Leaf Command | plate | `/assets/missions/mission-hq-cinematic-v3.png` |
| Experience | Career Archive | plate | `/assets/experience/career-archive-chamber-v3.webp` |
| Contact | Hokage Communication Chamber | inline (original SVG) | `inline:hokage-communication-chamber` (`data-world-asset`) |

All five plates are unique and owned only by the registry. Contact is a purpose-built inline scene (no raster plate) — see Stage C.

---

## 3. Stage B — Hokage Message Summoning (Experience ↔ Contact)

### Design

A **scroll-seal / parchment / ink** identity distinct from every other route: no kunai, rasengan, nature chakra, elemental seam, or black interstitial. Palette: parchment (`#f0e0ba` / `#d8b97a`), vermillion/chakra gold (`#c84a24` / `#d8a23c`), ink (`#1a1410`), warm dusk (`#22150c`).

**Forward (Experience → Contact):** the route map folds inward along two crease lines → chakra routes gather to the center → a golden seal ignites and pulses → ink motes drift on a warm wind gust → a parchment scroll unfurls with two rollers → the warm veil parts to reveal the Contact chamber. Phases ride the existing controller timeline: `COVERING → KUNAI_DESCENT → SEAL_ACTIVATION → TELEPORT_FLASH → WORLD_SWITCH → ARRIVAL` (1.6 s total, scroll locked for the sequence).

**Reverse (Contact → Experience):** the same composition runs with `animation-direction: reverse` (`.hs-reverse`), so the scroll refolds and the veil closes; the seal uses `hs-seal-dissolve` (counter-rotating fade) and the chakra routes use `hs-routes` (stroke draw) so the return reads as the seal dissolving back into route lines rather than a mirrored ignition.

### Implementation

- **`components/transitions/HokageSummonTransition.tsx`** (new): 2 map panels, 2 crease lines, 1 gather field, 1 seal (3 SVG rings + core + pulse), 24 deterministic ink motes, 3 wind gusts, 3 route paths, 1 scroll sheet (2 rollers, header, rule, 5 script lines, footer seal), 1 flash, 1 warm `WorldUnveil` (`from` `#24170f` → `to` `#2e2014`, `direction="up"` forward / `"down"` reverse). Renders `data-testid="hokage-summon-transition"` and `data-teleport-direction`. Reduced motion renders only the warm veil.
- **`lib/transitions/identity.ts`**: `sectionToWorldId` maps `experience` → `experience`, `contact` → `contact`; `resolveSectionTransition('experience','contact')` → `hokage-summon` forward, the reverse → `hokage-summon` backward.
- **`components/transitions/TeleportationController.tsx`**: renders `<HokageSummonTransition>`.
- **`app/globals.css`**: ~1,050 lines appended — `.hs-*` layers, 15 `@keyframes hs-*`, `@media (prefers-reduced-motion: reduce)` hiding every moving layer except the veil, and `.world-veil-scroll` (radial gold core + warm parchment gradient).

No new dependencies, no 3D, no canvas/WebGL. The identity plugs into the existing `useTeleportation` phase machine, so it inherits the shared scroll lock, phase timing, focus management, and cleanup.

### Behavioural guarantees (verified)

- Forward lands at Contact top (1366: `y 23974`, `contactTop 1`); reverse lands at the Experience viewport (1366: `y 23206`). No stuck overlay, no scroll lock, `strayOverlays 0` after both directions (1366 and 390).
- The veil is a warm parchment tint (never pure black) and the sequence never drops to a black interstitial; the warm `WorldUnveil` is the only full-frame cover.
- `overflowX -10`, sideways scroll attempt stays at `0` at every sampled viewport/sample (document does not move horizontally).

---

## 4. Stage C — Hokage Communication Chamber

**`components/worlds/ContactWorld.tsx`** + **`app/contact-world.css`** (imported in `app/layout.tsx`), `aria-hidden`, `data-world-asset="inline:hokage-communication-chamber"`.

An original inline SVG scene (CSS/SVG only, no raster, no stock/internet asset): a large arched window overlooking Konoha at dusk — Hokage Rock cliff with three faces, a layered village roofline with lit windows, warm sky gradient and a crescent — flanked by dark wooden posts and a header beam. Foreground: two hanging scrolls, two lanterns on a side ledge casting a warm beam, a polished desk with an ink set, and a crimson "火" banner. Layers: sticky full-viewport band, a cool-to-warm sky wash, a left lantern-grade, a bottom desk-grade, and a soft vignette so body copy stays readable over the parchment form; two dust motes drift on desktop and are suppressed under reduced motion and on small screens (replaced by a heavier grade). Mobile keeps the window centred and grades strengthened.

No approved painted background existed, so the rendered identity is this inline SVG. **`docs/contact-chamber-image-brief.md`** specifies the optional plate (`public/assets/contact/hokage-chamber-cinematic.png`, ~2400×1500), art direction (Hokage comms room at dusk, lantern light, wooden architecture, village view, gold/charcoal/ivory/restrained crimson, no characters/text/logos/UI), negative guidance, and the one-line registry switch (`scene` + `kind: "plate"` + `plate` path) — no component changes required.

---

## 5. Stages D & E — Contact redesign and transmission form

**`components/ContactUs.tsx`** rewritten; styles in `app/contact-world.css` (`.ctc-*` layout/records, `.tx-*` form).

- **Heading:** `Every great mission begins with a message.` (exact). **Copy:** "Have a product, a difficult integration or an opportunity in mind? Send a transmission. I'll read it personally."
- **Communication records (E):** email, phone, location rendered as labelled channels with separators and a restrained gold accent — values taken verbatim from the existing source (`krangwani917@gmail.com`, `+91 9307604597`, `Thane, Maharashtra, India`). **No contact details invented.** "END OF TRANSMISSION" insignia closes the stack.
- **Parchment scroll form (D):** a scroll-sheet (top/bottom rollers, warm-paper gradient, ruled body) — not a card. Fields: Shinobi Name, Communication Scroll (email), Contact Frequency (tel), Mission Brief (textarea), all with labels, required semantics, and focus styling. A leaf seal sits at the scroll head; the submit control carries a seal pulse on hover/focus.
- **Submission integrity (preserved, not faked):** endpoint `https://api.web3forms.com/submit`, `access_key` value, field names, and the `fetch`/`response.json()`/`data.success` handling are unchanged from the prior implementation. A `status` state (`idle | sending | sent | error`) gates the UI: the "Transmission sealed." stamp renders **only** when the real response reports `success === true`; a non-success response (or a thrown fetch error) renders an inline `role="alert"` with the server message or a clear fallback — nothing is marked sealed on failure. No backend was added and no successful submission is fabricated.

---

## 6. Stage F — validation

**Automated harness:** `scripts/capture-phase612.py` (Python Playwright) against the production server on `:3000`. It skips the intro, drives Lenis by wheel for environment samples and by nav-click for transitions, samples per-viewport `data-world-asset`, band pinning, gap, overflow, broken/failed image loads, console/page errors, transition phases/direction/arrival/lock/overlay cleanup, other-route identity regression (forward chain home→about→skills→missions→experience), the real form path via `page.route` stubbing (success + failure), and reduced motion (`prefers-reduced-motion: reduce`, tight 18 ms polling because the collapsed sequence is ~280 ms). Output: `screenshots/phase612/validation.json`, per-viewport PNGs, transition JPGs, form/reduced screenshots.

**Final harness result:** `errors: 0` (all 6 viewports, both transition directions at 1366 & 390, identity regression, form, reduced motion).

| Check | Result | Evidence |
| --- | --- | --- |
| Skills plate never appears in Missions / project encounters | **Pass** | Every Missions sample (header, ~18%, ~45%, ~78%) at 1920/1366/1024/430/390/375 painted only `mission-hq-cinematic-v3.png`, band `top 0`; no non-`skills` sample ever painted the skills plate. |
| Every section paints its own environment identity | **Pass** | `data-world-asset` matched `SECTION_ENVIRONMENTS` per section at every sample (home/about/skills/missions/experience plates, contact inline tag). |
| Experience → Contact plays Hokage Message Summoning | **Pass** | 1366 & 390: `data-testid=hokage-summon-transition`, direction `forward`, scroll/veil/seal layers present, arrival `contactTop 1` (1366 `y 23974`). |
| Contact → Experience plays the reverse of the same identity | **Pass** | 1366 & 390: same testid, direction `backward`, arrival `y 23206` (Experience viewport), overlay/lock cleared. |
| Other route identities unchanged | **Pass** | Forward chain saw `flying-raijin` (home→about), `nature-chakra` (about→skills), `rasengan` (skills→missions), `shinobi-map` (missions→experience); `hokage-summon` never appeared on those routes. |
| No sudden black screen | **Pass (by construction + observation)** | Warm parchment `WorldUnveil` (`#24170f→#2e2014`), no black flash element; no black interstitial observed in captured frames. |
| No scroll jump after arrival | **Pass** | Forward lands within 1 px of Contact top; reverse returns to the Experience viewport; final `strayOverlays 0`. |
| No stuck overlay / no scroll lock | **Pass** | `locked false`, overlay absent after both directions and after reduced-motion run. |
| No horizontal overflow | **Pass** | `scrollWidth - innerWidth = -10` and a forced `scrollTo(320,…)` left `scrollX 0` at every sample/viewport. (Wide decorative full-bleed layers are clipped by their sections by design and were recorded separately, not treated as document overflow.) |
| Contact form real submission path works (success + failure) | **Pass (stubbed)** | Routed `api.web3forms.com/submit`: `{"success":true}` → "Transmission sealed" stamp (`success_state: true`); `{"success":false,"message":"Invalid access key"}` → inline `role="alert"` "Invalid access key" (`failure_state: "Invalid access key"`). No live endpoint was called. |
| Reduced motion renders without moving layers | **Pass** | `prefers-reduced-motion: reduce`, 1366: 2 frames captured, states `COVERING/KUNAI_DESCENT`, map/gather/seal/ink/scroll/flash all `display:none`, veil present, `running_animations 0`, dust `none`, overlay/lock cleared. |
| Environment does not obscure the copy | **Pass (structural)** | Chamber grades (`.ctc-grade-left/.ctc-grade-bottom/.ctc-vignette`) and a solid parchment form surface keep copy off the scene; confirmed in 1920/1366/1024/430/390/375 captures. (No automated contrast ratio computed.) |
| No missing assets / no hydration errors | **Pass** | `broken_images []`, `console_errors []` at every viewport (lazy offscreen `<Image>`s treated as not-broken only when `complete && naturalWidth===0` is false). |

**Type / lint / build (final code):**

- `npx tsc --noEmit` — exit 0.
- `npm run lint` — exit 0 (2 pre-existing `@next/next/no-img-element` warnings in `components/worlds/SkillsWorld.tsx` and `components/worlds/ValleyOfTheEnd.tsx`, unchanged by this phase).
- `npm run build` — success (`prebuild` validator `✓ worlds: 5 unique environment plates, 91 source files scanned, no cross-section reuse`; compiled, typecheck, static `/` prerendered).

---

## 7. Stage G — before/after screenshots

| View | Before (phase 6.11 baseline) | After (phase 6.12) |
| --- | --- | --- |
| Contact 1920 | *(not present in `screenshots/phase611/1920`; phase611 captured missions/resq/seams only)* | `screenshots/phase612/after/contact-1920.png`, `contact-1920-form.png` |
| Contact 390 | *(not present in `screenshots/phase611/390`)* | `screenshots/phase612/after/contact-390.png`, `contact-390-form.png` |
| Skills 1920 | *(no phase611 contact/skills baseline shot available)* | `screenshots/phase612/1920/skills-mid.png` (pinned band, own plate) |
| Missions 1920 | *(no phase611 missions-encounter baseline in that set)* | `screenshots/phase612/1920/missions-encounter-2.png` (HQ plate only) |
| Transition forward | — | `screenshots/phase612/after/transition-forward.jpg` |
| Transition reverse | — | `screenshots/phase612/after/transition-backward.jpg` |
| Form sealed (real success path, stubbed) | — | `screenshots/phase612/after/form-sealed.png` |
| Form error (real failure path, stubbed) | — | `screenshots/phase612/after/form-error.png` |
| Reduced motion | — | `screenshots/phase612/after/reduced-transition.png` |

Full per-viewport sample sets live under `screenshots/phase612/<width>/`.

---

## 8. Files changed / added

| File | Change |
| --- | --- |
| `lib/worlds/environments.ts` | Extended to all 6 sections; `kind`/`scene`/`plate`, `environmentAssetTag`, `SECTION_ENVIRONMENT_ORDER`, duplicate guards. |
| `components/Skills.tsx` | `overflow-hidden` → `overflow-clip` (pins the Skills environment band). |
| `components/worlds/SkillsWorld.tsx` | Plate read from `SECTION_ENVIRONMENTS.skills`. |
| `components/worlds/MissionsWorld.tsx` | Plate read from registry; doc comment no longer names a plate file. |
| `components/worlds/ValleyOfTheEnd.tsx` | `--valley-backdrop` from `SECTION_ENVIRONMENTS.about.plate`. |
| `components/worlds/HiddenLeafStage.tsx` | `--hidden-leaf-photo` from `SECTION_ENVIRONMENTS.home.plate`. |
| `components/Experience.tsx` | Publishes `--exp-plate` + `data-world-asset` from registry. |
| `app/globals.css` | `.exp-archive-image` uses `var(--exp-plate, none)`; appended `.hs-*` Hokage Summon layers/animations, `.world-veil-scroll`, reduced-motion overrides. |
| `components/transitions/HokageSummonTransition.tsx` | **New.** Experience↔Contact identity (forward/reverse, reduced-motion veil-only). |
| `lib/transitions/identity.ts` | `experience`/`contact` world ids; `hokage-summon` for `experience↔contact`. |
| `components/transitions/TeleportationController.tsx` | Renders `HokageSummonTransition`. |
| `components/worlds/ContactWorld.tsx` | **New.** Inline SVG Hokage Communication Chamber. |
| `app/contact-world.css` | **New.** Chamber layout/grades/lantern/dust + parchment transmission form (`.ctc-*`, `.tx-*`). |
| `app/layout.tsx` | Imports `./contact-world.css`. |
| `components/ContactUs.tsx` | Rewritten: records, parchment scroll form, `status` (`idle/sending/sent/error`), sealed/error states; submission path/endpoint/access key preserved. |
| `scripts/validate-world-environments.mjs` | **New.** Build-time plate-reuse/ownership guard. |
| `package.json` | `validate:worlds`, `prebuild`. |
| `scripts/capture-phase612.py` | **New.** Stage F validation harness. |
| `docs/contact-chamber-image-brief.md` | **New.** Brief for the optional painted chamber plate. |
| `docs/phase612-hokage-contact-redesign.md` | **New.** This report. |

---

## 9. Remaining limitations

1. **Contact is a vector/inline chamber, not a painted plate.** No approved painted background existed and none was silently substituted. The rendered scene is the original SVG in `ContactWorld.tsx`; `docs/contact-chamber-image-brief.md` gives the art direction and the exact registry switch to adopt `public/assets/contact/hokage-chamber-cinematic.png` later (one registry edit, no renderer changes).
2. **The form was not exercised against the live web3forms endpoint.** The harness stubbed `https://api.web3forms.com/submit` to prove the real client path seals only on `success:true` and surfaces a failure otherwise; no `access_key` validity or deliverability was verified.
3. **Before screenshots are incomplete.** `screenshots/phase611/` did not contain Contact/Skills/Missions encounter baselines at the named paths, so the "before" column could not be fully populated from prior captures; after-shots and the full per-viewport set are provided instead.
4. **Headless capture constraints.** The intro depends on WebGL (skipped programmatically in the harness); the reduced-motion sequence is ~280 ms so only 2 frames were capturable by polling; one earlier ad-hoc capture produced a uniform frame treated as a capture artifact (not a DOM state) — the recorded harness run is clean (`errors: 0`, no console/page errors).
5. **`overflow-clip` on `#skills`.** Matches the pattern used by the other plate sections and fixes pinning, but any future child that relies on being a scroll container inside Skills would need the same treatment as those sections.
6. **Contrast not numerically measured.** Readability over the chamber was verified structurally (grades + solid parchment form surface) and by screenshot review at 1920/1366/390; no automated WCAG contrast ratio was computed.
7. **Work is uncommitted.** All Phase 6.12 changes remain in the working tree.

---

## 10. Summary

- The reported "Skills plate leaks into Missions" condition was **not reproduced**: Missions painted only its own HQ plate at every sampled offset and viewport. The actual Stage A defect was an **unpinned Skills environment band** (`overflow-hidden` creating a scrollport), fixed with `overflow-clip` and guarded by a whole-project environment registry plus a `prebuild` reuse validator.
- Experience ↔ Contact now uses the **Hokage Message Summoning** identity (map fold → gather/seal → ink/wind → scroll unfurl, reverse refold/dissolve into routes) — warm, CSS/SVG-only, no black flash, no scroll jump, no stuck overlay/lock, reduced-motion veil-only — without altering the other route identities.
- Contact is a **Hokage Communication Chamber** (inline SVG, lantern/wood/village-dusk) with a **parchment transmission scroll** form and communication records; the real web3forms submission path is preserved and only seals on a genuine success response.
- `scripts/capture-phase612.py` → **0 errors** across 6 viewports; **tsc 0**, **lint 0** (2 pre-existing warnings), **build success** with the environment validator passing. Remaining gaps are documented honestly above (vector-not-painted chamber, stubbed form endpoint, incomplete "before" baselines, no numeric contrast metric).
