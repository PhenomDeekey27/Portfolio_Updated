'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    // Number of particles depending on screen size
    const particleCount = Math.min(40, Math.floor((width * height) / 30000));

    // Colors aligned with the system (accent blue, accent purple, accent gold)
    const colors = [
      'rgba(88, 166, 255, ',   // primary blue
      'rgba(188, 140, 255, ',  // accent purple
      'rgba(225, 185, 102, ',  // gold
    ];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100, // 3D depth layer
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.1,
        radius: Math.random() * 1.5 + 0.5,
        alpha: 0,
        targetAlpha: Math.random() * 0.4 + 0.1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.tx = e.clientX;
      mouseRef.current.ty = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.tx = e.touches[0].clientX;
        mouseRef.current.ty = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Initial mouse state (center of screen)
    mouseRef.current.tx = width / 2;
    mouseRef.current.ty = height / 2;
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;

    const draw = () => {
      if (document.visibilityState === 'hidden') {
        animationId = window.setTimeout(draw, 500) as unknown as number;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // Draw faint radial mesh background glow
      const bgGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        width * 0.6
      );
      bgGlow.addColorStop(0, 'rgba(22, 27, 34, 0.4)');
      bgGlow.addColorStop(0.5, 'rgba(13, 17, 23, 0.2)');
      bgGlow.addColorStop(1, 'rgba(13, 17, 23, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Render & Update Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Fade in initially
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundaries checks in 3D-ish space
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        if (p.z < 100 || p.z > 500) p.vz *= -1;

        // Project 3D depth scale
        const scale = 250 / p.z;
        const projRadius = p.radius * scale;

        // Interaction with mouse (repulsion)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 200;

        let ox = 0;
        let oy = 0;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          ox = (dx / dist) * force * 15 * scale;
          oy = (dy / dist) * force * 15 * scale;
        }

        const renderX = p.x + ox;
        const renderY = p.y + oy;

        // Draw particle
        const colorIndex = i % colors.length;
        ctx.beginPath();
        ctx.arc(renderX, renderY, projRadius, 0, Math.PI * 2);
        ctx.fillStyle = colors[colorIndex] + p.alpha + ')';
        ctx.fill();

        // Draw connections between nearby particles (limited to a few neighbours)
        for (let j = i + 1; j < Math.min(particles.length, i + 9); j++) {
          const p2 = particles[j];
          const dx2 = (p.x + ox) - (p2.x + (p2.x - mouse.x < maxDist ? (p2.x - mouse.x)/Math.hypot(p2.x - mouse.x, p2.y - mouse.y)*(maxDist - Math.hypot(p2.x - mouse.x, p2.y - mouse.y))/maxDist * 15 * (250/p2.z) : 0));
          const dy2 = (p.y + oy) - (p2.y + (p2.y - mouse.y < maxDist ? (p2.y - mouse.y)/Math.hypot(p2.x - mouse.x, p2.y - mouse.y)*(maxDist - Math.hypot(p2.x - mouse.x, p2.y - mouse.y))/maxDist * 15 * (250/p2.z) : 0));
          const dist2 = Math.hypot(dx2, dy2);

          const connectionLimit = 120;
          if (dist2 < connectionLimit) {
            const connAlpha = (1 - dist2 / connectionLimit) * 0.15 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(48, 54, 61, ${connAlpha})`;
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen', width: '100%', height: '100%' }}
    />
  );
}
