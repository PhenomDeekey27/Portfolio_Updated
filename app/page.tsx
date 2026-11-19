import type { Metadata } from "next";
import PortfolioPage from "@/components/PortfolioPage";
import { buildSectionMetadata } from "@/lib/data/seo";

export const metadata: Metadata = buildSectionMetadata("home");

export default function HomePage() {
  return <PortfolioPage initialSection="home" />;
}
