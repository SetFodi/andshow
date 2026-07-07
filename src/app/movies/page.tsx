import type { Metadata } from "next";
import { CatalogGridView } from "@/components/CatalogGridView";
import { getAllGenres, getCatalogPage } from "@/lib/catalog";

export const metadata: Metadata = { title: "Movies — Andshow" };

export default async function MoviesPage() {
  const [page, genres] = await Promise.all([
    getCatalogPage({ scope: "movies", page: 1 }),
    getAllGenres("movie"),
  ]);

  return (
    <CatalogGridView
      eyebrow="Feature archive"
      heading="Movies"
      description="A focused wall of films with the noise turned down: recent spectacle, canon picks, thrillers, animation, and quiet late-night rewatches."
      titles={page.titles}
      scope="movies"
      liveCatalog={page.liveCatalog}
      page={page.page}
      totalPages={page.totalPages}
      totalResults={page.totalResults}
      genreOptions={genres}
    />
  );
}
