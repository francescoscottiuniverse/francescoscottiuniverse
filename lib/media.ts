import { imageUrl } from "./sanity/client";
import { projectNameOf, slugifyName, type SanityImage } from "./sanity/queries";

const SRCSET_WIDTHS = [400, 640, 960, 1400, 1920];

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
  src: string;
  srcSet: string;
  width: number;
  height: number;
  ratio: number;
  alt: string;
  size: string;
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

const INDEX_TARGETS = [4.6, 5.6, 5.0, 6.2, 5.2, 4.8];
const PROJECT_TARGETS = [2.4, 1.9, 2.8, 2.2];
const MERGE_THRESHOLD = 0.7;

const MIN_SCALE = 0.86;
const SCALE_RANGE = 0.26;

const SIZE_SCALES: Record<string, number> = {
  small: 0.72,
  medium: 1,
  large: 1.3,
  xlarge: 1.6,
};

const MAX_DROP = 1.1;
const MAX_EXTRA_GAP = 1.1;
const STACK_CHANCE = 0.16;
const STACK_MIN_RATIO = 1.1;

export function toBoardImage(
  image: SanityImage,
  key: string,
  extra?: { label?: string; href?: string },
): BoardImage {
  return {
    key,
    src: imageUrl(image.id, 960),
    srcSet: SRCSET_WIDTHS.filter((width) => width <= image.width)
      .map((width) => `${imageUrl(image.id, width)} ${width}w`)
      .join(", "),
    width: image.width,
    height: image.height,
    ratio: round(image.width / image.height),
    alt: image.alt ?? extra?.label ?? "",
    size: image.size ?? "auto",
    ...extra,
  };
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
    const chosen = SIZE_SCALES[entry.size];
    const scale = chosen ?? (organic ? MIN_SCALE + seeded(`${entry.key}-scale`) * SCALE_RANGE : 1);

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

export function buildBoard(images: SanityImage[], basePath: string): BoardRow[] {
  const board = images.map((image, index) => {
    const name = projectNameOf(image);
    return toBoardImage(
      image,
      `${image.id}-${index}`,
      name ? { label: name, href: `${basePath}/${slugifyName(name)}` } : undefined,
    );
  });

  return packRows(toCells(board, true), INDEX_TARGETS);
}

export function buildProjectRows(project: {
  slug: string;
  images: SanityImage[] | null;
}): BoardRow[] {
  const images = (project.images ?? []).map((image, index) =>
    toBoardImage(image, `${project.slug}-${index}`),
  );

  return packRows(toCells(images, false), PROJECT_TARGETS);
}

export function getNeighbours<T extends { slug: string }>(projects: T[], slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? projects[index - 1] : projects[projects.length - 1],
    next: index < projects.length - 1 ? projects[index + 1] : projects[0],
  };
}
