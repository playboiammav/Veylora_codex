'use client';

import React from 'react';
import { Home, Search, Bookmark, Users, User } from 'lucide-react';
import { useUnifiedStore } from '@/lib/unified-store';

export function BottomNav() {
  const { activeNavTab, setActiveNavTab, watchlist } = useUnifiedStore();

  const navItems: Array<{
    id: 'home' | 'search' | 'watchlist' | 'friends' | 'profile';
    label: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    {
      id: 'watchlist',
      label: 'Gamelist',
      icon: Bookmark,
      badge: watchlist.length > 0 ? watchlist.length : undefined,
    },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-2xl border-t border-zinc-800/80 px-2 py-1.5 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}-btn`}
              onClick={() => setActiveNavTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-zinc-800 text-white border border-zinc-700 shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-bold tracking-tight mt-1 transition-all ${
                  isActive ? 'text-white' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="w-1 h-1 rounded-full bg-white mt-0.5 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
