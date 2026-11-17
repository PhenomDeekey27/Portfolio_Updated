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
    category: "Open Source · AI Developer Tooling",
    rank: "S",
    description:
      "An AI-powered developer debugging assistant that investigates GitHub repositories using actual code evidence to identify potential root causes and suggest fixes.",
    highlights: [
      "GitHub App integration",
      "Installation-token authentication",
      "AI provider abstraction",
      "Model discovery and routing",
      "Repository-aware debugging",
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
    cover: {
      kind: "screenshot",
      src: "/assets/missions/bugwiser-live.png",
      alt: "BugWiser landing page from the deployed application",
    },
  },
  {
    id: "resq",
    name: "ResQ",
    category: "Hackathon Prototype · Android",
    rank: "S",
    description:
      "A native Android emergency-response application designed to detect potential accidents using device sensors and guide users through an emergency confirmation workflow.",
    highlights: [
      "Kotlin and Jetpack Compose",
      "Device sensor integration",
      "Accident detection pipeline",
      "State-machine architecture",
      "GPS and foreground-service foundation",
    ],
    stack: ["Kotlin", "Jetpack Compose", "Android Sensors", "FastAPI backend"],
    links: {
      github: "https://github.com/phenomdeekey271020/ResQ-Android",
      release:
        "https://github.com/phenomdeekey271020/ResQ-Android/releases/tag/v1.0.1",
    },
    note:
      "Hackathon prototype. The alerting workflow is demonstrated; it does not dispatch ambulances or replace emergency services.",
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
