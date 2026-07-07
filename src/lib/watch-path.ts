import type { MediaType, Title } from "@/lib/types";

export interface WatchTarget {
  mediaType: MediaType;
  id: number;
  season?: number;
  episode?: number;
}

export const DEFAULT_TV_SEASON = 1;
export const DEFAULT_TV_EPISODE = 1;

export function getWatchPath(title: Title): string {
  if (title.mediaType === "movie") {
    return `/watch/movie/${title.id}`;
  }

  return `/watch/tv/${title.id}/${DEFAULT_TV_SEASON}/${DEFAULT_TV_EPISODE}`;
}
