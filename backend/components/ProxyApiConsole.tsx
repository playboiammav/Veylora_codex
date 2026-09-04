'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, X, Play, Copy, Check, ShieldCheck, RefreshCw, Zap, Server, Globe } from 'lucide-react';

interface ProxyApiConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProxyApiConsole({ isOpen, onClose }: ProxyApiConsoleProps) {
  const [targetPlatform, setTargetPlatform] = useState<
    'playstation' | 'xbox' | 'steam' | 'epic' | 'gog' | 'cs2' | 'google-play' | 'app-store' | 'netflix' | 'rawg' | 'search' | 'logos'
  >('rawg');

  // RAWG Video Games Database Params
  const [rawgEndpoint, setRawgEndpoint] = useState<'games' | 'details' | 'genres' | 'platforms'>('games');
  const [rawgSearch, setRawgSearch] = useState('Witcher');
  const [rawgGameId, setRawgGameId] = useState('3328');
  const [rawgOrdering, setRawgOrdering] = useState('-rating');

  // PlayStation Params
  const [psCategory, setPsCategory] = useState('3c64704f-124a-4424-aa6a-68df9f935c10');
  const [psSize, setPsSize] = useState('12');

  // Xbox Params
  const [xboxListType, setXboxListType] = useState('Deal');
  const [xboxMarket, setXboxMarket] = useState('US');
  const [xboxCount, setXboxCount] = useState('12');

  // Steam Params
  const [steamEndpoint, setSteamEndpoint] = useState<'featured' | 'categories' | 'game' | 'news'>('game');
  const [steamAppId, setSteamAppId] = useState('1245620');
  const [steamRegion, setSteamRegion] = useState('us');

  // Epic Params
  const [epicAction, setEpicAction] = useState<'auth' | 'account'>('auth');
  const [epicAccountId, setEpicAccountId] = useState('epic_sample_user_01');

  // GOG Params
  const [gogEndpoint, setGogEndpoint] = useState<'catalog' | 'details'>('catalog');
  const [gogQuery, setGogQuery] = useState('witcher');
  const [gogId, setGogId] = useState('1207658924');

  // CS2 Params
  const [cs2Category, setCs2Category] = useState('skins');
  const [cs2Lang, setCs2Lang] = useState('en');

  // Google Play Params
  const [gplayEndpoint, setGplayEndpoint] = useState<'apps' | 'details' | 'permissions' | 'datasafety' | 'reviews'>('apps');
  const [gplayAppId, setGplayAppId] = useState('org.wikipedia');
  const [gplayCollection, setGplayCollection] = useState('TOP_FREE');

  // App Store Connect Params
  const [appleResource, setAppleResource] = useState<'apps' | 'versions' | 'builds' | 'review' | 'status'>('apps');

  // Netflix Params
  const [netflixEndpoint, setNetflixEndpoint] = useState<'media' | 'search' | 'profile' | 'watchlist'>('media');
  const [netflixSearch, setNetflixSearch] = useState('Arcane');

  // Unified Search Params
  const [searchQuery, setSearchQuery] = useState('Cyberpunk');
  const [searchPlatform, setSearchPlatform] = useState('all');

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'response' | 'retrofit' | 'curl'>('response');

