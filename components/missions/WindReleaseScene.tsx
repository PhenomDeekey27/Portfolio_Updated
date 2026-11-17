"use client";

import { ArrowDown } from "lucide-react";
import type { Mission } from "@/lib/data/missions";
import { resqScreens } from "@/lib/data/resqGallery";
import ResQGallery from "./ResQGallery";
import ResQRecord from "./ResQRecord";
import { useEncounterActive } from "./useEncounterActive";

/**
 * PHASE 6.11 — GRAND WIND RELEASE.
 *
 * ResQ opens as a five-stage protective wind technique:
 *
 *   1 atmosphere  — charcoal stage, teal light bloom, wind motes
 *   2 gathering   — far air strata, wide translucent ribbons, a broken vortex
 *                   band and six mirrored current pairs sweep in from the
 *                   viewport edges; motes ride the currents to the centre
 *   3 formation   — a 600px protective ring of broken arcs, dashed rings, gust
 *                   marks and an igniting teal core
 *   4 release     — three energy rings and an anisotropic wind wave expand
 *                   across the viewport, then disperse into spray
 *   5 reveal      — RESQ unmasks through the opening, then role, intro, notes,
 *                   gallery and the verified record
 *
 * Authored SVG/CSS on one fixed 1440×900 viewBox plus HTML motes. No canvas, no
 * requestAnimationFrame, no per-frame React state, no scroll listener, no scroll
 * lock. Base styles are the *settled* composition and `useEncounterActive`
 * re-arms the timeline on every entry into the reading band (phase 6.13), so
 * reduced motion and a failed observer still show the complete scene.
 *
 * PHASE 6.14 — one animation per layer group instead of one per element.
 *
 * PHASE 6.15 — the field is now six separate `<svg>` plates, one per depth
 * band. Phase 6.14 removed the per-element timelines, but the measurement still
 * showed the stage repainting a 1.4-megapixel SVG every frame: an SVG child
 * group animation is not composited, so the *whole* root re-rasters each frame
 * no matter how few timelines drive it. Halving the painted area took the
 * scene from 21 to 48 fps, which pinned the cost on raster area rather than on
 * animation count or property choice.
 *
 * So each band is its own SVG box and animates only `transform`/`opacity` at the
 * plate level. Each plate rasterises once and is then moved by the compositor,
 * and the choreography is unchanged: the air sweeps in from the right, the
 * flow from the left, the motes ride to the centre, the formation closes, the
 * impulse flashes, the release expands and disperses. The interior of every
 * plate is completely static art — no dashed, hinted, or filtered path runs a
 * timeline of its own.
 *
 * Plates cannot share `<defs>` (a paint server referenced from another SVG root
 * does not resolve), so each plate carries its own prefixed copy of the eight
 * gradients.
 */

type Strand = {
  d: string;
  width: number;
  delay: number;
  duration: number;
  tone?: "core" | "edge";
};

/** Far depth: quiet air crossing the stage. */
const STRATA: Strand[] = [
  {
    d: "M-180 838 C 300 750, 720 556, 1064 398 C 1256 310, 1430 242, 1640 194",
    width: 15,
    delay: 0,
    duration: 2300,
  },
  {
    d: "M-180 574 C 288 512, 704 380, 1052 268 C 1246 202, 1424 154, 1640 118",
    width: 9,
    delay: 120,
    duration: 2100,
  },
  {
    d: "M-180 986 C 316 886, 732 664, 1072 500 C 1262 410, 1434 340, 1640 294",
    width: 21,
    delay: 240,
    duration: 2420,
  },
];

