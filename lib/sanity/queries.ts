import { groq } from "next-sanity";
import { client } from "./client";

export type BoardKey = "universeBoard" | "creativeDirectionBoard";

export type SanityImage = {
  id: string;
  alt: string | null;
  projectName?: string | null;
  width: number;
  height: number;
};

export type BoardProject = {
  name: string;
  slug: string;
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
  "projectName": projectName,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
`;

const SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]{
  name, wordmark, tagline, email, about,
  socials[]{ title, label, handle, href },
  cover{ ${IMAGE_FIELDS} }
}`;

const BOARD_QUERY = groq`*[_type == $type][0]{ images[]{ ${IMAGE_FIELDS} } }`;

export function getSiteSettings() {
  return client.fetch<SiteSettings | null>(SETTINGS_QUERY);
}

export async function getBoardImages(type: BoardKey) {
  const board = await client.fetch<{ images: SanityImage[] | null } | null>(BOARD_QUERY, { type });
  return (board?.images ?? []).filter((image) => image?.width && image?.height);
}

export function slugifyName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function projectNameOf(image: SanityImage) {
  return (image.projectName ?? "").trim().replace(/\s+/g, " ");
}

export function groupIntoProjects(images: SanityImage[]): BoardProject[] {
  const groups = new Map<string, BoardProject>();

  for (const image of images) {
    const name = projectNameOf(image);
    if (!name) continue;

    const key = name.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.images.push(image);
    } else {
      groups.set(key, { name, slug: slugifyName(name), images: [image] });
    }
  }

  return [...groups.values()].filter((group) => group.slug.length > 0);
}

export async function getBoardProjects(type: BoardKey) {
  return groupIntoProjects(await getBoardImages(type));
}
