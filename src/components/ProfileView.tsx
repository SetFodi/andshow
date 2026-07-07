"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, Film, ListVideo, Pencil, Star, Tv } from "lucide-react";
import { useMemo, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { MovieRail } from "@/components/MovieRail";
import { EASE_REEL, fadeRise, staggerContainer } from "@/lib/motion";
import type { Rail, Title } from "@/lib/types";

interface ProfileViewProps {
  continueWatching: Rail;
  myList: readonly Title[];
}

const MEMBER = {
  name: "Guest Cinephile",
  handle: "@andshow.guest",
  memberSince: "Member since MMXXVI",
};

const HOURS_PER_FILM = 2.1;

function averageRating(titles: readonly Title[]): string {
  if (titles.length === 0) return "0.0";
  const total = titles.reduce((sum, title) => sum + title.rating, 0);
  return (total / titles.length).toFixed(1);
}

function topGenres(titles: readonly Title[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const title of titles) {
    for (const genre of title.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function ProfileView({ continueWatching, myList }: ProfileViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);

  const watchedPool = useMemo(
    () => [...continueWatching.items.map((item) => item.title), ...myList],
    [continueWatching.items, myList],
  );
  const movieCount = watchedPool.filter((title) => title.mediaType === "movie").length;
  const seriesCount = watchedPool.length - movieCount;
  const genres = useMemo(() => topGenres(watchedPool), [watchedPool]);

  const stats = [
    { label: "Titles", value: String(watchedPool.length), icon: ListVideo },
    { label: "Hours", value: `${Math.round(watchedPool.length * HOURS_PER_FILM)}h`, icon: Clock },
    { label: "Avg rating", value: averageRating(watchedPool), icon: Star },
    {
      label: "Films / Series",
      value: `${movieCount} / ${seriesCount}`,
      icon: Film,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden px-5 pb-2 pt-28 md:px-10 md:pt-32 lg:px-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(60%_100%_at_20%_0%,rgba(176,64,73,0.22),transparent_70%)]" />

        <motion.div
          className="flex flex-col gap-6 sm:flex-row sm:items-center"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_REEL }}
        >
          <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full bg-gradient-to-br from-velvet to-graphite ring-1 ring-white/15 md:h-28 md:w-28">
            <span className="font-display text-4xl italic text-silver">A</span>
            <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-ink ring-1 ring-white/15">
              <span className="h-2.5 w-2.5 rounded-full bg-velvet-bright" aria-hidden="true" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-velvet-bright">
              {MEMBER.memberSince}
            </p>
            <h1 className="mt-2 font-display text-4xl italic leading-none tracking-tight text-silver md:text-6xl">
              {MEMBER.name}
            </h1>
            <p className="mt-2 font-mono text-[12px] tracking-wide text-ash">{MEMBER.handle}</p>
          </div>

          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border border-white/12 px-5 text-[13px] text-silver transition-colors hover:bg-white/5 sm:self-center"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit profile
          </button>
        </motion.div>

        <motion.dl
          className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4"
          variants={staggerContainer(0.07)}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate="visible"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeRise}
                transition={{ duration: 0.5, ease: EASE_REEL }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                  <Icon size={13} aria-hidden="true" />
                  {stat.label}
                </dt>
                <dd className="mt-3 font-display text-3xl italic text-silver">{stat.value}</dd>
              </motion.div>
            );
          })}
        </motion.dl>

        {genres.length > 0 && (
          <div className="mt-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-ash">
              Your taste
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <li
                  key={genre.name}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-[12.5px] text-silver"
                >
                  {genre.name}
                  <span className="font-mono text-[10px] text-ash">{genre.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {continueWatching.items.length > 0 && (
        <div className="mt-10">
          <MovieRail rail={continueWatching} onSelect={setSelectedTitle} />
        </div>
      )}

      <section className="px-5 py-10 md:px-10 lg:px-12" aria-labelledby="my-list-heading">
        <div className="mb-5 flex items-center gap-3">
          <Tv size={16} className="text-velvet-bright" aria-hidden="true" />
          <h2 id="my-list-heading" className="text-[17px] font-medium tracking-tight text-silver">
            My List
          </h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash/80">
            {myList.length} saved
          </span>
        </div>

        {myList.length > 0 ? (
          <motion.ul
            className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            variants={staggerContainer(0.04)}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {myList.map((title) => (
              <motion.li
                key={`${title.mediaType}-${title.id}`}
                variants={fadeRise}
                transition={{ duration: 0.5, ease: EASE_REEL }}
                className="min-w-0"
              >
                <MovieCard title={title} onSelect={setSelectedTitle} variant="grid" />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <p className="text-sm text-ash">Your list is empty — add titles from any detail view.</p>
        )}
      </section>

      <AnimatePresence>
        {selectedTitle && (
          <MovieDetailModal title={selectedTitle} onClose={() => setSelectedTitle(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
