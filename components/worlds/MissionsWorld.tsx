"use client";

import { useEffect, useRef, useState } from "react";
import { getSectionEnvironment } from "@/lib/worlds/environments";

const ENV = getSectionEnvironment("missions");
const ASSET = ENV.plate ?? "";

/**
 * Hidden Leaf mission headquarters environment.
 *
 * A static cinematic plate (mission table, Land of Fire map, scroll shelves,
 * lantern light, Hokage window) with layered CSS atmosphere. Kept deliberately
 * lightweight: one local image, no WebGL, no per-frame React work.
 *
 * PHASE 6.11 — the plate is resolved from `lib/worlds/environments.ts` (the
 * approved v3 mission-headquarters painting) and published as
 * `data-world-asset`, so the Missions environment can never resolve to the
 * Training Grounds plate used by the Skills section.
 */
export default function MissionsWorld() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.02, rootMargin: "20% 0% 20% 0%" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-missions-world
      data-world-asset={ASSET}
      className="pointer-events-none absolute inset-0 overflow-clip bg-[#070806]"
    >
      <div className="sticky top-0 h-[100lvh] w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-[position:74%_center] sm:bg-[position:66%_center] lg:bg-center"
          style={{ backgroundImage: `url("${ASSET}")` }}
        />

        {/* Readability scrim: dark at the left and top, warm at the lantern.
            Left-hand density is enough for the dossier column without
            flattening the room's depth. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,7,6,0.66)_0%,rgba(6,7,6,0.4)_22%,rgba(6,7,6,0.2)_44%,rgba(6,7,6,0.24)_72%,rgba(6,7,6,0.44)_92%,rgba(6,7,6,0.54)_100%)] sm:bg-[linear-gradient(90deg,rgba(6,7,6,0.86)_0%,rgba(6,7,6,0.58)_34%,rgba(6,7,6,0.12)_66%,rgba(6,7,6,0.4)_100%)]" />
        {/* Lantern warmth pooling over the briefing table. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_66%_44%,rgba(255,196,120,0.09)_0%,rgba(255,196,120,0.03)_38%,transparent_64%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_52%,rgba(7,8,6,0.18)_74%,rgba(7,8,6,0.4)_90%,rgba(7,8,6,0.5)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_24%,rgba(201,163,95,0.16)_0%,rgba(201,163,95,0.05)_34%,transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,transparent_0%,rgba(4,5,4,0.26)_78%,rgba(4,5,4,0.5)_100%)]" />
        {/* Portrait only: the 74% crop brings the Hokage window into frame, so
            add a slim top band of shade behind the heading and intro. */}
        <div
          data-missions-top-scrim
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,7,6,0.14)_0%,rgba(6,7,6,0.42)_14%,rgba(6,7,6,0.42)_34%,rgba(6,7,6,0.14)_43%,transparent_56%)] sm:hidden"
        />

        {/* Drifting dust, paused outside the viewport. */}
        {isInViewport ? (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-amber-200"
                style={{
                  left: `${8 + ((i * 17) % 84)}%`,
                  top: `${14 + ((i * 23) % 72)}%`,
                  width: `${1.5 + (i % 3) * 0.8}px`,
                  height: `${1.5 + (i % 3) * 0.8}px`,
                  opacity: 0.1 + (i % 4) * 0.04,
                  animation: `valleyDrift ${18 + (i % 7) * 3}s ease-in-out ${(i % 6) * 1.3}s infinite`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
