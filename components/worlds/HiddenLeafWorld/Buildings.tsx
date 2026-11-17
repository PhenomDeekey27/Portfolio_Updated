"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instances, Instance } from "@react-three/drei";
import {
  createGableRoofGeometry,
  createPagodaRoofGeometry,
} from "./geometry";
import { groundHeight, seededRandom, WORLD_COLORS } from "./config";
import { useReveal } from "@/components/transitions/WorldRevealController";
import {
  createAwningTexture,
  createBannerTexture,
  createDarkWindowTexture,
  createDoorTexture,
  createNorenTexture,
  createPlasterTexture,
  createRoofTexture,
  createShojiTexture,
  createSignTexture,
} from "./textures";

type Vec3 = [number, number, number];

type Transform = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

function buildMaterials() {
  const plaster = createPlasterTexture();
  const roof = createRoofTexture();
  const shoji = createShojiTexture();
  const darkWindow = createDarkWindowTexture();
  const awning = createAwningTexture();
  const noren = createNorenTexture();
  const door = createDoorTexture();
  const banner = createBannerTexture();
  const sign = createSignTexture();

  const materials = {
    wall: new THREE.MeshStandardMaterial({
      map: plaster,
      bumpMap: plaster,
      bumpScale: 0.02,
      roughness: 0.94,
      metalness: 0,
    }),
    // Solid-tinted variants for the landmark buildings, which do not use
    // per-instance colours.
    towerWall: new THREE.MeshStandardMaterial({
      color: "#d9c7a4",
      map: plaster,
      bumpMap: plaster,
      bumpScale: 0.02,
      roughness: 0.92,
      metalness: 0,
    }),
    foundation: new THREE.MeshStandardMaterial({
      color: "#4c473f",
      roughness: 1,
    }),
    roof: new THREE.MeshStandardMaterial({
      map: roof,
      roughness: 0.8,
      metalness: 0.05,
    }),
    towerRoof: new THREE.MeshStandardMaterial({
      color: "#3d4a55",
      map: roof,
      roughness: 0.78,
      metalness: 0.06,
    }),
    timber: new THREE.MeshStandardMaterial({
      color: WORLD_COLORS.timber,
      roughness: 0.9,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: "#5b4635",
      roughness: 0.86,
    }),
    stone: new THREE.MeshStandardMaterial({
      color: "#57524a",
      roughness: 1,
    }),
    vermilion: new THREE.MeshStandardMaterial({
      color: "#8a332a",
      roughness: 0.82,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: "#c9a35f",
      roughness: 0.34,
      metalness: 0.6,
      emissive: "#4c3513",
      emissiveIntensity: 0.35,
    }),
    shoji: new THREE.MeshStandardMaterial({
      map: shoji,
      emissiveMap: shoji,
      emissive: new THREE.Color("#ffb066"),
      emissiveIntensity: 1.05,
      roughness: 0.62,
      side: THREE.DoubleSide,
    }),
    darkWindow: new THREE.MeshStandardMaterial({
      map: darkWindow,
      roughness: 0.42,
      metalness: 0.16,
      side: THREE.DoubleSide,
    }),
    awning: new THREE.MeshStandardMaterial({
      map: awning,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    noren: new THREE.MeshStandardMaterial({
      map: noren,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
    door: new THREE.MeshStandardMaterial({
      map: door,
      roughness: 0.88,
    }),
    banner: new THREE.MeshStandardMaterial({
      map: banner,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    sign: new THREE.MeshStandardMaterial({
      map: sign,
      roughness: 0.82,
      side: THREE.DoubleSide,
    }),
    lantern: new THREE.MeshStandardMaterial({
      color: "#ffbe83",
      emissive: "#ff9d4d",
      emissiveIntensity: 1.9,
      roughness: 0.55,
    }),
    lanternCap: new THREE.MeshStandardMaterial({
      color: "#241a13",
      roughness: 0.9,
    }),
  };

  return {
    materials,
    textures: [
      plaster,
      roof,
      shoji,
      darkWindow,
      awning,
      noren,
      door,
      banner,
      sign,
    ],
  };
}

type VillageMaterials = ReturnType<typeof buildMaterials>["materials"];

type House = {
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  depth: number;
  height: number;
  roofHeight: number;
  roofColor: string;
  floors: number;
  balcony: boolean;
};

const ROOF_COLORS = [
  WORLD_COLORS.roofSlate,
  WORLD_COLORS.roofClay,
  WORLD_COLORS.roofBrown,
  WORLD_COLORS.roofTeal,
];

const WALL_COLORS = ["#d8c6a3", "#e0cfae", "#cbb896", "#e6d6b6"];

function rotateOffset(x: number, z: number, rotation: number) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return [x * cos + z * sin, -x * sin + z * cos] as const;
}

/* ------------------------------------------------------------------ */
/* Village data                                                        */
/* ------------------------------------------------------------------ */

function createVillage() {
  const random = seededRandom(0x51f15e);
  const houses: House[] = [];
  const timber: Transform[] = [];
  const wood: Transform[] = [];
  const sills: Transform[] = [];
  const litWindows: Transform[] = [];
  const darkWindows: Transform[] = [];
  const doors: Transform[] = [];
  const awnings: Transform[] = [];
  const noren: Transform[] = [];
  const lanterns: Vec3[] = [];

  const addHouse = (x: number, z: number, rotation: number, scale = 1) => {
    const width = (3.4 + random() * 1.7) * scale;
    const depth = (2.9 + random() * 1.1) * scale;
    const twoStorey = random() > 0.52;
    const height =
      (twoStorey ? 3.6 + random() * 0.8 : 2.3 + random() * 0.7) * scale;

    houses.push({
      x,
      y: groundHeight(x, z),
      z,
      rotation,
      width,
      depth,
      height,
      roofHeight: (1.35 + random() * 0.55) * scale,
      roofColor: ROOF_COLORS[Math.floor(random() * ROOF_COLORS.length)],
      floors: twoStorey ? 2 : 1,
      balcony: twoStorey && random() > 0.32,
    });
  };

  // Houses lining the central avenue, facing the road.
  for (let index = 0; index < 7; index += 1) {
    const z = 14.5 - index * 4.5;
    for (const side of [-1, 1]) {
      const x = side * (6.4 + random() * 1.3);
      addHouse(
        x,
        z + (random() - 0.5) * 1.1,
        side === 1 ? -Math.PI / 2 : Math.PI / 2,
        1 + random() * 0.12
      );
    }
  }

  // Dense terraced rows rising toward the Hokage building.
  const rows = [
    { z: -9, xs: [-12.5, -19, -25.5, 12.5, 19, 25.5] },
    { z: -17, xs: [-13.5, -20.5, -27.5, 14, 21, 27.5] },
    { z: -25, xs: [-15, -22, -29, 16.5, 23.5, 30] },
  ];

  for (const row of rows) {
    for (const x of row.xs) {
      const jitterZ = (random() - 0.5) * 2.2;
      const jitterX = (random() - 0.5) * 1.4;
      addHouse(
        x + jitterX,
        row.z + jitterZ,
        (random() - 0.5) * 0.32,
        0.92 + random() * 0.22
      );
    }
  }

  // Skyline fill behind the Hokage building.
  for (const [x, z] of [
    [-22, -40],
    [-30, -43],
    [21, -40],
    [29, -44],
    [-36, -34],
    [35, -33],
  ]) {
    addHouse(x, z, (random() - 0.5) * 0.5, 0.95 + random() * 0.2);
  }

  // Outlying homes on the valley shoulders.
  addHouse(-26, 4, 0.2, 1.05);
  addHouse(27, 2, -0.18, 1.02);
  addHouse(-31, -10, 0.4, 0.95);
  addHouse(32, -12.5, -0.3, 1);

  /* ---------------- per-house detail ---------------- */

  for (const house of houses) {
    const {
      x,
      y,
      z,
      rotation,
      width,
      depth,
      height,
      roofHeight,
      floors,
      balcony,
    } = house;

    const addTimber = (
      localX: number,
      localY: number,
      localZ: number,
      scale: Vec3
    ) => {
      const [offsetX, offsetZ] = rotateOffset(localX, localZ, rotation);
      timber.push({
        position: [x + offsetX, y + localY, z + offsetZ],
        scale,
        rotation: [0, rotation, 0],
      });
    };

    const addWood = (
      localX: number,
      localY: number,
      localZ: number,
      scale: Vec3
    ) => {
      const [offsetX, offsetZ] = rotateOffset(localX, localZ, rotation);
      wood.push({
        position: [x + offsetX, y + localY, z + offsetZ],
        scale,
        rotation: [0, rotation, 0],
      });
    };

    const addPlane = (
      localX: number,
      localY: number,
      localZ: number,
      planeRotation: number,
      u: number,
      v: number,
      w: number,
      h: number,
      depthOffset: number,
      target: Transform[]
    ) => {
      const rel = planeRotation - rotation;
      const rightX = Math.cos(rel);
      const rightZ = -Math.sin(rel);
      const normalX = Math.sin(rel);
      const normalZ = Math.cos(rel);

      const localU = localX + u * rightX + depthOffset * normalX;
      const localV = localZ + u * rightZ + depthOffset * normalZ;
      const [offsetX, offsetZ] = rotateOffset(localU, localV, rotation);

      target.push({
        position: [x + offsetX, y + localY + v, z + offsetZ],
        scale: [w, h, 1],
        rotation: [0, planeRotation, 0],
      });
    };

    const addBoxPlane = (
      localX: number,
      localY: number,
      localZ: number,
      planeRotation: number,
      u: number,
      v: number,
      w: number,
      h: number,
      d: number,
      depthOffset: number,
      target: Transform[]
    ) => {
      const rel = planeRotation - rotation;
      const rightX = Math.cos(rel);
      const rightZ = -Math.sin(rel);
      const normalX = Math.sin(rel);
      const normalZ = Math.cos(rel);

      const localU = localX + u * rightX + depthOffset * normalX;
      const localV = localZ + u * rightZ + depthOffset * normalZ;
      const [offsetX, offsetZ] = rotateOffset(localU, localV, rotation);

      target.push({
        position: [x + offsetX, y + localY + v, z + offsetZ],
        scale: [w, h, d],
        rotation: [0, planeRotation, 0],
      });
    };

    // Corner posts and horizontal beams.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        addTimber(
          (sx * width) / 2,
          height / 2,
          (sz * depth) / 2,
          [0.11, height, 0.11]
        );
      }
    }

    for (const sz of [-1, 1]) {
      addTimber(0, height * 0.53, (sz * depth) / 2, [width, 0.08, 0.08]);
      addTimber(0, height * 0.9, (sz * depth) / 2, [width, 0.08, 0.08]);
    }
    for (const sx of [-1, 1]) {
      addTimber((sx * width) / 2, height * 0.53, 0, [0.08, 0.08, depth]);
      addTimber((sx * width) / 2, height * 0.9, 0, [0.08, 0.08, depth]);
    }

    // Eave trim and ridge details.
    for (const sz of [-1, 1]) {
      addTimber(
        0,
        height + 0.02,
        sz * depth * 0.66,
        [width * 1.17, 0.09, 0.12]
      );
    }
    for (const sx of [-1, 1]) {
      addTimber(
        sx * width * 0.66,
        height + 0.02,
        0,
        [0.12, 0.09, depth * 1.17]
      );
    }
    addTimber(0, height + roofHeight - 0.05, 0, [width * 1.03, 0.14, 0.2]);
    for (const sx of [-1, 1]) {
      addWood(
        sx * width * 0.5,
        height + roofHeight - 0.08,
        0,
        [0.13, 0.42, 0.13]
      );
    }

    // Windows: front plus both visible sides.
    const levels =
      floors === 2 ? [height * 0.28, height * 0.69] : [height * 0.52];
    const windowWidth = 0.46;
    const windowHeight = 0.52;

    for (const level of levels) {
      for (const offset of [-0.27, 0.27]) {
        const isLit = random() > 0.37;
        const target = isLit ? litWindows : darkWindows;

        addPlane(
          offset * width,
          level,
          depth / 2 + 0.03,
          rotation,
          0,
          0,
          windowWidth,
          windowHeight,
          0,
          target
        );
        addBoxPlane(
          offset * width,
          level,
          depth / 2 + 0.03,
          rotation,
          0,
          -windowHeight / 2 - 0.04,
          0.6,
          0.07,
          0.18,
          0.04,
          sills
        );

        addPlane(
          width / 2 + 0.03,
          level,
          0,
          rotation + Math.PI / 2,
          offset * depth,
          0,
          windowWidth,
          windowHeight,
          0,
          random() > 0.55 ? litWindows : darkWindows
        );
        addPlane(
          -width / 2 - 0.03,
          level,
          0,
          rotation - Math.PI / 2,
          offset * depth,
          0,
          windowWidth,
          windowHeight,
          0,
          random() > 0.55 ? litWindows : darkWindows
        );
      }
    }

    // Door, frame, step and fabric.
    addPlane(0, 0.62, depth / 2 + 0.035, rotation, 0, 0, 0.68, 1.12, 0, doors);
    addTimber(-0.42, 0.62, depth / 2 + 0.03, [0.08, 1.24, 0.12]);
    addTimber(0.42, 0.62, depth / 2 + 0.03, [0.08, 1.24, 0.12]);
    addTimber(0, 1.26, depth / 2 + 0.03, [0.92, 0.1, 0.16]);
    addWood(0, 0.06, depth / 2 + 0.28, [0.94, 0.12, 0.52]);
    addPlane(0, 1.3, depth / 2 + 0.08, rotation, 0, 0, 0.86, 0.5, 0, noren);

    const [awningX, awningZ] = rotateOffset(0, depth / 2 + 0.03, rotation);
    awnings.push({
      position: [x + awningX, y + 1.98, z + awningZ],
      scale: [width * 0.64, 1, 1],
      rotation: [0, rotation, 0],
    });

    // Balcony for taller homes.
    if (balcony) {
      const level = height * 0.5;
      addWood(0, level - 0.06, depth / 2 + 0.34, [width * 0.9, 0.12, 0.92]);
      addTimber(0, level + 0.5, depth / 2 + 0.76, [width * 0.9, 0.05, 0.05]);
      for (const sx of [-0.44, 0, 0.44]) {
        addTimber(
          sx * width,
          level + 0.24,
          depth / 2 + 0.76,
          [0.05, 0.56, 0.05]
        );
      }
      for (let index = 0; index < 6; index += 1) {
        const u = (index / 5 - 0.5) * 0.78 * width;
        addTimber(u, level + 0.28, depth / 2 + 0.76, [0.03, 0.44, 0.03]);
      }
      for (const sx of [-1, 1]) {
        addTimber(
          sx * width * 0.44,
          level + 0.5,
          depth / 2 + 0.36,
          [0.05, 0.05, 0.82]
        );
      }
    }

    // Hanging eave lantern beside the entrance.
    const [lanternX, lanternZ] = rotateOffset(
      width * 0.36,
      depth / 2 + 0.58,
      rotation
    );
    lanterns.push([x + lanternX, y + height - 0.42, z + lanternZ]);
  }

  return {
    houses,
    timber,
    wood,
    sills,
    litWindows,
    darkWindows,
    doors,
    awnings,
    noren,
    lanterns,
  };
}

/* ------------------------------------------------------------------ */
/* Hokage building                                                     */
/* ------------------------------------------------------------------ */

function HokageTower({ materials }: { materials: VillageMaterials }) {
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roofGeometry = useMemo(() => createPagodaRoofGeometry(), []);
  const mast = useMemo(
    () => new THREE.CylinderGeometry(0.22, 0.32, 1.6, 10),
    []
  );
  const orb = useMemo(() => new THREE.SphereGeometry(0.36, 18, 14), []);
  const lanternBody = useMemo(
    () => new THREE.CylinderGeometry(0.17, 0.17, 0.44, 10),
    []
  );
  const lanternCap = useMemo(
    () => new THREE.ConeGeometry(0.25, 0.2, 8),
    []
  );
  const lanternCord = useMemo(
    () => new THREE.CylinderGeometry(0.018, 0.018, 0.34, 4),
    []
  );

  const block = (
    position: Vec3,
    scale: Vec3,
    material: THREE.Material,
    key: string,
    castShadow: boolean = true
  ) => (
    <mesh
      key={key}
      geometry={box}
      material={material}
      position={position}
      scale={scale}
      castShadow={castShadow}
      receiveShadow
    />
  );

  const panel = (
    position: Vec3,
    scale: Vec3,
    material: THREE.Material,
    key: string
  ) => (
    <mesh key={key} position={position} scale={scale} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );

  const sidePanel = (
    position: Vec3,
    scale: Vec3,
    rotation: Vec3,
    material: THREE.Material,
    key: string
  ) => (
    <mesh
      key={key}
      position={position}
      scale={scale}
      rotation={rotation}
      material={material}
    >
      <planeGeometry args={[1, 1]} />
    </mesh>
  );

  const eaveLanterns = (y: number, z: number, xs: number[], key: string) => (
    <group key={key}>
      {xs.map((x) => (
        <group key={`${key}-${x}`} position={[x, y, z]}>
          <mesh geometry={lanternCord} material={materials.timber} />
          <mesh
            geometry={lanternBody}
            material={materials.lantern}
            position={[0, -0.36, 0]}
          />
          <mesh
            geometry={lanternCap}
            material={materials.lanternCap}
            position={[0, -0.14, 0]}
          />
        </group>
      ))}
    </group>
  );

  const rail = (
    centerX: number,
    width: number,
    y: number,
    z: number,
    xs: number[],
    key: string
  ) => (
    <group key={key}>
      <mesh
        geometry={box}
        material={materials.vermilion}
        position={[centerX, y, z]}
        scale={[width, 0.14, 0.14]}
        castShadow
      />
      {xs.map((x) => (
        <mesh
          key={`${key}-${x}`}
          geometry={box}
          material={materials.vermilion}
          position={[x, y - 0.28, z]}
          scale={[0.14, 0.62, 0.14]}
          castShadow
        />
      ))}
    </group>
  );

  return (
    <group position={[2, groundHeight(2, -30), -30]}>
      {/* Broad stone terrace and main platform */}
      {block([0, 0.45, 0], [24, 0.9, 19], materials.stone, "terrace")}
      {block([0, 1.7, 0], [18, 2.4, 14], materials.stone, "platform")}

      {/* Wide ceremonial stair */}
      {Array.from({ length: 6 }, (_, index) => {
        const stepHeight = 0.48 * (index + 1);
        return block(
          [0, stepHeight / 2, 7.2 + (5 - index) * 1.0],
          [10.4 - index * 0.55, stepHeight, 1.02],
          materials.stone,
          `stair-${index}`
        );
      })}

      {/* First tier */}
      {block([0, 4.9, 0], [11.8, 4.0, 9.6], materials.towerWall, "tier1")}
      {block([0, 5.1, 4.82], [11.8, 0.2, 0.22], materials.timber, "t1beam")}
      {block([0, 6.52, 4.82], [11.8, 0.22, 0.22], materials.timber, "t1top")}
      {[-5.9, -2.95, 0, 2.95, 5.9].map((x) =>
        block(
          [x, 4.9, 4.84],
          [0.18, 4.0, 0.18],
          materials.timber,
          `t1post-${x}`
        )
      )}
      {[-5.9, -2.95, 2.95, 5.9].map((x) =>
        block(
          [x, 4.9, -4.84],
          [0.18, 4.0, 0.18],
          materials.timber,
          `t1back-${x}`
        )
      )}
      {[-4.2, -1.4, 1.4, 4.2].map((x) =>
        panel(
          [x, 6.05, 4.86],
          [1.05, 0.95, 1],
          materials.shoji,
          `t1window-${x}`
        )
      )}
      {[-1, 1].map((side) =>
        sidePanel(
          [side * 5.92, 4.6, 0],
          [0.85, 1.0, 1],
          [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0],
          materials.shoji,
          `t1side-${side}`
        )
      )}
      <mesh
        geometry={roofGeometry}
        material={materials.towerRoof}
        position={[0, 6.86, 0]}
        scale={[16.6, 2.1, 14.4]}
        castShadow
        receiveShadow
      />

      {/* First-tier veranda */}
      {rail(-3.95, 4.1, 3.56, 5.2, [-6, -1.9], "t1rail-left")}
      {rail(3.95, 4.1, 3.56, 5.2, [1.9, 6], "t1rail-right")}
      {rail(0, 11.8, 3.56, -5.2, [-5.9, 5.9], "t1rail-back")}

      {/* Entrance */}
      {panel([-0.72, 4.35, 4.86], [1.3, 2.7, 1], materials.door, "door-l")}
      {panel([0.72, 4.35, 4.86], [1.3, 2.7, 1], materials.door, "door-r")}
      {block([0, 5.78, 4.9], [3.1, 0.16, 0.2], materials.timber, "door-lintel")}
      {block([-1.5, 4.35, 4.9], [0.14, 2.9, 0.2], materials.timber, "door-jamb-l")}
      {block([1.5, 4.35, 4.9], [0.14, 2.9, 0.2], materials.timber, "door-jamb-r")}

      {/* Eave brackets */}
      {[-5.4, -3.2, -1.1, 1.1, 3.2, 5.4].map((x) =>
        block(
          [x, 6.58, 5.3],
          [0.38, 0.5, 1.0],
          materials.timber,
          `t1bracket-${x}`,
          false
        )
      )}

      {/* Hanging banners */}
      {[-5.6, 5.6].map((x) => (
        <mesh
          key={`banner-${x}`}
          position={[x, 5.6, 5.28]}
          scale={[0.85, 2.4, 1]}
          material={materials.banner}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      {[-5.6, 5.6].map((x) =>
        block(
          [x, 6.83, 5.28],
          [1.02, 0.08, 0.08],
          materials.vermilion,
          `banner-rod-${x}`
        )
      )}

      {eaveLanterns(6.72, 6.55, [-7.1, -4.7, -2.3, 0, 2.3, 4.7, 7.1], "t1lamp")}

      {/* Second tier */}
      {block([0, 9.4, 0], [8.8, 3.0, 7.2], materials.towerWall, "tier2")}
      {block([0, 8.35, 3.62], [8.8, 0.18, 0.2], materials.timber, "t2beam")}
      {block([0, 10.18, 3.62], [8.8, 0.2, 0.2], materials.timber, "t2top")}
      {[-4.4, -2.2, 0, 2.2, 4.4].map((x) =>
        block(
          [x, 9.4, 3.64],
          [0.16, 3.0, 0.16],
          materials.timber,
          `t2post-${x}`
        )
      )}
      {[-2.9, 0, 2.9].map((x) =>
        panel(
          [x, 9.1, 3.66],
          [0.95, 1.05, 1],
          x === 0 ? materials.darkWindow : materials.shoji,
          `t2window-${x}`
        )
      )}
      {[-1, 1].map((side) =>
        sidePanel(
          [side * 4.42, 9.4, 0],
          [0.85, 1.0, 1],
          [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0],
          materials.shoji,
          `t2side-${side}`
        )
      )}
      <mesh
        geometry={roofGeometry}
        material={materials.towerRoof}
        position={[0, 10.84, 0]}
        scale={[12.6, 1.9, 11]}
        castShadow
        receiveShadow
      />
      {[-4, -2, 0, 2, 4].map((x) =>
        block(
          [x, 10.56, 4.05],
          [0.34, 0.46, 0.9],
          materials.timber,
          `t2bracket-${x}`,
          false
        )
      )}
      {rail(-2.95, 2.7, 8.62, 3.95, [-4.3, -1.6], "t2rail-left")}
      {rail(2.95, 2.7, 8.62, 3.95, [1.6, 4.3], "t2rail-right")}

      {/* Hokage sign */}
      {block([0, 10.5, 3.72], [3.5, 1.3, 0.12], materials.timber, "sign-back")}
      {panel([0, 10.5, 3.8], [3.24, 1.06, 1], materials.sign, "sign")}

      {eaveLanterns(10.7, 5.25, [-4.6, -2.3, 2.3, 4.6], "t2lamp")}

      {/* Third tier */}
      {block([0, 12.95, 0], [5.9, 2.7, 4.9], materials.towerWall, "tier3")}
      {block([0, 11.9, 2.48], [5.9, 0.16, 0.18], materials.timber, "t3beam")}
      {block([0, 13.78, 2.48], [5.9, 0.18, 0.18], materials.timber, "t3top")}
      {[-2.95, 0, 2.95].map((x) =>
        block(
          [x, 12.95, 2.5],
          [0.14, 2.7, 0.14],
          materials.timber,
          `t3post-${x}`
        )
      )}
      {[-1.2, 1.2].map((x) =>
        panel(
          [x, 12.95, 2.52],
          [0.8, 0.95, 1],
          materials.shoji,
          `t3window-${x}`
        )
      )}
      {[-1, 1].map((side) =>
        sidePanel(
          [side * 2.97, 12.95, 0],
          [0.75, 0.9, 1],
          [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0],
          materials.shoji,
          `t3side-${side}`
        )
      )}
      <mesh
        geometry={roofGeometry}
        material={materials.towerRoof}
        position={[0, 14.24, 0]}
        scale={[9.2, 1.7, 8.2]}
        castShadow
        receiveShadow
      />
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) =>
        block(
          [x, 14.0, 2.85],
          [0.28, 0.4, 0.8],
          materials.timber,
          `t3bracket-${x}`,
          false
        )
      )}

      {/* Finial */}
      <mesh
        geometry={mast}
        material={materials.gold}
        position={[0, 15.55, 0]}
        castShadow
      />
      <mesh
        geometry={orb}
        material={materials.gold}
        position={[0, 16.55, 0]}
        castShadow
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Pagoda                                                              */
/* ------------------------------------------------------------------ */

function Pagoda({ materials }: { materials: VillageMaterials }) {
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roofGeometry = useMemo(() => createPagodaRoofGeometry(), []);

  const tier = (
    baseY: number,
    size: number,
    wallHeight: number,
    roofWidth: number,
    roofHeight: number,
    key: string
  ) => (
    <group key={key}>
      <mesh
        geometry={box}
        material={materials.towerWall}
        position={[0, baseY + wallHeight / 2, 0]}
        scale={[size, wallHeight, size]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={box}
        material={materials.timber}
        position={[0, baseY + 0.1, size / 2 + 0.02]}
        scale={[size + 0.08, 0.14, 0.14]}
        castShadow
      />
      <mesh
        geometry={roofGeometry}
        material={materials.towerRoof}
        position={[0, baseY + wallHeight, 0]}
        scale={[roofWidth, roofHeight, roofWidth]}
        castShadow
        receiveShadow
      />
      <mesh
        position={[0, baseY + wallHeight * 0.55, size / 2 + 0.035]}
        scale={[0.62, 0.9, 1]}
        material={materials.shoji}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh
        geometry={box}
        material={materials.vermilion}
        position={[0, baseY + 0.52, size / 2 + 0.42]}
        scale={[size * 0.94, 0.1, 0.1]}
        castShadow
      />
    </group>
  );

  return (
    <group position={[-16, groundHeight(-16, -38), -38]}>
      {tier(-0.2, 5.2, 1.4, 7.4, 1.5, "tier-1")}
      {tier(3.1, 4.1, 2.2, 6.2, 1.25, "tier-2")}
      {tier(6.0, 3.1, 1.9, 4.9, 1.05, "tier-3")}
      <mesh
        geometry={box}
        material={materials.timber}
        position={[0, 8.6, 0]}
        scale={[0.16, 1.7, 0.16]}
        castShadow
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Torii gate                                                          */
/* ------------------------------------------------------------------ */

function ToriiGate({ materials }: { materials: VillageMaterials }) {
  const pillar = useMemo(
    () => new THREE.CylinderGeometry(0.27, 0.33, 5.2, 10),
    []
  );
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <group position={[0, groundHeight(0, -6), -6]} scale={0.92}>
      {[-2.9, 2.9].map((x) => (
        <mesh
          key={x}
          geometry={pillar}
          material={materials.vermilion}
          position={[x, 2.6, 0]}
          castShadow
        />
      ))}

      {/* Kasagi: top beam with lifted ends. */}
      <mesh
        geometry={box}
        material={materials.vermilion}
        position={[0, 5.25, 0]}
        scale={[6.2, 0.34, 0.54]}
        castShadow
      />
      {[-1, 1].map((side) => (
        <mesh
          key={`kasagi-${side}`}
          geometry={box}
          material={materials.vermilion}
          position={[side * 3.35, 5.34, 0]}
          rotation={[0, 0, -side * 0.17]}
          scale={[1.6, 0.32, 0.54]}
          castShadow
        />
      ))}

      {/* Nuki: lower cross beam and centre strut. */}
      <mesh
        geometry={box}
        material={materials.vermilion}
        position={[0, 4.58, 0]}
        scale={[6.1, 0.26, 0.36]}
        castShadow
      />
      <mesh
        geometry={box}
        material={materials.vermilion}
        position={[0, 4.92, 0.02]}
        scale={[0.86, 0.86, 0.18]}
        castShadow
      />

      {/* Plaque */}
      <mesh position={[0, 4.9, 0.13]} scale={[0.72, 0.9, 1]} material={materials.banner}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Street lanterns                                                     */
/* ------------------------------------------------------------------ */

function Lanterns() {
  const positions = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let index = 0; index < 9; index += 1) {
      const z = 13.5 - index * 3.75;
      const y = groundHeight(0, z);
      result.push([-3.35, y, z], [3.35, y, z]);
    }
    return result;
  }, []);

  return (
    <group>
      <Instances limit={positions.length} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 2.3, 6]} />
        <meshStandardMaterial color="#2a2019" roughness={0.9} />
        {positions.map(([x, y, z], index) => (
          <Instance key={`post-${index}`} position={[x, y + 1.15, z]} />
        ))}
      </Instances>

      <Instances limit={positions.length}>
        <cylinderGeometry args={[0.17, 0.17, 0.4, 10]} />
        <meshStandardMaterial
          color="#ffbe83"
          emissive="#ff9d4d"
          emissiveIntensity={2.1}
          roughness={0.5}
        />
        {positions.map(([x, y, z], index) => (
          <Instance key={`lamp-${index}`} position={[x, y + 2.27, z]} />
        ))}
      </Instances>

      <Instances limit={positions.length} castShadow>
        <coneGeometry args={[0.26, 0.22, 8]} />
        <meshStandardMaterial color="#241a13" roughness={0.9} />
        {positions.map(([x, y, z], index) => (
          <Instance key={`cap-${index}`} position={[x, y + 2.58, z]} />
        ))}
      </Instances>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Village                                                             */
/* ------------------------------------------------------------------ */

// Band-split helper: stagger by depth (front -> back) with GPU transforms only.
const BANDS = [
  { id: "front", delay: 0, from: -6, to: Infinity },
  { id: "mid", delay: 0.22, from: -27, to: -6 },
  { id: "back", delay: 0.45, from: -Infinity, to: -27 },
] as const;

function inBand(z: number, band: (typeof BANDS)[number]) {
  return z > band.from && z <= band.to;
}

type VillageData = ReturnType<typeof createVillage>;
type Band = (typeof BANDS)[number];

const VillageInstances = memo(function VillageInstances({ village, materials, roofGeometry, awningGeometry, band }: { village: VillageData; materials: VillageMaterials; roofGeometry: THREE.BufferGeometry; awningGeometry: THREE.BufferGeometry; band: Band }) {
  const houses = village.houses.filter((h) => inBand(h.z, band));
  const timber = village.timber.filter((x) => inBand(x.position[2], band));
  const wood = village.wood.filter((x) => inBand(x.position[2], band));
  const sills = village.sills.filter((x) => inBand(x.position[2], band));
  const litWindows = village.litWindows.filter((x) => inBand(x.position[2], band));
  const darkWindows = village.darkWindows.filter((x) => inBand(x.position[2], band));
  const doors = village.doors.filter((x) => inBand(x.position[2], band));
  const awnings = village.awnings.filter((x) => inBand(x.position[2], band));
  const noren = village.noren.filter((x) => inBand(x.position[2], band));
  const lanterns = village.lanterns.filter((x) => inBand(x[2], band));
  return (
    <group>
      <Instances limit={Math.max(houses.length, 1)} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.wall} attach="material" />
        {houses.map((house, index) => (
          <Instance key={`wall-${index}`} position={[house.x, house.y + house.height / 2, house.z]} scale={[house.width, house.height, house.depth]} rotation={[0, house.rotation, 0]} color={WALL_COLORS[index % WALL_COLORS.length]} />
        ))}
      </Instances>
      <Instances limit={Math.max(houses.length, 1)} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.foundation} attach="material" />
        {houses.map((house, index) => (
          <Instance key={`foundation-${index}`} position={[house.x, house.y + 0.12, house.z]} scale={[house.width * 1.08, 0.34, house.depth * 1.08]} rotation={[0, house.rotation, 0]} />
        ))}
      </Instances>
      <Instances limit={Math.max(houses.length, 1)} castShadow receiveShadow geometry={roofGeometry}>
        <primitive object={materials.roof} attach="material" />
        {houses.map((house, index) => (
          <Instance key={`roof-${index}`} position={[house.x, house.y + house.height, house.z]} scale={[house.width * 1.16, house.roofHeight, house.depth * 1.18]} rotation={[0, house.rotation, 0]} color={house.roofColor} />
        ))}
      </Instances>
      <Instances limit={Math.max(timber.length, 1)} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.timber} attach="material" />
        {timber.map((piece, index) => <Instance key={`timber-${index}`} position={piece.position} scale={piece.scale} rotation={piece.rotation} />)}
      </Instances>
      <Instances limit={Math.max(wood.length, 1)} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.wood} attach="material" />
        {wood.map((piece, index) => <Instance key={`wood-${index}`} position={piece.position} scale={piece.scale} rotation={piece.rotation} />)}
      </Instances>
      <Instances limit={Math.max(sills.length, 1)} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.wood} attach="material" />
        {sills.map((piece, index) => <Instance key={`sill-${index}`} position={piece.position} scale={piece.scale} rotation={piece.rotation} />)}
      </Instances>
      <Instances limit={Math.max(litWindows.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.shoji} attach="material" />
        {litWindows.map((w, index) => <Instance key={`lit-${index}`} position={w.position} scale={w.scale} rotation={w.rotation} />)}
      </Instances>
      <Instances limit={Math.max(darkWindows.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.darkWindow} attach="material" />
        {darkWindows.map((w, index) => <Instance key={`dark-${index}`} position={w.position} scale={w.scale} rotation={w.rotation} />)}
      </Instances>
      <Instances limit={Math.max(doors.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.door} attach="material" />
        {doors.map((d, index) => <Instance key={`door-${index}`} position={d.position} scale={d.scale} rotation={d.rotation} />)}
      </Instances>
      <Instances limit={Math.max(awnings.length, 1)} castShadow receiveShadow geometry={awningGeometry}>
        <primitive object={materials.awning} attach="material" />
        {awnings.map((a, index) => <Instance key={`awning-${index}`} position={a.position} scale={a.scale} rotation={a.rotation} />)}
      </Instances>
      <Instances limit={Math.max(noren.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.noren} attach="material" />
        {noren.map((c, index) => <Instance key={`noren-${index}`} position={c.position} scale={c.scale} rotation={c.rotation} />)}
      </Instances>
      <Instances limit={Math.max(lanterns.length, 1)}>
        <cylinderGeometry args={[0.16, 0.16, 0.36, 10]} />
        <primitive object={materials.lantern} attach="material" />
        {lanterns.map((pos, index) => <Instance key={`lantern-${index}`} position={pos} />)}
      </Instances>
      <Instances limit={Math.max(lanterns.length, 1)} castShadow>
        <coneGeometry args={[0.22, 0.18, 8]} />
        <primitive object={materials.lanternCap} attach="material" />
        {lanterns.map((pos, index) => <Instance key={`lantern-cap-${index}`} position={[pos[0], pos[1] + 0.27, pos[2]]} />)}
      </Instances>
    </group>
  );
});

export default function Buildings() {

  const { materials, textures } = useMemo(() => buildMaterials(), []);
  const village = useMemo(() => createVillage(), []);
  const roofGeometry = useMemo(() => createGableRoofGeometry(), []);
  const { phase } = useReveal();
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const bandRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    const refs = bandRefs.current;
    if (!refs[0] || !refs[1] || !refs[2]) return;
    const p = phaseRef.current;
    const active =
      p === "BUILDING_CONSTRUCTION" || p === "ENVIRONMENT_ACTIVATION" || p === "CAMERA_MOVEMENT" ||
      p === "NAVIGATION_REVEAL" || p === "HERO_TEXT_REVEAL" || p === "PORTRAIT_REVEAL" ||
      p === "CTA_REVEAL" || p === "COMPLETE";
    const target = active ? 1 : 0;
    // Early exit: once settled, stop touching transforms (no per-frame writes).
    if (progressRef.current === target && progressRef.current === 1) return;
    progressRef.current += (target - progressRef.current) * Math.min(1, delta * 1.7);
    const prog = progressRef.current;
    for (let i = 0; i < BANDS.length; i += 1) {
      const b = BANDS[i];
      const bandP = THREE.MathUtils.clamp((prog - b.delay) / (1 - b.delay || 1), 0, 1);
      // Ease: smoothstep for natural staggering without frame drops.
      const eased = bandP * bandP * (3 - 2 * bandP);
      const g = refs[i];
      if (g) {
        g.scale.setScalar(Math.max(eased, 0.0001));
        // GPU-friendly rise — off-screen bands cost nothing extra.
        g.position.y = (1 - eased) * -1.2;
      }
    }
  });

  const awningGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1, 0.07, 0.95);
    geometry.rotateX(0.38);
    geometry.translate(0, 0, 0.43);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  useEffect(
    () => () => {
      for (const texture of textures) {
        texture.dispose();
      }
    },
    [textures]
  );

  return (
    <group>
      {BANDS.map((band, i) => (
        <group
          key={band.id}
          ref={(g: THREE.Group | null) => {
            const refs = bandRefs.current;
            if (g) refs[i] = g;
          }}
        >
          <VillageInstances village={village} materials={materials} roofGeometry={roofGeometry} awningGeometry={awningGeometry} band={band} />
        </group>
      ))}
      <HokageTower materials={materials} />
      <Pagoda materials={materials} />
      <ToriiGate materials={materials} />
      <Lanterns />
    </group>
  );
}
