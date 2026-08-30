import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { imageUrl } from "@/lib/sanity/client";
import { getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";

const COVER_WIDTHS = [640, 960, 1400, 1920];

export default async function HomePage() {
  const settings = (await getSiteSettings()) ?? fallbackSettings;
  const cover = settings.cover;

  return (
    <SiteShell>
      <LoadVeil />
      <Header wordmark={settings.wordmark} scrim />
      <NavPanel currentPath="/" email={settings.email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-cover">
            {cover ? (
              <img
                src={imageUrl(cover.id, 1920)}
                srcSet={COVER_WIDTHS.filter((width) => width <= cover.width)
                  .map((width) => `${imageUrl(cover.id, width)} ${width}w`)
                  .join(", ")}
                sizes="100vw"
                width={cover.width}
                height={cover.height}
                alt={cover.alt ?? ""}
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
