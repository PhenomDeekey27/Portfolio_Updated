"use client";

import type { ReactNode } from "react";
import { useTeleport } from "@/components/transitions/TeleportationController";
import { isSectionId, sectionPath } from "@/lib/routes";

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
  const href = isSectionId(sectionId) ? sectionPath(sectionId) : `#${sectionId}`;

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        // Modified clicks and non-primary buttons keep their browser meaning
        // (open in a new tab, save the link, …) — every section is a real URL.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        // All section navigation goes through the one shared Yellow Flash
        // controller so the sequence can never overlap or double-play. The
        // controller also updates the address bar to the section path.
        beginTransition(sectionId);
      }}
    >
      {children}
    </a>
  );
}
