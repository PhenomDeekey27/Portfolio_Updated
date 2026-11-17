type MissionCoverProps = {
  variant: "automation" | "outreach" | "emergency";
  alt: string;
};

const GOLD = "#c9a35f";
const GOLD_SOFT = "#e4c88f";
const PAPER = "#d8c39a";

function LeafWatermark({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="none"
      stroke={GOLD}
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.28"
    >
      <path d="M1 16C-11 13-18 3-15-7c3-10 13-15 22-11 6 3 9 9 7 15-1 5-6 8-11 6-4-1-5-5-3-8 1-2 4-3 6-1" />
      <path d="M17 3c5 9 3 18-4 24" />
    </g>
  );
}

function AutomationCover({ alt }: { alt: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="auto-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b130e" />
          <stop offset="0.55" stopColor="#08100c" />
          <stop offset="1" stopColor="#0a0907" />
        </linearGradient>
        <radialGradient id="auto-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.28" />
          <stop offset="0.5" stopColor={GOLD} stopOpacity="0.06" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="auto-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PAPER} stopOpacity="0.2" />
          <stop offset="1" stopColor={PAPER} stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="auto-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_SOFT} stopOpacity="0.14" />
          <stop offset="1" stopColor={GOLD_SOFT} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#auto-bg)" />
      <ellipse cx="130" cy="80" rx="360" ry="270" fill="url(#auto-glow)" />
      <polygon points="0,500 800,500 800,210 0,390" fill="url(#auto-light)" />

      {/* map-like contour lines */}
      <g fill="none" stroke={GOLD} strokeWidth="1" opacity="0.12">
        <path d="M-20 150c90-48 160-42 224-10s144 32 226-8 170-36 250 4 120 26 160 6" />
        <path d="M-30 188c100-46 172-36 236-2s142 26 216-12 166-32 246 8 116 24 166 0" />
        <path d="M-20 344c94 34 170 20 232-6s146-20 222 8 158 24 238-8 112-22 158-4" />
        <path d="M-10 382c94 28 168 16 230-8s148-18 224 8 156 20 236-10 108-18 150-2" />
        <path d="M-30 420c94 22 168 12 230-10s148-14 224 10 156 16 236-12 108-14 150 0" />
      </g>

      {/* briefing sheet */}
      <g transform="rotate(-3 410 280)">
        <rect
          x="190"
          y="154"
          width="432"
          height="286"
          rx="3"
          fill="url(#auto-paper)"
          stroke={GOLD}
          strokeOpacity="0.3"
        />
        <g stroke={GOLD} strokeOpacity="0.12" strokeWidth="1">
          <path d="M218 194h376M218 224h376M218 254h376M218 284h376M218 314h376M218 344h376M218 374h376" />
          <path d="M254 176v242M310 176v242M366 176v242M422 176v242M478 176v242M534 176v242M590 176v242" />
        </g>
        <path
          d="M236 390c52-30 86-90 140-92 52-2 76 44 120 38 42-6 62-64 104-74"
          fill="none"
          stroke={GOLD_SOFT}
          strokeOpacity="0.2"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </g>

      {/* connections */}
      <g fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" opacity="0.62">
        <path d="M352 250c40-46 74-60 112-56" />
        <path d="M352 250c52 2 88 10 122 30" />
        <path d="M352 250c-38-36-74-44-112-36" />
        <path d="M352 250c-30 48-64 68-106 76" />
        <path d="M352 250c44 42 78 52 118 54" />
      </g>
      <g fill={GOLD_SOFT} opacity="0.7">
        <circle cx="408" cy="226" r="3" />
        <circle cx="432" cy="264" r="3" />
        <circle cx="292" cy="230" r="3" />
        <circle cx="300" cy="294" r="3" />
        <circle cx="410" cy="288" r="3" />
      </g>

      {/* CRM hub */}
      <g transform="translate(352 250)">
        <circle r="42" fill="#0a120d" stroke={GOLD} strokeOpacity="0.42" />
        <circle r="32" fill="none" stroke={GOLD} strokeOpacity="0.22" />
        <g stroke={GOLD_SOFT} strokeWidth="1.6" fill="none">
          <ellipse cx="0" cy="-13" rx="13" ry="5" />
          <path d="M-13-13v25c0 3 6 5 13 5s13-2 13-5v-25" />
          <path d="M-13-2c0 3 6 5 13 5s13-2 13-5" />
        </g>
      </g>

      {/* channel nodes */}
      {[
        { x: 468, y: 194, type: "mail" },
        { x: 478, y: 280, type: "chat" },
        { x: 238, y: 214, type: "card" },
        { x: 244, y: 326, type: "doc" },
        { x: 474, y: 350, type: "drive" },
      ].map((node) => (
        <g key={`${node.x}-${node.y}`} transform={`translate(${node.x} ${node.y})`}>
          <circle r="27" fill="#0a120d" stroke={GOLD} strokeOpacity="0.34" />
          <circle r="21" fill="#0e1712" stroke={GOLD} strokeOpacity="0.14" />
          {node.type === "mail" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <rect x="-10" y="-7" width="20" height="14" rx="1.5" />
              <path d="m-10-6 10 8 10-8" />
            </g>
          ) : null}
          {node.type === "chat" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <path d="M-11-8h22v14H-1l-6 5v-5h-4z" strokeLinejoin="round" />
              <path d="M-5-2h10M-5 2h6" />
            </g>
          ) : null}
          {node.type === "card" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <rect x="-11" y="-7" width="22" height="14" rx="2" />
              <path d="M-11-1h22M-6 3h5" />
            </g>
          ) : null}
          {node.type === "doc" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <path d="M-7-11h9l5 5v17h-14z" />
              <path d="M2-11v5h5M-3-1h6M-3 3h6M-3 7h4" />
            </g>
          ) : null}
          {node.type === "drive" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5" strokeLinejoin="round">
              <path d="M0-10 12 10H-12Z" />
              <path d="M0-3 7 9h-14z" />
            </g>
          ) : null}
        </g>
      ))}

      {/* document stack */}
      <g transform="translate(672 392) rotate(-8)" stroke={GOLD} strokeOpacity="0.35" fill="#0b130e">
        <rect x="-44" y="-28" width="96" height="62" rx="2" />
        <rect x="-40" y="-24" width="96" height="62" rx="2" fill="#0e1712" />
        <g stroke={GOLD} strokeOpacity="0.18">
          <path d="M-28-8h52M-28 2h64M-28 12h44M-28 22h58" />
        </g>
      </g>

      <circle cx="688" cy="114" r="31" fill="none" stroke={GOLD} strokeOpacity="0.2" />
      <LeafWatermark x={688} y={114} scale={0.9} />
    </svg>
  );
}

