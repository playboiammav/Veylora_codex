'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Bookmark,
  Check,
  Calendar,
  Clock,
  Play,
  Tv,
  Film,
  Users,
  Image as ImageIcon,
  ExternalLink,
  Award,
  BookOpen,
  DollarSign,
  Building2,
  Quote,
  TrendingUp,
} from 'lucide-react';
import { NormalizedMovie, MovieRatingSource } from '@/lib/normalized-types';
import { useUnifiedStore } from '@/lib/unified-store';
import { PersonDetailModal } from './PersonDetailModal';
import { CompanyDetailModal } from './CompanyDetailModal';

interface MovieDetailModalProps {
  movie: NormalizedMovie | null;
  onClose: () => void;
  onSelectSimilar?: (movie: NormalizedMovie) => void;
}

export function MovieDetailModal({ movie, onClose, onSelectSimilar }: MovieDetailModalProps) {
  const [fetchedMovie, setFetchedMovie] = useState<NormalizedMovie | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'reviews' | 'trailers' | 'photos'>('overview');
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Sub-modals for Person and Company navigation
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const { isInWatchlist, toggleWatchlist } = useUnifiedStore();

  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    async function loadDetails() {
      try {
        const res = await fetch(`/api/movies/${movie?.id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setFetchedMovie(json.data);
            if (json.data.trailers && json.data.trailers.length > 0) {
              setActiveTrailerKey(json.data.trailers[0].key);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch full movie details:', err);
      }
    }

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [movie]);

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [movie]);

  if (!movie) return null;

  const current = (fetchedMovie && fetchedMovie.id === movie.id) ? fetchedMovie : movie;
  const isSaved = isInWatchlist(current.id, 'movie');

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      id: current.id,
      type: 'movie',
      title: current.title,
      image: current.poster,
      rating: current.rating,
      releaseYear: current.releaseYear || '2024',
      genres: current.genres || [],
      addedAt: new Date().toISOString(),
      runtime: current.formattedRuntime,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-5xl h-full sm:h-[90vh] bg-[#09090B] sm:rounded-3xl border sm:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-all active:scale-95 shadow-lg"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Hero Backdrop */}
            <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] bg-zinc-950 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.backdrop || current.poster}
                alt={current.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-transparent to-transparent" />

              {/* Bottom Hero Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                {/* Poster Card */}
                <div className="relative w-24 sm:w-36 md:w-44 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-700 shadow-2xl flex-shrink-0 hidden xs:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.poster}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#E50914]/30 text-red-300 border border-[#E50914]/60">
                      Cinema Feature
                    </span>
                    {current.contentRating && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {current.contentRating}
                      </span>
                    )}
                    {current.releaseYear && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-black/70 text-zinc-300 border border-zinc-800">
                        {current.releaseYear}
                      </span>
                    )}
                    {current.formattedRuntime && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-[#00E5FF] bg-black/70 border border-zinc-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{current.formattedRuntime}</span>
                      </span>
                    )}
                    {current.imdbId && (
                      <a
                        href={`https://www.imdb.com/title/${current.imdbId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/40 hover:bg-[#F5C518]/30 flex items-center gap-1"
                      >
                        <span>IMDb</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight line-clamp-2">
                    {current.title}
                  </h1>

                  {current.tagline && (
                    <p className="text-xs sm:text-sm text-zinc-400 italic font-medium">
                      &ldquo;{current.tagline}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                    {current.director && (
                      <span>
                        Director: <strong className="text-white">{current.director}</strong>
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-amber-400 font-bold px-2 py-0.5 rounded bg-black/60 border border-zinc-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{current.rating}</span>
                      {current.voteCount && <span className="text-zinc-500 text-[10px]">({current.voteCount.toLocaleString()})</span>}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleToggleWatchlist}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 ${
                      isSaved
                        ? 'bg-emerald-500 text-black border border-emerald-400 font-extrabold'
                        : 'bg-gradient-to-r from-[#E50914] to-[#FF5500] text-white hover:opacity-90'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'In Watchlist' : 'Add to Watchlist'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="border-b border-zinc-800 px-4 sm:px-8 bg-[#0D0D10] sticky top-0 z-30 flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Overview & Ratings
              </button>

              <button
                onClick={() => setActiveTab('cast')}
                className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'cast'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cast & Crew ({current.cast?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Reviews & Awards ({(current.reviews?.length || 0) + (current.awards?.length || 0)})
              </button>

              <button
                onClick={() => setActiveTab('trailers')}
                className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'trailers'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Trailers & Media
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'photos'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Gallery ({current.images?.length || 0})
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-8 space-y-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Multi-Source Ratings Breakdown */}
                  {current.ratingsList && current.ratingsList.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Multi-Source Ratings Breakdown
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {current.ratingsList.map((r, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[#121216] border border-zinc-800 flex flex-col justify-between"
                          >
                            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                              {r.source}
                            </span>
                            <div className="text-xl font-black text-white mt-1">
                              {r.score}
                            </div>
                            {r.votes && (
                              <span className="text-[10px] text-zinc-500 mt-1">
                                {r.votes.toLocaleString()} verified votes
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Streaming Providers */}
                  <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800/90 space-y-3">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-red-400" />
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                        Available On Streaming & Digital
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Stream {current.title} on leading entertainment platforms:
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      {current.streamingLinks?.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-all hover:scale-105"
                        >
                          <span className="font-mono text-[10px] font-black uppercase text-red-400">{link.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Synopsis & Overview */}
                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
                      Synopsis
                    </h3>
                    <div className="text-sm text-zinc-300 leading-relaxed space-y-3 font-normal bg-[#0D0D10] p-5 rounded-2xl border border-zinc-850">
                      {current.overview}
                    </div>
                  </div>

                  {/* Wikipedia Plot Short if available */}
                  {current.wikipedia?.plotShort && (
                    <div className="p-5 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                          <BookOpen className="w-4 h-4 text-zinc-400" />
                          <span>Wikipedia Encyclopedia Overview</span>
                        </div>
                        {current.wikipedia.url && (
                          <a
                            href={current.wikipedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <span>Read on Wikipedia</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {current.wikipedia.plotShort}
                      </p>
                    </div>
                  )}

                  {/* Box Office & Production Stats */}
                  {(current.boxOffice || current.budget || current.revenue) && (
                    <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Box Office & Financial Performance
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {current.boxOffice?.budget || current.budget ? (
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Budget</span>
                            <p className="text-sm font-bold text-white mt-0.5">{current.boxOffice?.budget || current.budget}</p>
                          </div>
                        ) : null}
                        {current.boxOffice?.openingWeekend ? (
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Opening Weekend</span>
                            <p className="text-sm font-bold text-white mt-0.5">{current.boxOffice.openingWeekend}</p>
                          </div>
                        ) : null}
                        {current.boxOffice?.cumulativeWorldwideGross || current.revenue ? (
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Worldwide Gross</span>
                            <p className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">{current.boxOffice?.cumulativeWorldwideGross || current.revenue}</p>
                          </div>
                        ) : null}
                        {current.status && (
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Status</span>
                            <p className="text-sm font-bold text-white mt-0.5">{current.status}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Production Companies & External Sites */}
                  {((current.companies && current.companies.length > 0) || (current.externalSites && current.externalSites.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {current.companies && current.companies.length > 0 && (
                        <div className="p-5 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-zinc-400" />
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                              Production Companies
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {current.companies.map((comp) => (
                              <button
                                key={comp.id}
                                onClick={() => setSelectedCompanyId(String(comp.id))}
                                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-200 border border-zinc-700 transition-all hover:scale-105"
                              >
                                {comp.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {current.externalSites && current.externalSites.length > 0 && (
                        <div className="p-5 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-3">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-zinc-400" />
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                              External Databases & Sites
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {current.externalSites.map((site, idx) => (
                              <a
                                key={idx}
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700 transition-all flex items-center gap-1.5 hover:text-white"
                              >
                                <span>{site.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cast' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
                      Cast & Creative Team
                    </h4>
                    <span className="text-xs font-mono text-zinc-500">
                      Click any person to view their filmography & awards
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {current.cast?.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedPersonId(String(member.imdbId || member.id))}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#0D0D10] border border-zinc-850 hover:border-red-500 cursor-pointer transition-all hover:scale-102 group"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                          {member.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.profileImage}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">{member.character}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Awards Section */}
                  {current.awards && current.awards.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
                          Major Awards & Accolades
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {current.awards.slice(0, 10).map((award, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[#121216] border border-zinc-800 flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-white">{award.eventName || award.awardTitle}</span>
                              {award.isWinner && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  Winner
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{award.category || award.description}</p>
                            {award.forYear && <span className="text-[10px] font-mono text-zinc-500 mt-2">{award.forYear}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Quote className="w-4 h-4 text-zinc-400" />
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
                        User & Critic Reviews
                      </h4>
                    </div>

                    {current.reviews && current.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {current.reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-5 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{rev.author}</span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-800 text-zinc-400">
                                  {rev.source}
                                </span>
                              </div>
                              {rev.rating !== undefined && (
                                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  <span>{rev.rating}/10</span>
                                </div>
                              )}
                            </div>
                            {rev.title && <h5 className="text-xs font-bold text-zinc-200">{rev.title}</h5>}
                            <p className="text-xs text-zinc-400 leading-relaxed">{rev.content}</p>
                            {rev.date && <div className="text-[10px] font-mono text-zinc-600">{rev.date}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-zinc-500 text-xs bg-[#0D0D10] rounded-2xl border border-zinc-850">
                        No written reviews currently indexed for this title.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'trailers' && (
                <div className="space-y-6">
                  {current.trailers && current.trailers.length > 0 ? (
                    <div className="space-y-4">
                      {/* Active Trailer Player */}
                      {activeTrailerKey && (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${activeTrailerKey}?autoplay=1&rel=0`}
                            title="Movie Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      )}

                      {/* Trailer selection pills */}
                      <div className="flex flex-wrap gap-2">
                        {current.trailers.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setActiveTrailerKey(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              activeTrailerKey === t.key
                                ? 'bg-red-600 text-white border-red-500 shadow-md'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      No official video trailers currently indexed for this title.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {current.images?.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhoto(src)}
                      className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 cursor-pointer group hover:border-red-500 transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${current.title} scene ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl cursor-zoom-out"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Full movie photo"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Person Detail Modal */}
      {selectedPersonId && (
        <PersonDetailModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      )}

      {/* Company Detail Modal */}
      {selectedCompanyId && (
        <CompanyDetailModal
          companyId={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
        />
      )}
    </>
  );
}
