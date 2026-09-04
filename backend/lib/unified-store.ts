import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WatchlistItem, UserProfile, FriendActivity } from './normalized-types';

interface UnifiedStoreState {
  // Navigation & UI State
  activeMediaType: 'games' | 'movies';
  setActiveMediaType: (type: 'games' | 'movies') => void;
  activeNavTab: 'home' | 'search' | 'watchlist' | 'friends' | 'profile';
  setActiveNavTab: (tab: 'home' | 'search' | 'watchlist' | 'friends' | 'profile') => void;
  
  // Auth State
  isAuthenticated: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string) => void;
  logout: () => void;

  // Watchlist / Favorites (Gamelist)
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string, type: 'game' | 'movie') => void;
  isInWatchlist: (id: string, type: 'game' | 'movie') => boolean;
  toggleWatchlist: (item: WatchlistItem) => boolean;

  // Friends & Social
  friends: FriendActivity[];
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Notifications / Settings
  settings: {
    theme: 'dark';
    compactMode: boolean;
    autoPlayTrailers: boolean;
    notificationsEnabled: boolean;
  };
  updateSettings: (newSettings: Partial<UnifiedStoreState['settings']>) => void;
}

const INITIAL_PROFILE: UserProfile = {
  id: 'user-001',
  username: 'Playboi',
  displayName: 'Playboi',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Hardcore gamer & cinephile. Exploring PlayStation, Steam, and IMAX cinema on Veylora.',
  level: 42,
  xp: 18450,
  xpNextLevel: 20000,
  gamesPlayedCount: 128,
  moviesWatchedCount: 342,
  watchlistCount: 14,
  friendsCount: 28,
  linkedAccounts: {
    steam: { connected: true, username: 'Playboi_Steam' },
    playstation: { connected: true, username: 'Playboi_PSN' },
    xbox: { connected: false },
    netflix: { connected: true, email: 'playboi@veylora.com' },
  },
};

const INITIAL_FRIENDS: FriendActivity[] = [
  {
    id: 'f1',
    friendId: 'user-101',
    friendName: 'Marcus Vance',
    friendAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'in-game',
    currentActivity: {
      type: 'game',
      title: 'Grand Theft Auto V',
      image: 'https://media.rawg.io/media/games/20a/20aa03a10e7208d85100d0f9f164322f.jpg',
      details: 'Heist in progress (Los Santos)',
    },
    mutualFriends: 12,
  },
  {
    id: 'f2',
    friendId: 'user-102',
    friendName: 'Elena Rostova',
    friendAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'watching',
    currentActivity: {
      type: 'movie',
      title: 'Dune: Part Two',
      image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      details: 'Watching in 4K HDR',
    },
    mutualFriends: 8,
  },
  {
    id: 'f3',
    friendId: 'user-103',
    friendName: 'Kaito Tanaka',
    friendAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'in-game',
    currentActivity: {
      type: 'game',
      title: 'Cyberpunk 2077',
      image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c424de0f.jpg',
      details: 'Night City • Phantom Liberty',
    },
    mutualFriends: 5,
  },
  {
    id: 'f4',
    friendId: 'user-104',
    friendName: 'Sarah Jenkins',
    friendAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    currentActivity: {
      type: 'movie',
      title: 'Interstellar',
      image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      details: 'Recently Added to Watchlist',
    },
    lastSeen: '10m ago',
    mutualFriends: 14,
  },
  {
    id: 'f5',
    friendId: 'user-105',
    friendName: 'Liam O\'Connor',
    friendAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    lastSeen: '2h ago',
    mutualFriends: 3,
  },
];

const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    id: '3498',
    type: 'game',
    title: 'Grand Theft Auto V',
    image: 'https://media.rawg.io/media/games/20a/20aa03a10e7208d85100d0f9f164322f.jpg',
    rating: 4.8,
    releaseYear: '2013',
    genres: ['Action', 'Open World'],
    addedAt: '2024-03-01',
    platforms: ['PC', 'PS5', 'Xbox Series'],
  },
  {
    id: '693134',
    type: 'movie',
    title: 'Dune: Part Two',
    image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: 8.3,
    releaseYear: '2024',
    genres: ['Sci-Fi', 'Adventure'],
    addedAt: '2024-03-02',
    runtime: '2h 46m',
  },
];

