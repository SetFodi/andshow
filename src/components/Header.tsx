"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Shows" },
  { href: "/browse", label: "Browse" },
] as const;

const SCROLLED_THRESHOLD_PX = 16;

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLLED_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const surface =
    isScrolled || isMenuOpen
      ? "border-white/[0.06] bg-ink/75 backdrop-blur-2xl"
      : "border-transparent bg-gradient-to-b from-ink/80 via-ink/30 to-transparent";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-500 ${surface}`}
    >
      <div className="flex h-16 items-center justify-between gap-6 px-5 md:h-[68px] md:px-10 lg:px-12">
        <Link href="/" className="flex items-baseline" aria-label="Andshow home">
          <span className="font-display text-[1.6rem] italic leading-none tracking-tight">
            Andshow
          </span>
          <span className="text-velvet-bright" aria-hidden="true">
            .
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-[13.5px] tracking-wide transition-colors ${
                  isActive ? "text-silver" : "text-ash hover:text-silver"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/search"
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full text-ash transition-colors hover:bg-white/5 hover:text-silver"
          >
            <Search size={17} strokeWidth={1.8} />
          </Link>
          <Link
            href="/profile"
            aria-label="Profile"
            aria-current={pathname === "/profile" ? "page" : undefined}
            className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-graphite-light to-graphite font-mono text-[11px] ring-1 transition-colors hover:text-silver ${
              pathname === "/profile"
                ? "text-silver ring-velvet-bright/60"
                : "text-ash ring-white/10"
            }`}
          >
            A
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="grid h-9 w-9 place-items-center rounded-full text-ash transition-colors hover:bg-white/5 hover:text-silver md:hidden"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav aria-label="Mobile" className="px-5 pb-4 md:hidden">
          <div className="glass rounded-2xl p-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 text-[15px] transition-colors ${
                  pathname === link.href
                    ? "bg-white/5 text-silver"
                    : "text-ash hover:bg-white/5 hover:text-silver"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
