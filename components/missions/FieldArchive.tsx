"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ArrowUpRight } from "lucide-react";
import KunaiMark from "../motifs/KunaiMark";
import { archiveProjects } from "@/lib/data/missions";

/**
 * PHASE 6.18 — the Field Archive, rebuilt as the barrier that guards it.
 *
 * The old archive was four bordered cards in a grid, which read as a generic
 * "more projects" block at the end of a section built entirely from cinematic
 * encounters. This version keeps the same four records, the same copy, the same
 * screenshots and the same verified live links, but presents them as what the
 * rest of the section implies: earlier missions held behind a defensive chakra
 * barrier.
 *
 *   * the environment is a barrier — a lit dome, three counter-rotating rings, a
 *     drifting scan line and a handful of embers, all transform/opacity on
 *     pre-painted layers, gated on the section being in view;
 *   * the archived records are mission *seals* on the left (a 2×2 grid on a
 *     phone), each one numbered and named;
 *   * selecting a seal unmasks the record through the barrier — the screenshot
 *     opens out of a closed clip, the light sweep crosses it, and the name,
 *     description, verified stack and live link follow.
 *
 * The live link is real: every record still opens its production build in a new
 * tab, unchanged from `archiveProjects`. Nothing here is invented — the imagery,
 * names, descriptions and stacks all come from that data file.
 *
 * Deliberately cheap on a phone: no canvas, no rAF loop, no scroll listener,
 * one IntersectionObserver that only arms/disarms the ambient loop, and no
 * animated SVG internals (the rings are pre-painted gradients moved by the
 * compositor).
 */

const PANEL_ID = "fa-panel";

export default function FieldArchive() {
  const total = archiveProjects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[entries.length - 1]?.isIntersecting ?? false),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = activeIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = activeIndex + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = activeIndex - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    const bounded = (next + total) % total;
    setActiveIndex(bounded);
    tabRefs.current[bounded]?.focus();
  };

  const active = archiveProjects[activeIndex];
  const activeCode = String(activeIndex + 1).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      className="fa"
      aria-labelledby="fa-title"
      data-inview={inView ? "true" : "false"}
    >
      {/* ---------------- the barrier ---------------- */}
      <div className="fa-env" aria-hidden="true">
        <span className="fa-dome" />
        <span className="fa-ring fa-ring-a" />
        <span className="fa-ring fa-ring-b" />
        <span className="fa-ring fa-ring-c" />
        <span className="fa-lattice" />
        <span className="fa-scan" />
        <span className="fa-embers">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <span
              key={index}
              className="fa-ember"
              style={
                {
                  left: `${9 + index * 11}%`,
                  top: `${32 + (index % 4) * 14}%`,
                  "--fa-ember-delay": `${index * 1.9}s`,
                  "--fa-ember-size": `${2 + (index % 3)}px`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      </div>

      <div className="fa-seam" aria-hidden="true">
        <span className="fa-seam-rule" />
        <span className="fa-seam-mark">
          <KunaiMark className="h-3.5 w-3.5" />
          Declassified records
        </span>
        <span className="fa-seam-rule" />
      </div>

      <div className="fa-head">
        <div>
          <p className="fa-eyebrow">
            <KunaiMark className="h-3.5 w-3.5" />
            Field archive · {String(total).padStart(2, "0")} records
          </p>
          <h3 id="fa-title" className="fa-heading-title">
            Sealed behind the barrier, still live.
          </h3>
        </div>
        <p className="fa-head-note">
          Earlier builds kept in the mission archive. Break a seal to open the
          record and its production deployment.
        </p>
      </div>

      <div className="fa-vault">
        <div
          className="fa-seals"
          role="tablist"
          aria-orientation="vertical"
          aria-label="Archived mission seals"
          onKeyDown={onKeyDown}
        >
          {archiveProjects.map((project, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={project.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`fa-seal-${project.id}`}
                aria-selected={selected}
                aria-controls={PANEL_ID}
                tabIndex={selected ? 0 : -1}
                data-selected={selected ? "true" : "false"}
                className="fa-seal"
                onClick={() => setActiveIndex(index)}
              >
                <span className="fa-seal-sigil" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="fa-seal-copy">
                  <span className="fa-seal-name">{project.name}</span>
                  <span className="fa-seal-meta">
                    {project.stack.slice(0, 3).join(" · ")}
                  </span>
                </span>
                <span className="fa-seal-state" aria-hidden="true">
                  {selected ? "Unsealed" : "Sealed"}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="fa-reveal"
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={`fa-seal-${active.id}`}
          tabIndex={0}
        >
          {/* Keyed on the record: choosing a seal replays the reveal. */}
          <div className="fa-unseal" key={active.id}>
            <figure className="fa-frame">
              <Image
                src={active.image}
                alt={`${active.name} interface preview`}
                fill
                sizes="(max-width: 1023px) 92vw, 640px"
                loading="lazy"
                decoding="async"
                className="fa-shot"
              />
              <span aria-hidden="true" className="fa-frame-light" />
              <span aria-hidden="true" className="fa-frame-bracket fa-frame-bracket-tl" />
              <span aria-hidden="true" className="fa-frame-bracket fa-frame-bracket-br" />
              <span aria-hidden="true" className="fa-frame-code">
                Record {activeCode}
              </span>
            </figure>

            <div className="fa-body">
              <p className="fa-record-kicker">
                Record {activeCode} / {String(total).padStart(2, "0")} · Declassified
              </p>
              <h4 className="fa-record-title">{active.name}</h4>
              <p className="fa-record-desc">{active.description}</p>

              <div className="fa-record-stack">
                <span className="fa-record-stack-label">Technology</span>
                <ul aria-label={`${active.name} technologies`}>
                  {active.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>

              <a
                href={active.live}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${active.name} live build`}
                className="fa-enter"
              >
                Enter the live build
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
