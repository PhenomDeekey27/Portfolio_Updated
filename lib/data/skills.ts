export type SkillCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: "code" | "layout" | "server" | "database" | "sparkles" | "wrench";
  skills: string[];
};

/**
 * Capability groups, not a frontend-first list.
 *
 * The Naruto chapter names stay (they are the visual language of the section);
 * what each chapter *contains* is organised around the work a full-stack
 * developer is actually hired for: application engineering, backend and data,
 * cloud and integrations, and AI systems. Every entry is a technology or
 * capability that appears in the résumé record or in a project in this
 * portfolio — no proficiency levels, no years, nothing aspirational.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: "ninjutsu",
    title: "Full-Stack Engineering",
    subtitle: "Applications, interfaces and delivery",
    icon: "code",
    skills: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Express.js",
      "REST APIs",
      "Reusable component architecture",
      "Responsive design",
      "Accessibility",
      "Performance optimization",
    ],
  },
  {
    id: "taijutsu",
    title: "Backend & Data Systems",
    subtitle: "Services, schemas and storage",
    icon: "database",
    skills: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Supabase",
      "MongoDB",
      "Authentication",
      "Database design",
      "Data modelling",
      "API integration",
    ],
  },
  {
    id: "chakra-control",
    title: "Cloud, Integrations & Automation",
    subtitle: "Deployment, connected APIs and workflows",
    icon: "wrench",
    skills: [
      "Git",
      "GitHub",
      "Vercel",
      "Firebase",
      "Postman",
      "Zoho CRM",
      "Meta APIs",
      "WhatsApp",
      "Telegram",
      "Google Drive",
      "Workflow automation",
    ],
  },
  {
    id: "genjutsu-research",
    title: "AI & LLM Engineering",
    subtitle: "Models, retrieval and voice workflows",
    icon: "sparkles",
    skills: [
      "LLM integrations",
      "RAG",
      "MCP tools",
      "OpenAI APIs",
      "AI voice agents",
      "Vapi",
      "Bolna",
    ],
  },
];
