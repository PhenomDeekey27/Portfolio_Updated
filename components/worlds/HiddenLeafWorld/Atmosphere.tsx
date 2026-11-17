"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "./config";

function createHazeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(128, 64, 8, 128, 64, 128);
    gradient.addColorStop(0, "rgba(255, 216, 170, 0.72)");
    gradient.addColorStop(0.45, "rgba(228, 179, 132, 0.34)");
    gradient.addColorStop(1, "rgba(228, 179, 132, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

export default function Atmosphere() {
  const dustRef = useRef<THREE.Points>(null);
  const hazeTexture = useMemo(() => createHazeTexture(), []);

  const dustGeometry = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const random = seededRandom(0x7c0ffee);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (random() - 0.5) * 52;
      positions[index * 3 + 1] = 1 + random() * 10;
      positions[index * 3 + 2] = 4 - random() * 50;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    return geometry;
  }, []);

  const frameRef = useRef(0);
  useFrame((state, delta) => {
    if (!dustRef.current) return;
    frameRef.current += 1;
    // Dust drift is sub-perceptual; update every 4th frame.
    if (frameRef.current % 4 !== 0) return;
    dustRef.current.rotation.y += delta * 0.024;
    dustRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.18;
  });

  return (
    <group>
      <mesh position={[0, 6.5, -38]} renderOrder={2}>
        <planeGeometry args={[165, 27]} />
        <meshBasicMaterial
          map={hazeTexture}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
      <mesh position={[0, 9, -61]} renderOrder={2}>
        <planeGeometry args={[210, 34]} />
        <meshBasicMaterial
          map={hazeTexture}
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
      <mesh position={[0, 12, -88]} renderOrder={2}>
        <planeGeometry args={[250, 44]} />
        <meshBasicMaterial
          map={hazeTexture}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          color="#ffe0b0"
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
