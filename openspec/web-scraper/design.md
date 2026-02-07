# Web Scraper - Design Document

## Overview

The web scraper is the core data-collection infrastructure for WorkPlace Budgeting. It powers the food cost, rent cost, and transport cost estimates that feed into the user's expense dashboard. Because the app is launched in Kenya (Nairobi first), the scraper targets Kenyan property portals, cost-of-living databases, and restaurant/food aggregators.

The scraper runs as **Convex scheduled actions** that delegate browser automation to **BrowserBase** (browserbase.com) -- a cloud-hosted, serverless Playwright environment with built-in captcha solving, residential proxies, and stealth/anti-fingerprinting. Results are cached in Convex DB so live scraping only happens when cached data expires.

---

## Approach

### High-Level Flow

```
User submits salary form
        |
        v
Convex query checks cache (scraped_data table)
        |
   [cache hit?] --yes--> return cached data
        |
       no
        |
        v
Convex action enqueues scraping job
        |
        v
BrowserBase session spins up a Playwright browser
        |
        v
Playwright script navigates target site, extracts data
        |
        v
Parsed results written to scraped_data table (cache)
        |
        v
Client receives data via Convex reactive query
```

### Why BrowserBase

- **Serverless browsers**: No need to run headless Chrome on our own infra. Each scraping job spins up an isolated browser session in the cloud.
- **Anti-bot defences**: BrowserBase provides residential proxies, browser fingerprint rotation, and automatic captcha solving. Kenyan property sites (BuyRentKenya, Property24) increasingly use Cloudflare and reCAPTCHA.
- **Session-based pricing**: We pay per browser session, not per month. This aligns with our usage pattern -- scraping only happens when cache expires (every 14-30 days per area).
- **Playwright-native**: We write standard Playwright scripts. BrowserBase just hosts the browser and connects over CDP (Chrome DevTools Protocol).

---

## BrowserBase Integration

### SDK Setup

```typescript
import { Browserbase } from "@browserbasehq/sdk";
import { chromium } from "playwright-core";

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

async function createSession() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    proxies: true, // enable residential proxies
  });

  const browser = await chromium.connectOverCDP(session.connectUrl);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  return { session, browser, page };
}
```

### Environment Variables

| Variable | Description |
|---|---|
| `BROWSERBASE_API_KEY` | API key from browserbase.com dashboard |
| `BROWSERBASE_PROJECT_ID` | Project identifier for session grouping |
| `GOOGLE_PLACES_API_KEY` | Google Places API key (for restaurant data) |

These are stored as Convex environment variables (`npx convex env set`).

---

## Convex Actions and Scheduling

Scraping is CPU/network-intensive and non-deterministic, so it runs in **Convex actions** (not queries or mutations). Convex actions can call external APIs and have no transaction constraints.

### Scheduling Strategy

1. **On-demand**: When a user submits the salary form and no cached data exists for the requested area, a Convex action is scheduled immediately.
2. **Periodic refresh**: A Convex cron job runs daily to check for cache entries expiring within 2 days and pre-emptively refreshes them.
3. **Manual trigger**: An admin endpoint allows force-refreshing data for a specific area.

### Action Structure

Each data type has its own scraper action:

- `actions/scrapeRent.ts` -- Scrapes BuyRentKenya and Property24 for rental prices in a given area.
- `actions/scrapeFood.ts` -- Uses Google Places API to find restaurants near a location, then scrapes Numbeo for meal cost indices.
- `actions/scrapeTransport.ts` -- Scrapes Numbeo for transport costs, and uses Google Maps Distance Matrix API (or scrapes fare data) for matatu/bus/fuel estimates.

Each action follows the same pattern:

```typescript
// Pseudocode for a scraper action
export const scrapeRent = action({
  args: { area: v.string() },
  handler: async (ctx, { area }) => {
    // 1. Check if fresh cache exists
    const cached = await ctx.runQuery(internal.scraperCache.get, {
      area,
      data_type: "rent",
    });
    if (cached && cached.expires_at > Date.now()) {
      return cached.data;
    }

    // 2. Run BrowserBase scraping
    let data;
    try {
      data = await scrapeBuyRentKenya(area);
    } catch (err) {
      // 3. Fallback to hardcoded data
      data = getFallbackRentData(area);
    }

    // 4. Write to cache
    await ctx.runMutation(internal.scraperCache.upsert, {
      area,
      data_type: "rent",
      data,
      source: "buyrentkenya.com",
      scraped_at: Date.now(),
      expires_at: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
    });

    return data;
  },
});
```

---

## Target Sites and Data Extraction

### Rent Data

| Source | URL Pattern | Data Extracted |
|---|---|---|
| BuyRentKenya | `buyrentkenya.com/rentals/{area}` | Listing prices for bedsitters, 1BR, 2BR apartments |
| Property24 Kenya | `property24.co.ke/to-rent/in-{area}` | Listing prices, area averages |

