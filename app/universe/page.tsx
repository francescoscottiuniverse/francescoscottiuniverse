import type { Metadata } from "next";
import { Moodboard } from "@/components/Moodboard";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { buildMoodboard } from "@/lib/media";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Universe`,
  description: site.tagline,
};

export default function UniversePage() {
  const rows = buildMoodboard();

  return (
    <SiteShell>
      <LoadVeil />
      <Header />
      <NavPanel currentPath="/universe" />
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
