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

function round(value: number, places = 4) {
  return Number(value.toFixed(places));
}

export type BoardImage = {
  key: string;
  image: ProjectImage;
  ratio: number;
  label?: string;
  href?: string;
};

export type BoardCell = {
  key: string;
  images: BoardImage[];
  ratio: number;
  weight: number;
  drop: number;
  gapBefore: number;
};

export type BoardRow = BoardCell[];

const INDEX_TARGETS = [3.6, 5.2, 4.2, 6.0, 4.6, 3.2];
const PROJECT_TARGETS = [2.4, 1.9, 2.8, 2.2];
const MERGE_THRESHOLD = 0.7;

const MIN_SCALE = 0.78;
const SCALE_RANGE = 0.37;
const MAX_DROP = 2.2;
const MAX_EXTRA_GAP = 2.4;
const STACK_CHANCE = 0.16;
const STACK_MIN_RATIO = 1.1;

function ratioOf(image: ProjectImage) {
  return round(image.width / image.height);
}

function stackRatio(images: BoardImage[]) {
  const inverse = images.reduce((total, entry) => total + 1 / entry.ratio, 0);
  return round(1 / inverse);
}

function toCells(images: BoardImage[], organic: boolean): BoardCell[] {
  const cells: BoardCell[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const entry = images[index];
    const next = images[index + 1];

    const canStack =
      organic &&
      next !== undefined &&
      entry.ratio > STACK_MIN_RATIO &&
      next.ratio > STACK_MIN_RATIO &&
      seeded(`${entry.key}-stack`) < STACK_CHANCE;

    const grouped = canStack ? [entry, next] : [entry];
    if (canStack) index += 1;

    const ratio = grouped.length > 1 ? stackRatio(grouped) : entry.ratio;
    const scale = organic ? MIN_SCALE + seeded(`${entry.key}-scale`) * SCALE_RANGE : 1;

    cells.push({
      key: entry.key,
      images: grouped,
      ratio,
      weight: round(ratio * scale),
      drop: organic ? round(seeded(`${entry.key}-drop`) * MAX_DROP, 2) : 0,
      gapBefore: organic ? round(seeded(`${entry.key}-gap`) * MAX_EXTRA_GAP, 2) : 0,
    });
  }

  return cells;
}

function packRows(cells: BoardCell[], targets: number[]): BoardRow[] {
  const rows: BoardRow[] = [];
  let current: BoardRow = [];
  let sum = 0;
  let target = targets[0];

  for (const cell of cells) {
    current.push(cell);
    sum += cell.weight;
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

export function buildMoodboard(): BoardRow[] {
  const images: BoardImage[] = projects.map((project) => ({
    key: project.slug,
    image: project.images[0],
    ratio: ratioOf(project.images[0]),
    label: project.title,
    href: `/projects/${project.slug}`,
  }));

  const ordered = [...images].sort((a, b) => seeded(`${a.key}-order`) - seeded(`${b.key}-order`));
  return packRows(toCells(ordered, true), INDEX_TARGETS);
}

export function buildProjectRows(project: Project): BoardRow[] {
  const images: BoardImage[] = project.images.map((image, index) => ({
    key: `${project.slug}-${index}`,
    image,
    ratio: ratioOf(image),
  }));

  return packRows(toCells(images, false), PROJECT_TARGETS);
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
