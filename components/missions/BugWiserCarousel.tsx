"use client";

import { getImageProps } from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bugwiserScreens } from "@/lib/data/bugwiserGallery";

const COUNT = bugwiserScreens.length;
const AUTOPLAY_MS = 2000;

const DESKTOP_SIZES = "(max-width: 1279px) 92vw, 1180px";
const MOBILE_SIZES = "100vw";

/**
 * Art direction for the real screenshots: a 1440×900 capture on desktop and a
 * 390×844 capture on phones, served through `<picture>` so only the matching
 * file downloads. This is the Next.js-documented use of `getImageProps`.
 */
const SCREEN_IMAGES = bugwiserScreens.map((screen) => {
  const desktop = getImageProps({
    src: screen.desktop.src,
    alt: screen.alt,
    width: screen.desktop.width,
    height: screen.desktop.height,
    sizes: DESKTOP_SIZES,
  }).props;
  const mobile = getImageProps({
    src: screen.mobile.src,
    alt: screen.alt,
    width: screen.mobile.width,
    height: screen.mobile.height,
    sizes: MOBILE_SIZES,
  }).props;

  return { desktop, mobile };
});

/**
 * Large floating screenshot deck for BugWiser.
 *
 * All slides stay mounted and are positioned by a signed offset, so changing
 * the index is a depth/transform/opacity transition rather than an image swap.
 * The active screen sits in front at full size; its neighbours drift behind it
 * in 3D, dimmed and softly lit by the gold environment. There is no card
 * around the group.
 *
 * Autoplay is 2s and runs only while the deck is in view and the tab is
 * visible. It pauses on hover, on keyboard focus-visible inside the carousel,
 * and during a touch gesture. Reduced motion disables autoplay and perspective
 * but keeps every manual control.
 */
export default function BugWiserCarousel() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [touching, setTouching] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const paused = hovered || focusVisible || touching;

  useEffect(() => {
    if (reduced || !inView || !tabVisible || paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % COUNT);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, inView, tabVisible, paused, index]);

  const go = (delta: number) => {
    setIndex((current) => (current + delta + COUNT) % COUNT);
  };

  const onFocusCapture = () => {
    const active = document.activeElement as HTMLElement | null;
    setFocusVisible(Boolean(active?.matches(":focus-visible")));
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusVisible(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouching(true);
    touchX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchX.current;
    const end = event.changedTouches[0]?.clientX;
    if (start !== null && typeof end === "number") {
      const delta = end - start;
      if (Math.abs(delta) > 36) go(delta < 0 ? 1 : -1);
    }
    touchX.current = null;
    setTouching(false);
  };

  const offsetOf = (slideIndex: number) => {
    let delta = slideIndex - index;
    if (delta > COUNT / 2) delta -= COUNT;
    if (delta < -COUNT / 2) delta += COUNT;
    return delta;
  };

  const current = bugwiserScreens[index];

  return (
    <div
      ref={rootRef}
      className="bw-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="BugWiser application screenshots"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlur}
      onKeyDown={onKeyDown}
    >
      <p className="sr-only">
        Screenshots change automatically every 2 seconds. Use the previous and
        next buttons, the position indicators, or the left and right arrow keys.
      </p>

      <div
        className="bw-deck"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => setTouching(false)}
      >
        <span aria-hidden="true" className="bw-deck-halo" />

        {bugwiserScreens.map((screen, slideIndex) => {
          const offset = offsetOf(slideIndex);
          const active = offset === 0;
          const depth = Math.min(Math.abs(offset), 1);
          const style = {
            // 38% clears half the active frame, so the neighbours read as
            // floating screens behind it instead of hiding underneath it.
            "--bw-x": `${offset * 38}%`,
            "--bw-y": `${depth * -3}%`,
            "--bw-z": `${depth * -180}px`,
            "--bw-ry": `${offset * -10}deg`,
            "--bw-rx": `${depth * 3}deg`,
            "--bw-scale": 1 - depth * 0.12,
            "--bw-o": active ? 1 : depth === 1 ? 0.5 : 0,
            "--bw-zindex": 4 - depth,
          } as CSSProperties;
          const images = SCREEN_IMAGES[slideIndex];

          return (
            <figure
              key={screen.id}
              className={`bw-slide ${active ? "is-active" : ""}`}
              style={style}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${COUNT}: ${screen.label}`}
              aria-hidden={active ? undefined : true}
            >
              <div className="bw-slide-frame">
                <picture>
                  <source
                    media="(max-width: 639px)"
                    srcSet={images.mobile.srcSet}
                    sizes={images.mobile.sizes}
                  />
                  <source
                    media="(min-width: 640px)"
                    srcSet={images.desktop.srcSet}
                    sizes={images.desktop.sizes}
                  />
                  {/* Art direction needs <picture>; the srcSet comes from next/image getImageProps. */}
                  <img
                    {...images.desktop}
                    alt={screen.alt}
                    className="bw-shot"
                    loading={active ? "eager" : "lazy"}
                    fetchPriority={active ? "high" : "auto"}
                    decoding="async"
                  />
                </picture>
                <span aria-hidden="true" className="bw-slide-light" />
                <span aria-hidden="true" className="bw-slide-corner bw-slide-corner-tl" />
                <span aria-hidden="true" className="bw-slide-corner bw-slide-corner-br" />
              </div>
            </figure>
          );
        })}
      </div>

      <div className="bw-carousel-info">
        <p className="bw-carousel-count">
          {String(index + 1).padStart(2, "0")}{" "}
          <span>/ {String(COUNT).padStart(2, "0")}</span>
        </p>

        <p
          className="bw-carousel-label"
          aria-live={paused || reduced ? "polite" : "off"}
          aria-atomic="true"
        >
          <span key={current.id} className="bw-carousel-label-main">
            {current.label}
          </span>
          <span className="bw-carousel-caption">{current.caption}</span>
        </p>

        <p className="bw-autoplay-status" aria-hidden="true">
          <span className={`bw-autoplay-dot ${reduced || paused ? "is-paused" : ""}`} />
          {reduced ? "Manual" : paused ? "Paused" : "Auto · 2s"}
        </p>
      </div>

      <div className="bw-controls">
        <button
          type="button"
          className="bw-control"
          onClick={() => go(-1)}
          aria-label="Previous BugWiser screenshot"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="bw-dots" role="group" aria-label="Choose a BugWiser screenshot">
          {bugwiserScreens.map((screen, dotIndex) => {
            const active = dotIndex === index;
            return (
              <button
                key={screen.id}
                type="button"
                className={`bw-dot ${active ? "is-active" : ""}`}
                onClick={() => setIndex(dotIndex)}
                aria-label={`Show screenshot ${dotIndex + 1}: ${screen.label}`}
                aria-current={active ? "true" : undefined}
              >
                <span aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="bw-control"
          onClick={() => go(1)}
          aria-label="Next BugWiser screenshot"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
