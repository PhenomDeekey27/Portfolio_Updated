// Explicit route ⇄ transition identity map.
//
// Every adjacent route owns one animation identity. The map is defined once
// here so the controller can never drift back to the wrong effect (for example
// reusing the kunai for Missions ⇄ Experience).
//
//   Home    ⇄ About        Flying Raijin / Kunai
//   About   ⇄ Skills       Nature Chakra Awakening / golden leaves
//   Skills  ⇄ Missions     Jutsu / Rasengan
//   Missions ⇄ Experience  Shinobi Chronicle Map Reveal
//   Experience ⇄ Contact   Hokage Message Summoning (Phase 6.12)
//
// Non-adjacent travels (a nav jump, or a menu tap on a phone that skips the
// sections in between) use the identity of the section being entered. Before
// this, every one of those jumps fell back to the same Flying Raijin kunai —
// which made every phone menu navigation look identical even though desktop
// scrolling showed a different effect per section. The destination identity
// keeps the arrival distinct no matter where the visitor jumped from.

export type TransitionKind =
  | "raijin"
  | "nature-chakra"
  | "rasengan"
  | "shinobi-map"
  | "hokage-summon";

interface RouteIdentity {
  kind: TransitionKind;
  /** Human-readable name, exposed for diagnostics/tests. */
  label: string;
}

const ROUTE_IDENTITY: Record<string, RouteIdentity> = {
  "home|about": { kind: "raijin", label: "Flying Raijin" },
  "about|home": { kind: "raijin", label: "Flying Raijin" },

  "about|skills": { kind: "nature-chakra", label: "Nature Chakra Awakening" },
  "skills|about": { kind: "nature-chakra", label: "Nature Chakra Awakening" },

  "skills|missions": { kind: "rasengan", label: "Jutsu / Rasengan" },
  "missions|skills": { kind: "rasengan", label: "Jutsu / Rasengan" },

  "missions|experience": { kind: "shinobi-map", label: "Shinobi Chronicle Map" },
  "experience|missions": { kind: "shinobi-map", label: "Shinobi Chronicle Map" },

  "experience|contact": {
    kind: "hokage-summon",
    label: "Hokage Message Summoning",
  },
  "contact|experience": {
    kind: "hokage-summon",
    label: "Hokage Message Summoning",
  },
};

const FALLBACK: RouteIdentity = { kind: "raijin", label: "Flying Raijin" };

/**
 * Arrival identity per destination. Used for jumps that skip sections, so the
 * animation still belongs to the section the visitor is entering.
 */
const DESTINATION_IDENTITY: Record<string, RouteIdentity> = {
  home: { kind: "raijin", label: "Flying Raijin" },
  about: { kind: "raijin", label: "Flying Raijin" },
  skills: { kind: "nature-chakra", label: "Nature Chakra Awakening" },
  missions: { kind: "rasengan", label: "Jutsu / Rasengan" },
  experience: { kind: "shinobi-map", label: "Shinobi Chronicle Map" },
  contact: { kind: "hokage-summon", label: "Hokage Message Summoning" },
};

export function getRouteIdentity(
  source: string | null,
  destination: string | null
): RouteIdentity {
  if (!destination) return FALLBACK;
  if (!source) return DESTINATION_IDENTITY[destination] ?? FALLBACK;
  return (
    ROUTE_IDENTITY[`${source}|${destination}`] ??
    ROUTE_IDENTITY[`${destination}|${source}`] ??
    DESTINATION_IDENTITY[destination] ??
    FALLBACK
  );
}

export function getTransitionKind(
  source: string | null,
  destination: string | null
): TransitionKind {
  return getRouteIdentity(source, destination).kind;
}
