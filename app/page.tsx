import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { site } from "@/lib/site";

const coverSrcSet = site.cover.widths
  .map((width) => `/cover/cover-${width}.jpg ${width}w`)
  .join(", ");

export default function HomePage() {
  return (
    <SiteShell>
      <LoadVeil />
      <Header scrim />
      <NavPanel currentPath="/" />
      <SmoothScroll>
        <div className="c-board-shift">
          <main className="c-cover">
            <img
              src={site.cover.src}
              srcSet={coverSrcSet}
              sizes="100vw"
              width={site.cover.width}
              height={site.cover.height}
              alt={site.cover.alt}
              fetchPriority="high"
              decoding="async"
            />
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
