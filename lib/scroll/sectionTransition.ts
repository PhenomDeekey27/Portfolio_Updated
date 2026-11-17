// Scroll interaction design coordinator.
//
// This module defines how section navigation and transitions are coordinated.
// It does NOT hijack scrolling or force snapping. It only gates transition
// requests so a single scroll/wheel/touch gesture cannot trigger repeated
// transitions, and so reduced-motion users get an instant swap.

import { useCallback, useRef, useState } from "react";

const TRANSITION_COOLDOWN_MS = 800;

export interface SectionTransitionController {
  current: string | null;
  isTransitioning: boolean;
  requestTransition: (target: string) => boolean;
}

export function useSectionTransition(
  initial: string | null = null
): SectionTransitionController {
  const [current, setCurrent] = useState<string | null>(initial);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastTransitionAt = useRef(0);
  const transitioningRef = useRef(false);

  const requestTransition = useCallback((target: string) => {
    const now = Date.now();
    if (transitioningRef.current) return false;
    if (now - lastTransitionAt.current < TRANSITION_COOLDOWN_MS) return false;
    if (target === current) return false;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    transitioningRef.current = true;
    setIsTransitioning(true);
    lastTransitionAt.current = now;
    setCurrent(target);

    const duration = prefersReducedMotion ? 0 : 420;
    window.setTimeout(() => {
      transitioningRef.current = false;
      setIsTransitioning(false);
    }, duration);

    return true;
  }, [current]);

  return { current, isTransitioning, requestTransition };
}
