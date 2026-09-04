export interface PcRequirementsDetail {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  vram?: string;
  directx?: string;
  storage?: string;
  additionalNotes?: string;
}

export interface PcRequirements {
  minimum?: PcRequirementsDetail;
  recommended?: PcRequirementsDetail;
}

export interface GameEdition {
  id: string;
  name: string;
  editionType: 'STANDARD' | 'DELUXE' | 'ULTIMATE' | 'PREMIUM' | 'GOLD' | 'COMPLETE' | 'OTHER';
  price: {
    formattedBasePrice?: string;
    formattedDiscountedPrice: string;
    discountPercentage?: number;
    isFree?: boolean;
  };
  originalPrice?: string;
  discountPercentage?: number;
  currency?: string;
  isFree?: boolean;
  storeUrl?: string;
  platform: 'PlayStation' | 'Xbox' | 'PC' | 'Cross-Platform';
}

export interface StoreLink {
  storeId: 'playstation_store' | 'xbox_store' | 'steam' | 'epic_games' | 'gog' | 'ea_app' | 'ubisoft_connect' | 'battlenet' | 'nintendo_eshop' | 'microsoft_store';
  name: string;
  url: string;
  color: string;
  logo: string;
  price?: string;
}

export interface GameItem {
  id: string;
  title: string;
  platform: 'PlayStation' | 'Xbox' | 'PC' | 'Cross-Platform';
  supportedHardware: string[]; // Hardware only: e.g. ['ps5', 'ps4', 'xbox_series', 'xbox_one', 'pc', 'mac']
  genres?: string[];
  coverImage: string;
  bannerImage?: string;
  price: {
    formattedBasePrice?: string;
    formattedDiscountedPrice?: string;
    discountPercentage?: number;
    isFree?: boolean;
  };
  rating?: number;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  description?: string;
  storeUrl?: string;
  officialStores?: StoreLink[];
  editions?: GameEdition[];
  pcRequirements?: PcRequirements;
  badges?: string[];
  videoUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  source: 'live' | 'cache' | 'fallback' | 'cached-resilient';
  endpoint: string;
  timestamp: string;
  count: number;
  data: T;
  raw?: any;
}
