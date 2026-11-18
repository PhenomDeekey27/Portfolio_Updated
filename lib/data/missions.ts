export type MissionRank = "S" | "A";

export type MissionCover =
  | {
      kind: "screenshot";
      src: string;
      alt: string;
    }
  | {
      kind: "illustration";
      variant: "automation" | "outreach" | "emergency";
      alt: string;
    };

/**
 * Layer-by-layer stack, used by the editorial records.
 *
 * PHASE 6.17 — a flat list cannot tell a framework from a messaging channel.
 * The categories below are rendered only where they are verified; a project
 * without a database simply has no Database group. `stack` stays as the flat
 * technology list the cinematic scenes already render, so no scene markup had
 * to change for this phase.
 */
export type MissionStackGroup = {
  label: string;
  items: string[];
};

export type Mission = {
  id: string;
  name: string;
  category: string;
  rank: MissionRank;
  description: string;
  highlights: string[];
  stack: string[];
  /** Verified layers (Frontend / Backend / Database / AI / Infrastructure). */
  stackGroups?: MissionStackGroup[];
  /**
   * External platforms and channels the project talks to. Never technology.
   * Rendered separately from `stack` wherever the record markup allows it.
   */
  integrations?: string[];
  links: {
    github?: string;
    live?: string;
    /** Signed Android release / APK page, where one was published. */
    release?: string;
  };
  note?: string;
  client?: boolean;
  cover: MissionCover;
};

export type ArchiveProject = {
  id: string;
  name: string;
  description: string;
  image: string;
  stack: string[];
  live: string;
};

