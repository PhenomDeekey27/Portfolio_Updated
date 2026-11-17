/**
 * Character artwork slot for the Shinobi Jutsu Theatre.
 *
 * `base` is the approved character plate (transparent PNG/WebP, portrait ~2:3,
 * figure standing with headroom). When it is `null` the scene renders the
 * project-authored ink silhouette from `components/missions/SandShinobi.tsx` —
 * clearly marked as a stand-in (`data-character="stand-in"`), never presented as
 * finished character art.
 *
 * To drop in licensed art: place the file under `public/assets/missions/
 * characters/` and set `base` to that public path. Optionally supply `sealLayer`
 * (a transparent layer of the character's final hand-seal pose) — the scene
 * cross-fades to it during the hand-sign beat. No other change is needed.
 */

export type CharacterArtwork = {
  id: string;
  /** Approved base plate, e.g. "/assets/missions/characters/sand-shinobi.webp". */
  base: string | null;
  /** Optional approved hand-seal pose layer, aligned to `base`. */
  sealLayer: string | null;
  /** Accessible description of the character plate. */
  alt: string;
  /** Where the artwork comes from — recorded so nothing unlicensed ships. */
  source: string;
  license: string;
};

export const SAND_GAARA: CharacterArtwork = {
  id: "gaara-sand",
  // PHASE 6.8: awaiting approved Gaara artwork. Drop a transparent, portrait
  // (~2:3) plate here and the scene mounts it automatically at the sand origin.
  base: null,
  sealLayer: null,
  alt: "Gaara of the Sand standing in a dust-lit chamber, sand gourd on his back, red hair rim-lit, one hand raised as sand streams toward the centre",
  source:
    "Awaiting approved Gaara artwork. No licensed image was supplied, and the project will not render a generic ninja stand-in as Gaara.",
  license: "Requires user-provided or verified licensed artwork before use",
};

export const SAND_SHINOBI: CharacterArtwork = {
  id: "sand-shinobi",
  base: null,
  sealLayer: null,
  alt: "Sand shinobi standing in a dust-lit desert chamber, gourd on the back, one hand raised in a seal",
  source:
    "Original project-authored vector stand-in (ink silhouette). No licensed character artwork was supplied.",
  license: "Project-owned placeholder — replace with approved artwork before launch",
};

export const BOLT_SHINOBI: CharacterArtwork = {
  id: "bolt-shinobi",
  base: null,
  sealLayer: null,
  alt: "Lightning shinobi leaning forward in a storm-lit chamber, one palm extended as blue-white chakra gathers at the hand",
  source:
    "Original project-authored vector stand-in (ink silhouette). No licensed character artwork was supplied.",
  license: "Project-owned placeholder — replace with approved artwork before launch",
};

export const SEAL_SHINOBI: CharacterArtwork = {
  id: "seal-shinobi",
  base: null,
  sealLayer: null,
  alt: "Sealing shinobi standing before a hanging scroll, both hands held in a seal as gold sealing lines open across the chamber",
  source:
    "Original project-authored vector stand-in (ink silhouette). No licensed character artwork was supplied.",
  license: "Project-owned placeholder — replace with approved artwork before launch",
};

export const SIGNAL_SHINOBI: CharacterArtwork = {
  id: "signal-shinobi",
  base: null,
  sealLayer: null,
  alt: "Shadow-network shinobi crouched in an ink-green chamber, one hand raised to the ear while signal rings spread through the dark",
  source:
    "Original project-authored vector stand-in (ink silhouette). No licensed character artwork was supplied.",
  license: "Project-owned placeholder — replace with approved artwork before launch",
};
