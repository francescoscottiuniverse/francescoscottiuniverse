import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import {
  LICENSE_ANCHOR,
  SITE_URL,
  absoluteUrl,
  breadcrumbSchema,
  describe,
  pageMetadata,
  personSchema,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return pageMetadata({
    siteName: settings.name,
    title: "Story",
    description: describe.story(settings.name),
    path: "/story",
  });
}

export default async function StoryPage() {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  const lines = settings.about ?? [];
  const socials = settings.socials ?? [];
  const sameAs = socials.flatMap((social) =>
    social.href ? [social.href] : [],
  );

  return (
    <SiteShell>
      <JsonLd
        data={[
          {
            "@type": "ProfilePage",
            "@id": `${absoluteUrl("/story")}#page`,
            url: absoluteUrl("/story"),
            name: `Story — ${settings.name}`,
            description: describe.story(settings.name),
            isPartOf: { "@id": `${SITE_URL}/#website` },
            mainEntity: { "@id": `${SITE_URL}/#person` },
          },
          personSchema({ name: settings.name, email: settings.email, sameAs }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Story", path: "/story" },
          ]),
        ]}
      />
      <LoadVeil />
      <Header wordmark={settings.wordmark} />
      <NavPanel currentPath="/story" email={settings.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-page">
            <h1 className="u-visually-hidden">The story of {settings.name}</h1>
            <div className="c-story c-lines">
              {lines.map((line) => (
                <span className="line" key={line}>
                  <span className="line__inner">{line}</span>
                </span>
              ))}
            </div>
            <ul className="c-story__contact">
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              {socials.map((social) => (
                <li key={social.href ?? social.title}>
                  <a
                    href={social.href ?? "#"}
                    title={social.title ?? undefined}
                    target="_blank"
                    rel="noopener me"
                  >
                    {social.handle ?? social.title}
                  </a>
                </li>
              ))}
            </ul>
            <section
              id={LICENSE_ANCHOR}
              className="c-story__licensing"
              aria-labelledby="licensing-heading"
            >
              <h2 id="licensing-heading" className="c-story__label">
                Licensing
              </h2>
              <p className="c-story__note">
                All images © {settings.name}. They may not be reproduced,
                published or used without written permission. For editorial or
                commercial licensing, contact{" "}
                <a href={`mailto:${settings.email}`}>{settings.email}</a>.
              </p>
            </section>
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
