"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

/**
 * PHASE 6.11 — ELEMENTAL PROJECT TRANSITIONS.
 *
 * The archive used to move between project encounters with no elemental
 * storytelling at all (and the site's section pairs still use Flying Raijin,
 * Nature Chakra, Rasengan and the Chronicle Map). This component adds a short
 * scroll-crossing band at each encounter boundary that carries the outgoing
 * project's element into the incoming one:
 *
 *   BugWiser → ResQ             sand disperses → wind gathers
 *   ResQ → ENN Consultancy      wind slows → water condenses and flows
 *   ENN Consultancy → Saravaraj water streams evaporate → embers and flame
 *
 * Reverse crossings render the same pair with its two elements swapped
 * (wind → sand, water → wind, fire → water), so the identity order always
 * matches the travel direction.
 *
 * Architecture: the same shape as the existing encounter animation — an
 * IntersectionObserver arms a one-shot CSS timeline on a static SVG. No scroll
 * listener, no per-frame React state, no scroll lock, no blocking overlay. The
 * band is ~200px tall, so it never delays the reader.
 */

export type ElementKind = "sand" | "wind" | "water" | "fire";
export type SeamDirection = "forward" | "reverse";

type Tone = { bg: string; ink: string; pale: string };

const TONES: Record<ElementKind, Tone> = {
  sand: { bg: "#050503", ink: "#c9a35f", pale: "#e4c88f" },
  wind: { bg: "#070806", ink: "#67e8f9", pale: "#a5f3fc" },
  water: { bg: "#04121c", ink: "#22d3ee", pale: "#a5f3fc" },
  fire: { bg: "#0b0705", ink: "#f97316", pale: "#fbbf24" },
};

/**
 * Ordered pairs. The top half belongs to the project above the seam (the one
 * being left), the bottom half to the project below it (the one being entered).
 */
const PAIR_ORDER: Record<string, { top: ElementKind; bottom: ElementKind }> = {
  "bugwiser|resq": { top: "sand", bottom: "wind" },
  "resq|enn-consultancy": { top: "wind", bottom: "water" },
  "enn-consultancy|saravaraj-ai": { top: "water", bottom: "fire" },

  // Reverse crossings.
  "resq|bugwiser": { top: "wind", bottom: "sand" },
  "enn-consultancy|resq": { top: "water", bottom: "wind" },
  "saravaraj-ai|enn-consultancy": { top: "fire", bottom: "water" },
};

/** Deterministic scatter — integers only, so SSR and client agree. */
const GRAINS = Array.from({ length: 26 }, (_, index) => ({
  x: 24 + ((index * 137) % 1390),
  y: 12 + ((index * 29) % 82),
  r: 1.4 + (index % 4) * 0.6,
  o: 0.2 + (index % 5) * 0.1,
}));

const STREAKS = Array.from({ length: 14 }, (_, index) => ({
  x: 40 + ((index * 193) % 1350),
  y: 16 + ((index * 41) % 76),
  len: 26 + (index % 5) * 16,
  o: 0.2 + (index % 4) * 0.1,
}));

const DROPS = Array.from({ length: 18 }, (_, index) => ({
  x: 30 + ((index * 167) % 1370),
  y: 8 + ((index * 37) % 88),
  r: 1.8 + (index % 3) * 1.1,
  o: 0.25 + (index % 4) * 0.12,
}));

const EMBERS = Array.from({ length: 20 }, (_, index) => ({
  x: 26 + ((index * 149) % 1382),
  y: 14 + ((index * 43) % 78),
  r: 1.2 + (index % 3) * 0.8,
  o: 0.24 + (index % 5) * 0.1,
}));

