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
import { personSchema } from "@/lib/data/seo";
import type { SectionId } from "@/lib/routes";

interface PortfolioPageProps {
  /** Section the document was requested at (`/skills` → "skills"). */
  initialSection?: SectionId;
}

/**
 * The portfolio document. Home (`app/page.tsx`) and the section routes
 * (`app/[section]/page.tsx`) render the same body; only the section the server
 * lands the visitor on changes.
 */
export default function PortfolioPage({
  initialSection = "home",
}: PortfolioPageProps) {
  return (
    <WorldRevealController initialSection={initialSection}>
      <TeleportationController initialSection={initialSection}>
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