  const getEndpointUrl = React.useCallback(() => {
    switch (targetPlatform) {
      case 'steam':
        if (steamEndpoint === 'featured') return `/api/steam/featured?cc=${steamRegion}`;
        if (steamEndpoint === 'categories') return `/api/steam/featuredcategories?cc=${steamRegion}&l=english`;
        if (steamEndpoint === 'news') return `/api/steam/news/${steamAppId}?count=3`;
        return `/api/steam/game/${steamAppId}?cc=${steamRegion}&l=english`;
      case 'epic':
        if (epicAction === 'account') return `/api/epic/account?accountId=${epicAccountId}`;
        return `/api/epic/auth`;
      case 'gog':
        if (gogEndpoint === 'details') return `/api/gog/${gogId}`;
        return gogQuery ? `/api/gog?search=${encodeURIComponent(gogQuery)}` : `/api/gog?page=1`;
      case 'cs2':
        return `/api/cs2/${cs2Category}?lang=${cs2Lang}&limit=12`;
      case 'google-play':
        if (gplayEndpoint === 'details') return `/api/google-play/apps/${gplayAppId}`;
        if (gplayEndpoint === 'permissions') return `/api/google-play/apps/${gplayAppId}/permissions`;
        if (gplayEndpoint === 'datasafety') return `/api/google-play/apps/${gplayAppId}/datasafety`;
        if (gplayEndpoint === 'reviews') return `/api/google-play/apps/${gplayAppId}/reviews`;
        return `/api/google-play/apps?collection=${gplayCollection}&num=12`;
      case 'app-store':
        return `/api/app-store-connect/${appleResource}`;
      case 'netflix':
        if (netflixEndpoint === 'search') return `/api/netflix/media/search/${encodeURIComponent(netflixSearch)}`;
        if (netflixEndpoint === 'profile') return `/api/netflix/profile`;
        if (netflixEndpoint === 'watchlist') return `/api/netflix/media/watchlist/me`;
        return `/api/netflix/media`;
      case 'rawg':
        if (rawgEndpoint === 'details') return `/api/rawg/games/${rawgGameId}?screenshots=true&movies=true`;
        if (rawgEndpoint === 'genres') return `/api/rawg/genres`;
        if (rawgEndpoint === 'platforms') return `/api/rawg/platforms`;
        return `/api/rawg/games?search=${encodeURIComponent(rawgSearch)}&ordering=${rawgOrdering}&page=1&page_size=12`;
      case 'search':
        return `/api/search?q=${encodeURIComponent(searchQuery)}&platform=${searchPlatform}`;
      case 'playstation':
        return `/api/playstation?category=${psCategory}&size=${psSize}`;
      case 'xbox':
        return `/api/xbox?listType=${xboxListType}&market=${xboxMarket}&count=${xboxCount}`;
      case 'logos':
      default:
        return `/api/assets/logos`;
    }
  }, [
    targetPlatform,
    steamEndpoint,
    steamRegion,
    steamAppId,
    epicAction,
    epicAccountId,
    gogEndpoint,
    gogId,
    gogQuery,
    cs2Category,
    cs2Lang,
    gplayEndpoint,
    gplayAppId,
    gplayCollection,
    appleResource,
    netflixEndpoint,
    netflixSearch,
    rawgEndpoint,
    rawgSearch,
    rawgGameId,
    rawgOrdering,
    searchQuery,
    searchPlatform,
    psCategory,
    psSize,
    xboxListType,
    xboxMarket,
    xboxCount,
  ]);

