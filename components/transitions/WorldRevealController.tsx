"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import FlyingRaijinLoader from "@/components/loading/FlyingRaijinLoader";

export type RevealPhase =
  | "LOADING"
  | "WORLD_REVEAL"
  | "MOUNTAIN_CONSTRUCTION"
  | "TERRAIN_CONSTRUCTION"
  | "BUILDING_CONSTRUCTION"
  | "ENVIRONMENT_ACTIVATION"
  | "CAMERA_MOVEMENT"
  | "NAVIGATION_REVEAL"
  | "HERO_TEXT_REVEAL"
  | "PORTRAIT_REVEAL"
  | "CTA_REVEAL"
  | "COMPLETE";

interface RevealContextValue {
  phase: RevealPhase;
  markSceneReady: () => void;
  skipIntro: () => void;
}

const RevealContext = createContext<RevealContextValue | null>(null);

export function useReveal(): RevealContextValue {
  const ctx = useContext(RevealContext);
  if (!ctx) {
    return { phase: "COMPLETE", markSceneReady: () => {}, skipIntro: () => {} };
  }
  return ctx;
}

// Module-level flag: resets on full page reload (new document load) but persists
// across React re-renders and client-side navigation within the same page.
let introPlayed = false;

function shouldPlayIntro(): boolean {
  return !introPlayed;
}

const PHASE_DURATION: Record<RevealPhase, number> = {
  LOADING: 0,
  WORLD_REVEAL: 300,
  MOUNTAIN_CONSTRUCTION: 600,
  TERRAIN_CONSTRUCTION: 500,
  BUILDING_CONSTRUCTION: 2200,
  ENVIRONMENT_ACTIVATION: 800,
  CAMERA_MOVEMENT: 1400,
  NAVIGATION_REVEAL: 300,
  HERO_TEXT_REVEAL: 900,
  PORTRAIT_REVEAL: 500,
  CTA_REVEAL: 400,
  COMPLETE: 0,
};

/** Below this width the Home world is built in DOM/CSS, not WebGL. */
const COMPACT_QUERY = "(max-width: 1023px)";

/**
 * PHASE 6.16 — the phone intro script.
 *
 * Same story, same phase names, its own pacing. Two things were wrong on a
 * phone and both were timing, not rendering:
 *
 * 1. The loader waited on a WebGL scene that never mounts below 1024px, then
 *    the visitor waited out the whole desktop-length construction before a
 *    single readable line appeared — around nine seconds.
 * 2. The copy only arrived after the world had finished settling, so the text
 *    and the background never felt like one sequence.
 *
 * Here the construction is tighter, the world's final settle (`CAMERA_MOVEMENT`,
 * a 1700ms CSS push on phones) begins at ~3.1s, and `HERO_TEXT_REVEAL` lands
 * ~1.2s before that settle finishes. The record therefore reads while the
 * village is still resolving, then settles without a second wait.
 *
 * Desktop keeps `PHASE_DURATION` untouched.
 */
const COMPACT_STEPS: { phase: RevealPhase; ms: number }[] = [
  { phase: "WORLD_REVEAL", ms: 240 },
  { phase: "MOUNTAIN_CONSTRUCTION", ms: 520 },
  { phase: "TERRAIN_CONSTRUCTION", ms: 420 },
  { phase: "BUILDING_CONSTRUCTION", ms: 1250 },
  { phase: "ENVIRONMENT_ACTIVATION", ms: 700 },
  { phase: "CAMERA_MOVEMENT", ms: 240 },
  { phase: "NAVIGATION_REVEAL", ms: 240 },
  { phase: "HERO_TEXT_REVEAL", ms: 900 },
  { phase: "PORTRAIT_REVEAL", ms: 400 },
  { phase: "CTA_REVEAL", ms: 300 },
  { phase: "COMPLETE", ms: 0 },
];

