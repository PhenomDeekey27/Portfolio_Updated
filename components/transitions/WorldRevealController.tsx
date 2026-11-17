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

  const runSequence = useCallback(() => {
    if (skippedRef.current) return;
    const rm = reducedMotion;
    const scale = rm ? 0.2 : 1;

    const steps: { phase: RevealPhase; ms: number }[] = [
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
          className="fixed bottom-6 right-6 z-[101] font-mono text-[9px] uppercase tracking-[0.3em] text-ash/60 hover:text-gold-soft transition-colors"
        >
          Skip intro
        </button>
      )}
    </RevealContext.Provider>
  );
}