export const useUnifiedStore = create<UnifiedStoreState>()(
  persist(
    (set, get) => ({
      activeMediaType: 'games',
      setActiveMediaType: (type) => set({ activeMediaType: type }),

      activeNavTab: 'home',
      setActiveNavTab: (tab) => set({ activeNavTab: tab }),

      isAuthenticated: true,
      showAuthModal: false,
      setShowAuthModal: (show) => set({ showAuthModal: show }),
      loginWithGoogle: () => {
        set({
          isAuthenticated: true,
          showAuthModal: false,
          userProfile: {
            ...get().userProfile,
            username: 'Playboi',
            displayName: 'Playboi',
          },
        });
      },
      loginWithEmail: (email: string) => {
        const usernamePart = email.split('@')[0] || 'Playboi';
        const formattedName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);
        set({
          isAuthenticated: true,
          showAuthModal: false,
          userProfile: {
            ...get().userProfile,
            username: formattedName,
            displayName: formattedName,
          },
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
        });
      },

      watchlist: INITIAL_WATCHLIST,
      addToWatchlist: (item) => {
        const current = get().watchlist;
        if (!current.some((w) => w.id === item.id && w.type === item.type)) {
          const updated = [item, ...current];
          set({
            watchlist: updated,
            userProfile: {
              ...get().userProfile,
              watchlistCount: updated.length,
            },
          });
        }
      },
      removeFromWatchlist: (id, type) => {
        const updated = get().watchlist.filter((w) => !(w.id === id && w.type === type));
        set({
          watchlist: updated,
          userProfile: {
            ...get().userProfile,
            watchlistCount: updated.length,
          },
        });
      },
      isInWatchlist: (id, type) => {
        return get().watchlist.some((w) => w.id === id && w.type === type);
      },
      toggleWatchlist: (item) => {
        const exists = get().isInWatchlist(item.id, item.type);
        if (exists) {
          get().removeFromWatchlist(item.id, item.type);
          return false;
        } else {
          get().addToWatchlist(item);
          return true;
        }
      },

      friends: INITIAL_FRIENDS,
      userProfile: INITIAL_PROFILE,
      updateProfile: (profileUpdates) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profileUpdates } })),

      settings: {
        theme: 'dark',
        compactMode: false,
        autoPlayTrailers: true,
        notificationsEnabled: true,
      },
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
    }),
    {
      name: 'veylora_app_store_v1',
      partialize: (state) => ({
        watchlist: state.watchlist,
        userProfile: state.userProfile,
        settings: state.settings,
        activeMediaType: state.activeMediaType,
      }),
    }
  )
);

export function cleanHtmlRequirements(html?: string): string | undefined {
  if (!html) return undefined;
  const clean = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  return clean || undefined;
}

export function formatCurrencyPrice(amountCents: number, currency: string = 'USD'): string {
  if (amountCents === 0) return 'Free to Play';
  const amount = (amountCents / 100).toFixed(2);
  if (currency === 'EUR') return `€${amount}`;
  if (currency === 'GBP') return `£${amount}`;
  return `$${amount}`;
}

export function categorizeEditionType(name: string): 'STANDARD' | 'DELUXE' | 'PREMIUM' | 'GOLD' | 'ULTIMATE' | 'COMPLETE' | 'OTHER' {
  const upper = name.toUpperCase();
  if (upper.includes('DELUXE')) return 'DELUXE';
  if (upper.includes('PREMIUM')) return 'PREMIUM';
  if (upper.includes('GOLD')) return 'GOLD';
  if (upper.includes('ULTIMATE')) return 'ULTIMATE';
  if (upper.includes('COMPLETE') || upper.includes('GOTY')) return 'COMPLETE';
  return 'STANDARD';
}
