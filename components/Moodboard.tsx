"use client";

import Link from "next/link";
import { useRef } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";
import { type BoardImage, type BoardRow } from "@/lib/media";

const SIZES = "(max-width: 768px) 48vw, 26vw";
const PROJECT_SIZES = "(max-width: 768px) 96vw, 50vw";

function shuffled(length: number) {
  const values = Array.from({ length }, (_, index) => index + 1);
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function Picture({
  entry,
  sizes,
  eager,
}: {
  entry: BoardImage;
  sizes: string;
  eager: boolean;
}) {
  const media = (
    <>
      <img
        src={entry.src}
        srcSet={entry.srcSet}
        sizes={sizes}
        width={entry.width}
        height={entry.height}
        alt={entry.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      {entry.label ? <span className="c-moodboard__caption">{entry.label}</span> : null}
    </>
  );

  return entry.href ? (
    <Link className="c-moodboard__frame" href={entry.href}>
      {media}
    </Link>
  ) : (
    <span className="c-moodboard__frame">{media}</span>
  );
}

export function Moodboard({
  rows,
  intro = true,
  variant = "index",
}: {
  rows: BoardRow[];
  intro?: boolean;
  variant?: "index" | "project";
}) {
  const boardRef = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    if (!intro) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const all = Array.from(board.querySelectorAll<HTMLElement>(".c-moodboard__cell"));
    const above = all.filter((cell) => cell.getBoundingClientRect().top < window.innerHeight);
    if (!above.length) return;

    const stacking = shuffled(above.length);
    const delays = shuffled(above.length);

    above.forEach((cell, index) => {
      const rect = cell.getBoundingClientRect();
      const targetX = (window.innerWidth - rect.width) / 2 - rect.left;
      const targetY = (window.innerHeight - rect.height) / 2 - rect.top;
      const duration = (Math.random() * 0.6 + 0.8).toFixed(2);

      cell.classList.add("is--intro");
      cell.style.setProperty("--translate-x", `${targetX}px`);
      cell.style.setProperty("--translate-y", `${targetY}px`);
      cell.style.setProperty("--z-index", `${stacking[index]}`);
      cell.style.setProperty("--delay", `${delays[index]}`);
      cell.style.setProperty("--duration", `${duration}s`);
    });
  });

  const sizes = variant === "project" ? PROJECT_SIZES : SIZES;
  let ordinal = 0;

  return (
    <div className={`c-moodboard c-moodboard--${variant}`} ref={boardRef}>
      {rows.map((row, rowIndex) => (
        <div className="c-moodboard__row" key={row[0].key}>
          {row.map((cell) => {
            const eager = rowIndex < 2;
            const revealIndex = ordinal;
            ordinal += 1;

            return (
              <div
                className={`c-moodboard__cell${intro ? "" : " is--reveal"}`}
                key={cell.key}
                style={
                  {
                    "--weight": cell.weight,
                    "--drop": `${cell.drop}vw`,
                    "--gap-before": `${cell.gapBefore}vw`,
                    "--reveal-index": revealIndex,
                  } as React.CSSProperties
                }
              >
                {cell.images.map((entry) => (
                  <figure className="c-moodboard__item" key={entry.key}>
                    <Picture entry={entry} sizes={sizes} eager={eager} />
                  </figure>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
