'use client';

import React from 'react';
import { Star, Bookmark, Check, Play } from 'lucide-react';
import { NormalizedMovie } from '@/lib/normalized-types';
import { useUnifiedStore } from '@/lib/unified-store';

interface MovieCardProps {
  movie: NormalizedMovie;
  onSelect: (movie: NormalizedMovie) => void;
  layout?: 'compact' | 'horizontal' | 'grid';
}

export function MovieCard({ movie, onSelect, layout = 'compact' }: MovieCardProps) {
  const { isInWatchlist, toggleWatchlist } = useUnifiedStore();
  const isSaved = isInWatchlist(movie.id, 'movie');

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist({
      id: movie.id,
      type: 'movie',
      title: movie.title,
      image: movie.poster,
      rating: movie.rating,
      releaseYear: movie.releaseYear || '2024',
      genres: movie.genres || [],
      addedAt: new Date().toISOString(),
      runtime: movie.formattedRuntime,
    });
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => onSelect(movie)}
        className="group relative flex items-center gap-3.5 p-2.5 bg-[#0D0D10] hover:bg-[#15151A] rounded-2xl border border-zinc-800/80 hover:border-[#E50914]/60 cursor-pointer transition-all duration-200 shadow-md flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
      >
        <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            <span>{movie.rating}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-grow min-w-0 h-28 py-0.5">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 truncate transition-colors">
              {movie.title}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {movie.genres?.slice(0, 2).join(' • ') || 'Feature Film'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>{movie.releaseYear || '2024'}</span>
            {movie.formattedRuntime && <span className="text-zinc-500">{movie.formattedRuntime}</span>}
          </div>
        </div>

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
      onClick={() => onSelect(movie)}
      className="group relative flex flex-col w-[170px] sm:w-[195px] md:w-[210px] flex-shrink-0 snap-start bg-[#0D0D10] hover:bg-[#141418] rounded-2xl border border-zinc-850 hover:border-[#E50914]/70 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg"
    >
      <div className="relative w-full aspect-[2/3] bg-zinc-950 overflow-hidden rounded-t-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-black/30 opacity-90 group-hover:opacity-60 transition-opacity" />

        {/* Rating top left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 text-[11px] font-black border border-zinc-800 shadow-md">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{movie.rating}</span>
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

        {/* Year Pill bottom left */}
        {movie.releaseYear && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-mono text-zinc-300 border border-zinc-800">
            {movie.releaseYear}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between gap-1.5 bg-[#0D0D10]">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 line-clamp-1 transition-colors">
            {movie.title}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
            {movie.genres?.slice(0, 2).join(' • ') || 'Feature Film'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-850 text-[10px] text-zinc-500 font-mono">
          <span>{movie.formattedRuntime || 'Cinema'}</span>
          <span className="text-zinc-400 group-hover:text-white flex items-center gap-0.5">
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Trailer</span>
          </span>
        </div>
      </div>
    </div>
  );
}
