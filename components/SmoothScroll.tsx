"use client";

import { useRef, type ReactNode } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";

const EASING = 0.14;
const DESKTOP_MIN_WIDTH = 769;

function lerp(from: number, to: number, amount: number) {
  return (1 - amount) * from + amount * to;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let eased = window.scrollY;
    let frame = 0;

    const tick = () => {
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
        eased = lerp(eased, window.scrollY, EASING);
        document.body.style.height = `${scroller.offsetHeight}px`;
        scroller.style.top = `${-eased}px`;
      } else {
        document.body.style.removeProperty("height");
        scroller.style.removeProperty("top");
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.removeProperty("height");
      scroller.style.removeProperty("top");
    };
  });

  return (
    <div className="c-scroller" ref={scrollerRef}>
      {children}
    </div>
  );
}
