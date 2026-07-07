"use client";

import { Bug, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WatchSource } from "@/lib/player";
import type { MediaType } from "@/lib/types";
import {
  getWatchProgressStorageKey,
  parseVidkingMessage,
  type VidkingPlayerEvent,
} from "@/lib/vidking-events";

interface VidkingPlayerFrameProps {
  title: string;
  sources: WatchSource[];
  id: number;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}

interface DiagnosticLine {
  id: number;
  time: string;
  message: string;
}

const MAX_LINES = 6;
const MAX_AUTO_RETRIES = 3;
const AUTO_RETRY_DELAY_MS = 1250;

function nowLabel(): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function formatEvent(event: VidkingPlayerEvent): string {
  const { data } = event;
  const current = typeof data.currentTime === "number" ? `${data.currentTime.toFixed(1)}s` : "n/a";
  const duration = typeof data.duration === "number" ? `${data.duration.toFixed(1)}s` : "n/a";
  const progress = typeof data.progress === "number" ? `${data.progress.toFixed(2)}%` : "n/a";
  return `${data.event} · ${current} / ${duration} · ${progress}`;
}

export function VidkingPlayerFrame({
  title,
  sources,
  id,
  mediaType,
  season,
  episode,
}: VidkingPlayerFrameProps) {
  const iframeSources = useMemo(
    () => sources.filter((source) => source.kind === "iframe"),
    [sources],
  );
  const externalSources = useMemo(
    () => sources.filter((source) => source.kind === "external"),
    [sources],
  );
  const [activeSourceId, setActiveSourceId] = useState(() => iframeSources[0]?.id ?? sources[0]?.id);
  const activeSource =
    iframeSources.find((source) => source.id === activeSourceId) ?? iframeSources[0] ?? sources[0];
  const nextIframeSource = useMemo(() => {
    if (!activeSource || iframeSources.length < 2) {
      return null;
    }

    const currentIndex = iframeSources.findIndex((source) => source.id === activeSource.id);
    const laterSource = iframeSources
      .slice(Math.max(currentIndex + 1, 0))
      .find((source) => source.id !== activeSource.id);
    return laterSource ?? iframeSources.find((source) => source.id !== activeSource.id) ?? null;
  }, [activeSource, iframeSources]);
  const fallbackSource = externalSources[0];
  const [iframeKey, setIframeKey] = useState(0);
  const [status, setStatus] = useState("mounting iframe");
  const [lastEvent, setLastEvent] = useState<string>("no PLAYER_EVENT received yet");
  const [lines, setLines] = useState<DiagnosticLine[]>([]);
  const [isStalled, setIsStalled] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [pendingRetry, setPendingRetry] = useState<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const restoredSourceKeyRef = useRef<string | null>(null);
  const canReadProgressEvents = Boolean(activeSource?.progressOrigin);
  const storageKey = useMemo(
    () => getWatchProgressStorageKey({ id, mediaType, season, episode }),
    [episode, id, mediaType, season],
  );
  const sourceStorageKey = useMemo(
    () =>
      ["andshow:watch-source", mediaType, id, season ?? "feature", episode ?? "main"].join(":"),
    [episode, id, mediaType, season],
  );
  const retriesExhausted = isStalled && autoRetryCount >= MAX_AUTO_RETRIES && pendingRetry === null;

  const addLine = useCallback((message: string) => {
    setLines((current) =>
      [{ id: Date.now() + Math.random(), time: nowLabel(), message }, ...current].slice(
        0,
        MAX_LINES,
      ),
    );
  }, []);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const resetPlaybackState = useCallback(() => {
    clearRetryTimer();
    setPendingRetry(null);
    setAutoRetryCount(0);
    setIsStalled(false);
    setLastEvent("no PLAYER_EVENT received yet");
  }, [clearRetryTimer]);

  const persistSource = useCallback(
    (source: WatchSource) => {
      window.localStorage.setItem(sourceStorageKey, source.id);
    },
    [sourceStorageKey],
  );

  const switchIframeSource = useCallback(
    (source: WatchSource, statusText?: string) => {
      if (source.id === activeSource?.id) {
        return;
      }

      resetPlaybackState();
      setActiveSourceId(source.id);
      setIframeKey((key) => key + 1);
      persistSource(source);
      const nextStatus = statusText ?? `${source.label} selected`;
      setStatus(nextStatus);
      addLine(nextStatus);
      console.info("[Andshow Player] source selected", source);
    },
    [activeSource?.id, addLine, persistSource, resetPlaybackState],
  );

  const scheduleAutoRetry = useCallback(
    (currentRetryCount: number) => {
      if (!activeSource) {
        return;
      }

      if (retryTimerRef.current !== null) {
        return;
      }

      const nextRetry = currentRetryCount + 1;
      if (nextRetry > MAX_AUTO_RETRIES) {
        setPendingRetry(null);
        setStatus(`${activeSource.label} stalled at 0:00 · retries exhausted`);
        addLine("auto retries exhausted; use external fallback");
        return;
      }

      setPendingRetry(nextRetry);
      setStatus(`${activeSource.label} stalled at 0:00 · retrying ${nextRetry}/${MAX_AUTO_RETRIES}`);
      addLine(`auto retry ${nextRetry}/${MAX_AUTO_RETRIES} scheduled`);
      console.warn("[Andshow Vidking] zero-time playback; scheduling iframe retry", {
        source: activeSource.label,
        nextRetry,
        maxRetries: MAX_AUTO_RETRIES,
        url: activeSource.url,
      });

      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        setPendingRetry(null);
        setAutoRetryCount(nextRetry);
        setIframeKey((key) => key + 1);
        setStatus(`iframe auto retry ${nextRetry}/${MAX_AUTO_RETRIES}`);
        addLine(`iframe auto retry ${nextRetry}/${MAX_AUTO_RETRIES}`);
        console.info("[Andshow Vidking] iframe auto retry", {
          source: activeSource.label,
          retry: nextRetry,
          url: activeSource.url,
        });
      }, AUTO_RETRY_DELAY_MS);
    },
    [activeSource, addLine],
  );

  useEffect(() => {
    console.info("[Andshow Vidking] mount", {
      sources,
      id,
      mediaType,
      season,
      episode,
      storageKey,
    });
  }, [episode, id, mediaType, season, sources, storageKey]);

  useEffect(() => {
    if (restoredSourceKeyRef.current === sourceStorageKey) {
      return;
    }

    restoredSourceKeyRef.current = sourceStorageKey;
    const storedSourceId = window.localStorage.getItem(sourceStorageKey);
    const restoredSource = iframeSources.find((source) => source.id === storedSourceId);
    if (restoredSource) {
      const restoreTimer = window.setTimeout(() => {
        switchIframeSource(restoredSource, `${restoredSource.label} restored`);
      }, 0);
      return () => window.clearTimeout(restoreTimer);
    }
  }, [iframeSources, sourceStorageKey, switchIframeSource]);

  useEffect(() => () => clearRetryTimer(), [clearRetryTimer]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!activeSource?.progressOrigin || event.origin !== activeSource.progressOrigin) {
        return;
      }

      const parsed = parseVidkingMessage(event.data);
      if (!parsed) {
        console.debug("[Andshow Vidking] non-player message", event.data);
        addLine("Vidking message received, not PLAYER_EVENT");
        return;
      }

      const formatted = formatEvent(parsed);
      const currentTime = parsed.data.currentTime ?? 0;
      const progress = parsed.data.progress ?? 0;
      const isZeroPlayback =
        (parsed.data.event === "play" || parsed.data.event === "pause") &&
        currentTime === 0 &&
        progress === 0;

      setLastEvent(formatted);
      window.localStorage.setItem(storageKey, JSON.stringify(parsed.data));
      console.debug("[Andshow Vidking] PLAYER_EVENT", parsed.data);
      addLine(formatted);

      if (isZeroPlayback) {
        setIsStalled(true);
        if (autoRetryCount < MAX_AUTO_RETRIES) {
          scheduleAutoRetry(autoRetryCount);
        } else {
          clearRetryTimer();
          setPendingRetry(null);
          if (nextIframeSource) {
            switchIframeSource(
              nextIframeSource,
              `${activeSource.label} exhausted; switched to ${nextIframeSource.label}`,
            );
          } else {
            setStatus(`${activeSource.label} stalled at 0:00 · retries exhausted`);
            addLine("auto retries exhausted; use external fallback");
          }
        }
        return;
      }

      clearRetryTimer();
      setPendingRetry(null);
      setAutoRetryCount(0);
      setIsStalled(false);
      setStatus(`player event: ${parsed.data.event}`);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [
    activeSource,
    addLine,
    autoRetryCount,
    clearRetryTimer,
    nextIframeSource,
    scheduleAutoRetry,
    storageKey,
    switchIframeSource,
  ]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const nextStatus = document.hidden ? "tab hidden" : "tab visible";
      setStatus(nextStatus);
      console.info("[Andshow Vidking] visibility", nextStatus);
      addLine(nextStatus);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [addLine]);

  const copySource = async () => {
    if (!activeSource) return;

    await navigator.clipboard.writeText(activeSource.url);
    addLine(`${activeSource.label} source URL copied`);
    console.info("[Andshow Vidking] copied source URL", activeSource.url);
  };

  const reloadFrame = () => {
    resetPlaybackState();
    setIframeKey((key) => key + 1);
    setStatus("iframe reloading");
    addLine("iframe reload requested");
    console.info("[Andshow Vidking] iframe reload requested");
  };

  const selectIframeSource = (source: WatchSource) => {
    switchIframeSource(source);
  };

  if (!activeSource) {
    return null;
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.025] p-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash">
          Sources
        </p>
        <div className="flex flex-wrap items-center gap-2" aria-label="Playback sources">
          {iframeSources.map((source) => {
            const isActive = source.id === activeSource.id;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => selectIframeSource(source)}
                aria-pressed={isActive}
                aria-label={`${source.label} ${source.detail}`}
                className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? "border-velvet/50 bg-velvet/20 text-silver"
                    : "border-white/10 text-ash hover:bg-white/5 hover:text-silver"
                }`}
              >
                <span>{source.label}</span>
                <span className="text-[9px] tracking-[0.12em] text-ash/80">{source.detail}</span>
              </button>
            );
          })}
          {externalSources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${source.label} ${source.detail}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ash transition-colors hover:bg-white/5 hover:text-silver"
            >
              <ExternalLink size={13} aria-hidden="true" />
              <span>{source.label}</span>
              <span className="text-[9px] tracking-[0.12em] text-ash/80">{source.detail}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-black shadow-[0_30px_100px_rgba(0,0,0,0.58)] ring-1 ring-white/10">
        <div className="relative aspect-video w-full bg-ink">
          <iframe
            key={iframeKey}
            src={activeSource.url}
            title={`${title} ${activeSource.label} player`}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={() => {
              const retryNote =
                autoRetryCount > 0 ? ` after retry ${autoRetryCount}/${MAX_AUTO_RETRIES}` : "";
              setStatus(`iframe loaded${retryNote}`);
              addLine(`iframe load event fired${retryNote}`);
              console.info("[Andshow Vidking] iframe loaded", activeSource.url);
            }}
            onError={() => {
              setStatus("iframe error");
              addLine("iframe error event fired");
              console.error("[Andshow Vidking] iframe error", activeSource.url);
            }}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 border border-white/10 bg-white/[0.025] p-3 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-velvet-bright">
              <Bug size={13} aria-hidden="true" />
              Player diagnostics
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ash">
              {status}
            </p>
          </div>
          <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-ash/85">
            Source: {activeSource.label} · {activeSource.url}
          </p>
          {canReadProgressEvents ? (
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-ash/85">
              Last event: {lastEvent}
            </p>
          ) : (
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-ash/85">
              Last event: this source does not publish player events
            </p>
          )}
          {(pendingRetry !== null || autoRetryCount > 0) && (
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-ash/85">
              Auto retry:{" "}
              {pendingRetry !== null
                ? `${pendingRetry}/${MAX_AUTO_RETRIES} scheduled`
                : `${autoRetryCount}/${MAX_AUTO_RETRIES} loaded`}
            </p>
          )}
          {canReadProgressEvents && nextIframeSource && (
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-ash/85">
              Failover: {nextIframeSource.label} after {MAX_AUTO_RETRIES} retries
            </p>
          )}
          <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
            If Chrome shows “Paused in debugger” over the player, press the blue resume button in
            DevTools. The iframe cannot continue while its script is paused.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
            Cineby works as a top-level fallback for some titles, but it sends X-Frame-Options:
            DENY, so browsers block it inside an iframe.
          </p>
          {isStalled && (
            <div className="mt-3 border border-velvet/30 bg-velvet/10 p-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-velvet-bright">
                {retriesExhausted
                  ? `${activeSource.label} retries exhausted`
                  : `${activeSource.label} source stalled`}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
                {retriesExhausted
                  ? `${activeSource.label} kept reporting 0:00 after automatic reloads. An external fallback may have a better source for this title, but it must open in a new tab.`
                  : `${activeSource.label} reported playback at 0:00 without advancing. Andshow is reloading the embed automatically while keeping the external fallback ready.`}
              </p>
              {fallbackSource && (
                <a
                  href={fallbackSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-velvet px-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-velvet-bright"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Open {fallbackSource.label} fallback
                </a>
              )}
            </div>
          )}
          {lines.length > 0 && (
            <ol className="mt-3 space-y-1 font-mono text-[10.5px] text-ash/75">
              {lines.map((line) => (
                <li key={line.id}>
                  <span className="text-silver/60">{line.time}</span> {line.message}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-2 md:justify-end">
          <button
            type="button"
            onClick={reloadFrame}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ash transition-colors hover:bg-white/5 hover:text-silver"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Reload
          </button>
          <button
            type="button"
            onClick={copySource}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ash transition-colors hover:bg-white/5 hover:text-silver"
          >
            <Copy size={13} aria-hidden="true" />
            Copy
          </button>
          <a
            href={activeSource.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ash transition-colors hover:bg-white/5 hover:text-silver"
          >
            <ExternalLink size={13} aria-hidden="true" />
            Open
          </a>
          {fallbackSource && (
            <a
              href={fallbackSource.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-velvet/30 bg-velvet/10 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-silver transition-colors hover:bg-velvet/20"
            >
              <ExternalLink size={13} aria-hidden="true" />
              {fallbackSource.label}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
