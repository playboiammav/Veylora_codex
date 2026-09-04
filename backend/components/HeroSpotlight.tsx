'use client';

import React from 'react';
import { Play, Info, ExternalLink, Sparkles, Star, Tag, Code2 } from 'lucide-react';
import { GameItem } from '@/lib/game-types';

interface HeroSpotlightProps {
  game: GameItem;
  onSelectGame: (game: GameItem) => void;
  onOpenApiConsole: () => void;
}

export function HeroSpotlight({ game, onSelectGame, onOpenApiConsole }: HeroSpotlightProps) {
  return (
    <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden">
      {/* Cinematic Backdrop Image with multi-stop gradient mask */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url(${game.bannerImage || game.coverImage})`,
        }}
      >
        {/* Pitch Black vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#000000]/40 to-[#000000]" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-14 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Platform Tag & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              game.platform === 'PlayStation'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(0,112,209,0.3)]'
                : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,124,16,0.3)]'
            }`}>
              {game.platform === 'PlayStation' ? 'PlayStation 5' : 'Xbox Series X|S'}
            </span>

            {game.price.discountPercentage && game.price.discountPercentage > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white flex items-center gap-1 shadow-[0_0_15px_rgba(96,1,210,0.5)]">
                <Tag className="w-3 h-3" />
                {game.price.discountPercentage}% OFF
              </span>
            )}

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{game.rating || 4.9}</span>
            </div>

            {game.badges?.slice(0, 2).map((badge, idx) => (
              <span key={idx} className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs">
                {badge}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            {game.title}
          </h1>

          {/* Pricing & Description */}
          <div className="flex items-center gap-3">
            {game.price.formattedDiscountedPrice && (
              <span className="text-2xl sm:text-3xl font-black text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                {game.price.isFree ? 'FREE' : game.price.formattedDiscountedPrice}
              </span>
            )}
            {game.price.formattedBasePrice && (
              <span className="text-sm sm:text-base line-through text-zinc-500 font-semibold">
                {game.price.formattedBasePrice}
              </span>
            )}
            <span className="text-xs text-zinc-400 font-mono">
              • ID: {game.id.slice(0, 16)}...
            </span>
          </div>

          <p className="text-zinc-300 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl font-normal">
            {game.description}
          </p>

          {/* Rounded-full Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-details-btn"
              onClick={() => onSelectGame(game)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#6001D2] via-purple-700 to-[#00E5FF] hover:opacity-95 active:scale-95 shadow-[0_0_20px_rgba(96,1,210,0.6)] transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Details & Media</span>
            </button>

            {game.storeUrl && (
              <a
                id="hero-store-btn"
                href={game.storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-[#00E5FF]" />
                <span>Official Store</span>
              </a>
            )}

            <button
              id="hero-inspect-api-btn"
              onClick={onOpenApiConsole}
              className="flex items-center gap-2 px-4 py-3 rounded-full text-xs font-semibold text-zinc-400 hover:text-white bg-black/60 hover:bg-zinc-900 border border-zinc-800 active:scale-95 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-[#6001D2]" />
              <span>Android API Spec</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
