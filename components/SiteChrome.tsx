"use client";

import Link from "next/link";
import { navLinks } from "@/lib/site";
import { useSiteState } from "./SiteShell";

export type ChromeProps = {
  wordmark: string;
  email: string;
  currentPath: string;
};

export function LoadVeil() {
  return <div className="c-loadveil" aria-hidden="true" />;
}

export function Header({
  wordmark,
  showLogo = true,
  scrim = false,
}: {
  wordmark: string;
  showLogo?: boolean;
  scrim?: boolean;
}) {
  const { navPhase, toggleNav, closeNav } = useSiteState();
  const expanded = navPhase === "open" || navPhase === "opening";

  return (
    <header className="c-header" data-scrim={scrim}>
      {showLogo ? (
        <p className="c-logo">
          <Link href="/" className="c-logo__inner" onClick={closeNav}>
            {wordmark}
          </Link>
        </p>
      ) : null}
      <button
        type="button"
        className="c-navopener"
        onClick={toggleNav}
        aria-expanded={expanded}
        aria-controls="navpanel"
      >
        <span className="u-visually-hidden">{expanded ? "Close menu" : "Open menu"}</span>
      </button>
    </header>
  );
}

export function NavPanel({ currentPath, email }: { currentPath: string; email: string }) {
  const { navPhase, closeNav } = useSiteState();
  const hidden = navPhase === "closed";

  const items = [...navLinks, { label: "Contact", href: `mailto:${email}` }];

  return (
    <div className="c-navpanel" id="navpanel" inert={hidden}>
      <nav aria-label="Main">
        <ul className="c-navmenu">
          {items.map((item) => {
            const external = item.href.startsWith("mailto:");
            const current = !external && item.href === currentPath;

            return (
              <li key={item.href}>
                {external ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    onClick={closeNav}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function Footer({ links }: { links: { label: string; href: string }[] }) {
  return (
    <footer className="c-footer">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </footer>
  );
}
