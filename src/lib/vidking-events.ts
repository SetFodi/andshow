import type { MediaType } from "@/lib/types";

export interface VidkingPlayerEvent {
  type: "PLAYER_EVENT";
  data: {
    event: "timeupdate" | "play" | "pause" | "ended" | "seeked";
    currentTime?: number;
    duration?: number;
    progress?: number;
    id: string;
    mediaType: MediaType;
    season?: number;
    episode?: number;
    timestamp?: number;
  };
}

export function getWatchProgressStorageKey({
  id,
  mediaType,
  season,
  episode,
}: {
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}): string {
  return [
    "andshow:watch-progress",
    mediaType,
    id,
    season ?? "feature",
    episode ?? "main",
  ].join(":");
}

export function parseVidkingMessage(data: unknown): VidkingPlayerEvent | null {
  if (typeof data !== "string") return null;

  try {
    const parsed = JSON.parse(data) as Partial<VidkingPlayerEvent>;
    return parsed.type === "PLAYER_EVENT" && parsed.data ? (parsed as VidkingPlayerEvent) : null;
  } catch {
    return null;
  }
}
