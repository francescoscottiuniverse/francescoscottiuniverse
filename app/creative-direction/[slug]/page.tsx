import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardProject } from "@/components/BoardProject";
import { getBoardProjects, getSiteSettings } from "@/lib/sanity/queries";
import { fallbackSettings } from "@/lib/site";

export async function generateStaticParams() {
  const projects = await getBoardProjects("creativeDirectionBoard");
  if (projects.length === 0) return [{ slug: "none" }];
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/creative-direction/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getBoardProjects("creativeDirectionBoard"),
  ]);
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) return {};

  const resolved = settings ?? fallbackSettings;
  return {
    title: `${project.name} — ${resolved.name}`,
    description: `${project.name}, photographed by ${resolved.name}.`,
  };
}

export default async function CreativeDirectionProjectPage({
  params,
}: PageProps<"/creative-direction/[slug]">) {
  const { slug } = await params;
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getBoardProjects("creativeDirectionBoard"),
  ]);
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();

  const resolved = settings ?? fallbackSettings;

  return (
    <BoardProject
      project={project}
      projects={projects}
      basePath="/creative-direction"
      backLabel="Creative Direction"
      wordmark={resolved.wordmark}
      email={resolved.email}
      theme="dark"
    />
  );
}