function OutreachCover({ alt }: { alt: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="out-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b130e" />
          <stop offset="0.6" stopColor="#08100c" />
          <stop offset="1" stopColor="#0a0907" />
        </linearGradient>
        <radialGradient id="out-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.26" />
          <stop offset="0.5" stopColor={GOLD} stopOpacity="0.05" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="out-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_SOFT} stopOpacity="0.12" />
          <stop offset="1" stopColor={GOLD_SOFT} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#out-bg)" />
      <ellipse cx="670" cy="110" rx="350" ry="270" fill="url(#out-glow)" />
      <polygon points="0,500 800,500 800,180 0,360" fill="url(#out-light)" />

      <g fill="none" stroke={GOLD} strokeWidth="1" opacity="0.1">
        <path d="M-20 120c100-30 180-18 250 20s150 34 230-4 170-28 250 12 96 18 130 2" />
        <path d="M-20 158c100-26 180-12 250 24s150 30 230-8 170-24 250 14 96 14 130-2" />
        <path d="M-20 420c100 24 180 14 250-18s150-26 230 8 170 22 250-16 96-12 130 0" />
        <path d="M-20 458c100 20 180 10 250-20s150-22 230 10 170 18 250-18 96-10 130 2" />
      </g>

      {/* central hub with channels */}
      <g transform="translate(400 245)">
        <circle r="104" fill="none" stroke={GOLD} strokeOpacity="0.14" strokeDasharray="2 7" />
        <circle r="78" fill="none" stroke={GOLD} strokeOpacity="0.2" />
        <circle r="56" fill="#0b130e" stroke={GOLD} strokeOpacity="0.4" />
        <circle r="36" fill="#0e1712" stroke={GOLD} strokeOpacity="0.22" />
        <circle r="9" fill={GOLD_SOFT} opacity="0.8" />
        <g stroke={GOLD_SOFT} strokeOpacity="0.5" fill="none" strokeWidth="1.2">
          <path d="M0-56V-78M0 56v22M-56 0h-22M56 0h22" />
        </g>
      </g>

      {/* spoke lines */}
      <g fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" opacity="0.58">
        <path d="M296 245c-34-54-66-72-106-76" />
        <path d="M296 245c-34-4-64-4-94 4" />
        <path d="M296 245c-32 48-58 68-96 84" />
        <path d="M504 245c34-54 66-72 106-76" />
        <path d="M504 245c34-4 64-4 94 4" />
        <path d="M504 245c32 48 58 68 96 84" />
      </g>

      {/* channel nodes left */}
      {[
        { x: 190, y: 169, type: "mail" },
        { x: 200, y: 249, type: "chat" },
        { x: 200, y: 329, type: "telegram" },
        { x: 610, y: 169, type: "voice" },
        { x: 600, y: 249, type: "user" },
        { x: 600, y: 329, type: "doc" },
      ].map((node) => (
        <g key={`${node.x}-${node.y}`} transform={`translate(${node.x} ${node.y})`}>
          <circle r="29" fill="#0a120d" stroke={GOLD} strokeOpacity="0.34" />
          <circle r="22" fill="#0e1712" stroke={GOLD} strokeOpacity="0.14" />
          {node.type === "mail" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <rect x="-10" y="-7" width="20" height="14" rx="1.5" />
              <path d="m-10-6 10 8 10-8" />
            </g>
          ) : null}
          {node.type === "chat" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <path d="M-11-8h22v14H-1l-6 5v-5h-4z" strokeLinejoin="round" />
              <path d="M-5-2h10M-5 2h6" />
            </g>
          ) : null}
          {node.type === "telegram" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5" strokeLinejoin="round">
              <path d="M-11-7 12-11 5 11-2 5l-4 3-2-6z" />
              <path d="m-2 5 5-7" />
            </g>
          ) : null}
          {node.type === "voice" ? (
            <g stroke={GOLD_SOFT} strokeWidth="2" strokeLinecap="round">
              <path d="M-10 0v0M-6-6v12M-2-11v22M2-7v14M6-12v24M10-4v8" />
            </g>
          ) : null}
          {node.type === "user" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <circle cx="0" cy="-5" r="5" />
              <path d="M-10 12c2-8 16-8 20 0" />
            </g>
          ) : null}
          {node.type === "doc" ? (
            <g fill="none" stroke={GOLD_SOFT} strokeWidth="1.5">
              <path d="M-7-11h9l5 5v17h-14z" />
              <path d="M2-11v5h5M-3-1h6M-3 3h6M-3 7h4" />
            </g>
          ) : null}
        </g>
      ))}

      {/* lead pipeline cards */}
      <g transform="translate(662 406) rotate(-5)" fill="#0b130e" stroke={GOLD} strokeOpacity="0.3">
        <rect x="-46" y="-24" width="98" height="50" rx="2" />
        <rect x="-52" y="-30" width="98" height="50" rx="2" fill="#0e1712" />
        <g stroke={GOLD} strokeOpacity="0.2">
          <circle cx="-32" cy="-10" r="5" />
          <path d="M-22-14h38M-22-6h28M-22 0h34" />
        </g>
      </g>

      {/* waveform strip */}
      <g transform="translate(400 438)" stroke={GOLD_SOFT} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 25 }).map((_, i) => {
          const height = 4 + Math.abs(Math.sin(i * 0.65)) * 18;
          return <path key={i} d={`M${i * 12 - 144} ${-height / 2}v${height}`} />;
        })}
      </g>

      <circle cx="114" cy="110" r="31" fill="none" stroke={GOLD} strokeOpacity="0.2" />
      <LeafWatermark x={114} y={110} scale={0.9} />
    </svg>
  );
}

