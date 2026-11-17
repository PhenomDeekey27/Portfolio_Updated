"use client";

import { useEffect, useRef, useState } from "react";
import { useSectionPhase } from "../ui/SectionContent";

/**
 * Arms an encounter exactly once.
 *
 * Two conditions must both hold: the scene has reached the reading band
 * (IntersectionObserver, disconnected after the first hit) and the section has
 * finished its transition into `content`. The sequence therefore never spends
 * itself behind the teleport veil, and it never replays on scroll back.
 */
export function useEncounterActive<T extends HTMLElement>(threshold = 0.16) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const phase = useSectionPhase();

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, active: inView && phase === "content" };
}
