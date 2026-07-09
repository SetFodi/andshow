"use client";

import { useCallback, useEffect, useState } from "react";
import { MovieRail } from "@/components/MovieRail";
import type { Rail, RailItem, Title } from "@/lib/types";
import { listContinueWatchingFromStorage } from "@/lib/watch-progress";

interface HomeContinueRailProps {
  onSelect: (title: Title) => void;
}

const EMPTY_RAIL: Rail = {
  id: "continue-watching",
  heading: "Continue Watching",
  layout: "wide",
  items: [],
};

export function HomeContinueRail({ onSelect }: HomeContinueRailProps) {
  const [rail, setRail] = useState<Rail>(EMPTY_RAIL);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const local = listContinueWatchingFromStorage();
    if (local.length === 0) {
      setRail(EMPTY_RAIL);
      setReady(true);
      return;
    }

    const items = (
      await Promise.all(
        local.map(async (entry): Promise<RailItem | null> => {
          try {
            const response = await fetch(`/api/title/${entry.mediaType}/${entry.id}`);
            if (!response.ok) return null;
            const data = (await response.json()) as { title: Title | null };
            if (!data.title) return null;
            return {
              title: data.title,
              progress: entry.progress,
              remainingLabel: entry.remainingLabel,
              season: entry.season,
              episode: entry.episode,
            };
          } catch {
            return null;
          }
        }),
      )
    ).filter((item): item is RailItem => item !== null);

    setRail({
      id: "continue-watching",
      heading: "Continue Watching",
      layout: "wide",
      items,
    });
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const onProgress = () => {
      void refresh();
    };
    window.addEventListener("andshow:watch-progress", onProgress);
    window.addEventListener("storage", onProgress);
    return () => {
      window.removeEventListener("andshow:watch-progress", onProgress);
      window.removeEventListener("storage", onProgress);
    };
  }, [refresh]);

  if (!ready || rail.items.length === 0) return null;

  return <MovieRail rail={rail} onSelect={onSelect} />;
}
