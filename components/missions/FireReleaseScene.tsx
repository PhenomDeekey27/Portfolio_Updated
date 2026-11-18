"use client";

import { Mail, MessageCircle, PhoneCall } from "lucide-react";
import type { Mission } from "@/lib/data/missions";
import Reveal from "@/components/ui/Reveal";
import { useEncounterActive } from "./useEncounterActive";

/**
 * PHASE 6.10 — FIRE RELEASE (Katon): Saravaraj AI.
 *
 * Composition identity: ignition and branching. Embers lift from the lower-left
 * corner, flame ribbons travel diagonally across a charcoal chamber and spiral
 * into a single hot core. The pulse opens, the title is struck from the left,
 * and the formation separates into the three outreach channels below.
 *
 * The opposite of the water scene: asymmetric, diagonal, outward-moving, with
 * its own palette and its own record layout. CSS/SVG only — no canvas, no
 * per-frame state, no scroll lock, no replay on scroll reversal.
 */

type Flame = {
  d: string;
  width: number;
  delay: number;
  duration: number;
};

/** Long flame ribbons climbing from the lower-left to the upper-right. */
const FLAMES: Flame[] = [
  {
    d: "M-160 900 C 200 820, 460 660, 720 500 C 980 340, 1220 220, 1600 96",
    width: 26,
    delay: 80,
    duration: 2100,
  },
  {
    d: "M-160 820 C 220 730, 480 590, 740 442 C 1000 294, 1240 196, 1600 84",
    width: 13,
    delay: 30,
    duration: 1900,
  },
  {
    d: "M-120 720 C 240 660, 500 540, 760 404 C 1020 268, 1260 190, 1600 120",
    width: 7,
    delay: 150,
    duration: 2000,
  },
  {
    d: "M-120 940 C 260 860, 520 700, 780 540 C 1040 380, 1270 286, 1600 210",
    width: 5,
    delay: 240,
    duration: 2200,
  },
  {
    d: "M-160 640 C 210 600, 470 500, 730 380 C 990 260, 1240 190, 1600 150",
    width: 3,
    delay: 320,
    duration: 2300,
  },
];

/** Fine ignition lines closer to the corner. */
const SPARKS = [
  "M60 880 C 210 820, 330 730, 430 620",
  "M20 790 C 170 744, 300 660, 396 556",
  "M110 940 C 250 872, 372 790, 470 682",
  "M-20 690 C 120 656, 250 584, 342 486",
];

/** Rising embers, deterministic. */
const EMBERS = Array.from({ length: 22 }, (_, index) => {
  const lane = index % 11;
  return {
    x: 60 + lane * 46 + (index % 3) * 12,
    y: 900 - (index % 5) * 26,
    r: 1.5 + (index % 3) * 1.1,
    drift: 46 + (index % 4) * 18,
    delay: 300 + (index % 9) * 160,
    duration: 4200 + (index % 5) * 520,
  };
});

/** The verified outreach pipeline. */
const SOURCES = [
  {
    title: "Lead sources",
    body: "CSV and PDF lead lists arrive from the client's prospecting: the raw material for an outreach run.",
  },
  {
    title: "Lead extraction",
    body: "Contacts are parsed out of those files into structured leads — names, numbers and addresses ready to work.",
  },
];

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "Templated outreach sent through the WhatsApp integration, tracked against the lead it belongs to.",
  },
  {
    icon: Mail,
    title: "Email",
    body: "Email delivery over SMTP, so a sequence can carry the same message without a second tool.",
  },
  {
    icon: PhoneCall,
    title: "AI voice",
    body: "Voice agents built on Vapi and Bolna place the call, with the credentials and prompts held server-side.",
  },
];

const FEATURES = [
  "CSV and PDF lead extraction into structured leads",
  "A single lead queue for deduplication and follow-up",
  "WhatsApp outreach templates",
  "Email delivery over SMTP",
  "AI voice agents with Vapi and Bolna",
  "Server-side credential management for every channel",
];

