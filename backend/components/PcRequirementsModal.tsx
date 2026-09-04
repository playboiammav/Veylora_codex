'use client';

import React from 'react';
import { X, Cpu, HardDrive, Monitor, Shield, Layers, AlertCircle } from 'lucide-react';
import { PcRequirements } from '@/lib/game-types';

interface PcRequirementsModalProps {
  isOpen: boolean;
  gameTitle: string;
  requirements?: PcRequirements;
  onClose: () => void;
}

export function PcRequirementsModal({
  isOpen,
  gameTitle,
  requirements,
  onClose,
}: PcRequirementsModalProps) {
  if (!isOpen) return null;

  const hasReqs = Boolean(
    requirements && (requirements.minimum || requirements.recommended)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0F0F12] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-pc-reqs-btn"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="mb-5 pr-8">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Monitor className="w-3.5 h-3.5 text-zinc-300" />
            <span>Hardware Specifications</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            PC System Requirements
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">
            {gameTitle}
          </p>
        </div>

        {!hasReqs ? (
          <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-400">
              PC requirements are not available for this game.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Minimum Requirements */}
            {requirements?.minimum ? (
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-850 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Minimum Requirements
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">720p / 30 FPS</span>
                </div>

                <div className="space-y-2 text-xs">
                  {requirements.minimum.os && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">OS</span>
                      <span className="text-zinc-200">{requirements.minimum.os}</span>
                    </div>
                  )}
                  {requirements.minimum.processor && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Processor</span>
                      <span className="text-zinc-200">{requirements.minimum.processor}</span>
                    </div>
                  )}
                  {requirements.minimum.memory && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Memory</span>
                      <span className="text-zinc-200">{requirements.minimum.memory}</span>
                    </div>
                  )}
                  {requirements.minimum.graphics && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Graphics</span>
                      <span className="text-zinc-200">{requirements.minimum.graphics}</span>
                    </div>
                  )}
                  {requirements.minimum.vram && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">VRAM</span>
                      <span className="text-zinc-200">{requirements.minimum.vram}</span>
                    </div>
                  )}
                  {requirements.minimum.directx && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">DirectX</span>
                      <span className="text-zinc-200">{requirements.minimum.directx}</span>
                    </div>
                  )}
                  {requirements.minimum.storage && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Storage</span>
                      <span className="text-zinc-200">{requirements.minimum.storage}</span>
                    </div>
                  )}
                  {requirements.minimum.additionalNotes && (
                    <div className="pt-1 text-[11px] text-zinc-400 italic">
                      Note: {requirements.minimum.additionalNotes}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Recommended Requirements */}
            {requirements?.recommended ? (
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-850 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Recommended Specs
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">1080p / 60 FPS</span>
                </div>

                <div className="space-y-2 text-xs">
                  {requirements.recommended.os && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">OS</span>
                      <span className="text-zinc-200">{requirements.recommended.os}</span>
                    </div>
                  )}
                  {requirements.recommended.processor && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Processor</span>
                      <span className="text-zinc-200">{requirements.recommended.processor}</span>
                    </div>
                  )}
                  {requirements.recommended.memory && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Memory</span>
                      <span className="text-zinc-200">{requirements.recommended.memory}</span>
                    </div>
                  )}
                  {requirements.recommended.graphics && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Graphics</span>
                      <span className="text-zinc-200">{requirements.recommended.graphics}</span>
                    </div>
                  )}
                  {requirements.recommended.vram && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">VRAM</span>
                      <span className="text-zinc-200">{requirements.recommended.vram}</span>
                    </div>
                  )}
                  {requirements.recommended.directx && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">DirectX</span>
                      <span className="text-zinc-200">{requirements.recommended.directx}</span>
                    </div>
                  )}
                  {requirements.recommended.storage && (
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Storage</span>
                      <span className="text-zinc-200">{requirements.recommended.storage}</span>
                    </div>
                  )}
                  {requirements.recommended.additionalNotes && (
                    <div className="pt-1 text-[11px] text-zinc-400 italic">
                      Note: {requirements.recommended.additionalNotes}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
