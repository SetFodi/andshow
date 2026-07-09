import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 pt-24 text-center">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-velvet-bright">404</p>
        <h1 className="mt-3 font-display text-5xl italic text-silver md:text-6xl">Reel missing.</h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ash">
          That title or page is not in the house. Head back to the lobby and pick another screening.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-velvet px-6 text-[14px] font-medium text-white transition-colors hover:bg-velvet-bright"
        >
          Back to lobby
        </Link>
      </div>
    </section>
  );
}
