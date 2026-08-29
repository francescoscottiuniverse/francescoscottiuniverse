"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";

type LoadPhase = "loading" | "loaded" | "finished";
type NavPhase = "closed" | "opening" | "open" | "closing";

type SiteState = {
  loadPhase: LoadPhase;
  navPhase: NavPhase;
  toggleNav: () => void;
  closeNav: () => void;
};

const SiteStateContext = createContext<SiteState | null>(null);

export function useSiteState() {
  const state = useContext(SiteStateContext);
  if (!state) throw new Error("useSiteState must be used inside SiteShell");
  return state;
}

const MINIMUM_LOAD_MS = 300;
const FINISH_DELAY_MS = 1000;
const LOAD_FALLBACK_MS = 5000;
const NAV_OPEN_MS = 620;
const NAV_CLOSE_MS = 460;

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function SiteShell({
  children,
  theme = "default",
}: {
  children: ReactNode;
  theme?: "default" | "dark";
}) {
  const [loadPhase, setLoadPhase] = useState<LoadPhase>("loading");
  const [navPhase, setNavPhase] = useState<NavPhase>("closed");
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMountEffect(() => {
    let resourcesReady = document.readyState === "complete";
    let minimumElapsed = false;
    let settled = false;
    const finishTimers: ReturnType<typeof setTimeout>[] = [];

    const land = () => {
      if (settled) return;
      settled = true;
      setLoadPhase("loaded");
      finishTimers.push(setTimeout(() => setLoadPhase("finished"), FINISH_DELAY_MS));
    };

    const attempt = () => {
      if (resourcesReady && minimumElapsed) land();
    };

    const onLoad = () => {
      resourcesReady = true;
      attempt();
    };

    const minimumTimer = setTimeout(() => {
      minimumElapsed = true;
      attempt();
    }, MINIMUM_LOAD_MS);
    const fallbackTimer = setTimeout(land, LOAD_FALLBACK_MS);

    window.addEventListener("load", onLoad);
    attempt();

    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(minimumTimer);
      clearTimeout(fallbackTimer);
      finishTimers.forEach(clearTimeout);
    };
  });

  const closeNav = useCallback(() => {
    setNavPhase((current) => {
      if (current !== "open" && current !== "opening") return current;
      if (navTimer.current) clearTimeout(navTimer.current);
      lockScroll(false);
      navTimer.current = setTimeout(() => setNavPhase("closed"), NAV_CLOSE_MS);
      return "closing";
    });
  }, []);

  const toggleNav = useCallback(() => {
    setNavPhase((current) => {
      if (current === "closing") return current;
      if (navTimer.current) clearTimeout(navTimer.current);

      if (current === "open" || current === "opening") {
        lockScroll(false);
        navTimer.current = setTimeout(() => setNavPhase("closed"), NAV_CLOSE_MS);
        return "closing";
      }

      lockScroll(true);
      navTimer.current = setTimeout(() => setNavPhase("open"), NAV_OPEN_MS);
      return "opening";
    });
  }, []);

  useMountEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNav();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      lockScroll(false);
    };
  });

  const classNames = [
    "site",
    theme === "dark" ? "is--theme-dark" : "",
    loadPhase === "loaded" || loadPhase === "finished" ? "is--loaded" : "",
    loadPhase === "finished" ? "is--finished" : "",
    navPhase === "opening" ? "is--nav-opening" : "",
    navPhase === "open" ? "is--nav-open" : "",
    navPhase === "closing" ? "is--nav-closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <SiteStateContext.Provider value={{ loadPhase, navPhase, toggleNav, closeNav }}>
      <div className={classNames}>{children}</div>
    </SiteStateContext.Provider>
  );
}
