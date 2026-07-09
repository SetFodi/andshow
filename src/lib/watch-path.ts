import type { MediaType, Title } from "@/lib/types";

export interface WatchTarget {
  mediaType: MediaType;
  id: number;
  season?: number;
  episode?: number;
}

export const DEFAULT_TV_SEASON = 1;
export const DEFAULT_TV_EPISODE = 1;

export function getWatchPath(
  title: Pick<Title, "id" | "mediaType">,
  options?: { season?: number; episode?: number },
): string {
  if (title.mediaType === "movie") {
    return `/watch/movie/${title.id}`;
  }

  const season = options?.season ?? DEFAULT_TV_SEASON;
  const episode = options?.episode ?? DEFAULT_TV_EPISODE;
  return `/watch/tv/${title.id}/${season}/${episode}`;
}
