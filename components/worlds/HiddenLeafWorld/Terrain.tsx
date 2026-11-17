"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Instances, Instance } from "@react-three/drei";
import { groundHeight, terrainHeight, WORLD_COLORS } from "./config";
import { createGroundTexture, createPavingTexture } from "./textures";

function createPathGeometry(
  width: number,
  zStart: number,
  zEnd: number,
  segments: number
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const z = THREE.MathUtils.lerp(zStart, zEnd, t);
    const y = groundHeight(0, z) + 0.055;
    positions.push(-width / 2, y, z, width / 2, y, z);
    uvs.push(0, t, 1, t);
  }

  for (let index = 0; index < segments; index += 1) {
    const a = index * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default function Terrain() {
  const groundTexture = useMemo(() => createGroundTexture(), []);
  const pavingTexture = useMemo(() => createPavingTexture(1, 18), []);
  const plazaTexture = useMemo(() => createPavingTexture(7, 7), []);

  useEffect(
    () => () => {
      groundTexture.dispose();
      pavingTexture.dispose();
      plazaTexture.dispose();
    },
    [groundTexture, pavingTexture, plazaTexture]
  );

  const groundGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(320, 320, 104, 104);
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position;
    const colors: number[] = [];
    const base = new THREE.Color(WORLD_COLORS.ground);
    const light = new THREE.Color(WORLD_COLORS.groundLight);
    const dry = new THREE.Color("#4a4131");

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const z = position.getZ(index);
      const height = terrainHeight(x, z);
      position.setY(index, height);

      const patch =
        0.5 +
        Math.sin(x * 0.24 + z * 0.11) * 0.2 +
        Math.sin(z * 0.31 - 1.2) * 0.18;
      const shade = THREE.MathUtils.clamp(patch, 0, 1);
      const color = base.clone().lerp(light, shade * 0.8);
      const dryness = THREE.MathUtils.clamp((height - 1.2) / 7, 0, 1);
      color.lerp(dry, dryness * 0.55);

      colors.push(color.r, color.g, color.b);
    }

    position.needsUpdate = true;
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  const pathGeometry = useMemo(
    () => createPathGeometry(5.2, 18, -19, 30),
    []
  );

  const curbPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let index = 0; index < 20; index += 1) {
      const z = 16 - index * 2.3;
      positions.push([-2.85, groundHeight(0, z) + 0.16, z]);
      positions.push([2.85, groundHeight(0, z) + 0.16, z]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh geometry={groundGeometry} receiveShadow>
        <meshStandardMaterial
          map={groundTexture}
          vertexColors
          roughness={1}
          metalness={0}
        />
      </mesh>

      <mesh geometry={pathGeometry} receiveShadow>
        <meshStandardMaterial
          map={pavingTexture}
          color="#ffffff"
          roughness={0.94}
          metalness={0}
        />
      </mesh>

      <mesh
        position={[2, groundHeight(2, -30) + 0.06, -30]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[13.5, 56]} />
        <meshStandardMaterial
          map={plazaTexture}
          color="#ffffff"
          roughness={0.94}
          metalness={0}
        />
      </mesh>

      <Instances limit={curbPositions.length} receiveShadow>
        <boxGeometry args={[0.26, 0.36, 2.15]} />
        <meshStandardMaterial color="#3f3b35" roughness={1} />
        {curbPositions.map((position, index) => (
          <Instance key={index} position={position} />
        ))}
      </Instances>
    </group>
  );
}
