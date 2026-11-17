import Image from "next/image";
import { Fragment } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import KunaiMark from "./motifs/KunaiMark";
import ElementalSeam from "./transitions/ElementalSeam";
import Reveal from "./ui/Reveal";
import SectionContent from "./ui/SectionContent";
import SectionHeading from "./ui/SectionHeading";
import MissionsWorld from "./worlds/MissionsWorld";
import SandDominionScene from "./missions/SandDominionScene";
import WindReleaseScene from "./missions/WindReleaseScene";
import WaterReleaseScene from "./missions/WaterReleaseScene";
import FireReleaseScene from "./missions/FireReleaseScene";
import { archiveProjects, missions } from "@/lib/data/missions";

/**
 * Shinobi Mission Showcase — the Jutsu Encounter Archive.
 *
 * Each project is a full-width cinematic encounter rather than a card, with
 * its own technique beat and the record itself underneath (description, stack,
 * links). BugWiser opens with a full-viewport sand chamber, a floating deck of
 * real application screens and an editorial record; ResQ holds the diagonal
 * storm; ENN the axial seal; Saravaraj the radial relay. The encounter / record
 * / archive order is stable across all four.
 *
 * All project content comes straight from `lib/data/missions.ts` — the visual
 * storytelling never adds capabilities, metrics or links.
 */

export default function Missions() {
  return (
    <section
      id="missions"
      className="relative overflow-clip border-b border-bone/10 bg-[#070806]"
    >
      <MissionsWorld />

      <SectionContent
        id="missions"
        className="relative z-10 mx-auto w-full max-w-[1250px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
      >
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <Reveal>
              <SectionHeading
                index="04"
                label="Missions"
                title="Shinobi Mission Showcase"
              />
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-ash sm:text-base">
                Four projects, each revealed as its own encounter in the Hidden
                Leaf mission archive — open-source tooling, an emergency
                prototype and two client platforms, followed by the earlier
                builds still running in the wild.
              </p>
            </Reveal>
          </div>

          <Reveal delay={280} className="shrink-0">
            <div className="border border-gold/20 bg-[#070806]/55 px-4 py-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-gold-soft/85">
                <ShieldCheck className="h-4 w-4 text-gold/80" aria-hidden="true" />
                {String(missions.length).padStart(2, "0")} mission records
              </div>
              <p className="mt-1.5 pl-7 font-mono text-[8px] uppercase tracking-[0.18em] text-ash/45">
                02 client · 02 personal
              </p>
            </div>
          </Reveal>
        </div>

        {/* Sequence opener: the archive announces itself before the encounters. */}
        <Reveal delay={120}>
          <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-gold/15 py-3.5 sm:mt-16">
            <span className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-gold/80">
              <KunaiMark className="h-3.5 w-3.5" />
              Jutsu encounter archive
            </span>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent sm:block"
            />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/45">
              Each record opens through its own technique
            </span>
          </div>
        </Reveal>

        <div className="mt-4 sm:mt-8">
          {missions.map((mission, index) => {
            const previous = missions[index - 1];

            const scene =
              mission.id === "bugwiser" ? (
                <SandDominionScene mission={mission} index={index} />
              ) : mission.id === "resq" ? (
                <WindReleaseScene mission={mission} index={index} />
              ) : mission.id === "enn-consultancy" ? (
                <WaterReleaseScene mission={mission} index={index} />
              ) : (
                <FireReleaseScene mission={mission} index={index} />
              );

            return (
              <Fragment key={mission.id}>
                {/* PHASE 6.11 — the outgoing element carries into the next
                    project instead of a generic section transition. */}
                {previous ? (
                  <ElementalSeam from={previous.id} to={mission.id} />
                ) : null}
                {scene}
              </Fragment>
            );
          })}
        </div>

        <div className="mt-20 sm:mt-24">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 border-b border-gold/15 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-gold/70">
                  <KunaiMark className="h-3.5 w-3.5" />
                  Field archive ·{" "}
                  {String(archiveProjects.length).padStart(2, "0")} records
                </p>
                <h3 className="mt-3 font-display text-3xl font-light text-bone sm:text-4xl">
                  Earlier work, still in the wild.
                </h3>
              </div>
              <p className="max-w-xs text-xs leading-6 text-ash/55">
                A selection of earlier builds with verified live deployments.
                Each record opens the production application.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
            {archiveProjects.map((project, index) => (
              <Reveal key={project.id} delay={index * 80}>
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.name} live build`}
                  className="group flex h-full flex-col overflow-hidden border border-gold/15 bg-[#0b0f0b]/80 transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_60px_-32px_rgba(201,163,95,0.32)] focus-visible:border-gold/50"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-gold/10 bg-graphite">
                    <Image
                      src={project.image}
                      alt={`${project.name} interface preview`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                      className="object-cover object-top brightness-[0.78] grayscale-[20%] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-95 group-hover:grayscale-0"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#070806]/75 via-transparent to-transparent opacity-85"
                    />
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-bone/15 bg-[#070806]/75 text-bone backdrop-blur-sm transition-colors group-hover:border-gold/50 group-hover:text-gold-soft">
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-display text-2xl font-light text-bone transition-colors group-hover:text-gold-soft">
                        {project.name}
                      </h4>
                      <span className="font-mono text-[8px] tracking-[0.2em] text-ash/35">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-ash/65">
                      {project.description}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1.5 pt-4 font-mono text-[8px] uppercase tracking-[0.14em] text-ash/45">
                      {project.stack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-gold/10 pt-3 font-mono text-[8px] uppercase tracking-[0.18em] text-gold/65 transition-colors group-hover:text-gold-soft">
                      Visit live build
                      <ArrowUpRight
                        className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionContent>
    </section>
  );
}
