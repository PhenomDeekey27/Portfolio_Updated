'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import Image from 'next/image';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SkillItem {
  name: string;
  img: string;
}

const skillsList: SkillItem[] = [
  { name: 'Html', img: '/assets/Html.svg' },
  { name: 'Css', img: '/assets/CSS3_logo.webp' },
  { name: 'JavaScript', img: '/assets/js.webp' },
  { name: 'React', img: '/assets/React_logo.png' },
  { name: 'Redux', img: '/assets/redux.webp' },
  { name: 'MongoDb', img: '/assets/MongoSvg.svg' },
  { name: 'NodeJs', img: '/assets/NodeSvg.svg' },
  { name: 'Express', img: '/assets/ExpressSvg.svg' },
  { name: 'Python', img: '/assets/python.svg' },
  { name: 'FastAPI', img: '/assets/fastapi.svg' },
  { name: 'Supabase', img: '/assets/supabase.svg' },
  { name: 'PostgreSQL', img: '/assets/postgresql.svg' },
];

function OrbitGroup() {
  const groupRef = useRef<THREE.Group | null>(null);

  // Compute points on a sphere/cylinder for the skills
  const skillsWithCoords = useMemo(() => {
    const radius = 2.2;
    return skillsList.map((skill, index) => {
      // Golden ratio layout on a sphere for 8 items
      const phi = Math.acos(-1 + (2 * index) / skillsList.length);
      const theta = Math.sqrt(skillsList.length * Math.PI) * phi;
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi) * 0.8;
      const z = radius * Math.cos(phi);
      
      return { ...skill, x, y, z };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Slow rotational drift
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Visual representation of orbits */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.18, 2.22, 64]} />
        <meshBasicMaterial color="#30363D" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, Math.PI / 6, 0]}>
        <ringGeometry args={[2.18, 2.22, 64]} />
        <meshBasicMaterial color="#30363D" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Skill nodes rendering as HTML cards in 3D */}
      {skillsWithCoords.map((skill, i) => (
        <group key={i} position={[skill.x, skill.y, skill.z]}>
          <Html distanceFactor={7} center>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-github-surface/90 border border-github-border hover:border-github-blue hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] text-center backdrop-blur-xs select-none hover:scale-110 active:scale-95 transition-all duration-300 w-24 h-24 cursor-grab active:cursor-grabbing">
              <div className="relative w-10 h-10 mb-2 flex items-center justify-center">
                <Image
                  src={skill.img}
                  alt={skill.name}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-full h-full object-contain pointer-events-none"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-github-text truncate w-full">
                {skill.name}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function SkillsCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // PHASE 6.15 — stop rendering the orbit scene while it is off screen, the way
  // HiddenLeafWorld does. The skill ring is only ever read inside its own band.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setIsVisible(entries[entries.length - 1]?.isIntersecting ?? false),
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing"
    >
      <Canvas
        frameloop={isVisible ? "always" : "never"}
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <OrbitGroup />
      </Canvas>
    </div>
  );
}
