export interface EpicOAuthConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface EpicTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  refresh_token?: string;
  refresh_expires_in?: number;
  account_id?: string;
  client_id?: string;
  application_id?: string;
  scope?: string;
}

export interface EpicAccountInfo {
  accountId: string;
  displayName: string;
  preferredLanguage?: string;
  country?: string;
  linkedAccounts?: { identityProviderId: string; displayName: string }[];
}

export class EpicService {
  private static getConfig(): EpicOAuthConfig {
    return {
      clientId: process.env.EPIC_CLIENT_ID,
      clientSecret: process.env.EPIC_CLIENT_SECRET,
      redirectUri: process.env.EPIC_REDIRECT_URI || 'http://localhost:3000/api/epic/callback',
    };
  }

  /**
   * Generates the Epic Games EOS OAuth2 Authorization URL
   */
  static getAuthorizationUrl(state?: string, scope: string = 'basic_profile'): string {
    const config = this.getConfig();
    const clientId = config.clientId || '';
    if (!clientId) {
      throw new Error('SERVICE_NOT_CONFIGURED: EPIC_CLIENT_ID is not configured on the backend server.');
    }
    const redirectUri = encodeURIComponent(config.redirectUri || '');
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
    return `https://www.epicgames.com/id/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${redirectUri}${stateParam}`;
  }

  /**
   * Exchanges authorization code for an Epic EOS access token
   */
  static async exchangeCodeForToken(code: string): Promise<EpicTokenResponse> {
    const config = this.getConfig();
    if (!config.clientId || !config.clientSecret) {
      throw new Error('SERVICE_NOT_CONFIGURED: Epic Games OAuth service is not configured on the backend server.');
    }

    const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', config.redirectUri || '');

    const res = await fetch('https://api.epicgames.dev/epic/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Epic OAuth token exchange failed (HTTP ${res.status}): ${errBody}`);
    }

    return await res.json();
  }

  /**
   * Refreshes an Epic EOS access token using a refresh token
   */
  static async refreshToken(refreshToken: string): Promise<EpicTokenResponse> {
    const config = this.getConfig();
    if (!config.clientId || !config.clientSecret) {
      throw new Error('SERVICE_NOT_CONFIGURED: Epic Games OAuth service is not configured on the backend server.');
    }

    const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const res = await fetch('https://api.epicgames.dev/epic/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Epic token refresh failed (HTTP ${res.status}): ${errBody}`);
    }

    return await res.json();
  }

  /**
   * Retrieves basic account profile from Epic EOS REST services
   */
  static async getAccountInfo(accessToken: string, accountId: string): Promise<EpicAccountInfo> {
    const res = await fetch(`https://api.epicgames.dev/epic/id/v1/accounts?accountId=${encodeURIComponent(accountId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Epic account lookup failed (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    const account = Array.isArray(data) ? data[0] : data;
    return {
      accountId: account.accountId || accountId,
      displayName: account.displayName || 'Epic User',
      preferredLanguage: account.preferredLanguage,
      country: account.country,
      linkedAccounts: account.linkedAccounts,
    };
  }
}
