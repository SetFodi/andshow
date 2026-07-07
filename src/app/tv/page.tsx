import type { Metadata } from "next";
import { CatalogGridView } from "@/components/CatalogGridView";
import { getAllGenres, getCatalogPage } from "@/lib/catalog";

export const metadata: Metadata = { title: "TV Shows — Andshow" };

export default async function TvPage() {
  const [page, genres] = await Promise.all([
    getCatalogPage({ scope: "tv", page: 1 }),
    getAllGenres("tv"),
  ]);

  return (
    <CatalogGridView
      eyebrow="Series archive"
      heading="TV Shows"
      description="Prestige series, genre obsessions, and one-more-episode comfort watches arranged for fast scanning and quick detail checks."
      titles={page.titles}
      scope="tv"
      liveCatalog={page.liveCatalog}
      page={page.page}
      totalPages={page.totalPages}
      totalResults={page.totalResults}
      genreOptions={genres}
    />
  );
}
