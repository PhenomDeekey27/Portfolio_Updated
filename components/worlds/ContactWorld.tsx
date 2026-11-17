"use client";

import { useEffect, useRef, useState } from "react";
import {
  environmentAssetTag,
  getSectionEnvironment,
} from "@/lib/worlds/environments";

const ENV = getSectionEnvironment("contact");
const ASSET = environmentAssetTag(ENV);

/**
 * HOKAGE COMMUNICATION CHAMBER — the Contact section environment.
 *
 * A Hidden Leaf communication room at dusk: layered wooden architecture, a
 * large window over the village, warm lantern pools and restrained crimson.
 * Drawn from vector geometry and gradients (no raster plate, no WebGL, no
 * per-frame React state), so it stays crisp at every viewport and costs one
 * composited layer.
 *
 * The painted cinematic plate is optional: when one is approved, drop it in at
 * `public/assets/contact/hokage-chamber-cinematic.png`, switch the registry
 * entry for `contact` to `kind: "plate"` with that path, and this component
 * falls back to its CSS gradient automatically. Until then the vector chamber
 * IS the environment — nothing is borrowed from another section.
 *
 * Brief for that plate: docs/contact-chamber-image-brief.md
 */
export default function ContactWorld() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.02, rootMargin: "20% 0% 20% 0%" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-contact-world
      data-world-asset={ASSET}
      className="ctc-world pointer-events-none absolute inset-0 overflow-clip"
    >
      <div className="ctc-band">
        <svg
          className="ctc-scene"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="ctc-wall" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#1c1610" />
              <stop offset="0.55" stopColor="#15100b" />
              <stop offset="1" stopColor="#0a0705" />
            </linearGradient>
            <linearGradient id="ctc-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d1a30" />
              <stop offset="0.34" stopColor="#22314e" />
              <stop offset="0.62" stopColor="#5d4c47" />
              <stop offset="0.82" stopColor="#a8763d" />
              <stop offset="1" stopColor="#d9a154" />
            </linearGradient>
            <radialGradient id="ctc-moon" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#fff8e6" />
              <stop offset="0.55" stopColor="#f6e3bd" />
              <stop offset="1" stopColor="#d9b781" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="ctc-wood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3a2b1c" />
              <stop offset="0.42" stopColor="#241a11" />
              <stop offset="1" stopColor="#160f09" />
            </linearGradient>
            <linearGradient id="ctc-sill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a3724" />
              <stop offset="1" stopColor="#1b130c" />
            </linearGradient>
            <linearGradient id="ctc-desk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#241a11" />
              <stop offset="1" stopColor="#0b0805" />
            </linearGradient>
            <linearGradient id="ctc-parchment" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#efe3c6" />
              <stop offset="1" stopColor="#c7b083" />
            </linearGradient>
            <radialGradient id="ctc-lantern" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffd79a" stopOpacity="0.72" />
              <stop offset="0.42" stopColor="#f0a95e" stopOpacity="0.22" />
              <stop offset="1" stopColor="#f0a95e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ctc-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe3b4" stopOpacity="0.16" />
              <stop offset="1" stopColor="#ffe3b4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ctc-mist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8c39a" stopOpacity="0" />
              <stop offset="0.5" stopColor="#e6d3ab" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e6d3ab" stopOpacity="0" />
            </linearGradient>
            <clipPath id="ctc-pane">
              <rect x="548" y="104" width="844" height="572" rx="3" />
            </clipPath>
          </defs>

          {/* Wooden wall behind everything. */}
          <rect width="1600" height="900" fill="url(#ctc-wall)" />
          <g opacity="0.18" stroke="#5a452e" strokeWidth="1">
            <path d="M80 0v900M240 0v900M400 0v900M1560 0v900" />
          </g>

          {/* Structural posts: two vertical beams frame the window and give the
              wall real carpentry instead of a flat plate. */}
          <g>
            <rect x="212" y="60" width="30" height="840" fill="url(#ctc-wood)" />
            <rect x="212" y="60" width="3" height="840" fill="#c9a35f" opacity="0.16" />
            <rect x="1338" y="60" width="30" height="840" fill="url(#ctc-wood)" />
            <rect x="1365" y="60" width="3" height="840" fill="#c9a35f" opacity="0.1" />
          </g>

          {/* Warm light falling out of the window onto the floor boards. */}
          <path
            d="M400 700 L1200 700 L1330 900 L262 900 Z"
            fill="url(#ctc-beam)"
            opacity="0.85"
          />

          {/* Ceiling beams. */}
          <g>
            <rect x="0" y="0" width="1600" height="52" fill="url(#ctc-wood)" />
            <rect x="0" y="52" width="1600" height="8" fill="#0a0705" opacity="0.85" />
            <rect x="0" y="12" width="1600" height="3" fill="#c9a35f" opacity="0.14" />
          </g>

          {/* ---------------------------------------------------------------
              The window: village at dusk. Shifted left of centre so the
              village view stays visible beside the transmission scroll on
              desktop instead of hiding behind it.
          ---------------------------------------------------------------- */}
          <g transform="translate(-150 0)">
          <g clipPath="url(#ctc-pane)">
            <rect x="548" y="104" width="844" height="572" fill="url(#ctc-sky)" />

            {/* Moon and its halo. */}
            <ellipse cx="1290" cy="216" rx="150" ry="104" fill="url(#ctc-lantern)" opacity="0.9" />
            <circle cx="1290" cy="216" r="56" fill="url(#ctc-moon)" />
            <circle cx="1290" cy="216" r="56" fill="none" stroke="#fff8e6" strokeWidth="1" opacity="0.4" />

            {/* Stars — deterministic scatter. */}
            <g fill="#f5efe2" opacity="0.5">
              <circle cx="640" cy="168" r="1.6" />
              <circle cx="712" cy="132" r="1.2" />
              <circle cx="824" cy="186" r="1.5" />
              <circle cx="936" cy="144" r="1.1" />
              <circle cx="1012" cy="196" r="1.4" />
              <circle cx="1320" cy="158" r="1.3" />
              <circle cx="1372" cy="248" r="1.6" />
            </g>

            {/* Far range. */}
            <path
              d="M548 452 L640 372 L712 418 L806 344 L900 420 L982 366 L1082 438 L1180 380 L1280 442 L1392 396 L1392 476 L548 476 Z"
              fill="#0e1826"
              opacity="0.92"
            />
            {/* Mid range. */}
            <path
              d="M548 486 L660 424 L760 470 L864 412 L980 476 L1090 428 L1200 480 L1310 438 L1392 482 L1392 520 L548 520 Z"
              fill="#0a111b"
            />
            {/* Hokage cliff with the carved faces, held abstract. */}
            <path d="M548 340 L676 316 L700 470 L548 492 Z" fill="#070c13" />
            <g fill="#0d151f" opacity="0.9">
              <rect x="566" y="352" width="26" height="64" rx="4" />
              <rect x="600" y="346" width="28" height="70" rx="4" />
              <rect x="636" y="342" width="26" height="72" rx="4" />
            </g>

            {/* Village roofs, nearest row carrying the warm windows. */}
            <ellipse cx="900" cy="552" rx="430" ry="72" fill="#f0b46a" opacity="0.13" />
            <g>
              <path
                d="M548 560 L600 522 L652 560 L704 518 L756 560 L808 516 L860 560 L912 520 L964 560 L1016 514 L1068 560 L1120 518 L1172 560 L1224 516 L1276 560 L1328 520 L1392 560 L1392 676 L548 676 Z"
                fill="#080d12"
              />
              <path
                d="M548 604 L618 566 L688 604 L758 562 L828 604 L898 564 L968 604 L1038 560 L1108 604 L1178 566 L1248 604 L1318 564 L1392 604 L1392 676 L548 676 Z"
                fill="#050809"
              />
              {/* Vertical building edges break the roofline into houses. */}
              <g stroke="#020405" strokeWidth="3" opacity="0.85">
                <path d="M652 560v116M756 560v116M860 560v116M964 560v116M1068 560v116M1172 560v116M1276 560v116" />
              </g>
              <g fill="#ffcf8a" opacity="0.8">
                <rect x="596" y="580" width="7" height="9" rx="1" />
                <rect x="640" y="592" width="6" height="8" rx="1" />
                <rect x="726" y="578" width="7" height="9" rx="1" />
                <rect x="782" y="594" width="6" height="8" rx="1" />
                <rect x="844" y="576" width="7" height="9" rx="1" />
                <rect x="918" y="590" width="6" height="8" rx="1" />
                <rect x="980" y="578" width="7" height="9" rx="1" />
                <rect x="1044" y="592" width="6" height="8" rx="1" />
                <rect x="1112" y="578" width="7" height="9" rx="1" />
                <rect x="1186" y="590" width="6" height="8" rx="1" />
                <rect x="1252" y="578" width="7" height="9" rx="1" />
              </g>
            </g>

            {/* Horizon haze. */}
            <rect x="548" y="496" width="844" height="90" fill="url(#ctc-mist)" />

            {/* Warm light spilling from the village into the room. */}
            <rect
              x="548"
              y="104"
              width="844"
              height="572"
              fill="url(#ctc-lantern)"
              opacity="0.35"
            />
          </g>

          {/* Window frame and shoji grid. */}
          <g>
            <rect
              x="524"
              y="80"
              width="892"
              height="620"
              rx="6"
              fill="none"
              stroke="url(#ctc-wood)"
              strokeWidth="26"
            />
            <rect
              x="524"
              y="80"
              width="892"
              height="620"
              rx="6"
              fill="none"
              stroke="#c9a35f"
              strokeWidth="1.4"
              opacity="0.35"
            />
            <g fill="#1d150d">
              <rect x="760" y="92" width="9" height="596" />
              <rect x="972" y="92" width="9" height="596" />
              <rect x="1184" y="92" width="9" height="596" />
              <rect x="536" y="336" width="868" height="8" />
              <rect x="536" y="500" width="868" height="6" />
            </g>
            <rect x="500" y="694" width="940" height="28" rx="3" fill="url(#ctc-sill)" />
            <rect x="500" y="694" width="940" height="3" fill="#c9a35f" opacity="0.28" />
          </g>
          </g>

          {/* ---------------------------------------------------------------
              Wall furniture: hanging mission scrolls and two lanterns.
          ---------------------------------------------------------------- */}
          <g opacity="0.9">
            <rect x="176" y="150" width="118" height="300" rx="3" fill="url(#ctc-parchment)" opacity="0.86" />
            <rect x="176" y="150" width="118" height="300" rx="3" fill="none" stroke="#8a6b3c" strokeWidth="1" opacity="0.5" />
            <g stroke="#3a2b1c" strokeWidth="2" opacity="0.35" strokeLinecap="round">
              <path d="M196 196h78M196 220h60M196 244h72M196 268h48M196 292h66M196 316h54M196 340h70" />
            </g>
            <rect x="186" y="136" width="98" height="10" rx="4" fill="#3a2b1c" />
          </g>

          {/* Lanterns. */}
          <g>
            <path d="M120 84v96" stroke="#2a2015" strokeWidth="2" />
            <ellipse cx="120" cy="236" rx="120" ry="130" fill="url(#ctc-lantern)" />
            <rect x="94" y="180" width="52" height="76" rx="10" fill="#3a2b1c" />
            <rect x="102" y="188" width="36" height="60" rx="8" fill="#f7d79c" opacity="0.62" />
            <rect x="88" y="172" width="64" height="10" rx="4" fill="#241a11" />
            <rect x="88" y="256" width="64" height="8" rx="4" fill="#241a11" />

            <path d="M1462 84v54" stroke="#2a2015" strokeWidth="2" />
            <ellipse cx="1462" cy="196" rx="128" ry="138" fill="url(#ctc-lantern)" />
            <rect x="1436" y="138" width="52" height="76" rx="10" fill="#3a2b1c" />
            <rect x="1444" y="146" width="36" height="60" rx="8" fill="#f7d79c" opacity="0.58" />
            <rect x="1430" y="130" width="64" height="10" rx="4" fill="#241a11" />
            <rect x="1430" y="214" width="64" height="8" rx="4" fill="#241a11" />
          </g>

          {/* Desk in the foreground, with a transmission sheet and a seal pot. */}
          <g>
            <rect x="0" y="788" width="1600" height="112" fill="url(#ctc-desk)" />
            <rect x="0" y="788" width="1600" height="3" fill="#c9a35f" opacity="0.18" />
            <path d="M1042 812l318-16 22 52-300 20z" fill="url(#ctc-parchment)" opacity="0.72" />
            <g stroke="#3a2b1c" strokeWidth="2" opacity="0.28" strokeLinecap="round">
              <path d="M1080 828l232-12M1084 846l196-10" />
            </g>
            <ellipse cx="1394" cy="842" rx="34" ry="14" fill="#0b0805" />
            <rect x="1382" y="806" width="24" height="34" rx="5" fill="#4a2a20" />
            <rect x="1382" y="806" width="24" height="6" rx="3" fill="#7a2c20" />
          </g>

          {/* Crimson accent: a single hanging banner edge on the far right. */}
          <g opacity="0.55">
            <rect x="1536" y="120" width="64" height="420" fill="#5c201b" />
            <rect x="1536" y="120" width="6" height="420" fill="#7a2c20" />
            <path d="M1536 540l64 0-8 26-56 0z" fill="#3d1512" />
          </g>
        </svg>

        {/* Atmospheric overlays (CSS). */}
        <div className="ctc-grade" aria-hidden="true" />
        <div className="ctc-lantern-glow" aria-hidden="true" />
        <div className="ctc-vignette" aria-hidden="true" />

        {isInViewport ? (
          <div className="ctc-dust" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                style={{
                  left: `${6 + ((i * 23) % 88)}%`,
                  top: `${16 + ((i * 31) % 66)}%`,
                  width: `${1.5 + (i % 3) * 0.7}px`,
                  height: `${1.5 + (i % 3) * 0.7}px`,
                  opacity: 0.12 + (i % 4) * 0.05,
                  animation: `valleyDrift ${19 + (i % 6) * 3.5}s ease-in-out ${(i % 5) * 1.4}s infinite`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
