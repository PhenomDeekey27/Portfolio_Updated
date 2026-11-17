"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { CSSProperties } from "react";
import { SAND_GAARA } from "@/lib/data/characterArt";
import type { Mission } from "@/lib/data/missions";
import BugWiserCarousel from "./BugWiserCarousel";
import BugWiserRecord from "./BugWiserRecord";
import { useEncounterActive } from "./useEncounterActive";

/**
 * PHASE 6.8 — SAND DOMINION: a directional sand technique, not a texture
 * curtain.
 *
 * The chamber opens on an empty, dust-lit stage. A sand source builds at the
 * lower left (the reserved character origin), spiral ribbons travel from it
 * toward the centre, and two rolling sheets rise to meet and close the
 * viewport. The sheets part vertically, the title unmasks through the gap, and
 * the grains disperse without disturbing the settled composition.
 *
 * The approved character plate plugs into `figure.bw-figure`; until it exists
 * the origin is represented by the sand aura and rings only. No generic ninja
 * stand-in is rendered.
 *
 * All motion is one-shot CSS driven by `data-active`. Base styles describe the
 * settled composition, so reduced motion and observer failure still show a
 * complete, readable scene. No canvas, no rAF loop, no per-frame state.
 */

type Mote = {
  left: number;
  top: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  rotate: number;
  opacity: number;
  delay: number;
  duration: number;
};

/** Fine grains pulled from the sand source toward the forming wave. */
const STREAM_MOTES: Mote[] = Array.from({ length: 18 }).map((_, index) => ({
  left: 13 + ((index * 17) % 12),
  top: 54 + ((index * 23) % 26),
  width: index % 5 === 0 ? 4 : 1 + (index % 3),
  height: 8 + (index % 5) * 4,
  dx: 24 + (index % 7) * 4,
  dy: -24 - (index % 6) * 5,
  rotate: 14 + ((index * 23) % 64),
  opacity: 0.32 + (index % 4) * 0.14,
  delay: 260 + (index % 8) * 110,
  duration: 1100 + (index % 5) * 170,
}));

/** Larger flakes thrown outward as the wave parts. */
const BURST_MOTES: Mote[] = Array.from({ length: 16 }).map((_, index) => {
  const side = index % 2 === 0 ? -1 : 1;
  return {
    left: 34 + ((index * 13) % 32),
    top: 28 + ((index * 31) % 46),
    width: index % 4 === 0 ? 5 : 2 + (index % 3),
    height: 10 + (index % 6) * 5,
    dx: side * (22 + (index % 6) * 6),
    dy: -18 + (index % 7) * 8,
    rotate: (index * 41) % 180,
    opacity: 0.3 + (index % 5) * 0.12,
    delay: 2320 + (index % 8) * 60,
    duration: 820 + (index % 4) * 150,
  };
});

