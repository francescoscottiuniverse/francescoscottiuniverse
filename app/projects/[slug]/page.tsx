import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Moodboard } from "@/components/Moodboard";
import { SiteShell } from "@/components/SiteShell";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header, LoadVeil, NavPanel } from "@/components/SiteChrome";
import { buildProjectRows, getProject, getProjectNeighbours } from "@/lib/media";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: `${project.title} — ${site.name}`,
    description: `${project.title}, photographed by ${site.name}.`,
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const rows = buildProjectRows(project);
  const { previous, next } = getProjectNeighbours(slug);

  return (
    <SiteShell>
      <LoadVeil />
      <Header />
      <NavPanel currentPath={`/projects/${slug}`} />
      <SmoothScroll>
        <div className="c-board-shift">
          <main>
            <header className="c-projecthead">
              <h1 className="c-projecthead__title">{project.title}</h1>
              <p className="c-projecthead__meta">
                {project.images.length}{" "}
                {project.images.length === 1 ? "Image" : "Images"}
              </p>
            </header>

            <Moodboard rows={rows} intro={false} variant="project" />

            <nav className="c-projectnav" aria-label="More projects">
              {previous ? (
                <Link className="c-projectnav__link" href={`/projects/${previous.slug}`}>
                  <span className="c-projectnav__label">Previous</span>
                  <span className="c-projectnav__title">{previous.title}</span>
                </Link>
              ) : null}
              <Link className="c-projectnav__link c-projectnav__link--index" href="/universe">
                <span className="c-projectnav__label">Back to</span>
                <span className="c-projectnav__title">Universe</span>
              </Link>
              {next ? (
                <Link className="c-projectnav__link c-projectnav__link--next" href={`/projects/${next.slug}`}>
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
