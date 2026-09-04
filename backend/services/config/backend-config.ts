/**
 * Centralized Backend Configuration
 * 
 * Provides safe, server-only access to platform API credentials.
 * Secrets are never exposed to the client or frontend UI.
 */

export interface BackendConfig {
  steam: {
    apiKey: string | undefined;
    isConfigured: boolean;
  };
  epic: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    redirectUri: string;
    isConfigured: boolean;
  };
  apple: {
    keyId: string | undefined;
    issuerId: string | undefined;
    hasPrivateKey: boolean;
    isConfigured: boolean;
  };
  netflix: {
    apiUrl: string;
  };
  rawg: {
    apiKey: string;
    isConfigured: boolean;
  };
}

export function getBackendConfig(): BackendConfig {
  const steamKey = process.env.STEAM_KEY || process.env.STEAM_API_KEY;
  const epicClientId = process.env.EPIC_CLIENT_ID;
  const epicClientSecret = process.env.EPIC_CLIENT_SECRET;
  const epicRedirectUri = process.env.EPIC_REDIRECT_URI || 'http://localhost:3000/api/epic/callback';

  const appleKeyId = process.env.APPLE_KEY_ID;
  const appleIssuerId = process.env.APPLE_ISSUER_ID;
  const applePrivateKey = process.env.APPLE_PRIVATE_KEY || process.env.APPLE_PRIVATE_KEY_PATH;

  const netflixApiUrl = process.env.NETFLIX_API_URL || 'https://netflix-api-g992.onrender.com';

  const rawgApiKey = process.env.RAWG_API_KEY || '';

  return {
    steam: {
      apiKey: steamKey,
      isConfigured: Boolean(steamKey),
    },
    epic: {
      clientId: epicClientId,
      clientSecret: epicClientSecret,
      redirectUri: epicRedirectUri,
      isConfigured: Boolean(epicClientId && epicClientSecret),
    },
    apple: {
      keyId: appleKeyId,
      issuerId: appleIssuerId,
      hasPrivateKey: Boolean(applePrivateKey),
      isConfigured: Boolean(appleKeyId && appleIssuerId && applePrivateKey),
    },
    netflix: {
      apiUrl: netflixApiUrl,
    },
    rawg: {
      apiKey: rawgApiKey,
      isConfigured: Boolean(rawgApiKey),
    },
  };
}
