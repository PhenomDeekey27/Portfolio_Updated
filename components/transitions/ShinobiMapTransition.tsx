"use client";

import { useReducedMotion } from "framer-motion";
import type { TeleportTransition } from "@/lib/transitions/teleportation";
import HiddenLeafSeal from "@/components/motifs/HiddenLeafSeal";
import WorldUnveil from "./WorldUnveil";

interface Props {
  transition: TeleportTransition;
}

const NODES = [
  { x: 214, y: 512, delay: "760ms", r: 4 },
  { x: 372, y: 438, delay: "900ms", r: 3 },
  { x: 546, y: 470, delay: "1040ms", r: 4 },
  { x: 700, y: 352, delay: "1180ms", r: 3 },
  { x: 884, y: 300, delay: "1320ms", r: 4.5 },
  { x: 1008, y: 196, delay: "1460ms", r: 3 },
];

/**
 * SHINOBI CHRONICLE MAP REVEAL — Missions <-> Experience.
 *
 * A mission map becomes a career journey:
 *   1. the missions environment settles under the veil
 *   2. a parchment sheet unfolds from the top-left corner
 *   3. ink contours and a gold route are drawn across it
 *   4. a Hidden Leaf seal is stamped on the sheet
 *   5. the sheet clips away diagonally, becoming the Experience environment
 *   6. the career heading and records stagger in (owned by the controller)
 *
 * No kunai, no rasengan, no circular energy portals, no particle bursts.
 * All motion is CSS keyframes on one phase attribute — React re-renders only
 * on phase changes. The SVG is ~12 paths; no filters, no blur.
 */
export default function ShinobiMapTransition({ transition }: Props) {
  const reducedMotion = useReducedMotion() ?? false;
  const { state, direction } = transition;

  if (state === "IDLE" || state === "COMPLETE") return null;

  if (reducedMotion) {
    return (
      <div
        data-teleport-state={state}
        data-teleport-direction={direction}
        data-testid="shinobi-map-transition"
        role="presentation"
        aria-hidden="true"
        className="sc-overlay fixed inset-0 z-[200] overflow-hidden"
      >
        <WorldUnveil
          state={state}
          direction={direction}
          veilClass="world-veil-parchment"
          unfold
        />
        <div className="sc-flash absolute inset-0" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      data-teleport-state={state}
      data-teleport-direction={direction}
      data-testid="shinobi-map-transition"
      role="presentation"
      aria-hidden="true"
      className="sc-overlay fixed inset-0 z-[200] overflow-hidden"
    >
      <WorldUnveil
        state={state}
        direction={direction}
        veilClass="world-veil-parchment"
        unfold
      >
        <div className="sc-stage absolute inset-0">
          <div className="sc-paper" aria-hidden="true" />
          <div className="sc-lantern" aria-hidden="true" />

          <svg
            className="sc-ink"
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            {/* topographic ink contours */}
            <g className="sc-contour">
              <path d="M-40 168C96 112 208 158 296 122s164-72 262-34 186 96 306 66 214-72 356-24" />
              <path d="M-40 220C96 168 212 212 300 176s164-62 258-26 186 84 304 58 212-64 356-18" />
              <path d="M-60 470C78 428 190 470 286 442s150-58 244-22 190 84 300 56 200-60 330-16" />
              <path d="M-60 524C78 486 192 524 288 500s148-54 242-18 190 80 298 54 198-56 326-12" />
              <path d="M120 640C232 600 300 604 380 622s150 30 232-6 146-64 236-36" />
            </g>

            {/* mountain hatching */}
            <g className="sc-contour" opacity="0.32">
              <path d="M300 372l42-58 40 58z" />
              <path d="M372 372l54-76 52 76z" />
              <path d="M466 372l38-52 36 52z" />
              <path d="M742 268l46-64 44 64z" />
              <path d="M818 268l36-50 34 50z" />
            </g>

            {/* the glowing route */}
            <path
              className="sc-route-glow"
              d="M150 566C252 540 272 462 358 452s132 22 196-24 42-120 132-134 128 34 208 6 116-84 176-110"
            />
            <path
              className="sc-route"
              d="M150 566C252 540 272 462 358 452s132 22 196-24 42-120 132-134 128 34 208 6 116-84 176-110"
            />

            {NODES.map((node) => (
              <circle
                key={`${node.x}-${node.y}`}
                className="sc-node"
                cx={node.x}
                cy={node.y}
                r={node.r}
                style={{ ["--sc-node-delay" as string]: node.delay }}
              />
            ))}
          </svg>

          <div className="sc-seal" aria-hidden="true">
            <HiddenLeafSeal className="h-full w-full" strokeWidth={4} />
          </div>
        </div>
      </WorldUnveil>

      <div className="sc-flash absolute inset-0" aria-hidden="true" />
    </div>
  );
}
