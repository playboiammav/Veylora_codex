'use client';

import React, { useState } from 'react';
import { Sparkles, Terminal, Search, Flame, Gamepad2, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'all' | 'playstation' | 'xbox';
  onTabChange: (tab: 'all' | 'playstation' | 'xbox') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenApiConsole: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenApiConsole,
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/85 backdrop-blur-xl border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onTabChange('all')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6001D2] to-[#00E5FF] p-[2px] flex items-center justify-center shadow-[0_0_15px_rgba(96,1,210,0.5)] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all">
              <div className="w-full h-full bg-[#000000] rounded-full flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                VEYLORA
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#00E5FF] -mt-1 font-semibold">
                Store Proxy Hub
              </span>
            </div>
          </div>

          {/* Navigation Links / Filters */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-full border border-zinc-800">
            <button
              id="filter-all-btn"
              onClick={() => onTabChange('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Platforms
            </button>
            <button
              id="filter-ps-btn"
              onClick={() => onTabChange('playstation')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'playstation'
                  ? 'bg-gradient-to-r from-[#003791] to-[#00E5FF] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              PlayStation
            </button>
            <button
              id="filter-xbox-btn"
              onClick={() => onTabChange('xbox')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'xbox'
                  ? 'bg-gradient-to-r from-[#107C10] to-[#00E5FF] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Xbox Series
            </button>
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center bg-[#09090B] border border-zinc-800 rounded-full px-3.5 py-1.5 focus-within:border-[#00E5FF] focus-within:ring-1 focus-within:ring-[#00E5FF] transition-all">
              <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
              <input
                id="game-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search games, deals..."
                className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-32 sm:w-48 md:w-60"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-zinc-500 hover:text-white text-xs ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <button
            id="open-api-console-btn"
            onClick={onOpenApiConsole}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#6001D2] to-[#00E5FF] hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(96,1,210,0.4)] transition-all whitespace-nowrap"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Android Proxy API</span>
          </button>
        </div>
      </div>

      {/* Mobile filter pills */}
      <div className="flex md:hidden items-center justify-center gap-2 px-4 py-2 border-t border-zinc-900 bg-black/95">
        <button
          onClick={() => onTabChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            activeTab === 'all' ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onTabChange('playstation')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            activeTab === 'playstation' ? 'bg-gradient-to-r from-[#003791] to-[#00E5FF] text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          PlayStation
        </button>
        <button
          onClick={() => onTabChange('xbox')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            activeTab === 'xbox' ? 'bg-gradient-to-r from-[#107C10] to-[#00E5FF] text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          Xbox
        </button>
      </div>
    </header>
  );
}
