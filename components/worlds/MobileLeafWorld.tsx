"use client";

import { useEffect, useState } from "react";
import {
  useReveal,
  type RevealPhase,
} from "@/components/transitions/WorldRevealController";

/**
 * PHASE 6.13 — the Hidden Leaf construction, adapted for phones.
 *
 * Above 1024px the village is a live three.js scene. Below it that canvas is
 * never mounted (a WebGL village on a phone is the wrong trade), so the Home
 * background used to be a still plate that simply appeared — the world story
 * was desktop-only.
 *
 * This is the same story told in DOM and CSS instead of WebGL, driven by the
 * *same* reveal phases as the desktop scene:
 *
 *   WORLD_REVEAL            the sunset bleeds in through a lifting veil
 *   MOUNTAIN_CONSTRUCTION   the far ridge rises
 *   TERRAIN_CONSTRUCTION    the terraced village floor establishes
 *   BUILDING_CONSTRUCTION   near rooftops rise in depth order
 *   ENVIRONMENT_ACTIVATION  windows and street lanterns light
 *   CAMERA_MOVEMENT         the whole layer settles out of a slow push-in
 *
 * What changes from desktop is only the budget: three silhouette layers, a
 * fixed set of lights, six drifting motes, no WebGL, no blur filters, and
 * transform/opacity transitions on static shapes. Nothing scrolls or loops at
 * frame rate beyond the motes.
 *
 * Everything is deterministic (hand-placed coordinates, no Math.random), so
 * server and client markup match, and the settled state is the base style:
 * reduced motion renders the finished village with no construction at all.
 */

const STAGE: Record<RevealPhase, number> = {
  LOADING: 0,
  WORLD_REVEAL: 1,
  MOUNTAIN_CONSTRUCTION: 2,
  TERRAIN_CONSTRUCTION: 3,
  BUILDING_CONSTRUCTION: 4,
  ENVIRONMENT_ACTIVATION: 5,
  CAMERA_MOVEMENT: 6,
  NAVIGATION_REVEAL: 6,
  HERO_TEXT_REVEAL: 6,
  PORTRAIT_REVEAL: 6,
  CTA_REVEAL: 6,
  COMPLETE: 6,
};

type House = { x: number; w: number; h: number; roof: number; windows: number };

/** Mid terrace: the second row of homes under the Hokage slope. */
const MID_HOUSES: House[] = [
  { x: -6, w: 58, h: 38, roof: 15, windows: 2 },
  { x: 58, w: 48, h: 30, roof: 12, windows: 1 },
  { x: 112, w: 62, h: 44, roof: 17, windows: 2 },
  { x: 180, w: 50, h: 32, roof: 13, windows: 1 },
  { x: 236, w: 66, h: 40, roof: 16, windows: 2 },
  { x: 308, w: 52, h: 34, roof: 14, windows: 1 },
  { x: 362, w: 46, h: 28, roof: 12, windows: 1 },
];

/** Near street: larger roofs, closer to the viewer. */
const NEAR_HOUSES: House[] = [
  { x: -14, w: 84, h: 54, roof: 20, windows: 2 },
  { x: 74, w: 70, h: 46, roof: 17, windows: 2 },
  { x: 210, w: 92, h: 58, roof: 22, windows: 2 },
  { x: 306, w: 74, h: 48, roof: 18, windows: 1 },
];

/** Street lanterns along the front row: x position and height off the floor. */
const LANTERNS = [
  { x: 34, y: 44 },
  { x: 152, y: 38 },
  { x: 268, y: 46 },
  { x: 352, y: 36 },
];

/** Six motes — the desktop scene's airborne dust, heavily rationed. */
const MOTES = [
  { left: 12, top: 52, size: 2, delay: 0, duration: 19 },
  { left: 28, top: 68, size: 1.4, delay: 2600, duration: 23 },
  { left: 44, top: 46, size: 2.2, delay: 1200, duration: 21 },
  { left: 62, top: 74, size: 1.6, delay: 4200, duration: 26 },
  { left: 78, top: 58, size: 2, delay: 800, duration: 20 },
  { left: 90, top: 80, size: 1.4, delay: 3400, duration: 24 },
];

