'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Bookmark,
  Check,
  Layers,
  Monitor,
  Sparkles,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { NormalizedGame, NormalizedSystemRequirement } from '@/lib/normalized-types';
import { PlatformIcons } from './PlatformIcons';
import { StoreButtons } from './StoreButtons';
import { CompanyProfileModal } from './CompanyProfileModal';
import { useUnifiedStore } from '@/lib/unified-store';

interface GameDetailModalProps {
  game: NormalizedGame | null;
  onClose: () => void;
  onSelectSimilar?: (game: NormalizedGame) => void;
}

export function GameDetailModal({ game, onClose, onSelectSimilar }: GameDetailModalProps) {
  const [fetchedGame, setFetchedGame] = useState<NormalizedGame | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [gameEditions, setGameEditions] = useState<any[]>([]);
  const [showPcReqSheet, setShowPcReqSheet] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [activeCompanyModal, setActiveCompanyModal] = useState<{
    name: string;
    type: 'developer' | 'publisher';
  } | null>(null);

  const { isInWatchlist, toggleWatchlist } = useUnifiedStore();

  useEffect(() => {
    if (!game) return;

    let isMounted = true;
    async function loadFullDetails() {
      try {
        const res = await fetch(`/api/games/${game?.id || game?.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setFetchedGame(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch full game details:', err);
      }

      // Fetch Steam/Store Editions
      try {
        const edRes = await fetch(`/api/steam/editions?appId=${game?.id}`);
        if (edRes.ok) {
          const edJson = await edRes.json();
          if (edJson.success && edJson.data && edJson.data.length > 0 && isMounted) {
            setGameEditions(edJson.data);
          }
        }
      } catch {
        // Fallback
      }
    }

    loadFullDetails();
    return () => {
      isMounted = false;
    };
  }, [game]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (game) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [game]);

  if (!game) return null;

  const current = (fetchedGame && fetchedGame.id === game.id) ? fetchedGame : game;
  const isSaved = isInWatchlist(current.id, 'game');

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      id: current.id,
      type: 'game',
      title: current.title,
      image: current.cover,
      rating: current.rating,
      releaseYear: current.releaseYear || '2024',
      genres: current.genres || [],
      addedAt: new Date().toISOString(),
      platforms: current.platforms,
    });
  };

  const minReq: NormalizedSystemRequirement | undefined = current.systemRequirements?.minimum;
  const recReq: NormalizedSystemRequirement | undefined = current.systemRequirements?.recommended;
  const hasRequirements = !!(
    minReq?.processor || minReq?.graphics || minReq?.os || recReq?.processor || recReq?.graphics
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
        {/* Modal Container */}
        <div
          className="relative w-full max-w-4xl h-full sm:h-[90vh] bg-[#09090B] sm:rounded-3xl border sm:border-zinc-800/80 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
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

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Hero Banner Section */}
            <div className="relative w-full h-[280px] sm:h-[360px] bg-zinc-950 overflow-hidden">
              {/* Backdrop Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  current.screenshots && current.screenshots[heroIndex]
                    ? current.screenshots[heroIndex]
                    : current.backdrop || current.cover
                }
                alt={current.title}
                className="w-full h-full object-cover object-top transition-all duration-500"
              />
              {/* Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/90 via-transparent to-transparent" />

              {/* Carousel Dot Indicators */}
              {current.screenshots && current.screenshots.length > 1 && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 border border-zinc-800 backdrop-blur-md">
                  {current.screenshots.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        heroIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Hero Header Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-end gap-4 sm:gap-6">
                {/* Poster Card */}
                <div className="relative w-24 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shadow-2xl flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.cover}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title & Platforms Header */}
                <div className="flex-1 space-y-2 min-w-0">
                  <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight line-clamp-2">
                    {current.title}
                  </h1>

                  {/* Platforms directly associated next to title */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <PlatformIcons
                      hardwareBadges={current.hardwareBadges}
                      platforms={current.platforms}
                      size="md"
                      onOpenPcRequirements={() => setShowPcReqSheet(true)}
                    />
                  </div>

                  {/* Developer & Publisher Clickable Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {current.developer && (
                      <button
                        onClick={() =>
                          setActiveCompanyModal({
                            name: current.developer!,
                            type: 'developer',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 transition-colors shadow-sm active:scale-95"
                        title="View Developer Profile"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>{current.developer}</span>
                      </button>
                    )}

                    {current.publisher && current.publisher !== current.developer && (
                      <button
                        onClick={() =>
                          setActiveCompanyModal({
                            name: current.publisher!,
                            type: 'publisher',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors shadow-sm active:scale-95"
                        title="View Publisher Profile"
                      >
                        <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{current.publisher}</span>
                      </button>
                    )}

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-zinc-900/90 text-amber-400 border border-zinc-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{current.rating}</span>
                    </div>

                    {current.releaseYear && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-zinc-400 bg-black/60 border border-zinc-800">
                        <Calendar className="w-3 h-3" />
                        <span>{current.releaseYear}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Body Sections */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Action Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${
                    isSaved
                      ? 'bg-emerald-500 text-black border border-emerald-400 font-extrabold'
                      : 'bg-white text-black hover:bg-zinc-200 font-extrabold'
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? 'In Library' : 'Add to Library'}</span>
                </button>

                <button
                  onClick={() => setShowPcReqSheet(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 transition-all active:scale-95"
                >
                  <Monitor className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>PC System Requirements</span>
                </button>
              </div>

              {/* YOUR RATING SECTION */}
              <div className="p-4 rounded-2xl bg-[#121216] border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">
                    Your Rating
                  </span>
                  <span className="text-xs font-mono font-medium text-zinc-500">
                    {userRating ? `${userRating} / 5 Stars` : 'Not Rated Yet'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1.5 hover:scale-125 transition-transform"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          userRating && userRating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-600 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500">Tap stars to rate this title</p>
              </div>

              {/* PURCHASE & OFFICIAL STORES */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">
                  Purchase & Official Stores
                </span>
                <StoreButtons stores={current.stores} />
              </div>

              {/* SYNOPSIS */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">
                  Synopsis
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line bg-[#0D0D10] p-4 rounded-2xl border border-zinc-850">
                  {current.description || 'No description available for this title.'}
                </p>
              </div>

              {/* EDITIONS SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Editions & Packages</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(gameEditions.length > 0 ? gameEditions : [
                    {
                      id: `${current.id}-std`,
                      name: `${current.title} Standard Edition`,
                      editionType: 'STANDARD',
                      price: { formattedDiscountedPrice: '$59.99' },
                    }
                  ]).map((ed, idx) => {
                    const priceObj = ed.price || {};
                    const priceDisplay = priceObj.formattedDiscountedPrice || ed.priceDisplay || (priceObj.isFree ? 'FREE' : '$59.99');
                    const origPrice = priceObj.formattedOriginalPrice;
                    const discount = priceObj.discountPercent;

                    return (
                      <div
                        key={ed.id || idx}
                        className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-800 space-y-2 flex items-center justify-between shadow-sm"
                      >
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {ed.editionType || 'STANDARD'}
                          </span>
                          <h5 className="text-xs sm:text-sm font-extrabold text-white">{ed.name}</h5>
                        </div>

                        <div className="flex flex-col items-end gap-0.5">
                          {origPrice && discount && discount > 0 && (
                            <span className="text-[10px] font-mono line-through text-zinc-500">
                              {origPrice}
                            </span>
                          )}
                          <span className="text-sm font-black font-mono text-emerald-400">
                            {priceDisplay !== '$0.00' ? priceDisplay : 'FREE'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PC SYSTEM REQUIREMENTS SHEET */}
        {showPcReqSheet && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setShowPcReqSheet(false)}
          >
            <div
              className="w-full max-w-lg bg-[#09090B] rounded-t-3xl sm:rounded-3xl border border-zinc-800 p-6 space-y-4 text-zinc-100 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      PC System Requirements
                    </h3>
                    <p className="text-[11px] text-zinc-400">{current.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPcReqSheet(false)}
                  className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {hasRequirements ? (
                <div className="space-y-4 text-xs">
                  {minReq && (
                    <div className="p-4 rounded-2xl bg-[#121216] border border-zinc-800 space-y-2">
                      <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">
                        Minimum Requirements
                      </h4>
                      {minReq.os && <p><strong className="text-zinc-400">OS:</strong> {minReq.os}</p>}
                      {minReq.processor && <p><strong className="text-zinc-400">Processor:</strong> {minReq.processor}</p>}
                      {minReq.memory && <p><strong className="text-zinc-400">Memory:</strong> {minReq.memory}</p>}
                      {minReq.graphics && <p><strong className="text-zinc-400">Graphics:</strong> {minReq.graphics}</p>}
                      {minReq.storage && <p><strong className="text-zinc-400">Storage:</strong> {minReq.storage}</p>}
                    </div>
                  )}

                  {recReq && (
                    <div className="p-4 rounded-2xl bg-[#121216] border border-zinc-800 space-y-2">
                      <h4 className="font-extrabold text-cyan-400 uppercase tracking-wider text-[11px]">
                        Recommended Requirements
                      </h4>
                      {recReq.os && <p><strong className="text-zinc-400">OS:</strong> {recReq.os}</p>}
                      {recReq.processor && <p><strong className="text-zinc-400">Processor:</strong> {recReq.processor}</p>}
                      {recReq.memory && <p><strong className="text-zinc-400">Memory:</strong> {recReq.memory}</p>}
                      {recReq.graphics && <p><strong className="text-zinc-400">Graphics:</strong> {recReq.graphics}</p>}
                      {recReq.storage && <p><strong className="text-zinc-400">Storage:</strong> {recReq.storage}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#121216] border border-zinc-800 text-center text-xs text-zinc-400">
                  PC requirements are not available for this game.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Company / Developer Profile Modal */}
      {activeCompanyModal && (
        <CompanyProfileModal
          companyName={activeCompanyModal.name}
          type={activeCompanyModal.type}
          onClose={() => setActiveCompanyModal(null)}
          onSelectGame={(g) => {
            setActiveCompanyModal(null);
            if (onSelectSimilar) {
              onSelectSimilar(g);
            }
          }}
        />
      )}
    </>
  );
}
