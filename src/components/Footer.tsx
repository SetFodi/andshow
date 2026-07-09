import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Shows" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
  { href: "/profile", label: "Profile" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.06] px-5 pb-10 pt-12 md:px-10 lg:px-12">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl italic tracking-tight">
            Andshow
            <span className="text-velvet-bright" aria-hidden="true">
              .
            </span>
          </p>
          <p className="mt-2 text-sm text-ash">Cinema, without the noise.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2 text-[13px]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ash transition-colors hover:text-silver"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.04] pt-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash/70 md:flex-row md:justify-between">
        <p>Andshow · MMXXVI</p>
        <p>Catalog via TMDB · playback via embed sources</p>
      </div>
    </footer>
  );
}
