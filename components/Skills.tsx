"use client";

import {
  Code2,
  Database,
  LayoutTemplate,
  Server,
  Sparkles,
  Wrench,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";
import SkillsWorld from "./worlds/SkillsWorld";
import SectionContent from "./ui/SectionContent";
import { useSectionRevealPhase } from "./transitions/TeleportationController";
import { skillCategories } from "@/lib/data/skills";
import type { SkillCategory } from "@/lib/data/skills";

const categoryIcons: Record<SkillCategory["icon"], LucideIcon> = {
  code: Code2,
  layout: LayoutTemplate,
  server: Server,
  database: Database,
  sparkles: Sparkles,
  wrench: Wrench,
};

const motifs: Record<string, string> = {
  ninjutsu: "Ninjutsu",
  taijutsu: "Taijutsu",
  "chakra-control": "Chakra Control",
  "genjutsu-research": "Genjutsu Research",
};

export default function Skills() {
  const phase = useSectionRevealPhase("skills");

  return (
    <section
      id="skills"
      className="relative overflow-clip border-b border-bone/10 bg-[#0a120d] py-24 sm:py-32"
    >
      <SkillsWorld revealed={phase !== "pending"} />

      <SectionContent
        id="skills"
        className="relative z-10 mx-auto w-full max-w-[1250px] px-5 sm:px-8 lg:px-12"
      >
        <div className="relative max-w-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -inset-y-4 bg-[radial-gradient(ellipse_at_20%_40%,rgba(10,18,13,0.72)_0%,rgba(10,18,13,0.45)_55%,transparent_85%)]"
          />
          <Reveal>
            <SectionHeading
              index="03"
              label="Skills"
              title="Shinobi Skill Records"
              description="Four chapters of the toolkit behind the work — application engineering, backend and data systems, cloud integrations and AI workflows."
            />
          </Reveal>
        </div>

        {/* Scroll archive: asymmetric staggered records */}
        <div className="relative mt-20 space-y-12">
          {skillCategories.map((category, index) => {
            const Icon = categoryIcons[category.icon];
            const alignRight = index % 2 === 1;
            return (
              <Reveal key={category.id} delay={index * 140}>
                <article
                  className={`group relative max-w-3xl ${
                    alignRight ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {/* scroll surface */}
                  <div className="relative overflow-hidden border border-gold/25 bg-[#0d1a12]/78 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
                    {/* parchment edge lines */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
                    />

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/35 bg-gold/8 text-gold">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold/75">
                          {motifs[category.id]}
                        </p>
                        <h3 className="mt-1 font-display text-2xl font-light text-[#f5efe2] sm:text-3xl">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#c9c2b1]">
                          {category.subtitle}
                        </p>
                      </div>
                      <span className="ml-auto font-mono text-[9px] tracking-[0.24em] text-gold/45">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-gold/25" />
                      <Target className="h-3.5 w-3.5 text-gold/55" aria-hidden="true" />
                      <span className="h-px flex-1 bg-gold/25" />
                    </div>

                    <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      {category.skills.map((skill) => (
                        <li
                          key={skill}
                          className="flex items-center gap-2 text-sm leading-6 text-[#e8e1d2]"
                        >
                          <span
                            aria-hidden="true"
                            className="h-1 w-1 shrink-0 rotate-45 bg-gold/70"
                          />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </SectionContent>
    </section>
  );
}