function ElementArt({
  kind,
  gradientId,
}: {
  kind: ElementKind;
  gradientId: string;
}) {
  if (kind === "sand") {
    return (
      <>
        <path
          d="M-40 62 C 260 28, 520 82, 760 52 C 1000 22, 1240 66, 1480 38"
          stroke={`url(#${gradientId})`}
          strokeWidth="11"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M-40 92 C 280 64, 540 104, 780 80 C 1020 56, 1260 90, 1480 70"
          stroke={`url(#${gradientId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.34"
        />
        {GRAINS.map((grain, index) => (
          <circle
            key={`grain-${index}`}
            cx={grain.x}
            cy={grain.y}
            r={grain.r}
            fill="#e4c88f"
            opacity={grain.o}
          />
        ))}
      </>
    );
  }

  if (kind === "wind") {
    return (
      <>
        <path
          d="M-40 34 C 300 4, 620 60, 900 30 C 1180 0, 1340 30, 1480 14"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.62"
        />
        <path
          d="M-40 66 C 300 42, 620 88, 900 60 C 1180 32, 1340 58, 1480 44"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.46"
        />
        <path
          d="M-40 96 C 320 78, 640 108, 920 86 C 1200 64, 1350 80, 1480 74"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.34"
        />
        {STREAKS.map((streak, index) => (
          <path
            key={`streak-${index}`}
            d={`M${streak.x} ${streak.y} h${streak.len}`}
            stroke="#a5f3fc"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity={streak.o}
          />
        ))}
      </>
    );
  }

  if (kind === "water") {
    return (
      <>
        <path
          d="M-40 26 C 280 48, 560 14, 840 38 C 1120 62, 1300 30, 1480 48"
          stroke={`url(#${gradientId})`}
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M-40 62 C 300 82, 580 46, 860 74 C 1140 102, 1320 66, 1480 86"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M-40 94 C 320 106, 600 78, 880 98 C 1160 118, 1330 96, 1480 104"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.36"
        />
        {DROPS.map((drop, index) => (
          <circle
            key={`drop-${index}`}
            cx={drop.x}
            cy={drop.y}
            r={drop.r}
            fill="#a5f3fc"
            opacity={drop.o}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <ellipse
        cx="720"
        cy="70"
        rx="520"
        ry="46"
        fill={`url(#${gradientId})`}
        opacity="0.18"
      />
      <path
        d="M 236 108 C 196 78, 224 50, 268 30 C 300 14, 286 48, 314 62 C 350 80, 322 96, 344 108 Z"
        fill={`url(#${gradientId})`}
        opacity="0.5"
      />
      <path
        d="M 508 108 C 470 66, 520 34, 556 6 C 588 40, 566 54, 600 74 C 640 98, 604 100, 618 108 Z"
        fill={`url(#${gradientId})`}
        opacity="0.42"
      />
      <path
        d="M 902 108 C 872 82, 908 56, 940 38 C 968 22, 962 52, 992 68 C 1028 88, 998 98, 1016 108 Z"
        fill={`url(#${gradientId})`}
        opacity="0.46"
      />
      <path
        d="M 1146 108 C 1120 88, 1152 66, 1180 52 C 1204 40, 1198 64, 1226 80 C 1258 98, 1230 100, 1244 108 Z"
        fill={`url(#${gradientId})`}
        opacity="0.36"
      />
      {EMBERS.map((ember, index) => (
        <circle
          key={`ember-${index}`}
          cx={ember.x}
          cy={ember.y}
          r={ember.r}
          fill="#fbbf24"
          opacity={ember.o}
        />
      ))}
    </>
  );
}

function useSeamActivation() {
  const ref = useRef<HTMLDivElement>(null);
  const lastTopRef = useRef<number | null>(null);
  const [state, setState] = useState<{
    active: boolean;
    direction: SeamDirection;
  }>({ active: false, direction: "forward" });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const top = entry.boundingClientRect.top;
          const previousTop = lastTopRef.current;
          lastTopRef.current = top;

          if (entry.isIntersecting) {
            // The seam's viewport top decreases as the page scrolls down, so a
            // falling top means the reader is travelling forward. The first
            // observation falls back to the geometric position.
            const direction: SeamDirection =
              previousTop === null
                ? top > window.innerHeight / 2
                  ? "forward"
                  : "reverse"
                : top < previousTop
                  ? "forward"
                  : "reverse";
            setState({ active: true, direction });
          } else {
            setState((previous) =>
              previous.active ? { ...previous, active: false } : previous
            );
          }
        }
      },
      // A narrow band across the middle of the viewport: the transition plays
      // while the seam is the centre of attention, not at the edges.
      { rootMargin: "-36% 0px -36% 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, active: state.active, direction: state.direction };
}

export default function ElementalSeam({
  from,
  to,
}: {
  /** Mission id of the encounter above the seam. */
  from: string;
  /** Mission id of the encounter below the seam. */
  to: string;
}) {
  const { ref, active, direction } = useSeamActivation();
  const rawId = useId();
  const uid = `esm-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  // The pair is chosen by travel direction: crossing upward renders the same
  // two elements in reverse order (wind → sand, water → wind, fire → water).
  const order =
    PAIR_ORDER[direction === "reverse" ? `${to}|${from}` : `${from}|${to}`];
  if (!order) return null;

  const top = TONES[order.top];
  const bottom = TONES[order.bottom];

  const style = {
    "--esm-top-bg": top.bg,
    "--esm-top-ink": top.ink,
    "--esm-top-pale": top.pale,
    "--esm-bottom-bg": bottom.bg,
    "--esm-bottom-ink": bottom.ink,
    "--esm-bottom-pale": bottom.pale,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-elemental-seam={`${order.top}-${order.bottom}`}
      data-seam-from={from}
      data-seam-to={to}
      data-active={active ? "true" : "false"}
      data-direction={direction}
      className="esm"
      style={style}
    >
      <span className="esm-aura esm-aura-top" aria-hidden="true" />
      <span className="esm-aura esm-aura-bottom" aria-hidden="true" />

      <svg
        className="esm-art"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        fill="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={top.ink} stopOpacity="0" />
            <stop offset="0.38" stopColor={top.pale} stopOpacity="0.85" />
            <stop offset="0.72" stopColor={top.ink} stopOpacity="0.55" />
            <stop offset="1" stopColor={top.ink} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-bottom`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={bottom.ink} stopOpacity="0" />
            <stop offset="0.34" stopColor={bottom.pale} stopOpacity="0.85" />
            <stop offset="0.7" stopColor={bottom.ink} stopOpacity="0.6" />
            <stop offset="1" stopColor={bottom.ink} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-mist`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={bottom.ink} stopOpacity="0.55" />
            <stop offset="1" stopColor={bottom.pale} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outgoing element — disperses toward the boundary. */}
        <g className="esm-layer esm-out">
          <ElementArt kind={order.top} gradientId={`${uid}-top`} />
        </g>

        {/* Incoming element — gathers out of the boundary. */}
        <g className="esm-layer esm-in">
          <g transform="translate(0 110)">
            <ElementArt kind={order.bottom} gradientId={`${uid}-bottom`} />
          </g>
        </g>

        {/* The boundary itself: one hairline and a small elemental seal. */}
        <path
          className="esm-line"
          d="M 0 110 H 1440"
          stroke={`url(#${uid}-top)`}
          strokeWidth="1"
        />
        <path
          className="esm-seal"
          d="M 720 96 L 734 110 L 720 124 L 706 110 Z"
          stroke={bottom.pale}
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />
      </svg>
    </div>
  );
}
