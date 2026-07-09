import { ArrowLeft, LockKeyhole, Play } from "lucide-react";
import Link from "next/link";
import { CatalogImage } from "@/components/CatalogImage";
import { TitleMeta } from "@/components/TitleMeta";
import { VidkingPlayerFrame } from "@/components/VidkingPlayerFrame";
import type { WatchSource } from "@/lib/player";
import type { Title } from "@/lib/types";
import { backdropUrl } from "@/lib/tmdb-image";

interface WatchPageProps {
  title: Title;
  sources: WatchSource[];
  episodeLabel?: string;
  season?: number;
  episode?: number;
  nextHref?: string | null;
  nextLabel?: string | null;
}

export function WatchPage({
  title,
  sources,
  episodeLabel,
  season,
  episode,
  nextHref,
  nextLabel,
}: WatchPageProps) {
  const hasIframeSource = sources.some((source) => source.kind === "iframe");
  const backHref = title.mediaType === "movie" ? "/movies" : "/tv";
  const backLabel = title.mediaType === "movie" ? "Back to movies" : "Back to TV";

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-12 pt-24 md:px-10 lg:px-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <CatalogImage
          src={backdropUrl(title.backdropPath, "w1280")}
          alt=""
          sizes="100vw"
          priority
          fallbackLabel={title.name.charAt(0)}
          className="scale-110 blur-[56px] brightness-[0.28] saturate-[0.85]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_18%,rgba(176,64,73,0.18),transparent_58%),linear-gradient(to_bottom,rgba(11,11,14,0.52),#0b0b0e_72%)]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={backHref}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-[13px] text-ash transition-colors hover:bg-white/5 hover:text-silver"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            {backLabel}
          </Link>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ash/80">
            Andshow Screening Room
          </p>
        </div>

        {hasIframeSource ? (
          <VidkingPlayerFrame
            title={title.name}
            sources={sources}
            id={title.id}
            mediaType={title.mediaType}
            season={season}
            episode={episode}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-black shadow-[0_30px_100px_rgba(0,0,0,0.58)] ring-1 ring-white/10">
            <div className="relative aspect-video w-full bg-ink">
              <div className="relative grid h-full place-items-center overflow-hidden">
                <CatalogImage
                  src={backdropUrl(title.backdropPath, "w1280")}
                  alt=""
                  sizes="(min-width: 1024px) 1152px, 100vw"
                  fallbackLabel={title.name.charAt(0)}
                  className="opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
                <div className="relative z-10 max-w-md px-6 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-silver text-ink">
                    <LockKeyhole size={20} aria-hidden="true" />
                  </span>
                  <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.32em] text-velvet-bright">
                    Screening unavailable
                  </p>
                  <h1 className="mt-3 font-display text-4xl italic leading-tight text-silver md:text-5xl">
                    {title.name}
                  </h1>
                  <p className="mt-4 text-[14px] leading-relaxed text-ash">
                    The house lights stay down until this title is cleared for playback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-velvet-bright">
              {episodeLabel ?? (title.mediaType === "movie" ? "Feature Film" : "Series")}
            </p>
            <h2 className="mt-2 font-display text-4xl italic leading-tight tracking-tight text-silver md:text-5xl">
              {title.name}
            </h2>
            <TitleMeta title={title} className="mt-4" />
            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ash">{title.overview}</p>
          </div>

          <aside className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-ash">
              Next Up
            </p>
            {nextHref ? (
              <Link
                href={nextHref}
                className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-velvet text-white">
                  <Play size={14} strokeWidth={0} className="ml-0.5 fill-current" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-silver">{title.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                    {nextLabel ?? "Next episode"}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-graphite text-ash">
                  <Play size={14} strokeWidth={0} className="ml-0.5 fill-current" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-silver">{title.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                    {title.mediaType === "tv" ? "End of available episodes" : title.runtimeLabel}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
