import { groq } from "next-sanity";
import { client } from "./client";

export type BoardKey = "universeBoard" | "creativeDirectionBoard";

export type SanityImage = {
  id: string;
  alt: string | null;
  size?: string | null;
  width: number;
  height: number;
};

export type BoardProject = {
  updatedAt: string | null;
  title: string | null;
  slug: string | null;
  cover: SanityImage | null;
  images: SanityImage[];
};

export type SiteSettings = {
  name: string;
  wordmark: string;
  tagline: string | null;
  email: string;
  cover: SanityImage | null;
  about: string[] | null;
  socials:
    | { title: string | null; label: string | null; handle: string | null; href: string | null }[]
    | null;
};

const IMAGE_FIELDS = groq`
  "id": asset._ref,
  "alt": alt,
  "size": size,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
`;

const SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]{
  name, wordmark, tagline, email, about,
  socials[]{ title, label, handle, href },
  cover{ ${IMAGE_FIELDS} }
}`;

const PROJECTS_QUERY = groq`*[_id == $board][0].projects[]->{
  "updatedAt": _updatedAt,
  title,
  "slug": slug.current,
  cover{ ${IMAGE_FIELDS} },
  images[]{ ${IMAGE_FIELDS} }
}`;

export function meaningfulTitle(title: string | null | undefined) {
  const clean = (title ?? "").trim().replace(/\s+/g, " ");
  return /[\p{L}\p{N}]/u.test(clean) ? clean : null;
}

function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function uniqueSlug(base: string, taken: Set<string>) {
  let slug = base;
  for (let copy = 2; taken.has(slug); copy += 1) slug = `${base}-${copy}`;
  taken.add(slug);
  return slug;
}

function hasSize(image: SanityImage | null | undefined): image is SanityImage {
  return Boolean(image?.width && image?.height);
}

export function getSiteSettings() {
  return client.fetch<SiteSettings | null>(SETTINGS_QUERY);
}

export async function getProjects(board: BoardKey): Promise<BoardProject[]> {
  const projects = await client.fetch<BoardProject[] | null>(PROJECTS_QUERY, { board });
  const taken = new Set<string>();

  return (projects ?? [])
    .map((project) => {
      const title = meaningfulTitle(project.title);
      const base = title ? project.slug || slugify(title) : null;
      return { ...project, title, slug: base ? uniqueSlug(base, taken) : null };
    })
    .map((project) => ({
      ...project,
      cover: hasSize(project.cover) ? project.cover : null,
      images: (project.images ?? []).filter(hasSize),
    }))
    .filter((project) => project.cover || project.images.length > 0);
}

export function coverOf(project: BoardProject) {
  return project.cover ?? project.images[0] ?? null;
}

export function isOpenable(project: BoardProject): project is BoardProject & { slug: string } {
  return Boolean(project.title && project.slug);
}

export async function getOpenableProjects(board: BoardKey) {
  return (await getProjects(board)).filter(isOpenable);
}
