"use client";

import Atmosphere from "./Atmosphere";
import Buildings from "./Buildings";
import CameraController from "./CameraController";
import Lighting from "./Lighting";
import Mountains from "./Mountains";
import Sky from "./Sky";
import Terrain from "./Terrain";
import Vegetation from "./Vegetation";
import { WORLD_COLORS } from "./config";

export default function VillageEnvironment() {
  return (
    <>
      <fog attach="fog" args={[WORLD_COLORS.fog, 46, 205]} />
      <Sky />
      <Lighting />
      <CameraController />
      <Terrain />
      <Mountains />
      <Buildings />
      <Vegetation />
      <Atmosphere />
    </>
  );
}
