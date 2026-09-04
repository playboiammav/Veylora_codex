# Unified Games, Apps & Media Directory / API Integration System

A high-performance, unified Next.js full-stack integration platform and API proxy service uniting **Steam**, **Epic Games EOS**, **GOG**, **Counter-Strike 2 (CS2)**, **Google Play**, **App Store Connect**, **Netflix Streaming**, **PlayStation Network**, and **Xbox Live**.

---

## 1. Installation

```bash
# 1. Clone repository
git clone https://github.com/your-org/unified-game-app-directory.git
cd unified-game-app-directory

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
```

---

## 2. Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Server-side secrets (Never exposed to client/browser)
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"

# Steam API
STEAM_KEY=""
STEAM_API_KEY=""

# Epic Games EOS OAuth
EPIC_CLIENT_ID=""
EPIC_CLIENT_SECRET=""
EPIC_REDIRECT_URI="http://localhost:3000/api/epic/callback"

# Apple App Store Connect (.p8 ES256 Key)
APPLE_KEY_ID=""
APPLE_ISSUER_ID=""
APPLE_PRIVATE_KEY=""
APPLE_PRIVATE_KEY_PATH=""

# Netflix-like Streaming Platform
NETFLIX_API_URL="https://netflix-api-g992.onrender.com"
```

---

## 3. Steam API Setup

1. Obtain your Steam Web API Key from: [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Assign it to `STEAM_KEY` in `.env.local`.
3. Supported features:
   - **Featured Store**: `GET /api/steam/featured?cc=us`
   - **Categories & Specials**: `GET /api/steam/featuredcategories?cc=us&l=english`
   - **Game Details**: `GET /api/steam/game/{appId}?cc=us&l=english` (e.g. `271590` for GTA V, `1245620` for Elden Ring)
   - **Game News**: `GET /api/steam/news/{appId}?count=5`
4. Rate limit protection: Built-in 180 req / 5 min throttler preventing Steam IP bans.

---

## 4. Epic Games OAuth Setup

1. Register an application in the [Epic Games Developer Portal](https://dev.epicgames.com/portal/).
2. Under **Epic Account Services**, configure OAuth permissions (`basic_profile`, `friends_list`).
3. Set your Redirect URI to `https://your-domain/api/epic/callback`.
4. Endpoints:
   - `GET /api/epic/auth`: Returns authorization URL or redirects.
   - `GET /api/epic/callback?code={code}`: Exchanges authorization code for EOS access/refresh tokens.
   - `GET /api/epic/account?accountId={id}`: Fetches account details using `Authorization: Bearer <token>`.

---

## 5. GOG Database & Store Setup

1. Integrated directly via GOG official catalog endpoints (`https://embed.gog.com/games/ajax/filtered` & `https://api.gog.com/products/{id}`).
2. Features:
   - `GET /api/gog?page=1&search=witcher`: Catalog search & DRM-Free filtering.
   - `GET /api/gog/{id}`: Detailed product info, pricing, system requirements.

---

## 6. Counter-Strike 2 (CS2) API Usage

1. Integrated with multi-language CSGO-API (`https://bymykel.github.io/CSGO-API/api/{lang}`).
2. Supported categories:
   - `skins` (`GET /api/cs2/skins?lang=en`)
   - `stickers` (`GET /api/cs2/stickers?lang=en`)
   - `crates` (`GET /api/cs2/crates?lang=en`)
   - `collections` (`GET /api/cs2/collections?lang=en`)
   - `keys` (`GET /api/cs2/keys?lang=en`)
   - `collectibles` (`GET /api/cs2/collectibles?lang=en`)
   - `agents` (`GET /api/cs2/agents?lang=en`)
   - `patches` (`GET /api/cs2/patches?lang=en`)
   - `graffiti` (`GET /api/cs2/graffiti?lang=en`)
   - `music_kits` (`GET /api/cs2/music_kits?lang=en`)
   - `all` (`GET /api/cs2/all?lang=en`)
3. 28 languages supported (`en`, `es-ES`, `de`, `fr`, `zh-CN`, `ja`, `ru`, etc.).

---

## 7. Google Play API Setup

1. Integrated with Node.js Google Play scraper services.
2. Endpoints:
   - `GET /api/google-play/apps?collection=TOP_FREE&country=us`
   - `GET /api/google-play/apps?q=facebook` (Search)
   - `GET /api/google-play/apps?suggest=face` (Suggestions)
   - `GET /api/google-play/apps/{appId}` (App details)
   - `GET /api/google-play/apps/{appId}/permissions` (Permissions)
   - `GET /api/google-play/apps/{appId}/datasafety` (Data Safety)
   - `GET /api/google-play/apps/{appId}/similar` (Similar apps)
   - `GET /api/google-play/apps/{appId}/reviews` (Reviews)
   - `GET /api/google-play/developers/{developer}` (Developer apps)
   - `GET /api/google-play/categories` (Store categories)

---

## 8. App Store Connect Setup

