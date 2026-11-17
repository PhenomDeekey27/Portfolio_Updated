import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenisInstance = instance;
}

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(element, { offset: -80, duration: 1.05 });
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

/**
 * Instantly move to a section without animation.
 * Used under the opaque black transition so the position snap is never visible.
 * Routes through Lenis (immediate) when available so Lenis internal scroll
 * state never snaps back after the lock releases.
 *
 * `align` decides which edge lands in the viewport:
 *  - "start" (forward travel): the section top, so the arriving world fills the
 *    screen. A negative offset would leave the tail of the outgoing section
 *    inside the viewport, which reads as a blank band at the top.
 *  - "end" (reverse travel): the section bottom, so the visitor returns to the
 *    part of the section they were last reading instead of being thrown to the
 *    top of a multi-screen section.
 */
export function scrollToSectionInstant(
  id: string,
  align: "start" | "end" = "start"
) {
  const element = document.getElementById(id);
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const sectionTop = rect.top + window.scrollY;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const top =
    align === "end"
      ? Math.min(
          maxScroll,
          Math.max(0, sectionTop + rect.height - window.innerHeight)
        )
      : Math.max(0, sectionTop);
  // Bypass the transition lock: temporarily clear overflow + start Lenis so
  // the programmatic jump is honoured, then let the caller re-lock.
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = "";
  body.style.overflow = "";
  if (lenisInstance) lenisInstance.start();
  window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
  if (lenisInstance) {
    // Keep Lenis virtual scroll in sync so it never snaps back on unlock.
    lenisInstance.scrollTo(top, { immediate: true });
  }
}

/**
 * Lock / unlock document scrolling. Stops Lenis and prevents wheel / touch /
 * keyboard scrolling via overflow, while keeping the scrollbar to avoid layout shift.
 */
export function setScrollLocked(locked: boolean) {
  if (lenisInstance) {
    if (locked) lenisInstance.stop();
    else lenisInstance.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document.body.style.overflow = locked ? "hidden" : "";
}
