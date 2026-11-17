# Missions Cinematic Background (Generation Brief)

## Phase 6.3b status (current)

Status: **v3 candidate not received — A/B blocked, baseline captured.** The
expected `public/assets/missions/mission-hq-cinematic-v3.png` was **not
supplied**: it is absent from the project, temp directories and user folders
(verified 2026-11-13). In-workflow image generation was attempted against the
spec below but was rejected by the provider quota (~22h cooldown). Nothing was
activated; `MissionsWorld.tsx` still paints `mission-hq-cinematic.png` (v1).

Asset integrity (SHA-256, verified unchanged):

| Asset | Size | SHA-256 (prefix) |
| ----- | ---- | ---------------- |
| v1 active `mission-hq-cinematic.png` | 1,920 KB, 1672×941 PNG | `528eedab…` |
| v2 inert candidate `…-v2.png` | 1,994 KB, 1672×941 PNG | `297759fd…` |

The capture-only harness (`scripts/compare-missions-bg.py`) was updated for
6.3b and **verified with an A-only baseline run** into
`screenshots/phase63b/` (27 files + `report.json`): top/mid/end states and
content-hidden plates at 1920×1080, 1366×768, 390×844, plus a responsive
background-position sweep on the plate. Baseline numbers reproduce Phase 6.3A
exactly (text-band mean/p95 luma 1920: 19/37, 1366: 21/43, 390: 42/94; heading
contrast ≥ 12:1 mean everywhere; intro ≥ 5.1:1 mean), so the harness is ready
the moment the v3 file lands — drop it at
`public/assets/missions/mission-hq-cinematic-v3.png` and rerun:

```
python scripts/compare-missions-bg.py
```

Position-sweep note from the A baseline: at 1920×1080 and 1366×768 the 16:9
asset fills the viewport almost exactly (`bg-cover` crops ~0 px), so
background-position is a no-op on desktop — the sweep only matters for the
390×844 mobile crop. On mobile, v1's optimum is its production `70% 50%`
(intro 6.10/5.19); the 42–45% position that v2 needed is *worse* for v1
(intro 5.12/3.68 at 42%) — the optimum is asset-specific and must be
re-derived for v3.

### v3 export spec (unchanged, from Phase 6.3A)

- Circular window / brightest light pool centred around image x ≈ 72–92%,
  upper-mid height, so the mobile crop can keep it beside the copy.
- Left third and the x 25–75% / y 10–45% band dark and low-contrast.
- ≥ 1920×1080 (2560×1440 preferred), 16:9, PNG, compressed toward < 900 KB.

## Phase 6.3 status (prior — v2 round)

Status: **Awaiting the new candidate image.** Image generation is not available
in the coding-agent workflow, so nothing was generated and nothing was
activated. The active Missions background is unchanged:
`/assets/missions/mission-hq-cinematic.png` (1672×941, 16:9, 1,920 KB PNG),
painted by `components/worlds/MissionsWorld.tsx` inside its sticky world layer.

Expected candidate, to be supplied externally:

```
public/assets/missions/mission-hq-cinematic-v2.png
```

Accepted: PNG or high-quality WebP, 16:9, 1920×1080 minimum (2560×1440
preferred). `mission-hq.png` (byte-identical duplicate) and `mission-hq.svg`
(legacy vector scene) are preserved and untouched; the duplicate stays unreferenced.

See "Phase 6.3 — integration preparation" at the end for the measured content
layout, the A/B capture harness, and the approval gate.

---

## Phase 6.2 history

Status: **No new image generated in this workflow.** Image generation is not
available to the coding agent, so no candidate file was created and the
production background was **not** replaced. The active background remains
`/assets/missions/mission-hq-cinematic.png` (identical to
`/assets/mission-hq.png`; the unused legacy vector
`/assets/missions/mission-hq.svg` is still present but unreferenced).

## A1 — Current background audit

- Rendered source: `components/worlds/MissionsWorld.tsx` paints
  `/assets/missions/mission-hq-cinematic.png` with `bg-cover` inside a sticky
  `100lvh` layer, behind a stack of CSS scrims (vertical/horizontal gradient,
  lantern radial, vignette, dust particles gated by `IntersectionObserver`).
- Asset: 1672×941 (≈16:9), 1.9 MB PNG.
- Unused: `mission-hq.png` (byte-identical duplicate), `mission-hq.svg`
  (legacy vector scene), `mission-hq` references in older comments.
