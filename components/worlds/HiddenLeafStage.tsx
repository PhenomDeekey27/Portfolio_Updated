"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
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
 */
export default function HiddenLeafStage() {
  const [mode, setMode] = useState<"pending" | "live" | "dom">("pending");

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
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-void"
    >
      <Image src={ASSET} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover object-[50%_44%]" />
      {mode === "live" ? <div className="world-canvas-enter absolute inset-0"><WorldHost /></div> : null}
      {mode === "dom" ? <MobileLeafWorld /> : null}
    </div>
  );
}
