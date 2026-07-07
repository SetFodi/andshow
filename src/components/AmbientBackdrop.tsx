"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CatalogImage } from "@/components/CatalogImage";
import { backdropUrl } from "@/lib/tmdb-image";
import type { Title } from "@/lib/types";

interface AmbientBackdropProps {
  title: Title;
}

/**
 * The projector glow: the active film's backdrop, heavily diffused,
 * spills light behind the whole page and crossfades as the hero rotates.
 */
export function AmbientBackdrop({ title }: AmbientBackdropProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={title.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <CatalogImage
            src={backdropUrl(title.backdropPath, "w780")}
            alt=""
            sizes="100vw"
            className="scale-125 blur-[80px] brightness-[0.32] saturate-[0.8]"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_8%,transparent_0%,rgba(11,11,14,0.55)_62%,#0b0b0e_100%)]" />
    </div>
  );
}
