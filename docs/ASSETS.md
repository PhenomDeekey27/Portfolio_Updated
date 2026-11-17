# Asset research — Hokage Rock / Hidden Leaf

## PART 1 — Research log

### Candidate 1 — Six Hokage Mountain (SELECTED for background)
- Source: https://sketchfab.com/3d-models/six-hokage-mountain-c9cc3357a6ee46c2bff49c94e409fa99
- Author: jmartinez20592 (JMARTZ504)
- Format available: Downloadable 3D Model (GLB / scene) via Sketchfab; API reports 307.7k triangles, 179.1k vertices.
- License (as listed by Sketchfab): Creative Commons Attribution (CC BY 4.0) — http://creativecommons.org/licenses/by/4.0/
- Views / downloads at research time: 10,618 views, 3,080 downloads, "Download 3D Model" offered.
- Actual asset used in this repo: `public/assets/hokage-rock.jpg` — the model's official 1920×1080 preview thumbnail from Sketchfab's CDN:
  https://media.sketchfab.com/models/c9cc3357a6ee46c2bff49c94e409fa99/thumbnails/f236f5d6837b4acba06b7e0a748b2902/94247063087a40bd984f2c295383ebb5.jpeg
- Embed (live 3D scene): https://sketchfab.com/models/c9cc3357a6ee46c2bff49c94e409fa99/embed
- Attribution: credit is shown in the About section footer and links to the model page, as required by CC BY.
- IP note: CC BY covers the artist's 3D work only. It does NOT clear underlying *Naruto* IP rights (Hokage Monument design, characters). This image is used only as a fan-art / personal-portfolio background; no claim is made of Naruto IP ownership or licensing.

### Candidate 2 — Hokage Rock Faces Hashirama & Tobirama (not used)
- Source: https://sketchfab.com/3d-models/hokage-rock-faces-hashirama-tobirama-651b82a02b8741b3a420406e8a8ddf18
- Author: GremorySaiyan
- Format: FBX with base + normal textures, 16.9k triangles, downloadable.
- License: Creative Commons Attribution (CC BY 4.0).
- Reason not selected: Only two faces, FBX (needs conversion to GLB for Three.js), no full mountain / village composition. Kept as alternate reference.

### Why an image instead of a GLB in the live scene?
- Sketchfab's `/download` API requires OAuth; anonymous download of the full GLB/FBX is not available in this environment (verified: `GET /v3/models/<uid>/download` returns unauthorized without a token).
- Per the brief ("If a suitable 3D asset cannot be obtained, use a high-quality landscape image as a temporary background rather than creating ugly placeholder geometry"), the official render is used as a photographic-grade backdrop (recognizable sculpted faces, not CSS circles), composited with the existing village environment for rooftops, trees, clouds and atmosphere.
- The live Sketchfab embed is linked in the attribution so the full interactive 3D model remains available.

### Phase 2.2.2 update
- `AboutWorld` now uses **only** this monument image (Hidden-Leaf village layer removed). Displayed with `object-contain object-top` so all six faces are visible without cover-cropping. One consistent background across the section; text sits on the dark gradient below the monument (spacer `38–52vh`) so type never obscures faces. Attribution retained in the footer.

### Village environment (pre-existing)
- `public/assets/hidden-leaf-village.jpg` — low-poly Konoha-style village panorama (rooftops, torii, trees, mountains, sunset). Used as the lower composition layer for rooftops / framing trees / cinematic depth.
- Hidden Leaf 3D world (`components/worlds/HiddenLeafWorld/`) remains the live WebGL scene for Home; unchanged by this fix.

## Missions archive (Phase 5)

### Mission room environment
- **Active background (Phase 5.5): `public/assets/missions/mission-hq-cinematic.png`** — 1672×941 raster background, rendered as a sticky `100lvh` CSS background by `components/worlds/MissionsWorld.tsx`. Composition spec: a Hidden Leaf ANBU briefing room at night, post-and-beam construction, shoji screens and a ranma transom, carved leaf plaque on the rear wall, warm paper lantern light from the upper right, shelving with scrolls, and a low table in the lower third. The camera is deliberately off-centre (subject right of centre) so the left-hand column stays readable under the scrim for the dossier text.
- `public/assets/missions/mission-hq.svg` — original vector artwork made for this project (wooden table, Land of Fire map, scrolls, shelving, leaf insignia, lanterns, ninja equipment). No third-party imagery, no client branding. **Preserved as the editable source/fallback; it is no longer the rendered background.**

