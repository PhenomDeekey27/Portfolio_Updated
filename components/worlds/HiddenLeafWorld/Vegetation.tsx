"use client";

import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import {
  seededRandom,
  terrainHeight,
  WORLD_COLORS,
} from "./config";

type Tree = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
 };

type Conifer = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
};

function createConifers() {
  const random = seededRandom(0x3c9e77);
  const conifers: Conifer[] = [];

  const add = (x: number, z: number, scale: number) => {
    conifers.push({
      x,
      y: terrainHeight(x, z),
      z,
      scale,
      rotation: random() * Math.PI * 2,
    });
  };

  // Evergreen walls framing the valley.
  for (let index = 0; index < 18; index += 1) {
    add(-34 - random() * 16, 26 - index * 3.4 + random() * 3, 1.1 + random() * 1.1);
    add(34 + random() * 16, 26 - index * 3.4 + random() * 3, 1.1 + random() * 1.1);
  }

  // Forested slopes climbing behind the rooftops.
  for (let index = 0; index < 30; index += 1) {
    add(-52 + random() * 104, -40 - random() * 32, 1.2 + random() * 1.2);
  }

  // A few tall specimens for scale near the Hokage building.
  add(-10, -37, 1.5);
  add(12, -42, 1.7);
  add(-13, -46, 1.4);

  return conifers;
}

function createTrees() {
  const random = seededRandom(0x7a3f21);
  const trees: Tree[] = [];

  const add = (x: number, z: number, scale: number) => {
    trees.push({
      x,
      y: terrainHeight(x, z),
      z,
      scale,
      rotation: random() * Math.PI * 2,
    });
  };

  // Framing clusters on the valley edges.
  for (let index = 0; index < 16; index += 1) {
    add(-40 + random() * 16, 20 - index * 3.2 + random() * 2, 1.3 + random() * 1.3);
    add(40 - random() * 16, 20 - index * 3.2 + random() * 2, 1.3 + random() * 1.3);
  }

  // Forested slope behind the village.
  for (let index = 0; index < 26; index += 1) {
    add(-34 + random() * 74, -35 - random() * 22, 1.4 + random() * 1.5);
  }

  // A few trees inside the village edges for scale.
  for (const [x, z] of [
    [-21, 9],
    [21, 10],
    [-25, -2],
    [25, -4],
    [-11, -35],
    [12, -36],
  ]) {
    add(x + (random() - 0.5) * 2, z + (random() - 0.5) * 2, 1.1 + random() * 0.7);
  }

  // Foreground silhouettes framing the view.
  add(-34, 27, 2.6);
  add(35, 25, 2.4);
  add(-30, 31, 2.1);
  add(31, 32, 2.2);

  return trees;
}

export default function Vegetation() {
  const trees = useMemo(() => createTrees(), []);
  const conifers = useMemo(() => createConifers(), []);

  const coniferTiers = useMemo(
    () =>
      conifers.flatMap((tree, index) => {
        const palette = ["#24382c", "#2b4334", "#223428"];
        return [
          { offset: 1.3, radius: 1.45, height: 2.6 },
          { offset: 2.6, radius: 1.1, height: 2.1 },
          { offset: 3.8, radius: 0.75, height: 1.7 },
        ].map((tier, tierIndex) => ({
          position: [
            tree.x,
            tree.y + tier.offset * tree.scale,
            tree.z,
          ] as [number, number, number],
          scale: [
            tier.radius * tree.scale,
            tier.height * tree.scale,
            tier.radius * tree.scale,
          ] as [number, number, number],
          rotation: [0, tree.rotation + tierIndex * 0.5, 0] as [
            number,
            number,
            number
          ],
          color: palette[(index + tierIndex) % palette.length],
        }));
      }),
    [conifers]
  );

  const foliage = useMemo(() => {
    const random = seededRandom(0x1234abcd);
    return trees.flatMap((tree, index) => {
      const trunkHeight = 1.6 * tree.scale;
      const blobs: {
        position: [number, number, number];
        scale: [number, number, number];
        color: string;
      }[] = [];
      const palette = [
        WORLD_COLORS.foliageDark,
        WORLD_COLORS.foliageMid,
        WORLD_COLORS.foliageLight,
      ];

      for (let blob = 0; blob < 3; blob += 1) {
        const angle = tree.rotation + (blob / 3) * Math.PI * 2;
        const radius = blob === 0 ? 0 : 0.62 * tree.scale;
        const size =
          (blob === 0 ? 1.15 : 0.72 + random() * 0.18) * tree.scale;
        blobs.push({
          position: [
            tree.x + Math.cos(angle) * radius,
            tree.y + trunkHeight + (blob === 0 ? 0.55 : 0.1) * tree.scale,
            tree.z + Math.sin(angle) * radius,
          ],
          scale: [size, size * (0.74 + random() * 0.14), size],
          color: palette[(index + blob) % palette.length],
        });
      }

      return blobs;
    });
  }, [trees]);

  const rocks = useMemo(() => {
    const random = seededRandom(0x44aa19);
    return Array.from({ length: 18 }, () => {
      const x = (random() - 0.5) * 78;
      const z = -12 - random() * 40;
      return {
        position: [
          x,
          terrainHeight(x, z) + 0.2,
          z,
        ] as [number, number, number],
        scale: 0.5 + random() * 1.3,
        rotation: random() * Math.PI,
      };
    });
  }, []);

  return (
    <group>
      <Instances limit={trees.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.24, 1, 6]} />
        <meshStandardMaterial color="#3a2b20" roughness={1} />
        {trees.map((tree, index) => (
          <Instance
            key={`trunk-${index}`}
            position={[
              tree.x,
              tree.y + 0.8 * tree.scale,
              tree.z,
            ]}
            scale={[tree.scale, 1.6 * tree.scale, tree.scale]}
          />
        ))}
      </Instances>

      <Instances limit={foliage.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
        {foliage.map((blob, index) => (
          <Instance
            key={`leaf-${index}`}
            position={blob.position}
            scale={blob.scale}
            color={blob.color}
          />
        ))}
      </Instances>

      <Instances limit={conifers.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.2, 1, 6]} />
        <meshStandardMaterial color="#3a2b20" roughness={1} />
        {conifers.map((tree, index) => (
          <Instance
            key={`conifer-trunk-${index}`}
            position={[tree.x, tree.y + 0.7 * tree.scale, tree.z]}
            scale={[tree.scale, 1.4 * tree.scale, tree.scale]}
          />
        ))}
      </Instances>

      <Instances limit={coniferTiers.length} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
        {coniferTiers.map((tier, index) => (
          <Instance
            key={`conifer-tier-${index}`}
            position={tier.position}
            scale={tier.scale}
            rotation={tier.rotation}
            color={tier.color}
          />
        ))}
      </Instances>

      <Instances limit={rocks.length} receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={1}
          flatShading
        />
        {rocks.map((rock, index) => (
          <Instance
            key={`rock-${index}`}
            position={rock.position}
            scale={[rock.scale, rock.scale * 0.7, rock.scale]}
            rotation={[0, rock.rotation, 0]}
            color={index % 3 === 0 ? "#585249" : "#4c4740"}
          />
        ))}
      </Instances>
    </group>
  );
}