**Extraction approach**: Navigate to the listings page, wait for results to load, then use Playwright selectors to extract price values from listing cards. Compute median and average from the first 20-30 listings.

### Food Data

| Source | URL Pattern | Data Extracted |
|---|---|---|
| Numbeo | `numbeo.com/cost-of-living/in/Nairobi` | Meal at inexpensive restaurant, mid-range restaurant, fast food combo |
| Google Places API | `maps.googleapis.com/maps/api/place/nearbysearch` | Restaurant price levels near the company location |

**Extraction approach**: For Numbeo, scrape the cost-of-living table directly. For Google Places, use the REST API (no browser needed) to get `price_level` ratings of nearby restaurants, then map price levels to estimated daily food costs.

### Transport Data

| Source | URL Pattern | Data Extracted |
|---|---|---|
| Numbeo | `numbeo.com/cost-of-living/in/Nairobi` | Monthly bus pass, taxi per km, fuel per litre |
| Google Maps Distance Matrix API | REST API | Distance between home and company in km |

**Extraction approach**: Get the distance from home to work via the Distance Matrix API, then multiply by Numbeo/fallback cost-per-km for matatu, personal car, or ride-hail. Present daily and monthly estimates.

---

## Caching Strategy

### Convex Table: `scraped_data`

```typescript
type ScrapedData = {
  area: string;           // e.g. "juja", "westlands", "kilimani"
  data_type: "rent" | "food" | "transport";
  data: Record<string, number>;  // e.g. { bedsitter: 8000, one_br: 15000, two_br: 25000 }
  source: string;         // e.g. "buyrentkenya.com"
  scraped_at: number;     // Unix timestamp ms
  expires_at: number;     // Unix timestamp ms
}
```

### Cache Durations

| Data Type | TTL | Rationale |
|---|---|---|
| Rent | 30 days | Rental prices change slowly; monthly refresh is sufficient |
| Food | 14 days | Restaurant prices fluctuate more, especially with inflation |
| Transport | 21 days | Fuel prices change bi-weekly in Kenya (ERC reviews) |

### Cache Lookup

Before any scraping action runs, it checks the `scraped_data` table for a non-expired entry matching `(area, data_type)`. If found, the cached data is returned immediately -- no browser session is created.

### Cache Invalidation

- **Time-based**: Entries expire based on their `expires_at` timestamp.
- **Manual**: Admin endpoint can delete cache entries to force a re-scrape.
- **Area normalization**: Area names are lowercased and trimmed before lookup (e.g. "Juja" and "juja" hit the same cache entry).

---

## Fallback Data

If scraping fails (site is down, BrowserBase quota exhausted, captcha not solved), the system falls back to hardcoded data. This data is updated manually every quarter.

### Fallback Data Structure

```typescript
// convex/lib/fallbackData.ts
export const FALLBACK_RENT: Record<string, Record<string, number>> = {
  juja: { bedsitter: 5000, one_br: 10000, two_br: 18000 },
  westlands: { bedsitter: 15000, one_br: 30000, two_br: 50000 },
  kilimani: { bedsitter: 18000, one_br: 35000, two_br: 55000 },
  // ... more Nairobi areas
};

export const FALLBACK_FOOD: Record<string, Record<string, number>> = {
  nairobi: {
    inexpensive_meal: 500,
    mid_range_meal: 1500,
    fast_food_combo: 800,
    daily_estimate: 600,
    monthly_estimate: 18000,
  },
};

export const FALLBACK_TRANSPORT: Record<string, Record<string, number>> = {
  nairobi: {
    matatu_single: 100,
    monthly_bus_pass: 4000,
    fuel_per_litre: 180,
    taxi_per_km: 60,
  },
};
```

When fallback data is used, the UI displays a subtle indicator: "Estimates based on historical data. Live data temporarily unavailable."

---

## Anti-Bot Considerations

### Rate Limiting

- **Inter-request delay**: 2-5 seconds random delay between page navigations within a single session.
- **Session spacing**: No more than 1 concurrent BrowserBase session per target domain.
- **Daily caps**: Maximum 50 scraping sessions per day across all data types (to stay within BrowserBase free/starter tier and avoid IP blocks).

### Stealth Measures (Handled by BrowserBase)

- Residential proxy rotation (Kenyan IPs preferred when available).
- Browser fingerprint randomization (user agent, viewport, WebGL, canvas).
- Automatic captcha solving (reCAPTCHA v2/v3, hCaptcha).
- Human-like mouse movements and scrolling injected by BrowserBase's stealth mode.

### Additional Measures in Our Scripts

