"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MapPin } from "lucide-react";
import HiddenLeafSeal from "./motifs/HiddenLeafSeal";
import Reveal from "./ui/Reveal";
import SectionContent, { useSectionPhase } from "./ui/SectionContent";
import SectionHeading from "./ui/SectionHeading";
import { profile } from "@/lib/data/profile";
import { experiences } from "@/lib/data/experience";
import { getSectionEnvironment } from "@/lib/worlds/environments";

const EXP_ENV = getSectionEnvironment("experience");
const EXP_ASSET = EXP_ENV.plate ?? "";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2025-07" → "Jul 2025". Month precision only; no day is ever claimed. */
function formatMonth(value: string) {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/**
 * Experience — the career chronicle.
 *
 * A parchment ledger of three chapters: a sticky archival rail on the left and
 * editorial records on the right. The environment is CSS only (no image
 * decode) and the only runtime work is one IntersectionObserver that marks
 * which chapter the reader is currently inside — no scroll listeners and no
 * per-frame state.
 *
 * The environment is already mounted underneath the Shinobi Chronicle Map
 * reveal, so the sheet dissolves straight into this world instead of into a
 * black screen. Content still gates on `SectionContent`'s reveal phase and the
 * records keep their one-time staggered `Reveal`.
 */
/**
 * Active chapter. `seq` increments only on a genuine chapter change (or the
 * first observation), which is what lets the ember sweep replay when the
 * reader returns to a chapter without replaying while it stays active.
 */
type ActiveChapter = { chapter: number; seq: number; observed: boolean };

/**
 * Company name with the ember sweep overlay.
 *
 * The sweep is a second copy of the text painted with a moving gradient through
 * `background-clip: text`, so the light can only ever appear inside the glyphs.
 * It mounts once per activation (`key`) and never runs while the chapter stays
 * active. It is also gated on the section's reveal phase: when the Shinobi Map
 * reveal is still covering the world, the sweep waits for the content phase
 * instead of firing unseen behind the sheet.
 */
function CompanyName({
  name,
  className,
  active,
  activation,
}: {
  name: string;
  className: string;
  active: boolean;
  activation: number;
}) {
  const phase = useSectionPhase();

  return (
    <h3 className={className}>
      {/* The text sits in an inline-block so the sweep travels through the
          glyph box rather than across the whole column. */}
      <span className="relative inline-block max-w-full">
        {name}
        {active && phase === "content" ? (
          <span key={activation} aria-hidden="true" className="exp-ember">
            {name}
          </span>
        ) : null}
      </span>
    </h3>
  );
}

export default function Experience() {
  const [active, setActive] = useState<ActiveChapter>({
    chapter: 0,
    seq: 0,
    observed: false,
  });
  const recordRefs = useRef<Array<HTMLLIElement | null>>([]);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const elements = recordRefs.current.filter(
      (element): element is HTMLLIElement => element !== null
    );
    if (elements.length === 0) return;

    // Only the chapters crossing the reading band count. The active chapter is
    // the one occupying most of that band, so the highlight changes as a new
    // chapter crosses the reader's eye line rather than when the previous one
    // finally leaves the strip. Intersection callbacks fire on crossings, not
    // per frame.
    const overlap = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const chapter = Number(
            (entry.target as HTMLElement).dataset.chapterIndex
          );
          overlap.set(
            chapter,
            entry.isIntersecting ? entry.intersectionRect.height : 0
          );
        }

        let next = -1;
        let deepest = 0;
        overlap.forEach((height, chapter) => {
          if (height > deepest) {
            deepest = height;
            next = chapter;
          }
        });
        if (next < 0) return;

        // A short settle prevents threshold flicker at a chapter boundary from
        // restarting the sweep. The state only changes when the band is stable.
        if (settleRef.current) clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => {
          setActive((previous) => {
            if (previous.observed && previous.chapter === next) return previous;
            return {
              chapter: next,
              seq: previous.seq + 1,
              observed: true,
            };
          });
        }, 140);
      },
      { rootMargin: "-38% 0px -46% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      if (settleRef.current) clearTimeout(settleRef.current);
    };
  }, []);

  return (
    <section
      id="experience"
      className="relative overflow-clip border-b border-bone/10 bg-void py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        data-experience-world
        data-world-asset={EXP_ASSET}
        style={{ "--exp-plate": `url("${EXP_ASSET}")` } as CSSProperties}
        className="exp-world pointer-events-none absolute inset-0 overflow-clip"
      >
        {/* Static archive chamber. Sticky so the room holds steady behind the
            scrolling ledger; no per-frame work, no canvas. */}
        <div data-experience-archive className="exp-archive">
          <div className="exp-archive-image" />
          <div className="exp-archive-contours" />
        </div>
      </div>

      <SectionContent
        id="experience"
        className="relative mx-auto w-full max-w-[1250px] px-5 sm:px-8 lg:px-12"
      >
        <Reveal>
          <SectionHeading
            index="05"
            label="Experience"
            title="A chronicle of teams, products and responsibilities."
            description="From frontend internships to full-stack product work and client integrations — each chapter added a layer to how I build."
          />
        </Reveal>

        <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* ---------------------------------------------------------------
              Chapter rail — sticky on desktop, released at the section end.
              Decorative: every fact below is repeated in the records, so the
              whole rail is hidden from assistive technology.
          ---------------------------------------------------------------- */}
          <div
            aria-hidden="true"
            data-ledger-rail
            className="hidden lg:col-span-4 lg:block xl:col-span-3"
          >
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div className="exp-folio overflow-hidden border border-gold/15 p-6 xl:p-7">
                  <HiddenLeafSeal
                    strokeWidth={1.5}
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 text-gold/10"
                  />

                  <div className="relative flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-[0.18em] text-gold/80">
                    <span className="whitespace-nowrap">Career ledger</span>
                    <span className="whitespace-nowrap text-ash/80">
                      {String(experiences.length).padStart(2, "0")} records
                    </span>
                  </div>

                  <p className="relative mt-4 font-display text-2xl font-light leading-tight text-bone/90">
                    Three chapters
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-ash/80">
                      {formatMonth(experiences[experiences.length - 1].start)} —{" "}
                      {formatMonth(experiences[0].end)}
                    </span>
                  </p>

                  <div className="mt-8">
                    {experiences.map((experience, index) => {
                      const reached = index <= active.chapter;
                      const isActive = index === active.chapter;
                      return (
                        <Reveal key={experience.id} delay={120 + index * 140}>
                          <div
                            data-active={isActive}
                            className="relative flex gap-4 pb-7 last:pb-0"
                          >
                            <span
                              className="absolute left-[13px] top-7 bottom-0 w-px bg-bone/15"
                              style={{
                                display:
                                  index === experiences.length - 1
                                    ? "none"
                                    : undefined,
                              }}
                            />
                            <span
                              data-reached={index < active.chapter}
                              className="exp-route-segment absolute left-[13px] top-7 bottom-0 w-px bg-gold/50"
                              style={{
                                display:
                                  index === experiences.length - 1
                                    ? "none"
                                    : undefined,
                              }}
                            />

                            <span
                              data-active={isActive}
                              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] transition-[background-color,border-color,color,box-shadow] duration-500 ${
                                isActive
                                  ? "border-gold bg-gold text-[#15130e] shadow-[0_0_0_4px_rgba(201,163,95,0.08),0_0_22px_rgba(201,163,95,0.32)]"
                                  : reached
                                    ? "border-gold/35 bg-gold/[0.08] text-gold/80"
                                    : "border-bone/20 bg-void/60 text-ash/55"
                              }`}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="min-w-0 pt-0.5">
                              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-ash/80">
                                {formatMonth(experience.start)} —{" "}
                                {formatMonth(experience.end)}
                              </span>
                              <span
                                className={`mt-1 block truncate text-sm leading-snug transition-colors duration-500 ${
                                  isActive ? "text-bone" : "text-ash/80"
                                }`}
                              >
                                {experience.shortName}
                              </span>
                            </span>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>

                  <div className="relative mt-7 flex items-center gap-3 border-t border-gold/15 pt-4 font-mono text-[8px] uppercase tracking-[0.24em] text-gold/75">
                    <span
                      aria-hidden="true"
                      className="h-px w-5 bg-gold/40"
                    />
                    Chronicle of record
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ---------------------------------------------------------------
              Records — an ordered chronology. One shared vertical line on
              mobile; editorial dividers rather than identical cards on all
              widths.
          ---------------------------------------------------------------- */}
          <ol
            data-ledger-records
            className="relative mt-10 border-l-2 border-gold/25 pl-7 lg:col-span-8 lg:mt-0 lg:border-l-0 lg:pl-0 xl:col-span-9"
          >
            {experiences.map((experience, index) => {
              const isLatest = index === 0;
              const isActive = index === active.chapter;
              const reached = index <= active.chapter;
              return (
                <li
                  key={experience.id}
                  ref={(element) => {
                    recordRefs.current[index] = element;
                  }}
                  data-chapter-index={index}
                  data-active={isActive}
                  className="relative scroll-mt-28"
                >
                  {/* Mobile chapter node, centred on the 2px chronology line. */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[35px] top-2 h-3 w-3 rounded-full border transition-colors duration-500 lg:hidden ${
                      isActive
                        ? "border-gold bg-gold shadow-[0_0_0_4px_rgba(201,163,95,0.1),0_0_16px_rgba(201,163,95,0.4)]"
                        : reached
                          ? "border-gold/60 bg-gold/40"
                          : "border-gold/30 bg-void"
                    }`}
                  />

                  <Reveal delay={index * 160}>
                    <article
                      className={`exp-record relative ${
                        isLatest
                          ? "pb-12 pt-0 lg:pb-16"
                          : "border-t border-bone/10 py-9 lg:py-10"
                      }`}
                    >
                      {isLatest ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-gold/70 via-gold/30 to-transparent lg:block"
                        />
                      ) : null}

                      <div className={isLatest ? "lg:pl-8" : ""}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em]">
                          <span
                            className={
                              isActive
                                ? "text-gold transition-colors duration-500"
                                : "text-gold/60 transition-colors duration-500"
                            }
                          >
                            Chapter {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="border-l border-gold/25 pl-3 text-ash/85">
                            <time dateTime={experience.start}>
                              {formatMonth(experience.start)}
                            </time>
                            <span aria-hidden="true"> — </span>
                            <time dateTime={experience.end}>
                              {formatMonth(experience.end)}
                            </time>
                          </span>
                          <span className="border-l border-gold/25 pl-3 text-ash/80">
                            {experience.type === "full-time"
                              ? "Full-time"
                              : "Internship"}
                          </span>
                          {isLatest ? (
                            <span className="ml-1 border border-gold/30 bg-gold/[0.07] px-2 py-1 text-[8px] tracking-[0.22em] text-gold-soft">
                              Latest chapter
                            </span>
                          ) : null}
                        </div>

                        <CompanyName
                          name={experience.company}
                          active={isActive}
                          activation={active.seq}
                          className={
                            isLatest
                              ? "mt-5 font-display text-[1.75rem] leading-[1.1] font-light tracking-tight text-bone sm:text-4xl"
                              : `mt-4 font-display text-xl leading-snug font-light tracking-tight transition-colors duration-700 sm:text-2xl ${
                                  isActive ? "text-bone" : "text-bone/85"
                                }`
                          }
                        />

                        <p
                          className={
                            isLatest
                              ? "mt-2 text-sm font-medium tracking-[0.02em] text-gold-soft sm:text-base"
                              : "mt-1.5 text-[13px] text-gold-soft/75"
                          }
                        >
                          {experience.role}
                        </p>

                        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ash/80">
                          {experience.domain}
                        </p>

                        <ul
                          className={
                            isLatest
                              ? "mt-6 space-y-3.5 border-t border-gold/15 pt-6"
                              : "mt-5 space-y-3 border-t border-bone/10 pt-5"
                          }
                        >
                          {experience.points.map((point) => (
                            <li
                              key={point}
                              className={`flex items-start gap-3 ${
                                isLatest
                                  ? "text-[15px] leading-7 text-ash/90"
                                  : "text-sm leading-7 text-ash/85"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[13px] h-px w-3 shrink-0 bg-gold/50"
                              />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="exp-stack mt-5 flex flex-wrap border-t border-bone/10 pt-4 font-mono text-[8px] uppercase tracking-[0.14em] text-ash/75">
                          {experience.stack.map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        <Reveal>
          <div className="mt-14 flex flex-col justify-between gap-4 border-t border-bone/10 pt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-ash/80 sm:flex-row sm:items-center">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold/60" aria-hidden="true" />
              {profile.location}
            </span>
            <span>Available for the next mission</span>
          </div>
        </Reveal>
      </SectionContent>
    </section>
  );
}
