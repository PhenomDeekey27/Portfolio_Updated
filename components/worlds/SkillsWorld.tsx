"use client";

import { useEffect, useRef, useState } from "react";
import { getSectionEnvironment } from "@/lib/worlds/environments";

interface SkillsWorldProps {
  revealed?: boolean;
}

const ENV = getSectionEnvironment("skills");
const ASSET = ENV.plate ?? "";

/**
 * Training Grounds environment behind the Skills section.
 *
 * PHASE 6.11 — the plate is now a sticky, viewport-tracking band (the same
 * pattern About/Missions/Experience use) instead of an `inset-0` image sized to
 * the full section height. The old version scaled the 1672×941 artwork 2.1× to
 * cover a ~2000px section, so the head of the section showed an abstract blur
 * and the tail ended on a near-black crop directly above the Missions plate —
 * which read as one continuous environment across the Skills→Missions seam.
 *
 * Same asset, same object-position anchors, same overlays, same dust. No new
 * dependencies, no per-frame React work.
 */
export default function SkillsWorld({ revealed = true }: SkillsWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const [hasImage, setHasImage] = useState(true);
  const isDev = process.env.NODE_ENV !== "production";

  const handleImageError = () => {
    setHasImage(false);
    if (isDev) {
      console.error(`[SkillsWorld] Failed to load ${ASSET}`);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setIsInViewport(entry.isIntersecting);
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
      data-skills-world
      data-world-asset={ASSET}
      className={`pointer-events-none absolute inset-0 overflow-clip bg-[#0a120d] ${revealed ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-out`}
    >
      {/* Sticky band: the environment holds still while the records scroll
          over it, and it covers every pixel of the section (no tail strip). */}
      <div className="sticky top-0 h-[100lvh] w-full overflow-hidden">
        {hasImage && (
          <img
            src={ASSET}
            alt=""
            onLoad={() => setHasImage(true)}
            onError={handleImageError}
            className="h-full w-full object-cover object-[center_46%] sm:object-[center_44%] lg:object-[center_42%]"
            aria-hidden="true"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        )}
        {!hasImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a120d] via-[#12201a] to-[#0a120d]" />
        )}
        {isDev && !hasImage && (
          <div className="absolute left-4 top-16 z-20 rounded border border-red-500/40 bg-red-950/70 px-3 py-2 font-mono text-[10px] text-red-200">
            Skills image failed to load: {ASSET}
          </div>
        )}

        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,18,13,0.55)_0%,rgba(10,18,13,0.2)_25%,rgba(10,18,13,0.05)_45%,rgba(10,18,13,0.6)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,175,55,0.10)_0%,transparent_60%)]" />

        {/* Subtle mist/leaves */}
        {isInViewport && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-amber-200/20"
                style={{
                  left: `${10 + i * 9}%`,
                  top: `${20 + (i % 4) * 12}%`,
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`,
                  opacity: 0.35,
                  animation: `valleyDrift ${16 + i * 2}s ease-in-out ${i * 0.8}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
