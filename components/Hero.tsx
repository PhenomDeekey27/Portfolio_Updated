"use client";

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Download, FileText, ArrowRight } from "lucide-react";

// Dynamically import Three.js Canvas to skip SSR issues
const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-github-bg/20 animate-pulse" />
  ),
});

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  const handleScrollToProjects = () => {
    const el = document.getElementById("Portfolio");
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] md:min-h-screen w-full items-center justify-center overflow-hidden pt-20 md:pt-0 border-b border-github-border/40"
    >
      {/* 3D WebGL Particle ring background */}
      <HeroCanvas />

      {/* Grid overlay to give developer IDE vibes */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Decorative colored glow spheres */}
      <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-github-blue/10 blur-[120px] pointer-events-none glow-animate" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-github-purple/10 blur-[120px] pointer-events-none glow-animate" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-7 text-center md:text-left flex flex-col justify-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 self-center md:self-start mb-4 px-3 py-1 rounded-full border border-github-border bg-github-surface/80 text-xs font-mono text-github-blue"
            >
              <span className="flex h-2 w-2 rounded-full bg-github-green animate-pulse" />
              Available for new opportunities
            </motion.div>

            <motion.h3
              variants={itemVariants}
              className="text-lg font-mono text-github-subtext tracking-wider"
            >
              Hi, I&apos;m
            </motion.h3>

            <motion.h1
              variants={itemVariants}
              className="mt-1 text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight"
            >
              <span className="bg-gradient-to-r from-github-text via-github-subtext to-github-border bg-clip-text text-transparent">
                Kasthuri Rangan
              </span>
            </motion.h1>

            <motion.h2
              variants={itemVariants}
              className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-github-gold italic"
            >
              MERN STACK & AI DEVELOPER
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl text-base sm:text-lg text-github-subtext"
            >
              Full Stack Developer with 2+ years of experience building scalable
              web applications using the MERN stack and AI-powered automation
              solutions.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center"
            >
              {/* Resume Button - Magnetic Glassmorphic Style */}
              <a
                href="https://drive.google.com/file/d/16aiBG1fUohpWh1EjDDQHdlw1_f0s8Us7/view"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2 rounded-lg bg-github-gold px-6 py-3.5 text-sm font-semibold text-github-bg hover:opacity-90 shadow-lg shadow-github-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                My Resume
              </a>

              {/* Action Project Scroll Button */}
              <button
                onClick={handleScrollToProjects}
                className="group flex items-center justify-center gap-2 rounded-lg border border-github-border bg-github-surface/50 hover:bg-github-card px-6 py-3.5 text-sm font-semibold text-github-text transition-all duration-200 w-full sm:w-auto cursor-pointer"
              >
                Explore Projects
                <ArrowRight className="h-4 w-4 text-github-subtext group-hover:translate-x-1 group-hover:text-github-blue transition-all" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Profile Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
              delay: 0.4,
            }}
            className="md:col-span-5 flex items-center justify-center mt-6 md:mt-0"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 group">
              {/* Outer floating ambient rings */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-github-blue via-github-purple to-github-gold opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-github-border bg-github-card p-2 shadow-2xl">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-github-bg">
                  <Image
                    src="/assets/Profile.png"
                    alt="Kasthuri Rangan Profile Image"
                    fill
                    sizes="(max-w-768px) 256px, 384px"
                    priority
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle terminal-like code layout grid cover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-github-bg via-transparent to-transparent opacity-60" />
                </div>
              </div>

              {/* Aesthetic Tech Tag Indicator overlays */}
              <div className="hidden sm:block absolute -bottom-4 -left-4 rounded-lg border border-github-border bg-github-surface/90 backdrop-blur-md px-3 py-1.5 font-mono text-xs text-github-subtext shadow-md">
                <span className="text-github-blue">&lt;</span>coder
                <span className="text-github-blue">/&gt;</span>
              </div>
              <div className="hidden sm:block absolute -top-4 -right-4 rounded-lg border border-github-border bg-github-surface/90 backdrop-blur-md px-3 py-1.5 font-mono text-xs text-github-subtext shadow-md">
                <span className="text-github-purple">const</span> dev ={" "}
                <span className="text-github-gold">true</span>;
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
