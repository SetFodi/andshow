import type { MediaType } from "@/lib/types";

const PREFIX = "andshow:watch-progress:";

export interface StoredWatchProgress {
  event: string;
  currentTime?: number;
  duration?: number;
  progress?: number;
  id: string;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}

export interface ContinueWatchingLocalEntry {
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
  progress: number;
  remainingLabel: string;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}


export function getWatchProgressKey(params: {
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}): string {
  return [
    "andshow:watch-progress",
    params.mediaType,
    params.id,
    params.season ?? "feature",
    params.episode ?? "main",
  ].join(":");
}

export function writeWatchProgress(
  params: {
    id: number;
    mediaType: MediaType;
    season?: number;
    episode?: number;
  },
  data: Partial<StoredWatchProgress> & { progress?: number },
): void {
  if (!canUseStorage()) return;

  const existing = readWatchProgress(params);
  const next: StoredWatchProgress = {
    event: data.event ?? existing?.event ?? "timeupdate",
    currentTime: data.currentTime ?? existing?.currentTime,
    duration: data.duration ?? existing?.duration,
    progress: data.progress ?? existing?.progress ?? 5,
    id: String(params.id),
    mediaType: params.mediaType,
    season: params.season ?? existing?.season,
    episode: params.episode ?? existing?.episode,
  };

  window.localStorage.setItem(getWatchProgressKey(params), JSON.stringify(next));
  window.dispatchEvent(new Event("andshow:watch-progress"));
}

export function markWatchStarted(params: {
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}): void {
  const existing = readWatchProgress(params);
  const progress = existing?.progress && existing.progress > 5 ? existing.progress : 8;
  writeWatchProgress(params, {
    event: "play",
    progress,
    currentTime: existing?.currentTime,
    duration: existing?.duration,
  });
}

export function readWatchProgress(params: {
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}): StoredWatchProgress | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(getWatchProgressKey(params));
    if (!raw) return null;
    return JSON.parse(raw) as StoredWatchProgress;
  } catch {
    return null;
  }
}

function formatRemaining(data: StoredWatchProgress): string {
  if (data.mediaType === "tv" && data.season && data.episode) {
    return `S${data.season} · E${data.episode}`;
  }

  const current = data.currentTime ?? 0;
  const duration = data.duration ?? 0;
  if (duration > current) {
    const minutes = Math.max(1, Math.round((duration - current) / 60));
    return `${minutes}m left`;
  }

  const progress = (data.progress ?? 0) / 100;
  if (progress > 0 && progress < 1) {
    return `${Math.round((1 - progress) * 100)}% left`;
  }

  return "Resume";
}

export function listContinueWatchingFromStorage(): ContinueWatchingLocalEntry[] {
  if (!canUseStorage()) return [];

  const entries: ContinueWatchingLocalEntry[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;

    try {
      const data = JSON.parse(window.localStorage.getItem(key) ?? "") as StoredWatchProgress;
      const progressRatio =
        typeof data.progress === "number"
          ? data.progress / 100
          : data.duration && data.currentTime
            ? data.currentTime / data.duration
            : 0;

      if (progressRatio < 0.05 || progressRatio >= 0.95) continue;

      const id = Number(data.id);
      if (!Number.isFinite(id) || id <= 0) continue;
      if (data.mediaType !== "movie" && data.mediaType !== "tv") continue;

      entries.push({
        id,
        mediaType: data.mediaType,
        season: data.season,
        episode: data.episode,
        progress: progressRatio,
        remainingLabel: formatRemaining(data),
      });
    } catch {
      // skip corrupt entries
    }
  }

  return entries.sort((a, b) => b.progress - a.progress).slice(0, 12);
}
