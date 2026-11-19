"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, FileText } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import KunaiMark from "./motifs/KunaiMark";
import SealRing from "./motifs/SealRing";
import SectionLink from "./ui/SectionLink";
import HiddenLeafStage from "./worlds/HiddenLeafStage";
import { useReveal } from "@/components/transitions/WorldRevealController";
import { profile } from "@/lib/data/profile";

/** Media queries resolved after mount, so SSR markup stays deterministic. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * PHASE 6.19 — the record no longer waits for the village.
 *
 * On a desktop the copy was gated on the construction script: the loader
 * cleared, the village built, and only after `HERO_TEXT_REVEAL` (~7s of phases)
 * did the first line appear. The visitor watched an establishing shot before
 * learning whose portfolio it was.
 *
 * Both phone and desktop now release the copy as soon as the construction
 * sequence starts (`phase !== "LOADING"`). The village keeps building, lighting
 * and settling behind it. The hierarchy is carried by the staggered delays
 * instead of by waiting: name, role, introduction, calls to action.
 *
 * Reduced motion collapses every delay to zero and the whole record is simply
 * there.
 */
export default function Hero() {
  const { phase } = useReveal();
  const compact = useMediaQuery("(max-width: 1023px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // One owner per property. These elements used to carry BOTH the `.hero-rise`
  // mount animation and an inline phase transition on opacity, and a CSS
  // animation outranks an inline style: by the time the copy was released the
  // rise had already finished, so the record arrived as a single block with no
  // hierarchy. The phase-gated items below keep only the inline transition;
  // the kicker and the footer row, which are not phase-gated, keep `.hero-rise`.
  const started = phase !== "LOADING";
  const contentVisible = started;
  const metadataVisible = started;
  const portraitVisible = started;
  const ctaVisible = started;

  /** Phone delays are tighter than the desktop ones; reduced motion has none. */
  const delay = (desktopMs: number, phoneMs: number) =>
    reducedMotion ? "0ms" : `${compact ? phoneMs : desktopMs}ms`;

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden border-b border-bone/10 pt-32 pb-16 sm:pt-36 lg:min-h-svh lg:pt-40 lg:pb-24"
    >
      {/* Layered atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_72%_30%,#121a26_0%,#0b0e13_42%,#070809_72%)]"
      />

      <HiddenLeafStage />

      {/* Contrast scrims keep the hero copy legible over the village */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,8,9,0.92)_0%,rgba(7,8,9,0.84)_28%,rgba(7,8,9,0.48)_54%,rgba(7,8,9,0.12)_78%,rgba(7,8,9,0.22)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_16%_62%,rgba(7,8,9,0.62),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(7,8,9,0.58)_0%,transparent_30%,transparent_62%,rgba(7,8,9,0.92)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.045] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(237,231,218,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(237,231,218,0.12)_1px,transparent_1px)] bg-[size:12.5%_100%,100%_9rem]" />
      </div>

      <div
        className={`mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 transition-all duration-1000 ease-out ${
          contentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.3em] text-ash/70 sm:text-[10px] transition-all duration-700 ease-out"
              style={{
                opacity: metadataVisible ? 1 : 0,
                transform: metadataVisible ? "translateY(0)" : "translateY(-0.6rem)",
                transitionDelay: delay(100, 60),
              }}
            >
              <span className="inline-flex items-center gap-2 text-gold-soft">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                {profile.availability}
              </span>
              <span aria-hidden="true" className="h-px w-6 bg-bone/20" />
              <span>Portfolio · 2026</span>
            </div>

            <p className="hero-rise hero-rise-1 mt-8 font-mono text-[10px] uppercase tracking-[0.38em] text-ash/60 sm:text-[11px]">
              Hidden Leaf · Developer Record
            </p>

            <h1 className="hero-rise hero-rise-2 mt-5 font-display font-light uppercase leading-[0.8] tracking-[-0.02em] text-bone">
              <span className="block text-[clamp(3.5rem,11vw,8.75rem)]">
                {"Kasthuri".split("").map((ch, i) => (
                  <span
                    key={i}
                    className="inline-block transition-all duration-700 ease-out"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible
                        ? "translateY(0)"
                        : "translateY(1.2rem)",
                      transitionDelay: reducedMotion
                        ? "0ms"
                        : `${i * (compact ? 22 : 35)}ms`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <span className="mt-1 block text-[clamp(3.5rem,11vw,8.75rem)] italic text-gold-soft">
                {"Rangan".split("").map((ch, i) => (
                  <span
                    key={i}
                    className="inline-block transition-all duration-700 ease-out"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible
                        ? "translateY(0)"
                        : "translateY(1.2rem)",
                      transitionDelay: reducedMotion
                        ? "0ms"
                        : `${(i + 8) * (compact ? 22 : 35)}ms`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </h1>

            <div
              className="mt-7 flex items-center gap-4 transition-all duration-700 ease-out"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? "translateY(0)" : "translateY(0.8rem)",
                transitionDelay: delay(700, 420),
              }}
            >
              <span aria-hidden="true" className="h-px w-12 bg-gold/60" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/90 sm:text-xs sm:tracking-[0.26em]">
                {profile.role.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="inline-block mr-2 transition-all duration-500 ease-out"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible
                        ? "translateY(0)"
                        : "translateY(0.6rem)",
                      transitionDelay: reducedMotion
                        ? "0ms"
                        : `${(compact ? 420 : 380) + i * (compact ? 70 : 120)}ms`,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>

            <p
              className="mt-7 max-w-xl text-base leading-8 text-ash sm:text-lg transition-all duration-700 ease-out"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? "translateY(0)" : "translateY(0.8rem)",
                transitionDelay: delay(520, 560),
              }}
            >
              {profile.intro}
            </p>

            <div
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center transition-all duration-700 ease-out"
              style={{
                opacity: ctaVisible ? 1 : 0,
                transform: ctaVisible ? "translateY(0)" : "translateY(0.8rem)",
                transitionDelay: delay(680, 840),
                pointerEvents: ctaVisible ? "auto" : "none",
              }}
            >
              <SectionLink
                sectionId="missions"
                className="group inline-flex items-center justify-center gap-3 bg-gold px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-void transition-colors duration-300 hover:bg-gold-soft"
              >
                View My Missions
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </SectionLink>
              <SectionLink
                sectionId="contact"
                className="group inline-flex items-center justify-center gap-3 border border-bone/20 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-gold/70 hover:text-gold-soft"
              >
                Contact Me
                <ArrowDownRight
                  className="h-4 w-4 text-ash transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </SectionLink>
            </div>

            <div className="hero-rise hero-rise-6 mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-bone/10 pt-6">
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-bone"
              >
                <FaGithub className="h-4 w-4 text-ash/70 transition-colors group-hover:text-gold" />
                GitHub
              </a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-bone"
              >
                <FaLinkedinIn className="h-4 w-4 text-ash/70 transition-colors group-hover:text-gold" />
                LinkedIn
              </a>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-bone"
              >
                <FileText className="h-4 w-4 text-ash/70 transition-colors group-hover:text-gold" />
                Résumé
              </a>
            </div>
          </div>

          {/* Editorial portrait composition */}
          <div
            className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:col-span-5 lg:max-w-none transition-all duration-1000 ease-out"
            style={{
              opacity: portraitVisible ? 1 : 0,
              transform: portraitVisible ? "translateY(0)" : "translateY(1.5rem)",
              clipPath: portraitVisible
                ? "inset(0 0 0% 0)"
                : "inset(0 0 100% 0)",
              transitionDelay: delay(0, 640),
            }}
          >
            <div className="relative mx-auto aspect-[3/4] w-[82%] sm:w-[76%] lg:w-[84%]">
              {/* PHASE 6.16 — a 64px-blur glow behind the portrait is a large
                  composited surface for a decoration; phones drop it and keep
                  the seal ring, which carries the same warm halo. */}
              <div
                aria-hidden="true"
                className="absolute -inset-8 -z-10 hidden rounded-full bg-gold/[0.06] blur-3xl sm:block"
              />
              <SealRing
                className="animate-seal absolute left-1/2 top-1/2 -z-10 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 text-gold/25"
                strokeWidth={0.8}
              />

              <div className="absolute -left-4 top-10 hidden h-[62%] w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent sm:block" />
              <div className="absolute -right-4 bottom-10 hidden h-[42%] w-px bg-gradient-to-b from-transparent via-bone/25 to-transparent sm:block" />

              <div className="group absolute inset-0 overflow-hidden border border-bone/15 bg-graphite">
                <Image
                  src="/assets/Profile.png"
                  alt="Portrait of Kasthuri Rangan"
                  fill
                  loading="eager"
                  sizes="440px"
                  className="object-cover object-[center_22%] grayscale-[30%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gold/[0.07] mix-blend-overlay"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-gold">
                      Record no. 04
                    </p>
                    <p className="mt-1 font-display text-xl font-light italic text-bone">
                      The will of fire
                    </p>
                  </div>
                  <KunaiMark className="h-7 w-7 -rotate-12 text-gold/80" />
                </div>
              </div>

              <span
                aria-hidden="true"
                className="absolute -left-2 -top-2 h-8 w-8 border-l border-t border-gold/60"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-2 -right-2 h-8 w-8 border-b border-r border-gold/60"
              />

              <div
                aria-hidden="true"
                className="absolute -right-7 top-1/2 hidden -translate-y-1/2 [writing-mode:vertical-rl] lg:block"
              >
                <span className="font-jp text-[11px] tracking-[0.5em] text-ash/50">
                  飛雷神
                </span>
                <span className="mt-3 font-jp text-[9px] tracking-[0.4em] text-gold/60">
                  四代目
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 font-mono text-[8px] uppercase tracking-[0.28em] text-ash/50 sm:text-[9px]">
              <span aria-hidden="true" className="h-px w-5 bg-bone/20" />
              Full Stack · AI · Integrations
              <span aria-hidden="true" className="h-px w-5 bg-bone/20" />
            </div>
          </div>
        </div>

        <div className="mt-16 hidden items-center justify-between border-t border-bone/10 pt-5 font-mono text-[9px] uppercase tracking-[0.28em] text-ash/45 lg:flex">
          <span>Scroll to explore</span>
          <span className="flex items-center gap-2">
            <KunaiMark className="h-3.5 w-3.5 rotate-180 text-gold/60" />
            Flying Raijin
          </span>
          <span>{profile.location}</span>
        </div>
      </div>
    </section>
  );
}
