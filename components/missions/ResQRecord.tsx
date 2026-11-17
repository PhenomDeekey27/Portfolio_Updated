import Image from "next/image";
import { ArrowUpRight, Download, ShieldAlert } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { Mission } from "@/lib/data/missions";
import { resqRecordScreens, resqScreens } from "@/lib/data/resqGallery";
import Reveal from "../ui/Reveal";

/**
 * Editorial record for ResQ.
 *
 * Every claim below is traceable to the ResQ Android repository README and
 * source (`phenomdeekey271020/ResQ-Android`), to the release page, or to the
 * screens shown — which are frames of the running build. Nothing planned,
 * disabled or unverified is presented as working.
 *
 * The counts and defaults quoted here come from the code: a 12-sample window,
 * at least three abnormal samples plus rotation evidence, 10 s / 5 s alert
 * countdowns, a further 10 s confirmation window, and one SMS per incident
 * followed by at most one call attempt to the primary contact.
 */

const SCREEN = { width: 486, height: 1018 } as const;

function screenById(id: string) {
  return resqScreens.find((screen) => screen.id === id);
}

const CHAPTERS = [
  {
    id: "protection",
    index: "01",
    label: "Protection",
    heading: "A foreground service that watches, and can be switched off.",
    body: [
      "ResQ starts protection only when the user asks it to. A foreground service keeps accelerometer, gyroscope and location callbacks arriving with the screen off, and posts an ongoing notification so monitoring is always visible.",
      "It never re-arms itself: there is no boot receiver, the service is START_NOT_STICKY, and the home screen can pause protection outright. The same screen carries the build label, so the prototype status is on the surface rather than buried.",
    ],
    screens: [
      {
        ...resqRecordScreens.homeLight,
        caption: "Design reference · protection home, light appearance (PDF page 1).",
      },
      {
        ...resqRecordScreens.homeDark,
        caption: "Design reference · protection home, dark appearance (PDF page 2).",
      },
    ],
  },
  {
    id: "detection",
    index: "02",
    label: "Detection and response",
    heading: "Several signals must agree before the app asks anything.",
    body: [
      "The detector is a hand-tuned weighted score over a short sliding window — 12 samples — not a trained model. It only leaves Normal after at least three abnormal samples in the window, and rotation evidence is required: a straight-line deceleration looks identical to a hard brake, so acceleration alone can never reach the alert bands.",
      "The result is a possible incident, never a certainty. A countdown then asks the user whether they are okay — 10 seconds at the possible level, 5 at high confidence, configurable in settings — with “I’m OK — Cancel Alert” beside “I Need Help Now”. It is spoken aloud through the device’s text-to-speech when audio is available, and the screen states that nothing has been sent yet.",
      "If the countdown runs out, a second, 10-second unconfirmed-safety window opens before escalation, so one event cannot raise two incidents.",
    ],
    screens: [
      {
        ...SCREEN,
        src: screenById("accident-detected")!.image.src,
        alt: screenById("accident-detected")!.alt,
        caption:
          "Design reference · the alert and its countdown (PDF page 6).",
      },
    ],
  },
  {
    id: "emergency",
    index: "03",
    label: "Emergency assistance",
    heading: "One message per incident, then one call attempt.",
    body: [
      "Escalation is dispatched by the foreground service rather than the screen, so it still runs when the activity is gone. One SMS per incident is sent from the user’s own SIM to each eligible saved contact — and only when SMS consent is on, SEND_SMS is granted and a SIM is present.",
      "The message states what was detected, when, and what the recipient should do, plus a location line only when a plausible position exists. After the carrier accepts a message, ResQ makes a single call attempt to the saved primary contact: a direct call with CALL_PHONE, otherwise a pre-filled dialer the user confirms. The design system presents the emergency state as sharing a live location; the released build sends one position line in the alert text rather than continuous tracking.",
      "The strongest claim the app makes is that it asked the phone to place a call — it cannot know whether the call rang, connected or was answered. The emergency number 112 is always a manual button through the dialer and is excluded from every automatic path.",
    ],
    screens: [
      {
        ...SCREEN,
        src: screenById("emergency-active")!.image.src,
        alt: screenById("emergency-active")!.alt,
        caption:
          "Design reference · the emergency state with contacts and hospitals (PDF page 7).",
      },
    ],
  },
  {
    id: "location",
    index: "04",
    label: "Location fallback",
    heading: "A missing coordinate never delays the message.",
    body: [
      "Every position line is labelled for what it actually is. A fresh fix is described as current; a cached or aged fix is described as last known, with its age, and never as where the user is now. With no usable position the alert is still sent — without a location line at all.",
      "The emergency screen explains the real reason a search cannot run: location switched off, permission missing, or a position that exists but is too old. It shows the coordinates it does hold, keeps Call 112 and the contact actions on screen, and asks for a refresh instead of guessing.",
    ],
    screens: [
      {
        ...SCREEN,
        src: screenById("location-unavailable")!.image.src,
        alt: screenById("location-unavailable")!.alt,
        caption:
          "Design reference · the location fallback keeps the call action (PDF page 8).",
      },
    ],
  },
  {
    id: "hospitals",
    index: "05",
    label: "Hospital information",
    heading: "Nearby help, listed as unverified search results.",
    body: [
      "While the emergency screen is open, the app sends its coordinates and the incident type — possible_accident — to its own FastAPI backend. The backend performs the Google Maps search through SerpApi, normalises and deduplicates the results, filters by radius and sorts them nearest first; the app re-sorts as a second guarantee.",
      "Each result is labelled “Not verified” and shows its distance and the phone number the provider returned. Call appears only when a number came back, and Directions only when the resource itself has coordinates. Nothing is presented as confirmed by a hospital.",
      "The details screen in the design system carries the address, phone, Call Hospital and Directions actions. The release build's resource cards expose the same call and directions actions; the build's details screen itself was not captured, so the design is shown here as a reference.",
    ],
    screens: [
      {
        ...SCREEN,
        src: screenById("hospital-details")!.image.src,
        alt: screenById("hospital-details")!.alt,
        caption:
          "Design reference · hospital details with call and directions (PDF page 9).",
      },
    ],
  },
  {
    id: "technical",
    index: "06",
    label: "Technical implementation",
    heading: "One pipeline, shared by the UI and the service.",
    body: [
      "Kotlin 2.2.10 and Jetpack Compose with Material 3, minSdk 24 and targetSdk 37. A single ResQViewModel renders a typed UI state, while a process-wide ProtectionEngine keeps the UI and the foreground service from disagreeing about the current incident. Contacts, consent flags and the last-known-position cache live in private SharedPreferences; there is no database and no analytics library.",
      "Networking is OkHttp with kotlinx.serialization. The FastAPI backend is stateless — no database, no cache, no stored user data — and holds the only credential, the SerpApi key; the Android app has none.",
      "Cloud voice escalation is a specified but permanently disabled interface. The prototype does no cloud calling.",
    ],
    screens: [
      {
        ...SCREEN,
        src: screenById("test-mode")!.image.src,
        alt: screenById("test-mode")!.alt,
        caption:
          "Design reference · test mode with sensor state and simulations (PDF page 5).",
      },
    ],
  },
] as const;

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
            <p className="wnd-record-eyebrow">Case study · hackathon prototype</p>
            <h4 id="wnd-record-title" className="wnd-record-title">
              {mission.name}
            </h4>
          </Reveal>

          <Reveal delay={90}>
            <p className="wnd-record-dek">{mission.description}</p>
          </Reveal>
        </div>

        {CHAPTERS.map((chapter) => (
          <Reveal key={chapter.id}>
            <section
              id={`wnd-${chapter.id}`}
              className="wnd-chapter"
              aria-labelledby={`wnd-${chapter.id}-title`}
            >
              <div className="wnd-chapter-side">
                <p className="wnd-chapter-index">{chapter.index}</p>
                <p className="wnd-chapter-label">{chapter.label}</p>
                <h5 id={`wnd-${chapter.id}-title`} className="wnd-chapter-heading">
                  {chapter.heading}
                </h5>
              </div>

              <div className="wnd-chapter-main">
                {chapter.body.map((paragraph) => (
                  <p key={paragraph} className="wnd-chapter-body">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div
                className={`wnd-chapter-screens ${chapter.screens.length > 1 ? "is-pair" : ""}`}
              >
                {chapter.screens.map((screen) => (
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
        ))}

        <Reveal delay={60}>
          <div className="wnd-record-close">
            <div className="wnd-record-close-head">
              <p className="wnd-chapter-index">07</p>
              <p className="wnd-chapter-label">Access and classification</p>
              <h5 className="wnd-chapter-heading">
                Public repository. Published release. Prototype status.
              </h5>
            </div>

            <div className="wnd-record-close-main">
              <p className="wnd-chapter-body">
                ResQ is an Android application, so there is no live web build to
                open. The source repository and the signed release page are the
                verified entry points.
              </p>

              <ul className="wnd-stack" aria-label="Technology stack">
                {mission.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

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
                  prototype. It is not certified, not clinically or
                  regulatorily validated, and not a replacement for emergency
                  services. Detection can miss an incident or raise a false
                  alarm, and SMS delivery, calls, GPS and the resource backend
                  can each fail.
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <p className="wnd-record-source">
            Screens are application interface designs from the ResQ design
            system PDF (pages 1–9), not captures of the released APK. They
            contain generic demonstration content: no real names, personal
            phone numbers, coordinates or addresses. The behaviour described
            above was verified against the project source; the design screens
            and the implementation are labelled separately wherever they
            differ.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
