'use client';

import React from 'react';

interface SegmentedToggleProps {
  activeType: 'games' | 'movies';
  onChange: (type: 'games' | 'movies') => void;
  className?: string;
}

export function SegmentedToggle({ activeType, onChange, className = '' }: SegmentedToggleProps) {
  return (
    <div
      className={`relative inline-flex items-center bg-[#121216] p-1 rounded-full border border-zinc-800/80 shadow-inner ${className}`}
    >
      <button
        id="toggle-movies-btn"
        onClick={() => onChange('movies')}
        className={`relative z-10 px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
          activeType === 'movies'
            ? 'bg-white text-black shadow-md scale-[1.02]'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <span>MOVIES</span>
      </button>

      <button
        id="toggle-games-btn"
        onClick={() => onChange('games')}
        className={`relative z-10 px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
          activeType === 'games'
            ? 'bg-white text-black shadow-md scale-[1.02]'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <span>GAMES</span>
      </button>
    </div>
  );
}