- Text readability is handled entirely by the CSS scrim stack; the image's
  own composition is what limits the result.

## A2 — Desired art direction (for the generator)

Generate a single original, premium **anime-film frame** — not concept art, not
a flat illustration, not a photograph. Hidden Leaf Mission Command
Headquarters interior.

Composition (16:9, landscape, ≥ 2560×1440 preferred, PNG or high-quality WebP):

- **Foreground (bottom third):** a low wooden briefing table with a rolled-out
  Land of Fire map, sealed mission scrolls, an inkstone and a single paper
  lantern resting on the table edge. Warm, directional lantern light pools
  across the map.
- **Mid-ground (centre):** shoji screens opening onto a misty forest corridor;
  one screen panel carries a faint, out-of-focus Hidden Leaf crest. A second,
  dimmer lantern hangs at the corridor mouth. Keep this band comparatively dark
  — it sits behind the project dossiers.
- **Background (top third):** the village rooftops and Hokage Rock silhouette
  seen through a high window, moonlight and cool night air. Soft atmospheric
  haze, not a hard line.
- **Lighting:** warm amber lantern key light from lower-right, cool moonlight
  fill from upper-left, gentle rim light on the table edge. Cinematic anime
  film lighting with controlled bloom — no blown highlights.
- **Depth:** clear foreground / mid-ground / background separation; subtle
  floating dust motes in the lantern beam.

Negative space (critical for readability):

- The **left 35%** and the **vertical band behind the dossier column** must stay
  dark and low-contrast (no bright lanterns, no faces, no strong edges).
- Avoid any high-detail object centred horizontally where a dossier title or
  screenshot will sit.
- Keep the brightest element (the table lantern) in the lower-right quadrant,
  outside the text column.

## A3 — Approval gate

When a candidate is produced, save it as
`/assets/missions/mission-hq-cinematic-v2.png` without touching the active
file, capture both at 1920×1080, 1366×768 and 390×844 with the real dossier
content visible, and present the comparison for approval. Do **not** switch `MissionsWorld.tsx` until approved.
No candidate exists yet, so no comparison was performed.

## A4 — Visual refinements applied without a new asset

- Dossier panels gained an inset top hairline and a deeper shadow so they read
  as lit objects resting in the room instead of flat black rectangles.
- The BugWiser live screenshot and the Field Archive thumbnails were graded
  down (`brightness 0.88 / 0.78`, `saturate 0.9 / grayscale 20%`) with a warm
  radial overlay so the white UI captures integrate with the lantern light.
- No facts, links, ownership labels, screenshots or project hierarchy changed.
- No assets were replaced.

## Limitation

Image generation is not available in this coding workflow, so the candidate
described above does not exist as a file. The brief is provided so it can be
run through an external image tool and returned for the approval step.

---

## Phase 6.3 — integration preparation

### Composition constraints from the real layout

Measured on the running build with the dossier content visible
(`screenshots/phase63/report.json`, `layout`):

| Viewport  | Content column | Heading      | Featured dossier | Background position |
| --------- | -------------- | ------------ | ---------------- | ------------------- |
| 1920×1080 | x 330, w 1250  | x 378, w 542 | x 378, w 1154    | `50% 50%`           |
| 1366×768  | x 53, w 1250   | x 101, w 542 | x 101, w 1154    | `50% 50%`           |
| 390×844   | x 0, w 380     | x 20, w 325  | x 20, w 340      | `70% 50%`           |

The image is painted `bg-cover` into a full-viewport sticky layer, so the
composition must work at 16:9 with these constraints:

- Keep the **left third** (x < 25%) dark and quiet: it sits behind heading and
  intro copy at 1920, and becomes almost the whole frame on mobile.
- No strong edges, bright lanterns or faces in **x 25–75%, y 10–45%** — that
  band sits behind the heading and the top of the featured BugWiser dossier.
- Put the brightest light (lantern / high window) in the **right 20–30%** and
  the **lower-right quadrant**, so it reads beside the dossier column at 1920
  instead of behind text.
- Design for the **mobile crop** at `background-position: 70% 50%`: the subject
  must survive a 390-wide centre-right crop, not just the 16:9 master.
- Keep the scene impressive in the gaps where cards only occupy part of the
  viewport (section top, between dossiers, above Field Archive).