export default function FireReleaseScene({
  mission,
  index,
}: {
  mission: Mission;
  index: number;
}) {
  const { ref, active } = useEncounterActive<HTMLElement>();
  const code = String(index + 1).padStart(2, "0");
  const [classification, discipline] = mission.category.split(" · ");

  return (
    <article
      data-encounter={mission.id}
      data-jutsu="fire"
      data-active={active ? "true" : "false"}
      className="fyr border-t border-gold/10 first:border-t-0"
    >
      {/* ---------------- A — the ignition ---------------- */}
      <section ref={ref} className="fyr-stage" aria-labelledby="fyr-title">
        <span className="fyr-env" aria-hidden="true" />
        <span className="fyr-veil" aria-hidden="true" />

        <div className="fyr-field" aria-hidden="true">
          <svg
            className="fyr-field-svg"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <defs>
              <linearGradient id="fyr-flame" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#7f1d1d" stopOpacity="0" />
                <stop offset="0.3" stopColor="#dc2626" stopOpacity="0.34" />
                <stop offset="0.62" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="0.86" stopColor="#fbbf24" stopOpacity="0.34" />
                <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fyr-line" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#b91c1c" stopOpacity="0" />
                <stop offset="0.4" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="0.78" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="fyr-core-fill">
                <stop offset="0" stopColor="#fde68a" stopOpacity="0.3" />
                <stop offset="0.34" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="0.72" stopColor="#b91c1c" stopOpacity="0.12" />
                <stop offset="1" stopColor="#0c0806" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="fyr-pulse-fill">
                <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
                <stop offset="0.45" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="1" stopColor="#b91c1c" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle
              className="fyr-core"
              cx="1000"
              cy="420"
              r="340"
              fill="url(#fyr-core-fill)"
            />

            <g className="fyr-flames">
              {FLAMES.map((flame, flameIndex) => (
                <path
                  key={`flame-${flameIndex}`}
                  className="fyr-flame"
                  d={flame.d}
                  pathLength={1}
                  stroke="url(#fyr-flame)"
                  strokeWidth={flame.width}
                  strokeLinecap="round"
                  style={{
                    animationDelay: `${flame.delay}ms`,
                    animationDuration: `${flame.duration}ms`,
                  }}
                />
              ))}
            </g>

            <g className="fyr-lines">
              {FLAMES.map((flame, flameIndex) => (
                <path
                  key={`line-${flameIndex}`}
                  className="fyr-line"
                  d={flame.d}
                  pathLength={1}
                  stroke="url(#fyr-line)"
                  strokeWidth={flameIndex === 0 ? 2.6 : 1.6}
                  strokeLinecap="round"
                  style={{
                    animationDelay: `${flame.delay + 60}ms`,
                    animationDuration: `${flame.duration}ms`,
                  }}
                />
              ))}
            </g>

            <g className="fyr-sparks">
              {SPARKS.map((spark, sparkIndex) => (
                <path
                  key={`spark-${sparkIndex}`}
                  className="fyr-spark"
                  d={spark}
                  pathLength={1}
                  stroke="#fbbf24"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeOpacity="0.75"
                  style={{ animationDelay: `${420 + sparkIndex * 90}ms` }}
                />
              ))}
            </g>

            <g className="fyr-spiral" style={{ transformOrigin: "1000px 420px" }}>
              <ellipse
                className="fyr-ring fyr-ring-outer"
                cx="1000"
                cy="420"
                rx="282"
                ry="104"
                stroke="#f97316"
                strokeOpacity="0.34"
                strokeWidth="1.1"
                strokeDasharray="3 20"
                transform="rotate(-26 1000 420)"
              />
              <ellipse
                className="fyr-ring fyr-ring-mid"
                cx="1000"
                cy="420"
                rx="236"
                ry="82"
                stroke="#fbbf24"
                strokeOpacity="0.42"
                strokeWidth="1.6"
                strokeDasharray="110 86"
                transform="rotate(18 1000 420)"
              />
              <ellipse
                className="fyr-ring fyr-ring-inner"
                cx="1000"
                cy="420"
                rx="184"
                ry="60"
                stroke="#fde68a"
                strokeOpacity="0.46"
                strokeWidth="2"
                strokeDasharray="150 300"
                transform="rotate(58 1000 420)"
              />
            </g>

            <g className="fyr-embers">
              {EMBERS.map((ember, emberIndex) => (
                <circle
                  key={`ember-${emberIndex}`}
                  className="fyr-ember"
                  cx={ember.x}
                  cy={ember.y}
                  r={ember.r}
                  fill={emberIndex % 4 === 0 ? "#fde68a" : "#f97316"}
                  style={{
                    animationDelay: `${ember.delay}ms`,
                    animationDuration: `${ember.duration}ms`,
                    ["--fyr-drift" as string]: `${ember.drift}px`,
                  }}
                />
              ))}
            </g>

            <g className="fyr-pulse">
              <circle
                className="fyr-pulse-core"
                cx="1000"
                cy="420"
                r="140"
                fill="url(#fyr-pulse-fill)"
              />
              <circle
                className="fyr-pulse-ring"
                cx="1000"
                cy="420"
                r="158"
                stroke="#fde68a"
                strokeOpacity="0.6"
                strokeWidth="1.4"
              />
            </g>
          </svg>
        </div>

        <div className="fyr-copy">
          <p className="fyr-kicker">
            <span aria-hidden="true" className="fyr-kicker-line" />
            Record {code} · Fire Release · Katon
          </p>

          <h3 className="fyr-title" id="fyr-title">
            <span className="fyr-title-text">{mission.name}</span>
          </h3>

          <p className="fyr-role">{classification} · {discipline}</p>

          <p className="fyr-client">
            <span aria-hidden="true" className="fyr-client-dot" />
            Client-owned engagement · no public build
          </p>

          <p className="fyr-intro">
            A multi-channel outreach engagement: lead lists arrive as files, are
            worked in one place, and leave through WhatsApp, email and AI voice
            calls — with the templates, credentials and follow-ups accounted for
            on the way.
          </p>

          <dl className="fyr-notes">
            <div>
              <dt>The problem</dt>
              <dd>
                Outreach was manual. Lists sat in spreadsheets, the same message
                was copied between tools, and calls were placed one lead at a
                time with no shared record of who had been reached.
              </dd>
            </div>
            <div>
              <dt>The response</dt>
              <dd>
                Extraction, a central lead queue and three outreach channels were
                assembled into one pipeline, so a lead keeps its history across
                every conversation.
              </dd>
            </div>
          </dl>

          <p className="fyr-disclaimer">
            Client-owned platform · implemented during the Simplita AI
            engagement · no client lists or results are shown
          </p>
        </div>

        <span
          aria-label={`Mission rank ${mission.rank}`}
          className="fyr-rank"
        >
          {mission.rank}
        </span>

        <p className="fyr-caption">
          <span aria-hidden="true" className="fyr-caption-dot" />
          Katon · the spark opens the network
        </p>

        <span className="fyr-glyph font-jp" aria-hidden="true">
          火
        </span>
      </section>

      {/* ---------------- B — the branching network ---------------- */}
      <section className="fyr-net" aria-labelledby="fyr-net-title">
        <div className="fyr-net-inner">
          <Reveal className="fyr-net-head">
            <p className="fyr-eyebrow">The outreach network</p>
            <h4 className="fyr-net-title" id="fyr-net-title">
              One queue, three ways to reach a lead.
            </h4>
            <p className="fyr-net-note">
              An explanatory diagram of the implemented pipeline. It is not a
              product interface, and it carries no client lead data.
            </p>
          </Reveal>

          <div className="fyr-net-grid">
            <div className="fyr-col fyr-col-source">
              {SOURCES.map((source, sourceIndex) => (
                <Reveal
                  key={source.title}
                  className="fyr-node"
                  delay={sourceIndex * 100}
                >
                  <span className="fyr-node-index">
                    {String(sourceIndex + 1).padStart(2, "0")}
                  </span>
                  <h5 className="fyr-node-title">{source.title}</h5>
                  <p className="fyr-node-body">{source.body}</p>
                </Reveal>
              ))}
            </div>

            <Reveal className="fyr-hub" delay={220}>
              <span className="fyr-hub-label">Stage 03</span>
              <h5 className="fyr-hub-title">Lead management</h5>
              <p className="fyr-hub-body">
                Every extracted lead lands in one working queue: deduplicated,
                assigned a status and kept available to whichever channel reaches
                it next.
              </p>
              <span aria-hidden="true" className="fyr-hub-core" />
            </Reveal>

            <div className="fyr-col fyr-col-channels">
              {CHANNELS.map((channel, channelIndex) => {
                const Icon = channel.icon;
                return (
                  <Reveal
                    key={channel.title}
                    className="fyr-channel"
                    delay={320 + channelIndex * 100}
                  >
                    <span aria-hidden="true" className="fyr-channel-link" />
                    <span className="fyr-channel-icon">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <h5 className="fyr-channel-title">{channel.title}</h5>
                      <p className="fyr-channel-body">{channel.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal className="fyr-net-foot" delay={180}>
            <span className="fyr-foot-tag">One lead · one history</span>
            <p>
              Replies and call outcomes are written back to the lead, so the next
              step in the sequence starts from what actually happened rather than
              from the original list.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- C — the editorial record ---------------- */}
      <section className="fyr-record" aria-labelledby="fyr-record-title">
        <div className="fyr-record-inner">
          <Reveal className="fyr-record-head">
            <p className="fyr-eyebrow">Record {code} · the engagement</p>
            <h4 className="fyr-record-title" id="fyr-record-title">
              Outreach that starts from a list and ends in a conversation.
            </h4>
            <p className="fyr-record-lede">
              Saravaraj AI works lead lists for client outreach. The build joins
              file extraction, lead management and three communication channels,
              including voice agents that can place the call without a person
              dialling each number.
            </p>
          </Reveal>

          <div className="fyr-record-grid">
            <Reveal className="fyr-panel" delay={80}>
              <p className="fyr-panel-label">What is implemented</p>
              <ul className="fyr-feature-list">
                {FEATURES.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true" className="fyr-feature-mark" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="fyr-panel-stack">
              <Reveal className="fyr-panel" delay={140}>
                <p className="fyr-panel-label">Technology</p>
                <ul className="fyr-stack">
                  {mission.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>

              {mission.integrations?.length ? (
                <Reveal className="fyr-panel" delay={170}>
                  <p className="fyr-panel-label">Integrations</p>
                  <ul className="fyr-stack" aria-label="External integrations">
                    {mission.integrations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              <Reveal className="fyr-panel fyr-panel-quiet" delay={200}>
                <p className="fyr-panel-label">What this record does not claim</p>
                <p className="fyr-panel-body">
                  No conversation rates, connection rates, lead volumes or client
                  names appear here. The platform is client-owned, no public build
                  exists, and the network above is the implemented pipeline rather
                  than a measured campaign.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