/** Broad translucent ribbons: the body of the gathering air. */
const RIBBONS: Strand[] = [
  {
    d: "M-220 836 C 260 742, 600 546, 862 384 C 1124 222, 1330 142, 1660 88",
    width: 30,
    delay: 0,
    duration: 2200,
  },
  {
    d: "M-220 626 C 246 548, 592 400, 866 272 C 1130 150, 1338 92, 1660 52",
    width: 13,
    delay: 150,
    duration: 2060,
  },
  {
    d: "M-220 1000 C 272 892, 606 692, 866 534 C 1130 374, 1336 292, 1660 240",
    width: 40,
    delay: 260,
    duration: 2360,
  },
];

/** Broken air rings: the wind circulating around the formation. */
const VORTEX = [
  { r: 424, width: 3.2, dash: "580 2080", rotate: 6, opacity: 0.36 },
  { r: 468, width: 2.2, dash: "720 2220", rotate: 122, opacity: 0.26 },
  { r: 516, width: 1.8, dash: "540 2700", rotate: 244, opacity: 0.2 },
];

/** Two long spirals: the air actually wrapping the technique. */
const SPIRALS = [
  {
    d: "M 720 450 C 786 450, 820 484, 820 536 C 820 606, 756 648, 684 648 C 592 648, 540 574, 540 482 C 540 368, 622 296, 736 296 C 868 296, 952 390, 952 514 C 952 656, 846 750, 698 750",
    width: 2.6,
    opacity: 0.34,
    rotate: 0,
  },
  {
    d: "M 720 450 C 654 450, 620 416, 620 364 C 620 294, 684 252, 756 252 C 848 252, 900 326, 900 418 C 900 532, 818 604, 704 604 C 572 604, 488 510, 488 386 C 488 244, 594 150, 742 150",
    width: 1.8,
    opacity: 0.26,
    rotate: 180,
  },
];

/** Thin currents that visibly converge on the centre. */
const CURRENTS: Strand[] = [
  {
    d: "M-160 742 C 220 690, 430 600, 598 512 C 668 476, 700 464, 726 452",
    width: 2.6,
    delay: 0,
    duration: 1350,
    tone: "core",
  },
  {
    d: "M-160 604 C 226 556, 430 496, 596 434 C 666 408, 700 400, 726 394",
    width: 3.8,
    delay: 60,
    duration: 1420,
    tone: "edge",
  },
  {
    d: "M-160 468 C 218 440, 414 400, 588 362 C 662 346, 698 340, 726 336",
    width: 2.2,
    delay: 120,
    duration: 1280,
    tone: "core",
  },
  {
    d: "M-160 332 C 214 330, 406 340, 580 366 C 656 378, 696 396, 724 408",
    width: 3.2,
    delay: 170,
    duration: 1450,
    tone: "edge",
  },
  {
    d: "M-160 196 C 206 226, 396 292, 572 368 C 650 402, 692 430, 724 448",
    width: 2.0,
    delay: 230,
    duration: 1380,
    tone: "core",
  },
  {
    d: "M-160 876 C 236 812, 442 726, 606 626 C 674 584, 700 566, 726 548",
    width: 2.8,
    delay: 280,
    duration: 1480,
    tone: "edge",
  },
];

/** Broken protective arcs — a segmented band, deliberately not a spinner. */
const ARCS = [
  { r: 296, width: 6, dash: "200 1660", rotate: 8, opacity: 0.55 },
  { r: 296, width: 2.6, dash: "120 1740", rotate: 78, opacity: 0.4 },
  { r: 296, width: 4, dash: "170 1690", rotate: 150, opacity: 0.5 },
  { r: 296, width: 2.2, dash: "90 1770", rotate: 228, opacity: 0.36 },
  { r: 296, width: 5, dash: "150 1710", rotate: 302, opacity: 0.45 },
  { r: 252, width: 4, dash: "160 1424", rotate: 40, opacity: 0.5 },
  { r: 252, width: 2.4, dash: "110 1474", rotate: 128, opacity: 0.38 },
  { r: 252, width: 3.4, dash: "140 1444", rotate: 214, opacity: 0.44 },
  { r: 252, width: 2, dash: "80 1504", rotate: 288, opacity: 0.34 },
  { r: 214, width: 3, dash: "130 1214", rotate: 60, opacity: 0.4 },
  { r: 214, width: 2.4, dash: "90 1254", rotate: 200, opacity: 0.34 },
];

