import type { Metadata } from "next";
import { Moodboard } from "@/components/Moodboard";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { buildBoard } from "@/lib/media";
import { getBoardImages, getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return {
    title: `${settings.name} — Creative Direction`,
    description: settings.tagline ?? undefined,
  };
}

export default async function CreativeDirectionPage() {
  const [settings, images] = await Promise.all([
    getSiteSettings(),
    getBoardImages("creativeDirectionBoard"),
  ]);
  const resolved = settings ?? fallbackSettings;
  const rows = buildBoard(images, "/creative-direction");

  return (
    <SiteShell theme="dark">
      <LoadVeil />
      <Header wordmark={resolved.wordmark} />
      <NavPanel currentPath="/creative-direction" email={resolved.email} />
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
