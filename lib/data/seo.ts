import type { Metadata } from "next";
import { profile, siteMetadata } from "./profile";
import type { SectionId } from "@/lib/routes";

/** Structured data for the home document. */
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  url: siteMetadata.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Villupuram",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: [
    "Full-stack application development",
    "AI-powered application development",
    "Backend API development",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Supabase",
    "Database design",
    "LLM integrations",
    "RAG",
    "Workflow automation",
  ],
};

const SECTION_SEO: Record<
  SectionId,
  { title: string; description: string }
> = {
  home: {
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
  about: {
    title: `About ${profile.name} | AI-focused Full-Stack Developer`,
    description:
      "Meet Kasthuri Rangan, an AI-focused full-stack software developer building complete applications, backend APIs, integrations and AI-powered workflows.",
  },
  skills: {
    title: `Skills | ${profile.name} — Full-Stack & AI Engineering`,
    description:
      "The toolkit behind the work: React, Next.js, TypeScript, Python, FastAPI, PostgreSQL, Supabase, cloud integrations and AI / LLM engineering.",
  },
  missions: {
    title: `Missions | ${profile.name} — Projects & Case Studies`,
    description:
      "Selected builds by Kasthuri Rangan: BugWiser, ResQ, ENN Consultancy automation and Saravaraj AI outreach — each recorded with its problem, implementation and stack.",
  },
  experience: {
    title: `Experience | ${profile.name}`,
    description:
      "A chronicle of teams, products and responsibilities — from full-stack internships to product engineering, client integrations and independent delivery.",
  },
  contact: {
    title: `Contact | ${profile.name}`,
    description:
      "Start a conversation with Kasthuri Rangan about a product, an AI integration or a full-stack build.",
  },
};

export function buildSectionMetadata(section: SectionId = "home"): Metadata {
  const seo = SECTION_SEO[section];
  const canonical = section === "home" ? "/" : `/${section}`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: [...siteMetadata.keywords],
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      title: seo.title,
      description: seo.description,
      siteName: `${profile.name} Portfolio`,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