### Dossier covers
| Mission | Cover | Source |
| --- | --- | --- |
| BugWiser | `public/assets/missions/bugwiser-live.png` | **Actual live-app screenshot** captured from `https://bug-wiser.vercel.app/` (verified reachable). Not a mockup. |
| ResQ | `components/missions/MissionCover.tsx` (`emergency`) | Original SVG illustration: phone beacon, sensor waveform, GPS ring. Used because the project is an Android app with no authorized public screenshot. |
| ENN Consultancy | `components/missions/MissionCover.tsx` (`automation`) | Original SVG illustration: CRM / messaging / document workflow nodes. Used instead of inventing client branding or a fake dashboard. |
| Saravaraj AI | `components/missions/MissionCover.tsx` (`outreach`) | Original SVG illustration: multi-channel outreach network and voice waveform. Used instead of inventing client branding or a fake dashboard. |

Client projects (ENN Consultancy, Saravaraj AI) are client-owned platforms. Their covers are explicitly illustrative — no client logos, screenshots, metrics or claims are fabricated. The cards state that the platform is client-owned and expose no outbound link.

### Transition concepts (recorded)
- **Nature Chakra Awakening** (About → Skills, Phase 5.2): golden leaves gather toward the centre, nature-chakra glow travels through them, leaves sweep across the viewport to progressively reveal the training-ground background. Gold + ivory only; no kunai, Rasengan, sphere, or circular portal.
- **Mission Scroll Dispatch** (Skills → Missions, future): a sealed mission scroll enters the viewport, a restrained gold seal glow appears, the scroll unrolls diagonally, its parchment progressively reveals the ANBU briefing-room background, then the Missions heading and dossier cards appear in sequence. Distinct from Nature Chakra Awakening, Flying Raijin and Rasengan.
- `public/assets/missions/mission-hq.svg` was rewritten as a traditional Hidden Leaf ANBU briefing room: post-and-beam construction, shoji screens, ranma transom, engawa railing, carved leaf plaque, night forest, distant village rooftops, warm lantern, low walnut table, Land of Fire map, rolled scrolls, sealed documents, kunai, inkstone/brush, dust motes. Removed generic office/HUD treatment. The Phase 5.5 raster replacement (`mission-hq-cinematic.png`) carries the same composition at photographic depth; the SVG remains in the repo as its source/fallback.
- The lantern light cone is now a soft radial gradient instead of a hard polygon.
- No third-party or copyrighted imagery; hand-authored SVG (image generation quota exhausted).
- `components/Missions.tsx`: section padding moved from the section to the inner content wrapper (no negative margins / blind cuts); section `overflow-hidden` → `overflow-clip` so the sticky environment actually tracks the viewport and covers the section from top to bottom.
- `components/worlds/MissionsWorld.tsx`: sticky height now `100lvh` for full mobile coverage; scrims no longer terminate in solid black, so no black bands remain during scroll.
- Backdrop filters and opaque blur removed from dossier cards, chips, ranks, badges and summary; surfaces raised; cover brightness increased; Repository action made prominent; repeating-line paper texture removed.
- Performance: measured (390×844, 4× CPU throttle, 140 frames × 5px): 39.08 → 19.30 ms/frame avg, p95 77.3 → 29.7 ms, long tasks 8 → 0. Root cause was `backdrop-filter` (blur 2–8px on four cards + chips/rank/badges/summary + Navbar). SVG decode, dust animation and background removal were comparatively small; global `.grain` (page-wide, out of scope) still costs ~0.5 ms in this isolated test.

## Phase 6.4 — cinematic environment and Flying Raijin weapon upgrade

No image-generation model is available in this environment (the Phase 5 quota note above still applies), so the new assets are **original hand-authored vector artwork** rather than generated photographs. The Experience scene is rendered to raster locally with `scripts/render-scene.py`; the kunai stays inline SVG so the loader and transition have no image decode. Nothing is a placeholder and no third-party or unrelated image is substituted.

### Missions — active background v3
- **Active: `public/assets/missions/mission-hq-cinematic-v3.png`** — 1672×941 RGB, 1.91 MB, SHA-256 `8d845be692cb6fea…` (full hash in `screenshots/phase64/missions/report.json`). Composition: circular Hokage window at the far right, warm lanterns, scroll shelving, mission table, dark left/central negative space.
- Preserved unchanged: `mission-hq-cinematic.png` (v1), `mission-hq-cinematic-v2.png`, `mission-hq.svg`, and `mission-hq.png`.
- Selection evidence: `scripts/compare-missions-bg.py` applies each variant to the live layer and measures heading/intro contrast plus the text band at 1920×1080, 1366×768 and 390×844. v3 was the richest composition that stayed readable; full numbers and per-viewport plates are in `screenshots/phase64/missions/report.json`.
- `components/worlds/MissionsWorld.tsx`: only the active `background-image` URL and responsive positioning/scrims changed. `bg-cover`, the sticky `100lvh` world layer and the dust field are untouched.
- Background positions: `74% 50%` mobile, `66% 50%` 640–1023px, `center` ≥1024px. The 16:9 asset fits the 1920×1080 and 1366×768 frames almost exactly, so the desktop crop is composition-neutral. On portrait `74%` brings the circular Hokage window and the mission table's leaf banner into frame rather than hiding them; a mobile-only top scrim band keeps the heading/intro over dark pixels (measured AA-passing: heading p95 10.09, intro p95 5.34 in `screenshots/phase64/missions/report.json`). Further right (78–86%) puts the window's bright sky behind the intro and fails AA.
- Mobile scrim: a portrait-only `sm:hidden` top band (`0.14 → 0.42 → 0.14` over the first 56% of the viewport) was added for that richer crop; the desktop scrim stack is unchanged.

