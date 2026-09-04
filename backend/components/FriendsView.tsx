'use client';

import React from 'react';
import { Users, Gamepad2, Film, Circle, UserPlus, MessageSquare } from 'lucide-react';
import { useUnifiedStore } from '@/lib/unified-store';

export function FriendsView() {
  const { friends } = useUnifiedStore();

  const getStatusBadge = (status: (typeof friends)[0]['status']) => {
    switch (status) {
      case 'in-game':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
            <span>Playing Now</span>
          </span>
        );
      case 'watching':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-400">
            <Circle className="w-2 h-2 fill-red-400 text-red-400 animate-pulse" />
            <span>Watching Movie</span>
          </span>
        );
      case 'online':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400">
            <Circle className="w-2 h-2 fill-blue-400 text-blue-400" />
            <span>Online</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <Circle className="w-2 h-2 fill-zinc-600 text-zinc-600" />
            <span>Offline</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#00E5FF]" />
            <span>Friends Activity</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            See what your friends across PlayStation, Steam, and Xbox are playing and watching in real time.
          </p>
        </div>

        <button
          onClick={() => alert('Friend invite link copied to clipboard!')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#00E5FF]" />
          <span>Add Friends</span>
        </button>
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0D0D10] hover:bg-[#131318] rounded-2xl border border-zinc-850 transition-all duration-200"
          >
            {/* Friend Avatar & Identity */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={friend.friendAvatar}
                  alt={friend.friendName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{friend.friendName}</h3>
                  {friend.mutualFriends && (
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                      {friend.mutualFriends} mutual friends
                    </span>
                  )}
                </div>
                <div className="mt-0.5">{getStatusBadge(friend.status)}</div>
              </div>
            </div>

            {/* Friend Activity Card */}
            {friend.currentActivity && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#14141A] border border-zinc-800/80 min-w-0 sm:max-w-md w-full sm:w-auto">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={friend.currentActivity.image}
                    alt={friend.currentActivity.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {friend.currentActivity.type === 'game' ? (
                      <Gamepad2 className="w-3 h-3 text-[#00E5FF] flex-shrink-0" />
                    ) : (
                      <Film className="w-3 h-3 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold text-zinc-200 truncate">
                      {friend.currentActivity.title}
                    </span>
                  </div>
                  {friend.currentActivity.details && (
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {friend.currentActivity.details}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
