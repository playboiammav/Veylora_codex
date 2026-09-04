'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { NormalizedStoreLink } from '@/lib/normalized-types';
import { resolveStoreConfig } from '@/lib/platform-logo-mapper';

interface StoreButtonsProps {
  stores?: NormalizedStoreLink[];
  className?: string;
}

export function StoreButtons({ stores = [], className = '' }: StoreButtonsProps) {
  if (!stores || stores.length === 0) return null;

  // Deduplicate stores by storeId
  const uniqueStoresMap = new Map<string, NormalizedStoreLink>();
  for (const store of stores) {
    if (!store || !store.storeId) continue;
    if (!uniqueStoresMap.has(store.storeId)) {
      uniqueStoresMap.set(store.storeId, store);
    }
  }

  const storeList = Array.from(uniqueStoresMap.values());

  return (
    <div className={`w-full flex flex-col gap-2.5 ${className}`}>
      {storeList.map((store, idx) => {
        const config = resolveStoreConfig(store.storeId || store.name);

        let priceText = '';
        if (store.price) {
          const pLower = store.price.toLowerCase();
          if (pLower === 'free' || pLower === '0' || pLower === '$0.00' || pLower === 'free to play') {
            priceText = 'FREE';
          } else {
            priceText = store.price;
          }
        }

        return (
          <a
            key={`${store.storeId}-${idx}`}
            href={store.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-3 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-bold ${config.bgClass} ${config.textClass} flex items-center justify-between gap-3 shadow-md transition-all duration-200 hover:opacity-95 active:scale-[0.98] group`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {config.logoPath && (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.logoPath}
                    alt={config.altText}
                    className="max-w-full max-h-full object-contain brightness-0 invert"
                  />
                </div>
              )}
              <span className="truncate">{config.name || store.name}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {store.originalPrice && store.discountPercent && store.discountPercent > 0 && (
                <span className="text-[11px] line-through text-zinc-400 font-mono font-normal">
                  {store.originalPrice}
                </span>
              )}

              {priceText && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-black bg-black/40 text-emerald-300 border border-emerald-500/30">
                  {priceText}
                </span>
              )}

              <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
