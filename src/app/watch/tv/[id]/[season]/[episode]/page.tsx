import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchPage } from "@/components/WatchPage";
import { getTitleById } from "@/lib/catalog";
import { getWatchSources } from "@/lib/player";

interface WatchTvPageProps {
  params: Promise<{ id: string; season: string; episode: string }>;
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: WatchTvPageProps): Promise<Metadata> {
  const { id, season, episode } = await params;
  const titleId = parsePositiveInt(id);
  const seasonNumber = parsePositiveInt(season);
  const episodeNumber = parsePositiveInt(episode);
  if (!titleId || !seasonNumber || !episodeNumber) return { title: "Watch — Andshow" };

  const title = await getTitleById(titleId, "tv");
  return {
    title:
      title?.mediaType === "tv"
        ? `Watch ${title.name} S${seasonNumber} E${episodeNumber} — Andshow`
        : "Watch — Andshow",
  };
}

export default async function WatchTvPage({ params }: WatchTvPageProps) {
  const { id, season, episode } = await params;
  const titleId = parsePositiveInt(id);
  const seasonNumber = parsePositiveInt(season);
  const episodeNumber = parsePositiveInt(episode);
  if (!titleId || !seasonNumber || !episodeNumber) notFound();

  const title = await getTitleById(titleId, "tv");
  if (!title || title.mediaType !== "tv") notFound();

  const target = {
    mediaType: "tv",
    id: title.id,
    season: seasonNumber,
    episode: episodeNumber,
  } as const;
  const sources = getWatchSources(target);

  return (
    <WatchPage
      title={title}
      sources={sources}
      episodeLabel={`Season ${seasonNumber} · Episode ${episodeNumber}`}
      season={seasonNumber}
      episode={episodeNumber}
    />
  );
}
