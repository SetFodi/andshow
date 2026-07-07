import type { Metadata } from "next";
import { CatalogSearchView } from "@/components/CatalogSearchView";
import { getCatalogPage } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search — Andshow" };

export default async function SearchPage() {
  const page = await getCatalogPage({ scope: "search", page: 1 });

  return <CatalogSearchView titles={page.titles} liveCatalog={page.liveCatalog} />;
}
