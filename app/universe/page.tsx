import type { Metadata } from "next";
import { Moodboard } from "@/components/Moodboard";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { buildBoard } from "@/lib/media";
import { getProjects, getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return { title: `${settings.name} — Universe`, description: settings.tagline ?? undefined };
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
      <LoadVeil />
      <Header wordmark={resolved.wordmark} />
      <NavPanel currentPath="/universe" email={resolved.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-board-section">
            <Moodboard rows={rows} />
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
