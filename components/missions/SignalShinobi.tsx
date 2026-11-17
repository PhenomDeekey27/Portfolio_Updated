/**
 * Original ink-silhouette stand-in for Shadow Network.
 *
 * A low, forward crouch: one hand raised to the ear, the other extended toward
 * the node field. The signal rings are scene decoration layered at the raised
 * hand; the figure stays a static SVG.
 */
type Props = { className?: string };

export default function SignalShinobi({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 460 900"
      fill="none"
      role="img"
      aria-label="Silhouette of a shadow-network shinobi in a low crouch, one hand at the ear and one arm extended"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="signal-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8fc7a8" stopOpacity="0.2" />
          <stop offset="58%" stopColor="#5f8f78" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#5f8f78" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="signal-body" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#16201a" />
          <stop offset="52%" stopColor="#0b110d" />
          <stop offset="100%" stopColor="#060907" />
        </linearGradient>
        <linearGradient id="signal-cloak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2620" />
          <stop offset="100%" stopColor="#070b08" />
        </linearGradient>
        <linearGradient id="signal-rim" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#e9f7ee" stopOpacity="0.9" />
          <stop offset="46%" stopColor="#a7d4b9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5f8f78" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="signal-fadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="64%" stopColor="#ffffff" />
          <stop offset="88%" stopColor="#8a8a8a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>
        <mask id="signal-fade">
          <rect width="460" height="900" fill="url(#signal-fadeGrad)" />
        </mask>
      </defs>

      <ellipse cx="230" cy="340" rx="188" ry="250" fill="url(#signal-halo)" />

      <g mask="url(#signal-fade)">
        {/* Cloak thrown out behind the crouch */}
        <path
          d="M258 402c50 4 98 26 132 60-30 4-56 16-74 34 30 8 56 24 74 48-36 0-66 8-90 24 20 14 34 32 42 54-48-10-92-2-128 22z"
          fill="url(#signal-cloak)"
          opacity="0.9"
        />
        <path
          d="M262 404c48 6 92 28 124 62-26 6-48 18-64 36"
          stroke="#a7d4b9"
          strokeOpacity="0.14"
          strokeWidth="1.3"
          fill="none"
        />

        {/* Bent legs, weight low */}
        <path
          d="M188 566c-26 52-44 104-54 156l-8 58c26 10 54 16 82 16l10-10-6-56c-4-46 4-92 22-138z"
          fill="url(#signal-body)"
        />
        <path
          d="M252 560c10 54 30 100 58 138l32 44c26-12 44-30 54-52l-10-12-46-34c-30-30-52-64-64-100z"
          fill="url(#signal-body)"
        />
        <path
          d="M150 716c-4 22-8 40-12 54 28 12 54 18 80 16"
          stroke="#a7d4b9"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Leaning torso */}
        <path
          d="M198 288c-34 30-46 86-38 148l16 134 108 20 18-140c6-64-4-116-40-152z"
          fill="url(#signal-body)"
        />
        <path
          d="M198 288c-34 30-46 86-38 148l16 134 108 20 18-140c6-64-4-116-40-152z"
          fill="url(#signal-cloak)"
          opacity="0.5"
        />

        {/* Shoulder mantle */}
        <path
          d="M196 286c18-18 44-26 70-24 26 2 48 14 62 32-10 16-28 24-46 26-16 2-30 1-42-1s-26-6-38-12c-10-5-16-12-6-21z"
          fill="#101813"
        />

        {/* Hood and head, turned toward the signal */}
        <path
          d="M204 274c-12-40-8-78 14-98 22-20 54-18 76 4 20 22 26 58 20 96-34 12-80 12-110-2z"
          fill="url(#signal-body)"
        />
        <path
          d="M214 254c-2-24 6-44 20-54 16-11 36-7 48 8 10 13 12 30 10 48-26 8-56 8-78-2z"
          fill="#050806"
        />
        <path
          d="M214 262c28 10 58 10 90 0 5 8 7 15 8 22-34 10-74 10-104 0 1-8 3-15 6-22z"
          fill="#09100b"
        />

        {/* Raised hand at the ear */}
        <path
          d="M274 300c18 2 30 16 34 34l-30 10-22-32z"
          fill="#111a14"
        />
        <path
          d="M286 326c10-4 20 2 22 12 2 10-5 18-15 18l-14 0-6-22z"
          fill="#17241c"
        />

        {/* Extended pointing arm toward the node field */}
        <path
          d="M232 344c26 6 54 20 80 42l-18 26c-24-18-50-30-76-36z"
          fill="#121d16"
        />
        <path
          d="M296 384c11-2 21 4 23 14 2 9-4 17-13 19l-14 2-10-24z"
          fill="#19261e"
        />

        {/* Folded lower arm */}
        <path
          d="M210 352c-16 12-20 34-10 50 8 14 24 18 38 12l6-18c-10 4-20 0-24-8-4-9-2-19 5-26z"
          fill="#0f1812"
        />

        {/* Sash */}
        <path
          d="M164 486c38-8 84-10 118-6l4 28c-36-4-80-2-116 6z"
          fill="#1c271f"
        />

        {/* Cool rim light */}
        <g stroke="url(#signal-rim)" strokeLinecap="round" fill="none">
          <path d="M208 272c-12-40-8-76 12-96" strokeWidth="2.2" opacity="0.85" />
          <path
            d="M198 294c-32 32-42 86-35 146l16 128"
            strokeWidth="1.8"
            opacity="0.6"
          />
          <path d="M190 368c-4-16 0-34 10-46" strokeWidth="1.4" opacity="0.45" />
          <path
            d="M234 346c26 6 52 20 76 40"
            strokeWidth="1.6"
            opacity="0.6"
          />
          <path d="M286 330c8-4 16 0 20 8" strokeWidth="1.4" opacity="0.5" />
        </g>
      </g>

      {/* Signal pulse at the raised hand — CSS animates this group */}
      <g className="nw-pulse">
        <circle cx="296" cy="338" r="5" fill="#d9f2e2" opacity="0.9" />
        <circle
          className="nw-pulse-ring"
          cx="296"
          cy="338"
          r="18"
          stroke="#a7d4b9"
          strokeWidth="1.1"
          opacity="0.7"
        />
        <circle
          className="nw-pulse-ring nw-pulse-ring-2"
          cx="296"
          cy="338"
          r="30"
          stroke="#5f8f78"
          strokeWidth="0.9"
          opacity="0.45"
        />
      </g>
    </svg>
  );
}
