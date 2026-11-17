import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Manrope } from "next/font/google";
import { WorldProvider } from "@/components/worlds/WorldHost";
import "./globals.css";
import "./contact-world.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasthuri Rangan | Frontend-Focused Full Stack Developer",
  description:
    "Portfolio of Kasthuri Rangan — a frontend-focused full stack developer building scalable interfaces, AI-powered applications and real-world integrations.",
  authors: [{ name: "Kasthuri Rangan" }],
  creator: "Kasthuri Rangan",
};

export const viewport: Viewport = {
  themeColor: "#070809",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-bone">
        <WorldProvider>{children}</WorldProvider>
      </body>
    </html>
  );
}
