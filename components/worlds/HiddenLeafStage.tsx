"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSectionEnvironment } from "@/lib/worlds/environments";

const ENV = getSectionEnvironment("home");
const ASSET = ENV.plate ?? "";

const WorldHost = dynamic(
  () => import("./WorldHost").then((m) => m.WorldHost),
  { ssr: false }
);

export default function HiddenLeafStage() {
  const [liveWorld, setLiveWorld] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setLiveWorld(desktop.matches && !reducedMotion.matches);
    update();
    desktop.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
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
      desktop.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
      if (idleId !== undefined && "cancelIdleCallback" in window) (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-world-asset={ASSET}
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-void"
    >
      <Image src={ASSET} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover object-[50%_44%]" />
      {liveWorld ? <div className="world-canvas-enter absolute inset-0"><WorldHost /></div> : null}
    </div>
  );
}
