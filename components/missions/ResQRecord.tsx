import Image from "next/image";
import { ArrowUpRight, Download, ShieldAlert } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { Mission } from "@/lib/data/missions";
import { resqRecordScreens, resqScreens } from "@/lib/data/resqGallery";
import Reveal from "../ui/Reveal";

/**
 * Editorial record for ResQ — compact.
 *
 * PHASE 6.16: the record used to walk six technical chapters with two to three
 * paragraphs each (eleven phone screens of reading). It now follows the same
 * short structure as the rest of the archive:
 *
 *   01 problem and solution   02 key implementation   03 interfaces, stack, links
 *
 * Every claim is still traceable to the ResQ Android source and README, the
 * release page, or the design-system screens — and the screens are still
 * labelled as DESIGN REFERENCES, not captures of the released APK. The chapter
 * detail that was cut here (sample windows, countdown lengths, permission
 * paths) is condensed, not invented: nothing new is asserted.
 */

const FEATURES = [
  {
    title: "Sensor-based accident detection",
    body: "A weighted score over a 12-sample window of accelerometer and gyroscope readings. It needs at least three abnormal samples plus rotation evidence, so a hard brake alone can never raise an alert.",
  },
  {
    title: "Confirm-or-escalate countdown",
    body: "A possible incident opens a 10-second check (5 seconds at high confidence) with “I’m OK — Cancel Alert” beside “I Need Help Now”, spoken aloud when text-to-speech is available.",
  },
  {
    title: "Emergency contact notification",
    body: "If the countdown runs out, one SMS per incident goes from the user’s own SIM to each eligible saved contact, followed by a single call attempt to the primary contact.",
  },
  {
    title: "Location fallback",
    body: "A fresh fix is described as current and an old one as last known, with its age. With no usable position the alert still sends — without a location line rather than with a guess.",
  },
  {
    title: "Nearby resources via SerpApi",
    body: "The app posts its coordinates to its own FastAPI backend, which searches through SerpApi, deduplicates by radius and returns “Not verified” results with distance and phone number.",
  },
];

const SCREEN = { width: 486, height: 1018 } as const;

function screenById(id: string) {
  return resqScreens.find((screen) => screen.id === id);
}

