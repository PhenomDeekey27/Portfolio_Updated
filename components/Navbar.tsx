"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navItems = [
  { label: "Home", targetId: "hero" },
  { label: "About", targetId: "About" },
  { label: "Experience", targetId: "Experience" },
  { label: "Projects", targetId: "Portfolio" },
  { label: "Contact", targetId: "Contact" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll to update header transparency and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple intersection observer behavior for active state
      const scrollPos = window.scrollY + 120;
      for (const item of navItems) {
        const el = document.getElementById(item.targetId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.targetId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (targetId: string) => {
    setIsOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-github-border bg-github-bg/80 backdrop-blur-md py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Brand (Kasthuri Rangan) */}
            <button
              onClick={() => handleScrollTo("hero")}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-github-text hover:opacity-80 transition-all cursor-pointer"
            >
              <span className="bg-gradient-to-r from-github-blue via-github-purple to-github-gold bg-clip-text text-transparent sm:text-2xl font-extrabold">
                Kasthuri Rangan
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.targetId;
                return (
                  <button
                    key={item.targetId}
                    onClick={() => handleScrollTo(item.targetId)}
                    className="relative px-4 py-2 text-sm font-medium transition-colors hover:text-github-text cursor-pointer"
                    style={{ color: isActive ? "#F0F6FC" : "#8B949E" }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 -z-10 rounded-lg bg-github-surface/80 border border-github-border/50"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* CTA Connect Button */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => handleScrollTo("Contact")}
                className="group flex items-center gap-1 rounded-lg border border-github-border bg-github-surface px-4 py-2 text-sm font-medium text-github-text hover:bg-github-card transition-all cursor-pointer"
              >
                Connect With Me
                <ArrowUpRight className="h-4 w-4 text-github-subtext group-hover:text-github-gold transition-colors" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg border border-github-border bg-github-surface p-2 text-github-subtext hover:text-github-text transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[60px] z-40 border-b border-github-border bg-github-bg/95 backdrop-blur-lg px-4 py-6 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.targetId}
                  onClick={() => handleScrollTo(item.targetId)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-github-surface ${
                    activeSection === item.targetId
                      ? "bg-github-surface text-github-blue"
                      : "text-github-subtext"
                  }`}
                >
                  {item.label}
                  <span className="text-github-border">→</span>
                </button>
              ))}
              <hr className="border-github-border/50" />
              <button
                onClick={() => handleScrollTo("Contact")}
                className="w-full rounded-lg bg-github-blue py-3 text-center text-sm font-semibold text-github-bg hover:opacity-90 transition-opacity"
              >
                Connect With Me
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
