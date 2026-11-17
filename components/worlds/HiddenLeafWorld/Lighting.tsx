"use client";

export default function Lighting() {
  return (
    <>
      <ambientLight color="#41536e" intensity={1.15} />
      <hemisphereLight
        args={["#a8bcd8", "#5e4734", 1.15]}
        position={[0, 30, 0]}
      />

      <directionalLight
        position={[-32, 34, -8]}
        color="#ffd2a6"
        intensity={3.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-near={1}
        shadow-camera-far={170}
        shadow-bias={-0.0004}
        shadow-normalBias={0.045}
      />

      <directionalLight
        position={[24, 16, 44]}
        color="#e8b184"
        intensity={1.05}
      />

      <directionalLight
        position={[18, 22, -60]}
        color="#8fb2e8"
        intensity={0.55}
      />
    </>
  );
}