export function WorldRevealController({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<RevealPhase>(() =>
    shouldPlayIntro() ? "LOADING" : "COMPLETE"
  );
  const [reducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const sceneReadyRef = useRef(false);
  const skippedRef = useRef(false);

  const skipIntro = useCallback(() => {
    skippedRef.current = true;
    sceneReadyRef.current = true;
    introPlayed = true;
    setPhase("COMPLETE");
  }, []);

  const runSequence = useCallback((compact = false) => {
    if (skippedRef.current) return;
    const rm = reducedMotion;
    const scale = rm ? 0.2 : 1;

    // Reduced motion compresses the compact script by the same factor as the
    // desktop one — the construction is already replaced by settled frames, so
    // waiting out the full timeline would be a delay with nothing to watch.
    const steps: { phase: RevealPhase; ms: number }[] = compact
      ? COMPACT_STEPS.map((step) => ({ ...step, ms: step.ms * scale }))
      : [
      { phase: "WORLD_REVEAL", ms: PHASE_DURATION.WORLD_REVEAL * scale },
      { phase: "MOUNTAIN_CONSTRUCTION", ms: PHASE_DURATION.MOUNTAIN_CONSTRUCTION * scale },
      { phase: "TERRAIN_CONSTRUCTION", ms: PHASE_DURATION.TERRAIN_CONSTRUCTION * scale },
      { phase: "BUILDING_CONSTRUCTION", ms: PHASE_DURATION.BUILDING_CONSTRUCTION * scale },
      { phase: "ENVIRONMENT_ACTIVATION", ms: PHASE_DURATION.ENVIRONMENT_ACTIVATION * scale },
      { phase: "CAMERA_MOVEMENT", ms: PHASE_DURATION.CAMERA_MOVEMENT * scale },
      { phase: "NAVIGATION_REVEAL", ms: PHASE_DURATION.NAVIGATION_REVEAL * scale },
      { phase: "HERO_TEXT_REVEAL", ms: PHASE_DURATION.HERO_TEXT_REVEAL * scale },
      { phase: "PORTRAIT_REVEAL", ms: PHASE_DURATION.PORTRAIT_REVEAL * scale },
      { phase: "CTA_REVEAL", ms: PHASE_DURATION.CTA_REVEAL * scale },
      { phase: "COMPLETE", ms: 0 },
      ];

    let acc = 0;
    steps.forEach(({ phase: p, ms }) => {
      const delay = acc;
      acc += ms;
      window.setTimeout(() => {
        if (skippedRef.current) return;
        setPhase(p);
        if (p === "COMPLETE") {
          introPlayed = true;
        }
      }, delay);
    });
  }, [reducedMotion]);

  const markSceneReady = useCallback(() => {
    if (sceneReadyRef.current || skippedRef.current) return;
    sceneReadyRef.current = true;
    const minDelay = reducedMotion ? 150 : 900;
    window.setTimeout(() => {
      if (skippedRef.current) return;
      runSequence();
    }, minDelay);
  }, [runSequence, reducedMotion]);

  // The phone path has no WebGL scene to wait for: the DOM construction starts
  // as soon as the controller mounts, so the loader is never a waiting room.
  useEffect(() => {
    if (phase !== "LOADING") return;
    if (!window.matchMedia(COMPACT_QUERY).matches) return;
    sceneReadyRef.current = true;
    runSequence(true);
  }, [phase, runSequence]);

  useEffect(() => {
    if (phase !== "LOADING") return;
    const fallback = window.setTimeout(() => {
      if (sceneReadyRef.current || skippedRef.current) return;
      sceneReadyRef.current = true;
      runSequence();
    }, 9000);
    return () => clearTimeout(fallback);
  }, [phase, runSequence]);

  const showLoader = phase === "LOADING";

  return (
    <RevealContext.Provider value={{ phase, markSceneReady, skipIntro }}>
      {children}
      <FlyingRaijinLoader
        progress={phase === "LOADING" ? 0 : 100}
        visible={showLoader}
        reducedMotion={reducedMotion}
      />
      {phase !== "COMPLETE" && (
        <button
          type="button"
          onClick={skipIntro}
          /* PHASE 6.18 — the phone copy no longer waits on the sequence, so there
             is nothing to skip there; the control only sat on top of the
             portrait. Hidden below 1024px. */
          className="skip-intro fixed bottom-6 right-6 z-[101] font-mono text-[9px] uppercase tracking-[0.3em] text-ash/60 hover:text-gold-soft transition-colors"
        >
          Skip intro
        </button>
      )}
    </RevealContext.Provider>
  );
}