function MoteField({ motes, className }: { motes: Mote[]; className: string }) {
  return (
    <span className={className}>
      {motes.map((mote, index) => (
        <span
          key={index}
          className="bw-mote"
          style={
            {
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: `${mote.width}px`,
              height: `${mote.height}px`,
              animationDelay: `${mote.delay}ms`,
              animationDuration: `${mote.duration}ms`,
              "--bw-mote-x": `${mote.dx}vw`,
              "--bw-mote-y": `${mote.dy}vh`,
              "--bw-mote-rot": `${mote.rotate}deg`,
              "--bw-mote-o": mote.opacity,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

export default function SandDominionScene({
  mission,
  index,
}: {
  mission: Mission;
  index: number;
}) {
  const { ref, active } = useEncounterActive<HTMLElement>(0.06);
  const code = String(index + 1).padStart(2, "0");
  const [classification, discipline] = mission.category.split(" · ");
  const art = SAND_GAARA;

  return (
    <article
      ref={ref}
      data-encounter={mission.id}
      data-jutsu="sand"
      data-active={active ? "true" : "false"}
      data-character={art.base ? "asset" : "awaiting-art"}
      className="bw relative border-t border-gold/10 first:border-t-0"
    >
      {/* ---------------- SCENE A — full-screen sand ---------------- */}
      <section className="bw-stage" aria-labelledby="bw-title">
        <span className="bw-env" aria-hidden="true" />
        <span className="bw-vignette" aria-hidden="true" />

        <div className="bw-sand" aria-hidden="true">
          <span className="bw-haze" />
          <span className="bw-aura" />
          <span className="bw-origin-ring bw-origin-ring-a" />
          <span className="bw-origin-ring bw-origin-ring-b" />

          {/* Braided ribbons leave the source, arc over the centre and part. */}
          <svg
            className="bw-wave"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="bw-band-warm" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#6b5128" stopOpacity="0" />
                <stop offset="0.2" stopColor="#9c7a41" stopOpacity="0.65" />
                <stop offset="0.52" stopColor="#d8b477" stopOpacity="0.78" />
                <stop offset="0.82" stopColor="#a57f41" stopOpacity="0.5" />
                <stop offset="1" stopColor="#6b5128" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="bw-band-pale" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#a57f41" stopOpacity="0" />
                <stop offset="0.42" stopColor="#f0d8a0" stopOpacity="0.6" />
                <stop offset="1" stopColor="#a57f41" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="bw-band-shadow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#2a2112" stopOpacity="0" />
                <stop offset="0.4" stopColor="#4a3a1d" stopOpacity="0.55" />
                <stop offset="1" stopColor="#2a2112" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="bw-wave-core-fill">
                <stop offset="0" stopColor="#e4c88f" stopOpacity="0.34" />
                <stop offset="0.5" stopColor="#a57f41" stopOpacity="0.2" />
                <stop offset="1" stopColor="#6b5128" stopOpacity="0" />
              </radialGradient>
              <pattern
                id="bw-sand-speckle"
                width="84"
                height="84"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href="/assets/missions/bugwiser/sand-grain.png"
                  width="84"
                  height="84"
                  opacity="1"
                />
              </pattern>
              <filter
                id="bw-sand-rough"
                x="-8%"
                y="-8%"
                width="116%"
                height="116%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.012 0.026"
                  numOctaves="2"
                  seed="11"
                  result="bw-noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="bw-noise"
                  scale="16"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>

            <ellipse
              className="bw-wave-core"
              cx="660"
              cy="452"
              rx="360"
              ry="210"
              fill="url(#bw-wave-core-fill)"
            />

            <g className="bw-wave-upper" filter="url(#bw-sand-rough)">
              <path
                className="bw-ribbon"
                d="M-90 782 C 160 708 286 552 470 462 C 654 372 862 344 1120 374 C 1290 394 1420 432 1530 470"
                stroke="url(#bw-band-shadow)"
                strokeWidth="104"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-80 812 C 172 730 300 572 486 480 C 672 388 884 362 1140 394 C 1306 414 1432 452 1540 490"
                stroke="url(#bw-band-warm)"
                strokeWidth="82"
                pathLength={1}
              />
              <path
                className="bw-ribbon bw-ribbon-speckle"
                d="M-80 812 C 172 730 300 572 486 480 C 672 388 884 362 1140 394 C 1306 414 1432 452 1540 490"
                stroke="url(#bw-sand-speckle)"
                strokeWidth="82"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-60 754 C 186 676 320 526 512 442 C 702 358 904 330 1152 360 C 1320 380 1444 418 1552 454"
                stroke="url(#bw-band-warm)"
                strokeWidth="38"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-40 846 C 208 760 336 602 524 508 C 708 416 918 392 1170 426 C 1334 448 1452 486 1558 522"
                stroke="url(#bw-band-pale)"
                strokeWidth="14"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-20 728 C 216 654 356 510 548 430 C 736 352 936 328 1184 354"
                stroke="url(#bw-band-pale)"
                strokeWidth="7"
                pathLength={1}
              />
            </g>

            <g className="bw-wave-lower" filter="url(#bw-sand-rough)">
              <path
                className="bw-ribbon"
                d="M-90 916 C 150 858 296 746 486 674 C 678 602 888 596 1136 658 C 1300 700 1428 768 1540 842"
                stroke="url(#bw-band-shadow)"
                strokeWidth="96"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-70 950 C 176 886 322 774 514 702 C 706 630 912 626 1156 688 C 1318 730 1440 798 1548 872"
                stroke="url(#bw-band-warm)"
                strokeWidth="72"
                pathLength={1}
              />
              <path
                className="bw-ribbon bw-ribbon-speckle"
                d="M-70 950 C 176 886 322 774 514 702 C 706 630 912 626 1156 688 C 1318 730 1440 798 1548 872"
                stroke="url(#bw-sand-speckle)"
                strokeWidth="72"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-40 866 C 194 808 344 700 534 634 C 724 568 928 566 1168 624"
                stroke="url(#bw-band-pale)"
                strokeWidth="16"
                pathLength={1}
              />
              <path
                className="bw-ribbon"
                d="M-20 806 C 214 756 370 656 560 596 C 748 536 948 540 1184 590"
                stroke="url(#bw-band-pale)"
                strokeWidth="6"
                pathLength={1}
              />
            </g>
          </svg>

          <span className="bw-swirl" />
          <span className="bw-dune" />
          <span className="bw-grain" />

          <MoteField motes={STREAM_MOTES} className="bw-motes bw-motes-stream" />
          <MoteField motes={BURST_MOTES} className="bw-motes bw-motes-burst" />
        </div>

        <span className="bw-scrim" aria-hidden="true" />

        {art.base ? (
          <figure className="bw-figure">
            <Image
              src={art.base}
              alt={art.alt}
              fill
              sizes="(max-width: 1023px) 54vw, 32vw"
              className="bw-figure-img object-contain object-bottom"
            />
          </figure>
        ) : null}

        <div className="bw-stage-copy">
          <p className="bw-kicker">
            <span aria-hidden="true" className="bw-kicker-line" />
            Record {code} · Sand Dominion
          </p>

          <h3 id="bw-title" className="bw-title">
            <span className="bw-title-text">{mission.name}</span>
          </h3>

          <p className="bw-role">
            {classification} · {discipline}
          </p>

          <p className="bw-intro">
            An AI debugging assistant for GitHub issues. BugWiser connects a
            repository, traces the code behind a reported bug, and returns an
            evidence-backed root cause with a suggested patch.
          </p>

          <dl className="bw-stage-notes">
            <div>
              <dt>The problem</dt>
              <dd>
                An issue report rarely points at the code responsible, so the
                investigation starts from the repository instead of a guess.
              </dd>
            </div>
            <div>
              <dt>Who it helps</dt>
              <dd>
                Developers investigating a reported issue, engineers reading an
                unfamiliar codebase, and teams reviewing a root cause before a
                fix.
              </dd>
            </div>
          </dl>
        </div>

        <span aria-label={`Mission rank ${mission.rank}`} className="bw-rank">
          {mission.rank}
        </span>

        <p className="bw-stage-caption">
          <span aria-hidden="true" className="bw-stage-dot" />
          Jutsu motif · sand gathers · the record opens
        </p>

        <a className="bw-cue" href="#bw-gallery">
          <span>Explore the build</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>

      {/* ---------------- SCENE B — floating application deck ---------------- */}
      <section className="bw-gallery" id="bw-gallery" aria-labelledby="bw-gallery-title">
        <div className="bw-gallery-inner">
          <div className="bw-gallery-head">
            <div>
              <p className="bw-kicker bw-kicker-gold">
                <span aria-hidden="true" className="bw-kicker-line" />
                Mission intelligence · live application
              </p>
              <h4 id="bw-gallery-title" className="bw-gallery-title">
                Inside the build.
              </h4>
            </div>
            <p className="bw-gallery-note">
              Three screens captured from the deployed BugWiser build. The deck
              advances every two seconds — hover, focus or touch to hold it, or
              use the controls.
            </p>
          </div>

          <div className="bw-gallery-float">
            <BugWiserCarousel />
          </div>
        </div>
      </section>

      {/* ---------------- SCENE C — editorial record ---------------- */}
      <BugWiserRecord mission={mission} index={index} />
    </article>
  );
}
