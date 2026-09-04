'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, MapPin, Film } from 'lucide-react';
import { NormalizedCompany } from '@/lib/normalized-types';

interface CompanyDetailModalProps {
  companyId: string | null;
  onClose: () => void;
  onSelectMovie?: (movieId: string) => void;
}

export function CompanyDetailModal({ companyId, onClose, onSelectMovie }: CompanyDetailModalProps) {
  const [company, setCompany] = useState<NormalizedCompany | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    let isMounted = true;
    async function fetchCompany() {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/${companyId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setCompany(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch company details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCompany();
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  if (!companyId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0A0A0C] rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && !company ? (
          <div className="flex-1 flex items-center justify-center py-20 text-zinc-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : company ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-8 h-8 text-zinc-500" />
                )}
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                  Production Studio
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{company.name}</h2>
              </div>
            </div>

            {company.description && (
              <p className="text-xs sm:text-sm text-zinc-300 bg-[#121216] p-4 rounded-2xl border border-zinc-800 leading-relaxed">
                {company.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              {company.country && (
                <div className="p-3 rounded-xl bg-[#121216] border border-zinc-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span>Country: <strong className="text-white">{company.country}</strong></span>
                </div>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#121216] border border-zinc-800 hover:border-zinc-600 flex items-center gap-2 text-red-400 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="truncate">Official Website</span>
                </a>
              )}
            </div>

            {company.movies && company.movies.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Produced Titles ({company.movies.length})
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {company.movies.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectMovie && onSelectMovie(m.id)}
                      className="p-2.5 rounded-xl bg-[#121216] border border-zinc-800 hover:border-red-500 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <span className="text-xs font-bold text-white truncate">{m.title}</span>
                      {m.year && <span className="text-[10px] font-mono text-zinc-500">{m.year}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 text-xs">Unable to load company details.</div>
        )}
      </div>
    </div>
  );
}
