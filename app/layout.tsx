import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return {
    title: `${settings.name} — Overview`,
    description: settings.tagline ?? undefined,
    openGraph: {
      type: "website",
      title: settings.name,
      description: settings.tagline ?? undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#810100",
};

export default function SiteRootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
