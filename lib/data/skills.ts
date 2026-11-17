export type SkillCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: "code" | "layout" | "server" | "database" | "sparkles" | "wrench";
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: "ninjutsu",
    title: "Ninjutsu",
    subtitle: "Frontend engineering",
    icon: "code",
    skills: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Redux",
      "Reusable component architecture",
      "Responsive design",
      "Accessibility",
      "Design-to-code",
      "Performance optimization",
    ],
  },
  {
    id: "taijutsu",
    title: "Taijutsu",
    subtitle: "Backend engineering",
    icon: "server",
    skills: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "REST APIs",
      "Python",
    ],
  },
  {
    id: "chakra-control",
    title: "Chakra Control",
    subtitle: "Databases and infrastructure",
    icon: "database",
    skills: [
      "PostgreSQL",
      "Supabase",
      "MongoDB",
      "Git",
      "GitHub",
      "Vercel",
      "Firebase",
      "Postman",
      "VS Code",
    ],
  },
  {
    id: "genjutsu-research",
    title: "Genjutsu Research",
    subtitle: "AI engineering and experimentation",
    icon: "sparkles",
    skills: [
      "LLM integrations",
      "RAG",
      "MCP tools",
      "Workflow automation",
      "AI voice agents",
      "Vapi",
      "Bolna",
    ],
  },
];