/** Gust marks that close rank around the formation. */
const GUSTS = Array.from({ length: 28 }, (_, index) => {
  const angle = (index * 360) / 28 + 4;
  const radius = 322 + (index % 4) * 16;
  const length = 34 + (index % 5) * 18;
  return { angle, radius, length, delay: 860 + (index % 9) * 55 };
});

/** Release wave ribs that expand past the formation. */
const WAVE_RIBS = [
  { d: "M-120 268 C 360 218, 1020 218, 1560 262", width: 16, delay: 2200 },
  { d: "M-120 372 C 380 306, 1040 306, 1560 366", width: 9, delay: 2280 },
  { d: "M-120 540 C 380 618, 1040 618, 1560 534", width: 12, delay: 2360 },
  { d: "M-120 664 C 360 724, 1020 724, 1560 660", width: 6, delay: 2430 },
];

/** Deterministic scatter (no Math.random → no SSR/client drift). */
const MOTES = Array.from({ length: 26 }, (_, index) => ({
  left: 7 + ((index * 37) % 86),
  top: 10 + ((index * 53) % 80),
  size: 2 + (index % 3) * 1.1,
  delay: 220 + (index % 8) * 90,
  drift: index % 4,
}));

const SPRAY = Array.from({ length: 22 }, (_, index) => ({
  variant: index % 4,
  delay: 2220 + (index % 7) * 70,
  size: 1.4 + (index % 3) * 0.7,
  opacity: 0.3 + (index % 4) * 0.12,
}));

const TRAVEL = Array.from({ length: 18 }, (_, index) => ({
  variant: index % 4,
  delay: 480 + (index % 6) * 130,
  size: 1.7 + (index % 3) * 0.8,
}));

/**
 * PHASE 6.15 — the shared paint servers, duplicated per plate with a prefix.
 * A gradient defined in one SVG root cannot be referenced from another, so each
 * plate gets its own copy of the eight it needs.
 */
function WindDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-current-core`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0895a7" stopOpacity="0" />
        <stop offset="0.42" stopColor="#67e8f9" stopOpacity="0.7" />
        <stop offset="1" stopColor="#0895a7" stopOpacity="1" />
      </linearGradient>
      <linearGradient id={`${id}-current-edge`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#67e8f9" stopOpacity="0" />
        <stop offset="0.6" stopColor="#a5f3fc" stopOpacity="0.45" />
        <stop offset="1" stopColor="#0895a7" stopOpacity="0.75" />
      </linearGradient>
      <linearGradient id={`${id}-ribbon`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#0895a7" stopOpacity="0" />
        <stop offset="0.3" stopColor="#67e8f9" stopOpacity="0.24" />
        <stop offset="0.66" stopColor="#a5f3fc" stopOpacity="0.15" />
        <stop offset="1" stopColor="#0895a7" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-strata`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0b4a55" stopOpacity="0" />
        <stop offset="0.38" stopColor="#0895a7" stopOpacity="0.24" />
        <stop offset="0.74" stopColor="#67e8f9" stopOpacity="0.16" />
        <stop offset="1" stopColor="#0b4a55" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-wave-rib`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a5f3fc" stopOpacity="0" />
        <stop offset="0.4" stopColor="#a5f3fc" stopOpacity="0.5" />
        <stop offset="0.7" stopColor="#67e8f9" stopOpacity="0.26" />
        <stop offset="1" stopColor="#0895a7" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-core-fill`}>
        <stop offset="0" stopColor="#c9fbfe" stopOpacity="0.3" />
        <stop offset="0.34" stopColor="#67e8f9" stopOpacity="0.14" />
        <stop offset="0.7" stopColor="#0895a7" stopOpacity="0.06" />
        <stop offset="1" stopColor="#070806" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-pulse-fill`}>
        <stop offset="0" stopColor="#a5f3fc" stopOpacity="0.55" />
        <stop offset="0.5" stopColor="#0895a7" stopOpacity="0.3" />
        <stop offset="1" stopColor="#0895a7" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-sheet-fill`}>
        <stop offset="0" stopColor="#a5f3fc" stopOpacity="0.22" />
        <stop offset="0.46" stopColor="#67e8f9" stopOpacity="0.14" />
        <stop offset="1" stopColor="#0895a7" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const PLATE_VIEWBOX = "0 0 1440 900";

