import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardProject } from "@/components/BoardProject";
import { getOpenableProjects, getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";
import { describe, pageMetadata, seoName } from "@/lib/seo";

export async function generateStaticParams() {
  const projects = await getOpenableProjects("universeBoard");
  if (projects.length === 0) return [{ slug: "none" }];
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/universe/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getOpenableProjects("universeBoard"),
  ]);
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) return {};

  const resolved = settings ?? fallbackSettings;
  const name = seoName(project.title, project.slug);
  return pageMetadata({
    siteName: resolved.name,
    title: name,
    description: describe.project(
      name,
      resolved.name,
      "photography",
      project.images.length,
    ),
    path: `/universe/${project.slug}`,
  });
}

export default async function UniverseProjectPage({ params }: PageProps<"/universe/[slug]">) {
  const { slug } = await params;
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getOpenableProjects("universeBoard"),
  ]);
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();

  const resolved = settings ?? fallbackSettings;

  return (
    <BoardProject
      project={project}
      projects={projects}
      basePath="/universe"
      backLabel="Universe"
      siteName={resolved.name}
      wordmark={resolved.wordmark}
      email={resolved.email}
    />
  );
}
