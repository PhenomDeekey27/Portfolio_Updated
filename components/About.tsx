"use client";

import { Layers3, Server, Sparkles } from "lucide-react";
import { profile } from "@/lib/data/profile";
import AboutWorld from "./worlds/AboutWorld";
import { useSectionRevealPhase } from "./transitions/TeleportationController";
import Reveal from "./ui/Reveal";
import SectionContent from "./ui/SectionContent";

const disciplines = [
  { icon: Layers3, title: "Full-stack delivery", copy: "Complete applications from the data model up: React and Next.js interfaces, FastAPI and Node services, typed component systems and the release work in between." },
  { icon: Server, title: "Backend and data systems", copy: "REST APIs and data models built with FastAPI, Node.js, Express, PostgreSQL, Supabase and MongoDB, including authentication and third-party API contracts." },
  { icon: Sparkles, title: "AI and integrations", copy: "LLM pipelines, retrieval, MCP tools, CRM syncs, messaging workflows and voice agents connected into products people actually use." },
];

const VALLEY_GOLD = "border-gold/20 bg-[#07111F]/35 text-gold-soft";

const STAGGER = { indicator: 0, heading: 160, intro: 340, journey: 560, fullstack: 780, backend: 960, ai: 1140, principle: 1320 };

export default function About() {
  const phase = useSectionRevealPhase("about");
  const worldVisible = phase !== "pending";
  const textVisible = phase === "content";

  // PHASE 6.18 — the section's top padding is CSS (`#about` in globals.css) so
  // it can be derived from the phone environment band's own height instead of a
  // viewport share that never matched it.
  return (
    <section id="about" data-about-section className="relative overflow-clip border-b border-bone/10 bg-[#070809] pb-24 sm:pb-32">
      <AboutWorld revealed={worldVisible} />

      <SectionContent
        id="about"
        className="relative z-10 mx-auto w-full max-w-[1250px] px-5 sm:px-8 lg:px-12"
      >
        <div
          aria-hidden="true"
          data-about-scrim
          className="pointer-events-none absolute left-1/2 -top-[18svh] -bottom-24 -z-10 w-screen -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(5,6,8,0)_0%,rgba(5,6,8,0.3)_9%,rgba(5,6,8,0.55)_24%,rgba(5,6,8,0.7)_52%,rgba(5,6,8,0.78)_100%)]"
          style={{ opacity: textVisible ? 1 : 0, transition: "opacity 700ms ease" }}
        />

        <Reveal delay={STAGGER.indicator}>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.32em] text-gold-soft sm:text-[11px]">
            <span>02</span>
            <span aria-hidden="true" className="h-px w-10 bg-gold-soft/40" />
            <span>About</span>
          </div>
        </Reveal>
        <Reveal delay={STAGGER.heading}>
          <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] font-light tracking-tight text-[#f5efe2] sm:text-5xl lg:text-6xl [text-shadow:0_2px_28px_rgba(0,0,0,0.9)]">
            An AI-focused full-stack software developer shaped by shipped work, client systems and the space where applications meet AI.
          </h2>
        </Reveal>
        <Reveal delay={STAGGER.intro}>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#ddd4c1] sm:text-base [text-shadow:0_1px_18px_rgba(0,0,0,0.85)]">
            I care about the whole path from an idea to a system in production: the interface someone uses, the service behind it, the data it trusts, and the AI that makes it more useful.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7" delay={STAGGER.journey}>
            <div className="border-l-2 border-gold/35 pl-6 sm:pl-7">
              <div className="space-y-6 text-[15px] leading-8 text-[#d6cfbe] [text-shadow:0_1px_14px_rgba(0,0,0,0.75)] sm:text-base">
                <p>I&apos;m an AI-focused full-stack software developer with over two years of experience building applications across product teams and client platforms. I work end to end: the interface someone uses, the API behind it, the data it depends on, and the model or workflow that makes it smarter.</p>
                <p>That path has run from MERN product features to enterprise no-code tooling, FastAPI services, CRM integrations and AI-powered automation. I enjoy the connective tissue of a product: the API contract, the edge case, the workflow that quietly saves someone an hour.</p>
                <p>More recently I&apos;ve been building with LLMs, retrieval and MCP tools, and wiring email, WhatsApp, Telegram and voice-agent channels into real business workflows. I care about honest systems, clear interfaces and code that is easier to change than it was to write.</p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gold/15 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#b8b1a1]">
                <span className="text-gold-soft">Based in</span><span>{profile.location}</span>
                <span aria-hidden="true" className="h-3 w-px bg-gold-soft/20" />
                <span className="text-gold-soft">Experience</span><span>2+ years</span>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-5">
            <div className="space-y-4">
              {disciplines.map((d, idx) => {
                const Icon = d.icon;
                const delay = idx === 0 ? STAGGER.fullstack : idx === 1 ? STAGGER.backend : STAGGER.ai;
                return (
                  <Reveal key={d.title} delay={delay}>
                    <div className="group flex gap-4 border-b border-gold/15 py-4 transition-colors duration-300 hover:border-gold-soft/40">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${VALLEY_GOLD} backdrop-blur-sm transition-colors duration-300 group-hover:bg-gold-soft/10`}><Icon className="h-4 w-4" aria-hidden="true" /></div>
                      <div>
                        <h3 className="text-sm font-semibold tracking-wide text-[#f5efe2] [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">{d.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[#c9c2b1] [text-shadow:0_1px_12px_rgba(0,0,0,0.75)]">{d.copy}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <Reveal className="mt-8" delay={STAGGER.principle}>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold-soft/80">Working principle · 04</p>
              <p className="mt-3 max-w-md font-display text-2xl font-light italic leading-snug text-[#f5efe2] [text-shadow:0_1px_18px_rgba(0,0,0,0.85)] sm:text-3xl">&ldquo;Design with intent. Build for scale. Leave the code clearer than you found it.&rdquo;</p>
            </Reveal>
          </div>
        </div>
      </SectionContent>
    </section>
  );
}
