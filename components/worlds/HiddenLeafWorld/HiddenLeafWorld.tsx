"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import VillageEnvironment from "./VillageEnvironment";
import { CAMERA } from "./config";
import { useReveal } from "@/components/transitions/WorldRevealController";

export default function HiddenLeafWorld() {
  const { markSceneReady } = useReveal();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => markSceneReady(), reduced ? 300 : 900);
    return () => clearTimeout(t);
  }, [markSceneReady]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        frameloop={isVisible ? "always" : "never"}
        camera={{
          fov: CAMERA.fov,
          near: 0.5,
          far: 620,
          position: [0, 22, 56],
        }}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
          gl.setClearColor("#0a1424", 1);
        }}
      >
        <Suspense fallback={null}>
          <VillageEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
