"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useReveal, type RevealPhase } from "@/components/transitions/WorldRevealController";
import { getSectionEnvironment } from "@/lib/worlds/environments";
import MobileLeafWorld from "./MobileLeafWorld";

const ENV = getSectionEnvironment("home");
const ASSET = ENV.plate ?? "";

const WorldHost = dynamic(
  () => import("./WorldHost").then((m) => m.WorldHost),
  { ssr: false }
);

/**
 * The Home environment.
 *
 * Desktop and motion-welcome visitors get the live three.js village; every
 * other visitor gets `MobileLeafWorld`, the same construction sequence in DOM
 * and CSS. `mode` starts as "pending" so neither branch is committed during
 * hydration — the still plate carries the first frames either way.
 *
 * PHASE 6.16 — the plate is the loading frame, not the world.
 *
 * The plate behind the DOM construction is the *finished* village, which is why
 * the phone Home looked "already loaded": the silhouettes were rising over a
 * completed render, so there was nothing to see being built. Below 1024px a
 * veil now covers that plate for the construction beats and clears on the
 * world's final settle (`CAMERA_MOVEMENT`), so the village genuinely resolves
 * from a dark, dusty frame into the full render. It is a single opaque overlay
 * — no filter, no per-frame work — and it never exists on desktop.
 */
const SETTLING: RevealPhase[] = [
  "CAMERA_MOVEMENT",
  "NAVIGATION_REVEAL",
  "HERO_TEXT_REVEAL",
  "PORTRAIT_REVEAL",
  "CTA_REVEAL",
  "COMPLETE",
];

export default function HiddenLeafStage() {
  const [mode, setMode] = useState<"pending" | "live" | "dom">("pending");
  const { phase } = useReveal();
  const settled = SETTLING.includes(phase);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setMode(desktop.matches && !reducedMotion.matches ? "live" : "dom");
    update();
    desktop.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (mode !== "live") return;
    // Preload the R3F chunk during the loader / idle so construction is not
    // blocked on a late network fetch.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const preload = () => { import("./WorldHost").catch(() => {}); };
    if ("requestIdleCallback" in window) {
      idleId = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(preload);
    } else {
      timeoutId = globalThis.setTimeout(preload, 1200);
    }
    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [mode]);

  return (
    <div
      aria-hidden="true"
      data-world-asset={ASSET}
      data-world-mode={mode}
      data-world-settled={settled ? "true" : "false"}
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-void"
    >
      <Image src={ASSET} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover object-[50%_44%]" />
      <span className="leaf-plate-veil" />
      {mode === "live" ? <div className="world-canvas-enter absolute inset-0"><WorldHost /></div> : null}
      {mode === "dom" ? <MobileLeafWorld /> : null}
    </div>
  );
}
