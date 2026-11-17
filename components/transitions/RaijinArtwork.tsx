import type { SVGProps } from "react";

export { RaijinKunai } from "./RaijinKunai";

/**
 * Original, hand-authored Flying Raijin artwork used by the teleportation
 * transition. No character illustration, no external assets and no filters:
 * everything here is inline vector geometry so the transition never has to
 * decode an image while an animation is running.
 */

/** Original Flying Raijin seal motif (SVG, no external asset). */
export function FlyingRaijinSeal({
  variant = "full",
  ...props
}: SVGProps<SVGSVGElement> & { variant?: "full" | "ring" }) {
  return (
    <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" focusable="false" {...props}>
      <circle cx="150" cy="150" r="132" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
      <circle cx="150" cy="150" r="116" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="150" cy="150" r="88" stroke="currentColor" strokeWidth="1.8" opacity="0.75" />
      <circle cx="150" cy="150" r="54" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const inner = i % 2 === 0 ? 118 : 126;
        const r = (value: number) => Math.round(value * 100) / 100;
        return (
          <line
            key={i}
            x1={r(150 + Math.cos(angle) * inner)}
            y1={r(150 + Math.sin(angle) * inner)}
            x2={r(150 + Math.cos(angle) * 132)}
            y2={r(150 + Math.sin(angle) * 132)}
            stroke="currentColor"
            strokeWidth={i % 2 === 0 ? 2.4 : 1.2}
            opacity={i % 2 === 0 ? 0.85 : 0.45}
          />
        );
      })}
      {variant === "full" && (
        <>
          {/* tri-prong motif */}
          <path d="M 150 92 L 168 150 L 150 188 L 132 150 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 128 154 C 110 138 98 118 96 100 C 114 108 130 126 140 142" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 172 154 C 190 138 202 118 204 100 C 186 108 170 126 160 142" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="150" cy="150" r="6" fill="currentColor" opacity="0.8" />
          <path d="M 150 118 L 150 136" stroke="currentColor" strokeWidth="1.6" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

const BOLTS = [
  "M 196 76 L 176 150 L 194 158 L 160 236 L 180 244 L 150 322",
  "M 150 196 L 166 238 L 148 250 L 168 296",
  "M 286 92 L 306 158 L 290 168 L 322 240 L 304 250 L 332 318",
  "M 336 224 L 318 268 L 336 280 L 320 322",
  "M 210 350 L 196 392 L 210 398 L 198 434",
  "M 274 344 L 288 386 L 274 394 L 286 430",
  "M 168 128 L 156 148",
  "M 320 128 L 332 148",
  "M 178 366 L 166 382",
  "M 306 368 L 318 384",
];

/**
 * Golden chakra lightning surrounding the descending kunai. Drawn as a
 * handful of static vector paths; the transition only fades/scales the group.
 */
export function RaijinLightning(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 480 560"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* soft halo pass */}
      <g
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.16"
      >
        {BOLTS.map((d, index) => (
          <path key={`halo-${index}`} d={d} />
        ))}
      </g>
      {/* core bolts */}
      <g
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      >
        {BOLTS.map((d, index) => (
          <path key={`core-${index}`} d={d} opacity={index % 2 === 0 ? 0.95 : 0.7} />
        ))}
      </g>
    </svg>
  );
}