- Randomize the order in which we visit listing pages.
- Use realistic viewport sizes (1366x768, 1920x1080).
- Add random scroll pauses to simulate reading.
- Rotate between target sites (don't always hit the same one first).

### Ethical Scraping

- Respect `robots.txt` where possible.
- Only scrape publicly available listing data (no login-walled content).
- Cache aggressively to minimize total requests.
- Identify as a legitimate browser (not a bot user-agent).

---

## Files to Create / Edit

### New Files

| File | Purpose |
|---|---|
| `packages/convex/lib/browserbase.ts` | BrowserBase SDK wrapper: session creation, teardown, error handling |
| `packages/convex/lib/fallbackData.ts` | Hardcoded fallback data for rent, food, and transport |
| `packages/convex/lib/areaUtils.ts` | Area name normalization, validation, Nairobi-area whitelist |
| `packages/convex/actions/scrapeRent.ts` | Playwright script for BuyRentKenya / Property24 rent extraction |
| `packages/convex/actions/scrapeFood.ts` | Google Places API call + Numbeo food cost scraping |
| `packages/convex/actions/scrapeTransport.ts` | Numbeo transport data + Google Maps distance calculation |
| `packages/convex/actions/scraperScheduler.ts` | Cron job to pre-emptively refresh expiring cache entries |
| `packages/convex/db/scraperCache.ts` | Convex queries and mutations for the `scraped_data` table |
| `packages/convex/schema.ts` (edit) | Add `scraped_data` table definition to the Convex schema |
| `packages/shared/types/scraper.ts` | Shared TypeScript types: `ScrapedData`, `DataType`, `AreaName` |

### Files to Edit

| File | Change |
|---|---|
| `packages/convex/convex.config.ts` or `crons.ts` | Register the daily cache-refresh cron job |
| `.env` / `.env.local` | Add `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `GOOGLE_PLACES_API_KEY` |

---

## Tests

### Unit Tests (Vitest)

| Test File | What It Covers |
|---|---|
| `packages/convex/lib/__tests__/areaUtils.test.ts` | Area normalization, whitelist validation, edge cases (typos, empty strings) |
| `packages/convex/lib/__tests__/fallbackData.test.ts` | All Nairobi areas have complete fallback data; data values are positive numbers |
| `packages/convex/lib/__tests__/browserbase.test.ts` | Session creation mock, error handling (timeout, auth failure), teardown |
| `packages/convex/db/__tests__/scraperCache.test.ts` | Cache upsert, lookup, expiry logic, area normalization on lookup |

### Integration Tests (Vitest + Convex test helpers)

| Test File | What It Covers |
|---|---|
| `packages/convex/actions/__tests__/scrapeRent.test.ts` | Mock BrowserBase response, verify data parsing, cache write, fallback on failure |
| `packages/convex/actions/__tests__/scrapeFood.test.ts` | Mock Google Places API, mock Numbeo page, verify food cost calculation |
| `packages/convex/actions/__tests__/scrapeTransport.test.ts` | Mock distance API, mock Numbeo, verify transport cost calculation |

### E2E Tests (Playwright)

| Test File | What It Covers |
|---|---|
| `e2e/scraper-fallback.spec.ts` | When scraping is down, UI shows fallback data with disclaimer |
| `e2e/scraper-cache.spec.ts` | Second form submission for the same area returns cached data instantly |

---

## Risks and Tradeoffs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Target site changes HTML structure | High | Scraper breaks, no fresh data | Fallback data kicks in; monitoring alerts on parse failures; selectors stored in config for quick updates |
| BrowserBase downtime or quota exhaustion | Medium | Cannot scrape | Fallback data; alert if fallback is used for > 48 hours |
| Anti-bot detection blocks our sessions | Medium | Empty or incomplete data | BrowserBase stealth features; rotate between target sites; reduce scraping frequency |
| Google Places/Maps API costs escalate | Low | Budget overrun | Cache aggressively; set API budget caps in Google Cloud console; fallback to Numbeo-only food data |
| Scraped data is inaccurate or stale | Medium | Poor user experience | Show "last updated" timestamp; allow users to flag incorrect data; cross-reference multiple sources |
| Legal issues with scraping | Low | Service disruption | Only scrape public data; respect robots.txt; no login-walled content; add terms of use disclaimer |

### Tradeoffs

| Decision | Benefit | Cost |
|---|---|---|
| BrowserBase over self-hosted Playwright | No infra management, built-in anti-bot | Per-session cost; vendor dependency |
| Cache TTL of 14-30 days | Minimizes scraping sessions and cost | Data can be up to a month stale |
| Fallback hardcoded data | App always works even when scraping fails | Fallback data drifts from reality over time; must be manually updated |
| Nairobi-only launch | Focused data collection, manageable scope | Users outside Nairobi see "coming soon" |
| Google Places API for food data | Structured, reliable data | API costs; limited to Google's restaurant database |
| Multiple target sites per data type | Cross-referencing improves accuracy | More selectors to maintain; more potential breakpoints |
