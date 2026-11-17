"use client";

import type { ReactNode } from "react";
import { useTeleport } from "@/components/transitions/TeleportationController";

type SectionLinkProps = {
  sectionId: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

export default function SectionLink({
  sectionId,
  className,
  children,
  ariaLabel,
}: SectionLinkProps) {
  const { beginTransition } = useTeleport();

  return (
    <a
      href={`#${sectionId}`}
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        // All section navigation goes through the one shared Yellow Flash
        // controller so the sequence can never overlap or double-play.
        beginTransition(sectionId);
        window.history.replaceState(null, "", `#${sectionId}`);
      }}
    >
      {children}
    </a>
  );
}
