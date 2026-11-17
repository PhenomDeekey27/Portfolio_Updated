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
import { resqScreens } from "@/lib/data/resqGallery";

const COUNT = resqScreens.length;
const AUTOPLAY_MS = 2000;
const SIZES = "(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 430px";

/**
 * Portrait screenshots, so the deck is sized from the screen height instead of
 * a landscape aspect ratio. The neighbours are always adjacent in the running
 * order, which keeps the deck readable as one continuous set of screens.
 */
const SCREEN_IMAGES = resqScreens.map((screen) =>
  getImageProps({
    src: screen.image.src,
    alt: screen.alt,
    width: screen.image.width,
    height: screen.image.height,
    sizes: SIZES,
  }).props
);

/**
 * Floating portrait deck for the running ResQ application.
 *
 * Every screen stays mounted and is placed by a signed offset, so a change of
 * index is a transform/opacity transition rather than an image swap. The active
 * screen sits in front at full size, with its neighbours offset behind it in
 * perspective and dimmed under the teal environment.
 *
 * Autoplay is 2s and runs only while the deck is in view and the tab is
 * visible. It pauses on hover, on keyboard focus inside the carousel, and
 * during a touch gesture. Reduced motion turns autoplay and perspective off but
 * keeps every manual control.
 */
export default function ResQGallery() {
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

  /** Shortest signed distance in the running order. */
  const offsetOf = (slideIndex: number) => {
    let delta = slideIndex - index;
    if (delta > COUNT / 2) delta -= COUNT;
    if (delta < -COUNT / 2) delta += COUNT;
    return delta;
  };

  const current = resqScreens[index];

  return (
    <div
      ref={rootRef}
      className="wnd-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="ResQ application screenshots"
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
        className="wnd-deck"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => setTouching(false)}
      >
        <span aria-hidden="true" className="wnd-deck-halo" />

        {resqScreens.map((screen, slideIndex) => {
          const offset = offsetOf(slideIndex);
          const active = offset === 0;
          const distance = Math.abs(offset);
          const depth = Math.min(distance, 1);
          const style = {
            "--wnd-x": `${offset * 62}%`,
            "--wnd-y": `${depth * 2.4}%`,
            "--wnd-z": `${depth * -190}px`,
            "--wnd-ry": `${offset * -13}deg`,
            "--wnd-rx": `${depth * 4}deg`,
            "--wnd-scale": 1 - depth * 0.14,
            // Only the active screen and its two immediate neighbours are
            // visible; further screens stay mounted but fully transparent.
            "--wnd-o": active ? 1 : distance === 1 ? 0.45 : 0,
            "--wnd-zindex": 4 - depth,
          } as CSSProperties;
          const image = SCREEN_IMAGES[slideIndex];

          return (
            <figure
              key={screen.id}
              className={`wnd-slide ${active ? "is-active" : ""}`}
              style={style}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${COUNT}: ${screen.label}`}
              aria-hidden={active ? undefined : true}
            >
              <div className="wnd-slide-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  {...image}
                  alt={screen.alt}
                  className="wnd-shot"
                  loading={active ? "eager" : "lazy"}
                  fetchPriority={active ? "high" : "auto"}
                  decoding="async"
                />
                <span aria-hidden="true" className="wnd-slide-light" />
                <span
                  aria-hidden="true"
                  className="wnd-slide-corner wnd-slide-corner-tl"
                />
                <span
                  aria-hidden="true"
                  className="wnd-slide-corner wnd-slide-corner-br"
                />
              </div>
            </figure>
          );
        })}
      </div>

      <div className="wnd-carousel-info">
        <p className="wnd-carousel-count">
          {String(index + 1).padStart(2, "0")}{" "}
          <span>/ {String(COUNT).padStart(2, "0")}</span>
        </p>

        <p
          className="wnd-carousel-label"
          aria-live={paused || reduced ? "polite" : "off"}
          aria-atomic="true"
        >
          <span key={current.id} className="wnd-carousel-label-main">
            {current.label}
          </span>
          <span className="wnd-carousel-caption">{current.caption}</span>
        </p>

        <p className="wnd-autoplay-status" aria-hidden="true">
          <span
            className={`wnd-autoplay-dot ${reduced || paused ? "is-paused" : ""}`}
          />
          {reduced ? "Manual" : paused ? "Paused" : "Auto · 2s"}
        </p>
      </div>

      <div className="wnd-controls">
        <button
          type="button"
          className="wnd-control"
          onClick={() => go(-1)}
          aria-label="Previous ResQ screenshot"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="wnd-dots" role="group" aria-label="Choose a ResQ screenshot">
          {resqScreens.map((screen, dotIndex) => {
            const active = dotIndex === index;
            return (
              <button
                key={screen.id}
                type="button"
                className={`wnd-dot ${active ? "is-active" : ""}`}
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
          className="wnd-control"
          onClick={() => go(1)}
          aria-label="Next ResQ screenshot"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
