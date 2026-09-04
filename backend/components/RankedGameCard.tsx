'use client';

import React from 'react';
import { Star, Bookmark, Check } from 'lucide-react';
import { NormalizedGame } from '@/lib/normalized-types';
import { PlatformIcons } from './PlatformIcons';
import { useUnifiedStore } from '@/lib/unified-store';

interface RankedGameCardProps {
  game: NormalizedGame;
  rank: number;
  onSelect: (game: NormalizedGame) => void;
}

export function RankedGameCard({ game, rank, onSelect }: RankedGameCardProps) {
  const { isInWatchlist, toggleWatchlist } = useUnifiedStore();
  const isSaved = isInWatchlist(game.id, 'game');

  const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;

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

  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative flex items-center justify-between gap-3 sm:gap-4 p-3 bg-[#0D0D10] hover:bg-[#15151C] rounded-2xl border border-zinc-850 hover:border-[#6001D2]/80 cursor-pointer transition-all duration-200 shadow-md active:scale-[0.99]"
    >
      {/* Left side: Rank + Cover + Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-grow">
        {/* Ranking Number */}
        <div className="w-9 sm:w-12 text-center flex-shrink-0">
          <span
            className={`font-black font-mono text-xl sm:text-2xl tracking-tighter ${
              rank === 1
                ? 'bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : rank === 2
                ? 'bg-gradient-to-br from-zinc-200 to-zinc-400 bg-clip-text text-transparent'
                : rank === 3
                ? 'bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent'
                : 'text-zinc-600 group-hover:text-zinc-400'
            }`}
          >
            {formattedRank}
          </span>
        </div>

        {/* Cover Image */}
        <div className="relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={game.cover}
            alt={game.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Game Info */}
        <div className="min-w-0 flex-grow space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-base font-bold text-white group-hover:text-[#00E5FF] truncate transition-colors">
              {game.title}
            </h4>
            {game.releaseYear && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
                ({game.releaseYear})
              </span>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
            {game.genres?.slice(0, 3).join(' • ') || game.developer || 'Action'}
          </p>

          <div className="pt-0.5">
            <PlatformIcons hardwareBadges={game.hardwareBadges} platforms={game.platforms} maxDisplay={3} />
          </div>
        </div>
      </div>

      {/* Right side: Rating & Watchlist Toggle */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 border border-zinc-800 text-amber-400 text-xs font-black shadow-sm">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{game.rating}</span>
          </div>
          {game.metacritic && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-900/50">
              MC {game.metacritic}
            </span>
          )}
        </div>

        <button
          onClick={handleWatchlistClick}
          className={`p-2.5 rounded-xl transition-all shadow-md active:scale-90 ${
            isSaved
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
          title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
