'use client';

import React from 'react';
import { X, Moon, Volume2, Bell, ShieldCheck, Smartphone, Info } from 'lucide-react';
import { useUnifiedStore } from '@/lib/unified-store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useUnifiedStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-md bg-[#0D0D10] rounded-3xl border border-zinc-800 shadow-2xl p-6 space-y-6 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-black tracking-tight text-white uppercase">App Preferences</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-850">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-[#00E5FF]" />
              <div>
                <h4 className="text-xs font-bold text-white">Color Aesthetic</h4>
                <p className="text-[11px] text-zinc-500">Dark OLED Entertainment Canvas</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-850">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Auto-Play Video Trailers</h4>
                <p className="text-[11px] text-zinc-500">Seamless video playback on modal details</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ autoPlayTrailers: !settings.autoPlayTrailers })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.autoPlayTrailers ? 'bg-[#6001D2]' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoPlayTrailers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-850">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Game & Movie Notifications</h4>
                <p className="text-[11px] text-zinc-500">Alerts on release dates and friend activity</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.notificationsEnabled ? 'bg-[#00E5FF]' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Build & Engine Meta */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1.5 text-[11px] font-mono text-zinc-500">
          <div className="flex justify-between">
            <span>Ecosystem Backend</span>
            <span className="text-zinc-300">Google Cloud Run (Server-Side)</span>
          </div>
          <div className="flex justify-between">
            <span>Catalog API</span>
            <span className="text-zinc-300">RAWG & TMDB Engine</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Build</span>
            <span className="text-[#00E5FF]">v2.4.0 (Mobile Faithful Web)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