export const missions: Mission[] = [
  {
    id: "bugwiser",
    name: "BugWiser",
    category: "Hackathon Project · AI Developer Tooling",
    rank: "S",
    description:
      "An AI developer tool that investigates a GitHub issue against the real repository, explains the likely root cause with code evidence, and can carry a patch into a fix branch and pull request.",
    highlights: [
      "Repository analysis",
      "Issue investigation",
      "Code tracing",
      "Root-cause analysis and patch preview",
      "Branch and pull-request workflow",
    ],
    stack: ["Next.js", "TypeScript", "Supabase"],
    // Verified against the repository manifest and README (Phase 6.17).
    stackGroups: [
      {
        label: "Frontend",
        items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
      },
      { label: "Backend", items: ["Next.js API routes"] },
      { label: "Database", items: ["Supabase (PostgreSQL)"] },
      { label: "AI / LLM", items: ["Multi-provider LLM routing"] },
      { label: "Infrastructure", items: ["Vercel"] },
    ],
    integrations: ["GitHub OAuth", "GitHub REST API"],
    links: {
      github: "https://github.com/PhenomDeekey27/BugWiser",
      live: "https://bug-wiser.vercel.app/",
    },
    note:
      "Hackathon project associated with Micro1. Open-source developer tool: an accepted patch is applied to a new fix branch and opened as a pull request, and the default branch is never modified.",
    cover: {
      kind: "screenshot",
      src: "/assets/missions/bugwiser-live.png",
      alt: "BugWiser landing page from the deployed application",
    },
  },
  {
    id: "resq",
    name: "ResQ",
    category: "Hackathon Project · Android",
    rank: "S",
    description:
      "A native Android safety app that reads the phone's motion sensors, asks the traveller whether they are okay after a possible accident, and escalates to their saved contacts if nobody answers.",
    highlights: [
      "Sensor-based accident detection",
      "Confirmation and escalation workflow",
      "Emergency contact SMS and call attempt",
      "Location fallback",
      "Nearby emergency resources via SerpApi",
    ],
    stack: ["Kotlin", "Jetpack Compose", "Android Sensors", "FastAPI"],
    // Verified against both public repositories (Android client + backend).
    stackGroups: [
      {
        label: "Android app",
        items: [
          "Kotlin",
          "Jetpack Compose",
          "Material 3",
          "OkHttp",
          "kotlinx.serialization",
        ],
      },
      { label: "Backend", items: ["Python", "FastAPI", "Pydantic"] },
      {
        label: "Platform APIs",
        items: ["Accelerometer & gyroscope", "LocationManager", "SmsManager", "Telecom intents"],
      },
      { label: "Infrastructure", items: ["Render (backend service)"] },
    ],
    integrations: ["SerpApi"],
    links: {
      github: "https://github.com/phenomdeekey271020/ResQ-Android",
      release:
        "https://github.com/phenomdeekey271020/ResQ-Android/releases/tag/v1.0.1",
    },
    note:
      "Built for the SerpApi India Hackathon 2026. Prototype: it demonstrates an alerting workflow and does not dispatch ambulances or replace emergency services.",
    cover: {
      kind: "illustration",
      variant: "emergency",
      alt: "Original illustration of a phone-based emergency response beacon and sensor signal",
    },
  },
  {
    id: "enn-consultancy",
    name: "ENN Consultancy",
    category: "Client Project · Business Automation",
    rank: "A",
    description:
      "A client platform that turns a new enquiry into a tracked CRM record, then runs the follow-up, the payment reminder and the document workflow against that same customer.",
    highlights: [
      "CRM-driven onboarding and follow-ups",
      "Zoho CRM webhooks",
      "WhatsApp, Telegram and email automation",
      "Payment reminders",
      "Google Drive document automation",
    ],
    // Core technologies only. Zoho CRM and the messaging channels are
    // integrations, not stack (PHASE 6.18).
    stack: ["Next.js", "React", "Python", "FastAPI"],
    stackGroups: [
      { label: "Frontend", items: ["Next.js", "React"] },
      { label: "Backend", items: ["Python", "FastAPI"] },
    ],
    integrations: [
      "Zoho CRM",
      "WhatsApp",
      "Telegram",
      "Email",
      "Google Drive",
    ],
    links: {},
    note: "Delivered as part of professional client work. The platform is client-owned.",
    client: true,
    cover: {
      kind: "illustration",
      variant: "automation",
      alt: "Original illustration of connected CRM, messaging and document workflow nodes",
    },
  },
  {
    id: "saravaraj-ai",
    name: "Saravaraj AI",
    category: "Client Project · AI Outreach",
    rank: "A",
    description:
      "A full-stack outreach platform that turns client lead lists into conversations: file extraction, lead management, email and WhatsApp sequences, and AI voice agents that place the call.",
    highlights: [
      "Lead file extraction and lead management",
      "Email and WhatsApp outreach",
      "AI voice agents using Vapi and Bolna",
      "Credential management",
      "Multi-channel outreach automation",
    ],
    // Next.js/TypeScript/Python/FastAPI/Tailwind are the build; voice and
    // messaging services are integrations (see `integrations`).
    stack: ["Next.js", "TypeScript", "Python", "FastAPI", "Tailwind CSS"],
    stackGroups: [
      {
        label: "Frontend",
        items: ["Next.js", "TypeScript", "Tailwind CSS"],
      },
      { label: "Backend", items: ["Python", "FastAPI"] },
    ],
    integrations: ["Vapi", "Bolna", "WhatsApp", "Email"],
    links: {},
    note: "Delivered as part of professional client work. The platform is client-owned.",
    client: true,
    cover: {
      kind: "illustration",
      variant: "outreach",
      alt: "Original illustration of a multi-channel outreach network and voice waveform",
    },
  },
];

export const archiveProjects: ArchiveProject[] = [
  {
    id: "financely",
    name: "Financely",
    description: "A personal finance dashboard built with React and Redux.",
    image: "/assets/Financely.png",
    stack: ["React", "Redux Toolkit", "Firebase"],
    live: "https://financely-teal.vercel.app/",
  },
  {
    id: "phenom-commerce",
    name: "PhenomCommerce",
    description:
      "A full-stack commerce build with authentication, payments and media management.",
    image: "/assets/phenomCommerce.png",
    stack: ["Next.js", "Supabase", "Razorpay"],
    live: "https://next-js-commerce-beta.vercel.app/",
  },
  {
    id: "podcast-platform",
    name: "Podcast Platform",
    description:
      "A React and Firebase platform for publishing and listening to audio.",
    image: "/assets/Podcast.png",
    stack: ["React", "Redux Toolkit", "Firebase"],
    live: "https://podcast-platform-ten.vercel.app/",
  },
  {
    id: "cara-clothing",
    name: "Cara Clothing",
    description: "A responsive clothing storefront built with core web technology.",
    image: "/assets/Cara.png",
    stack: ["HTML", "CSS", "JavaScript"],
    live: "https://ecommerce-website-five-sable.vercel.app/",
  },
];
