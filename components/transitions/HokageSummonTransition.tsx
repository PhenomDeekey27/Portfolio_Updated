"use client";

import { useReducedMotion } from "framer-motion";
import type { TeleportTransition } from "@/lib/transitions/teleportation";
import HiddenLeafSeal from "@/components/motifs/HiddenLeafSeal";
import WorldUnveil from "./WorldUnveil";

/**
 * HOKAGE MESSAGE SUMMONING — Experience ⇄ Contact.
 *
 * A sealed transmission is sent from the chronicle to the Hokage's chamber:
 *   1. the Chronicle Map folds inward      (creases converge, map panels close)
 *   2. parchment fibre gathers to centre   (radial fibre field contracts)
 *   3. a warm golden chakra seal stamps    (Hidden Leaf seal, gold ink)
 *   4. ink particles and wind spread out   (burst from the seal)
 *   5. a sealed message scroll unfurls     (rollers separate, sheet opens)
 *   6. the chamber is revealed behind it   (parchment veil clips away)
 *
 * Reverse travel tells the same story backwards: the transmission scroll folds
 * back, the seal dissolves into the map's route lines, and the chronicle is
 * revealed. Direction is a CSS animation-direction flip on the same keyframes,
 * so nothing can drift out of sync.
 *
 * No kunai, no rasengan, no chakra aura, no elemental band. All motion is CSS
 * on a phase attribute — React re-renders only when the shared teleport state
 * changes. The overlay root is transparent: the opaque layer is the parchment
 * veil, which is clipped away so the destination world is genuinely revealed.
 */

/** Deterministic ink burst — integers only, so SSR and client agree. */
const INK = Array.from({ length: 24 }, (_, index) => {
  const angle = (index * 360) / 24;
  const radius = 120 + (index % 5) * 46;
  const rad = (angle * Math.PI) / 180;
  return {
    dx: Math.round(Math.cos(rad) * radius),
    dy: Math.round(Math.sin(rad) * radius * 0.72),
    r: 1.4 + (index % 4) * 0.7,
    delay: 360 + (index % 7) * 26,
    opacity: 0.24 + (index % 5) * 0.1,
  };
});

/** Wind strokes that carry the burst outward. */
const GUSTS = [
  { d: "M300 250C420 214 520 232 640 208", w: 3.2, o: 0.5, delay: 420 },
  { d: "M420 306C540 274 640 292 760 266", w: 2, o: 0.38, delay: 470 },
  { d: "M340 190C450 160 540 174 650 152", w: 1.4, o: 0.3, delay: 500 },
];

/** Map routes the seal dissolves into on reverse travel. */
const ROUTES = [
  "M-40 300C120 268 210 322 320 292s150-64 252-34 128 66 224 40 176-56 264-30",
  "M-40 372C122 342 214 392 322 364s148-58 248-28 130 60 226 36 174-50 264-24",
  "M-40 444C118 418 208 462 318 438s146-52 244-22 132 54 228 32 172-44 262-18",
];

export default function HokageSummonTransition({
  transition,
}: {
  transition: TeleportTransition;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const { state, direction } = transition;

  if (state === "IDLE" || state === "COMPLETE") return null;

  if (reducedMotion) {
    return (
      <div
        data-teleport-state={state}
        data-teleport-direction={direction}
        data-testid="hokage-summon-transition"
        role="presentation"
        aria-hidden="true"
        className="hs-overlay fixed inset-0 z-[200] overflow-hidden"
      >
        <WorldUnveil
          state={state}
          direction={direction}
          veilClass="world-veil-scroll"
          unfold
        />
        <div className="hs-flash absolute inset-0" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      data-teleport-state={state}
      data-teleport-direction={direction}
      data-testid="hokage-summon-transition"
      role="presentation"
      aria-hidden="true"
      className="hs-overlay fixed inset-0 z-[200] overflow-hidden"
    >
      <WorldUnveil
        state={state}
        direction={direction}
        veilClass="world-veil-scroll"
        unfold
      >
        <div className="hs-stage absolute inset-0">
          {/* 1 — the chronicle map, folding inward along its creases. */}
          <div className="hs-map" aria-hidden="true">
            <span className="hs-fold hs-fold-left" />
            <span className="hs-fold hs-fold-right" />
            <span className="hs-crease hs-crease-a" />
            <span className="hs-crease hs-crease-b" />
          </div>

          {/* 2 — parchment fibre drawn toward the centre of the sheet. */}
          <div className="hs-gather" aria-hidden="true" />

          {/* 3 — the golden chakra seal. */}
          <div className="hs-seal" aria-hidden="true">
            <HiddenLeafSeal className="h-full w-full" strokeWidth={3.4} />
          </div>

          {/* 4 — ink and wind spread from the seal. */}
          <svg
            className="hs-ink"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            <g className="hs-gusts">
              {GUSTS.map((gust) => (
                <path
                  key={gust.d}
                  d={gust.d}
                  strokeWidth={gust.w}
                  opacity={gust.o}
                  style={{ ["--hs-delay" as string]: `${gust.delay}ms` }}
                />
              ))}
            </g>
            {INK.map((dot, index) => (
              <circle
                key={`ink-${index}`}
                className="hs-ink-dot"
                cx="500"
                cy="300"
                r={dot.r}
                opacity={dot.opacity}
                style={
                  {
                    "--hs-dx": `${dot.dx}px`,
                    "--hs-dy": `${dot.dy}px`,
                    "--hs-delay": `${dot.delay}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
            {/* Reverse travel: the seal dissolves into these route lines. */}
            <g className="hs-routes">
              {ROUTES.map((route) => (
                <path key={route} d={route} strokeWidth="1.6" />
              ))}
            </g>
          </svg>
        </div>
      </WorldUnveil>

      {/* 5 — the sealed message scroll, above the veil so the unfurl reads
          while the chamber is revealed behind it (6). */}
      <div className="hs-scroll" aria-hidden="true">
        <span className="hs-roller hs-roller-top" />
        <span className="hs-sheet" />
        <span className="hs-roller hs-roller-bottom" />
      </div>

      <div className="hs-flash absolute inset-0" aria-hidden="true" />
    </div>
  );
}
