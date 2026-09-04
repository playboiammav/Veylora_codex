'use client';

import React from 'react';
import { resolveHardwarePlatform, HardwarePlatformConfig } from '@/lib/platform-logo-mapper';

interface PlatformIconsProps {
  platforms?: string[];
  hardwareBadges?: string[];
  maxDisplay?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onOpenPcRequirements?: () => void;
}

/**
 * PC Chip Component
 * Dark interior, white "PC" text, and thin animated RGB border continuously chasing around ALL FOUR SIDES:
 * top -> right -> bottom -> left -> top.
 */
export function PcChip({
  size = 'sm',
  onClick,
}: {
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
}) {
  const heightClass = size === 'lg' ? 'h-6 text-[11px] px-2.5' : size === 'md' ? 'h-5 text-[10px] px-2' : 'h-4.5 text-[9px] px-1.5';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center rounded-[5px] p-[1.5px] overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95 select-none ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      title="PC (Click for System Requirements)"
      aria-label="PC Platform - View System Requirements"
    >
      {/* 4-sided continuous chasing RGB border using rotating conic-gradient */}
      <span
        className="absolute -inset-[180%] animate-rgb-chase pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, #ff0055, #7a00ff, #00e5ff, #00ff66, #ffea00, #ff0055)',
        }}
      />
      {/* Dark interior with crisp white PC text */}
      <span
        className={`relative z-10 bg-[#09090B] text-white font-mono font-black tracking-wider rounded-[3.5px] flex items-center justify-center shadow-inner ${heightClass}`}
      >
        PC
      </span>
    </button>
  );
}

/**
 * Renders Hardware Platform Logos using real SVGs from /assets/logos/
 */
export function PlatformIcons({
  platforms = [],
  hardwareBadges = [],
  maxDisplay = 4,
  className = '',
  size = 'sm',
  onOpenPcRequirements,
}: PlatformIconsProps) {
  const platformConfigsMap = new Map<string, HardwarePlatformConfig>();

  const rawList = [...(hardwareBadges || []), ...(platforms || [])];

  for (const raw of rawList) {
    if (!raw) continue;
    const resolved = resolveHardwarePlatform(raw);
    if (resolved && !platformConfigsMap.has(resolved.id)) {
      platformConfigsMap.set(resolved.id, resolved);
    }
  }

  // Fallback if none resolved
  if (platformConfigsMap.size === 0) {
    const pc = resolveHardwarePlatform('pc');
    if (pc) platformConfigsMap.set('pc', pc);
  }

  const items = Array.from(platformConfigsMap.values());
  const displayed = items.slice(0, maxDisplay);
  const remaining = items.length - maxDisplay;

  // Icon visual height
  const iconHeight = size === 'lg' ? 'h-5 w-auto max-w-[28px]' : size === 'md' ? 'h-4.5 w-auto max-w-[24px]' : 'h-4 w-auto max-w-[20px]';

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 flex-wrap ${className}`}>
      {displayed.map((item) => {
        if (item.isPc) {
          return (
            <PcChip
              key="pc-chip"
              size={size}
              onClick={(e) => {
                if (onOpenPcRequirements) {
                  e.stopPropagation();
                  onOpenPcRequirements();
                }
              }}
            />
          );
        }

        if (item.logoPath) {
          return (
            <div
              key={item.id}
              className="inline-flex items-center justify-center flex-shrink-0"
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.logoPath}
                alt={item.altText}
                loading="lazy"
                className={`${iconHeight} object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity`}
              />
            </div>
          );
        }

        return (
          <span
            key={item.id}
            className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-tight"
          >
            {item.shortName || item.name}
          </span>
        );
      })}

      {remaining > 0 && (
        <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800">
          +{remaining}
        </span>
      )}
    </div>
  );
}
