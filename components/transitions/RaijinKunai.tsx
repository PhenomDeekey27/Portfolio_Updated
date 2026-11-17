import type { SVGProps } from "react";

/**
 * Original Flying Thunder God kunai — a forged-metal study, not an icon.
 *
 * Drawn in the same 120 x 300 coordinate space as the previous artwork, so the
 * loader's 96 x 192 box, the transition's clamp() sizing and every `fr-*`
 * transform keep their existing anchors and timings. Only the illustration
 * changed.
 *
 * The realism comes from geometry and light rather than effects: a broad
 * three-facet blade with a true centre ridge, separate ground bevels and
 * forged glints, two swept side prongs with their own inner bevels, a machined
 * collar carrying an engraved seal, a cord-wrapped grip where every band has
 * its own top light and lower shadow, and a torus pommel ring with inner and
 * outer reflections. A single restrained rim light ties the metal to the
 * chakra colour of its context (cyan in the transition, warm gold in the boot
 * loader).
 *
 * Everything is static vector geometry. The transition animates only the
 * wrapper's transform/opacity, never the artwork, so nothing runs per frame.
 *
 * `idPrefix` keeps gradient ids unique when both instances are mounted at the
 * same time.
 */

type KunaiProps = SVGProps<SVGSVGElement> & {
  accent?: "cyan" | "gold";
  idPrefix?: string;
};

