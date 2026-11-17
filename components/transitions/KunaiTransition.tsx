"use client";

import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import type { TeleportTransition } from "@/lib/transitions/teleportation";
import {
  FlyingRaijinSeal,
  RaijinKunai,
  RaijinLightning,
} from "./RaijinArtwork";
import WorldUnveil from "./WorldUnveil";

interface Props {
  transition: TeleportTransition;
}

const PARTICLE_COUNT = 10;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + 0.4;
  const distance = 58 + (index % 4) * 22;
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    x: round(Math.cos(angle) * distance),
    y: round(Math.sin(angle) * distance),
    size: index % 4 === 0 ? 5 : index % 3 === 0 ? 4 : 3,
    delay: (index % 5) * 42,
  };
});

/**
 * FLYING RAIJIN — KUNAI TELEPORTATION (Home <-> About)
 *
 * A compositor-friendly transition: the warm veil rises over the outgoing
 * world, an original tri-pronged kunai descends from above the viewport with a
 * restrained trail and golden chakra, then a seal + controlled flash hides the
 * destination scroll snap. The destination then unfolds diagonally from the
 * top-left through the shared world-unveil. All motion lives in CSS keyframes
 * driven by a single phase attribute; React renders only on phase changes (a
 * handful of times per sequence), never per frame.
 */
export default function KunaiTransition({ transition }: Props) {
  const reducedMotion = useReducedMotion() ?? false;
  const { state } = transition;

  if (state === "IDLE" || state === "COMPLETE") return null;

  // Reduced motion: a quick black/gold cut, no kunai sequence.
  if (reducedMotion) {
    return (
      <div
        data-teleport-state={state}
        data-teleport-direction={transition.direction}
        data-testid="flying-raijin-transition"
        role="presentation"
        aria-hidden="true"
        className="fr-overlay fixed inset-0 z-[200] overflow-hidden"
      >
        <WorldUnveil
          state={state}
          direction={transition.direction}
          veilClass="world-veil-raijin"
        />
        <div className="fr-flash absolute inset-0" />
      </div>
    );
  }

  return (
    <div
      data-teleport-state={state}
      data-testid="flying-raijin-transition"
      role="presentation"
      aria-hidden="true"
      className="fr-overlay fixed inset-0 z-[200] overflow-hidden"
    >
      {/* Warm veil (never pure black) plus the shared diagonal world unveil. */}
      <WorldUnveil
        state={state}
        direction={transition.direction}
        veilClass="world-veil-raijin"
      >
        <div className="fr-stage absolute inset-0">
        {/* Warm chakra aura behind the weapon */}
        <div className="fr-aura" aria-hidden="true" />

        {/* Vertical motion trail + a couple of electrical streaks */}
        <div className="fr-trail" aria-hidden="true" />
        <div className="fr-streak fr-streak-a" aria-hidden="true" />
        <div className="fr-streak fr-streak-b" aria-hidden="true" />
        <div className="fr-streak fr-streak-c" aria-hidden="true" />

        {/* Golden lightning cage */}
        <div className="fr-lightning-wrap" aria-hidden="true">
          <RaijinLightning className="fr-lightning" />
        </div>

        {/* Flying Raijin seal, briefly visible at the centre */}
        <div className="fr-seal-wrap" aria-hidden="true">
          <FlyingRaijinSeal className="fr-seal" />
        </div>

        {/* The kunai itself — one layer for descent, one for the centre sway */}
        <div className="fr-kunai-wrap" aria-hidden="true">
          <div className="fr-kunai-descend">
            <div className="fr-kunai-sway">
              <RaijinKunai className="fr-kunai" />
            </div>
          </div>
        </div>

          {/* A few glowing chakra particles gathering toward the weapon */}
          <div className="fr-particles" aria-hidden="true">
            {PARTICLES.map((particle, index) => (
              <span
                key={index}
                className="fr-particle"
                style={
                  {
                    "--fr-x": `${particle.x}px`,
                    "--fr-y": `${particle.y}px`,
                    "--fr-delay": `${particle.delay}ms`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </WorldUnveil>

      {/* Controlled golden flash at the moment of teleportation. */}
      <div className="fr-flash absolute inset-0" />
    </div>
  );
}
