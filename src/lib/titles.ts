import type { Title } from "@/lib/types";

export function titleKey(title: Pick<Title, "mediaType" | "id">): string {
  return `${title.mediaType}-${title.id}`;
}

export function dedupeTitles(titles: readonly Title[]): Title[] {
  const seen = new Set<string>();
  const result: Title[] = [];

  for (const title of titles) {
    const key = titleKey(title);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(title);
  }

  return result;
}
