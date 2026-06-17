"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import ThreeDCard from "./ThreeDCard";

// Dynamically import SkillsCanvas with ssr: false
const SkillsCanvas = dynamic(() => import("./SkillsCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] md:h-[500px] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-2 border-github-blue border-t-transparent animate-spin" />
        <span className="text-sm font-mono text-github-subtext">
          Initializing 3D Orbit...
        </span>
      </div>
    </div>
  ),
});

const skillsList = [
  { name: "Html", img: "/assets/Html.svg", category: "Frontend" },
  { name: "Css", img: "/assets/CSS3_logo.webp", category: "Frontend" },
  { name: "JavaScript", img: "/assets/js.webp", category: "Core Language" },
  { name: "React", img: "/assets/React_logo.png", category: "Library" },
  { name: "Redux", img: "/assets/redux.webp", category: "State Management" },
  { name: "MongoDb", img: "/assets/MongoSvg.svg", category: "Database" },
  { name: "NodeJs", img: "/assets/NodeSvg.svg", category: "Runtime" },
  {
    name: "Express",
    img: "/assets/ExpressSvg.svg",
    category: "Backend Framework",
  },
  { name: "Python", img: "/assets/python.svg", category: "Core Language" },
  {
    name: "FastAPI",
    img: "/assets/fastapi.svg",
    category: "Backend Framework",
  },
  {
    name: "Supabase",
    img: "/assets/supabase.svg",
    category: "Database / Backend",
  },
  { name: "PostgreSQL", img: "/assets/postgresql.svg", category: "Database" },
];

export default function Skills() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section
      id="Skills"
      className="relative w-full py-24 border-b border-github-border/40 bg-github-surface/30 overflow-hidden"
    >
      {/* Background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-github-blue/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-github-border bg-github-surface text-xs font-mono text-github-blue"
          >
            <Cpu className="h-3.5 w-3.5" />
            Stack Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-github-gold font-mont"
          >
            Technical Skills
          </motion.h2>
          <div className="mt-2 h-1 w-20 bg-github-gold rounded-full" />
        </div>

        {/* 3D Visualizer & Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: 3D Orbit Visualizer (Hidden on mobile/tablet to prevent touch scroll-trapping) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center">
            <div className="text-center lg:text-left mb-6">
              <h3 className="text-xl font-bold text-github-text font-mono"></h3>
              <p className="text-sm text-github-subtext mt-1.5"></p>
            </div>
            <div className="rounded-2xl border border-github-border bg-github-bg/40 shadow-inner overflow-hidden">
              <SkillsCanvas />
            </div>
          </div>

          {/* Right Side: Skill Cards Grid */}
          <div className="col-span-1 lg:col-span-6">
            <div className="text-center lg:text-left mb-6">
              <h3 className="text-xl font-bold text-github-text font-mono">
                Technology Inventory
              </h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {skillsList.map((skill, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <ThreeDCard className="p-4 flex flex-col items-center justify-between text-center h-32 hover:border-github-blue/60 hover:bg-github-surface/80 group cursor-pointer">
                    <div className="relative h-12 w-12 flex items-center justify-center">
                      <img
                        src={skill.img}
                        alt={skill.name}
                        className="max-h-full max-w-full object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(88,166,255,0.4)] transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-mono font-bold text-github-text truncate">
                        {skill.name}
                      </h4>
                      <span className="text-[9px] font-mono text-github-subtext uppercase tracking-wider block mt-0.5">
                        {skill.category}
                      </span>
                    </div>
                  </ThreeDCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
