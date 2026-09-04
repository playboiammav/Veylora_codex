'use client';

import React from 'react';
import {
  Search,
  Bookmark,
  Users,
  Settings,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { SegmentedToggle } from './SegmentedToggle';
import { useUnifiedStore } from '@/lib/unified-store';

interface TopNavProps {
  onOpenSettings: () => void;
}

export function TopNav({ onOpenSettings }: TopNavProps) {
  const {
    activeMediaType,
    setActiveMediaType,
    activeNavTab,
    setActiveNavTab,
    watchlist,
    userProfile,
  } = useUnifiedStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090B]/90 backdrop-blur-xl border-b border-zinc-850/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: User Avatar + Username (Replaces Veylora Brand Text) */}
        <div
          id="top-nav-profile-brand-area"
          onClick={() => setActiveNavTab('profile')}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0 select-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shadow-md transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userProfile.avatar}
              alt={userProfile.username || userProfile.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-white tracking-tight group-hover:text-zinc-200">
            {userProfile.username || userProfile.displayName}
          </span>
        </div>

        {/* Center: Games / Movies Toggle */}
        <div className="flex items-center justify-center">
          <SegmentedToggle
            activeType={activeMediaType}
            onChange={(type) => {
              setActiveMediaType(type);
              if (activeNavTab !== 'home') setActiveNavTab('home');
            }}
          />
        </div>

        {/* Right Desktop Nav & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800/60 mr-2">
            <button
              id="top-nav-home-btn"
              onClick={() => setActiveNavTab('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeNavTab === 'home'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              id="top-nav-search-btn"
              onClick={() => setActiveNavTab('search')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeNavTab === 'search'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Search
            </button>
            <button
              id="top-nav-watchlist-btn"
              onClick={() => setActiveNavTab('watchlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeNavTab === 'watchlist'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Gamelist</span>
              {watchlist.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-zinc-800 text-white border border-zinc-700">
                  {watchlist.length}
                </span>
              )}
            </button>
            <button
              id="top-nav-friends-btn"
              onClick={() => setActiveNavTab('friends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeNavTab === 'friends'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends</span>
            </button>
          </div>

          {/* Quick Search Button */}
          <button
            id="header-search-icon-btn"
            onClick={() => setActiveNavTab('search')}
            className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95 shadow-sm"
            title="Search Games & Movies"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95 shadow-sm"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile Avatar Button */}
          <button
            id="header-profile-avatar-btn"
            onClick={() => setActiveNavTab('profile')}
            className={`flex items-center gap-2 p-1 rounded-2xl transition-all border ${
              activeNavTab === 'profile'
                ? 'border-white bg-zinc-800'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden lg:inline text-xs font-bold text-zinc-200 pr-1.5">
              {userProfile.displayName.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
