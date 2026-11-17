"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vDirection;
  uniform float uTime;
  uniform vec3 uSunDirection;
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 2; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec2(17.3, 9.1);
      amplitude *= 0.5;
    }
    return value;
  }
  void main() {
    vec3 dir = normalize(vDirection);
    float height = clamp(dir.y, -0.2, 1.0);
    vec3 horizon = vec3(0.72, 0.32, 0.115);
    vec3 mid = vec3(0.105, 0.115, 0.155);
    vec3 zenith = vec3(0.004, 0.009, 0.022);
    vec3 color = mix(horizon, mid, smoothstep(0.0, 0.32, height));
    color = mix(color, zenith, smoothstep(0.26, 0.88, height));
    vec3 sunDirection = normalize(uSunDirection);
    float sunAmount = max(dot(dir, sunDirection), 0.0);
    color += vec3(1.0, 0.52, 0.2) * pow(sunAmount, 9.0) * 0.26;
    color += vec3(1.0, 0.72, 0.38) * pow(sunAmount, 190.0) * 1.55;
    color += vec3(1.0, 0.46, 0.17) * exp(-max(height, 0.0) * 7.0) * 0.22;
    float cloudMask = smoothstep(0.01, 0.13, height) * (1.0 - smoothstep(0.54, 0.94, height));
    if (cloudMask > 0.001) {
      vec2 cloudUv = dir.xz / (dir.y + 0.22);
      float drift = uTime * 0.005;
      float shape = fbm(cloudUv * vec2(0.95, 1.55) + vec2(drift, drift * 0.3));
      float cloud = smoothstep(0.46, 0.64, shape);
      vec3 cloudDark = vec3(0.155, 0.15, 0.185);
      vec3 cloudLit = vec3(1.0, 0.63, 0.36);
      vec3 cloudColor = mix(cloudDark, cloudLit, pow(sunAmount, 2.0) * 0.85 + 0.24);
      color = mix(color, cloudColor, cloud * cloudMask * 0.82);
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export default function Sky() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frameRef = useRef(0);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSunDirection: { value: new THREE.Vector3(-0.62, 0.16, -0.77).normalize() },
  }), []);

  // Throttle: update cloud drift every 3rd frame (~20fps) — visually identical
  // for such slow drift, ~3x less uniform churn.
  useFrame((state) => {
    if (!materialRef.current) return;
    frameRef.current += 1;
    if (frameRef.current % 3 !== 0) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[320, 24, 16]} />
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}
