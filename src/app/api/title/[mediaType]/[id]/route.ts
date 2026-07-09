import { NextResponse } from "next/server";
import { getTitleById } from "@/lib/catalog";
import { getTvDetails, isTmdbConfigured } from "@/lib/tmdb/client";
import type { MediaType } from "@/lib/types";

interface RouteProps {
  params: Promise<{ mediaType: string; id: string }>;
}

function parseMediaType(value: string): MediaType | null {
  return value === "movie" || value === "tv" ? value : null;
}

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { mediaType: mediaTypeRaw, id: idRaw } = await params;
  const mediaType = parseMediaType(mediaTypeRaw);
  const id = parseId(idRaw);
  if (!mediaType || !id) {
    return NextResponse.json({ error: "Invalid title request" }, { status: 400 });
  }

  const title = await getTitleById(id, mediaType);
  if (!title) {
    return NextResponse.json({ error: "Title not found" }, { status: 404 });
  }

  let seasons: Array<{ season_number: number; name: string; episode_count: number }> = [];
  if (mediaType === "tv" && isTmdbConfigured()) {
    const details = await getTvDetails(id);
    seasons = (details?.seasons ?? [])
      .filter((season) => season.season_number > 0 && season.episode_count > 0)
      .map((season) => ({
        season_number: season.season_number,
        name: season.name,
        episode_count: season.episode_count,
      }));
  }

  return NextResponse.json({ title, seasons });
}
