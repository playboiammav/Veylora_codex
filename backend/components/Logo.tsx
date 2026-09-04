'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showSubtitle = true, className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Logo Badge */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-tr from-[#6001D2] via-[#8A2BE2] to-[#00E5FF] p-[1.5px] shadow-[0_0_20px_rgba(96,1,210,0.5)] transition-transform duration-300 hover:scale-105 flex-shrink-0`}
      >
        <div className="w-full h-full bg-[#09090B] rounded-2xl flex items-center justify-center relative overflow-hidden">
          {/* Subtle glow layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6001D2]/25 to-transparent pointer-events-none" />
          {/* Stylized 'V' and controller glyph */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
          >
            <path
              d="M4 6L12 20L20 6"
              stroke="url(#logo-grad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2" fill="#00E5FF" />
            <defs>
              <linearGradient id="logo-grad" x1="4" y1="6" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00E5FF" />
                <stop offset="1" stopColor="#9D4EDD" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-black tracking-wider bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-none`}
        >
          VEYLORA
        </span>
        {showSubtitle && (
          <span
            className={`${subtitleSizes[size]} tracking-[0.2em] uppercase font-mono text-[#00E5FF] font-bold mt-1`}
          >
            GAMES & MOVIES
          </span>
        )}
      </div>
    </div>
  );
}
