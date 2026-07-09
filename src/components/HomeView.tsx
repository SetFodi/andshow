"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { Hero } from "@/components/Hero";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { HomeContinueRail } from "@/components/HomeContinueRail";
import { MovieRail } from "@/components/MovieRail";
import type { Rail, Title } from "@/lib/types";

interface HomeViewProps {
  featured: readonly Title[];
  rails: readonly Rail[];
}

const HERO_ROTATION_MS = 8000;

/**
 * Client orchestrator for the homepage: owns which featured title is
 * projected (hero + ambient glow share it) and which title's drawer
 * is open. Rotation pauses while hovering the hero or reading details.
 */
export function HomeView({ featured, rails }: HomeViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isRotationPaused =
    isHeroHovered || selectedTitle !== null || Boolean(prefersReducedMotion) || featured.length < 2;

  useEffect(() => {
    if (isRotationPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % featured.length);
    }, HERO_ROTATION_MS);
    return () => clearInterval(timer);
  }, [isRotationPaused, featured.length]);

  if (featured.length === 0) {
    return (
      <section className="grid min-h-[70vh] place-items-center px-6 text-center">
        <p className="text-ash">The projection room is empty — no featured titles to show.</p>
      </section>
    );
  }

  return (
    <>
      <AmbientBackdrop title={featured[activeIndex]} />
      <Hero
        titles={featured}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onSelect={setSelectedTitle}
        onHoverChange={setIsHeroHovered}
      />
      <div className="relative z-10 -mt-4 space-y-12 pb-4 md:space-y-14">
        <HomeContinueRail onSelect={setSelectedTitle} />
        {rails
          .filter((rail) => rail.id !== "continue-watching")
          .map((rail) => (
            <MovieRail key={rail.id} rail={rail} onSelect={setSelectedTitle} />
          ))}
      </div>
      <AnimatePresence>
        {selectedTitle && (
          <MovieDetailModal title={selectedTitle} onClose={() => setSelectedTitle(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
