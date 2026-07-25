import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LenisScroll from "@/components/LenisScroll";
import InteractiveBackground from "@/components/InteractiveBackground";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/ContactUs";
import CursorWrapper from "@/components/CursorWrapper";
import Experience from "@/components/Experience";

export const metadata: Metadata = {
  title: "Kasthuri Rangan | Full Stack Developer Portfolio",
  description:
    "Professional portfolio of Kasthuri Rangan, a Staff Full Stack Developer specializing in responsive interfaces, RESTful APIs, and modern interactive web architectures.",
  keywords: [
    "Kasthuri Rangan",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Three.js",
    "Developer Portfolio",
    "Web3Forms",
    "Tailwind CSS",
  ],
  authors: [{ name: "Kasthuri Rangan" }],
  creator: "Kasthuri Rangan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/PhenomDeekey27",
    title: "Kasthuri Rangan | Staff Full Stack Developer Portfolio",
    description:
      "Professional portfolio of Kasthuri Rangan, a Staff Full Stack Developer specializing in responsive interfaces, RESTful APIs, and modern interactive web architectures.",
    siteName: "Kasthuri Rangan Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasthuri Rangan | Staff Full Stack Developer Portfolio",
    description:
      "Professional portfolio of Kasthuri Rangan, a Staff Full Stack Developer specializing in responsive interfaces, RESTful APIs, and modern interactive web architectures.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-github-bg text-github-text font-sans antialiased selection:bg-github-blue/30 selection:text-github-text">
      {/* Dynamic Splash Cursor fluid simulation */}
      <CursorWrapper />

      {/* Lenis Smooth Scroll Engine */}
      <LenisScroll />

      {/* Global Interactive 3D Canvas Background */}
      <InteractiveBackground />

      {/* Sticky Glassmorphic Header */}
      <Navbar />

      {/* Main Page Layout Wrapper */}
      <main className="relative z-10 flex flex-col w-full">
        {/* World-Class Hero Section with 3D ring visualizer */}
        <Hero />

        {/* Git-Readme Styled About Me Panel */}
        <About />

        {/* Career Experience Timeline */}
        <Experience />

        {/* 3D Skills Sphere and Technology Inventory */}
        <Skills />

        {/* 3D Spotlight Tilt Cards Projects Board */}
        <Projects />

        {/* Premium Contact Form and Social Connect Link Footer */}
        <Contact />
      </main>
    </div>
  );
}
