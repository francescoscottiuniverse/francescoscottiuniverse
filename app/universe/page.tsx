import type { Metadata } from "next";
import { Moodboard } from "@/components/Moodboard";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { buildBoard } from "@/lib/media";
import { getProjects, getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, absoluteUrl, breadcrumbSchema, describe, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return pageMetadata({
    siteName: settings.name,
    title: "Universe",
    description: describe.universe(settings.name),
    path: "/universe",
  });
}

export default async function UniversePage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getProjects("universeBoard"),
  ]);
  const resolved = settings ?? fallbackSettings;
  const rows = buildBoard(projects, "/universe");

  return (
    <SiteShell>
      <JsonLd
        data={[
          {
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/universe")}#page`,
            url: absoluteUrl("/universe"),
            name: "Universe",
            description: describe.universe(resolved.name),
            isPartOf: { "@id": `${SITE_URL}/#website` },
            author: { "@id": `${SITE_URL}/#person` },
            hasPart: projects
              .filter((project) => project.title && project.slug)
              .map((project) => ({
                "@type": "CreativeWork",
                name: project.title,
                url: absoluteUrl(`/universe/${project.slug}`),
              })),
          },
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Universe", path: "/universe" },
          ]),
        ]}
      />
      <LoadVeil />
      <Header wordmark={resolved.wordmark} />
      <NavPanel currentPath="/universe" email={resolved.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-board-section">
            <h1 className="u-visually-hidden">Universe</h1>
            <Moodboard rows={rows} />
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
