"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Mission } from "@/lib/data/missions";
import { BOLT_SHINOBI } from "@/lib/data/characterArt";
import BoltShinobi from "./BoltShinobi";
import MissionCover from "./MissionCover";
import MissionRecord from "./MissionRecord";
import { useEncounterActive } from "./useEncounterActive";

/**
 * SHINOBI JUTSU THEATRE — LIGHTNING RELEASE (ResQ).
 *
 * Composition identity: a diagonal storm. The shinobi holds the left third in
 * a low forward stance with one palm extended; blue-white chakra gathers at
 * that hand; arcs cross the chamber; the strike fires down the diagonal and
 * wipes the right-aligned title open; the original project artwork floats on a
 * receding perspective plane at lower right.
 *
 * Sequence (one-shot, CSS only, non-blocking):
 *   enter 80ms → hand-seal 420ms → chakra 620ms → arcs 900ms → strike 1120ms →
 *   title 1200ms → artwork plate 1850ms
 * The factual record below is plain markup and readable immediately.
 *
 * The jutsu is an archive motif, never a claimed capability. ResQ stays a
 * hackathon prototype and nothing here suggests it dispatches emergency
 * services — the record carries the project's own note verbatim.
 */

/** Deterministic spark positions — no runtime randomness, no per-frame work. */
const SPARKS = Array.from({ length: 12 }).map((_, index) => ({
  left: 46 + ((index * 17) % 46),
  top: 20 + ((index * 29) % 58),
  delay: 620 + (index % 6) * 90,
  drift: ((index % 4) - 1.5) * 16,
  size: index % 4 === 0 ? 3 : 2,
}));

const TITLE = "RESQ";

export default function LightningScene({
  mission,
  index,
}: {
  mission: Mission;
  index: number;
}) {
  const { ref, active } = useEncounterActive<HTMLElement>();
  const code = String(index + 1).padStart(2, "0");
  const [classification, discipline] = mission.category.split(" · ");
  const art = BOLT_SHINOBI;
  const cover = mission.cover;

  return (
    <article
      ref={ref}
      data-encounter={mission.id}
      data-jutsu="lightning"
      data-active={active ? "true" : "false"}
      data-character={art.base ? "asset" : "stand-in"}
      className="jt jt--lightning relative border-t border-gold/10 py-14 first:border-t-0 first:pt-0 sm:py-20 lg:py-24"
    >
      <div className="jt-scene lt-scene">
        <span className="jt-env lt-env" aria-hidden="true" />
        <span className="lt-horizon" aria-hidden="true" />

        <figure className="jt-figure lt-figure">
          {art.base ? (
            <Image
              src={art.base}
              alt={art.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 40vw"
              className="jt-figure-img object-contain object-bottom"
            />
          ) : (
            <BoltShinobi className="jt-figure-svg" />
          )}
        </figure>

        {/* Arc field: wide glow pass, then the thin drawn bolt on top */}
        <span className="lt-arcs" aria-hidden="true">
          <svg
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            className="h-full w-full"
          >
            <path
              className="lt-arc lt-arc-glow lt-arc-a"
              pathLength={1}
              d="M706 0l-58 108 52 40-118 150 58 34-92 116"
              stroke="rgba(103, 232, 249, 0.3)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="lt-arc lt-arc-glow lt-arc-b"
              pathLength={1}
              d="M1108 46l-92 134 44 22-84 108"
              stroke="rgba(56, 189, 248, 0.24)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="lt-arc lt-arc-glow lt-arc-c"
              pathLength={1}
              d="M386 356l-88-44-42 40-72-30"
              stroke="rgba(125, 211, 252, 0.22)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="lt-arc lt-arc-a"
              pathLength={1}
              d="M706 0l-58 108 52 40-118 150 58 34-92 116"
              stroke="rgba(220, 250, 255, 0.92)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="lt-arc lt-arc-b"
              pathLength={1}
              d="M1108 46l-92 134 44 22-84 108"
              stroke="rgba(125, 211, 252, 0.85)"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="lt-arc lt-arc-c"
              pathLength={1}
              d="M386 356l-88-44-42 40-72-30"
              stroke="rgba(165, 243, 252, 0.8)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="lt-flash" aria-hidden="true" />

        <div className="jt-copy lt-copy">
          <p className="jt-kicker lt-kicker">
            <span aria-hidden="true" className="jt-kicker-line" />
            Record {code} · Lightning Release
          </p>

          <h3 className="jt-title lt-title">
            <span className="jt-title-text lt-title-text" data-text={TITLE}>
              {mission.name}
            </span>
          </h3>

          <p className="jt-role">
            {classification} · {discipline}
          </p>
        </div>

        <figure className="jt-plate lt-plate">
          <div className="jt-plate-screen lt-plate-screen">
            {cover.kind === "screenshot" ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 1023px) 92vw, 38vw"
                className="object-cover object-top"
              />
            ) : (
              <MissionCover variant={cover.variant} alt={cover.alt} />
            )}
          </div>
          <figcaption className="jt-plate-caption">
            Project artwork · original illustration
          </figcaption>
        </figure>

        <span aria-label={`Mission rank ${mission.rank}`} className="jt-rank lt-rank">
          {mission.rank}
        </span>

        <p className="jt-stage lt-stage">
          <span aria-hidden="true" className="jt-dot" />
          Jutsu motif · the strike opens the record
        </p>

        <span className="lt-sparks" aria-hidden="true">
          {SPARKS.map((spark, sparkIndex) => (
            <span
              key={sparkIndex}
              className="lt-spark"
              style={
                {
                  left: `${spark.left}%`,
                  top: `${spark.top}%`,
                  width: `${spark.size}px`,
                  height: `${spark.size}px`,
                  animationDelay: `${spark.delay}ms`,
                  "--lt-spark-drift": `${spark.drift}px`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      </div>

      <MissionRecord mission={mission} index={index} art={art} />
    </article>
  );
}
