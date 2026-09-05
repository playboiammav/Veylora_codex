export interface NormalizedStoreLink {
  storeId: string;
  name: string;
  url: string;
  icon?: string;
  price?: string;
  originalPrice?: string;
  discountPercent?: number;
}

export interface NormalizedGameEdition {
  id: string;
  name: string;
  editionType: 'STANDARD' | 'DELUXE' | 'PREMIUM' | 'GOLD' | 'ULTIMATE' | 'COMPLETE' | 'OTHER';
  price?: {
    formattedBasePrice?: string;
    formattedDiscountedPrice?: string;
    discountPercentage?: number;
    amount?: number;
    currency?: string;
    isFree?: boolean;
  };
  originalPrice?: string;
  discountPercentage?: number;
  store?: string;
  platform?: string;
  url?: string;
}

export interface NormalizedSystemRequirement {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  vram?: string;
  storage?: string;
  directx?: string;
  vulkan?: string;
  opengl?: string;
  additionalNotes?: string;
}

export interface NormalizedGame {
  id: string;
  slug?: string;
  title: string;
  cover: string;
  backdrop: string;
  rating: number;
  metacritic?: number;
  ratingsCount?: number;
  releaseDate: string;
  releaseYear?: string;
  platforms: string[]; // e.g. ['PC', 'PS5', 'Xbox Series X', 'Nintendo Switch']
  hardwareBadges: string[]; // e.g. ['ps5', 'xbox_series', 'pc']
  genres: string[];
  developer?: string;
  publisher?: string;
  description: string;
  shortDescription?: string;
  screenshots: string[];
  trailers?: { id: string; name: string; videoUrl: string; previewImage?: string }[];
  stores: NormalizedStoreLink[];
  editions?: NormalizedGameEdition[];
  systemRequirements?: {
    minimum?: NormalizedSystemRequirement;
    recommended?: NormalizedSystemRequirement;
    macMinimum?: NormalizedSystemRequirement;
    macRecommended?: NormalizedSystemRequirement;
    linuxMinimum?: NormalizedSystemRequirement;
    linuxRecommended?: NormalizedSystemRequirement;
  };
  publishersList?: { id: number; name: string; slug?: string; imageBackground?: string; imageUrl?: string }[];
  developersList?: { id: number; name: string; slug?: string; imageBackground?: string; imageUrl?: string }[];
  website?: string;
  steamAppId?: number;
  steamUrl?: string;
  isUpcoming?: boolean;
  isTrending?: boolean;
  rank?: number;
  playtime?: number;
  dominantColor?: string;
  saturatedColor?: string;
  rawRequirements?: {
    minimum?: string;
    recommended?: string;
    macMinimum?: string;
    macRecommended?: string;
    linuxMinimum?: string;
    linuxRecommended?: string;
  };
}

export interface NormalizedCastMember {
  id: number | string;
  imdbId?: string;
  name: string;
  character: string;
  profileImage: string | null;
}

export interface MovieRatingSource {
  source: string; // 'IMDb' | 'Metacritic' | 'Rotten Tomatoes' | 'TMDB' | 'TV.com'
  score: string;
  scoreValue?: number;
  maxScore?: string;
  votes?: number;
  percentage?: number;
}

export interface MovieReviewItem {
  id: string;
  author: string;
  title?: string;
  content: string;
  date?: string;
  rating?: number;
  source: 'IMDb' | 'Metacritic' | 'TMDB';
  url?: string;
}

export interface MovieAwardItem {
  awardTitle: string;
  eventName?: string;
  category?: string;
  forYear?: string;
  isWinner?: boolean;
  description?: string;
}

export interface NormalizedMovie {
  id: string;
  tmdbId?: string | number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  poster: string;
  backdrop: string;
  rating: number;
  voteCount?: number;
  imdbRating?: number;
  metacriticRating?: number;
  rottenTomatoesRating?: number;
  ratingsList?: MovieRatingSource[];
  releaseDate: string;
  releaseYear?: string;
  genres: string[];
  overview: string;
  tagline?: string;
  runtime?: number; // in minutes
  formattedRuntime?: string;
  contentRating?: string;
  cast: NormalizedCastMember[];
  director?: string;
  directors?: string[];
  writers?: string[];
  stars?: string[];
  companies?: { id: string | number; name: string; logo?: string; country?: string }[];
  trailers: { id: string; name: string; key: string; site: string; type: string; url?: string }[];
  images: string[];
  posters?: string[];
  similar?: { id: string; title: string; poster: string; rating: number; releaseYear?: string }[];
  reviews?: MovieReviewItem[];
  awardsSummary?: string;
  awards?: MovieAwardItem[];
  wikipedia?: {
    plotShort?: string;
    plotFull?: string;
    url?: string;
    title?: string;
  };
  externalSites?: { name: string; url: string; category?: string }[];
  boxOffice?: {
    budget?: string;
    grossWorldwide?: string;
    openingWeekend?: string;
    cumulativeWorldwideGross?: string;
  };
  status?: string;
  budget?: string;
  revenue?: string;
  isSeries?: boolean;
  mediaType?: 'movie' | 'tv' | 'episode';
  seasons?: { seasonNumber: number; episodeCount?: number; episodes?: any[] }[];
  streamingLinks?: { name: string; url: string; logo?: string }[];
  watchProviders?: { id: number; name: string; logoUrl?: string }[];
  crew?: NormalizedCastMember[];
  posterPath?: string;
  backdropPath?: string;
  popularity?: number;
  isTrending?: boolean;
  isFeatured?: boolean;
}

