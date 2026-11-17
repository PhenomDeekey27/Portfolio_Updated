// Flying Raijin teleportation engine.
// Shared by scroll-triggered and click-triggered section navigation.
//
// One shared, non-overlapping timeline drives every route identity:
//  1. COVERING        — the warm veil rises over the outgoing world
//  2. KUNAI_DESCENT   — identity artwork enters
//  3. SEAL_ACTIVATION — identity peaks
//  4. TELEPORT_FLASH  — controlled flash, invisible scroll snap
//  5. WORLD_SWITCH    — destination world unfolds from the top-left
//  6. ARRIVAL         — destination content choreography (staggered)
//  7. COMPLETE->IDLE  — overlay removed, scrolling restored
//
// The veil is never pure black and the overlay root is transparent, so the
// destination is genuinely revealed by the WORLD_SWITCH clip instead of being
// hidden behind an opaque plate.
//
// Approximate duration: ~1.6s. Reduced motion collapses to a quick cut.

import { useCallback, useEffect, useReducer, useRef } from "react";

export type TeleportState =
  | "IDLE"
  | "COVERING"
  | "KUNAI_DESCENT"
  | "SEAL_ACTIVATION"
  | "TELEPORT_FLASH"
  | "WORLD_SWITCH"
  | "ARRIVAL"
  | "COMPLETE";

export interface TeleportTransition {
  state: TeleportState;
  source: string | null;
  destination: string | null;
  direction: "forward" | "backward";
}

type Action =
  | { type: "BEGIN"; destination: string; source: string | null }
  | { type: "ADVANCE" }
  | { type: "RESET" };

const ORDER: TeleportState[] = [
  "COVERING",
  "KUNAI_DESCENT",
  "SEAL_ACTIVATION",
  "TELEPORT_FLASH",
  "WORLD_SWITCH",
  "ARRIVAL",
  "COMPLETE",
  "IDLE",
];

const INITIAL: TeleportTransition = {
  state: "IDLE",
  source: null,
  destination: null,
  direction: "forward",
};

function reducer(state: TeleportTransition, action: Action): TeleportTransition {
  switch (action.type) {
    case "BEGIN": {
      // One transition at a time. Never retarget a sequence that is already
      // in flight: that is what caused overlapping / mismatched reveals.
      if (state.state !== "IDLE") return state;
      const direction =
        action.source && action.destination
          ? sectionIndex(action.destination) >= sectionIndex(action.source)
            ? "forward"
            : "backward"
          : "forward";
      return {
        state: "COVERING",
        source: action.source,
        destination: action.destination,
        direction,
      };
    }
    case "ADVANCE": {
      const idx = ORDER.indexOf(state.state);
      const next = idx >= 0 ? ORDER[idx + 1] : "IDLE";
      if (next === "IDLE") {
        return { ...INITIAL };
      }
      return { ...state, state: next };
    }
    case "RESET":
      return INITIAL;
    default:
      return state;
  }
}

const SECTION_ORDER = [
  "home",
  "about",
  "skills",
  "missions",
  "experience",
  "contact",
];

function sectionIndex(id: string): number {
  const i = SECTION_ORDER.indexOf(id);
  return i === -1 ? 0 : i;
}

/** Every known section pair uses the shared Yellow Flash sequence. */
export function isTeleportPair(
  source: string | null,
  destination: string
): boolean {
  if (source === destination) return false;
  return SECTION_ORDER.includes(destination) && (!source || SECTION_ORDER.includes(source));
}

// Cinematic durations (ms). The veil covers quickly, the world unveil carries
// most of the time, and the destination content keeps staggering after the
// overlay is gone (it never blocks scrolling).
const PHASE_MS: Record<TeleportState, number> = {
  IDLE: 0,
  COVERING: 80,
  KUNAI_DESCENT: 190,
  SEAL_ACTIVATION: 130,
  TELEPORT_FLASH: 90,
  // Long enough for the diagonal unfold to read as a world arriving.
  WORLD_SWITCH: 580,
  // Content choreography window; Reveal items animate on their own delays.
  ARRIVAL: 620,
  COMPLETE: 0,
};

export interface TeleportationControllerApi {
  transition: TeleportTransition;
  /** Returns true only when the sequence actually started. */
  beginTransition: (destination: string, source: string | null) => boolean;
  /** Abort the sequence (used when the document is hidden). */
  skip: () => void;
  isTransitioning: boolean;
}

export function useTeleportation(
  reducedMotion: boolean
): TeleportationControllerApi {
  const [transition, dispatch] = useReducer(reducer, INITIAL);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<TeleportState>("IDLE");

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const beginTransition = useCallback(
    (destination: string, source: string | null): boolean => {
      if (destination === source) return false;
      // Ignore requests while a sequence is running — no overlap, no retarget.
      // stateRef is advanced synchronously (below) so a burst of scroll events
      // cannot all pass this guard before React re-renders.
      if (stateRef.current !== "IDLE") return false;
      stateRef.current = "COVERING";
      dispatch({ type: "BEGIN", destination, source });
      return true;
    },
    []
  );

  const skip = useCallback(() => {
    clearTimer();
    stateRef.current = "IDLE";
    dispatch({ type: "RESET" });
  }, [clearTimer]);

  useEffect(() => {
    if (transition.state === "IDLE") return;

    const ms =
      transition.state === "COMPLETE"
        ? 50
        : reducedMotion
          ? 40
          : PHASE_MS[transition.state];

    timerRef.current = setTimeout(() => {
      const idx = ORDER.indexOf(stateRef.current);
      const next = idx >= 0 ? ORDER[idx + 1] : "IDLE";
      stateRef.current = next;
      dispatch({ type: "ADVANCE" });
    }, ms);

    return () => clearTimer();
  }, [transition.state, reducedMotion, clearTimer]);

  const isTransitioning = transition.state !== "IDLE";

  return { transition, beginTransition, skip, isTransitioning };
}