function HouseShape({
  house,
  base,
  className,
}: {
  house: House;
  base: number;
  className: string;
}) {
  const top = base - house.h;
  const windowWidth = 7;
  const windowHeight = 9;

  return (
    <g className={className}>
      <rect x={house.x} y={top} width={house.w} height={house.h} />
      <path
        d={`M${house.x - 5} ${top + 1} L${house.x + house.w / 2} ${
          top - house.roof
        } L${house.x + house.w + 5} ${top + 1} Z`}
      />
      {Array.from({ length: house.windows }).map((_, index) => (
        <rect
          key={index}
          className="lw-window"
          x={house.x + 11 + index * (house.w - 30)}
          y={top + house.h * 0.34}
          width={windowWidth}
          height={windowHeight}
        />
      ))}
    </g>
  );
}

export default function MobileLeafWorld() {
  const { phase, markSceneReady } = useReveal();
  const [reduced, setReduced] = useState(false);

  // There is no WebGL scene on this path to report readiness. PHASE 6.16: the
  // controller starts the compact sequence on mount, so this is only a fallback
  // (desktop-width reduced-motion visitors also land on the DOM world). The
  // timer is short so the layer is ready long before the first construction
  // phase needs it.
  useEffect(() => {
    const timer = window.setTimeout(() => markSceneReady(), 260);
    return () => window.clearTimeout(timer);
  }, [markSceneReady]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const stage = reduced ? 6 : STAGE[phase];
  const on = (step: number) => (stage >= step ? "true" : "false");

  return (
    <div
      aria-hidden="true"
      className="leaf-world"
      data-ready={on(1)}
      data-mountains={on(2)}
      data-terrain={on(3)}
      data-buildings={on(4)}
      data-lit={on(5)}
      data-camera={on(6)}
      data-reduced={reduced ? "true" : "false"}
    >
      <span className="lw-sun" />
      <span className="lw-haze" />

      <div className="lw-diorama">
        <svg
          className="lw-scene"
          viewBox="0 0 390 260"
          preserveAspectRatio="xMidYMax slice"
          focusable="false"
        >
          <defs>
            <linearGradient id="lw-sky-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d99a63" stopOpacity="0" />
              <stop offset="0.55" stopColor="#a9754a" stopOpacity="0.18" />
              <stop offset="1" stopColor="#0a1424" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="lw-lamp-glow">
              <stop offset="0" stopColor="#ffcf8d" stopOpacity="0.85" />
              <stop offset="0.45" stopColor="#ffab5e" stopOpacity="0.32" />
              <stop offset="1" stopColor="#ffab5e" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="390" height="260" fill="url(#lw-sky-fade)" />

          {/* Far ridge + the pagoda on the shoulder */}
          <g className="lw-ridge">
            <path
              className="lw-far"
              d="M-10 176 L36 138 L64 156 L96 116 L132 152 L166 132 L200 164 L236 124 L272 152 L306 130 L342 158 L378 136 L400 154 L400 262 L-10 262 Z"
            />
            <path
              className="lw-far lw-pagoda"
              d="M318 140 L330 128 L342 140 L336 140 L336 150 L324 150 L324 140 Z M330 122 L330 128"
            />
          </g>

          {/* Mid terrace */}
          <g className="lw-terrace">
            {MID_HOUSES.map((house) => (
              <HouseShape
                key={`mid-${house.x}`}
                house={house}
                base={214}
                className="lw-mid"
              />
            ))}
          </g>

          {/* Near street */}
          <g className="lw-street">
            {NEAR_HOUSES.map((house) => (
              <HouseShape
                key={`near-${house.x}`}
                house={house}
                base={262}
                className="lw-near"
              />
            ))}
          </g>

          {/* Torii at the head of the avenue */}
          <g className="lw-torii">
            <rect x="180" y="176" width="5" height="62" />
            <rect x="236" y="176" width="5" height="62" />
            <rect x="170" y="168" width="80" height="7" />
            <rect x="176" y="182" width="68" height="5" />
          </g>

          {/* Street lanterns: post, glow, lamp */}
          <g className="lw-lanterns">
            {LANTERNS.map((lantern) => (
              <g key={`lantern-${lantern.x}`}>
                <rect
                  className="lw-post"
                  x={lantern.x - 1.5}
                  y={200 - lantern.y}
                  width="3"
                  height={lantern.y + 62}
                />
                <circle
                  className="lw-glow"
                  cx={lantern.x}
                  cy={196 - lantern.y}
                  r="20"
                  fill="url(#lw-lamp-glow)"
                />
                <circle
                  className="lw-lamp"
                  cx={lantern.x}
                  cy={196 - lantern.y}
                  r="3.4"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="lw-motes">
        {MOTES.map((mote, index) => (
          <span
            key={index}
            className="lw-mote"
            style={{
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              animationDelay: `${mote.delay}ms`,
              animationDuration: `${mote.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
