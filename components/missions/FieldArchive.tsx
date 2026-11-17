"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import KunaiMark from "../motifs/KunaiMark";
import { archiveProjects, type ArchiveProject } from "@/lib/data/missions";

/**
 * PHASE 6.13 — the Field Archive.
 *
 * The four earlier builds stay exactly as recorded (same names, copy, stacks
 * and verified live links); what changes is how they are presented. Each entry
 * now arms itself the first time it enters the reading band:
 *
 *   * the title unmasks from below inside a clipped line,
 *   * the screenshot lifts out of a slightly larger, dimmer frame,
 *   * the metadata follows a beat later.
 *
 * Deliberately restrained, and deliberately not another encounter: one
 * IntersectionObserver per entry, one-shot, no scroll listeners, no parallax
 * tied to scroll position, and the only hover motion is a transform on the
 * image and the card. Reduced motion gets the settled archive immediately.
 */

type ArchiveCardProps = {
  project: ArchiveProject;
  index: number;
  total: number;
};

function ArchiveCard({ project, index, total }: ArchiveCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href={project.live}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.name} live build`}
      data-visible={visible ? "true" : "false"}
      className="fa-card group"
      style={{ "--fa-delay": `${(index % 2) * 90}ms` } as CSSProperties}
    >
      <div className="fa-media">
        <Image
          src={project.image}
          alt={`${project.name} interface preview`}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          loading="lazy"
          decoding="async"
          className="fa-shot"
        />
        <div aria-hidden="true" className="fa-media-scrim" />
        <span className="fa-open">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      <div className="fa-body">
        <div className="fa-heading">
          <h4 className="fa-title">
            <span className="fa-title-mask">
              <span className="fa-title-text">{project.name}</span>
            </span>
          </h4>
          <span className="fa-index">
            {String(index + 1).padStart(2, "0")}
            <span className="fa-index-total">/{String(total).padStart(2, "0")}</span>
          </span>
        </div>

        <p className="fa-description">{project.description}</p>

        <div className="fa-stack">
          {project.stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>

        <div className="fa-link">
          Visit live build
          <ArrowUpRight className="fa-link-arrow h-3 w-3" aria-hidden="true" />
        </div>
      </div>
    </a>
  );
}

export default function FieldArchive() {
  const total = archiveProjects.length;

  return (
    <section className="fa" aria-labelledby="fa-title">
      {/* Transition out of the encounter archive and into the earlier builds. */}
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
            Earlier work, still in the wild.
          </h3>
        </div>
        <p className="fa-head-note">
          A selection of earlier builds with verified live deployments. Each
          record opens the production application.
        </p>
      </div>

      <div className="fa-grid">
        {archiveProjects.map((project, index) => (
          <ArchiveCard
            key={project.id}
            project={project}
            index={index}
            total={total}
          />
        ))}
      </div>
    </section>
  );
}