export default function WindReleaseScene({
  mission,
  index,
}: {
  mission: Mission;
  index: number;
}) {
  const { ref, active } = useEncounterActive<HTMLElement>();
  const code = String(index + 1).padStart(2, "0");
  const [classification, discipline] = mission.category.split(" · ");

  return (
    <article
      data-encounter={mission.id}
      data-jutsu="wind"
      data-active={active ? "true" : "false"}
      className="wnd border-t border-gold/10 first:border-t-0"
    >
      {/* ---------------- A — protective formation ---------------- */}
      <section ref={ref} className="wnd-stage" aria-labelledby="wnd-title">
        <span className="wnd-env" aria-hidden="true" />
        <span className="wnd-atmos" aria-hidden="true" />
        <span className="wnd-veil" aria-hidden="true" />

        {/* PHASE 6.15 — six composited plates, one per depth band. */}
        <div className="wnd-field" aria-hidden="true">
          {/* AIR — far strata and the broad translucent ribbons */}
          <div className="wnd-plate wnd-plate-air">
            <svg
              style={{ width: "100%", height: "100%", display: "block" }}
            viewBox={PLATE_VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <WindDefs id="wnd-air" />
            <g className="wnd-strata">
              {STRATA.map((strand, strandIndex) => (
                <path
                  key={`strata-${strandIndex}`}
                  className="wnd-stratum"
                  d={strand.d}
                  stroke="url(#wnd-air-strata)"
                  strokeWidth={strand.width}
                  strokeLinecap="round"
                />
              ))}
              <g transform="translate(1440 0) scale(-1 1)">
                {STRATA.map((strand, strandIndex) => (
                  <path
                    key={`strata-m-${strandIndex}`}
                    className="wnd-stratum"
                    d={strand.d}
                    stroke="url(#wnd-air-strata)"
                    strokeWidth={strand.width}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </g>

            <g className="wnd-ribbons">
              {RIBBONS.map((ribbon, ribbonIndex) => (
                <path
                  key={`ribbon-${ribbonIndex}`}
                  className="wnd-ribbon"
                  d={ribbon.d}
                  stroke="url(#wnd-air-ribbon)"
                  strokeWidth={ribbon.width}
                  strokeLinecap="round"
                />
              ))}
              <g transform="translate(1440 0) scale(-1 1)">
                {RIBBONS.map((ribbon, ribbonIndex) => (
                  <path
                    key={`ribbon-m-${ribbonIndex}`}
                    className="wnd-ribbon"
                    d={ribbon.d}
                    stroke="url(#wnd-air-ribbon)"
                    strokeWidth={ribbon.width}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </g>
          </svg>
          </div>

          {/* FLOW — vortex band, spirals and the converging currents */}
          <div className="wnd-plate wnd-plate-flow">
            <svg
              style={{ width: "100%", height: "100%", display: "block" }}
            viewBox={PLATE_VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <WindDefs id="wnd-flow" />
            <g className="wnd-vortex">
              {VORTEX.map((ring, ringIndex) => (
                <circle
                  key={`vortex-${ringIndex}`}
                  className="wnd-vortex-ring"
                  cx="720"
                  cy="450"
                  r={ring.r}
                  stroke="url(#wnd-flow-current-edge)"
                  strokeOpacity={ring.opacity}
                  strokeWidth={ring.width}
                  strokeLinecap="round"
                  strokeDasharray={ring.dash}
                  transform={`rotate(${ring.rotate} 720 450)`}
                />
              ))}
            </g>

            <g className="wnd-spirals">
              {SPIRALS.map((spiral, spiralIndex) => (
                <path
                  key={`spiral-${spiralIndex}`}
                  className="wnd-spiral"
                  d={spiral.d}
                  stroke="url(#wnd-flow-current-edge)"
                  strokeOpacity={spiral.opacity}
                  strokeWidth={spiral.width}
                  strokeLinecap="round"
                />
              ))}
            </g>

            <g className="wnd-currents">
              {CURRENTS.map((current, currentIndex) => (
                <path
                  key={`current-${currentIndex}`}
                  className="wnd-current"
                  d={current.d}
                  stroke={`url(#wnd-flow-current-${current.tone})`}
                  strokeWidth={current.width}
                  strokeLinecap="round"
                />
              ))}
              <g transform="translate(1440 0) scale(-1 1)">
                {CURRENTS.map((current, currentIndex) => (
                  <path
                    key={`current-m-${currentIndex}`}
                    className="wnd-current"
                    d={current.d}
                    stroke={`url(#wnd-flow-current-${current.tone})`}
                    strokeWidth={current.width}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </g>
          </svg>
          </div>

          {/* TRAVEL — motes riding the currents to the centre */}
          <div className="wnd-plate wnd-plate-travel">
            <svg
              style={{ width: "100%", height: "100%", display: "block" }}
            viewBox={PLATE_VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <g className="wnd-travel">
              {TRAVEL.map((mote, moteIndex) => (
                <circle
                  key={`travel-${moteIndex}`}
                  className={`wnd-travel-mote wnd-travel-${mote.variant}`}
                  cx="720"
                  cy="450"
                  r={mote.size}
                  fill="#d6feff"
                />
              ))}
            </g>
          </svg>
          </div>

          {/* FORM — the protective ring that stays */}
          <div className="wnd-plate wnd-plate-form">
            <svg
              style={{ width: "100%", height: "100%", display: "block" }}
            viewBox={PLATE_VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <WindDefs id="wnd-form" />
            <circle
              className="wnd-core"
              cx="720"
              cy="450"
              r="330"
              fill="url(#wnd-form-core-fill)"
            />

            <g className="wnd-formation">
              <circle
                className="wnd-halo"
                cx="720"
                cy="450"
                r="302"
                stroke="#0895a7"
                strokeOpacity="0.14"
                strokeWidth="28"
              />
              <circle
                className="wnd-ring wnd-ring-outer"
                cx="720"
                cy="450"
                r="302"
                stroke="#67e8f9"
                strokeOpacity="0.55"
                strokeWidth="2"
                strokeDasharray="3 20"
              />
              <circle
                className="wnd-ring wnd-ring-mid"
                cx="720"
                cy="450"
                r="278"
                stroke="#a5f3fc"
                strokeOpacity="0.42"
                strokeWidth="1.6"
                strokeDasharray="140 62"
              />
              <circle
                className="wnd-ring wnd-ring-inner"
                cx="720"
                cy="450"
                r="176"
                stroke="#a5f3fc"
                strokeOpacity="0.5"
                strokeWidth="2"
              />
              <g className="wnd-arcs">
                {ARCS.map((arc, arcIndex) => (
                  <circle
                    key={`arc-${arcIndex}`}
                    className="wnd-arc"
                    cx="720"
                    cy="450"
                    r={arc.r}
                    stroke={arcIndex % 2 === 0 ? "#a5f3fc" : "#67e8f9"}
                    strokeOpacity={arc.opacity}
                    strokeWidth={arc.width}
                    strokeLinecap="round"
                    strokeDasharray={arc.dash}
                    transform={`rotate(${arc.rotate} 720 450)`}
                  />
                ))}
              </g>
              <g className="wnd-gusts">
                {GUSTS.map((gust, gustIndex) => (
                  <g
                    key={`gust-${gustIndex}`}
                    transform={`rotate(${gust.angle} 720 450)`}
                    className="wnd-gust"
                  >
                    <path
                      d={`M${720 + gust.radius} 450 L${720 + gust.radius + gust.length} 450`}
                      stroke="#a5f3fc"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
            </g>
          </svg>
          </div>

          {/* IMPULSE — the core igniting and its shockwave */}
          <div className="wnd-plate wnd-plate-impulse">
            <svg
              style={{ width: "100%", height: "100%", display: "block" }}
            viewBox={PLATE_VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <WindDefs id="wnd-impulse" />
            <circle className="wnd-ignite" cx="720" cy="450" r="16" fill="#d6feff" />

            <g className="wnd-shocks">
              <circle
                className="wnd-shock wnd-shock-a"
                cx="720"
                cy="450"
                r="240"
                stroke="#a5f3fc"
                strokeOpacity="0.5"
                strokeWidth="2"
              />
              <circle
                className="wnd-shock wnd-shock-b"
                cx="720"
                cy="450"
                r="240"
                stroke="#67e8f9"
                strokeOpacity="0.38"
                strokeWidth="1.4"
              />
            </g>

            <circle
              className="wnd-pulse-core"
              cx="720"
              cy="450"
              r="210"
              fill="url(#wnd-impulse-pulse-fill)"
            />
            <circle
              className="wnd-pulse"
              cx="720"
              cy="450"
              r="210"
              stroke="#67e8f9"
              strokeOpacity="0.55"
              strokeWidth="2.4"
            />
          </svg>
          </div>

          {/* RELEASE — the anisotropic wind wave and its spray */}
          <div className="wnd-plate wnd-plate-release">
            <svg
              style={{ width: "100%", height: "100%", display: "block" }}
            viewBox={PLATE_VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <WindDefs id="wnd-release" />
            <ellipse
              className="wnd-sheet"
              cx="720"
              cy="450"
              rx="232"
              ry="232"
              fill="url(#wnd-release-sheet-fill)"
            />
            <ellipse
              className="wnd-wave-ring wnd-wave-ring-a"
              cx="720"
              cy="450"
              rx="250"
              ry="250"
              stroke="#a5f3fc"
              strokeOpacity="0.45"
              strokeWidth="1.6"
            />
            <ellipse
              className="wnd-wave-ring wnd-wave-ring-b"
              cx="720"
              cy="450"
              rx="250"
              ry="250"
              stroke="#67e8f9"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
            <g className="wnd-wave-ribs">
              {WAVE_RIBS.map((rib, ribIndex) => (
                <path
                  key={`rib-${ribIndex}`}
                  className="wnd-wave-rib"
                  d={rib.d}
                  stroke="url(#wnd-release-wave-rib)"
                  strokeWidth={rib.width}
                  strokeLinecap="round"
                />
              ))}
            </g>
            <g className="wnd-sprays">
              {SPRAY.map((drop, dropIndex) => (
                <circle
                  key={`spray-${dropIndex}`}
                  className="wnd-spray"
                  cx="720"
                  cy="450"
                  r={drop.size}
                  fill="#d6feff"
                  opacity={drop.opacity}
                />
              ))}
            </g>
          </svg>
          </div>
        </div>

        {/* STAGE 1 — wind motes in the open air */}
        <div className="wnd-motes" aria-hidden="true">
          {MOTES.map((mote, moteIndex) => (
            <span
              key={`mote-${moteIndex}`}
              className={`wnd-mote wnd-mote-${mote.drift}`}
              style={{
                left: `${mote.left}%`,
                top: `${mote.top}%`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                animationDelay: `${mote.delay}ms`,
              }}
            />
          ))}
        </div>

        <div className="wnd-copy">
          <p className="wnd-kicker">
            <span aria-hidden="true" className="wnd-kicker-line" />
            Record {code} · Wind Release
          </p>

          <h3 id="wnd-title" className="wnd-title">
            <span className="wnd-title-text">{mission.name}</span>
          </h3>

          <p className="wnd-role">
            {classification} · {discipline}
          </p>

          <p className="wnd-intro">
            An Android app for the minutes after a possible crash. It reads the
            phone&rsquo;s motion sensors while the device travels, asks whether
            you are okay when several signals agree, and — only if you do not
            answer — asks your phone to text the contacts you saved.
          </p>

          <dl className="wnd-notes">
            <div>
              <dt>The problem</dt>
              <dd>
                A person who cannot respond cannot say what happened or where.
                Minutes pass before anyone notices.
              </dd>
            </div>
            <div>
              <dt>Who it helps</dt>
              <dd>
                People who travel alone, riders and drivers, and anyone who
                wants a saved contact told when they stop responding.
              </dd>
            </div>
          </dl>

          <p className="wnd-disclaimer">
            Hackathon prototype. It demonstrates an alerting workflow; it does
            not dispatch ambulances or replace emergency services.
          </p>
        </div>

        <span aria-label={`Mission rank ${mission.rank}`} className="wnd-rank">
          {mission.rank}
        </span>

        <p className="wnd-stage-caption">
          <span aria-hidden="true" className="wnd-stage-dot" />
          Jutsu motif · wind gathers · the formation opens
        </p>

        <a className="wnd-cue" href="#wnd-gallery">
          <span>Explore the build</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>

      {/* ---------------- B — floating portrait deck ---------------- */}
      <section
        className="wnd-gallery"
        id="wnd-gallery"
        aria-labelledby="wnd-gallery-title"
      >
        {/* PHASE 6.14 — the deck moves to its own column on the right; the
            reading column takes the left half of the frame. */}
        <div className="wnd-gallery-inner wnd-gallery-split">
          <div className="wnd-gallery-copy">
            <p className="wnd-kicker wnd-kicker-teal">
              <span aria-hidden="true" className="wnd-kicker-line" />
              Mission intelligence · interface design
            </p>
            <h4 id="wnd-gallery-title" className="wnd-gallery-title">
              Inside the build.
            </h4>
            <p className="wnd-gallery-lede">
              {String(resqScreens.length).padStart(2, "0")} interface designs
              from the ResQ design system — not captures of the release build.
            </p>

            <ul className="wnd-gallery-points">
              <li>
                <span aria-hidden="true" className="wnd-gallery-index">
                  01
                </span>
                <div>
                  <h5>Watches the journey</h5>
                  <p>
                    Reads the phone&rsquo;s motion sensors while the device
                    travels, and only raises its hand when several signals agree
                    something went wrong.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="wnd-gallery-index">
                  02
                </span>
                <div>
                  <h5>Asks before it acts</h5>
                  <p>
                    A confirmation screen gives the traveller a way to say they
                    are fine. Nothing is sent while the question is unanswered.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="wnd-gallery-index">
                  03
                </span>
                <div>
                  <h5>Escalates through the phone</h5>
                  <p>
                    If there is no answer, the app asks the device to message the
                    contacts already saved on it — no account, no server round
                    trip for the alert itself.
                  </p>
                </div>
              </li>
            </ul>

            <div className="wnd-gallery-meta">
              <span className="wnd-gallery-meta-label">Stack</span>
              <ul>
                {mission.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="wnd-gallery-float">
            <ResQGallery />
            <p className="wnd-gallery-hint">
              The deck advances every two seconds — hover, focus or touch to
              hold it, or use the controls.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- C — editorial record ---------------- */}
      <ResQRecord mission={mission} index={index} />
    </article>
  );
}
