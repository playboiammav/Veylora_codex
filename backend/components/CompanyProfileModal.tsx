'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Gamepad2, Globe, Star, Sparkles, Loader2 } from 'lucide-react';
import { NormalizedGame } from '@/lib/normalized-types';
import { GameCard } from './GameCard';

interface CompanyProfileModalProps {
  companyName: string;
  type?: 'developer' | 'publisher';
  onClose: () => void;
  onSelectGame: (game: NormalizedGame) => void;
}

interface CompanyData {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
  description?: string;
}

export function CompanyProfileModal({
  companyName,
  type = 'developer',
  onClose,
  onSelectGame,
}: CompanyProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [games, setGames] = useState<NormalizedGame[]>([]);

  useEffect(() => {
    async function loadCompany() {
      if (!companyName) return;
      try {
        setLoading(true);
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const res = await fetch(`/api/companies/${slug}?type=${type}`);
        const json = await res.json();
        if (json.success && json.data) {
          setCompany(json.data);
          setGames(json.games || []);
        } else {
          // Fallback minimal object
          setCompany({
            id: 1,
            name: companyName,
            slug,
            games_count: 0,
            image_background: '',
            description: undefined,
          });
        }
      } catch (err) {
        console.error('Failed to load company profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [companyName, type]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0C0C0F] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700/80 transition-transform active:scale-95 shadow-lg"
          aria-label="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 no-scrollbar space-y-6">
          {/* Header Banner */}
          <div className="relative h-48 sm:h-64 w-full bg-zinc-950 overflow-hidden">
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company?.image_background || ''}
              alt={companyName}
              className="w-full h-full object-cover opacity-40 blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0F] via-[#0C0C0F]/60 to-transparent" />

            {/* Profile Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-white/10 text-zinc-200 border border-white/20 uppercase backdrop-blur-md flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-[#00E5FF]" />
                    {type === 'publisher' ? 'Game Publisher' : 'Development Studio'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {company?.name || companyName}
                </h2>
              </div>

              {company?.games_count ? (
                <div className="hidden sm:flex flex-col items-end px-4 py-2 rounded-2xl bg-black/60 border border-zinc-800 backdrop-blur-md">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Catalog Size</span>
                  <span className="text-lg font-black text-[#00E5FF] font-mono">{company.games_count} Games</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Body Content */}
          <div className="px-6 pb-8 space-y-8">
            {/* About / Description */}
            {company?.description && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#121217] border border-zinc-850 space-y-2">
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  About Studio
                </h3>
                <div
                  className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl"
                  dangerouslySetInnerHTML={{
                    __html: company.description.replace(/<[^>]*>?/gm, (tag) => {
                      if (tag.startsWith('<p') || tag.startsWith('</p') || tag.startsWith('<br')) return tag;
                      return '';
                    }),
                  }}
                />
              </div>
            )}

            {/* Games Catalog Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Released Titles ({games.length})
                  </h3>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
                  <span className="text-xs font-mono">Loading developer catalog...</span>
                </div>
              )}

              {/* Games Grid */}
              {!loading && games.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {games.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={(g) => {
                        onClose();
                        onSelectGame(g);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && games.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No catalog items found for this studio.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
