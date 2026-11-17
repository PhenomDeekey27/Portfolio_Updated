"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSectionPhase } from "./SectionContent";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
};

/**
 * One-time scroll reveal. An element animates in the first time it enters the
 * viewport and then stays visible. Respects prefers-reduced-motion.
 *
 * Inside a SectionContent wrapper the reveal is additionally gated on the
 * teleport phase: elements that are already in view while the destination
 * world is still arriving keep their one-time transition for the moment the
 * content phase opens, which is what produces the controlled stagger.
 */
export default function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useSectionPhase();
  // Always start hidden so server and client markup match (no hydration
  // mismatch). prefers-reduced-motion users are handled in CSS via the
  // .reveal-item rule, which forces the element visible without animation.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  const visible = inView && phase === "content";

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={className ? `reveal-item ${className}` : "reveal-item"}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,18px,0)",
        transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}