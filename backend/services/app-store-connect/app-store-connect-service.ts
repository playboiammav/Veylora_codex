import jwt from 'jsonwebtoken';
import fs from 'fs';

export interface AppStoreConnectCredentials {
  keyId?: string;
  issuerId?: string;
  privateKey?: string;
  privateKeyPath?: string;
}

export interface AppStoreAppItem {
  id: string;
  name: string;
  bundleId: string;
  sku: string;
  primaryLocale: string;
  platform: 'IOS' | 'MAC_OS' | 'TV_OS' | 'VISION_OS';
  appStoreVersions?: { versionString: string; appStoreState: string }[];
  iconUrl?: string;
}

export class AppStoreConnectService {
  private static getCredentials(): AppStoreConnectCredentials {
    return {
      keyId: process.env.APPLE_KEY_ID,
      issuerId: process.env.APPLE_ISSUER_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH,
    };
  }

  /**
   * Generates an ES256 JWT Token for App Store Connect REST API
   */
  static generateToken(): string {
    const creds = this.getCredentials();
    if (!creds.keyId || !creds.issuerId) {
      throw new Error('SERVICE_NOT_CONFIGURED: App Store Connect API is not configured on the backend server.');
    }

    let privateKey = creds.privateKey;
    if (!privateKey && creds.privateKeyPath && fs.existsSync(creds.privateKeyPath)) {
      privateKey = fs.readFileSync(creds.privateKeyPath, 'utf-8');
    }

    if (!privateKey) {
      throw new Error('SERVICE_NOT_CONFIGURED: App Store Connect private key is not configured on the backend server.');
    }

    // Clean private key formatting if passed via single-line env
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

    const payload = {
      iss: creds.issuerId,
      exp: Math.floor(Date.now() / 1000) + 20 * 60, // 20 min expiration
      aud: 'appstoreconnect-v1',
    };

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: creds.keyId,
        typ: 'JWT',
      },
    });
  }

  /**
   * Lists apps from App Store Connect API
   */
  static async listApps(): Promise<{ success: boolean; data: AppStoreAppItem[]; source: 'live' | 'sample' }> {
    try {
      const token = this.generateToken();
      const res = await fetch('https://api.appstoreconnect.apple.com/v1/apps?limit=30&include=appStoreVersions', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`App Store Connect API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const apps: AppStoreAppItem[] = (json.data || []).map((a: any) => ({
        id: a.id,
        name: a.attributes?.name || 'iOS App',
        bundleId: a.attributes?.bundleId || '',
        sku: a.attributes?.sku || '',
        primaryLocale: a.attributes?.primaryLocale || 'en-US',
        platform: 'IOS',
      }));

      return { success: true, data: apps, source: 'live' };
    } catch {
      return {
        success: false,
        source: 'live',
        data: [],
      };
    }
  }

  /**
   * App versions list
   */
  static async listVersions(appId: string) {
    try {
      const token = this.generateToken();
      const res = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${encodeURIComponent(appId)}/appStoreVersions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch {
      return {
        data: [],
      };
    }
  }

  /**
   * Builds list
   */
  static async listBuilds(appId?: string) {
    try {
      const token = this.generateToken();
      const url = appId
        ? `https://api.appstoreconnect.apple.com/v1/builds?filter[app]=${encodeURIComponent(appId)}`
        : 'https://api.appstoreconnect.apple.com/v1/builds?limit=10';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return await res.json();
    } catch {
      return {
        data: [],
      };
    }
  }

  /**
   * Review status / Validation summary
   */
  static async getReviewStatus(appId: string) {
    try {
      const token = this.generateToken();
      const res = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${encodeURIComponent(appId)}/appStoreVersionSubmissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback below
    }
    return {
      appId,
      status: 'UNAVAILABLE',
      data: null,
    };
  }
}
