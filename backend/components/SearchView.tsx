'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Sparkles, Film, Gamepad2, TrendingUp } from 'lucide-react';
import { NormalizedGame, NormalizedMovie } from '@/lib/normalized-types';
import { GameCard } from './GameCard';
import { MovieCard } from './MovieCard';

interface SearchViewProps {
  onSelectGame: (game: NormalizedGame) => void;
  onSelectMovie: (movie: NormalizedMovie) => void;
}

const POPULAR_SEARCH_TAGS = [
  'Grand Theft Auto',
  'Cyberpunk 2077',
  'Dune',
  'Oppenheimer',
  'Spider-Man',
  'The Witcher',
  'Elden Ring',
  'Interstellar',
  'God of War',
  'Batman',
];

export function SearchView({ onSelectGame, onSelectMovie }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'games' | 'movies'>('all');
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [movies, setMovies] = useState<NormalizedMovie[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const timer = setTimeout(() => {
        setGames([]);
        setMovies([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [gamesRes, moviesRes] = await Promise.allSettled([
          fetch(`/api/games?search=${encodeURIComponent(trimmed)}`).then((r) => r.json()),
          fetch(`/api/movies?search=${encodeURIComponent(trimmed)}`).then((r) => r.json()),
        ]);

        if (gamesRes.status === 'fulfilled' && gamesRes.value?.success) {
          setGames(gamesRes.value.data || []);
        } else {
          setGames([]);
        }

        if (moviesRes.status === 'fulfilled' && moviesRes.value?.success) {
          setMovies(moviesRes.value.data || []);
        } else {
          setMovies([]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const hasSearched = query.trim().length > 0;
  const showGames = (activeFilter === 'all' || activeFilter === 'games') && games.length > 0;
  const showMovies = (activeFilter === 'all' || activeFilter === 'movies') && movies.length > 0;
  const totalResults = (activeFilter === 'all' ? games.length + movies.length : activeFilter === 'games' ? games.length : movies.length);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="space-y-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Explore Universe
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Find your next favorite games, blockbuster movies, reviews, and specs in one unified catalog.
        </p>

        {/* Search Bar Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-5 h-5 text-zinc-400" />
          </div>

          <input
            id="main-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, franchise, or genre (e.g. Witcher, Dune, Cyberpunk)..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#121216] border border-zinc-800 text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none focus:border-[#6001D2] focus:ring-2 focus:ring-[#6001D2]/30 transition-all shadow-xl"
            autoFocus
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        {!hasSearched && (
          <div className="pt-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {hasSearched && (
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All Results ({games.length + movies.length})
            </button>

            <button
              onClick={() => setActiveFilter('games')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'games'
                  ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Games ({games.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('movies')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'movies'
                  ? 'bg-gradient-to-r from-[#E50914] to-[#FF5500] text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies ({movies.length})</span>
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching catalog...</span>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton state */}
      {loading && !games.length && !movies.length && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800" />
          ))}
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !loading && totalResults === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No results found for &ldquo;{query}&rdquo;</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try checking for typos or searching for a broader title (e.g. &ldquo;Cyberpunk&rdquo; or &ldquo;Spider-Man&rdquo;).
          </p>
        </div>
      )}

      {/* Games Results Grid */}
      {showGames && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Games ({games.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {games.map((g) => (
              <GameCard key={g.id} game={g} onSelect={onSelectGame} />
            ))}
          </div>
        </div>
      )}

      {/* Movies Results Grid */}
      {showMovies && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Movies ({movies.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} onSelect={onSelectMovie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
