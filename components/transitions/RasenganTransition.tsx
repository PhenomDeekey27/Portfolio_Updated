"use client";

import { useReducedMotion } from "framer-motion";
import type { TeleportTransition } from "@/lib/transitions/teleportation";
import WorldUnveil from "./WorldUnveil";

interface Props {
  transition: TeleportTransition;
}

/**
 * RASENGAN — Jutsu transition for Skills <-> Missions.
 *
 * A rotating chakra sphere grows into a circular burst, then the destination
 * world unfolds diagonally from the top-left through the shared world unveil.
 * CSS only, no WebGL. (The About <-> Skills route must never use this — see
 * lib/transitions/identity.ts.)
 */
export default function RasenganTransition({ transition }: Props) {
  const reducedMotion = useReducedMotion() ?? false;
  const { state } = transition;

  if (state === "IDLE" || state === "COMPLETE") return null;

  if (reducedMotion) {
    return (
      <div
        data-teleport-state={state}
        data-teleport-direction={transition.direction}
        data-testid="rasengan-transition"
        role="presentation"
        aria-hidden="true"
        className="rs-overlay fixed inset-0 z-[200] overflow-hidden"
      >
        <WorldUnveil
          state={state}
          direction={transition.direction}
          veilClass="world-veil-rasengan"
        />
        <div className="rs-flash absolute inset-0" />
      </div>
    );
  }

  return (
    <div
      data-teleport-state={state}
      data-testid="rasengan-transition"
      role="presentation"
      aria-hidden="true"
      className="rs-overlay fixed inset-0 z-[200] overflow-hidden"
    >
      <WorldUnveil
        state={state}
        direction={transition.direction}
        veilClass="world-veil-rasengan"
      >
        <div className="rs-stage absolute inset-0">
          {/* Rotating chakra sphere */}
          <div className="rs-sphere-wrap" aria-hidden="true">
            <div className="rs-trail rs-trail-a" />
            <div className="rs-trail rs-trail-b" />
            <div className="rs-trail rs-trail-c" />
            <div className="rs-core" />
            <div className="rs-ring" />
          </div>

          {/* Circular chakra burst */}
          <div className="rs-burst" aria-hidden="true" />

          {/* Expanding wipe */}
          <div className="rs-wipe" aria-hidden="true" />
        </div>
      </WorldUnveil>

      <div className="rs-flash absolute inset-0" />
    </div>
  );
}
