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

export type Mission = {
  id: string;
  name: string;
  category: string;
  rank: MissionRank;
  description: string;
  highlights: string[];
  stack: string[];
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
      "An AI developer tool that investigates a GitHub issue against the actual repository, then explains a likely root cause with code evidence and a reviewable patch.",
    highlights: [
      "Repository analysis",
      "Issue investigation",
      "Code tracing",
      "Root-cause analysis and patch preview",
      "Branch and pull-request workflow",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "GitHub API",
      "LLM integrations",
    ],
    links: {
      github: "https://github.com/PhenomDeekey27/BugWiser",
      live: "https://bug-wiser.vercel.app/",
    },
    note:
      "Hackathon project associated with Micro1. Open-source developer tool: patches are generated for review, never applied automatically.",
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
    stack: ["Kotlin", "Jetpack Compose", "Android Sensors", "FastAPI backend"],
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
      "A professional client engagement focused on connecting CRM data with automated communication and document workflows.",
    highlights: [
      "CRM integrations",
      "WhatsApp automation",
      "Telegram and email bots",
      "Zoho CRM",
      "Meta APIs",
      "Payment reminders",
      "Google Drive integration",
    ],
    stack: ["Zoho CRM", "Meta APIs", "WhatsApp", "Telegram", "Google Drive"],
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
      "A professional client engagement building multi-channel outreach automation with lead management and AI voice agents.",
    highlights: [
      "Multi-channel outreach automation",
      "Lead management",
      "Email integrations",
      "WhatsApp integrations",
      "AI voice agents using Vapi and Bolna",
      "Credential management",
    ],
    stack: ["Vapi", "Bolna", "Email", "WhatsApp", "LLM integrations"],
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
