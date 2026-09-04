'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Play, Bookmark, Info, Sparkles, Check } from 'lucide-react';
import { NormalizedGame, NormalizedMovie } from '@/lib/normalized-types';
import { PlatformIcons } from './PlatformIcons';
import { useUnifiedStore } from '@/lib/unified-store';

interface HeroCarouselProps {
  type: 'games' | 'movies';
  games?: NormalizedGame[];
  movies?: NormalizedMovie[];
  onSelectGame?: (game: NormalizedGame) => void;
  onSelectMovie?: (movie: NormalizedMovie) => void;
}

export function HeroCarousel({
  type,
  games = [],
  movies = [],
  onSelectGame,
  onSelectMovie,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsCount = type === 'games' ? Math.min(games.length, 5) : Math.min(movies.length, 5);

  const { isInWatchlist, toggleWatchlist } = useUnifiedStore();

  // Auto advance every 7 seconds
  useEffect(() => {
    if (itemsCount <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemsCount);
    }, 7000);
    return () => clearInterval(interval);
  }, [itemsCount]);

  if (itemsCount === 0) return null;

  const currentGame = type === 'games' ? games[currentIndex] : undefined;
  const currentMovie = type === 'movies' ? movies[currentIndex] : undefined;

  const backdrop = type === 'games' ? currentGame?.backdrop || currentGame?.cover : currentMovie?.backdrop || currentMovie?.poster;
  const title = type === 'games' ? currentGame?.title : currentMovie?.title;
  const rating = type === 'games' ? currentGame?.rating : currentMovie?.rating;
  const releaseYear = type === 'games' ? currentGame?.releaseYear : currentMovie?.releaseYear;
  const genres = type === 'games' ? currentGame?.genres?.slice(0, 3) : currentMovie?.genres?.slice(0, 3);
  const description = type === 'games' ? currentGame?.description : currentMovie?.overview;

  const currentId = type === 'games' ? currentGame?.id : currentMovie?.id;
  const isSaved = currentId ? isInWatchlist(currentId, type === 'games' ? 'game' : 'movie') : false;

  const handleToggleWatchlist = () => {
    if (type === 'games' && currentGame) {
      toggleWatchlist({
        id: currentGame.id,
        type: 'game',
        title: currentGame.title,
        image: currentGame.cover,
        rating: currentGame.rating,
        releaseYear: currentGame.releaseYear || '2024',
        genres: currentGame.genres || [],
        addedAt: new Date().toISOString(),
        platforms: currentGame.platforms,
      });
    } else if (type === 'movies' && currentMovie) {
      toggleWatchlist({
        id: currentMovie.id,
        type: 'movie',
        title: currentMovie.title,
        image: currentMovie.poster,
        rating: currentMovie.rating,
        releaseYear: currentMovie.releaseYear || '2024',
        genres: currentMovie.genres || [],
        addedAt: new Date().toISOString(),
        runtime: currentMovie.formattedRuntime,
      });
    }
  };

  const handleAction = () => {
    if (type === 'games' && currentGame && onSelectGame) {
      onSelectGame(currentGame);
    } else if (type === 'movies' && currentMovie && onSelectMovie) {
      onSelectMovie(currentMovie);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#09090B] border border-zinc-800/80 shadow-2xl group select-none">
      {/* Background Image with Cinematic Gradient Overlay */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[540px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdrop}
          alt={title || 'Featured'}
          className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-105 group-hover:scale-100"
        />

        {/* Multi-tier Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-black/50 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-between pointer-events-none">
        {/* Top Badges */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-zinc-700 bg-zinc-900/90 text-white flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>{type === 'games' ? 'TRENDING RELEASES' : 'FEATURED PREMIERE'}</span>
            </span>

            {releaseYear && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-black/60 backdrop-blur-md text-zinc-300 border border-zinc-800">
                {releaseYear}
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {rating && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-black shadow-lg">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Bottom Content Area */}
        <div className="space-y-3 sm:space-y-4 max-w-2xl pointer-events-auto">
          {/* Hardware platforms (Games) or Genres (Movies) */}
          {type === 'games' && currentGame && (
            <PlatformIcons
              hardwareBadges={currentGame.hardwareBadges}
              platforms={currentGame.platforms}
              size="md"
            />
          )}

          {genres && genres.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              {genres.map((g, idx) => (
                <span key={g} className="flex items-center gap-2">
                  <span className="text-zinc-300">{g}</span>
                  {idx < genres.length - 1 && <span className="text-zinc-600">•</span>}
                </span>
              ))}
              {type === 'movies' && currentMovie?.formattedRuntime && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[#00E5FF] font-mono">{currentMovie.formattedRuntime}</span>
                </>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {title}
          </h2>

          {/* Synopsis */}
          {description && (
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm font-normal">
              {description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-view-main-btn"
              onClick={handleAction}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-extrabold bg-white text-black hover:bg-zinc-200 shadow-xl transition-all duration-300 active:scale-95 hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black text-black" />
              <span>{type === 'games' ? 'View Game' : 'Watch Details'}</span>
            </button>

            <button
              id="hero-watchlist-btn"
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md border transition-all duration-200 active:scale-95 ${
                isSaved
                  ? 'bg-zinc-800 text-white border-zinc-600 font-extrabold'
                  : 'bg-black/60 hover:bg-zinc-900 text-white border-zinc-700'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'In Gamelist' : 'Gamelist'}</span>
            </button>

            <button
              onClick={handleAction}
              className="p-3 rounded-full bg-black/60 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-all active:scale-95"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Indicators & Arrows */}
        <div className="flex items-center justify-between pt-4 pointer-events-auto">
          {/* Indicators / Progress bars */}
          <div className="flex items-center gap-2">
            {Array.from({ length: itemsCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-white'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          {/* Nav Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + itemsCount) % itemsCount)}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % itemsCount)}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
