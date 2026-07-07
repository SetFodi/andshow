import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchPage } from "@/components/WatchPage";
import { getTitleById } from "@/lib/catalog";
import { getWatchSources } from "@/lib/player";

interface WatchMoviePageProps {
  params: Promise<{ id: string }>;
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: WatchMoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const titleId = parsePositiveInt(id);
  if (!titleId) return { title: "Watch — Andshow" };

  const title = await getTitleById(titleId, "movie");
  return {
    title: title?.mediaType === "movie" ? `Watch ${title.name} — Andshow` : "Watch — Andshow",
  };
}

export default async function WatchMoviePage({ params }: WatchMoviePageProps) {
  const { id } = await params;
  const titleId = parsePositiveInt(id);
  if (!titleId) notFound();

  const title = await getTitleById(titleId, "movie");
  if (!title || title.mediaType !== "movie") notFound();

  const target = { mediaType: "movie" as const, id: title.id };
  const sources = getWatchSources(target);
  return <WatchPage title={title} sources={sources} />;
}
