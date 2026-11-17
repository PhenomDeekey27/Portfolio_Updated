export type ExperienceType = "full-time" | "internship";

export type ExperienceItem = {
  /** Stable key and anchor fragment (presentation only). */
  id: string;
  company: string;
  /** Compact label used by the chapter rail (presentation only). */
  shortName: string;
  role: string;
  duration: string;
  /** Month-precision ISO values for <time dateTime>. Never a specific day. */
  start: string;
  end: string;
  type: ExperienceType;
  domain: string;
  points: string[];
  stack: string[];
};

export const experiences: ExperienceItem[] = [
  {
    id: "simplita",
    company: "Simplita AI Technologies Private Limited",
    shortName: "Simplita AI",
    role: "Associate Software Engineer",
    duration: "Jul 2025 — Jul 2026",
    start: "2025-07",
    end: "2026-07",
    type: "full-time",
    domain: "Low-code platform and client integrations",
    points: [
      "Engineered scalable backend services, FastAPI REST APIs and reusable UI components for an enterprise-grade no-code platform.",
      "Designed and implemented Zoho CRM webhooks, multi-stage reminder workflows across WhatsApp, email and Telegram, and secure Google Drive automation for ENN Consultancy.",
      "Built multi-channel outreach automation integrated with email, WhatsApp and AI voice agents using Vapi and Bolna for Project Saravaraj.",
      "Developed automated document storage and secure credential key management systems.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Python",
      "FastAPI",
      "Supabase",
      "OpenAI APIs",
      "Zoho CRM",
      "MCP Tools",
      "Git",
    ],
  },
  {
    id: "revoltronx",
    company: "RevoltronX",
    shortName: "RevoltronX",
    role: "Full Stack Developer Intern",
    duration: "Oct 2024 — Jul 2025",
    start: "2024-10",
    end: "2025-07",
    type: "internship",
    domain: "Product engineering and gamification",
    points: [
      "Developed and enhanced web application features using the MERN stack with TypeScript, prioritising type safety and maintainable architecture.",
      "Engineered a gamified reward system with boarding passes and visitor visas based on user activity, improving engagement and retention.",
      "Improved UI/UX by resolving bugs, refining layouts and ensuring full responsiveness across devices.",
    ],
    stack: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Git",
    ],
  },
  {
    id: "get-into-dare",
    company: "Get Into Dare",
    shortName: "Get Into Dare",
    role: "Junior Web Developer Intern",
    duration: "Apr 2024 — Aug 2024",
    start: "2024-04",
    end: "2024-08",
    type: "internship",
    domain: "Full-stack product development",
    points: [
      "Built and maintained end-to-end features using the MERN stack for a scalable, responsive web application.",
      "Developed an AI-powered quiz generation system with daily randomized quizzes, streaks and a points reward system.",
      "Diagnosed and resolved critical frontend and backend issues, optimizing cross-device responsiveness.",
    ],
    stack: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB", "Git"],
  },
];
