import type { Metadata } from "next";
import { CatalogGridView } from "@/components/CatalogGridView";
import { getAllGenres, getCatalogPage } from "@/lib/catalog";

export const metadata: Metadata = { title: "Browse — Andshow" };

export default async function BrowsePage() {
  const [page, genres] = await Promise.all([
    getCatalogPage({ scope: "browse", page: 1 }),
    getAllGenres(),
  ]);

  return (
    <CatalogGridView
      eyebrow="Full catalog"
      heading="Browse"
      description="Everything currently in the Andshow lobby, gathered into one sortable wall for when you know the mood but not the title."
      titles={page.titles}
      scope="browse"
      liveCatalog={page.liveCatalog}
      page={page.page}
      totalPages={page.totalPages}
      totalResults={page.totalResults}
      genreOptions={genres}
    />
  );
}
