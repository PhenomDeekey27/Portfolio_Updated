/**
 * Original ink-silhouette stand-in for Sealing Technique.
 *
 * A frontal, grounded stance: both hands held in a seal, wide haori sleeves and
 * a scroll canister across the back. The gold sealing geometry lives in the
 * scene behind this figure, never in the figure itself.
 */
type Props = { className?: string };

export default function SealShinobi({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 460 900"
      fill="none"
      role="img"
      aria-label="Silhouette of a sealing shinobi, both hands held in a seal, scroll canister across the back"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="seal-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0d9a4" stopOpacity="0.24" />
          <stop offset="58%" stopColor="#c9a35f" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c9a35f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="seal-body" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#201d14" />
          <stop offset="50%" stopColor="#12110b" />
          <stop offset="100%" stopColor="#090906" />
        </linearGradient>
        <linearGradient id="seal-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4e2b6" stopOpacity="0.13" />
          <stop offset="70%" stopColor="#f4e2b6" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#f4e2b6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="seal-rim" x1="0" y1="0" x2="0.45" y2="1">
          <stop offset="0%" stopColor="#f9ecc9" stopOpacity="0.95" />
          <stop offset="48%" stopColor="#d8b477" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#a57f41" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="seal-fadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="64%" stopColor="#ffffff" />
          <stop offset="88%" stopColor="#8a8a8a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>
        <mask id="seal-fade">
          <rect width="460" height="900" fill="url(#seal-fadeGrad)" />
        </mask>
      </defs>

      <ellipse cx="230" cy="330" rx="186" ry="256" fill="url(#seal-halo)" />

      <g mask="url(#seal-fade)">
        {/* Scroll canister worn across the back */}
        <g transform="rotate(-19 250 330)">
          <rect
            x="196"
            y="212"
            width="108"
            height="34"
            rx="17"
            fill="#191710"
          />
          <rect
            x="208"
            y="218"
            width="84"
            height="22"
            rx="11"
            fill="#211d13"
          />
          <path
            d="M214 221h72M214 237h72"
            stroke="#c9a35f"
            strokeOpacity="0.28"
            strokeWidth="1"
          />
          <circle cx="300" cy="229" r="7" fill="#2a2519" />
        </g>

        {/* Long haori */}
        <path
          d="M158 282c-30 26-44 76-48 138l-14 292 268 0-14-292c-4-62-18-112-48-138z"
          fill="url(#seal-body)"
        />
        <path
          d="M158 282c-30 26-44 76-48 138l-14 292 268 0-14-292c-4-62-18-112-48-138z"
          fill="url(#seal-cloth)"
        />
        <path
          d="M230 300v412"
          stroke="#c9a35f"
          strokeOpacity="0.14"
          strokeWidth="1"
        />

        {/* Front lapels */}
        <path
          d="M204 288l26 62 26-62c-8-10-18-15-26-15s-18 5-26 15z"
          fill="#0c0c07"
        />

        {/* Shoulder mantle */}
        <path
          d="M158 280c14-20 42-30 72-30s58 10 72 30c-8 16-24 26-42 30-14 4-26 5-38 5s-24-1-38-5c-14-4-30-14-34-30z"
          fill="#17150e"
        />

        {/* Hood and head */}
        <path
          d="M180 266c-8-42-2-82 20-102 22-20 52-18 72 4 18 22 22 58 14 96-32 10-76 10-106 2z"
          fill="url(#seal-body)"
        />
        <path
          d="M192 246c-2-26 4-48 18-60 16-13 38-11 50 6 10 14 12 33 10 54-26 8-56 8-78 0z"
          fill="#070704"
        />
        <path
          d="M191 252c27 10 58 10 90 1 5 8 7 15 8 22-34 10-74 10-104 0 1-8 3-16 6-23z"
          fill="#0b0b07"
        />

        {/* Wide sleeves converging on the seal */}
        <path
          d="M160 300c-18 16-26 46-22 78l10 58 34-8-4-64c-2-26 2-46 12-58z"
          fill="#15130c"
        />
        <path
          d="M300 300c18 16 26 46 22 78l-10 58-34-8 4-64c2-26-2-46-12-58z"
          fill="#15130c"
        />
        <path
          d="M168 372c14 12 30 22 50 26l-6 26c-24-6-42-16-54-30z"
          fill="#12110b"
        />
        <path
          d="M292 372c-14 12-30 22-50 26l6 26c24-6 42-16 54-30z"
          fill="#12110b"
        />

        {/* Both hands in the seal */}
        <circle cx="230" cy="392" r="22" fill="#1a180f" />
        <path
          d="M216 384c8-7 20-7 28 0M216 398c8 6 20 6 28 0"
          stroke="#d8b477"
          strokeOpacity="0.35"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Sash */}
        <path
          d="M132 512c40-10 94-12 130-9 20 2 38 5 52 9l4 30c-18-4-38-7-58-8-40-2-88 1-126 9z"
          fill="#232014"
        />

        {/* Hem shadow */}
        <path
          d="M110 704c80 12 160 12 240 0l4 8c-84 12-166 12-248 0z"
          fill="#050503"
          opacity="0.7"
        />

        {/* Warm rim light */}
        <g stroke="url(#seal-rim)" strokeLinecap="round" fill="none">
          <path d="M188 266c-8-42-2-80 18-100" strokeWidth="2.3" opacity="0.9" />
          <path
            d="M158 288c-28 28-40 78-44 138l-13 286"
            strokeWidth="1.9"
            opacity="0.66"
          />
          <path d="M148 386c-4-18 0-38 12-52" strokeWidth="1.4" opacity="0.5" />
          <path
            d="M302 306c14 18 20 46 17 74"
            strokeWidth="1.5"
            opacity="0.45"
          />
          <path d="M238 376c8-4 16-4 22 2" strokeWidth="1.3" opacity="0.55" />
        </g>
      </g>

      {/* Seal glow at the hands — CSS animates this group */}
      <g className="sl-hands">
        <circle cx="230" cy="392" r="6" fill="#f4e2b6" opacity="0.9" />
        <circle
          className="sl-hands-ring"
          cx="230"
          cy="392"
          r="20"
          stroke="#e4c88f"
          strokeWidth="1.1"
          strokeDasharray="3 6"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
