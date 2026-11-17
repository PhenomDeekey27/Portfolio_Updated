"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
 *
 * PHASE 6.16 — the arm band is a quarter of the viewport, not a sliver.
 *
 * Entering an encounter from *below* is the direction that looked broken: the
 * old floor was `min(stageHeight * 0.5, viewportHeight * 0.12)`, so the stage
 * armed while only ~100px of its bottom edge was on screen. The title beat sits
 * near the top of the stage, so on a phone the technique could burn most of its
 * 4s timeline before the title was ever visible — the animation replayed, but
 * the visitor did not see it start. Requiring a quarter of the viewport (capped
 * by 60% of the stage) means the arm happens when the stage is genuinely being
 * read, from either direction, and small movements inside the stage still
 * cannot re-trigger it.
 *
 * PHASE 6.16 — the thresholds have to reach the arm band.
 *
 * An observer only reports *crossings*, so the old `[0, 0.05, 0.15]` set could
 * deliver its only intersecting entry while the stage was still under the arm
 * floor and then stay silent for the rest of the entry. Measured at 320×655:
 * the sand stage is 453px tall, its first callback reported 116px of overlap
 * against a 164px floor, and no later callback ever fired — so the technique
 * never armed, even with the stage filling the screen. The ladder below steps
 * finely through the low ratios that tall stages reach, so some crossing always
 * lands above the floor, and the armed ref keeps the extra crossings from
 * flushing React again.
 *
 * PHASE 6.15 — the attribute flip is committed synchronously.
 *
 * The replay was reported as still missing when coming back up the page. It was
 * not missing an observer event: the observer fired correctly in both
 * directions, but its `setInView` sat in React's queued update behind a busy
 * frame, so `data-active` still described the *previous* scroll position by the
 * time the stage was on screen. The CSS timeline is keyed off that attribute, so
 * the technique started a whole step late (and appeared not to restart at all).
 * Committing inside the callback puts the attribute in the DOM in the same task
 * as the intersection change, which is what a decorative timeline needs.
 */
export function useEncounterActive<T extends HTMLElement>(options?: {
  /** Bottom shave on the root, so a stage must be genuinely in the band. */
  rootMargin?: string;
}) {
  const ref = useRef<T>(null);
  const armedRef = useRef(false);
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
          if (!armedRef.current) return;
          armedRef.current = false;
          flushSync(() => setInView(false));
          return;
        }

        // Size-aware floor: a stage taller than the viewport can never reach a
        // large *ratio*, so require overlap in pixels instead — a share of the
        // stage for short stages, capped by a share of the viewport for tall
        // ones.
        const viewportHeight =
          entry.rootBounds?.height ?? window.innerHeight ?? 0;
        const needed = Math.min(
          entry.boundingClientRect.height * 0.6,
          viewportHeight * 0.25
        );
        if (entry.intersectionRect.height >= needed && !armedRef.current) {
          armedRef.current = true;
          flushSync(() => setInView(true));
        }
      },
      { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1], rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, active: inView && phase === "content" };
}
