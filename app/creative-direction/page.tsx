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
    title: "Creative Direction",
    description: describe.creativeDirection(settings.name),
    path: "/creative-direction",
  });
}

export default async function CreativeDirectionPage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getProjects("creativeDirectionBoard"),
  ]);
  const resolved = settings ?? fallbackSettings;
  const rows = buildBoard(projects, "/creative-direction");

  return (
    <SiteShell theme="dark">
      <JsonLd
        data={[
          {
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/creative-direction")}#page`,
            url: absoluteUrl("/creative-direction"),
            name: "Creative Direction",
            description: describe.creativeDirection(resolved.name),
            isPartOf: { "@id": `${SITE_URL}/#website` },
            author: { "@id": `${SITE_URL}/#person` },
            hasPart: projects
              .filter((project) => project.title && project.slug)
              .map((project) => ({
                "@type": "CreativeWork",
                name: project.title,
                url: absoluteUrl(`/creative-direction/${project.slug}`),
              })),
          },
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Creative Direction", path: "/creative-direction" },
          ]),
        ]}
      />
      <LoadVeil />
      <Header wordmark={resolved.wordmark} />
      <NavPanel currentPath="/creative-direction" email={resolved.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-board-section">
            <h1 className="u-visually-hidden">Creative Direction</h1>
            <Moodboard rows={rows} />
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
