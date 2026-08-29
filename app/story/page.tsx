import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Story`,
  description: site.tagline,
};

export default function StoryPage() {
  return (
    <SiteShell>
      <LoadVeil />
      <Header />
      <NavPanel currentPath="/story" />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-page">
            <div className="c-story c-lines">
              {site.about.map((line) => (
                <span className="line" key={line}>
                  <span className="line__inner">{line}</span>
                </span>
              ))}
            </div>
            <ul className="c-story__contact">
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              {site.socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} title={social.title} target="_blank" rel="noopener">
                    {social.handle}
                  </a>
                </li>
              ))}
            </ul>
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