### Experience — the Career Archive
- **Active source art: `public/assets/experience/career-archive-chamber-v3.svg`** (editable, original, 517 KB). Active rendered asset: `public/assets/experience/career-archive-chamber-v3.webp` — 2560×1440 WebP, 52 KB. Preserved previous candidate: `career-archive-chamber-v2.svg` / `.webp` (43 KB); the earlier `career-archive-chamber.svg` / `.webp` remain as the v1 fallback.
- Scene (v3): a symmetrical archive chamber — deep central arch with a seal banner, matching record shelves left and right with individually lit spines and document boxes, one red hanging banner for colour, warm lantern pools at the shelf ends and a shadowed reading floor. The arch keeps the ledger's left column over near-black pixels while the right-hand shelving gives the room parallax-free depth. No text, logos, faces or characters.
- Selection evidence: `scripts/capture-experience-v3-compare.py` injects v2 at the identical computed `background-position` and captures the pair at 1366×768 and 390×844; `screenshots/phase64/experience/report.json` holds the active-crop contrast and the portrait crop sweep (50–86%). v3 was kept because it reads richer without lowering any measurement below the accepted floor.
- `components/Experience.tsx`: the sticky `100lvh` archive layer (image + contour overlay) is unchanged. The Career Ledger markup, sticky rail, chapter observation, ember sweep, settled fog and Reveal choreography are untouched. `overflow-hidden` → `overflow-clip` on the world wrapper so the sticky layer tracks the viewport (the same pattern Missions uses).
- `app/globals.css`: `.exp-archive-image` points at the v3 WebP (50% 46% desktop, 78% 46% below 1024px); the portrait shift reveals both the arch edge and the lit shelves while keeping the copy over near-black pixels. Contrast at the active crop (p95 ash): 5.96 heading / 6.22 intro / 6.57 company / 6.94 body at 1920×1080, 5.80 / 6.44 / 6.64 / 6.91 at 1366×768, 6.07 / 6.45 / 6.79 / 6.78 at 390×844 @ 78%. `.exp-archive::after` scrims and `.exp-archive-contours` are unchanged. Existing `.exp-folio`, `.exp-ember`, `.exp-record`, ruling and vignette rules untouched.
- No new animation, canvas, WebGL or scroll listener was added. The image is a background decode once; the room holds still while the ledger scrolls.

### Flying Raijin kunai
- `components/transitions/RaijinKunai.tsx` — new dedicated artwork component. `RaijinKunai` is repainted from flat fills to layered metal: dark-steel/silver cross-section gradient, three separate bevel faces, forged ridge and specular glints, brushed-steel striation pattern clipped to the blade outline, metal ferrules, a cord-wrapped grip pattern, a torus pommel ring and an engraved Flying Raijin seal. Rim light is cyan in the transition and warm gold in the boot loader (`accent` prop), always restrained. `idPrefix` keeps gradient/filter ids unique when both instances are mounted.
- `components/transitions/RaijinArtwork.tsx` re-exports the component, so every existing import and animation contract is unchanged; the seal ring and lightning paths stay in `RaijinArtwork.tsx`.
- Same `120 × 300` viewBox as the previous weapon, so the transition's `fr-kunai` transforms, the loader's 96×192 box and all aspect assumptions are untouched. Only the illustration changed.
- `components/loading/FlyingRaijinLoader.tsx` renders the same artwork (`idPrefix="frl"`, `accent="gold"`, `preserveAspectRatio="xMidYMid meet"`). Spin, pulse, progress bar and reduced-motion behaviour are unchanged.
- `components/transitions/KunaiTransition.tsx` and all `fr-*` keyframes, timings, veil, particles, seal and lightning are unchanged. The weapon remains centred on the chakra axis. Verified in `screenshots/phase64/kunai2/`.

### Future photographic pass — generation briefs
**Missions v4 (optional):** 16:9, 3840×2160, photoreal anime-film still of a Hidden Leaf mission headquarters at night. Circular Hokage window with warm dusk light at the far right third; camera-height table with a Land of Fire map and sealed scrolls in the lower third; dark uncluttered left/centre third for dossier text; warm lantern pools (no blown highlights); rich walnut joinery and shoji; light atmospheric haze; no characters, text or logos. Preserve the existing composition so positions/scrims stay valid.

