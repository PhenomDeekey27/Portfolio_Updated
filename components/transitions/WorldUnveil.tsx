"use client";

import type { ReactNode } from "react";
import type { TeleportState } from "@/lib/transitions/teleportation";

interface WorldUnveilProps {
  state: TeleportState;
  direction: "forward" | "backward";
  /**
   * Identity veil class: the warm dark plate (raijin / nature / rasengan) or
   * the parchment sheet (shinobi-map). The veil is the ONLY opaque layer in a
   * transition — the overlay root stays transparent so the destination world
   * is genuinely revealed by the clip below rather than hidden behind it.
   */
  veilClass: string;
  /** Open the veil as a sheet unfolding from the origin corner. */
  unfold?: boolean;
  children?: ReactNode;
}

/**
 * Shared world-unveil for every route identity.
 *
 * Phase mapping is purely attribute/CSS driven (no per-frame React):
 *   COVERING … TELEPORT_FLASH — veil rises (or unfolds) opaque over the
 *                               outgoing world, hiding the scroll snap
 *   WORLD_SWITCH             — veil clips away from the top-left corner
 *                               (bottom-right on reverse) diagonally, with a
 *                               warm light edge and a soft bloom at the origin
 *   ARRIVAL / COMPLETE       — veil fully clipped away, destination established
 */
export default function WorldUnveil({
  state,
  direction,
  veilClass,
  unfold = false,
  children,
}: WorldUnveilProps) {
  const unveiling =
    state === "WORLD_SWITCH" || state === "ARRIVAL" || state === "COMPLETE";
  const backward = direction === "backward";

  const veilClasses = ["world-veil", veilClass];
  if (unfold) veilClasses.push(backward ? "world-veil-unfold-bwd" : "world-veil-unfold");
  if (unveiling) veilClasses.push(backward ? "world-unveil-backward" : "world-unveil-forward");

  return (
    <>
      <div className={`absolute inset-0 ${veilClasses.join(" ")}`} aria-hidden="true" />
      {children}
      {unveiling ? (
        <>
          <div
            className={`world-edge ${backward ? "is-backward" : "is-forward"}`}
            aria-hidden="true"
          />
          <div
            className={`world-bloom ${backward ? "is-backward" : "is-forward"}`}
            aria-hidden="true"
          />
        </>
      ) : null}
    </>
  );
}
