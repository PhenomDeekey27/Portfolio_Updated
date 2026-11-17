"use client";

import { useEffect, useRef, useState } from "react";
import { getSectionEnvironment } from "@/lib/worlds/environments";

const ENV = getSectionEnvironment("about");
const ASSET = ENV.plate ?? "";

interface ValleyOfTheEndProps {
  revealed?: boolean;
}

/**
 * Valley of the End environment — full-bleed panoramic landscape behind the
 * About section.
 *
 * The image (1672x941, ~16:9) is rendered inside a sticky viewport-tracking
 * band so the composition stays fully visible while the section scrolls:
 *   - desktop: band fills 100svh, so the 16:9 artwork maps ~1:1 to the
 *     viewport and neither statue is cropped;
 *   - mobile/tablet: band keeps a 4:3 ratio, which still fits both statues
 *     and the waterfall horizontally while giving the image more presence.
 *
 * No WebGL canvas, no per-frame React state. All motion is CSS-driven
 * (opacity reveal, slow mist drift, sparse particles paused offscreen).
 * Falls back to a dark navy gradient with a dev-only diagnostic if the
 * landscape image is unavailable.
 */
export default function ValleyOfTheEnd({
  revealed = true,
}: ValleyOfTheEndProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const [hasImage, setHasImage] = useState(true);
  const isDev = process.env.NODE_ENV !== "production";

  const handleImageError = () => {
    setHasImage(false);
    if (isDev) {
      console.error(`[ValleyOfTheEnd] Failed to load ${ASSET}`);
    }
  };

  const handleImageLoad = () => {
    setHasImage(true);
  };

  // Pause ambient motion when the section is out of viewport; resume on return.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { threshold: 0.05, rootMargin: "15% 0% 15% 0%" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-valley-world
      data-world-asset={ASSET}
      className={`pointer-events-none absolute inset-0 overflow-clip bg-[#07111F] ${revealed ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-out`}
    >
      {/* Sticky image band — tracks the viewport so the valley stays in
          frame for the whole section without cropping the statues. */}
      <div className="sticky top-0 aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-[100svh]">
        <img
          src={ASSET}
          alt=""
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="h-full w-full object-cover object-[center_42%]"
          aria-hidden="true"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />

        {/* Fallback when the landscape image is unavailable. */}
        {!hasImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111F] via-[#0B1B2C] to-[#07111F]" />
        )}
        {isDev && !hasImage && (
          <div className="absolute left-4 top-16 z-20 rounded border border-red-500/40 bg-red-950/70 px-3 py-2 font-mono text-[10px] text-red-200">
            Valley image failed to load: {ASSET}
          </div>
        )}

        {/* Top falloff — keeps the navbar legible over the sky. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,17,31,0.75)_0%,rgba(11,27,44,0.3)_12%,rgba(11,27,44,0.06)_28%,transparent_48%)]" />

        {/* Left/right falloff — subtle, keeps text readable on the sides. */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,17,31,0.5)_0%,rgba(7,17,31,0.22)_26%,rgba(7,17,31,0.02)_52%,transparent_74%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(280deg,rgba(7,17,31,0.5)_0%,rgba(7,17,31,0.22)_26%,rgba(7,17,31,0.02)_52%,transparent_74%)]" />

        {/* Restrained cyan chakra atmosphere over the waterfall. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_34%,rgba(56,189,248,0.10)_0%,rgba(96,165,250,0.04)_34%,transparent_62%)]" />

        {/* Bottom vignette of the band — melts into the content below. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,rgba(7,17,31,0.35)_82%,rgba(7,17,31,0.75)_100%)]" />

        {/* Subtle mist layers. */}
        <div className="valley-mist pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_62%,rgba(148,163,184,0.12),transparent_60%)]" />
        <div
          className="valley-mist pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_46%,rgba(56,189,248,0.08),transparent_55%)]"
          style={{ animationDelay: "6s" }}
        />

        {/* Sparse ambient particles — paused offscreen via IntersectionObserver.
            Reduced-motion users get them hidden by CSS (.valley-particles),
            keeping SSR and client markup identical. */}
        {isInViewport && (
          <div
            className="valley-particles absolute inset-0 overflow-hidden"
            style={{ willChange: "transform" }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <span
                key={index}
                className="absolute rounded-full bg-cyan-400/20"
                style={{
                  left: `${20 + index * 11}%`,
                  top: `${28 + (index % 3) * 14}%`,
                  width: `${2 + (index % 3)}px`,
                  height: `${2 + (index % 3)}px`,
                  opacity: `${0.3 + (index % 3) * 0.1}`,
                  animation: `valleyDrift ${14 + index * 3}s ease-in-out ${index * 1.3}s infinite`,
                  willChange: "transform, opacity",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}