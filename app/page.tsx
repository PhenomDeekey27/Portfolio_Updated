import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LenisScroll from "@/components/LenisScroll";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Missions from "@/components/Missions";
import Experience from "@/components/Experience";
import Contact from "@/components/ContactUs";
import Footer from "@/components/Footer";
import { WorldRevealController } from "@/components/transitions/WorldRevealController";
import { TeleportationController } from "@/components/transitions/TeleportationController";
import { profile, siteMetadata } from "@/lib/data/profile";

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: [...siteMetadata.keywords],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteMetadata.title,
    description: siteMetadata.description,
    siteName: `${profile.name} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Villupuram",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: [
    "Full-stack application development",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "FastAPI",
    "PostgreSQL",
    "Supabase",
    "LLM integrations",
    "RAG",
    "Workflow automation",
  ],
};

export default function HomePage() {
  return (
    <WorldRevealController>
      <TeleportationController>
      <div className="relative min-h-screen overflow-x-clip bg-void text-bone">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div className="grain" aria-hidden="true" />

        <LenisScroll />
        <Navbar />

        <main id="main-content">
          <Hero />
          <About />
          <Skills />
          <Missions />
          <Experience />
          <Contact />
        </main>

        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </div>
      </TeleportationController>
    </WorldRevealController>
  );
}
