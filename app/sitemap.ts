import type { MetadataRoute } from "next";
import { getOpenableProjects } from "@/lib/sanity/queries";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const BOARDS = [
  { key: "universeBoard", path: "/universe" },
  { key: "creativeDirectionBoard", path: "/creative-direction" },
] as const;

function latest(dates: (string | null)[]) {
  const times = dates.filter((date): date is string => Boolean(date)).map((date) => Date.parse(date));
  return times.length ? new Date(Math.max(...times)) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const boards = await Promise.all(
    BOARDS.map(async (board) => ({ ...board, projects: await getOpenableProjects(board.key) })),
  );
  const newest = latest(boards.flatMap((board) => board.projects.map((project) => project.updatedAt)));

  return [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "monthly", priority: 1 },
    ...boards.map((board) => ({
      url: absoluteUrl(board.path),
      lastModified: latest(board.projects.map((project) => project.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    { url: absoluteUrl("/story"), lastModified: newest, changeFrequency: "yearly", priority: 0.6 },
    ...boards.flatMap((board) =>
      board.projects.map((project) => ({
        url: absoluteUrl(`${board.path}/${project.slug}`),
        lastModified: project.updatedAt ? new Date(project.updatedAt) : newest,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ),
  ];
}
