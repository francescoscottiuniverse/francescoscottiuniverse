import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  return { title: `${settings.name} — Story`, description: settings.tagline ?? undefined };
}

export default async function StoryPage() {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  const lines = settings.about ?? [];
  const socials = settings.socials ?? [];

  return (
    <SiteShell>
      <LoadVeil />
      <Header wordmark={settings.wordmark} />
      <NavPanel currentPath="/story" email={settings.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-page">
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
                    rel="noopener"
                  >
                    {social.handle ?? social.title}
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
