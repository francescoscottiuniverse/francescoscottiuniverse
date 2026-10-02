import type { Metadata } from "next";

export const SITE_URL = "https://francescoscottiuniverse.com";
export const LOCATIONS = ["Dubai", "Milan", "Ibiza"];

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Francesco Luigi Scotti",
};

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

function tidy(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function fit(text: string, limit: number) {
  const clean = tidy(text);
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:—-]+$/, "")}…`;
}

function humanise(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function seoName(title: string | null | undefined, slug: string) {
  const clean = tidy(title ?? "");
  return /[\p{L}\p{N}]/u.test(clean) ? clean : humanise(slug);
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function pageMetadata({
  siteName,
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  siteName: string;
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const name = tidy(title);
  const branded = `${name} — ${siteName}`;
  const standalone = absoluteTitle || branded.length > TITLE_LIMIT;
  const fullTitle = standalone ? name : branded;
  const summary = fit(description, DESCRIPTION_LIMIT);

  return {
    title: standalone ? { absolute: fullTitle } : name,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      url: path,
      title: fullTitle,
      description: summary,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: summary,
      images: [OG_IMAGE.url],
    },
  };
}

export function personSchema({
  name,
  email,
  sameAs,
}: {
  name: string;
  email: string;
  sameAs: string[];
}) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name,
    url: SITE_URL,
    jobTitle: "Photographer",
    email: `mailto:${email}`,
    workLocation: LOCATIONS.map((city) => ({ "@type": "Place", name: city })),
    sameAs,
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

const BASED = `based between ${LOCATIONS.slice(0, -1).join(", ")} and ${LOCATIONS.at(-1)}`;

export const describe = {
  home: (name: string) =>
    `${name} is a fashion and editorial photographer ${BASED}, telling stories through art, culture and fashion.`,
  universe: (name: string) =>
    `Editorial, campaign and personal photography by ${name}, a fashion photographer ${BASED}.`,
  creativeDirection: (name: string) =>
    `Creative direction by ${name}: concept, casting and art direction for fashion brands and magazines.`,
  story: (name: string) =>
    `The story of ${name}, photographer ${BASED}. Get in touch for commissions and collaborations.`,
  project: (title: string, name: string, discipline: string, count: number) =>
    `${title} — ${discipline} by ${name}. ${count} ${count === 1 ? "image" : "images"} from a fashion and editorial photographer ${BASED}.`,
};
