"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { seededRandom } from "./config";

type RidgeOptions = {
  seed: number;
  width: number;
  height: number;
  segments: number;
  topColor: string;
  midColor: string;
  baseColor: string;
};

function createRidgeGeometry({
  seed,
  width,
  height,
  segments,
  topColor,
  midColor,
  baseColor,
}: RidgeOptions) {
  const random = seededRandom(seed);
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const bottom = -30;
  const top = new THREE.Color(topColor);
  const middle = new THREE.Color(midColor);
  const base = new THREE.Color(baseColor);

  const peakY: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const wave =
      Math.sin(t * 6.3 + seed * 0.7) * 0.38 +
      Math.sin(t * 14.7 + seed * 1.3) * 0.18 +
      Math.sin(t * 2.3 + seed * 0.2) * 0.32;
    // A few dominant summits with small secondary crags, not a picket fence.
    const major = Math.pow(Math.max(0, Math.sin(t * 4.2 + seed * 0.9)), 4) * 0.5;
    const minor = Math.pow(Math.max(0, Math.sin(t * 11.3 + seed * 2.3)), 6) * 0.16;
    const peak =
      height * (0.58 + wave * 0.4 + major + minor + (random() - 0.5) * 0.05);

    const x = (t - 0.5) * width;
    const shoulder = peak * 0.56;

    peakY.push(peak);

    positions.push(x, peak, 0, x, shoulder, 0, x, bottom, 0);
    colors.push(
      top.r,
      top.g,
      top.b,
      middle.r,
      middle.g,
      middle.b,
      base.r,
      base.g,
      base.b
    );
  }

  for (let index = 0; index < segments; index += 1) {
    const peak = index * 3;
    const shoulder = peak + 1;
    const baseVertex = peak + 2;
    const nextPeak = peak + 3;
    const nextShoulder = peak + 4;
    const nextBase = peak + 5;

    indices.push(
      peak,
      nextPeak,
      shoulder,
      nextPeak,
      nextShoulder,
      shoulder,
      shoulder,
      nextShoulder,
      baseVertex,
      nextShoulder,
      nextBase,
      baseVertex
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function Ridge(options: RidgeOptions & { z: number }) {
  const geometry = useMemo(
    () => createRidgeGeometry(options),
    // Options are static scene data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <mesh geometry={geometry} position={[0, 0, options.z]}>
      <meshBasicMaterial
        vertexColors
        fog={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function Mountains() {
  return (
    <group>
      <Ridge
        z={-76}
        seed={3}
        width={280}
        height={15}
        segments={110}
        topColor="#575349"
        midColor="#46443d"
        baseColor="#33332f"
      />
      <Ridge
        z={-112}
        seed={11}
        width={340}
        height={24}
        segments={124}
        topColor="#737578"
        midColor="#5d6268"
        baseColor="#464d55"
      />
      <Ridge
        z={-158}
        seed={23}
        width={410}
        height={34}
        segments={136}
        topColor="#939aa2"
        midColor="#7c848d"
        baseColor="#616b77"
      />
      <Ridge
        z={-208}
        seed={37}
        width={470}
        height={43}
        segments={140}
        topColor="#adb3ba"
        midColor="#969ea7"
        baseColor="#7b8490"
      />
    </group>
  );
}