  const handleTestApi = async () => {
    setLoading(true);
    setResponseData(null);
    const startTime = performance.now();
    try {
      const url = getEndpointUrl();
      const res = await fetch(url);
      const data = await res.json();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(res.status);
      setResponseData(data);
    } catch (err: any) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseData({ error: err.message || 'Failed to fetch proxy route' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const loadInitialData = async () => {
      setLoading(true);
      const startTime = performance.now();
      try {
        const url = getEndpointUrl();
        const res = await fetch(url);
        const data = await res.json();
        const endTime = performance.now();
        if (!isCancelled) {
          setLatency(Math.round(endTime - startTime));
          setResponseStatus(res.status);
          setResponseData(data);
        }
      } catch (err: any) {
        const endTime = performance.now();
        if (!isCancelled) {
          setLatency(Math.round(endTime - startTime));
          setResponseStatus(500);
          setResponseData({ error: err.message || 'Failed to fetch proxy route' });
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, getEndpointUrl]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${getEndpointUrl()}` : getEndpointUrl();

  const curlSnippet = `curl -X GET "${fullUrl}" \\
  -H "Accept: application/json"`;

  const retrofitSnippet = `// Unified Directory Retrofit Interface
package com.veylora.app.data.api

import retrofit2.http.GET
import retrofit2.http.Query

interface UnifiedApi {
    @GET("${getEndpointUrl().replace(/^\//, '')}")
    suspend fun fetchData(): ApiResponse<Any>
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#6001D2] to-[#00E5FF] text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">Unified Platform & Proxy Console</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-[#00E5FF] border border-cyan-800">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live inspect & test Steam, Epic, GOG, CS2, Google Play, App Store Connect, Netflix, PlayStation & Xbox APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selector */}
        <div className="p-4 border-b border-zinc-800 bg-black/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              {[
                { id: 'rawg', label: 'RAWG Database' },
                { id: 'steam', label: 'Steam API' },
                { id: 'epic', label: 'Epic Games' },
                { id: 'gog', label: 'GOG Store' },
                { id: 'cs2', label: 'CS2 Items' },
                { id: 'google-play', label: 'Google Play' },
                { id: 'app-store', label: 'App Store Connect' },
                { id: 'netflix', label: 'Netflix Stream' },
                { id: 'search', label: 'Universe Search' },
                { id: 'playstation', label: 'PlayStation' },
                { id: 'xbox', label: 'Xbox' },
                { id: 'logos', label: 'Logos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTargetPlatform(tab.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    targetPlatform === tab.id
                      ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleTestApi}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6001D2] to-[#00E5FF] hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{loading ? 'Fetching...' : 'Send Live Request'}</span>
            </button>
          </div>

          {/* Dynamic Platform Controls */}
          {targetPlatform === 'rawg' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Endpoint / Resource:</label>
                <select
                  value={rawgEndpoint}
                  onChange={(e) => setRawgEndpoint(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="games">GET /api/rawg/games (Search & Catalog)</option>
                  <option value="details">GET /api/rawg/games/&#123;id&#125; (Details & Media)</option>
                  <option value="genres">GET /api/rawg/genres (Genres List)</option>
                  <option value="platforms">GET /api/rawg/platforms (Platforms List)</option>
                </select>
              </div>
              {rawgEndpoint === 'games' && (
                <>
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[11px]">Search Title:</label>
                    <input
                      type="text"
                      value={rawgSearch}
                      onChange={(e) => setRawgSearch(e.target.value)}
                      placeholder="e.g. Witcher, GTA, Portal..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[11px]">Ordering:</label>
                    <select
                      value={rawgOrdering}
                      onChange={(e) => setRawgOrdering(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                    >
                      <option value="-rating">Top Rated (-rating)</option>
                      <option value="-released">Newest Released (-released)</option>
                      <option value="-metacritic">Highest Metacritic (-metacritic)</option>
                      <option value="-added">Most Popular (-added)</option>
                    </select>
                  </div>
                </>
              )}
              {rawgEndpoint === 'details' && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-400 text-[11px]">Game ID or Slug:</label>
                  <input
                    type="text"
                    value={rawgGameId}
                    onChange={(e) => setRawgGameId(e.target.value)}
                    placeholder="e.g. 3328 or grand-theft-auto-v"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {targetPlatform === 'steam' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Endpoint:</label>
                <select
                  value={steamEndpoint}
                  onChange={(e) => setSteamEndpoint(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="game">GET /game/&#123;appId&#125; (Game Details)</option>
                  <option value="featured">GET /featured (Store Highlights)</option>
                  <option value="categories">GET /featuredcategories (Categories)</option>
                  <option value="news">GET /news/&#123;appId&#125; (Game News)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Steam App ID:</label>
                <select
                  value={steamAppId}
                  onChange={(e) => setSteamAppId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="1245620">1245620 (ELDEN RING)</option>
                  <option value="271590">271590 (Grand Theft Auto V)</option>
                  <option value="1091500">1091500 (Cyberpunk 2077)</option>
                  <option value="730">730 (Counter-Strike 2)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Region (cc):</label>
                <select
                  value={steamRegion}
                  onChange={(e) => setSteamRegion(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="us">us (USD)</option>
                  <option value="es">es (EUR)</option>
                  <option value="de">de (EUR)</option>
                  <option value="uk">uk (GBP)</option>
                  <option value="br">br (BRL)</option>
                </select>
              </div>
            </div>
          )}

          {targetPlatform === 'epic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Epic OAuth Action:</label>
                <select
                  value={epicAction}
                  onChange={(e) => setEpicAction(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="auth">GET /api/epic/auth (OAuth2 Authorization URL)</option>
                  <option value="account">GET /api/epic/account (Account Lookup)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">EOS Account ID:</label>
                <input
                  type="text"
                  value={epicAccountId}
                  onChange={(e) => setEpicAccountId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {targetPlatform === 'gog' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Endpoint:</label>
                <select
                  value={gogEndpoint}
                  onChange={(e) => setGogEndpoint(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="catalog">GET /api/gog (Filtered Catalog)</option>
                  <option value="details">GET /api/gog/&#123;id&#125; (Product Details)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Catalog Search Query:</label>
                <input
                  type="text"
                  value={gogQuery}
                  onChange={(e) => setGogQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Product ID / Slug:</label>
                <input
                  type="text"
                  value={gogId}
                  onChange={(e) => setGogId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 font-mono"
                />
              </div>
            </div>
          )}

          {targetPlatform === 'cs2' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">CS2 Category:</label>
                <select
                  value={cs2Category}
                  onChange={(e) => setCs2Category(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="skins">skins.json (Weapon Skins)</option>
                  <option value="stickers">stickers.json (Stickers)</option>
                  <option value="crates">crates.json (Weapon Cases & Crates)</option>
                  <option value="collections">collections.json (Collections)</option>
                  <option value="agents">agents.json (Operator Agents)</option>
                  <option value="keys">keys.json (Case Keys)</option>
                  <option value="music_kits">music_kits.json (Music Kits)</option>
                  <option value="patches">patches.json (Patches)</option>
                  <option value="graffiti">graffiti.json (Graffiti)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Language Code (28 Supported):</label>
                <select
                  value={cs2Lang}
                  onChange={(e) => setCs2Lang(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="en">en (English)</option>
                  <option value="es-ES">es-ES (Spanish)</option>
                  <option value="de">de (German)</option>
                  <option value="fr">fr (French)</option>
                  <option value="zh-CN">zh-CN (Simplified Chinese)</option>
                  <option value="ja">ja (Japanese)</option>
                  <option value="ru">ru (Russian)</option>
                </select>
              </div>
            </div>
          )}

          {targetPlatform === 'google-play' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Resource:</label>
                <select
                  value={gplayEndpoint}
                  onChange={(e) => setGplayEndpoint(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="apps">GET /api/apps (Top Collection)</option>
                  <option value="details">GET /api/apps/&#123;appId&#125; (App Details)</option>
                  <option value="permissions">GET /api/apps/&#123;appId&#125;/permissions</option>
                  <option value="datasafety">GET /api/apps/&#123;appId&#125;/datasafety</option>
                  <option value="reviews">GET /api/apps/&#123;appId&#125;/reviews</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Application ID:</label>
                <input
                  type="text"
                  value={gplayAppId}
                  onChange={(e) => setGplayAppId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Collection:</label>
                <select
                  value={gplayCollection}
                  onChange={(e) => setGplayCollection(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="TOP_FREE">TOP_FREE</option>
                  <option value="TOP_PAID">TOP_PAID</option>
                  <option value="GROSSING">GROSSING</option>
                </select>
              </div>
            </div>
          )}

          {targetPlatform === 'app-store' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">ASC Resource / Workflow:</label>
                <select
                  value={appleResource}
                  onChange={(e) => setAppleResource(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="apps">asc apps list (/v1/apps)</option>
                  <option value="versions">asc versions list (/v1/appStoreVersions)</option>
                  <option value="builds">asc builds list (/v1/builds)</option>
                  <option value="review">asc review status (/v1/review)</option>
                  <option value="status">asc status & credentials check</option>
                </select>
              </div>
              <div className="flex items-center text-zinc-400 text-xs">
                Backend signs JWT using ES256 & APPLE_KEY_ID credentials securely.
              </div>
            </div>
          )}

          {targetPlatform === 'netflix' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Endpoint:</label>
                <select
                  value={netflixEndpoint}
                  onChange={(e) => setNetflixEndpoint(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="media">GET /api/netflix/media (Full Media Catalog)</option>
                  <option value="search">GET /api/netflix/media/search/&#123;search&#125;</option>
                  <option value="profile">GET /api/netflix/profile (User Profile)</option>
                  <option value="watchlist">GET /api/netflix/media/watchlist/&#123;userId&#125;</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Search Title:</label>
                <input
                  type="text"
                  value={netflixSearch}
                  onChange={(e) => setNetflixSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                />
              </div>
            </div>
          )}

          {targetPlatform === 'search' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Search Query Across All Universes:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Cyberpunk, Mario, Arcane, Glock..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[11px]">Platform Filter:</label>
                <select
                  value={searchPlatform}
                  onChange={(e) => setSearchPlatform(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                >
                  <option value="all">All Platforms (RAWG, Steam, GOG, CS2, Google Play, Apple, Netflix)</option>
                  <option value="rawg">RAWG Video Games Database</option>
                  <option value="steam">Steam</option>
                  <option value="gog">GOG</option>
                  <option value="cs2">CS2 Items</option>
                  <option value="google-play">Google Play</option>
                  <option value="app-store">App Store Connect</option>
                  <option value="netflix">Netflix</option>
                </select>
              </div>
            </div>
          )}

          {/* Active URL bar */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-[#00E5FF] overflow-x-auto">
            <span className="truncate mr-2">{fullUrl}</span>
            <button
              onClick={() => copyToClipboard(fullUrl, 'url')}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold border border-zinc-800 flex-shrink-0"
            >
              {copiedType === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedType === 'url' ? 'Copied' : 'Copy Endpoint'}
            </button>
          </div>
        </div>

        {/* Snippet Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-800 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSnippetTab('response')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSnippetTab === 'response'
                  ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Live JSON Response
            </button>
            <button
              onClick={() => setActiveSnippetTab('retrofit')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSnippetTab === 'retrofit'
                  ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Kotlin Retrofit
            </button>
            <button
              onClick={() => setActiveSnippetTab('curl')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSnippetTab === 'curl'
                  ? 'bg-gradient-to-r from-[#6001D2] to-[#00E5FF] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              cURL
            </button>
          </div>

          {responseStatus && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  responseStatus === 200
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                HTTP {responseStatus}
              </span>
              {latency && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 text-[#00E5FF] border border-zinc-800 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  {latency} ms
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Viewer */}
        <div className="p-6 flex-1 overflow-y-auto max-h-80 bg-zinc-950 font-mono text-xs text-zinc-300">
          {activeSnippetTab === 'response' && (
            <div className="relative">
              <div className="absolute top-0 right-0">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(responseData, null, 2), 'response')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[11px]"
                >
                  {copiedType === 'response' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedType === 'response' ? 'Copied' : 'Copy'}
                </button>
              </div>
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#00E5FF]" />
                  <span>Connecting to {targetPlatform} backend proxy service...</span>
                </div>
              ) : responseData ? (
                <pre className="overflow-x-auto">{JSON.stringify(responseData, null, 2)}</pre>
              ) : (
                <div className="py-8 text-center text-zinc-500">Click &apos;Send Live Request&apos; to test this endpoint</div>
              )}
            </div>
          )}

          {activeSnippetTab === 'retrofit' && (
            <div className="relative">
              <div className="absolute top-0 right-0">
                <button
                  onClick={() => copyToClipboard(retrofitSnippet, 'retrofit')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[11px]"
                >
                  {copiedType === 'retrofit' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedType === 'retrofit' ? 'Copied' : 'Copy Kotlin'}
                </button>
              </div>
              <pre className="text-zinc-300 overflow-x-auto">{retrofitSnippet}</pre>
            </div>
          )}

          {activeSnippetTab === 'curl' && (
            <div className="relative">
              <div className="absolute top-0 right-0">
                <button
                  onClick={() => copyToClipboard(curlSnippet, 'curl')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[11px]"
                >
                  {copiedType === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedType === 'curl' ? 'Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="text-zinc-300 overflow-x-auto">{curlSnippet}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
