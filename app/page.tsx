import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { imageUrl } from "@/lib/sanity/client";
import { getSiteSettings } from "@/lib/sanity/queries";
import { SITE_URL, describe, pageMetadata, personSchema } from "@/lib/seo";
import { fallbackSettings } from "@/lib/site";

const COVER_WIDTHS = [640, 960, 1400, 1920];

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return pageMetadata({
    siteName: settings.name,
    title: `${settings.name} — Fashion & Editorial Photographer`,
    description: describe.home(settings.name),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  const cover = settings.cover;
  const sameAs = (settings.socials ?? []).flatMap((social) => (social.href ? [social.href] : []));

  return (
    <SiteShell>
      <JsonLd
        data={[
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: settings.name,
            description: describe.home(settings.name),
            inLanguage: "en",
            publisher: { "@id": `${SITE_URL}/#person` },
          },
          personSchema({ name: settings.name, email: settings.email, sameAs }),
        ]}
      />
      <LoadVeil />
      <Header wordmark={settings.wordmark} scrim />
      <NavPanel currentPath="/" email={settings.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-cover">
            <h1 className="u-visually-hidden">
              {settings.name} — fashion and editorial photographer
            </h1>
            {cover ? (
              <img
                src={imageUrl(cover.id, 1920)}
                srcSet={COVER_WIDTHS.filter((width) => width <= cover.width)
                  .map((width) => `${imageUrl(cover.id, width)} ${width}w`)
                  .join(", ")}
                sizes="100vw"
                width={cover.width}
                height={cover.height}
                alt={cover.alt ?? `Fashion photograph by ${settings.name}`}
                fetchPriority="high"
                decoding="async"
              />
            ) : null}
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
