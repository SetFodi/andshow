"use client";

import { Play } from "lucide-react";
import { CatalogImage } from "@/components/CatalogImage";
import { backdropUrl } from "@/lib/tmdb-image";
import type { RailItem } from "@/lib/types";

interface ContinueCardProps {
  item: RailItem;
  onSelect: (title: RailItem["title"]) => void;
}

const FULL_WIDTH_PERCENT = 100;

/**
 * Wide resume card for the Continue Watching rail: backdrop still,
 * time-remaining label, and a velvet progress line along the base.
 */
export function ContinueCard({ item, onSelect }: ContinueCardProps) {
  const { title, progress = 0, remainingLabel } = item;
  const progressPercent = Math.min(Math.max(progress, 0), 1) * FULL_WIDTH_PERCENT;

  return (
    <button
      type="button"
      onClick={() => onSelect(title)}
      aria-label={`Resume ${title.name}${remainingLabel ? ` — ${remainingLabel}` : ""}`}
      aria-haspopup="dialog"
      className="group relative w-[290px] shrink-0 transform-gpu snap-start rounded-xl transition-transform duration-500 ease-reel hover:z-10 hover:scale-[1.03] focus-visible:z-10 focus-visible:scale-[1.03] sm:w-[330px]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-graphite ring-1 ring-white/[0.07]">
        <CatalogImage
          src={backdropUrl(title.backdropPath, "w780")}
          alt={`${title.name} still`}
          sizes="(min-width: 640px) 330px, 290px"
          fallbackLabel={title.name.charAt(0)}
          className="transition-transform duration-700 ease-reel group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
        <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="glass grid h-12 w-12 place-items-center rounded-full text-silver">
            <Play size={16} strokeWidth={0} className="ml-0.5 fill-current" aria-hidden="true" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5 pb-4 text-left">
          <p className="min-w-0 truncate text-[13.5px] font-medium text-silver">{title.name}</p>
          {remainingLabel && (
            <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
              {remainingLabel}
            </p>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
          <div className="h-full bg-velvet" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </button>
  );
}
