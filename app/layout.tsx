import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Manrope } from "next/font/google";
import { WorldProvider } from "@/components/worlds/WorldHost";
import { profile, siteMetadata } from "@/lib/data/profile";
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
  metadataBase: new URL(siteMetadata.url),
  title: siteMetadata.title,
  description: siteMetadata.description,
  authors: [{ name: profile.name }],
  creator: profile.name,
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