Reference readability for the active plate, mean / p95 luminance (0–255) in
the text band: **1920 19 / 37**, **1366 21 / 43**, **390 42 / 94**. A candidate
should sit at or below these values in the same band; a brighter plate (mean
above ~42 on mobile) will require a stronger scrim before it can be approved.

### A/B comparison harness

```
python scripts/compare-missions-bg.py [base_url]
```

Requires the dev server (default `http://localhost:3001`). It captures the
real Missions section at 1920×1080, 1366×768 and 390×844:

- **A** — the active background exactly as it renders today;
- **B** — `mission-hq-cinematic-v2.png`, applied *only for the capture session*
  by overriding the inline `background-image` of the existing sticky world
  layer. Same element, `bg-cover`, responsive `background-position` and full
  scrim/vignette stack as production.

No application code changes and no permanent, user-facing background selector.

Output: `screenshots/phase63/<viewport>/{a,b}-{top,mid,end}.png`,
`plate-{a,b}-top.png` (content hidden, for the luminance check) and
`screenshots/phase63/report.json` (candidate dimensions/format/bytes, computed
background-position, horizontal overflow, per-variant band luminance).
If the candidate file is absent the script still writes the A baseline and
reports `candidateBackground.present: false`.

### Before approval

1. Candidate supplied at `public/assets/missions/mission-hq-cinematic-v2.png`.
2. Re-run the harness; confirm ≥ 1920×1080, 16:9, and sane file size
   (target under ~900 KB; PNG or WebP).
3. Review A/B at all three viewports for environmental quality, cinematic
   depth, composition, project readability, contrast, mobile cropping and
   compatibility with the existing scrims and vignette.
4. Approve, or request scrim-only adjustments. No switch happens until then;
   the candidate file is inert in `public/` and the active file is untouched.

---

## Phase 6.3 — A/B result (awaiting approval)

Candidate supplied at `public/assets/missions/mission-hq-cinematic-v2.png`:
**1672×941, 16:9, 1,994 KB PNG**, distinct from the active file. **Below the
1920×1080 minimum** in the brief, so a 1920×1080 desktop paint upscales it ~15%.
It was **not** activated; `MissionsWorld.tsx` still paints
`mission-hq-cinematic.png`.

### WCAG contrast of real copy over the plate (mean / p95, 4.5:1 = AA body text)

| Viewport  | A heading   | A intro     | B heading   | B intro     |
| --------- | ----------- | ----------- | ----------- | ----------- |
| 1920×1080 | 12.05 / 6.17 | 5.98 / 4.87 | 13.94 / 12.39 | 6.05 / 5.01 |
| 1366×768  | 13.23 / 9.22 | 6.01 / 4.72 | 13.92 / 12.39 | 5.66 / 3.81 |
| 390×844   | 13.48 / 11.35 | 6.10 / 5.19 | **4.45 / 2.53** | **1.96 / 1.18** |

**Verdict:** the candidate is a clear cinematic upgrade on desktop (deep
foreground table, mid-ground hall, distant Hokage Rock window, controlled sun
rays) and passes AA at 1920 with the current scrims. On **mobile it fails
badly**: the `70% 50%` crop puts the sunset window directly behind the heading
and intro, dropping body copy to 1.96:1.

### Required adjustments if this candidate is approved

Measured with a temporary capture-only overlay (not applied to the app):

1. Mobile background position `70% 50%` → **`42–45% 50%`**: intro recovers to
   5.64–5.77 mean / 4.61–5.03 p95, heading 13.4+. This crops the window out of
   the text band, so mobile loses the scene's strongest focal point.
2. Extra top gradient (`rgba(6,7,6,0.18)` to 36%, fading out by 66%) on
   `< 640px`: lifts the mobile crop to 5.86 / 5.15.
3. Extra top gradient `0.20` on desktop: 1366 intro 3.81 → 4.51 p95 (1920
   5.01 → 5.52), with the sun rays still visible.

**Recommendation:** request a v3 export rather than shipping this crop. Move
the circular window/light pool to image x ≈ 72–92% so the mobile crop keeps it
beside the copy, and export at ≥ 1920×1080 compressed toward < 900 KB. If
shipping now is preferred, use this candidate on desktop and accept 42–45%
mobile crop plus the two extra scrim gradients above.
