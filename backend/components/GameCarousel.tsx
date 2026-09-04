'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { NormalizedGame } from '@/lib/normalized-types';
import { GameCard } from './GameCard';

interface GameCarouselProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  games: NormalizedGame[];
  onSelectGame: (game: NormalizedGame) => void;
}

export function GameCarousel({
  title,
  subtitle,
  icon,
  accentColor = '#6001D2',
  games,
  onSelectGame,
}: GameCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="relative py-4 space-y-3 group/carousel">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[#00E5FF]">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
              <span className="text-xs font-mono font-normal text-zinc-500">
                ({games.length})
              </span>
            </h2>
            {subtitle && (
              <p className="text-xs text-zinc-400 font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-[#6001D2] border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-[#00E5FF] hover:text-black border border-zinc-800 text-zinc-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track matching directive */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 snap-x no-scrollbar pb-3 pt-1 scroll-smooth"
        >
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={onSelectGame}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
