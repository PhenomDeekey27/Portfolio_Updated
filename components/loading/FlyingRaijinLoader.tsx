"use client";

import { RaijinKunai } from "@/components/transitions/RaijinArtwork";

interface FlyingRaijinLoaderProps {
  progress: number;
  visible: boolean;
  reducedMotion?: boolean;
}

export default function FlyingRaijinLoader({
  progress,
  visible,
  reducedMotion = false,
}: FlyingRaijinLoaderProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Golden chakra glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`h-[28rem] w-[28rem] rounded-full bg-gold/20 blur-[120px] ${
            reducedMotion ? "" : "animate-pulse"
          }`}
        />
      </div>

      {/* Kunai */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`relative ${reducedMotion ? "" : "animate-[spin_4s_linear_infinite]"}`}
          style={{ width: 96, height: 192 }}
        >
          <RaijinKunai
            idPrefix="frl"
            accent="gold"
            width="96"
            height="192"
            preserveAspectRatio="xMidYMid meet"
            className="drop-shadow-[0_0_24px_rgba(201,163,95,0.55)]"
          />
        </div>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.4em] text-gold-soft/80">
          Initializing the shinobi world
        </p>

        <div className="mt-6 h-px w-56 bg-bone/15 overflow-hidden relative">
          {clamped >= 100 ? (
            <div className="h-full bg-gold transition-[width] duration-300 ease-out" style={{ width: "100%" }} />
          ) : (
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gold animate-[shimmer_1.6s_ease-in-out_infinite]" />
          )}
        </div>

        <p className="mt-3 font-mono text-[9px] tracking-[0.3em] text-ash/50">
          {clamped >= 100 ? "100%" : "Loading"}
        </p>
      </div>
    </div>
  );
}
