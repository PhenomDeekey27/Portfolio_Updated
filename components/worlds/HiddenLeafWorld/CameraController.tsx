"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA } from "./config";
import { useReveal } from "@/components/transitions/WorldRevealController";

export default function CameraController() {
  const { phase } = useReveal();
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const basePosition = useRef(new THREE.Vector3(0, 22, 56));
  const baseLookAt = useRef(new THREE.Vector3(-2, 8, -22));
  const desiredPosition = useRef(new THREE.Vector3(...CAMERA.position));
  const desiredLookAt = useRef(new THREE.Vector3(...CAMERA.lookAt));
  const currentLookAt = useRef(new THREE.Vector3(...CAMERA.lookAt));
  const introStartRef = useRef<number | null>(null);
  const introDoneRef = useRef(false);
  const narrowRef = useRef<boolean | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = THREE.MathUtils.clamp(
        (event.clientX / window.innerWidth) * 2 - 1,
        -1,
        1
      );
      pointer.current.y = THREE.MathUtils.clamp(
        (event.clientY / window.innerHeight) * 2 - 1,
        -1,
        1
      );
    };

    const handlePointerLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const widePos = useRef(new THREE.Vector3(0, 22, 56));
  const finalPos = useRef(new THREE.Vector3());
  const wideLook = useRef(new THREE.Vector3(-2, 7, -22));
  const finalLook = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const camera = state.camera;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const narrow = aspect < 1.32;

    // Intro dolly: wide -> final during the village reveal phase.
    if (phase === "CAMERA_MOVEMENT" && !introDoneRef.current) {
      if (introStartRef.current === null) {
        introStartRef.current = state.clock.elapsedTime;
      }
      const elapsed = state.clock.elapsedTime - introStartRef.current;
      const t = Math.min(1, elapsed / 2.6);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

      finalPos.current.set(
        CAMERA.position[0],
        narrow ? 16.5 : CAMERA.position[1],
        narrow ? 44 : CAMERA.position[2]
      );
      finalLook.current.set(
        CAMERA.lookAt[0],
        narrow ? 9.5 : CAMERA.lookAt[1],
        CAMERA.lookAt[2]
      );

      basePosition.current.lerpVectors(widePos.current, finalPos.current, eased);
      baseLookAt.current.lerpVectors(wideLook.current, finalLook.current, eased);

      if (t >= 1) {
        introDoneRef.current = true;
      }
    } else if (phase !== "CAMERA_MOVEMENT" && introStartRef.current === null) {
      // Non-intro path (reduced motion / replay): ensure bases are final.
      introDoneRef.current = true;
    }

    if (narrowRef.current !== narrow) {
      narrowRef.current = narrow;

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = narrow ? 45 : CAMERA.fov;
        camera.updateProjectionMatrix();
      }

      if (introDoneRef.current) {
        basePosition.current.set(
          CAMERA.position[0],
          narrow ? 16.5 : CAMERA.position[1],
          narrow ? 44 : CAMERA.position[2]
        );
        baseLookAt.current.set(
          CAMERA.lookAt[0],
          narrow ? 9.5 : CAMERA.lookAt[1],
          CAMERA.lookAt[2]
        );
      }

      if (!initialized.current) {
        initialized.current = true;
        camera.position.copy(basePosition.current);
        currentLookAt.current.copy(baseLookAt.current);
        camera.lookAt(currentLookAt.current);
      }
    }

    const smoothing = 1 - Math.exp(-delta * 2.4);
    smooth.current.x += (pointer.current.x - smooth.current.x) * smoothing;
    smooth.current.y += (pointer.current.y - smooth.current.y) * smoothing;

    const time = state.clock.elapsedTime;
    const idleX = Math.sin(time * 0.11) * 0.28;
    const idleY = Math.cos(time * 0.09) * 0.16;

    desiredPosition.current.set(
      basePosition.current.x +
        smooth.current.x * CAMERA.parallax.positionX +
        idleX,
      basePosition.current.y -
        smooth.current.y * CAMERA.parallax.positionY +
        idleY,
      basePosition.current.z
    );

    desiredLookAt.current.set(
      baseLookAt.current.x +
        smooth.current.x * CAMERA.parallax.lookX,
      baseLookAt.current.y -
        smooth.current.y * CAMERA.parallax.lookY,
      baseLookAt.current.z
    );

    camera.position.lerp(
      desiredPosition.current,
      1 - Math.exp(-delta * 1.9)
    );
    currentLookAt.current.lerp(
      desiredLookAt.current,
      1 - Math.exp(-delta * 1.9)
    );
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
