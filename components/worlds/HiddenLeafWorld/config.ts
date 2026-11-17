import { MathUtils } from "three";

export const WORLD_COLORS = {
  skyZenith: "#0a1424",
  skyHorizon: "#d99a63",
  sun: "#ffd9a3",
  fog: "#a38a76",
  ground: "#343a2e",
  groundLight: "#474a37",
  path: "#5d5141",
  stone: "#4b463f",
  plaster: "#cdbb98",
  plasterWarm: "#dcc8a4",
  timber: "#2f221a",
  timberLight: "#46342a",
  roofSlate: "#3a444f",
  roofTeal: "#33484a",
  roofClay: "#5b3a30",
  roofBrown: "#493a31",
  vermilion: "#8a332a",
  window: "#ffc37a",
  lantern: "#ffab5e",
  foliageDark: "#22342a",
  foliageMid: "#2d4636",
  foliageLight: "#3c5741",
  rock: "#4d4841",
} as const;

/** Deterministic PRNG so the village layout is stable between renders. */
export function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function groundHeight(x: number, z: number) {
  const backRise = z < -6 ? (-z - 6) * 0.035 : 0;
  const sideRise = Math.max(0, Math.abs(x) - 24) * 0.05;
  const basinRim =
    Math.max(0, Math.abs(x) - 40) * 0.16 + Math.max(0, -z - 56) * 0.1;

  return backRise + sideRise + basinRim;
}

/** Terrain gets extra noisy detail away from the village floor. */
export function terrainHeight(x: number, z: number) {
  const base = groundHeight(x, z);
  const distance = Math.max(Math.abs(x) - 30, 0) + Math.max(-z - 38, 0);
  const mask = MathUtils.clamp(distance / 22, 0, 1);
  const detail =
    Math.sin(x * 0.19) * 0.5 +
    Math.sin(z * 0.16 + 1.3) * 0.55 +
    Math.sin((x + z) * 0.083) * 0.7;

  return base + detail * mask * 1.35;
}

export const CAMERA = {
  fov: 42,
  position: [0, 15, 37] as const,
  lookAt: [-2, 9.5, -22] as const,
  parallax: {
    positionX: 1.4,
    positionY: 0.55,
    lookX: 0.85,
    lookY: 0.35,
  },
};
