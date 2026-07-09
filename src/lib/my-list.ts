import type { MediaType, Title } from "@/lib/types";

const STORAGE_KEY = "andshow:my-list";

export interface MyListEntry {
  id: number;
  mediaType: MediaType;
  name: string;
  posterPath: string;
  backdropPath: string;
  yearLabel: string;
  year: number;
  rating: number;
  genres: string[];
  overview: string;
  addedAt: number;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readMyList(): MyListEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MyListEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMyList(entries: MyListEntry[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function isInMyList(id: number, mediaType: MediaType): boolean {
  return readMyList().some((entry) => entry.id === id && entry.mediaType === mediaType);
}

export function toggleMyList(title: Title): boolean {
  const current = readMyList();
  const index = current.findIndex(
    (entry) => entry.id === title.id && entry.mediaType === title.mediaType,
  );

  if (index >= 0) {
    current.splice(index, 1);
    writeMyList(current);
    return false;
  }

  current.unshift({
    id: title.id,
    mediaType: title.mediaType,
    name: title.name,
    posterPath: title.posterPath,
    backdropPath: title.backdropPath,
    yearLabel: title.yearLabel,
    year: title.year,
    rating: title.rating,
    genres: [...title.genres],
    overview: title.overview,
    addedAt: Date.now(),
  });
  writeMyList(current);
  return true;
}

export function myListToTitles(entries: MyListEntry[]): Title[] {
  return entries.map((entry) => ({
    id: entry.id,
    mediaType: entry.mediaType,
    name: entry.name,
    year: entry.year,
    yearLabel: entry.yearLabel,
    runtimeLabel: "—",
    rating: entry.rating,
    genres: entry.genres,
    overview: entry.overview,
    cast: [],
    posterPath: entry.posterPath,
    backdropPath: entry.backdropPath,
  }));
}
