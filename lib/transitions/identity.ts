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
// Any other pair (a nav jump between non-adjacent sections) falls back to the
// base Flying Raijin teleport, which is the site's global travel identity.

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

export function getRouteIdentity(
  source: string | null,
  destination: string | null
): RouteIdentity {
  if (!source || !destination) return FALLBACK;
  return (
    ROUTE_IDENTITY[`${source}|${destination}`] ??
    ROUTE_IDENTITY[`${destination}|${source}`] ??
    FALLBACK
  );
}

export function getTransitionKind(
  source: string | null,
  destination: string | null
): TransitionKind {
  return getRouteIdentity(source, destination).kind;
}
