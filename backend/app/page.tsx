'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Trophy,
  Star,
  Clapperboard,
} from 'lucide-react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { HeroCarousel } from '@/components/HeroCarousel';
import { HorizontalCarousel } from '@/components/HorizontalCarousel';
import { GameCard } from '@/components/GameCard';
import { MovieCard } from '@/components/MovieCard';
import { RankedGameCard } from '@/components/RankedGameCard';
import { GameDetailModal } from '@/components/GameDetailModal';
import { MovieDetailModal } from '@/components/MovieDetailModal';
import { SearchView } from '@/components/SearchView';
import { WatchlistView } from '@/components/WatchlistView';
import { FriendsView } from '@/components/FriendsView';
import { ProfileView } from '@/components/ProfileView';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { useUnifiedStore } from '@/lib/unified-store';
import { NormalizedGame, NormalizedMovie } from '@/lib/normalized-types';

const emptySubscribe = () => () => {};
function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function HomePage() {
  const mounted = useIsMounted();
  const { activeMediaType, activeNavTab, setActiveNavTab } = useUnifiedStore();

  // Selected Item Modals
  const [selectedGame, setSelectedGame] = useState<NormalizedGame | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<NormalizedMovie | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Games Data State
  const [trendingGames, setTrendingGames] = useState<NormalizedGame[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<NormalizedGame[]>([]);
  const [top50Games, setTop50Games] = useState<NormalizedGame[]>([]);
  const [topRatedGames, setTopRatedGames] = useState<NormalizedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  // Movies Data State
  const [trendingMovies, setTrendingMovies] = useState<NormalizedMovie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<NormalizedMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<NormalizedMovie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);

  // Load Games Data
  useEffect(() => {
    async function loadGames() {
      try {
        setGamesLoading(true);
        const [trendingRes, upcomingRes, top50Res] = await Promise.allSettled([
          fetch('/api/games?category=trending').then((r) => r.json()),
          fetch('/api/games?category=upcoming').then((r) => r.json()),
          fetch('/api/games?category=top50').then((r) => r.json()),
        ]);

        if (trendingRes.status === 'fulfilled' && trendingRes.value?.success) {
          const list: NormalizedGame[] = trendingRes.value.data || [];
          setTrendingGames(list);
          setTopRatedGames(list.slice().sort((a, b) => b.rating - a.rating));
        }

        if (upcomingRes.status === 'fulfilled' && upcomingRes.value?.success) {
          setUpcomingGames(upcomingRes.value.data || []);
        }

        if (top50Res.status === 'fulfilled' && top50Res.value?.success) {
          setTop50Games(top50Res.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setGamesLoading(false);
      }
    }

    loadGames();
  }, []);

  // Load Movies Data
  useEffect(() => {
    async function loadMovies() {
      try {
        setMoviesLoading(true);
        const [trendingRes, nowPlayingRes, topRatedRes] = await Promise.allSettled([
          fetch('/api/movies?category=trending').then((r) => r.json()),
          fetch('/api/movies?category=now_playing').then((r) => r.json()),
          fetch('/api/movies?category=top_rated').then((r) => r.json()),
        ]);

        if (trendingRes.status === 'fulfilled' && trendingRes.value?.success) {
          setTrendingMovies(trendingRes.value.data || []);
        }

        if (nowPlayingRes.status === 'fulfilled' && nowPlayingRes.value?.success) {
          setNowPlayingMovies(nowPlayingRes.value.data || []);
        }

        if (topRatedRes.status === 'fulfilled' && topRatedRes.value?.success) {
          setTopRatedMovies(topRatedRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setMoviesLoading(false);
      }
    }

    loadMovies();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col selection:bg-[#6001D2] selection:text-white">
      {/* Top Navigation */}
      <TopNav onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main View Area */}
      <main className="flex-1 pb-24 md:pb-16">
        {/* Tab 1: Home View */}
        {activeNavTab === 'home' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-10">
            {/* HERO CAROUSEL */}
            {activeMediaType === 'games' ? (
              <HeroCarousel
                type="games"
                games={trendingGames.length > 0 ? trendingGames : top50Games}
                onSelectGame={(g) => setSelectedGame(g)}
              />
            ) : (
              <HeroCarousel
                type="movies"
                movies={trendingMovies.length > 0 ? trendingMovies : nowPlayingMovies}
                onSelectMovie={(m) => setSelectedMovie(m)}
              />
            )}

            {/* GAMES VIEW SECTIONS */}
            {activeMediaType === 'games' && (
              <div className="space-y-10">
                {/* SECTION 1: Trending Releases */}
                <HorizontalCarousel
                  title="🔥 TRENDING"
                  icon={<Flame className="w-5 h-5 text-red-500 fill-red-500" />}
                >
                  {gamesLoading && trendingGames.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[190px] aspect-[3/4] rounded-2xl bg-zinc-900/60 animate-pulse flex-shrink-0"
                        />
                      ))
                    : trendingGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onSelect={(g) => setSelectedGame(g)}
                        />
                      ))}
                </HorizontalCarousel>

                {/* SECTION 2: Upcoming Games with Release Dates */}
                <HorizontalCarousel
                  title="Upcoming Releases"
                  subtitle="Anticipated gaming titles launching soon"
                  icon={<Clock className="w-5 h-5 text-[#00E5FF]" />}
                  badge="COMING SOON"
                >
                  {upcomingGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={(g) => setSelectedGame(g)}
                      showReleaseDate={true}
                    />
                  ))}
                </HorizontalCarousel>

                {/* SECTION 3: Top 50 Games Globally (Ranked List) */}
                <section className="space-y-4 pt-2">
                  <div className="flex items-center justify-between px-1 sm:px-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                          Top 50 Games Globally
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          HALL OF FAME
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        Universally acclaimed titles with verified player and critic ratings
                      </p>
                    </div>
                  </div>

                  {/* Ranked List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {(top50Games.length > 0 ? top50Games : trendingGames).slice(0, 16).map((game, idx) => (
                      <RankedGameCard
                        key={game.id}
                        game={game}
                        rank={idx + 1}
                        onSelect={(g) => setSelectedGame(g)}
                      />
                    ))}
                  </div>
                </section>

                {/* SECTION 4: Top Rated Masterpieces */}
                <HorizontalCarousel
                  title="Top Rated Masterpieces"
                  subtitle="Highest metacritic and player rated experiences"
                  icon={<Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                >
                  {topRatedGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={(g) => setSelectedGame(g)}
                    />
                  ))}
                </HorizontalCarousel>
              </div>
            )}

            {/* MOVIES VIEW SECTIONS */}
            {activeMediaType === 'movies' && (
              <div className="space-y-10">
                {/* SECTION 1: Trending Movies This Week */}
                <HorizontalCarousel
                  title="🔥 TRENDING"
                  icon={<Flame className="w-5 h-5 text-red-500 fill-red-500" />}
                >
                  {moviesLoading && trendingMovies.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[190px] aspect-[2/3] rounded-2xl bg-zinc-900/60 animate-pulse flex-shrink-0"
                        />
                      ))
                    : trendingMovies.map((movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onSelect={(m) => setSelectedMovie(m)}
                        />
                      ))}
                </HorizontalCarousel>

                {/* SECTION 2: Now Playing in Theatres */}
                <HorizontalCarousel
                  title="Now Playing in Theatres"
                  subtitle="Current theatrical releases and box office hits"
                  icon={<Clapperboard className="w-5 h-5 text-[#00E5FF]" />}
                  badge="IN CINEMAS"
                >
                  {nowPlayingMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => setSelectedMovie(m)}
                    />
                  ))}
                </HorizontalCarousel>

                {/* SECTION 3: Top Rated Cinema Masterpieces */}
                <HorizontalCarousel
                  title="Top Rated Cinema Masterpieces"
                  subtitle="All-time critically acclaimed award winners"
                  icon={<Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                  badge="ALL TIME"
                >
                  {topRatedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => setSelectedMovie(m)}
                    />
                  ))}
                </HorizontalCarousel>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Search View */}
        {activeNavTab === 'search' && (
          <SearchView
            onSelectGame={(g) => setSelectedGame(g)}
            onSelectMovie={(m) => setSelectedMovie(m)}
          />
        )}

        {/* Tab 3: Watchlist View */}
        {activeNavTab === 'watchlist' && (
          <WatchlistView
            onSelectGame={(g) => setSelectedGame(g)}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onGoHome={() => setActiveNavTab('home')}
          />
        )}

        {/* Tab 4: Friends View */}
        {activeNavTab === 'friends' && <FriendsView />}

        {/* Tab 5: Profile View */}
        {activeNavTab === 'profile' && <ProfileView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Game Detail Slide-over / Modal */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSelectSimilar={(g) => setSelectedGame(g)}
        />
      )}

      {/* Movie Detail Slide-over / Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelectSimilar={(m) => setSelectedMovie(m)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}
