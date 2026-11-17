"use client";

import Image from "next/image";
import type { Mission } from "@/lib/data/missions";
import { SEAL_SHINOBI } from "@/lib/data/characterArt";
import MissionCover from "./MissionCover";
import MissionRecord from "./MissionRecord";
import SealShinobi from "./SealShinobi";
import { useEncounterActive } from "./useEncounterActive";

/**
 * SHINOBI JUTSU THEATRE — SEALING TECHNIQUE (ENN Consultancy).
 *
 * Composition identity: an axial shrine wall. Unlike the diagonal storm and
 * the desert chamber, this encounter is centred and ceremonial: a hanging
 * scroll forms at the middle of the chamber, a huge seal ring is inscribed
 * behind the title, and gold sealing lines draw across the full width from the
 * centre outward. The shinobi stands at the right in a two-handed seal; the
 * original project artwork floats as a parchment plane at lower left.
 *
 * Sequence: scroll 120ms → hands 320ms → seal ring 520ms → sealing lines 640ms
 * → title 1280ms → parchment plate 1900ms.
 *
 * ENN is a client-owned engagement: no live/repository link is invented and the
 * record keeps the client note verbatim.
 */

const TITLE = "ENN CONSULTANCY";

export default function SealingScene({
  mission,
  index,
}: {
  mission: Mission;
  index: number;
}) {
  const { ref, active } = useEncounterActive<HTMLElement>();
  const code = String(index + 1).padStart(2, "0");
  const [classification, discipline] = mission.category.split(" · ");
  const art = SEAL_SHINOBI;
  const cover = mission.cover;

  return (
    <article
      ref={ref}
      data-encounter={mission.id}
      data-jutsu="scroll"
      data-active={active ? "true" : "false"}
      data-character={art.base ? "asset" : "stand-in"}
      className="jt jt--scroll relative border-t border-gold/10 py-14 first:border-t-0 first:pt-0 sm:py-20 lg:py-24"
    >
      <div className="jt-scene sl-scene">
        <span className="jt-env sl-env" aria-hidden="true" />

        {/* Hanging scroll the seal is stamped onto */}
        <span className="sl-scroll" aria-hidden="true">
          <span className="sl-scroll-rod sl-scroll-rod-top" />
          <span className="sl-scroll-rod sl-scroll-rod-bottom" />
          <span className="sl-scroll-grain" />
        </span>

        {/* Inscribed seal ring behind the title */}
        <span className="sl-seal" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" className="h-full w-full">
            <circle
              className="sl-seal-ring"
              pathLength={1}
              cx="200"
              cy="200"
              r="188"
              stroke="rgba(228, 200, 143, 0.5)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
            <circle
              className="sl-seal-ring sl-seal-ring-2"
              pathLength={1}
              cx="200"
              cy="200"
              r="150"
              stroke="rgba(201, 163, 95, 0.42)"
              strokeWidth="1"
            />
            <path
              className="sl-seal-ring sl-seal-ring-3"
              pathLength={1}
              d="M200 42v58M200 300v58M42 200h58M300 200h58M88 88l40 40M272 272l40 40M312 88l-40 40M128 272l-40 40"
              stroke="rgba(228, 200, 143, 0.4)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <path
              className="sl-seal-glyph"
              pathLength={1}
              d="M136 136h128M136 168h128M136 200h84M136 232h128M136 264h84"
              stroke="rgba(228, 200, 143, 0.34)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <figure className="jt-figure sl-figure">
          {art.base ? (
            <Image
              src={art.base}
              alt={art.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 32vw"
              className="jt-figure-img object-contain object-bottom"
            />
          ) : (
            <SealShinobi className="jt-figure-svg" />
          )}
        </figure>

        {/* Gold sealing lines drawn across the chamber */}
        <span className="sl-lines" aria-hidden="true">
          <svg
            viewBox="0 0 1200 700"
            preserveAspectRatio="none"
            fill="none"
            className="h-full w-full"
          >
            <path
              className="sl-line sl-line-top"
              pathLength={1}
              d="M0 196h520M680 196h520"
              stroke="rgba(228, 200, 143, 0.62)"
              strokeWidth="1.2"
            />
            <path
              className="sl-line sl-line-bottom"
              pathLength={1}
              d="M0 556h470M730 556h470"
              stroke="rgba(201, 163, 95, 0.5)"
              strokeWidth="1.1"
            />
            <path
              className="sl-line sl-line-bracket-l"
              pathLength={1}
              d="M52 156v404M52 196h96M52 556h96"
              stroke="rgba(201, 163, 95, 0.3)"
              strokeWidth="1"
            />
            <path
              className="sl-line sl-line-bracket-r"
              pathLength={1}
              d="M1148 156v404M1052 196h96M1052 556h96"
              stroke="rgba(201, 163, 95, 0.3)"
              strokeWidth="1"
            />
            <path
              className="sl-line sl-line-circuit"
              pathLength={1}
              d="M600 84v64M600 552v64M546 118h108M546 584h108"
              stroke="rgba(228, 200, 143, 0.44)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <div className="jt-copy sl-copy">
          <p className="jt-kicker sl-kicker">
            <span aria-hidden="true" className="jt-kicker-line" />
            Record {code} · Sealing Technique
          </p>

          <h3 className="jt-title sl-title">
            <span className="jt-title-text sl-title-text" data-text={TITLE}>
              {mission.name}
            </span>
          </h3>

          <p className="jt-role">
            {classification} · {discipline}
          </p>
          <p className="sl-seal-label">
            <span aria-hidden="true" className="sl-seal-dot" />
            Client-owned engagement · no public build
          </p>
        </div>

        <figure className="jt-plate sl-plate">
          <div className="jt-plate-screen sl-plate-screen">
            {cover.kind === "screenshot" ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 1023px) 92vw, 37vw"
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

        <span aria-label={`Mission rank ${mission.rank}`} className="jt-rank sl-rank">
          {mission.rank}
        </span>

        <p className="jt-stage sl-stage">
          <span aria-hidden="true" className="jt-dot" />
          Jutsu motif · the seal opens the record
        </p>

        <span className="sl-glyph font-jp" aria-hidden="true">
          封
        </span>
      </div>

      <MissionRecord mission={mission} index={index} art={art} />
    </article>
  );
}
