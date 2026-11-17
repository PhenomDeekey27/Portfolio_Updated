"use client";

import { useEffect, useRef, useState } from "react";
import { useSectionPhase } from "../ui/SectionContent";

/**
 * PHASE 6.13 — encounter lifecycle, re-armed on every entry.
 *
 * The technique plays whenever the stage enters the reading band and resets
 * once it has left, so an encounter replays coming down the page *and* coming
 * back up from the sections below it.
 *
 * Why the observer watches the stage and not the encounter article: an article
 * spans the title beat, the gallery and the editorial record — three or more
 * viewports. An article-level observer arms the sequence a screen early, so by
 * the time the title is on screen the technique has already burned itself
 * off-screen. That is exactly why the replay never appeared on the way back up.
 *
 * Enter and exit deliberately use different tests:
 *
 *   enter — `isIntersecting` against a root shrunk at the bottom, plus a
 *           size-aware minimum overlap, so neither a one-pixel sliver nor a
 *           stage taller than the viewport can arm it early (or fail to).
 *   exit  — `isIntersecting === false`, i.e. the stage is completely gone.
 *
 * That hysteresis is what stops the sequence restarting while the element is
 * still on screen. One observer per stage, no scroll listeners, and the only
 * React state change is a single attribute flip on enter and on exit.
 *
 * Base CSS for every encounter describes the settled composition, so the reset
 * only clears the decorative technique state — the description, gallery, links
 * and record stay readable the whole time.
 */
export function useEncounterActive<T extends HTMLElement>(options?: {
  /** Bottom shave on the root, so a stage must be genuinely in the band. */
  rootMargin?: string;
}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const phase = useSectionPhase();
  const rootMargin = options?.rootMargin ?? "0px 0px -6% 0px";

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Reduced motion needs no special case here: every technique animation is
    // declared inside `prefers-reduced-motion: no-preference`, so the attribute
    // flip is inert and the settled base styles stay on screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;

        if (!entry.isIntersecting) {
          // Fully out of the band: the next entry replays the technique.
          setInView(false);
          return;
        }

        // Size-aware floor: a stage taller than the viewport can never reach a
        // large *ratio*, so require overlap in pixels instead — a share of the
        // stage for short stages, capped by a share of the viewport for tall
        // ones.
        const viewportHeight =
          entry.rootBounds?.height ?? window.innerHeight ?? 0;
        const needed = Math.min(
          entry.boundingClientRect.height * 0.5,
          viewportHeight * 0.12
        );
        if (entry.intersectionRect.height >= needed) setInView(true);
      },
      { threshold: [0, 0.05, 0.15], rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, active: inView && phase === "content" };
}
