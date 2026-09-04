'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, MapPin, Film, Star, ExternalLink, User } from 'lucide-react';
import { NormalizedPerson } from '@/lib/normalized-types';

interface PersonDetailModalProps {
  personId: string | null;
  onClose: () => void;
  onSelectMovie?: (movieId: string) => void;
}

export function PersonDetailModal({ personId, onClose, onSelectMovie }: PersonDetailModalProps) {
  const [person, setPerson] = useState<NormalizedPerson | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!personId) return;

    let isMounted = true;
    async function fetchPerson() {
      setLoading(true);
      try {
        const res = await fetch(`/api/people/${personId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setPerson(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch person details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPerson();
    return () => {
      isMounted = false;
    };
  }, [personId]);

  if (!personId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#0A0A0C] rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && !person ? (
          <div className="flex-1 flex items-center justify-center py-24 text-zinc-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : person ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Header: Photo & Bio */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-28 sm:w-36 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 flex-shrink-0 shadow-lg">
                {person.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                  {person.role || 'Artist'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {person.name}
                </h2>

                <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                  {person.birthDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Born: {person.birthDate}</span>
                    </div>
                  )}
                  {person.birthPlace && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{person.birthPlace}</span>
                    </div>
                  )}
                </div>

                {person.awardsSummary && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{person.awardsSummary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Biography</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-[#121216] p-4 rounded-2xl border border-zinc-800">
                  {person.biography}
                </p>
              </div>
            )}

            {/* Known For / Filmography */}
            {person.filmography && person.filmography.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Filmography ({person.filmography.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {person.filmography.slice(0, 18).map((film, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectMovie && onSelectMovie(film.id)}
                      className="p-2.5 rounded-xl bg-[#121216] border border-zinc-800 hover:border-red-500 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="text-xs font-bold text-white truncate">{film.title}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                        <span className="truncate">{film.character || film.role || 'Cast'}</span>
                        {film.year && <span className="font-mono text-zinc-500">{film.year}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Unable to load profile data for this individual.
          </div>
        )}
      </div>
    </div>
  );
}
