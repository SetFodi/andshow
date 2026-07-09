import { NextResponse } from "next/server";
import { getTvSeason } from "@/lib/tmdb/client";

interface RouteProps {
  params: Promise<{ id: string; season: string }>;
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { id: idRaw, season: seasonRaw } = await params;
  const id = parsePositiveInt(idRaw);
  const season = parsePositiveInt(seasonRaw);
  if (!id || !season) {
    return NextResponse.json({ error: "Invalid season request" }, { status: 400 });
  }

  const details = await getTvSeason(id, season);
  if (!details) {
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  }

  return NextResponse.json(details);
}
