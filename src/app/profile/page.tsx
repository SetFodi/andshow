import type { Metadata } from "next";
import { ProfileView } from "@/components/ProfileView";
import { getHomeRails } from "@/lib/catalog";
import type { Rail } from "@/lib/types";

export const metadata: Metadata = { title: "Profile — Andshow" };

const EMPTY_RAIL: Rail = {
  id: "continue-watching",
  heading: "Continue Watching",
  layout: "wide",
  items: [],
};

export default async function ProfilePage() {
  const rails = await getHomeRails();

  const continueWatching =
    rails.find((rail) => rail.id === "continue-watching") ?? EMPTY_RAIL;

  return <ProfileView continueWatching={continueWatching} myList={[]} />;
}
