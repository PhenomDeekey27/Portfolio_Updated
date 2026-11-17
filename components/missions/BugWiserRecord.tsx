import {
  ArrowUpRight,
  Code2,
  FileSearch,
  GitPullRequest,
  Search,
  Target,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { Mission } from "@/lib/data/missions";
import Reveal from "../ui/Reveal";

/**
 * Editorial record for BugWiser.
 *
 * Four content areas — what it is, who it helps, what it implements, and the
 * verified stack and links — laid out as an open editorial page with hairlines
 * and whitespace rather than a portfolio card.
 *
 * Facts come only from `lib/data/missions.ts` and the deployed application
 * screens. The six features below are the six steps shown by the live build;
 * nothing planned or unverified is presented as complete.
 */

const FEATURES = [
  {
    icon: FaGithub,
    title: "GitHub repository connection",
    body: "Starts from the real repository using GitHub App installation tokens rather than a pasted code sample.",
  },
  {
    icon: Search,
    title: "Issue selection",
    body: "The developer chooses the issue to investigate, so the analysis is anchored to a reported problem.",
  },
  {
    icon: FileSearch,
    title: "Code tracing",
    body: "Identifies and traces the files that matter to the selected issue instead of guessing from the report alone.",
  },
  {
    icon: Target,
    title: "Root-cause analysis",
    body: "Presents a likely root cause with a confidence level and the reasoning behind the finding.",
  },
  {
    icon: Code2,
    title: "Code evidence and patch preview",
    body: "Shows the relevant code path and a concrete suggested patch that can be reviewed before anything is applied.",
  },
  {
    icon: GitPullRequest,
    title: "Branch and pull-request workflow",
    body: "Carries a generated patch forward into a fix branch and pull request.",
  },
];

const AUDIENCES = [
  {
    title: "Developers investigating an issue",
    body: "Working from a reported bug and needing to find the code responsible without manually reading the whole repository.",
  },
  {
    title: "Engineers reading unfamiliar code",
    body: "Onboarding to a codebase and looking for an explanation grounded in the files that actually take part in the issue.",
  },
  {
    title: "Teams reviewing a root cause",
    body: "Checking a likely cause, the evidence behind it and a proposed patch before deciding what to change.",
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
            <p className="bw-record-eyebrow">Case study · open source</p>
            <h4 id="bw-record-title" className="bw-record-title">
              {mission.name}
            </h4>
          </Reveal>

          <Reveal delay={90}>
            <p className="bw-record-dek">{mission.description}</p>
          </Reveal>
        </div>

        {/* A. What is BugWiser? */}
        <Reveal>
          <section id="bw-what" className="bw-story" aria-labelledby="bw-what-title">
            <div className="bw-story-side">
              <p className="bw-story-index">01</p>
              <p className="bw-story-label">What it is</p>
              <h5 id="bw-what-title" className="bw-story-heading">
                From a reported issue to a reviewable patch.
              </h5>
            </div>

            <div className="bw-story-main">
              <p className="bw-story-body">
                BugWiser is an AI-powered developer debugging assistant for
                GitHub repositories. It connects to a repository, lets a
                developer select an issue, and traces the code that takes part
                in the reported behaviour.
              </p>
              <p className="bw-story-body">
                Instead of offering generic advice, it explains a likely root
                cause with repository evidence and a confidence level, then
                previews a patch. The intent is to shorten the distance between
                an issue report and an actionable, reviewable fix.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <div className="bw-story-rule" aria-hidden="true" />
        </Reveal>

        {/* B. Who does it help? */}
        <Reveal delay={60}>
          <section id="bw-who" className="bw-story" aria-labelledby="bw-who-title">
            <div className="bw-story-side">
              <p className="bw-story-index">02</p>
              <p className="bw-story-label">Who it helps</p>
              <h5 id="bw-who-title" className="bw-story-heading">
                Built for the work of understanding a bug.
              </h5>
            </div>

            <div className="bw-story-main">
              <p className="bw-story-body">
                BugWiser is a developer tool, not a managed service. Its
                implemented workflow supports three kinds of work:
              </p>

              <ol className="bw-audiences">
                {AUDIENCES.map((audience, audienceIndex) => (
                  <li key={audience.title}>
                    <span aria-hidden="true" className="bw-audience-index">
                      {String(audienceIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="bw-audience-title">{audience.title}</p>
                      <p className="bw-audience-body">{audience.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <div className="bw-story-rule" aria-hidden="true" />
        </Reveal>

        {/* C. Key features */}
        <Reveal delay={80}>
          <section
            id="bw-features"
            className="bw-story bw-story-features"
            aria-labelledby="bw-features-title"
          >
            <div className="bw-story-side">
              <p className="bw-story-index">03</p>
              <p className="bw-story-label">Key features</p>
              <h5 id="bw-features-title" className="bw-story-heading">
                Six implemented steps, not a roadmap.
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

        {/* D. Technology and access */}
        <Reveal delay={80}>
          <section id="bw-access" className="bw-access" aria-labelledby="bw-access-title">
            <div className="bw-access-head">
              <div>
                <p className="bw-story-index">04</p>
                <p className="bw-story-label">Technology and access</p>
                <h5 id="bw-access-title" className="bw-story-heading">
                  Verified stack. Public build.
                </h5>
              </div>
              <p className="bw-access-note">
                The stack comes from the project record. Both links open the
                verified public work in a new tab.
              </p>
            </div>

            <ul className="bw-access-stack" aria-label="Technology stack">
              {mission.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

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
          </section>
        </Reveal>

        <Reveal delay={60}>
          <p className="bw-record-source">
            Screens captured from the deployed BugWiser build on 16 Nov 2026,
            shown in the application&rsquo;s dark theme. Source and live build
            links verified.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
