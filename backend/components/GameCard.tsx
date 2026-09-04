'use client';

import React from 'react';
import { Star, Bookmark, Check, Calendar } from 'lucide-react';
import { NormalizedGame } from '@/lib/normalized-types';
import { PlatformIcons } from './PlatformIcons';
import { useUnifiedStore } from '@/lib/unified-store';

interface GameCardProps {
  game: NormalizedGame;
  onSelect: (game: NormalizedGame) => void;
  layout?: 'compact' | 'horizontal' | 'grid';
  showReleaseDate?: boolean;
}

export function GameCard({
  game,
  onSelect,
  layout = 'compact',
  showReleaseDate = false,
}: GameCardProps) {
  const { isInWatchlist, toggleWatchlist } = useUnifiedStore();
  const isSaved = isInWatchlist(game.id, 'game');

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist({
      id: game.id,
      type: 'game',
      title: game.title,
      image: game.cover,
      rating: game.rating,
      releaseYear: game.releaseYear || '2024',
      genres: game.genres || [],
      addedAt: new Date().toISOString(),
      platforms: game.platforms,
    });
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => onSelect(game)}
        className="group relative flex items-center gap-3.5 p-2.5 bg-[#0D0D10] hover:bg-[#15151A] rounded-2xl border border-zinc-800/80 hover:border-[#6001D2]/60 cursor-pointer transition-all duration-200 shadow-md flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
      >
        {/* Poster */}
        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={game.cover}
            alt={game.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-grow min-w-0 h-24 py-0.5">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] truncate transition-colors">
              {game.title}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {game.genres?.slice(0, 2).join(' • ') || game.developer || 'Action'}
            </p>
          </div>

          <div className="space-y-1">
            {showReleaseDate && game.releaseDate && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                <Calendar className="w-3 h-3 text-[#00E5FF]" />
                <span>{game.releaseDate}</span>
              </div>
            )}
            <PlatformIcons hardwareBadges={game.hardwareBadges} platforms={game.platforms} maxDisplay={2} />
          </div>
        </div>

        {/* Watchlist Quick Button */}
        <button
          onClick={handleWatchlistClick}
          className={`p-2 rounded-xl transition-all ${
            isSaved
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  // Standard Compact / Grid Card
  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative flex flex-col w-[170px] sm:w-[195px] md:w-[210px] flex-shrink-0 snap-start bg-[#0D0D10] hover:bg-[#141418] rounded-2xl border border-zinc-850 hover:border-[#6001D2]/70 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg"
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-[3/4] bg-zinc-950 overflow-hidden rounded-t-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.cover}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-black/30 opacity-90 group-hover:opacity-60 transition-opacity" />

        {/* Rating top left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 text-[11px] font-black border border-zinc-800 shadow-md">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{game.rating}</span>
        </div>

        {/* Watchlist toggle top right */}
        <button
          onClick={handleWatchlistClick}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md active:scale-90 ${
            isSaved
              ? 'bg-emerald-500 text-black border border-emerald-400'
              : 'bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
          }`}
          title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Release year or upcoming pill bottom */}
        {showReleaseDate && game.releaseDate ? (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-zinc-800 text-[10px] font-mono font-bold text-[#00E5FF] flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{game.releaseDate}</span>
          </div>
        ) : game.releaseYear ? (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-mono text-zinc-300 border border-zinc-800">
            {game.releaseYear}
          </div>
        ) : null}
      </div>

      {/* Card Info */}
      <div className="p-3 flex flex-col flex-grow justify-between gap-2 bg-[#0D0D10]">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] line-clamp-1 transition-colors">
            {game.title}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
            {game.genres?.slice(0, 2).join(' • ') || game.developer || 'Game'}
          </p>
        </div>

        {/* Hardware Platforms */}
        <div className="pt-1 border-t border-zinc-850">
          <PlatformIcons hardwareBadges={game.hardwareBadges} platforms={game.platforms} maxDisplay={3} />
        </div>
      </div>
    </div>
  );
}