1. Generate an API Key under **Users and Access -> Integrations -> App Store Connect API** on developer.apple.com.
2. Supply `APPLE_KEY_ID`, `APPLE_ISSUER_ID`, and `APPLE_PRIVATE_KEY` (or `.p8` file path).
3. The server signs ES256 JWTs with a 20-minute expiration.
4. Endpoints:
   - `GET /api/app-store-connect/apps`: Apps list
   - `GET /api/app-store-connect/versions?appId={id}`: Versions list
   - `GET /api/app-store-connect/builds?appId={id}`: Builds list
   - `GET /api/app-store-connect/review?appId={id}`: Review & submission status
   - `GET /api/app-store-connect/status`: Connection & credentials status

---

## 9. Netflix-Like Streaming Platform Setup

1. Base API URL configured via `NETFLIX_API_URL` (`https://netflix-api-g992.onrender.com`).
2. Endpoints:
   - `GET /api/netflix/media`: Full catalog
   - `GET /api/netflix/media/{mediaid}`: Media details
   - `GET /api/netflix/media/search/{search}`: Title/description search
   - `GET /api/netflix/media/watchlist/{userid}`: User watchlist
   - `POST /api/netflix/login`: User session login
   - `POST /api/netflix/register`: New user signup
   - `POST /api/netflix/payment`: Subscription handler
   - `POST /api/netflix/media/stream/{mediaid}/{userid}`: Stream token authorization

---

## 10. Running Locally

```bash
# Start development server on port 3000
npm run dev

# Open in browser
http://localhost:3000
```

---

## 11. Running Tests & Linters

```bash
# Run lint check
npm run lint

# Run production build validation
npm run build
```

---

## 12. Complete API Endpoints Reference

| Service | Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **Search** | `GET` | `/api/search?q=query&platform=all` | Universal cross-platform search |
| **Steam** | `GET` | `/api/steam/featured?cc=us` | Featured games |
| **Steam** | `GET` | `/api/steam/featuredcategories?cc=us&l=en` | Categories & specials |
| **Steam** | `GET` | `/api/steam/game/{appId}?cc=us&l=en` | App details & requirements |
| **Steam** | `GET` | `/api/steam/news/{appId}?count=5` | Game news articles |
| **Epic** | `GET` | `/api/epic/auth` | OAuth2 authorization URL |
| **Epic** | `GET` | `/api/epic/callback?code=...` | Code-for-token exchange |
| **Epic** | `GET` | `/api/epic/account?accountId=...` | Account profile info |
| **GOG** | `GET` | `/api/gog?page=1&search=...` | DRM-free catalog search |
| **GOG** | `GET` | `/api/gog/{id}` | Product details |
| **CS2** | `GET` | `/api/cs2/{skins\|stickers\|crates\|...}` | Cosmetic item catalog |
| **Google Play** | `GET` | `/api/google-play/apps?collection=TOP_FREE` | Top apps collection |
| **Google Play** | `GET` | `/api/google-play/apps/{appId}` | App details |
| **Google Play** | `GET` | `/api/google-play/apps/{appId}/permissions`| App permissions |
| **Google Play** | `GET` | `/api/google-play/apps/{appId}/datasafety` | Data safety report |
| **Google Play** | `GET` | `/api/google-play/apps/{appId}/reviews` | User reviews |
| **Apple ASC** | `GET` | `/api/app-store-connect/apps` | App Store Connect apps |
| **Apple ASC** | `GET` | `/api/app-store-connect/versions` | App versions |
| **Apple ASC** | `GET` | `/api/app-store-connect/builds` | TestFlight builds |
| **Netflix** | `GET` | `/api/netflix/media` | Video streaming catalog |
| **Netflix** | `POST` | `/api/netflix/login` | User authentication |
| **Logos** | `GET` | `/api/assets/logos` | Normalized store & platform CDN logos |

---

## 13. Authentication Security

- All API keys (`STEAM_KEY`, `EPIC_CLIENT_SECRET`, `APPLE_PRIVATE_KEY`, etc.) remain **strictly server-side**.
- No credentials or private tokens are leaked to client components or mobile apps.
- OAuth token exchanges and ES256 JWT signing happen inside Node.js server routes.

---

## 14. In-Memory Caching & Rate Limits

- **Steam Details**: Cached for 10 minutes; rate limit throttler protects against Steam 200 req / 5 min thresholds.
- **CS2 Items**: Cached for 1 hour.
- **Google Play Apps**: Cached for 10 minutes.
- **GOG Catalog**: Cached for 5 minutes.
- **Auto-eviction**: Stale entries cleared automatically to keep memory footprint low.

---

## 15. Error Handling & Fallbacks

- Upstream timeouts and network disconnects are caught with `AbortController` (4s timeout).
- If upstream APIs are temporarily down or credentials are unconfigured, routes return structured JSON with helpful error codes and resilient fallback schemas rather than crashing.

---

## 16. Production Deployment

The project builds cleanly for containerized Cloud Run / Next.js production deployments:

```bash
npm run build
npm start
```
