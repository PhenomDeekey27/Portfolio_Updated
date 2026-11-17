# Hokage Communication Chamber — image-generation brief

The Contact section currently ships **its own environment**: an original
vector chamber drawn in `components/worlds/ContactWorld.tsx` (wooden
architecture, shoji window over the village at dusk, lantern light, hanging
mission scrolls, a desk with a transmission sheet and a crimson banner edge).
It is a distinct environment identity — it does not borrow the Skills Training
Grounds, the mission HQ, the archive or the Valley of the End.

A painted cinematic plate is **optional**. If one is commissioned, this is the
brief it should be produced against. Until that asset exists, nothing should be
substituted for it: no stock photo, no internet image and no other section's
plate.

## Expected asset path

```
public/assets/contact/hokage-chamber-cinematic.png
```

Recommended: 2560 × 1440 (16:9), under ~2.2 MB, PNG or high-quality WebP,
no baked-in text, no watermark, no visible UI.

To wire it in, change exactly one entry in `lib/worlds/environments.ts`:

```ts
contact: {
  id: "contact",
  label: "Hokage Communication Chamber",
  scene: "hokage-communication-chamber",
  kind: "plate",
  plate: "/assets/contact/hokage-chamber-cinematic.png",
},
```

`ContactWorld` renders that plate through the same sticky `100lvh` band the
other sections use and keeps its grade/dust overlays. The vector scene stays as
the documented fallback if the plate ever fails to load. (`npm run
validate:worlds` fails the build if a plate path appears outside the registry —
add the new filename to `PLATES` in `scripts/validate-world-environments.mjs`.)

## Art direction

- **Scene**: a Hidden Leaf communication room at dusk, one or two hours after
  sunset. Interior, not exterior. The village is seen *through* the window.
- **Architecture**: dark wooden posts and beams, paper/wooden sliding panels,
  a low writing desk, scroll shelves. Visible carpentry — no flat walls.
- **Window**: large, dominant, one pane or a coarse shoji grid, positioned
  centre-left of frame so it stays visible beside the transmission form.
  Through it: layered mountain ridges, the Hokage monument cliff silhouette
  off to one side (abstract, not literal faces), village rooftops with a few
  warm lit windows, a low amber horizon glow.
- **Light**: warm lantern light from two paper lanterns (one near each side of
  the room), a cool night sky through the glass, one soft light spill across
  the floor toward the viewer. Strong directionality, deep falloff.
- **Palette**: charcoal and near-black woods; muted gold (#c9a35f) on metalwork
  and scroll edges; warm ivory parchment; at most one restrained crimson accent
  (banner or seal). No saturated blues, no neon, no teal.
- **Detail props** (optional, restrained): a rolled transmission scroll on the
  desk, an ink pot with a brush rest, a stamped leaf seal, hanging mission
  slips with illegible brush strokes.
- **Mood**: a quiet room where a message is written — premium anime-film
  background art, comparable finish to the Valley of the End and mission HQ
  plates. Painterly, soft edges, no photographic realism, no cel outlines on
  the architecture.
- **Composition constraints**:
  - Left third is read as dark: the heading and communication records sit
    there, so keep that area low-contrast and free of busy detail.
  - Right half is covered by a parchment form on desktop: the plate must still
    read when ~55% of the right side is hidden.
  - For portrait crops (the region between 35% and 70% of the width must work
    on its own), keep the window and the nearest lantern inside that band.
  - No bright elements in the top 12% (navigation) or the bottom 12% (footer
    boundary) of the frame.
- **Absolutely avoid**: the training-grounds forest and posts, the mission HQ
  briefing table, the archive shelves, the Valley statues, character
  likenesses, copyrighted Naruto artwork, text, logos.