**Experience chamber (optional photographic v4, replacing the hand-authored v3):** 16:9, 3840×2160, photoreal ancient shinobi archive chamber. Deep charcoal and warm parchment, wall of rolled records and document boxes in shadow, low reading cabinet, one warm lantern at the right edge, faint cartographic scroll, strong central negative space for the ledger, vignetted edges. No people, faces, text, logos or bright objects in the central 60%; low overall luminance (mean ≤ 45/255) so the accepted Career Ledger contrast holds. Keep the alcove/banner off the text axis.

**Kunai (optional raster v2):** 1024×2560 transparent PNG/WebP, centred vertical tri-pronged Flying Raijin kunai, gunmetal and silver, visible bevels and brushed texture, dark cord-wrapped grip, metal pommel ring, fine engraved seal, restrained cyan rim light on the left edge only, straight orthographic view, no background, no cast shadow beyond a soft edge AO. Match the 120:300 aspect so the existing transition transforms remain valid.

## Phase 6.5 — Jutsu Encounter Archive (Missions presentation)

No new bitmap assets were produced in this phase. The showcase reuses the
existing project artwork and adds CSS/SVG treatment layers only:

- **BugWiser stage (Phase 6.5):** `public/assets/missions/bugwiser-live.png`
  (unchanged real screenshot). Phase 6.7 later replaced the stage with three
  fresh live captures; see the Phase 6.7 section below.
- **ResQ / ENN Consultancy / Saravaraj AI stages:** the existing original SVGs in
  `components/missions/MissionCover.tsx` (`emergency`, `automation`,
  `outreach`) — unchanged artwork, now displayed on large cinematic plates.
- **Jutsu layers** live in `app/globals.css` under the `Jutsu Encounter Archive`
  block (sand vortex/wash/grains, lightning arcs/charge/strike, parchment
  leaves/seal/ink line, network links/nodes/signal). All are gradients, masks,
  inline SVG strokes and transforms — no images, no copyrighted anime frames,
  no character artwork.
- **Field Archive:** `archiveProjects` in `lib/data/missions.ts` now holds four
  records (Financely, PhenomCommerce, Podcast Platform, Cara Clothing); the
  E-Invite Editor entry was removed. `public/assets/E-Invite.png` is preserved
  because the legacy, unimported `components/Projects.tsx` still references it;
  it is no longer referenced by the live page.
- **Reverse-scroll landing** is a scroll-position change (`lib/scroll.ts`,
  `scrollToSectionInstant`), not an asset change.

Full measurements, root cause and verification live in
`docs/phase65-showcase-and-reverse-scroll.md`; evidence under
`screenshots/phase65/`.

## Phase 6.7 — BugWiser cinematic rework

All BugWiser gallery screens are **actual captures of the deployed app** in its
own dark theme, not recreations:

| Asset | Size | Provenance |
| --- | --- | --- |
| `public/assets/missions/bugwiser/screen-overview.png` | 2880×1800 (1440×900 @2×) | live landing / GitHub entry point |
| `public/assets/missions/bugwiser/screen-workflow.png` | 2880×1800 | live six-step investigation workflow |
| `public/assets/missions/bugwiser/screen-investigation.png` | 2880×1800 | live investigation workspace with root cause and patch preview |
| `public/assets/missions/bugwiser/screen-overview-mobile.png` | 780×1688 (390×844 @2×) | same live screen, phone art direction |
| `public/assets/missions/bugwiser/screen-workflow-mobile.png` | 780×1688 | same live screen, phone art direction |
| `public/assets/missions/bugwiser/screen-investigation-mobile.png` | 780×1688 | same live screen, phone art direction |

- Source: `https://bug-wiser.vercel.app/`, captured 16 Nov 2026 with
  `scripts/capture-bugwiser-screens.py`; theme switched with the app's own
  “Toggle theme” control. Repo: `https://github.com/PhenomDeekey27/BugWiser`.
- `public/assets/missions/bugwiser/sand-wall.png` — 760×1064, 48-colour,
  ~160 KB authored sand texture generated by `scripts/build-sand-wall.py`. The
  right bank mirrors it in CSS, so both formations share one continuous wall.
  `sand-grain.png` remains the separate fine-grain overlay.
- Preserved untouched: `bugwiser-live.png` (still the dossier cover) and the
  earlier `bugwiser-overview.png`, `bugwiser-workflow.png`,
  `bugwiser-investigation.png`.

Design, sequence, files and validation: `docs/phase67-bugwiser-cinematic.md`;
evidence under `screenshots/phase67/rework/`.
