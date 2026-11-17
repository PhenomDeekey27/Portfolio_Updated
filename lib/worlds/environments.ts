/**
 * Section environments — one authoritative environment per section.
 *
 * PHASE 6.11 established the map for Skills and Missions. PHASE 6.12 extends it
 * to every section of the page so there is a single place that answers "which
 * environment does this section own?". Worlds read their plate from here and
 * publish it as `data-world-asset`, so the mapping is asserted from the DOM
 * (`scripts/capture-phase612.py`) instead of being inferred from component
 * source.
 *
 *   home      → Hidden Leaf village approach (HiddenLeafStage)
 *   about     → Valley of the End panorama
 *   skills    → Training Grounds
 *   missions  → Hidden Leaf mission headquarters (mission-hq-cinematic-v3)
 *   experience→ Career archive chamber
 *   contact   → Hokage Communication Chamber (inline SVG/CSS scene)
 *
 * The Contact chamber is an `inline` environment: it is drawn from vector
 * geometry and gradients in `components/worlds/ContactWorld.tsx`, so it owns a
 * scene identity without depending on a raster plate. The image-generation
 * brief for an optional painted plate lives in
 * `docs/contact-chamber-image-brief.md`; wiring one in means replacing the
 * `kind`/`plate` pair below and nothing else.
 */

export type SectionEnvironmentId =
  | "home"
  | "about"
  | "skills"
  | "missions"
  | "experience"
  | "contact";

/** `plate` = a raster/vector image file, `inline` = drawn CSS+SVG scene. */
export type EnvironmentKind = "plate" | "inline";

export interface SectionEnvironment {
  id: SectionEnvironmentId;
  /** Human-readable scene name, used by diagnostics and the docs. */
  label: string;
  /** Unique scene identity. Two sections may never share one. */
  scene: string;
  kind: EnvironmentKind;
  /** Public path of the single plate this section is allowed to paint. */
  plate?: string;
}

export const SECTION_ENVIRONMENTS: Record<
  SectionEnvironmentId,
  SectionEnvironment
> = {
  home: {
    id: "home",
    label: "Hidden Leaf village approach",
    scene: "hidden-leaf-approach",
    kind: "plate",
    plate: "/assets/hidden-leaf-village.jpg",
  },
  about: {
    id: "about",
    label: "Valley of the End",
    scene: "valley-of-the-end",
    kind: "plate",
    plate: "/assets/valley-of-the-end-wide.png",
  },
  skills: {
    id: "skills",
    label: "Training Grounds",
    scene: "training-grounds",
    kind: "plate",
    plate: "/assets/skills-training-grounds-cinematic.png",
  },
  missions: {
    id: "missions",
    label: "Hidden Leaf mission headquarters",
    scene: "mission-headquarters",
    kind: "plate",
    plate: "/assets/missions/mission-hq-cinematic-v3.png",
  },
  experience: {
    id: "experience",
    label: "Career archive chamber",
    scene: "career-archive",
    kind: "plate",
    plate: "/assets/experience/career-archive-chamber-v3.webp",
  },
  contact: {
    id: "contact",
    label: "Hokage Communication Chamber",
    scene: "hokage-communication-chamber",
    kind: "inline",
  },
};

export const SECTION_ENVIRONMENT_ORDER: SectionEnvironmentId[] = [
  "home",
  "about",
  "skills",
  "missions",
  "experience",
  "contact",
];

export function getSectionEnvironment(
  id: SectionEnvironmentId
): SectionEnvironment {
  return SECTION_ENVIRONMENTS[id];
}

/** The value a world publishes as `data-world-asset`. */
export function environmentAssetTag(env: SectionEnvironment): string {
  return env.kind === "plate" && env.plate ? env.plate : `inline:${env.scene}`;
}

// Build-time guard: a duplicated plate or scene would make one section inherit
// the other's environment, which is the exact defect this map exists to
// prevent. Evaluated when the module is first imported (during `next build`
// prerender and in the browser), so a copy/paste mistake fails loudly.
const environments = SECTION_ENVIRONMENT_ORDER.map((id) => SECTION_ENVIRONMENTS[id]);
const plates = environments
  .map((env) => env.plate)
  .filter((plate): plate is string => Boolean(plate));
const scenes = environments.map((env) => env.scene);

if (new Set(plates).size !== plates.length) {
  throw new Error(
    `[worlds] Sections share a background plate: ${plates.join(", ")}. ` +
      "Each section environment must own a distinct plate."
  );
}

if (new Set(scenes).size !== scenes.length) {
  throw new Error(
    `[worlds] Sections share an environment identity: ${scenes.join(", ")}.`
  );
}

for (const env of environments) {
  if (env.kind === "plate" && !env.plate) {
    throw new Error(`[worlds] ${env.id} is a plate environment without a plate.`);
  }
}
