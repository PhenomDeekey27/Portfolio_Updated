/**
 * Original ink-silhouette stand-in for the Sand Dominion scene.
 *
 * This is intentionally a backlit silhouette rather than an attempt at an
 * anime portrait: no character artwork is available in this project, and a
 * hand-coded pseudo-portrait would read as visibly poor art. The silhouette is
 * an honest placeholder that carries the composition (mass, gourd, raised seal,
 * desert rim light) until `lib/data/characterArt.ts` points at approved art.
 *
 * Purely static SVG: no filters, no animation, no scripts. All motion in the
 * scene is CSS on the wrapper.
 */

type Props = { className?: string };

export default function SandShinobi({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 440 900"
      fill="none"
      role="img"
      aria-label="Silhouette of a sand shinobi, gourd on the back, one hand held in a seal"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="sdsh-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c88f" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#c9a35f" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c9a35f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sdsh-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1c14" />
          <stop offset="46%" stopColor="#121309" />
          <stop offset="100%" stopColor="#0a0b07" />
        </linearGradient>
        <linearGradient id="sdsh-gourd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2c2819" />
          <stop offset="62%" stopColor="#17160e" />
          <stop offset="100%" stopColor="#0d0d08" />
        </linearGradient>
        <linearGradient id="sdsh-rim" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#f6e3b4" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#d8b477" stopOpacity="0.72" />
          <stop offset="78%" stopColor="#a57f41" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a57f41" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="sdsh-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4e2b6" stopOpacity="0.14" />
          <stop offset="60%" stopColor="#f4e2b6" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#f4e2b6" stopOpacity="0" />
        </linearGradient>
        {/* The robe dissolves into the sand at the hem instead of ending in a cut line. */}
        <linearGradient id="sdsh-fadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="66%" stopColor="#ffffff" />
          <stop offset="86%" stopColor="#8a8a8a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
        </linearGradient>
        <mask id="sdsh-fade">
          <rect width="440" height="900" fill="url(#sdsh-fadeGrad)" />
        </mask>
      </defs>

      {/* Dust halo behind the figure */}
      <ellipse cx="244" cy="330" rx="190" ry="250" fill="url(#sdsh-halo)" />

      <g mask="url(#sdsh-fade)">
        {/* Sand gourd, worn high on the back */}
        <g transform="rotate(9 322 372)">
          <path
            d="M300 302c-2-14 8-22 22-22s24 8 22 22l-6 26h-32z"
            fill="url(#sdsh-gourd)"
          />
          <ellipse cx="322" cy="376" rx="55" ry="68" fill="url(#sdsh-gourd)" />
          <path
            d="M271 348c18-11 37-11 54-1M268 404c20 12 41 12 60 0"
            stroke="#3c3627"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M283 300c-13 30-17 98-4 146"
            stroke="#4b4531"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M272 330c-17 22-18 78 3 102"
            stroke="url(#sdsh-rim)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* Long desert robe */}
        <path
          d="M171 279c-26 22-40 70-45 128-6 66-12 138-20 208-6 54-9 96-11 129 34 6 74 9 116 9s82-3 116-9c-2-33-5-75-11-129-8-70-14-142-20-208-5-58-19-106-45-128z"
          fill="url(#sdsh-body)"
        />
        <path
          d="M171 279c-26 22-40 70-45 128-6 66-12 138-20 208-6 54-9 96-11 129 34 6 74 9 116 9s82-3 116-9c-2-33-5-75-11-129-8-70-14-142-20-208-5-58-19-106-45-128z"
          fill="url(#sdsh-cloth)"
        />

        {/* Shoulder mantle */}
        <path
          d="M171 279c14-20 44-29 76-29s62 9 76 29c-6 16-22 26-38 30-14 4-26 5-38 5s-24-1-38-5c-16-4-32-14-38-30z"
          fill="#101109"
        />

        {/* Hood and head */}
        <path
          d="M183 262c-10-40-6-82 14-105 20-22 48-28 70-16 24 13 36 44 38 82 1 18-2 32-8 44-30 8-84 8-114-5z"
          fill="url(#sdsh-body)"
        />
        <path
          d="M196 241c-4-30 0-58 14-74 15-17 37-21 54-9 15 11 22 33 22 60 0 12-1 20-4 28-27 7-63 7-86-5z"
          fill="#060705"
        />
        <path
          d="M215 213c2 14 9 26 20 32 9 5 20 3 28-4"
          stroke="#f0d8a0"
          strokeOpacity="0.3"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Face wrap */}
        <path
          d="M196 246c26 10 60 10 92 2 5 8 8 16 9 24-34 10-76 10-106 0 1-9 3-18 5-26z"
          fill="#0b0c08"
        />

        {/* Raised arm folded across the chest */}
        <path
          d="M171 286c-20 18-24 48-12 70 9 16 25 24 39 20l14-8-16-30c-8 3-16-2-19-10-3-9 0-19 8-25z"
          fill="#121309"
        />
        <path
          d="M198 348c14-16 34-22 52-14l16 12c4 10-1 19-10 23-16 8-38 4-52-7z"
          fill="#141510"
        />
        {/* Final seal pose (hands clasped at the chest) */}
        <circle cx="252" cy="352" r="16" fill="#181a12" />
        <path
          d="M243 344c6-5 14-5 19 0M243 358c6 4 14 4 19 0"
          stroke="#3a3828"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Hanging arm */}
        <path
          d="M286 288c18 18 24 50 17 80-5 22-10 52-8 74l-26-4c-3-26 2-56 8-78 4-16 2-34-6-48z"
          fill="#131409"
        />

        {/* Sash */}
        <path
          d="M140 500c34-9 82-12 122-9 24 2 46 5 62 9l4 34c-20-5-44-8-68-9-38-2-84 1-116 9z"
          fill="#1f1f16"
        />

        {/* Wind-caught cloth tails */}
        <path
          d="M300 470c30 6 58 22 78 44-26 4-52 0-74-10z"
          fill="#12130b"
          opacity="0.9"
        />
        <path
          d="M296 512c22 10 40 26 52 46-22 0-42-8-58-22z"
          fill="#15160f"
          opacity="0.8"
        />

        {/* Desert rim light: the only strong values on the figure */}
        <g stroke="url(#sdsh-rim)" strokeLinecap="round" fill="none">
          <path
            d="M185 262c-10-40-6-80 13-102"
            strokeWidth="2.4"
            opacity="0.9"
          />
          <path
            d="M172 280c-25 23-39 70-44 128-6 64-12 138-20 206"
            strokeWidth="2"
            opacity="0.72"
          />
          <path d="M160 354c-9-17-7-39 7-56" strokeWidth="1.6" opacity="0.62" />
          <path
            d="M199 350c13-14 31-19 47-13"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d="M287 292c16 20 21 50 14 78"
            strokeWidth="1.4"
            opacity="0.4"
          />
        </g>
      </g>

      {/* Chakra gathering at the seal — CSS animates this, the SVG stays static */}
      <g className="sd-seal">
        <circle cx="252" cy="352" r="7" fill="#f6e3b4" opacity="0.92" />
        <circle
          className="sd-seal-ring"
          cx="252"
          cy="352"
          r="26"
          stroke="#e4c88f"
          strokeWidth="1.2"
          strokeDasharray="3 6"
          opacity="0.75"
        />
        <circle
          className="sd-seal-ring sd-seal-ring-2"
          cx="252"
          cy="352"
          r="41"
          stroke="#c9a35f"
          strokeWidth="0.9"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
