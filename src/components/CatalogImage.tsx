"use client";

import Image from "next/image";
import { useState } from "react";

interface CatalogImageProps {
  src: string;
  alt: string;
  /** Responsive sizes hint forwarded to next/image. */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Shown if the image fails to load, e.g. the title's first letter. */
  fallbackLabel?: string;
}

/**
 * next/image (fill mode) with a quiet in-brand fallback so a dead TMDB
 * URL degrades to a titled slate instead of a broken-image glyph.
 * Parent must be positioned (relative/absolute).
 */
export function CatalogImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  fallbackLabel,
}: CatalogImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid h-full w-full place-items-center bg-gradient-to-br from-graphite-light to-ink ${className}`}
      >
        <span className="font-display text-3xl italic text-ash/60" aria-hidden="true">
          {fallbackLabel ?? "·"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setHasFailed(true)}
    />
  );
}
