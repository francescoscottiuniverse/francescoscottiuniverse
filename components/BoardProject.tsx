import Link from "next/link";
import { Moodboard } from "@/components/Moodboard";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { buildProjectRows, getNeighbours } from "@/lib/media";
import type { BoardProject as BoardProjectType } from "@/lib/sanity/queries";

type OpenableProject = BoardProjectType & { slug: string };

export function BoardProject({
  project,
  projects,
  basePath,
  backLabel,
  wordmark,
  email,
  theme = "default",
}: {
  project: OpenableProject;
  projects: OpenableProject[];
  basePath: string;
  backLabel: string;
  wordmark: string;
  email: string;
  theme?: "default" | "dark";
}) {
  const rows = buildProjectRows({ slug: project.slug, images: project.images });
  const { previous, next } = getNeighbours(projects, project.slug);
  const count = project.images.length;

  return (
    <SiteShell theme={theme}>
      <LoadVeil />
      <Header wordmark={wordmark} />
      <NavPanel currentPath={basePath} email={email} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main>
            <header className="c-projecthead">
              <h1 className="c-projecthead__title">{project.title}</h1>
              <p className="c-projecthead__meta">
                {count} {count === 1 ? "Image" : "Images"}
              </p>
            </header>

            <Moodboard rows={rows} intro={false} variant="project" />

            <nav className="c-projectnav" aria-label="More projects">
              {previous && previous.slug !== project.slug ? (
                <Link className="c-projectnav__link" href={`${basePath}/${previous.slug}`}>
                  <span className="c-projectnav__label">Previous</span>
                  <span className="c-projectnav__title">{previous.title}</span>
                </Link>
              ) : null}
              <Link className="c-projectnav__link c-projectnav__link--index" href={basePath}>
                <span className="c-projectnav__label">Back to</span>
                <span className="c-projectnav__title">{backLabel}</span>
              </Link>
              {next && next.slug !== project.slug ? (
                <Link
                  className="c-projectnav__link c-projectnav__link--next"
                  href={`${basePath}/${next.slug}`}
                >
                  <span className="c-projectnav__label">Next</span>
                  <span className="c-projectnav__title">{next.title}</span>
                </Link>
              ) : null}
            </nav>
          </main>
        </div>
      </SmoothScroll>
    </SiteShell>
  );
}
