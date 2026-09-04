'use client';

import React from 'react';
import {
  User,
  Shield,
  Gamepad2,
  Film,
  Bookmark,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useUnifiedStore } from '@/lib/unified-store';

export function ProfileView() {
  const { userProfile, watchlist, isAuthenticated, setShowAuthModal, logout } = useUnifiedStore();

  const progressPercent = Math.min(100, Math.round((userProfile.xp / userProfile.xpNextLevel) * 100));

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-white shadow-xl">
          <User className="w-10 h-10 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Sign In Required</h2>
          <p className="text-xs text-zinc-400">
            Sign in to access your Veylora profile, sync gamelist items, and connect ecosystem accounts.
          </p>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-lg transition-all active:scale-95"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0D0D10] border border-zinc-850 shadow-2xl overflow-hidden">
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with level badge */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-zinc-800 text-white text-xs font-black border border-zinc-700 shadow">
              LVL {userProfile.level}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-white">{userProfile.displayName}</h1>
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-mono text-zinc-500">@{userProfile.username}</p>
              </div>

              <button
                onClick={() => logout()}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold border border-zinc-800 transition-all self-center sm:self-start"
              >
                Sign Out
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              {userProfile.bio}
            </p>

            {/* Level XP Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-zinc-300" />
                  <span>XP Progress</span>
                </span>
                <span className="text-white font-bold">
                  {userProfile.xp.toLocaleString()} / {userProfile.xpNextLevel.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500 text-xs font-bold">
            <Gamepad2 className="w-4 h-4 text-white" />
            <span>Games Played</span>
          </div>
          <p className="text-2xl font-black text-white">{userProfile.gamesPlayedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500 text-xs font-bold">
            <Film className="w-4 h-4 text-zinc-300" />
            <span>Movies Tracked</span>
          </div>
          <p className="text-2xl font-black text-white">{userProfile.moviesWatchedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500 text-xs font-bold">
            <Bookmark className="w-4 h-4 text-zinc-300" />
            <span>Gamelist Items</span>
          </div>
          <p className="text-2xl font-black text-white">{watchlist.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500 text-xs font-bold">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Friends</span>
          </div>
          <p className="text-2xl font-black text-white">{userProfile.friendsCount}</p>
        </div>
      </div>

      {/* Linked Ecosystem Accounts */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight uppercase">
          Linked Gaming & Entertainment Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Steam */}
          <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1b2838] flex items-center justify-center text-white font-mono font-black text-xs border border-zinc-700">
                STEAM
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Steam Account</h4>
                <p className="text-[11px] text-zinc-400">
                  {userProfile.linkedAccounts?.steam?.connected
                    ? userProfile.linkedAccounts.steam.username
                    : 'Not Connected'}
                </p>
              </div>
            </div>
            {userProfile.linkedAccounts?.steam?.connected ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Connect</span>
            )}
          </div>

          {/* PlayStation */}
          <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003791] flex items-center justify-center text-white font-mono font-black text-xs border border-blue-600">
                PSN
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">PlayStation Network</h4>
                <p className="text-[11px] text-zinc-400">
                  {userProfile.linkedAccounts?.playstation?.connected
                    ? userProfile.linkedAccounts.playstation.username
                    : 'Not Connected'}
                </p>
              </div>
            </div>
            {userProfile.linkedAccounts?.playstation?.connected ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Connect</span>
            )}
          </div>

          {/* Xbox */}
          <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#107C10] flex items-center justify-center text-white font-mono font-black text-xs border border-emerald-600">
                XBOX
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Xbox Live Network</h4>
                <p className="text-[11px] text-zinc-400">
                  {userProfile.linkedAccounts?.xbox?.connected
                    ? userProfile.linkedAccounts.xbox.username
                    : 'Available for Link'}
                </p>
              </div>
            </div>
            <button className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white border border-zinc-700">
              Link
            </button>
          </div>

          {/* Netflix */}
          <div className="p-4 rounded-2xl bg-[#0D0D10] border border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center text-white font-mono font-black text-xs border border-red-700">
                NFLX
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Netflix Streaming</h4>
                <p className="text-[11px] text-zinc-400">
                  {userProfile.linkedAccounts?.netflix?.connected
                    ? userProfile.linkedAccounts.netflix.email
                    : 'Not Linked'}
                </p>
              </div>
            </div>
            {userProfile.linkedAccounts?.netflix?.connected ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Connect</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