export default function ResQRecord({
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
  const releaseLabel = mission.links.release
    ?.replace(/^https?:\/\//, "")
    .replace(/^github\.com\//, "");

  const references = [
    {
      ...resqRecordScreens.homeLight,
      caption: "Design reference · protection home (PDF page 1).",
    },
    {
      ...SCREEN,
      src: screenById("accident-detected")!.image.src,
      alt: screenById("accident-detected")!.alt,
      caption: "Design reference · the alert and its countdown (PDF page 6).",
    },
  ];

  return (
    <section
      id="wnd-record"
      className="wnd-record"
      aria-labelledby="wnd-record-title"
    >
      <div className="wnd-record-inner">
        <Reveal>
          <div className="wnd-record-topline">
            <p className="wnd-record-kicker">
              Mission record {code} / {String(total).padStart(2, "0")}
            </p>
            <p className="wnd-record-kicker wnd-record-kicker-muted">
              Wind Release · {classification} · Rank {mission.rank}
            </p>
          </div>
        </Reveal>

        <div className="wnd-record-head">
          <Reveal>
            <p className="wnd-record-eyebrow">Hackathon project · SerpApi India Hackathon 2026</p>
            <h4 id="wnd-record-title" className="wnd-record-title">
              {mission.name}
            </h4>
          </Reveal>

          <Reveal delay={90}>
            <p className="wnd-record-dek">{mission.description}</p>
          </Reveal>
        </div>

        {/* 01 — Problem and solution */}
        <Reveal>
          <section
            id="wnd-problem"
            className="wnd-chapter wnd-chapter--text"
            aria-labelledby="wnd-problem-title"
          >
            <div className="wnd-chapter-side">
              <p className="wnd-chapter-index">01</p>
              <p className="wnd-chapter-label">Problem and solution</p>
              <h5 id="wnd-problem-title" className="wnd-chapter-heading">
                Someone who cannot answer cannot say what happened or where.
              </h5>
            </div>

            <div className="wnd-chapter-main">
              <p className="wnd-chapter-body">
                After a crash, the minutes before anyone notices are the part
                that matters. ResQ watches the phone&rsquo;s motion sensors while
                the device travels and raises its hand only when several signals
                agree that something went wrong.
              </p>
              <p className="wnd-chapter-body">
                It always asks first. A confirmation countdown gives the
                traveller a way to say they are fine; only silence escalates to
                the contacts they saved, with a location line they can act on.
                Protection is opt-in, never re-arms itself, and can be paused
                from the home screen.
              </p>
            </div>
          </section>
        </Reveal>

        {/* 02 — Key implementation */}
        <Reveal delay={60}>
          <section
            id="wnd-features"
            className="wnd-chapter wnd-chapter--text"
            aria-labelledby="wnd-features-title"
          >
            <div className="wnd-chapter-side">
              <p className="wnd-chapter-index">02</p>
              <p className="wnd-chapter-label">Key implementation</p>
              <h5 id="wnd-features-title" className="wnd-chapter-heading">
                Five capabilities that are built, not planned.
              </h5>
            </div>

            <div className="wnd-chapter-main">
              <ul className="wnd-stack-features">
                {FEATURES.map((feature) => (
                  <li key={feature.title}>
                    <p className="wnd-feature-title">{feature.title}</p>
                    <p className="wnd-chapter-body">{feature.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* 03 — Interfaces, stack and links */}
        <Reveal delay={60}>
          <section
            id="wnd-references"
            className="wnd-chapter"
            aria-labelledby="wnd-references-title"
          >
            <div className="wnd-chapter-side">
              <p className="wnd-chapter-index">03</p>
              <p className="wnd-chapter-label">Interface references</p>
              <h5 id="wnd-references-title" className="wnd-chapter-heading">
                Design screens, labelled as designs.
              </h5>
            </div>

            <div className="wnd-chapter-main">
              <p className="wnd-chapter-body">
                These are application interface designs from the ResQ design
                system PDF — not captures of the released APK. They contain
                generic demonstration content: no real names, phone numbers,
                coordinates or addresses.
              </p>
              <p className="wnd-chapter-body">
                Cloud voice escalation is a specified but permanently disabled
                interface, and 112 is always a manual call action. The strongest
                automated claim the app makes is that it asked the phone to send
                the message and place the call.
              </p>
            </div>

            <div className="wnd-chapter-screens is-pair">
              {references.map((screen) => (
                <figure key={screen.src} className="wnd-chapter-screen">
                  <div className="wnd-chapter-frame">
                    <Image
                      src={screen.src}
                      alt={screen.alt}
                      width={screen.width}
                      height={screen.height}
                      sizes="(max-width: 1023px) 42vw, 220px"
                      loading="lazy"
                      className="wnd-chapter-shot"
                    />
                  </div>
                  <figcaption className="wnd-chapter-caption">
                    {screen.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={60}>
          <div className="wnd-record-close">
            <div className="wnd-record-close-head">
              <p className="wnd-chapter-index">04</p>
              <p className="wnd-chapter-label">Stack and access</p>
              <h5 className="wnd-chapter-heading">
                Public repository. Published release. Prototype status.
              </h5>
            </div>

            <div className="wnd-record-close-main">
              <p className="wnd-chapter-body">
                ResQ is an Android application, so there is no live web build to
                open. Its nearby-resource service is a separate FastAPI
                repository deployed on its own, and the app talks to that
                service at runtime. The Android source repository and the signed
                release page are the verified entry points for the client.
              </p>

              <div role="group" aria-label="Technology stack by layer">
                {(mission.stackGroups ?? [
                  { label: "Stack", items: mission.stack },
                ]).map((group) => (
                  <div key={group.label} className="mt-4 first:mt-0">
                    <p className="wnd-chapter-label">{group.label}</p>
                    <ul
                      className="wnd-stack"
                      style={{ marginTop: 8 }}
                      aria-label={`${group.label} technologies`}
                    >
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {mission.integrations?.length ? (
                  <div className="mt-4">
                    <p className="wnd-chapter-label">Integrations</p>
                    <ul
                      className="wnd-stack"
                      style={{ marginTop: 8 }}
                      aria-label="External integrations"
                    >
                      {mission.integrations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="wnd-links">
                {mission.links.github ? (
                  <a
                    href={mission.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${mission.name} source repository on GitHub`}
                    className="wnd-link"
                  >
                    <span aria-hidden="true" className="wnd-link-icon">
                      <FaGithub className="h-4 w-4" />
                    </span>
                    <span className="wnd-link-copy">
                      <span className="wnd-link-label">
                        View source repository
                      </span>
                      <span className="wnd-link-url">{githubLabel}</span>
                    </span>
                    <ArrowUpRight
                      className="wnd-link-arrow h-4 w-4"
                      aria-hidden="true"
                    />
                  </a>
                ) : null}

                {mission.links.release ? (
                  <a
                    href={mission.links.release}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${mission.name} Android release v1.0.1 with APK`}
                    className="wnd-link"
                  >
                    <span aria-hidden="true" className="wnd-link-icon">
                      <Download className="h-4 w-4" />
                    </span>
                    <span className="wnd-link-copy">
                      <span className="wnd-link-label">
                        View Android release / APK
                      </span>
                      <span className="wnd-link-url">{releaseLabel}</span>
                    </span>
                    <ArrowUpRight
                      className="wnd-link-arrow h-4 w-4"
                      aria-hidden="true"
                    />
                  </a>
                ) : null}
              </div>

              <p className="wnd-record-note">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <span>
                  Built for the SerpApi India Hackathon 2026 as a demonstration
                  prototype. It is not certified or regulatorily validated and
                  does not replace emergency services: detection can miss an
                  incident or raise a false alarm, and SMS, calls, GPS and the
                  resource backend can each fail.
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <p className="wnd-record-source">
            The behaviour above was verified against the project source; the
            design screens and the implementation are labelled separately
            wherever they differ.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
