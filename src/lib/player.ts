import { DEFAULT_TV_EPISODE, DEFAULT_TV_SEASON, type WatchTarget } from "@/lib/watch-path";

const VIDKING_BASE_URL = "https://www.vidking.net/embed";
const CINEBY_BASE_URL = "https://www.cineby.at";
const ANDSHOW_PLAYER_COLOR = "dd6a71";
const DEFAULT_VIDSRC_BASE_URL = "https://vidsrcme.su";

export interface WatchSource {
  id: string;
  label: string;
  detail: string;
  kind: "iframe" | "external";
  url: string;
  progressOrigin?: string;
}

const VIDSRC_MIRRORS = [
  "https://vidsrcme.su",
  "https://vidsrc-embed.su",
  "https://vsrc.su",
  "https://vidsrc-embed.ru",
] as const;

function getVidsrcBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_VIDSRC_EMBED_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return DEFAULT_VIDSRC_BASE_URL;
}

export function getVidsrcMirrorUrls(target: WatchTarget): string[] {
  const preferred = getVidsrcBaseUrl();
  const bases = [preferred, ...VIDSRC_MIRRORS.filter((mirror) => mirror !== preferred)];
  return bases.map((base) => {
    if (target.mediaType === "tv") {
      const season = target.season ?? DEFAULT_TV_SEASON;
      const episode = target.episode ?? DEFAULT_TV_EPISODE;
      const url = new URL(`${base}/embed/tv/${target.id}/${season}-${episode}`);
      url.searchParams.set("autoplay", "1");
      url.searchParams.set("autonext", "1");
      return url.toString();
    }
    const url = new URL(`${base}/embed/movie/${target.id}`);
    url.searchParams.set("autoplay", "1");
    return url.toString();
  });
}

export function getVidsrcPlayerUrl(target: WatchTarget): string {
  const baseUrl = getVidsrcBaseUrl();
  if (target.mediaType === "tv") {
    const season = target.season ?? DEFAULT_TV_SEASON;
    const episode = target.episode ?? DEFAULT_TV_EPISODE;
    const url = new URL(`${baseUrl}/embed/tv/${target.id}/${season}-${episode}`);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("autonext", "1");
    return url.toString();
  }

  const url = new URL(`${baseUrl}/embed/movie/${target.id}`);
  url.searchParams.set("autoplay", "1");
  return url.toString();
}

export function getVidkingPlayerUrl(target: WatchTarget): string {
  if (target.mediaType === "tv") {
    const season = target.season ?? DEFAULT_TV_SEASON;
    const episode = target.episode ?? DEFAULT_TV_EPISODE;
    const url = new URL(`${VIDKING_BASE_URL}/tv/${target.id}/${season}/${episode}`);
    url.searchParams.set("color", ANDSHOW_PLAYER_COLOR);
    url.searchParams.set("nextEpisode", "true");
    url.searchParams.set("episodeSelector", "true");
    return url.toString();
  }

  const url = new URL(`${VIDKING_BASE_URL}/movie/${target.id}`);
  url.searchParams.set("color", ANDSHOW_PLAYER_COLOR);
  return url.toString();
}

export function getCinebyWatchUrl(target: WatchTarget): string {
  if (target.mediaType === "tv") {
    const season = target.season ?? DEFAULT_TV_SEASON;
    const episode = target.episode ?? DEFAULT_TV_EPISODE;
    const url = new URL(`${CINEBY_BASE_URL}/tv/${target.id}/${season}/${episode}`);
    url.searchParams.set("play", "true");
    return url.toString();
  }

  const url = new URL(`${CINEBY_BASE_URL}/movie/${target.id}`);
  url.searchParams.set("play", "true");
  return url.toString();
}

function getTemplateForTarget(target: WatchTarget): string | undefined {
  if (target.mediaType === "tv") {
    return process.env.NEXT_PUBLIC_ANDSHOW_CUSTOM_TV_EMBED_TEMPLATE;
  }

  return process.env.NEXT_PUBLIC_ANDSHOW_CUSTOM_MOVIE_EMBED_TEMPLATE;
}

export function applyWatchSourceTemplate(template: string, target: WatchTarget): string | null {
  const season = target.season ?? DEFAULT_TV_SEASON;
  const episode = target.episode ?? DEFAULT_TV_EPISODE;
  const rendered = template
    .replaceAll("{tmdbId}", String(target.id))
    .replaceAll("{id}", String(target.id))
    .replaceAll("{mediaType}", target.mediaType)
    .replaceAll("{season}", String(season))
    .replaceAll("{episode}", String(episode));

  try {
    const url = new URL(rendered);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getConfiguredIframeSource(target: WatchTarget): WatchSource | null {
  const template = getTemplateForTarget(target);
  if (!template) return null;

  const url = applyWatchSourceTemplate(template, target);
  if (!url) return null;

  return {
    id: "custom",
    label: process.env.NEXT_PUBLIC_ANDSHOW_CUSTOM_EMBED_LABEL || "Custom",
    detail: "Configured iframe",
    kind: "iframe",
    url,
  };
}

export function getWatchSources(target: WatchTarget): WatchSource[] {
  const sources: WatchSource[] = [
    {
      id: "vidsrc",
      label: "Vidsrc",
      detail: "Embed",
      kind: "iframe",
      url: getVidsrcPlayerUrl(target),
    },
    {
      id: "vidking",
      label: "Vidking",
      detail: "Embed",
      kind: "iframe",
      url: getVidkingPlayerUrl(target),
      progressOrigin: "https://www.vidking.net",
    },
  ];

  const configuredSource = getConfiguredIframeSource(target);
  if (configuredSource) {
    sources.push(configuredSource);
  }

  sources.push({
    id: "cineby",
    label: "Cineby",
    detail: "External",
    kind: "external",
    url: getCinebyWatchUrl(target),
  });

  return sources;
}
