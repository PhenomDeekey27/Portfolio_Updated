"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";
import KunaiMark from "./motifs/KunaiMark";
import { profile } from "@/lib/data/profile";
import { useReveal } from "@/components/transitions/WorldRevealController";
import { useTeleport } from "@/components/transitions/TeleportationController";

const navItems = [
  { id: "home", label: "Home", index: "01" },
  { id: "about", label: "About", index: "02" },
  { id: "skills", label: "Skills", index: "03" },
  { id: "missions", label: "Missions", index: "04" },
  { id: "experience", label: "Experience", index: "05" },
  { id: "contact", label: "Contact", index: "06" },
] as const;

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { phase } = useReveal();
  const navVisible =
    phase === "NAVIGATION_REVEAL" ||
    phase === "HERO_TEXT_REVEAL" ||
    phase === "PORTRAIT_REVEAL" ||
    phase === "CTA_REVEAL" ||
    phase === "COMPLETE";
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const toggleButton = toggleRef.current;
    document.body.style.overflow = "hidden";

    const focusFirstLink = window.requestAnimationFrame(() => {
      mobileMenuRef.current
        ?.querySelector<HTMLAnchorElement>("a[href]")
        ?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFirstLink);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      (toggleButton ?? previouslyFocused)?.focus();
    };
  }, [isOpen]);

  const { beginTransition } = useTeleport();
  const handleNavigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      setIsOpen(false);
      // TeleportationController owns scrolling now: for Home<->About it
      // scrolls under opaque black during the flash; for other sections it
      // uses the normal smooth scroll. Never scroll immediately or the About
      // world would slide in before the black cover settles.
      beginTransition(id);
      window.history.replaceState(null, "", `#${id}`);
    },
    [beginTransition]
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          navVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        } ${scrolled
          ? // PHASE 6.16 — phones get an opaque bar instead of a full-width
            // `backdrop-filter`. A live blur across a 390px header is
            // recomputed on every scroll frame while the page moves behind it;
            // at 0.94 opacity the difference is not visible, and desktop keeps
            // the blurred bar it has always had.
            "border-b border-bone/10 bg-void/[0.94] py-3 lg:bg-void/[0.88] lg:backdrop-blur-xl"
          : "border-b border-transparent bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#home"
            onClick={(event) => handleNavigate(event, "home")}
            className="group flex items-center gap-3"
            aria-label="Kasthuri Rangan — back to home"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors duration-300 group-hover:border-gold">
              <KunaiMark className="h-5 w-5 -rotate-12" strokeWidth={1.25} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[13px] font-semibold tracking-[0.18em] text-bone">
                K. RANGAN
              </span>
              <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.28em] text-ash/70">
                Flying Raijin
              </span>
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(event) => handleNavigate(event, item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex items-baseline gap-1.5 py-2 text-[13px] transition-colors duration-300 ${
                    isActive
                      ? "text-bone"
                      : "text-ash/80 hover:text-bone"
                  }`}
                >
                  <span
                    className={`font-mono text-[8px] tracking-widest transition-colors ${
                      isActive ? "text-gold" : "text-ash/40"
                    }`}
                  >
                    {item.index}
                  </span>
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border border-gold/35 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-void"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Résumé
            </a>
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-bone/15 text-bone transition-colors hover:border-gold/50 hover:text-gold lg:hidden"
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-void/[0.98] px-6 pt-28 pb-12 backdrop-blur-xl lg:hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(201,163,95,0.11),transparent_42%)]"
            />

            <nav
              aria-label="Mobile navigation"
              className="relative mx-auto flex max-w-lg flex-col"
            >
              <p className="mb-8 font-mono text-[9px] uppercase tracking-[0.35em] text-gold">
                Hidden Leaf · Index
              </p>

              {navItems.map((item, position) => {
                const isActive = activeSection === item.id;
                return (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(event) => handleNavigate(event, item.id)}
                    aria-current={isActive ? "page" : undefined}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, x: -16 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: prefersReducedMotion ? 0 : position * 0.045,
                    }}
                    className="group flex items-baseline justify-between border-b border-bone/10 py-5"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[9px] tracking-widest text-gold/70">
                        {item.index}
                      </span>
                      <span
                        className={`font-display text-3xl font-light tracking-wide transition-colors sm:text-4xl ${
                          isActive
                            ? "text-gold-soft"
                            : "text-bone group-hover:text-gold-soft"
                        }`}
                      >
                        {item.label}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs text-ash/40 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      ↗
                    </span>
                  </motion.a>
                );
              })}

              <div className="mt-10 flex flex-col gap-3">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-void"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  View Résumé
                </a>
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.22em] text-ash/50">
                  {profile.location}
                </p>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
