'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function ThreeDCard({ children, className = '' }: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring values for smooth transition
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

  // Shine position motion values
  const shineX = useMotionValue(0);
  const shineY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center (normalized between -0.5 and 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);

    // Mouse coordinates relative to card top-left (for radial-gradient shine)
    shineX.set(e.clientX - rect.left);
    shineY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-xl border border-github-border bg-github-card p-6 shadow-xl transition-all duration-300 ${
        isHovered ? 'shadow-[rgba(88,166,255,0.06)_0px_0px_20px_0px]' : ''
      } ${className}`}
    >
      {/* Shine overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: useTransform(
            [shineX, shineY],
            ([sx, sy]) =>
              `radial-gradient(400px circle at ${sx}px ${sy}px, rgba(88, 166, 255, 0.12), transparent 80%)`
          ),
        }}
      />
      {/* Border shine overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: useTransform(
            [shineX, shineY],
            ([sx, sy]) =>
              `radial-gradient(150px circle at ${sx}px ${sy}px, rgba(188, 140, 255, 0.25), transparent 60%)`
          ),
          maskImage: 'linear-gradient(black, black) exclude, linear-gradient(black, black)',
          WebkitMaskImage:
            'linear-gradient(white, white) content-box, linear-gradient(white, white)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      {/* Content wrapper */}
      <div style={{ transform: 'translateZ(10px)' }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
