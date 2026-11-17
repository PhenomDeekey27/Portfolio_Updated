type SealRingProps = {
  className?: string;
  strokeWidth?: number;
};

const ticks = Array.from({ length: 48 }, (_, i) => i * 7.5);

/**
 * Flying Raijin-inspired seal ring. An original geometric composition:
 * concentric rings, minute ticks and four directional diamonds.
 */
export default function SealRing({ className, strokeWidth = 1 }: SealRingProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="120" cy="120" r="116" opacity="0.35" />
      <circle cx="120" cy="120" r="108" opacity="0.22" strokeDasharray="2 7" />
      <circle cx="120" cy="120" r="88" opacity="0.3" />
      <circle cx="120" cy="120" r="58" opacity="0.18" />
      <circle cx="120" cy="120" r="30" opacity="0.25" strokeDasharray="1 5" />

      <g opacity="0.45">
        {ticks.map((angle) => (
          <line
            key={angle}
            x1="120"
            y1="8"
            x2="120"
            y2={angle % 30 === 0 ? 18 : 14}
            transform={`rotate(${angle} 120 120)`}
          />
        ))}
      </g>

      <g opacity="0.5">
        <path d="M120 24v18M120 198v18M24 120h18M198 120h18" />
        <path d="M120 68v-9M120 181v-9M68 120h-9M181 120h-9" />
      </g>

      <g opacity="0.35">
        <path d="M120 0l5 9-5 9-5-9Z" transform="translate(0 10)" />
        <path d="M120 0l5 9-5 9-5-9Z" transform="translate(0 202)" />
        <path d="M120 0l5 9-5 9-5-9Z" transform="translate(-92 106)" />
        <path d="M120 0l5 9-5 9-5-9Z" transform="translate(92 106)" />
      </g>

      <g opacity="0.28">
        <path d="M120 62a58 58 0 0 1 58 58" />
        <path d="M120 178a58 58 0 0 1-58-58" />
        <path d="M62 120a58 58 0 0 1 58-58" opacity="0.4" />
        <path d="M178 120a58 58 0 0 1-58 58" opacity="0.4" />
      </g>
    </svg>
  );
}
