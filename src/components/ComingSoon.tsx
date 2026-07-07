import Link from "next/link";

interface ComingSoonProps {
  /** Human name of the screen, e.g. "Movies". */
  label: string;
}

/** Premium placeholder for routes that arrive in later phases. */
export function ComingSoon({ label }: ComingSoonProps) {
  return (
    <section className="flex min-h-[78vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-velvet-bright">
        Reel not loaded
      </p>
      <h1 className="mt-4 max-w-xl font-display text-4xl italic leading-tight tracking-tight md:text-5xl">
        Still in the cutting room.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ash">
        The {label} screen arrives in the next act. The homepage is showing now.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-white/10 px-6 py-3 text-sm text-silver transition-colors hover:bg-white/5"
      >
        Back to the lobby
      </Link>
    </section>
  );
}