export function RaijinKunai({
  accent = "cyan",
  idPrefix = "fr",
  ...props
}: KunaiProps) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const rim = accent === "gold" ? "#f7dfae" : "#9aeafb";

  return (
    <svg
      viewBox="0 0 120 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        {/* Cylindrical steel across the blade: dark edge, broad specular band,
            cool bounce light, dark far edge. */}
        <linearGradient id={id("blade")} x1="34" y1="60" x2="86" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#020507" />
          <stop offset="5%" stopColor="#0a1116" />
          <stop offset="12%" stopColor="#25333c" />
          <stop offset="19%" stopColor="#5e7280" />
          <stop offset="26%" stopColor="#9fb2bd" />
          <stop offset="32%" stopColor="#d8e6ec" />
          <stop offset="37%" stopColor="#f4fbff" />
          <stop offset="43%" stopColor="#c3d2da" />
          <stop offset="50%" stopColor="#8496a1" />
          <stop offset="58%" stopColor="#4a5a65" />
          <stop offset="68%" stopColor="#26343d" />
          <stop offset="80%" stopColor="#111a20" />
          <stop offset="91%" stopColor="#050b0f" />
          <stop offset="100%" stopColor="#010304" />
        </linearGradient>

        {/* Left ground bevel: falls away from the ridge into shadow. */}
        <linearGradient id={id("bevelL")} x1="34" y1="60" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.92" />
          <stop offset="30%" stopColor="#01070a" stopOpacity="0.78" />
          <stop offset="62%" stopColor="#0d1a21" stopOpacity="0.45" />
          <stop offset="86%" stopColor="#8fa3ae" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#f2fbff" stopOpacity="0.3" />
        </linearGradient>

        {/* Right ground bevel: catches the key light, then falls to the edge. */}
        <linearGradient id={id("bevelR")} x1="60" y1="60" x2="86" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="14%" stopColor="#dceaf0" stopOpacity="0.3" />
          <stop offset="42%" stopColor="#8ba0ac" stopOpacity="0.16" />
          <stop offset="72%" stopColor="#0a1319" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
        </linearGradient>

        {/* Warm/cool variant used by the loader. */}
        <linearGradient id={id("bladeWarm")} x1="34" y1="60" x2="86" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#040506" />
          <stop offset="6%" stopColor="#141312" />
          <stop offset="14%" stopColor="#3c3833" />
          <stop offset="22%" stopColor="#8a8378" />
          <stop offset="30%" stopColor="#d3cabb" />
          <stop offset="37%" stopColor="#fdf8ee" />
          <stop offset="44%" stopColor="#d8cfc1" />
          <stop offset="52%" stopColor="#9a9184" />
          <stop offset="62%" stopColor="#5a544b" />
          <stop offset="74%" stopColor="#2b2823" />
          <stop offset="88%" stopColor="#0b0a09" />
          <stop offset="100%" stopColor="#020202" />
        </linearGradient>

        <linearGradient id={id("band")} x1="40" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#010305" />
          <stop offset="14%" stopColor="#1b252c" />
          <stop offset="30%" stopColor="#6c7d88" />
          <stop offset="42%" stopColor="#c6d5dd" />
          <stop offset="52%" stopColor="#eef7fb" />
          <stop offset="63%" stopColor="#8b9ba6" />
          <stop offset="78%" stopColor="#39464f" />
          <stop offset="92%" stopColor="#0c1318" />
          <stop offset="100%" stopColor="#010204" />
        </linearGradient>

        <linearGradient id={id("bandWarm")} x1="40" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#050403" />
          <stop offset="16%" stopColor="#332c23" />
          <stop offset="32%" stopColor="#948670" />
          <stop offset="44%" stopColor="#e9dcc4" />
          <stop offset="54%" stopColor="#fdf6e8" />
          <stop offset="66%" stopColor="#a89a84" />
          <stop offset="82%" stopColor="#463d31" />
          <stop offset="100%" stopColor="#070605" />
        </linearGradient>

        <linearGradient id={id("cord")} x1="46" y1="0" x2="74" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#050403" />
          <stop offset="12%" stopColor="#150f0a" />
          <stop offset="30%" stopColor="#2c2117" />
          <stop offset="48%" stopColor="#473425" />
          <stop offset="58%" stopColor="#54402e" />
          <stop offset="72%" stopColor="#33251a" />
          <stop offset="88%" stopColor="#150f0a" />
          <stop offset="100%" stopColor="#050403" />
        </linearGradient>

        <linearGradient id={id("cordShade")} x1="46" y1="0" x2="74" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.72" />
          <stop offset="22%" stopColor="#000000" stopOpacity="0.16" />
          <stop offset="58%" stopColor="#000000" stopOpacity="0" />
          <stop offset="84%" stopColor="#e8c79a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.42" />
        </linearGradient>

        <linearGradient id={id("ring")} x1="44" y1="264" x2="76" y2="296" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f6fbff" />
          <stop offset="12%" stopColor="#c3d2da" />
          <stop offset="26%" stopColor="#5d6b74" />
          <stop offset="40%" stopColor="#101920" />
          <stop offset="54%" stopColor="#8d9ba5" />
          <stop offset="68%" stopColor="#eef7fb" />
          <stop offset="82%" stopColor="#5f6d77" />
          <stop offset="94%" stopColor="#cddae2" />
          <stop offset="100%" stopColor="#1a242b" />
        </linearGradient>

        <radialGradient id={id("bloom")} cx="0.5" cy="0.46" r="0.52">
          <stop offset="0%" stopColor={rim} stopOpacity="0.2" />
          <stop offset="48%" stopColor={rim} stopOpacity="0.055" />
          <stop offset="100%" stopColor={rim} stopOpacity="0" />
        </radialGradient>

        {/* Brushed-steel striations, clipped to the blade silhouette. */}
        <pattern id={id("brush")} width="2.4" height="2.6" patternUnits="userSpaceOnUse">
          <path d="M0 0 H2.4" stroke="#ffffff" strokeWidth="0.4" opacity="0.12" />
          <path d="M0 1.4 H2.4" stroke="#000000" strokeWidth="0.32" opacity="0.12" />
        </pattern>

        <clipPath id={id("bladeClip")}>
          <path d="M60 6 C64 40 74 82 84 108 L86 120 L34 120 L36 108 C46 82 56 40 60 6 Z" />
        </clipPath>

        <linearGradient id={id("forge")} x1="36" y1="120" x2="84" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id={id("rimBlur")} x="-45%" y="-25%" width="190%" height="150%">
          <feGaussianBlur stdDeviation="1.15" />
        </filter>
      </defs>

      {/* restrained chakra bloom behind the metal */}
      <ellipse cx="60" cy="156" rx="46" ry="136" fill={`url(#${id("bloom")})`} />

      {/* ---------------- side prongs (behind the centre blade) -------- */}
      <g stroke="#020507" strokeWidth="0.85" strokeLinejoin="round">
        <path
          d="M52 122 C38 105 19 72 6 26 C16 47 27 66 36 82 C45 99 52 114 57 123 Z"
          fill={`url(#${id("blade")})`}
        />
        <path
          d="M68 122 C82 105 101 72 114 26 C104 47 93 66 84 82 C75 99 68 114 63 123 Z"
          fill={`url(#${id("blade")})`}
        />
      </g>
      {/* prong inner bevels: shadowed inner face / lit outer face */}
      <path
        d="M53 118 C42 100 28 72 12 36 C24 58 36 79 44 95 C49 106 54 114 56 119 Z"
        fill="#000000"
        opacity="0.4"
      />
      <path
        d="M67 118 C78 100 92 72 108 36 C96 58 84 79 76 95 C71 106 66 114 64 119 Z"
        fill="#ffffff"
        opacity="0.12"
      />
      {/* prong cutting edges */}
      <path d="M6 26 C19 72 38 105 52 122" stroke="#eaf7fc" strokeWidth="0.7" opacity="0.5" fill="none" strokeLinecap="round" />
      <path d="M114 26 C101 72 82 105 68 122" stroke="#cbe6ef" strokeWidth="0.6" opacity="0.28" fill="none" strokeLinecap="round" />
      <path d="M36 82 C45 99 52 114 57 123" stroke="#02060a" strokeWidth="0.7" opacity="0.8" fill="none" />
      <path d="M84 82 C75 99 68 114 63 123" stroke="#02060a" strokeWidth="0.7" opacity="0.8" fill="none" />

      {/* ---------------- centre blade -------------------------------- */}
      <path
        d="M60 6 C64 40 74 82 84 108 L86 120 L34 120 L36 108 C46 82 56 40 60 6 Z"
        fill={`url(#${id("blade")})`}
        stroke="#020608"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      {/* ground bevels */}
      <path
        d="M60 6 C56 40 46 82 36 108 L34 120 L60 120 Z"
        fill={`url(#${id("bevelL")})`}
      />
      <path
        d="M60 6 C64 40 74 82 84 108 L86 120 L60 120 Z"
        fill={`url(#${id("bevelR")})`}
      />
      {/* forged centre ridge */}
      <path d="M60 7 L60 119" stroke="#04090c" strokeWidth="1.5" opacity="0.55" />
      <path d="M60 7 L60 119" stroke="#f8fdff" strokeWidth="0.55" opacity="0.5" />
      <path d="M59.4 12 L59.4 118" stroke="#ffffff" strokeWidth="2.2" opacity="0.07" />
      {/* specular glints travelling down the ridge */}
      <path d="M61.2 24 L62.6 62 L61.6 96 L61 114 Z" fill="#ffffff" opacity="0.5" />
      <path d="M58.2 34 L57.6 78" stroke="#ffffff" strokeWidth="0.8" opacity="0.2" />
      <path d="M63.4 92 L64.4 116" stroke="#ffffff" strokeWidth="0.6" opacity="0.16" />
      {/* razor edges */}
      <path d="M60 6 C56 40 46 82 36 108" stroke="#f6fcff" strokeWidth="0.85" opacity="0.66" fill="none" />
      <path d="M60 6 C64 40 74 82 84 108" stroke="#dbedf5" strokeWidth="0.75" opacity="0.34" fill="none" />
      <path d="M34 120 L36 108" stroke="#f0f9ff" strokeWidth="0.6" opacity="0.3" />
      <path d="M86 120 L84 108" stroke="#f0f9ff" strokeWidth="0.5" opacity="0.18" />

      {/* brushed metal + a diagonal forge highlight across the facets */}
      <rect
        x="32"
        y="4"
        width="56"
        height="118"
        fill={`url(#${id("brush")})`}
        clipPath={`url(#${id("bladeClip")})`}
        opacity="0.65"
      />
      <path
        d="M44 118 L74 16 L86 16 L56 118 Z"
        fill={`url(#${id("forge")})`}
        clipPath={`url(#${id("bladeClip")})`}
        opacity="0.5"
      />

      {/* machined blade root */}
      <path d="M36 108 L84 108 L86 120 L34 120 Z" fill={`url(#${id("band")})`} opacity="0.95" stroke="#020507" strokeWidth="0.8" />
      <path d="M35 109.4 L85 109.4" stroke="#ffffff" strokeWidth="0.5" opacity="0.28" />
      <path d="M34 119 L86 119" stroke="#000000" strokeWidth="1.1" opacity="0.7" />

      {/* ---------------- guard / upper collar ------------------------ */}
      <ellipse cx="60" cy="124" rx="26" ry="3.4" fill="#000000" opacity="0.5" />
      <path
        d="M40 120 H80 L78 136 H42 Z"
        fill={`url(#${id("band")})`}
        stroke="#020507"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path d="M41 121.4 H79" stroke="#f4fbff" strokeWidth="0.8" opacity="0.45" />
      <path d="M42.4 135 H77.6" stroke="#020507" strokeWidth="1" opacity="0.7" />
      {/* chamfer */}
      <path d="M42 128 H78" stroke="#ffffff" strokeWidth="0.4" opacity="0.16" />

      {/* ---------------- collar body + engraved seal ----------------- */}
      <path
        d="M42 136 H78 L75.5 158 H44.5 Z"
        fill={`url(#${id("bandWarm")})`}
        stroke="#020507"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path d="M43 137.4 H77" stroke="#ffffff" strokeWidth="0.7" opacity="0.3" />
      <path d="M44.8 156.6 H75.2" stroke="#020507" strokeWidth="1" opacity="0.66" />
      <path d="M44 141.5 H76" stroke="#0a0f12" strokeWidth="0.7" opacity="0.5" />
      <path d="M44 140.9 H76" stroke="#ffffff" strokeWidth="0.35" opacity="0.16" />

      {/* engraved Flying Raijin seal */}
      <g transform="translate(60 148)">
        <circle r="7.2" fill="none" stroke="#05090b" strokeWidth="1.4" opacity="0.8" />
        <circle r="7.2" fill="none" stroke={rim} strokeWidth="0.4" opacity="0.4" />
        <circle r="5.2" fill="none" stroke="#05090b" strokeWidth="0.7" opacity="0.65" />
        <path d="M0 4.4 L3.1 -2.4 L0 -5.2 L-3.1 -2.4 Z" fill="none" stroke={rim} strokeWidth="0.75" opacity="0.8" />
        <path d="M-0.6 1.6 L-4.6 -1.4 M0.6 1.6 L4.6 -1.4" stroke={rim} strokeWidth="0.5" opacity="0.55" />
      </g>

      {/* ---------------- wrapped grip -------------------------------- */}
      <rect x="47" y="158" width="26" height="90" rx="2.6" fill={`url(#${id("cord")})`} />
      <g>
        {Array.from({ length: 12 }).map((_, i) => {
          const y = 160 + i * 7.4;
          const lit = i % 2 === 0;
          return (
            <g key={i}>
              <path
                d={`M47 ${y} L73 ${y + 3.4} L73 ${y + 7.4} L47 ${y + 4} Z`}
                fill={lit ? "#6f5233" : "#33251a"}
                opacity={lit ? 0.66 : 0.86}
              />
              {/* rounded cord top: catches the light */}
              <path
                d={`M47 ${y} L73 ${y + 3.4}`}
                stroke="#e7c79b"
                strokeWidth="0.7"
                opacity={lit ? 0.34 : 0.18}
              />
              <path
                d={`M47 ${y + 0.9} L73 ${y + 4.3}`}
                stroke="#ffffff"
                strokeWidth="0.35"
                opacity={lit ? 0.16 : 0.08}
              />
              {/* shadow tucked under each wrap */}
              <path
                d={`M47 ${y + 4} L73 ${y + 7.4}`}
                stroke="#050302"
                strokeWidth="1"
                opacity="0.85"
              />
            </g>
          );
        })}
      </g>
      {/* cylindrical shading + right-hand bounce light */}
      <rect x="47" y="158" width="26" height="90" fill={`url(#${id("cordShade")})`} />
      <path d="M51 168 C54 194 51 218 54 240" stroke="#d8b98c" strokeWidth="0.5" opacity="0.13" />
      <rect x="47" y="158" width="26" height="90" rx="2.6" fill="none" stroke="#050302" strokeWidth="1" />
      {/* grip ends */}
      <path d="M47 158.6 H73" stroke="#a98a5e" strokeWidth="0.8" opacity="0.24" />
      <path d="M47 247.2 H73" stroke="#050302" strokeWidth="1.4" opacity="0.8" />

      {/* ---------------- lower ferrule ------------------------------- */}
      <path
        d="M46 247 H74 L72 261 H48 Z"
        fill={`url(#${id("band")})`}
        stroke="#020507"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path d="M47 248.4 H73" stroke="#f4fbff" strokeWidth="0.75" opacity="0.4" />
      <path d="M48.6 259.6 H71.4" stroke="#020507" strokeWidth="1" opacity="0.7" />
      {/* neck */}
      <path d="M56 261 H64 L63 266 H57 Z" fill={`url(#${id("bandWarm")})`} stroke="#020507" strokeWidth="0.7" />

      {/* ---------------- pommel ring -------------------------------- */}
      <circle cx="60" cy="280" r="16" fill="none" stroke="#000000" strokeWidth="8.8" opacity="0.55" />
      <circle cx="60" cy="280" r="16" fill="none" stroke={`url(#${id("ring")})`} strokeWidth="6.2" />
      <circle cx="60" cy="280" r="16" fill="none" stroke="#020609" strokeWidth="0.65" opacity="0.7" />
      <circle cx="60" cy="280" r="12.7" fill="none" stroke="#000000" strokeWidth="1.3" opacity="0.6" />
      <path d="M46.2 273 A16 16 0 0 1 60 264" stroke="#ffffff" strokeWidth="1.4" opacity="0.55" fill="none" strokeLinecap="round" />
      <path d="M73.8 287 A16 16 0 0 1 60 296" stroke={rim} strokeWidth="1.1" opacity="0.42" fill="none" strokeLinecap="round" />
      <path d="M68.4 266.4 A16 16 0 0 1 75.2 276" stroke="#ffffff" strokeWidth="0.6" opacity="0.28" fill="none" strokeLinecap="round" />
      <path d="M51.6 293.6 A16 16 0 0 1 44.8 284" stroke="#000000" strokeWidth="1" opacity="0.4" fill="none" strokeLinecap="round" />

      {/* ---------------- restrained chakra rim light ----------------- */}
      <path
        d="M60 8 C56 41 46 83 36.4 107 M53 121 C39 104 20 71 7.4 29"
        stroke={rim}
        strokeWidth="1.6"
        opacity="0.55"
        fill="none"
        filter={`url(#${id("rimBlur")})`}
      />
      <path
        d="M60 9 C56.4 42 46.6 84 36.8 106 M52 119 C38 102 20 70 8.6 33"
        stroke={rim}
        strokeWidth="0.55"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M44 280 A16 16 0 0 0 52 294"
        stroke={rim}
        strokeWidth="0.65"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M75 273 A16 16 0 0 1 76.4 286"
        stroke="#ffffff"
        strokeWidth="0.5"
        opacity="0.18"
        fill="none"
      />
    </svg>
  );
}
