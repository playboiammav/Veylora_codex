'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onViewAll?: () => void;
  className?: string;
}

export function HorizontalCarousel({
  title,
  subtitle,
  badge,
  icon,
  children,
  onViewAll,
  className = '',
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={`w-full space-y-3.5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-end justify-between px-1 sm:px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-zinc-300">{icon}</span>}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6001D2]/30 text-[#00E5FF] border border-[#6001D2]/50">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>}
        </div>

        {/* Action / Nav arrows */}
        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-[#00E5FF] hover:underline mr-1"
            >
              See All
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
