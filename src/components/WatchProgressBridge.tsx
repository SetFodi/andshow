"use client";

import { useEffect } from "react";
import type { MediaType } from "@/lib/types";
import { getWatchProgressStorageKey, parseVidkingMessage } from "@/lib/vidking-events";

interface WatchProgressBridgeProps {
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}

export function WatchProgressBridge({
  id,
  mediaType,
  season,
  episode,
}: WatchProgressBridgeProps) {
  useEffect(() => {
    const storageKey = getWatchProgressStorageKey({
      mediaType,
      id,
      season,
      episode,
    });

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.vidking.net") return;

      const message = parseVidkingMessage(event.data);
      if (!message) return;

      window.localStorage.setItem(storageKey, JSON.stringify(message.data));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [episode, id, mediaType, season]);

  return null;
}