export interface NormalizedPerson {
  id: string;
  imdbId?: string;
  tmdbId?: string | number;
  name: string;
  role?: string;
  photo: string | null;
  biography: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  height?: string;
  popularity?: number;
  awardsSummary?: string;
  awards?: MovieAwardItem[];
  knownFor: {
    id: string;
    title: string;
    year?: string;
    role?: string;
    poster?: string;
    rating?: number;
    type?: 'movie' | 'tv';
  }[];
  filmography: {
    id: string;
    title: string;
    year?: string;
    role?: string;
    character?: string;
    job?: string;
    rating?: number;
    type?: 'movie' | 'tv';
    poster?: string;
  }[];
  externalSites?: { name: string; url: string }[];
}

export interface NormalizedCompany {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  imageUrl?: string;
  imageBackground?: string;
  country?: string;
  headquarters?: string;
  website?: string;
  gamesCount?: number;
  type?: 'production' | 'developer' | 'publisher' | 'distributor';
  movies?: {
    id: string;
    title: string;
    year?: string;
    poster?: string;
    rating?: number;
  }[];
}

export interface WatchlistItem {
  id: string;
  type: 'game' | 'movie';
  title: string;
  image: string;
  rating: number;
  releaseYear: string;
  genres: string[];
  addedAt: string;
  platforms?: string[];
  runtime?: string;
}

export interface FriendActivity {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  status: 'online' | 'in-game' | 'watching' | 'offline';
  currentActivity?: {
    type: 'game' | 'movie';
    title: string;
    image: string;
    details?: string;
  };
  lastSeen?: string;
  mutualFriends?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  gamesPlayedCount: number;
  moviesWatchedCount: number;
  watchlistCount: number;
  friendsCount: number;
  linkedAccounts: {
    steam?: { connected: boolean; username?: string };
    playstation?: { connected: boolean; username?: string };
    xbox?: { connected: boolean; username?: string };
    netflix?: { connected: boolean; email?: string };
  };
}

export interface GpuDevice {
  id: string;
  name: string;
  vendor: string | null;
  manufacturer: string | null;
  architecture: string | null;
  generation: string | null;
  releaseDate: string | null;
  vram: number | null;
  memoryType: string | null;
  memoryBus: number | null;
  memoryBandwidth: number | null;
  baseClock: number | null;
  boostClock: number | null;
  fp32: number | null;
  directX: string | null;
  openGL: string | null;
  vulkan: string | null;
  sourceUrl: string | null;
  gpuName?: string | null;
}

export interface GpuPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GpuSearchResponse {
  query: string;
  results: GpuDevice[];
  pagination: GpuPagination;
  source: 'real';
}

export interface GpuDetailResponse {
  gpu: GpuDevice;
  source: 'real';
}

export interface CpuDevice {
  id: string;
  name: string;
  manufacturer: string;
  family: string | null;
  generation: string | null;
  architecture: string | null;
  cores: number | null;
  threads: number | null;
  baseClock: number | null;
  boostClock: number | null;
  cache: string | null;
  integratedGpu: string | null;
  releaseDate: string | null;
  sourceUrl: string | null;

  // useful provenance/details
  partNumber?: string | null;
  microarchitecture?: string | null;
  socket?: string | null;
  processSize?: string | null;
  isa?: string | null;
  instructionSet?: string | null;
  l1Cache?: string | null;
  l2Cache?: string | null;
  l3Cache?: string | null;
  power?: string | null;
  sourceReferences?: string[];
  provenance?: string | null;
  isLegacy?: boolean | null;
  augmentedFields?: string[] | null;
  aliasIds?: string[] | null;
  memoryTypes?: string | null;
  maxMemorySize?: string | null;
}

export interface CpuPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CpuSearchResponse {
  total: number;
  page: number;
  pageSize: number;
  results: CpuDevice[];
}

export interface CpuDetailResponse {
  cpu: CpuDevice;
  source: 'real';
}

