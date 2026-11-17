"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import {
  isTeleportPair,
  useTeleportation,
  type TeleportState,
} from "@/lib/transitions/teleportation";
import { getRouteIdentity } from "@/lib/transitions/identity";
import { scrollToSection, scrollToSectionInstant, setScrollLocked } from "@/lib/scroll";
import KunaiTransition from "./KunaiTransition";
import NatureChakraTransition from "./NatureChakraTransition";
import RasenganTransition from "./RasenganTransition";
import ShinobiMapTransition from "./ShinobiMapTransition";
import HokageSummonTransition from "./HokageSummonTransition";

/**
 * Content choreography phase for one section.
 *
 *  pending — the section is not on screen yet (world and content hidden)
 *  world   — the destination environment is arriving; content still hidden
 *  content — content may run its staggered one-time reveal
 */
export type SectionRevealPhase = "pending" | "world" | "content";

interface TeleportContextValue {
  activeSection: string;
  beginTransition: (destination: string) => void;
  isTransitioning: boolean;
  transitionState: TeleportState;
  /** Reveal phase for a section id — drives the destination content stagger. */
  sectionPhase: (id: string) => SectionRevealPhase;
}

const TeleportContext = createContext<TeleportContextValue | null>(null);

const FALLBACK_CONTEXT: TeleportContextValue = {
  activeSection: "home",
  beginTransition: (destination: string) => scrollToSection(destination),
  isTransitioning: false,
  transitionState: "IDLE",
  sectionPhase: () => "content",
};

export function useTeleport(): TeleportContextValue {
  return useContext(TeleportContext) ?? FALLBACK_CONTEXT;
}

/** Convenience hook for section wrappers and Reveal items. */
export function useSectionRevealPhase(id: string): SectionRevealPhase {
  return useTeleport().sectionPhase(id);
}

const SECTION_IDS = ["home", "about", "skills", "missions", "experience", "contact"];

/**
 * Sections whose environment is only mounted for the visitor AFTER they arrive.
 * They stay hidden while idle so the environment is never glimpsed sliding in
 * from the page flow — the transition owns that reveal.
 */
const HIDDEN_WHILE_IDLE = new Set(["about", "skills"]);

const COVER_PHASES = new Set<TeleportState>([
  "COVERING",
  "KUNAI_DESCENT",
  "SEAL_ACTIVATION",
  "TELEPORT_FLASH",
]);

