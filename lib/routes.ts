/**
 * Section routing.
 *
 * The portfolio is one continuous document, but every section owns a real URL
 * (`/skills`, `/missions`, …) instead of a fragment (`/#skills`). Those paths
 * are served by `app/[section]/page.tsx`, so a shared link opens the portfolio
 * already standing in that section, while in-page navigation still travels
 * through the Flying Raijin controller.
 */

export const SECTION_IDS = [
  "home",
  "about",
  "skills",
  "missions",
  "experience",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: string | null | undefined): value is SectionId {
  return !!value && (SECTION_IDS as readonly string[]).includes(value);
}

/** Canonical path for a section. Home lives at the document root. */
export function sectionPath(id: SectionId): string {
  return id === "home" ? "/" : `/${id}`;
}

/** Resolve the section a pathname belongs to. Unknown paths return null. */
export function sectionFromPath(pathname: string): SectionId | null {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (!segment) return "home";
  return isSectionId(segment) ? segment : null;
}

/** True when the URL already points at this section (no hash fragments). */
export function isCurrentSection(id: SectionId): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.pathname === sectionPath(id) && window.location.hash === ""
  );
}
