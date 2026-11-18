import {
  ArrowUpRight,
  FileSearch,
  GitPullRequest,
  Search,
  Target,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { Mission } from "@/lib/data/missions";
import Reveal from "../ui/Reveal";

/**
 * Editorial record for BugWiser — deliberately short.
 *
 * PHASE 6.16: the record had grown to four sections (what it is, three audience
 * profiles, six features, access) and ran nearly six phone screens. A recruiter
 * has to be able to understand the project without scrolling that far, so the
 * structure is now the compact one used across the archive:
 *
 *   01 problem and solution   02 key implementation   03 stack and links
 *
 * Nothing was invented to fill the space and nothing verified was cut: the five
 * steps are the workflow the deployed build actually implements, and the
 * audience profiles now live in the stage copy as a single line.
 */
const FEATURES = [
  {
    icon: FaGithub,
    title: "Repository analysis",
    body: "Connects with GitHub OAuth, so the investigation runs against a repository the developer already has access to rather than a pasted snippet.",
  },
  {
    icon: Search,
    title: "Issue investigation",
    body: "The developer selects the issue to investigate, so the analysis is anchored to a reported problem.",
  },
  {
    icon: FileSearch,
    title: "Code tracing",
    body: "Traces the files and symbols that actually take part in the reported behaviour instead of guessing from the report.",
  },
  {
    icon: Target,
    title: "Root cause and patch preview",
    body: "Presents the likely cause with its code evidence and a confidence level, then previews a patch for review.",
  },
  {
    icon: GitPullRequest,
    title: "Branch and pull request",
    body: "Applies an accepted patch to a new fix branch and opens a pull request, so the fix still goes through normal review.",
  },
];

export default function BugWiserRecord({
  mission,
  index,
  total = 4,
}: {
  mission: Mission;
  index: number;
  total?: number;
}) {
  const code = String(index + 1).padStart(2, "0");
  const [classification] = mission.category.split(" · ");
  const githubLabel = mission.links.github?.replace(/^https?:\/\//, "");
  const liveLabel = mission.links.live?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <section id="bw-record" className="bw-record" aria-labelledby="bw-record-title">
      <div className="bw-record-inner">
        <Reveal>
          <div className="bw-record-topline">
            <p className="bw-record-kicker">
              Mission record {code} / {String(total).padStart(2, "0")}
            </p>
            <p className="bw-record-kicker bw-record-kicker-muted">
              Sand Dominion · {classification} · Rank {mission.rank}
            </p>
          </div>
        </Reveal>

        <div className="bw-record-head">
          <Reveal>
            <p className="bw-record-eyebrow">Hackathon project · Micro1</p>
            <h4 id="bw-record-title" className="bw-record-title">
              {mission.name}
            </h4>
          </Reveal>

          <Reveal delay={90}>
            <p className="bw-record-dek">{mission.description}</p>
          </Reveal>
        </div>

        {/* 01 — Problem and solution */}
        <Reveal>
          <section id="bw-what" className="bw-story" aria-labelledby="bw-what-title">
            <div className="bw-story-side">
              <p className="bw-story-index">01</p>
              <p className="bw-story-label">Problem and solution</p>
              <h5 id="bw-what-title" className="bw-story-heading">
                From a reported issue to a reviewable patch.
              </h5>
            </div>

            <div className="bw-story-main">
              <p className="bw-story-body">
                An issue report rarely points at the code responsible, so the
                investigation starts by reading an unfamiliar repository and
                guessing where to look.
              </p>
              <p className="bw-story-body">
                BugWiser connects to that repository, traces the code behind the
                selected issue, and answers with a likely root cause, the
                evidence for it and a patch a developer can review — for
                developers investigating a bug, engineers reading a new
                codebase, and teams checking a cause before changing anything.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <div className="bw-story-rule" aria-hidden="true" />
        </Reveal>

        {/* 02 — Key implementation */}
        <Reveal delay={80}>
          <section
            id="bw-features"
            className="bw-story bw-story-features"
            aria-labelledby="bw-features-title"
          >
            <div className="bw-story-side">
              <p className="bw-story-index">02</p>
              <p className="bw-story-label">Key implementation</p>
              <h5 id="bw-features-title" className="bw-story-heading">
                Five implemented steps, not a roadmap.
              </h5>
            </div>

            <div className="bw-story-main">
              <ul className="bw-features">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <li key={feature.title}>
                      <span aria-hidden="true" className="bw-feature-icon">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="bw-feature-title">{feature.title}</p>
                        <p className="bw-feature-body">{feature.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* 03 — Technology and access */}
        <Reveal delay={80}>
          <section id="bw-access" className="bw-access" aria-labelledby="bw-access-title">
            <div className="bw-access-head">
              <div>
                <p className="bw-story-index">03</p>
                <p className="bw-story-label">Technology and access</p>
                <h5 id="bw-access-title" className="bw-story-heading">
                  Verified stack. Public build.
                </h5>
              </div>
              <p className="bw-access-note">
                Stack verified against the repository manifest and README. Both
                links open the verified public work in a new tab.
              </p>
            </div>

            <div
              className="mt-6 space-y-4"
              role="group"
              aria-label="Technology stack by layer"
            >
              {(mission.stackGroups ?? [
                { label: "Stack", items: mission.stack },
              ]).map((group) => (
                <div key={group.label}>
                  <p className="bw-story-label">{group.label}</p>
                  <ul
                    className="bw-access-stack"
                    style={{ marginTop: 10 }}
                    aria-label={`${group.label} technologies`}
                  >
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {mission.integrations?.length ? (
              <div className="mt-5">
                <p className="bw-story-label">Integrations</p>
                <ul
                  className="bw-access-stack"
                  style={{ marginTop: 10 }}
                  aria-label="External integrations"
                >
                  {mission.integrations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bw-access-links">
              {mission.links.github ? (
                <a
                  href={mission.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${mission.name} repository on GitHub`}
                  className="bw-access-link"
                >
                  <span aria-hidden="true" className="bw-access-link-icon">
                    <FaGithub className="h-4 w-4" />
                  </span>
                  <span className="bw-access-link-copy">
                    <span className="bw-access-link-label">Repository</span>
                    <span className="bw-access-link-url">{githubLabel}</span>
                  </span>
                  <ArrowUpRight
                    className="bw-access-link-arrow h-4 w-4"
                    aria-hidden="true"
                  />
                </a>
              ) : null}

              {mission.links.live ? (
                <a
                  href={mission.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${mission.name} live build`}
                  className="bw-access-link"
                >
                  <span aria-hidden="true" className="bw-access-link-icon">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="bw-access-link-copy">
                    <span className="bw-access-link-label">Live build</span>
                    <span className="bw-access-link-url">{liveLabel}</span>
                  </span>
                  <ArrowUpRight
                    className="bw-access-link-arrow h-4 w-4"
                    aria-hidden="true"
                  />
                </a>
              ) : null}
            </div>

            <p className="bw-record-source">
              Screens captured from the deployed build; repository and live link
              verified. An accepted patch is applied to a new fix branch and
              opened as a pull request; the default branch is never modified.
            </p>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
