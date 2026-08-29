import { projects, type Project, type ProjectImage } from "./projects";

const WIX_MEDIA = "https://static.wixstatic.com/media";
const SRCSET_WIDTHS = [400, 640, 960, 1400, 1920];

function transform(image: ProjectImage, width: number) {
  const height = Math.round(width * (image.height / image.width));
  return `${WIX_MEDIA}/${image.file}/v1/fit/w_${width},h_${height},al_c,q_85,enc_auto/image.jpg`;
}

export function mediaSrc(image: ProjectImage) {
  return transform(image, 960);
}

export function mediaSrcSet(image: ProjectImage) {
  return SRCSET_WIDTHS.filter((width) => width <= image.width)
    .map((width) => `${transform(image, width)} ${width}w`)
    .join(", ");
}

function seeded(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export type BoardItem = {
  key: string;
  image: ProjectImage;
  ratio: number;
  label?: string;
  href?: string;
};

export type BoardRow = BoardItem[];

const INDEX_TARGETS = [3.6, 5.2, 4.2, 6.0, 4.6, 3.2];
const PROJECT_TARGETS = [2.4, 1.9, 2.8, 2.2];
const MERGE_THRESHOLD = 0.7;

function packRows(items: BoardItem[], targets: number[]): BoardRow[] {
  const rows: BoardRow[] = [];
  let current: BoardRow = [];
  let sum = 0;
  let target = targets[0];

  for (const item of items) {
    current.push(item);
    sum += item.ratio;
    if (sum >= target) {
      rows.push(current);
      current = [];
      sum = 0;
      target = targets[rows.length % targets.length];
    }
  }

  if (current.length) {
    if (sum < target * MERGE_THRESHOLD && rows.length) {
      rows[rows.length - 1].push(...current);
    } else {
      rows.push(current);
    }
  }

  return rows;
}

function ratioOf(image: ProjectImage) {
  return Number((image.width / image.height).toFixed(4));
}

export function buildMoodboard(): BoardRow[] {
  const items: BoardItem[] = projects.map((project) => ({
    key: project.slug,
    image: project.images[0],
    ratio: ratioOf(project.images[0]),
    label: project.title,
    href: `/projects/${project.slug}`,
  }));

  const ordered = [...items].sort((a, b) => seeded(`${a.key}-order`) - seeded(`${b.key}-order`));
  return packRows(ordered, INDEX_TARGETS);
}

export function buildProjectRows(project: Project): BoardRow[] {
  const items: BoardItem[] = project.images.map((image, index) => ({
    key: `${project.slug}-${index}`,
    image,
    ratio: ratioOf(image),
  }));

  return packRows(items, PROJECT_TARGETS);
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectNeighbours(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? projects[index - 1] : projects[projects.length - 1],
    next: index < projects.length - 1 ? projects[index + 1] : projects[0],
  };
}
