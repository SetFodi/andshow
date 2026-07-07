import { HomeView } from "@/components/HomeView";
import { getFeaturedTitles, getHomeRails } from "@/lib/catalog";

export default async function HomePage() {
  const [featured, rails] = await Promise.all([getFeaturedTitles(), getHomeRails()]);
  return <HomeView featured={featured} rails={rails} />;
}
