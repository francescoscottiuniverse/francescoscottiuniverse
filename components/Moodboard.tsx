"use client";

import Link from "next/link";
import { useRef } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";
import { mediaSrc, mediaSrcSet, type BoardItem, type BoardRow } from "@/lib/media";

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

function Frame({
  item,
  sizes,
  eager,
}: {
  item: BoardItem;
  sizes: string;
  eager: boolean;
}) {
  return (
    <>
      <img
        src={mediaSrc(item.image)}
        srcSet={mediaSrcSet(item.image)}
        sizes={sizes}
        width={item.image.width}
        height={item.image.height}
        alt={item.label ?? ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      {item.label ? <span className="c-moodboard__caption">{item.label}</span> : null}
    </>
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

    const all = Array.from(board.querySelectorAll<HTMLElement>(".c-moodboard__item"));
    const above = all.filter((item) => item.getBoundingClientRect().top < window.innerHeight);
    if (!above.length) return;

    const stacking = shuffled(above.length);
    const delays = shuffled(above.length);

    above.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const targetX = (window.innerWidth - rect.width) / 2 - rect.left;
      const targetY = (window.innerHeight - rect.height) / 2 - rect.top;
      const duration = (Math.random() * 0.6 + 0.8).toFixed(2);

      item.classList.add("is--intro");
      item.style.setProperty("--translate-x", `${targetX}px`);
      item.style.setProperty("--translate-y", `${targetY}px`);
      item.style.setProperty("--z-index", `${stacking[index]}`);
      item.style.setProperty("--delay", `${delays[index]}`);
      item.style.setProperty("--duration", `${duration}s`);
    });
  });

  const sizes = variant === "project" ? PROJECT_SIZES : SIZES;
  let ordinal = 0;

  return (
    <div className={`c-moodboard c-moodboard--${variant}`} ref={boardRef}>
      {rows.map((row, rowIndex) => (
        <div className="c-moodboard__row" key={row[0].key}>
          {row.map((item) => {
            const eager = rowIndex < 2;
            const revealIndex = ordinal;
            ordinal += 1;

            return (
              <figure
                className={`c-moodboard__item${intro ? "" : " is--reveal"}`}
                key={item.key}
                style={
                  {
                    "--ratio": item.ratio,
                    "--reveal-index": revealIndex,
                  } as React.CSSProperties
                }
              >
                {item.href ? (
                  <Link className="c-moodboard__frame" href={item.href}>
                    <Frame item={item} sizes={sizes} eager={eager} />
                  </Link>
                ) : (
                  <span className="c-moodboard__frame">
                    <Frame item={item} sizes={sizes} eager={eager} />
                  </span>
                )}
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
}
