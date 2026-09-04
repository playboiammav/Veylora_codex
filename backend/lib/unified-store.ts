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
  id: 'guest',
  username: 'Guest',
  displayName: 'Guest User',
  avatar: '',
  bio: '',
  level: 1,
  xp: 0,
  xpNextLevel: 1000,
  gamesPlayedCount: 0,
  moviesWatchedCount: 0,
  watchlistCount: 0,
  friendsCount: 0,
  linkedAccounts: {
    steam: { connected: false },
    playstation: { connected: false },
    xbox: { connected: false },
    netflix: { connected: false },
  },
};

const INITIAL_FRIENDS: FriendActivity[] = [];

const INITIAL_WATCHLIST: WatchlistItem[] = [];

export const useUnifiedStore = create<UnifiedStoreState>()(
  persist(
    (set, get) => ({
      activeMediaType: 'games',
      setActiveMediaType: (type) => set({ activeMediaType: type }),

      activeNavTab: 'home',
      setActiveNavTab: (tab) => set({ activeNavTab: tab }),

      isAuthenticated: false,
      showAuthModal: false,
      setShowAuthModal: (show) => set({ showAuthModal: show }),
      loginWithGoogle: () => {
        set({
          isAuthenticated: true,
          showAuthModal: false,
          userProfile: {
            ...get().userProfile,
            username: 'Google User',
            displayName: 'Google User',
          },
        });
      },
      loginWithEmail: (email: string) => {
        const usernamePart = email.split('@')[0] || 'User';
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