export function TeleportationController({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;
  const teleport = useTeleportation(reducedMotion);
  const [activeSection, setActiveSection] = useState("home");
  const activeRef = useRef("home");
  const teleportRef = useRef(teleport);
  const cooldownUntilRef = useRef(0);
  const pendingDestinationRef = useRef<string | null>(null);

  const { transition, isTransitioning } = teleport;
  const state = transition.state;

  useEffect(() => {
    teleportRef.current = teleport;
  }, [teleport]);

  useEffect(() => {
    if (state === "COMPLETE") {
      cooldownUntilRef.current = Date.now() + 450;
    }
  }, [state]);

  // Lock scrolling for the whole transition so the destination cannot slide
  // in under the veil or drift before the world switch.
  useEffect(() => {
    if (isTransitioning) {
      setScrollLocked(true);
    } else {
      setScrollLocked(false);
    }
    return () => {
      // Never leave the page scroll-locked if the controller unmounts.
      setScrollLocked(false);
    };
  }, [isTransitioning]);

  // Synchronise the scroll position to the destination while the screen is
  // still covered. The snap is invisible.
  //
  // Forward travel lands on the destination's top (the arriving world fills the
  // screen). Reverse travel lands on the destination's bottom: the visitor is
  // scrolling up out of the section below, so the section they are returning to
  // must arrive at the end they came from, not at its far top.
  useEffect(() => {
    if (state === "TELEPORT_FLASH" && transition.destination) {
      scrollToSectionInstant(
        transition.destination,
        transition.direction === "backward" ? "end" : "start"
      );
      // Snap lifted the lock — re-lock so the destination cannot drift
      // before WORLD_SWITCH reveals it.
      setScrollLocked(true);
    }
  }, [state, transition.destination, transition.direction]);

  // If the tab is hidden mid-sequence, finish immediately instead of burning
  // time on an animation nobody can see. Never leave the user scroll-locked.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      const current = teleportRef.current;
      if (!current.isTransitioning) return;
      const destination = current.transition.destination;
      pendingDestinationRef.current = null;
      if (destination) scrollToSectionInstant(destination);
      current.skip();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const beginTransition = useCallback((destination: string) => {
    const source = activeRef.current;
    if (destination === source) {
      // Same section: plain anchor scroll, no teleport.
      scrollToSection(destination);
      return;
    }

    // A hidden document should not animate. Move and reveal instantly.
    if (document.visibilityState === "hidden") {
      activeRef.current = destination;
      setActiveSection(destination);
      scrollToSectionInstant(destination);
      return;
    }

    // A sequence is already running? beginTransition rejects and we replay
    // the latest request once the current sequence resets. Never overlap.
    if (isTeleportPair(source, destination)) {
      const accepted = teleportRef.current.beginTransition(destination, source);
      if (!accepted) {
        pendingDestinationRef.current = destination;
        return;
      }
      activeRef.current = destination;
      setActiveSection(destination);
    } else {
      // Unknown targets keep normal smooth scrolling (defensive fallback).
      activeRef.current = destination;
      setActiveSection(destination);
      scrollToSection(destination);
    }
  }, []);

  // Play a queued navigation once the current sequence has fully reset.
  useEffect(() => {
    if (state !== "IDLE") return;
    const pending = pendingDestinationRef.current;
    if (!pending) return;
    pendingDestinationRef.current = null;
    const source = activeRef.current;
    if (pending === source) return;
    if (document.visibilityState === "hidden") {
      activeRef.current = pending;
      setActiveSection(pending);
      scrollToSectionInstant(pending);
      return;
    }
    if (teleportRef.current.beginTransition(pending, source)) {
      activeRef.current = pending;
      setActiveSection(pending);
    } else {
      // Another start won the same tick; keep it queued and let the next
      // reset (or the scroll retry) consume it.
      pendingDestinationRef.current = pending;
    }
  }, [state]);

  // Scroll-driven detection for every section pair.
  //
  // Triggers are deliberately early: the transition must already be covering
  // the viewport before the outgoing section leaves it (backwards) or before
  // the incoming section's environment can be exposed (forwards). Otherwise
  // the hidden destination leaves a blank band on screen.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length < 2) return;

    let frame = 0;
    let retryTimer = 0;
    let lastScrollY = window.scrollY;
    let lastDirection: "forward" | "backward" | "none" = "none";

    const tryBegin = (destination: string, source: string) => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() < cooldownUntilRef.current) return;
      if (activeRef.current !== source) return;
      // Commit the active section only when the sequence truly starts. A burst
      // of scroll events must not leave activeRef pointing at a section whose
      // transition was rejected.
      const accepted = teleportRef.current.beginTransition(destination, source);
      if (!accepted) return;
      activeRef.current = destination;
      setActiveSection(destination);
    };

    const consider = () => {
      frame = 0;

      // Track scroll direction so a reverse transition only fires when the
      // user is actually scrolling back towards the previous section. The
      // invisible scroll snap performed by a transition must never be
      // mistaken for user scrolling.
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      if (delta < -0.5) lastDirection = "backward";
      else if (delta > 0.5) lastDirection = "forward";

      if (teleportRef.current.isTransitioning) {
        lastDirection = "none";
        return;
      }

      // A scroll that lands during the short post-arrival cooldown should not
      // be silently lost. Re-check once the cooldown expires.
      const remaining = cooldownUntilRef.current - Date.now();
      if (remaining > 0) {
        if (!retryTimer) {
          retryTimer = window.setTimeout(() => {
            retryTimer = 0;
            onScroll();
          }, remaining + 40);
        }
        return;
      }

      const vh = window.innerHeight;
      const activeIndex = SECTION_IDS.indexOf(activeRef.current);
      if (activeIndex < 0) return;

      const nextSection = sections[activeIndex + 1];
      if (nextSection && lastDirection === "forward") {
        const rect = nextSection.getBoundingClientRect();
        // Fire while only a thin sliver of the incoming section is visible:
        // the closer to `vh * 1` the smaller the blank band of a hidden
        // destination environment that can ever show through.
        if (rect.top < vh * 0.9 && rect.bottom > vh * 0.2) {
          tryBegin(nextSection.id, activeRef.current);
          return;
        }
      }

      // Backward: fire well before the boundary enters the viewport. At
      // `bottom > -vh * 0.35` the outgoing environment still fills the screen,
      // so the reverse identity starts while the user is still looking at it.
      const previousSection = sections[activeIndex - 1];
      if (previousSection && lastDirection === "backward") {
        const rect = previousSection.getBoundingClientRect();
        if (rect.bottom > -vh * 0.35) {
          tryBegin(previousSection.id, activeRef.current);
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(consider);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (retryTimer) window.clearTimeout(retryTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const sectionPhase = useCallback(
    (id: string): SectionRevealPhase => {
      if (COVER_PHASES.has(state)) {
        // While covered: the outgoing section stays fully visible underneath
        // (never blank), the destination waits.
        return transition.destination === id ? "pending" : "content";
      }
      if (state === "WORLD_SWITCH") {
        return transition.destination === id ? "world" : "content";
      }
      if (state === "ARRIVAL" || state === "COMPLETE") {
        return "content";
      }
      // IDLE: the section the visitor is standing in is always established.
      if (activeSection === id) return "content";
      return HIDDEN_WHILE_IDLE.has(id) ? "pending" : "content";
    },
    [state, transition.destination, activeSection]
  );

  const value: TeleportContextValue = {
    activeSection,
    beginTransition,
    isTransitioning,
    transitionState: state,
    sectionPhase,
  };

  const identity = getRouteIdentity(transition.source, transition.destination);

  return (
    <TeleportContext.Provider value={value}>
      {children}
      {identity.kind === "nature-chakra" ? (
        <NatureChakraTransition transition={transition} />
      ) : identity.kind === "rasengan" ? (
        <RasenganTransition transition={transition} />
      ) : identity.kind === "shinobi-map" ? (
        <ShinobiMapTransition transition={transition} />
      ) : identity.kind === "hokage-summon" ? (
        <HokageSummonTransition transition={transition} />
      ) : (
        <KunaiTransition transition={transition} />
      )}
    </TeleportContext.Provider>
  );
}
