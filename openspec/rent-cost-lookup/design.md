# Rent Cost Lookup - Feature Design

## Overview

Estimate monthly rent costs for a user based on the Nairobi sub-area where they live and their preferred bedroom count (bedsitter, 1BR, 2BR). The result feeds into the expenses section of the budgeting dashboard and is deducted from the user's gross salary alongside taxes, food, and travel.

---

## Approach

A three-tier data strategy ensures the user always gets a rent estimate, even when external sources are unavailable.

### Tier 1 (Primary) -- Web Scraping via BrowserBase + Playwright

Use BrowserBase (cloud-hosted browser sessions) with Playwright to scrape live rental listings from Kenyan property sites. This provides the most current, area-specific pricing.

**Scraping targets:**

| Site | URL Pattern | Rendering | Extraction |
|---|---|---|---|
| BuyRentKenya | `buyrentkenya.com/rentals/{beds}-bed?location={area}` | Mostly SSR HTML | Cheerio (fast) or Playwright DOM queries |
| Property24 | `property24.co.ke/apartments-to-rent-in-{area}` | SSR HTML | Cheerio or Playwright DOM queries |
| Jiji.co.ke | `jiji.co.ke/nairobi/apartments-for-rent?location={area}` | JS-rendered (SPA) | Playwright via BrowserBase (headless browser required) |

**Scraping strategy per site:**

1. Build the URL from the user's area and bedroom count.
2. Open a BrowserBase session (Playwright `chromium.connectOverCDP`).
3. Navigate to the listing page, wait for content to render.
4. Extract all listing prices from the page (CSS selectors targeting price elements).
5. Filter outliers (prices below 1,000 KES or above 500,000 KES).
6. Compute the **median** and **interquartile range** (25th-75th percentile) as the rent estimate and range.
7. Close the browser session.

For SSR sites (BuyRentKenya, Property24), prefer fetching raw HTML with `fetch` and parsing with Cheerio to save BrowserBase minutes. Only escalate to a full Playwright session if the page requires JavaScript rendering or anti-bot interaction.

### Tier 2 (Secondary) -- Numbeo API

Query the Numbeo cost-of-living API for Nairobi-level rent averages. Numbeo provides city-level data (not sub-area), so this serves as a reasonable fallback when scraping fails for a specific area.

- Endpoint: `https://www.numbeo.com/api/city_prices?api_key={key}&query=Nairobi`
- Extract indices for "Apartment (1 bedroom) in City Centre" and "Apartment (1 bedroom) Outside of Centre".
- Map centre to Premium/Middle tiers and outside-centre to Budget/Satellite tiers.

### Tier 3 (Fallback) -- Hardcoded Rent Data

Static rent ranges compiled from market research, updated manually each quarter. This guarantees an estimate is always available.

**Hardcoded rent data (KES/month):**

| Tier | Example Areas | Bedsitter | 1 Bedroom | 2 Bedrooms |
|---|---|---|---|---|
| Premium | Westlands, Kilimani, Lavington, Kileleshwa, Upper Hill | 15,000 - 25,000 | 30,000 - 70,000 | 50,000 - 130,000 |
| Middle | South B, South C, Langata, Hurlingham, Madaraka | 6,000 - 15,000 | 12,000 - 35,000 | 18,000 - 55,000 |
| Budget | Kahawa, Githurai, Kasarani, Roysambu, Zimmerman | 3,500 - 8,000 | 6,000 - 15,000 | 10,000 - 25,000 |
| Satellite | Juja, Thika, Ruiru, Kitengela, Rongai, Syokimau | 3,000 - 8,000 | 5,000 - 15,000 | 8,000 - 25,000 |

The midpoint of each range is used as the default estimate. The full range is shown to the user so they can adjust.

---

## Area Recognition and Mapping

The user types in an area name (e.g., "Juja", "Kilimani", "South B"). The system must:

1. Normalize the input (lowercase, trim whitespace, remove trailing commas).
2. Match against a known list of Nairobi sub-areas using fuzzy matching (e.g., `fuse.js` with a low threshold).
3. Map the matched area to its tier (Premium / Middle / Budget / Satellite).
4. If no match is found within Nairobi, display: "This feature is coming soon to your area."

A mapping file (`src/lib/nairobi-areas.ts`) stores all recognized areas with their tier classification.

---

## Caching Strategy

Scraped and API results are expensive to obtain and change slowly. Cache aggressively.

- **Cache key:** `(area_normalized, bedroom_count)`
- **Cache duration:** 14 days for scraped data, 30 days for Numbeo data.
- **Cache location:** Convex database table `rentCache`.
- **Cache invalidation:** Automatic via TTL check on read. A scheduled Convex cron job can also pre-warm cache for popular areas weekly.

When a user requests a rent estimate:

1. Check `rentCache` for a non-expired entry matching `(area, bedrooms)`.
2. If cache hit, return cached data immediately.
3. If cache miss, trigger scraping (Tier 1), fall through to Numbeo (Tier 2) on failure, then hardcoded (Tier 3).
4. Write the result back to `rentCache`.

---

## Convex Schema

