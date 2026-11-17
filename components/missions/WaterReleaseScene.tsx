"use client";

import { ArrowDown } from "lucide-react";
import type { Mission } from "@/lib/data/missions";
import Reveal from "@/components/ui/Reveal";
import { useEncounterActive } from "./useEncounterActive";

/**
 * PHASE 6.10 — WATER RELEASE (Suiton): ENN Consultancy.
 *
 * Composition identity: convergence. Streams enter from both edges of a
 * midnight chamber, bend toward the middle and close into a slowly turning
 * water ring. The ring releases a pulse, the title surfaces through the water,
 * and the formation opens into a five-stage operation flow underneath.
 *
 * Unlike the sand storm and the wind formation, everything here is horizontal
 * and circular: broad sheets, curved streams, elliptical rings. No canvas, no
 * per-frame state, no scroll locking. The current is re-armed by
 * `useEncounterActive` on every entry, both directions (phase 6.13).
 * The workflow diagram is an explanatory illustration built from the verified
 * engagement, not a mock client interface.
 */

type Stream = {
  d: string;
  width: number;
  delay: number;
  duration: number;
};

/** Left half of the chamber; the right half is the same set mirrored. */
const STREAMS: Stream[] = [
  {
    d: "M-140 742 C 190 706, 376 640, 540 552 C 636 500, 692 470, 726 446",
    width: 3.2,
    delay: 0,
    duration: 1500,
  },
  {
    d: "M-140 606 C 200 574, 388 512, 552 434 C 646 388, 700 372, 730 358",
    width: 2.2,
    delay: 70,
    duration: 1400,
  },
  {
    d: "M-140 470 C 196 456, 380 430, 548 402 C 650 384, 702 380, 732 380",
    width: 3.6,
    delay: 130,
    duration: 1550,
  },
  {
    d: "M-140 336 C 200 340, 384 366, 550 402 C 648 424, 700 440, 730 452",
    width: 2.4,
    delay: 190,
    duration: 1450,
  },
  {
    d: "M-140 208 C 214 250, 402 346, 566 428 C 652 470, 700 492, 730 508",
    width: 1.8,
    delay: 250,
    duration: 1600,
  },
];

/** Broad translucent water sheets crossing the chamber. */
const SHEETS = [
  {
    d: "M-160 806 C 240 742, 520 640, 760 546 C 1000 452, 1240 396, 1600 340",
    width: 30,
    delay: 60,
    duration: 2300,
  },
  {
    d: "M-160 632 C 250 582, 520 500, 770 424 C 1020 348, 1252 312, 1600 270",
    width: 16,
    delay: 180,
    duration: 2100,
  },
  {
    d: "M-160 400 C 250 372, 520 330, 780 300 C 1030 272, 1260 258, 1600 236",
    width: 9,
    delay: 300,
    duration: 2000,
  },
];

/** Deterministic droplets that ride the vortex.
 *
 * Coordinates are rounded to two decimals: Node and the browser can differ in
 * the last float digit, which produced a React hydration mismatch on `cx`. */
const round2 = (value: number) => Math.round(value * 100) / 100;

const DROPS = Array.from({ length: 16 }, (_, index) => {
  const angle = (index * 360) / 16 + 9;
  const radius = 236 + (index % 3) * 24;
  const rad = (angle * Math.PI) / 180;
  return {
    x: round2(720 + Math.cos(rad) * radius),
    y: round2(430 + Math.sin(rad) * radius * 0.42),
    r: 1.4 + (index % 3) * 0.7,
    delay: 900 + (index % 8) * 90,
  };
});

