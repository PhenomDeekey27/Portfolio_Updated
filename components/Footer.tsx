import { ArrowUp, FileText } from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa6";
import KunaiMark from "./motifs/KunaiMark";
import SectionLink from "./ui/SectionLink";
import { profile } from "@/lib/data/profile";

const footerLinks = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "missions", label: "Missions" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

const socialLinks = [
  {
    href: profile.links.github,
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: profile.links.linkedin,
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    href: profile.links.whatsapp,
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
  {
    href: profile.links.instagram,
    label: "Instagram",
    icon: FaInstagram,
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-void">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
      />

      <div className="mx-auto w-full max-w-[1250px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold">
                <KunaiMark className="h-5 w-5 -rotate-12" strokeWidth={1.25} />
              </span>
              <div>
                <p className="text-[13px] font-semibold tracking-[0.18em] text-bone">
                  KASTHURI RANGAN
                </p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.26em] text-ash/50">
                  Frontend-focused full stack developer
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-xs leading-6 text-ash/55">
              Building interfaces and systems with intent — from Tamil Nadu,
              for the web.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 sm:flex sm:flex-wrap sm:gap-x-6">
            {footerLinks.map((link) => (
              <SectionLink
                key={link.id}
                sectionId={link.id}
                className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash/55 transition-colors hover:text-gold-soft"
              >
                {link.label}
              </SectionLink>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center border border-bone/10 text-ash/60 transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ash/55 transition-colors hover:text-gold-soft"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Résumé
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-bone/10 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ash/35">
            © {new Date().getFullYear()} Kasthuri Rangan · All rights reserved
          </p>

          <div className="flex items-center gap-5">
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.18em] text-ash/35 sm:inline">
              Designed &amp; built with intent
            </span>
            <SectionLink
              sectionId="home"
              className="group inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.18em] text-ash/55 transition-colors hover:text-gold-soft"
            >
              Back to top
              <ArrowUp
                className="h-3 w-3 transition-transform group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </SectionLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
