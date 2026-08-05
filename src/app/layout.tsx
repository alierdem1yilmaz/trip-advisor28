import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ChatWidget } from "@/components/ChatWidget";
import { LanguageProvider } from "@/lib/i18n/language-context";
import "./globals.css";

// Fraunces (warm editorial serif) for display type + Manrope (rounded, friendly
// grotesk) for body text — a deliberate pairing away from the default
// create-next-app Geist font, which every unmodified AI-scaffolded Next.js
// app ships with and is a dead giveaway of template-generated design.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoyageAI — Your smartest travel companion",
  description:
    "VoyageAI turns maps, reviews, weather, and transit into one intelligent, adaptive itinerary for every destination on earth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink dark:bg-night dark:text-paper">
        <LanguageProvider>
          {children}
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
