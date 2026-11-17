/**
 * Original ink-silhouette stand-in for Lightning Release.
 *
 * Same honest placeholder language as `SandShinobi`: a backlit silhouette that
 * carries mass, stance and a lit rim — not a hand-coded pseudo-portrait. The
 * real artwork slot is `BOLT_SHINOBI.base` in `lib/data/characterArt.ts`.
 *
 * Static SVG. Every motion in the scene is CSS on wrappers/groups.
 */
type Props = { className?: string };

export default function BoltShinobi({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 460 900"
      fill="none"
      role="img"
      aria-label="Silhouette of a lightning shinobi, one palm extended as chakra gathers at the hand"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="bolt-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.26" />
          <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bolt-body" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#141d23" />
          <stop offset="52%" stopColor="#0b1216" />
          <stop offset="100%" stopColor="#060a0d" />
        </linearGradient>
        <linearGradient id="bolt-cloak" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18242b" />
          <stop offset="100%" stopColor="#070c0f" />
        </linearGradient>
        <linearGradient id="bolt-rim" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ecfeff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#7dd3fc" stopOpacity="0.66" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="bolt-fadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#ffffff" />
          <stop offset="88%" stopColor="#8a8a8a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>
        <mask id="bolt-fade">
          <rect width="460" height="900" fill="url(#bolt-fadeGrad)" />
        </mask>
      </defs>

      <ellipse cx="210" cy="320" rx="180" ry="250" fill="url(#bolt-halo)" />

      <g mask="url(#bolt-fade)">
        {/* Storm cloak streaming away from the stance */}
        <path
          d="M150 452c-46 16-84 44-108 84 26-2 50 4 70 18-28 20-48 48-58 82 34-14 66-14 96 0-14 22-20 46-18 70 40-24 78-28 116-12z"
          fill="url(#bolt-cloak)"
          opacity="0.92"
        />
        <path
          d="M118 470c-44 24-72 58-88 100 30-12 58-10 82 2-22 24-34 52-36 82 30-18 58-20 86-8"
          stroke="#7dd3fc"
          strokeOpacity="0.12"
          strokeWidth="1.4"
          fill="none"
        />

        {/* Legs, weight on the back foot */}
        <path
          d="M172 556c-10 86-20 168-30 234l-8 82c28 10 56 14 84 14l6-8c-8-58-10-118-5-180l7-142z"
          fill="url(#bolt-body)"
        />
        <path
          d="M245 556l11 148c2 44 8 88 18 132l6 26c28-6 50-16 66-30-16-42-26-88-30-136l-7-140z"
          fill="url(#bolt-body)"
        />
        <path
          d="M146 790c-6 30-12 58-16 78 26 8 50 12 74 12"
          stroke="#7dd3fc"
          strokeOpacity="0.22"
          strokeWidth="1.6"
          fill="none"
        />

        {/* Leaning torso */}
        <path
          d="M160 270c-26 28-38 70-42 122l-10 186 172 8-18-194c-4-54-18-94-44-122z"
          fill="url(#bolt-body)"
        />
        <path
          d="M160 270c-26 28-38 70-42 122l-10 186 172 8-18-194c-4-54-18-94-44-122z"
          fill="url(#bolt-cloak)"
          opacity="0.55"
        />

        {/* Shoulder mantle */}
        <path
          d="M158 268c16-20 44-30 74-30 32 0 60 10 76 30-8 18-26 28-44 32-16 4-30 5-42 5s-26-1-40-5c-18-4-32-14-44-32z"
          fill="#0d151a"
        />

        {/* Hood, head and wind-swept hair */}
        <path
          d="M176 258c-10-44-4-86 18-106 22-22 54-20 74 4 20 24 24 62 16 100-32 12-78 12-108 2z"
          fill="url(#bolt-body)"
        />
        <path
          d="M186 196l-16-34 24 12-2-36 22 20 4-34 18 22 12-30 10 30 20-18-8 34 20-6-24 28z"
          fill="#0a1014"
        />
        <path
          d="M190 240c-2-24 4-46 16-58 13-13 32-13 45 0 11 11 15 30 14 52-26 8-52 8-75 6z"
          fill="#05090b"
        />
        <path
          d="M192 246c26 10 58 10 88 2 5 8 8 15 9 22-34 10-74 10-104 0 1-8 3-16 5-22z"
          fill="#0a1115"
        />

        {/* Folded seal arm */}
        <path
          d="M190 288c-22 16-30 46-20 68 9 20 28 30 46 24l12-12-18-24c-10 4-20-2-22-12-2-11 4-22 14-28z"
          fill="#0f181d"
        />
        <path
          d="M206 346c16-12 36-14 52-4l14 12c2 10-4 18-14 21-16 5-36-2-50-14z"
          fill="#111c22"
        />
        <circle cx="234" cy="368" r="15" fill="#162228" />
        <path
          d="M226 361c6-5 14-5 19 0M226 375c6 4 14 4 19 0"
          stroke="#7dd3fc"
          strokeOpacity="0.3"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Extended chakra arm */}
        <path
          d="M262 290c34 8 68 24 100 48l-20 32c-30-22-62-36-94-44z"
          fill="#122028"
        />
        <path
          d="M360 334c11-3 21 2 25 11 4 9 0 18-9 22l-14 5-15-25z"
          fill="#1a2a33"
        />
        <path
          d="M344 330c14-6 28-2 36 10"
          stroke="#7dd3fc"
          strokeOpacity="0.4"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Cold rim light: the only strong values on the figure */}
        <g stroke="url(#bolt-rim)" strokeLinecap="round" fill="none">
          <path d="M184 258c-10-44-4-84 16-104" strokeWidth="2.4" opacity="0.9" />
          <path
            d="M160 272c-25 28-37 70-41 122l-10 184"
            strokeWidth="2"
            opacity="0.72"
          />
          <path d="M150 344c-8-16-6-38 8-54" strokeWidth="1.5" opacity="0.55" />
          <path
            d="M264 292c34 8 66 24 96 46"
            strokeWidth="1.8"
            opacity="0.8"
          />
          <path d="M344 330c14-6 28-2 36 10" strokeWidth="1.4" opacity="0.55" />
          <path
            d="M171 558c-10 86-20 166-29 230"
            strokeWidth="1.5"
            opacity="0.32"
          />
        </g>
      </g>

      {/* Chakra gathering at the extended palm — CSS animates this group */}
      <g className="lt-chakra">
        <circle cx="388" cy="356" r="9" fill="#ecfeff" opacity="0.95" />
        <circle
          className="lt-chakra-ring"
          cx="388"
          cy="356"
          r="25"
          stroke="#a5f3fc"
          strokeWidth="1.2"
          strokeDasharray="3 6"
          opacity="0.8"
        />
        <circle
          className="lt-chakra-ring lt-chakra-ring-2"
          cx="388"
          cy="356"
          r="40"
          stroke="#38bdf8"
          strokeWidth="0.9"
          opacity="0.45"
        />
        <path
          className="lt-chakra-spark"
          d="M388 330v-14M388 382v14M362 356h-14M414 356h14M369 337l-10-10M407 375l10 10M407 337l10-10M369 375l-10 10"
          stroke="#a5f3fc"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.65"
        />
      </g>
    </svg>
  );
}
