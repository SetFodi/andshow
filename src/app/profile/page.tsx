import type { Metadata } from "next";
import { ProfileView } from "@/components/ProfileView";
import { getCatalogPage, getHomeRails } from "@/lib/catalog";
import type { Rail } from "@/lib/types";

export const metadata: Metadata = { title: "Profile — Andshow" };

const EMPTY_RAIL: Rail = {
  id: "continue-watching",
  heading: "Continue Watching",
  layout: "wide",
  items: [],
};

export default async function ProfilePage() {
  const [rails, pool] = await Promise.all([
    getHomeRails(),
    getCatalogPage({ scope: "browse", page: 1 }),
  ]);

  const continueWatching =
    rails.find((rail) => rail.id === "continue-watching") ?? EMPTY_RAIL;
  const myList = pool.titles.slice(0, 12);

  return <ProfileView continueWatching={continueWatching} myList={myList} />;
}
