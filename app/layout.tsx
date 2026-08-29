import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — Overview`,
  description: site.tagline,
  openGraph: {
    type: "website",
    title: `${site.name} — Overview`,
    description: site.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#810100",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