/** The verified operation flow. */
const STAGES = [
  {
    title: "Customer",
    body: "An ISO certification enquiry begins in a conversation the consultancy already uses, on WhatsApp, Telegram or email.",
  },
  {
    title: "Information",
    body: "The enquiry is collected into a customer record: who they are, what certification they need and where the thread stands.",
  },
  {
    title: "CRM",
    body: "Zoho CRM receives the record through a webhook, so the pipeline, the owner and the reminder sequence read from one source.",
  },
  {
    title: "Follow-up",
    body: "A multi-stage reminder sequence runs on days 2, 5 and 7 across WhatsApp, email and Telegram. The owner is notified on day 10.",
  },
  {
    title: "Payment & documents",
    body: "Payment reminders keep the engagement moving, and finished documents are stored and shared through Google Drive automation.",
  },
];

const FEATURES = [
  "Webhook intake from Zoho CRM into the messaging layer",
  "Multi-stage reminder workflows on days 2, 5 and 7",
  "WhatsApp, Telegram and email communication",
  "Owner notification on day 10 for quiet threads",
  "Payment reminders tied to the engagement stage",
  "Google Drive document storage and sharing automation",
];

export default function WaterReleaseScene({
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
      data-jutsu="water"
      data-active={active ? "true" : "false"}
      className="wtr border-t border-gold/10 first:border-t-0"
    >
      {/* ---------------- A — the converging current ---------------- */}
      <section ref={ref} className="wtr-stage" aria-labelledby="wtr-title">
        <span className="wtr-env" aria-hidden="true" />
        <span className="wtr-veil" aria-hidden="true" />

        <div className="wtr-field" aria-hidden="true">
          <svg
            className="wtr-field-svg"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            focusable="false"
          >
            <defs>
              <linearGradient id="wtr-sheet" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#0e7490" stopOpacity="0" />
                <stop offset="0.38" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="0.68" stopColor="#a5f3fc" stopOpacity="0.16" />
                <stop offset="1" stopColor="#0e7490" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wtr-stream" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="0.44" stopColor="#67e8f9" stopOpacity="0.52" />
                <stop offset="1" stopColor="#a5f3fc" stopOpacity="0.78" />
              </linearGradient>
              <linearGradient id="wtr-stream-soft" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#0e7490" stopOpacity="0" />
                <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="1" stopColor="#67e8f9" stopOpacity="0.26" />
              </linearGradient>
              <radialGradient id="wtr-core-fill">
                <stop offset="0" stopColor="#a5f3fc" stopOpacity="0.24" />
                <stop offset="0.42" stopColor="#0891b2" stopOpacity="0.14" />
                <stop offset="1" stopColor="#04121c" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="wtr-splash-fill">
                <stop offset="0" stopColor="#a5f3fc" stopOpacity="0.42" />
                <stop offset="0.58" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="1" stopColor="#0891b2" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle
              className="wtr-core"
              cx="720"
              cy="430"
              r="330"
              fill="url(#wtr-core-fill)"
            />

            <g className="wtr-sheets">
              {SHEETS.map((sheet, sheetIndex) => (
                <path
                  key={`sheet-${sheetIndex}`}
                  className="wtr-sheet"
                  d={sheet.d}
                  pathLength={1}
                  stroke="url(#wtr-sheet)"
                  strokeWidth={sheet.width}
                  strokeLinecap="round"
                  style={{
                    animationDelay: `${sheet.delay}ms`,
                    animationDuration: `${sheet.duration}ms`,
                  }}
                />
              ))}
            </g>

            <g className="wtr-streams">
              {STREAMS.map((stream, streamIndex) => (
                <g key={`left-${streamIndex}`}>
                  <path
                    className="wtr-stream-soft"
                    d={stream.d}
                    pathLength={1}
                    stroke="url(#wtr-stream-soft)"
                    strokeWidth={stream.width * 3}
                    strokeLinecap="round"
                    style={{
                      animationDelay: `${stream.delay}ms`,
                      animationDuration: `${stream.duration}ms`,
                    }}
                  />
                  <path
                    className="wtr-stream"
                    d={stream.d}
                    pathLength={1}
                    stroke="url(#wtr-stream)"
                    strokeWidth={stream.width}
                    strokeLinecap="round"
                    style={{
                      animationDelay: `${stream.delay}ms`,
                      animationDuration: `${stream.duration}ms`,
                    }}
                  />
                </g>
              ))}
              <g transform="translate(1440 0) scale(-1 1)">
                {STREAMS.map((stream, streamIndex) => (
                  <g key={`right-${streamIndex}`}>
                    <path
                      className="wtr-stream-soft"
                      d={stream.d}
                      pathLength={1}
                      stroke="url(#wtr-stream-soft)"
                      strokeWidth={stream.width * 3}
                      strokeLinecap="round"
                      style={{
                        animationDelay: `${stream.delay + 60}ms`,
                        animationDuration: `${stream.duration}ms`,
                      }}
                    />
                    <path
                      className="wtr-stream"
                      d={stream.d}
                      pathLength={1}
                      stroke="url(#wtr-stream)"
                      strokeWidth={stream.width}
                      strokeLinecap="round"
                      style={{
                        animationDelay: `${stream.delay + 60}ms`,
                        animationDuration: `${stream.duration}ms`,
                      }}
                    />
                  </g>
                ))}
              </g>
            </g>

            <g className="wtr-vortex" style={{ transformOrigin: "720px 430px" }}>
              <ellipse
                className="wtr-ring wtr-ring-outer"
                cx="720"
                cy="430"
                rx="286"
                ry="104"
                stroke="#67e8f9"
                strokeOpacity="0.34"
                strokeWidth="1.1"
                strokeDasharray="3 18"
                transform="rotate(-14 720 430)"
              />
              <ellipse
                className="wtr-ring wtr-ring-mid"
                cx="720"
                cy="430"
                rx="244"
                ry="86"
                stroke="#a5f3fc"
                strokeOpacity="0.42"
                strokeWidth="1.6"
                strokeDasharray="120 78"
                transform="rotate(24 720 430)"
              />
              <ellipse
                className="wtr-ring wtr-ring-inner"
                cx="720"
                cy="430"
                rx="196"
                ry="64"
                stroke="#22d3ee"
                strokeOpacity="0.5"
                strokeWidth="2"
                strokeDasharray="180 320"
                transform="rotate(66 720 430)"
              />
            </g>

            <g className="wtr-drops">
              {DROPS.map((drop, dropIndex) => (
                <circle
                  key={`drop-${dropIndex}`}
                  className="wtr-drop"
                  cx={drop.x}
                  cy={drop.y}
                  r={drop.r}
                  fill="#a5f3fc"
                  style={{ animationDelay: `${drop.delay}ms` }}
                />
              ))}
            </g>

            <g className="wtr-splash">
              <circle
                className="wtr-splash-core"
                cx="720"
                cy="430"
                r="150"
                fill="url(#wtr-splash-fill)"
              />
              <circle
                className="wtr-splash-ring"
                cx="720"
                cy="430"
                r="170"
                stroke="#a5f3fc"
                strokeOpacity="0.55"
                strokeWidth="1.4"
              />
            </g>
          </svg>
        </div>

        <div className="wtr-copy">
          <p className="wtr-kicker">
            <span aria-hidden="true" className="wtr-kicker-line" />
            Record {code} · Water Release · Suiton
          </p>

          <h3 className="wtr-title" id="wtr-title">
            <span className="wtr-title-text">{mission.name}</span>
          </h3>

          <p className="wtr-role">{classification} · {discipline}</p>

          <p className="wtr-client">
            <span aria-hidden="true" className="wtr-client-dot" />
            Client-owned engagement · no public build
          </p>

          <p className="wtr-intro">
            An ISO certification consultancy engagement where enquiries arrive
            as conversations, not tickets. The system carries each one through
            onboarding, CRM tracking and a multi-stage follow-up without losing
            the thread.
          </p>

          <dl className="wtr-notes">
            <div>
              <dt>The problem</dt>
              <dd>
                Follow-ups lived in inboxes and chat threads. An enquiry could
                stall between the first message and the next scheduled reminder,
                with no single record of where it stopped.
              </dd>
            </div>
            <div>
              <dt>The response</dt>
              <dd>
                CRM webhooks, messaging bots and document automation were joined
                into one sequence, so every stage writes back to the same
                customer record.
              </dd>
            </div>
          </dl>

          <p className="wtr-disclaimer">
            Client-owned platform · implemented during the Simplita AI
            engagement · figures and interface are not published
          </p>
        </div>

        <span
          aria-label={`Mission rank ${mission.rank}`}
          className="wtr-rank"
        >
          {mission.rank}
        </span>

        <p className="wtr-caption">
          <span aria-hidden="true" className="wtr-caption-dot" />
          Suiton · the current gathers the record
          <ArrowDown aria-hidden="true" className="wtr-caption-arrow" />
        </p>

        <span className="wtr-glyph font-jp" aria-hidden="true">
          水
        </span>
      </section>

      {/* ---------------- B — the operation flow ---------------- */}
      <section className="wtr-flow" aria-labelledby="wtr-flow-title">
        <div className="wtr-flow-inner">
          <Reveal className="wtr-flow-head">
            <div>
              <p className="wtr-eyebrow">The operation flow</p>
              <h4 className="wtr-flow-title" id="wtr-flow-title">
                Each enquiry follows the same current.
              </h4>
            </div>
            <p className="wtr-flow-note">
              An explanatory diagram of the implemented workflow. It is not a
              capture of the client platform, and no client data appears in it.
            </p>
          </Reveal>

          <div className="wtr-track">
            {STAGES.map((stage, stageIndex) => (
              <Reveal
                key={stage.title}
                as="article"
                className="wtr-node"
                delay={stageIndex * 90}
              >
                <div className="wtr-node-head">
                  <span className="wtr-node-index">
                    {String(stageIndex + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden="true" className="wtr-node-drop" />
                </div>
                <h5 className="wtr-node-title">{stage.title}</h5>
                <p className="wtr-node-body">{stage.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="wtr-flow-foot" delay={140}>
            <span className="wtr-foot-tag">Day 2 · 5 · 7</span>
            <p>
              Reminders are staged, not repeated blindly: each message belongs to
              a step in the engagement, and the sequence stops when the customer
              responds.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- C — the editorial record ---------------- */}
      <section className="wtr-record" aria-labelledby="wtr-record-title">
        <div className="wtr-record-inner">
          <Reveal className="wtr-record-head">
            <p className="wtr-eyebrow">Record {code} · the engagement</p>
            <h4 className="wtr-record-title" id="wtr-record-title">
              One customer record, followed all the way through.
            </h4>
            <p className="wtr-record-lede">
              ENN Consultancy guides businesses through ISO certification. The
              work here is operational: make sure a new enquiry becomes a
              tracked customer, and that the follow-up, the payment reminder and
              the documents all attach to that same record.
            </p>
          </Reveal>

          <div className="wtr-record-grid">
            <Reveal className="wtr-panel wtr-panel-wide" delay={80}>
              <p className="wtr-panel-label">What is implemented</p>
              <ul className="wtr-feature-list">
                {FEATURES.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true" className="wtr-feature-mark" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="wtr-panel" delay={140}>
              <p className="wtr-panel-label">Stack</p>
              <ul className="wtr-stack">
                {mission.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="wtr-panel-note">
                The engagement sat inside a larger product engineering role; this
                record covers only the ENN automation surface.
              </p>
            </Reveal>

            <Reveal className="wtr-panel wtr-panel-quiet" delay={200}>
              <p className="wtr-panel-label">What this record does not claim</p>
              <p className="wtr-panel-body">
                No conversion rates, response times, customer counts or revenue
                figures are shown. The platform is client-owned, no public build
                exists, and the workflow above is the implemented sequence rather
                than a measured result.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </article>
  );
}
