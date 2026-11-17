"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useSectionRevealPhase,
  type SectionRevealPhase,
} from "@/components/transitions/TeleportationController";

/**
 * Section content gate.
 *
 * The teleport controller decides when a section's environment has arrived
 * (`world`) and when its content may start revealing (`content`). This wrapper
 * publishes that phase to the section subtree so `Reveal` items can hold their
 * existing one-time transition until the world underneath is established — the
 * destination then staggers in instead of appearing all at once.
 */
const SectionPhaseContext = createContext<SectionRevealPhase>("content");

export function useSectionPhase(): SectionRevealPhase {
  return useContext(SectionPhaseContext);
}

interface SectionContentProps {
  /** Section id this content belongs to. */
  id: string;
  className?: string;
  children: ReactNode;
}

export default function SectionContent({ id, className, children }: SectionContentProps) {
  const phase = useSectionRevealPhase(id);

  return (
    <SectionPhaseContext.Provider value={phase}>
      <div
        className={className}
        data-reveal-phase={phase}
        data-section-content={id}
        aria-hidden={phase !== "content"}
      >
        {children}
      </div>
    </SectionPhaseContext.Provider>
  );
}