```typescript
// convex/schema.ts (additions)

rentCache: defineTable({
  area: v.string(),            // normalized area name, e.g. "kilimani"
  bedrooms: v.string(),        // "bedsitter" | "1br" | "2br"
  tier: v.string(),            // "premium" | "middle" | "budget" | "satellite"
  source: v.string(),          // "scrape" | "numbeo" | "hardcoded"
  medianRent: v.number(),      // KES/month median estimate
  lowRent: v.number(),         // KES/month 25th percentile or range low
  highRent: v.number(),        // KES/month 75th percentile or range high
  sampleSize: v.number(),      // number of listings scraped (0 for hardcoded)
  scrapedAt: v.number(),       // unix timestamp of when data was fetched
  expiresAt: v.number(),       // unix timestamp of cache expiry
})
  .index("by_area_bedrooms", ["area", "bedrooms"])
  .index("by_expires", ["expiresAt"]),

userExpenses: defineTable({
  userId: v.string(),
  category: v.string(),        // "rent" | "food" | "travel" | "tax" | "custom"
  label: v.string(),           // display label, e.g. "Rent (1BR in Kilimani)"
  amountKES: v.number(),
  isEditable: v.boolean(),     // user can override the auto-calculated value
  source: v.string(),          // "auto" | "manual"
})
  .index("by_user", ["userId"]),
```

---

## Technology Stack

| Concern | Technology | Reason |
|---|---|---|
| Scraping runtime | BrowserBase + Playwright | Cloud browser sessions, avoids local Chromium, handles JS-rendered sites |
| HTML parsing (SSR) | Cheerio | Fast, lightweight, no browser needed for static HTML |
| Fuzzy area matching | fuse.js | Client-side fuzzy search, small bundle |
| Backend / DB | Convex | Already used in the project; handles caching, actions, cron jobs |
| HTTP requests | Convex `httpAction` or Node `fetch` | For Numbeo API and SSR page fetches |
| UI | React + shadcn/ui + TailwindCSS | Consistent with the rest of the app |

---

## Files to Create / Edit

### New files

| File | Purpose |
|---|---|
| `src/lib/nairobi-areas.ts` | Area-to-tier mapping, normalization, fuzzy matcher |
| `src/lib/rent-fallback-data.ts` | Hardcoded rent ranges by tier and bedroom count |
| `convex/rentScraper.ts` | Convex action: BrowserBase/Playwright scraping logic for all three sites |
| `convex/rentLookup.ts` | Convex query/mutation: cache check, orchestrate tiers, write cache |
| `convex/rentCron.ts` | Convex cron job: pre-warm cache for popular areas weekly |
| `src/components/RentEstimateCard.tsx` | Dashboard card showing rent estimate with bedroom selector and area |
| `src/components/RentEstimateCard.test.tsx` | Unit tests for the rent card component |

### Files to edit

| File | Change |
|---|---|
| `convex/schema.ts` | Add `rentCache` and update `userExpenses` table definitions |
| `src/components/Dashboard.tsx` (or equivalent) | Integrate `RentEstimateCard` into the expenses dashboard |
| `package.json` | Add `cheerio`, `fuse.js`, `playwright` (if not present) as dependencies |
| `.env.local` | Add `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `NUMBEO_API_KEY` |

---

## Tests to Write

1. **Unit -- `nairobi-areas.ts`:** Verify area normalization ("south b" matches "South B"), tier mapping returns correct tier, unknown areas return null.
2. **Unit -- `rent-fallback-data.ts`:** Verify every tier/bedroom combination returns a valid `{ low, mid, high }` object with `low < mid < high`.
3. **Unit -- `RentEstimateCard.tsx`:** Renders loading state, renders estimate with range, renders "coming soon" for unsupported areas, bedroom selector changes the displayed estimate.
4. **Integration -- `rentLookup.ts`:** Mock BrowserBase to return sample HTML, verify median calculation, verify cache write, verify fallback chain (scrape fails -> Numbeo fails -> hardcoded).
5. **Integration -- `rentScraper.ts`:** Snapshot tests with saved HTML from each target site to ensure selectors still extract prices correctly.
6. **E2E (optional):** Playwright test that fills in the user form with an area, verifies the rent card appears in the dashboard.

---

## Risks and Trade-offs

| Risk | Impact | Mitigation |
|---|---|---|
| **Scraping targets change their HTML structure** | Price extraction breaks silently | Snapshot tests with saved HTML; alert on zero-result scrapes; fall through to Tier 2/3 |
| **BrowserBase rate limits or downtime** | Scraping unavailable | Tier 2 (Numbeo) and Tier 3 (hardcoded) fallbacks ensure the user always gets an estimate |
| **Numbeo API cost or rate limits** | Secondary source unavailable | Cache aggressively (30-day TTL); hardcoded data is always available |
| **Anti-bot measures on target sites** | Playwright sessions blocked | BrowserBase provides residential proxies and stealth browser profiles; rotate user agents |
| **Hardcoded data becomes stale** | Estimates drift from reality | Quarterly manual review; display "Last updated: Q1 2026" to set expectations |
| **User area not recognized** | No estimate shown | Fuzzy matching with low threshold; "coming soon" message for truly unknown areas |
| **Rent varies wildly within a single area** | Estimate feels inaccurate | Show the full range (low-high) alongside the median; let the user override on the dashboard |
| **Legal risk of scraping** | Terms of service violation | Respect `robots.txt`, rate-limit requests (max 1 req/sec per domain), cache heavily to minimize hits |

---

## UX Considerations

- The `RentEstimateCard` shows: area name, bedroom count selector (bedsitter / 1BR / 2BR), estimated monthly rent (median), rent range (low - high), source badge ("Live data" / "Estimate"), and an edit button so the user can override.
- If the user edits the rent value, the `source` field on their expense flips to `"manual"` and future scrapes do not overwrite their choice.
- A subtle refresh icon lets the user manually trigger a re-scrape if they want fresher data.
- Loading state uses a skeleton/shimmer while the scraping action runs (can take 5-15 seconds for BrowserBase).
