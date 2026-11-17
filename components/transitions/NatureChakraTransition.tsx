"use client";

import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import type { TeleportTransition } from "@/lib/transitions/teleportation";
import WorldUnveil from "./WorldUnveil";

interface Props {
  transition: TeleportTransition;
}

const LEAF_COUNT = 7;

const LEAVES = Array.from({ length: LEAF_COUNT }).map((_, index) => {
  const angle = (index / LEAF_COUNT) * Math.PI * 2 + 0.3;
  const startDistance = 38 + (index % 3) * 18;
  const round = (v: number) => Math.round(v * 100) / 100;
  return {
    x: round(Math.cos(angle) * startDistance),
    y: round(Math.sin(angle) * startDistance),
    rot: (index * 47) % 360,
    size: index % 2 === 0 ? 16 : 12,
    delay: index * 60,
  };
});

/**
 * NATURE CHAKRA AWAKENING — About <-> Skills (this route only).
 *
 * A restrained nature-energy transition: a handful of golden leaves drift in
 * and gather toward the centre while the shared world unveil opens the
 * destination from the top-left. No kunai, no Rasengan, no sphere, no circular
 * portal. Gold + ivory palette only.
 */
export default function NatureChakraTransition({ transition }: Props) {
  const reducedMotion = useReducedMotion() ?? false;
  const { state } = transition;

  if (state === "IDLE" || state === "COMPLETE") return null;

  if (reducedMotion) {
    return (
      <div
        data-teleport-state={state}
        data-teleport-direction={transition.direction}
        data-testid="nature-chakra-transition"
        role="presentation"
        aria-hidden="true"
        className="nc-overlay fixed inset-0 z-[200] overflow-hidden"
      >
        <WorldUnveil
          state={state}
          direction={transition.direction}
          veilClass="world-veil-nature"
        />
        <div className="nc-flash absolute inset-0" />
      </div>
    );
  }

  return (
    <div
      data-teleport-state={state}
      data-teleport-direction={transition.direction}
      data-testid="nature-chakra-transition"
      role="presentation"
      aria-hidden="true"
      className="nc-overlay fixed inset-0 z-[200] overflow-hidden"
    >
      <WorldUnveil
        state={state}
        direction={transition.direction}
        veilClass="world-veil-nature"
      >
        <div className="nc-stage absolute inset-0">
          {/* Warm nature-chakra aura behind the leaves */}
          <div className="nc-aura" aria-hidden="true" />

          {/* Golden leaves gathering then sweeping */}
          <div className="nc-leaves" aria-hidden="true">
            {LEAVES.map((leaf, index) => (
              <svg
                key={index}
                className="nc-leaf"
                style={
                  {
                    "--nc-x": `${leaf.x}px`,
                    "--nc-y": `${leaf.y}px`,
                    "--nc-rot": `${leaf.rot}deg`,
                    "--nc-delay": `${leaf.delay}ms`,
                    width: `${leaf.size}px`,
                    height: `${leaf.size}px`,
                  } as CSSProperties
                }
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M2 18C0 12 3 4 11 2c5 1 8 6 6 12-2 5-7 7-12 4-2-1-3-3-3-4z"
                  fill="rgba(201,163,95,0.85)"
                  stroke="rgba(245,239,226,0.35)"
                  strokeWidth="0.6"
                />
              </svg>
            ))}
          </div>

          {/* Subtle golden energy trail through the centre */}
          <div className="nc-trail" aria-hidden="true" />
        </div>
      </WorldUnveil>

      <div className="nc-flash absolute inset-0" />
    </div>
  );
}
