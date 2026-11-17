import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { CharacterArtwork } from "@/lib/data/characterArt";
import type { Mission } from "@/lib/data/missions";
import Reveal from "../ui/Reveal";

/**
 * The factual half of an encounter: description, highlights, note, stack,
 * verified links and the operation metadata panel.
 *
 * Content comes straight from `lib/data/missions.ts`. No scene ever adds a
 * capability, metric, link or ownership claim. The record deliberately reuses
 * the approved BugWiser record styles (`sd-record`) so the four encounters read
 * as one archive.
 */
export default function MissionRecord({
  mission,
  index,
  art,
  total = 4,
}: {
  mission: Mission;
  index: number;
  art: CharacterArtwork;
  total?: number;
}) {
  const code = String(index + 1).padStart(2, "0");
  const [classification] = mission.category.split(" · ");
  const access = mission.links.live
    ? "Public build"
    : mission.links.github
      ? "Repository"
      : mission.client
        ? "Client-owned"
        : "Private build";

  return (
    <div className="jt-record">
      <div className="sd-record">
      <div className="sd-record-main">
        <Reveal>
          <p className="sd-record-label">
            Mission record {code} / {String(total).padStart(2, "0")}
          </p>
        </Reveal>

        <Reveal delay={70}>
          <p className="sd-description">{mission.description}</p>
        </Reveal>

        <Reveal delay={140}>
          <ul className="sd-highlights">
            {mission.highlights.slice(0, 4).map((highlight) => (
              <li key={highlight}>
                <span aria-hidden="true" className="sd-bullet" />
                {highlight}
              </li>
            ))}
          </ul>
        </Reveal>

        {mission.note ? (
          <Reveal delay={200}>
            <p className="sd-note">{mission.note}</p>
          </Reveal>
        ) : null}

        <Reveal delay={260}>
          <div className="sd-stack">
            {mission.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="sd-actions">
            {mission.links.github ? (
              <a
                href={mission.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${mission.name} repository on GitHub`}
                className="sd-action sd-action--primary"
              >
                <FaGithub className="h-3.5 w-3.5" aria-hidden="true" />
                Repository
              </a>
            ) : null}

            {mission.links.live ? (
              <a
                href={mission.links.live}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${mission.name} live build`}
                className="sd-action"
              >
                Live build
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}

            {!mission.links.github && !mission.links.live ? (
              <span className="sd-action sd-action--locked">
                {mission.client ? "Client-owned platform" : "Private build"}
              </span>
            ) : null}
          </div>
        </Reveal>
      </div>

      <Reveal delay={240} className="sd-record-meta">
        <p className="sd-meta-label">Operation record</p>
        <dl className="sd-meta">
          <div>
            <dt>Record</dt>
            <dd>
              {code} / {String(total).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt>Rank</dt>
            <dd className="sd-meta-rank">{mission.rank}</dd>
          </div>
          <div>
            <dt>Classification</dt>
            <dd>{classification}</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>{access}</dd>
          </div>
          <div>
            <dt>Character plate</dt>
            <dd>{art.base ? "Licensed artwork" : "Stand-in silhouette"}</dd>
          </div>
        </dl>
      </Reveal>
      </div>
    </div>
  );
}
