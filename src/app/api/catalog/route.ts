import { NextRequest, NextResponse } from "next/server";
import { getCatalogPage, type CatalogScope } from "@/lib/catalog";
import type { MediaType } from "@/lib/types";

function parseScope(value: string | null): CatalogScope {
  if (value === "movies" || value === "tv" || value === "browse" || value === "search") {
    return value;
  }
  return "browse";
}

function parsePage(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseMediaType(value: string | null): MediaType | "all" | undefined {
  if (value === "movie" || value === "tv") return value;
  if (value === "all") return "all";
  return undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = await getCatalogPage({
    scope: parseScope(params.get("scope")),
    page: parsePage(params.get("page")),
    query: params.get("query") ?? undefined,
    genre: params.get("genre") ?? undefined,
    mediaType: parseMediaType(params.get("mediaType")),
  });

  return NextResponse.json(page);
}
