import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioPage from "@/components/PortfolioPage";
import { buildSectionMetadata } from "@/lib/data/seo";
import { SECTION_IDS, isSectionId, type SectionId } from "@/lib/routes";

/**
 * Section routes.
 *
 * The portfolio is one document, but every section has a real URL:
 * `/about`, `/skills`, `/missions`, `/experience`, `/contact`. Landing on one
 * renders the same page with that section already active, so links can be
 * shared without `#fragments` and the browser can reload them directly.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return SECTION_IDS.filter((id) => id !== "home").map((section) => ({
    section,
  }));
}

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

function resolveSection(raw: string): SectionId {
  const value = raw.toLowerCase();
  if (!isSectionId(value) || value === "home") notFound();
  return value;
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { section } = await params;
  return buildSectionMetadata(resolveSection(section));
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  return <PortfolioPage initialSection={resolveSection(section)} />;
}
