"use client";

import Image from "next/image";
import type { Mission } from "@/lib/data/missions";
import { SIGNAL_SHINOBI } from "@/lib/data/characterArt";
import MissionCover from "./MissionCover";
import MissionRecord from "./MissionRecord";
import SignalShinobi from "./SignalShinobi";
import { useEncounterActive } from "./useEncounterActive";

/**
 * SHINOBI JUTSU THEATRE — SHADOW NETWORK (Saravaraj AI).
 *
 * Composition identity: a radial relay. The shinobi crouches at the left and
 * sends a signal; nodes across the right two-thirds light up in sequence, links
 * draw progressively outward from the central hub, and rings pulse through the
 * chamber. The title settles only after the network has connected; the
 * original project artwork floats at lower right on the node field.
 *
 * Sequence: signal 120ms → nodes 320ms+ → links 520ms+ → rings 780ms →
 * title 1350ms → plate 1750ms.
 *
 * Saravaraj AI is client-owned: no links are invented and the client note is
 * carried through verbatim.
 */

const TITLE = "SARAVARAJ AI";

/** Deterministic node field. Hub is index 0. */
type NetworkNode = { x: number; y: number; r: number; hub?: boolean };

const NODES: NetworkNode[] = [
  { x: 660, y: 320, r: 5.5, hub: true },
  { x: 500, y: 186, r: 3.2 },
  { x: 812, y: 168, r: 3.4 },
  { x: 952, y: 292, r: 3 },
  { x: 878, y: 452, r: 3.3 },
  { x: 646, y: 500, r: 3 },
  { x: 448, y: 420, r: 2.8 },
  { x: 388, y: 258, r: 2.6 },
  { x: 1048, y: 438, r: 2.6 },
];

/** Hub spokes, then two outer connections that close the mesh. */
const LINKS: Array<[number, number, number]> = [
  [0, 1, 520],
  [0, 2, 580],
  [0, 3, 640],
  [0, 4, 700],
  [0, 5, 760],
  [0, 6, 820],
  [0, 7, 880],
  [1, 7, 1010],
  [2, 3, 1070],
  [3, 8, 1130],
  [4, 5, 1130],
  [6, 7, 1190],
];

export default function NetworkScene({
  mission,
  index,
}: {
  mission: Mission;
  index: number;
}) {
  const { ref, active } = useEncounterActive<HTMLElement>();
  const code = String(index + 1).padStart(2, "0");
  const [classification, discipline] = mission.category.split(" · ");
  const art = SIGNAL_SHINOBI;
  const cover = mission.cover;

  return (
    <article
      ref={ref}
      data-encounter={mission.id}
      data-jutsu="network"
      data-active={active ? "true" : "false"}
      data-character={art.base ? "asset" : "stand-in"}
      className="jt jt--network relative border-t border-gold/10 py-14 first:border-t-0 first:pt-0 sm:py-20 lg:py-24"
    >
      <div className="jt-scene nw-scene">
        <span className="jt-env nw-env" aria-hidden="true" />
        <span className="nw-grid" aria-hidden="true" />

        <figure className="jt-figure nw-figure">
          {art.base ? (
            <Image
              src={art.base}
              alt={art.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 36vw"
              className="jt-figure-img object-contain object-bottom"
            />
          ) : (
            <SignalShinobi className="jt-figure-svg" />
          )}
        </figure>

        {/* Node field: links draw outward, nodes light in order */}
        <span className="nw-field" aria-hidden="true">
          <svg
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            className="h-full w-full"
          >
            {LINKS.map(([from, to, delay], linkIndex) => (
              <line
                key={`link-${linkIndex}`}
                className="nw-link"
                pathLength={1}
                x1={NODES[from].x}
                y1={NODES[from].y}
                x2={NODES[to].x}
                y2={NODES[to].y}
                stroke={
                  from === 0
                    ? "rgba(201, 163, 95, 0.55)"
                    : "rgba(95, 143, 120, 0.5)"
                }
                strokeWidth="1.1"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}

            {NODES.map((node, nodeIndex) => (
              <g
                key={`node-${nodeIndex}`}
                className="nw-node"
                style={{ animationDelay: `${320 + nodeIndex * 80}ms` }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.hub ? 22 : 13}
                  fill="none"
                  stroke={
                    node.hub
                      ? "rgba(228, 200, 143, 0.65)"
                      : "rgba(201, 163, 95, 0.32)"
                  }
                  strokeWidth="1"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={node.hub ? "#e4c88f" : "#c9a35f"}
                  opacity={node.hub ? 0.95 : 0.8}
                />
              </g>
            ))}

            {/* Signal paths crossing the mesh, drawn last */}
            <path
              className="nw-live-link"
              pathLength={1}
              d="M812 168l116 84 120 186"
              stroke="rgba(142, 47, 47, 0.55)"
              strokeWidth="1"
              strokeDasharray="5 7"
            />
            <path
              className="nw-live-link nw-live-link-2"
              pathLength={1}
              d="M500 186l-52 72-36 162"
              stroke="rgba(142, 47, 47, 0.4)"
              strokeWidth="1"
              strokeDasharray="5 7"
            />
          </svg>
        </span>

        {/* Communication ripples spreading from the hub */}
        <span className="nw-waves" aria-hidden="true">
          <span className="nw-wave" />
          <span className="nw-wave nw-wave-2" />
          <span className="nw-wave nw-wave-3" />
        </span>

        <div className="jt-copy nw-copy">
          <p className="jt-kicker">
            <span aria-hidden="true" className="jt-kicker-line" />
            Record {code} · Shadow Network
          </p>

          <h3 className="jt-title nw-title">
            <span className="jt-title-text nw-title-text" data-text={TITLE}>
              {mission.name}
            </span>
          </h3>

          <p className="jt-role">
            {classification} · {discipline}
          </p>
          <p className="nw-signal-label">
            <span aria-hidden="true" className="nw-signal-dot" />
            Channels connected · client-owned platform
          </p>
        </div>

        <figure className="jt-plate nw-plate">
          <div className="jt-plate-screen nw-plate-screen">
            {cover.kind === "screenshot" ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 1023px) 92vw, 39vw"
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

        <span aria-label={`Mission rank ${mission.rank}`} className="jt-rank nw-rank">
          {mission.rank}
        </span>

        <p className="jt-stage nw-stage">
          <span aria-hidden="true" className="jt-dot" />
          Jutsu motif · nodes connect the record
        </p>

        <span className="nw-glyph font-jp" aria-hidden="true">
          影
        </span>
      </div>

      <MissionRecord mission={mission} index={index} art={art} />
    </article>
  );
}
