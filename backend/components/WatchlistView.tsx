'use client';

import React, { useState } from 'react';
import { Bookmark, Gamepad2, Film, Trash2, Star, Plus, ArrowRight } from 'lucide-react';
import { useUnifiedStore } from '@/lib/unified-store';
import { NormalizedGame, NormalizedMovie } from '@/lib/normalized-types';

interface WatchlistViewProps {
  onSelectGame: (game: NormalizedGame) => void;
  onSelectMovie: (movie: NormalizedMovie) => void;
  onGoHome: () => void;
}

export function WatchlistView({ onSelectGame, onSelectMovie, onGoHome }: WatchlistViewProps) {
  const { watchlist, removeFromWatchlist } = useUnifiedStore();
  const [filter, setFilter] = useState<'all' | 'game' | 'movie'>('all');

  const filtered = watchlist.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleOpenItem = (item: (typeof watchlist)[0]) => {
    if (item.type === 'game') {
      const gameItem: NormalizedGame = {
        id: item.id,
        slug: item.id,
        title: item.title,
        cover: item.image || '',
        backdrop: item.image || '',
        rating: item.rating || 0,
        releaseYear: item.releaseYear,
        releaseDate: item.releaseYear,
        platforms: item.platforms || [],
        hardwareBadges: [],
        genres: item.genres || [],
        description: '',
        screenshots: item.image ? [item.image] : [],
        stores: [],
      };
      onSelectGame(gameItem);
    } else {
      const movieItem: NormalizedMovie = {
        id: item.id,
        title: item.title,
        poster: item.image || '',
        backdrop: item.image || '',
        rating: item.rating || 0,
        releaseYear: item.releaseYear,
        releaseDate: item.releaseYear,
        genres: item.genres || [],
        overview: '',
        formattedRuntime: item.runtime,
        cast: [],
        trailers: [],
        images: item.image ? [item.image] : [],
      };
      onSelectMovie(movieItem);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-white" />
            <span>My Gamelist</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {watchlist.length} saved games and movies ready to play, watch, and track.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-black font-extrabold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All ({watchlist.length})
          </button>
          <button
            onClick={() => setFilter('game')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'game'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Games ({watchlist.filter((i) => i.type === 'game').length})</span>
          </button>
          <button
            onClick={() => setFilter('movie')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'movie'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies ({watchlist.filter((i) => i.type === 'movie').length})</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0D0D10] rounded-3xl border border-zinc-850 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
            <Bookmark className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Your gamelist is currently empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Discover games and movies across trending releases, hardware benchmarks, and box office hits.
          </p>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-extrabold shadow-lg active:scale-95 transition-all"
          >
            <span>Explore Trending</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Watchlist Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleOpenItem(item)}
              className="group relative flex flex-col bg-[#0D0D10] hover:bg-[#141418] rounded-2xl border border-zinc-850 hover:border-zinc-700 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] bg-zinc-950 overflow-hidden rounded-t-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-black/30 opacity-90" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 text-[11px] font-black border border-zinc-800 shadow-md">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{item.rating}</span>
                </div>

                {/* Delete / Remove Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(item.id, item.type);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-all active:scale-90"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Type Badge bottom */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold text-zinc-300 border border-zinc-800 flex items-center gap-1">
                  {item.type === 'game' ? (
                    <>
                      <Gamepad2 className="w-3 h-3 text-white" />
                      <span>GAME</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-3 h-3 text-zinc-300" />
                      <span>MOVIE</span>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-3 flex flex-col flex-grow justify-between gap-1 bg-[#0D0D10]">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 line-clamp-1 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {item.genres?.slice(0, 2).join(' • ') || (item.type === 'game' ? 'Game' : 'Movie')}
                  </p>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
