/**
 * Centralized API Configuration for Android and Web clients.
 * This URL must be used for all PlayStation, Xbox, Edition, and Asset/Logo API requests.
 */
export const PRICE_API_BASE_URL = 
  process.env.NEXT_PUBLIC_PRICE_API_BASE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-oi34e4dhfwkni5arkpizws-228330439328.europe-west3.run.app');

export const API_ENDPOINTS = {
  PLAYSTATION_GAMES: `${PRICE_API_BASE_URL}/api/playstation`,
  PLAYSTATION_EDITIONS: `${PRICE_API_BASE_URL}/api/playstation/editions`,
  XBOX_GAMES: `${PRICE_API_BASE_URL}/api/xbox`,
  XBOX_EDITIONS: `${PRICE_API_BASE_URL}/api/xbox/editions`,
  STEAM_GAMES: `${PRICE_API_BASE_URL}/api/steam`,
  STEAM_EDITIONS: `${PRICE_API_BASE_URL}/api/steam/editions`,
  RAWG_GAMES: `${PRICE_API_BASE_URL}/api/rawg/games`,
  GOG_GAMES: `${PRICE_API_BASE_URL}/api/gog`,
  CS2_ITEMS: `${PRICE_API_BASE_URL}/api/cs2/skins`,
  GOOGLE_PLAY: `${PRICE_API_BASE_URL}/api/google-play/apps`,
  APPLE_APPS: `${PRICE_API_BASE_URL}/api/app-store-connect/apps`,
  NETFLIX_MEDIA: `${PRICE_API_BASE_URL}/api/netflix/media`,
  UNIFIED_SEARCH: `${PRICE_API_BASE_URL}/api/search`,
  LOGOS: `${PRICE_API_BASE_URL}/api/assets/logos`,
};