function EmergencyCover({ alt }: { alt: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="resq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b130e" />
          <stop offset="0.6" stopColor="#08100c" />
          <stop offset="1" stopColor="#0a0907" />
        </linearGradient>
        <radialGradient id="resq-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.3" />
          <stop offset="0.5" stopColor={GOLD} stopOpacity="0.06" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="resq-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#122019" />
          <stop offset="1" stopColor="#08100c" />
        </linearGradient>
        <linearGradient id="resq-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_SOFT} stopOpacity="0.14" />
          <stop offset="1" stopColor={GOLD_SOFT} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#resq-bg)" />
      <ellipse cx="400" cy="260" rx="340" ry="290" fill="url(#resq-glow)" />
      <polygon points="0,500 800,500 800,170 0,330" fill="url(#resq-light)" />

      {/* topographic field */}
      <g fill="none" stroke={GOLD} strokeWidth="1" opacity="0.13">
        <path d="M-40 100c120-50 230-30 320 30s210 50 300 0 170-40 260 10" />
        <path d="M-40 138c120-44 226-20 316 36s206 42 296-4 170-34 260 14" />
        <path d="M-40 176c120-38 222-10 312 40s202 34 292-8 170-28 260 18" />
        <path d="M-40 360c120 34 222 16 312-26s202-34 292 6 170 24 260-18" />
        <path d="M-40 398c120 28 222 12 312-28s202-30 292 8 170 20 260-20" />
        <path d="M-40 436c120 22 222 8 312-30s202-26 292 10 170 16 260-22" />
      </g>

      {/* beacon rings */}
      <g transform="translate(400 262)" fill="none" stroke={GOLD} strokeOpacity="0.22">
        <circle r="72" strokeDasharray="2 7" />
        <circle r="132" opacity="0.65" />
        <circle r="198" opacity="0.3" />
        <circle r="262" opacity="0.14" />
      </g>

      {/* road curve */}
      <path
        d="M60 470c120-96 220-88 300-12s190 58 380-46"
        fill="none"
        stroke={GOLD_SOFT}
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeDasharray="7 9"
      />

      {/* phone */}
      <g transform="translate(330 82) rotate(4 95 170)">
        <rect x="0" y="0" width="190" height="340" rx="30" fill="#070d09" stroke={GOLD} strokeOpacity="0.45" strokeWidth="1.6" />
        <rect x="9" y="10" width="172" height="320" rx="23" fill="url(#resq-screen)" stroke={GOLD} strokeOpacity="0.15" />
        <rect x="70" y="16" width="50" height="5" rx="2.5" fill={GOLD} opacity="0.24" />

        {/* status icons */}
        <g fill={GOLD_SOFT} opacity="0.35">
          <rect x="22" y="34" width="22" height="4" rx="2" />
          <rect x="154" y="34" width="8" height="4" rx="2" />
          <rect x="166" y="34" width="8" height="4" rx="2" />
        </g>

        {/* location beacon */}
        <g transform="translate(95 154)">
          <circle r="52" fill={GOLD} opacity="0.06" />
          <circle r="38" fill="none" stroke={GOLD} strokeOpacity="0.35" strokeDasharray="3 5" />
          <circle r="26" fill="none" stroke={GOLD} strokeOpacity="0.5" />
          <path d="M0-16c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14Z" fill="#101d16" stroke={GOLD_SOFT} strokeWidth="1.6" />
          <circle cx="0" cy="-2" r="4" fill={GOLD_SOFT} opacity="0.8" />
        </g>

        {/* confirmation panel */}
        <g transform="translate(30 222)">
          <rect x="0" y="0" width="130" height="44" rx="5" fill="#0d1811" stroke={GOLD} strokeOpacity="0.28" />
          <circle cx="17" cy="22" r="7" fill="none" stroke={GOLD_SOFT} strokeWidth="1.5" />
          <path d="m13 22 3 3 5-6" fill="none" stroke={GOLD_SOFT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <g stroke={GOLD_SOFT} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round">
            <path d="M33 18h72M33 27h49" />
          </g>
        </g>

        {/* sensor waveform */}
        <g transform="translate(25 300)" stroke={GOLD_SOFT} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round">
          {Array.from({ length: 20 }).map((_, i) => {
            const height = 4 + Math.abs(Math.sin(i * 0.72)) * 14;
            return <path key={i} d={`M${i * 7 + 2} ${-height / 2}v${height}`} />;
          })}
        </g>
        <path d="M30 324h130" stroke={GOLD} strokeOpacity="0.2" />
      </g>

      {/* signal arcs */}
      <g transform="translate(400 262)" fill="none" stroke={GOLD_SOFT} strokeOpacity="0.28" strokeLinecap="round">
        <path d="M-70-52c-30 32-30 72 0 104" />
        <path d="M70-52c30 32 30 72 0 104" />
        <path d="M-94-72c-42 44-42 100 0 144" opacity="0.5" />
        <path d="M94-72c42 44 42 100 0 144" opacity="0.5" />
      </g>

      <circle cx="668" cy="108" r="31" fill="none" stroke={GOLD} strokeOpacity="0.2" />
      <LeafWatermark x={668} y={108} scale={0.9} />
    </svg>
  );
}

export default function MissionCover({ variant, alt }: MissionCoverProps) {
  if (variant === "automation") return <AutomationCover alt={alt} />;
  if (variant === "outreach") return <OutreachCover alt={alt} />;
  return <EmergencyCover alt={alt} />;
}
