import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { ChatWidget } from "@/components/ChatWidget";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { auth0 } from "@/lib/auth0";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth0.getSession();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Auth0Provider user={session?.user}>
          <LanguageProvider>
            {children}
            <ChatWidget />
          </LanguageProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
