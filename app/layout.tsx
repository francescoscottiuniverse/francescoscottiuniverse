import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";
import { OG_IMAGE, SITE_URL, describe } from "@/lib/seo";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  const description = describe.home(settings.name);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: settings.name, template: `%s — ${settings.name}` },
    description,
    applicationName: settings.name,
    authors: [{ name: settings.name, url: SITE_URL }],
    creator: settings.name,
    publisher: settings.name,
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: settings.name,
      url: "/",
      title: settings.name,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.name,
      description,
      images: [OG_IMAGE.url],
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
