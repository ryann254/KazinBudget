# Food Cost Lookup - Feature Design

## Overview

Estimate the monthly food cost for a user based on the location of their workplace in Nairobi. The result feeds into the Expenses Dashboard and is deducted from gross salary to compute take-home pay.

---

## Approach

The feature uses a three-tier data strategy, moving from best available data down to a reliable fallback:

1. **Tier 1 -- Google Places API (Nearby Search):** Query restaurants within a radius of the company coordinates. The API returns a `price_level` field (0-4) for many listings. Aggregate this into an average price tier for the area.
2. **Tier 2 -- BrowserBase Scraper (optional enrichment):** Use BrowserBase headless browser automation to scrape actual menu prices from Glovo Kenya or Uber Eats for the same area. This provides real KES figures rather than abstract tiers.
3. **Tier 3 -- Hardcoded Zone Defaults (fallback):** If the API quota is exhausted, the area is unsupported, or scraping fails, fall back to curated per-zone averages for Nairobi.

The tiers are attempted in order. If Tier 1 succeeds it is used as the primary signal; Tier 2 can refine it. If both fail, Tier 3 is returned.

---

## Google Places API Integration

### Endpoint

```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
```

### Key Parameters

| Parameter  | Value                                   |
| ---------- | --------------------------------------- |
| `location` | `lat,lng` of the company address        |
| `radius`   | `1500` (metres -- ~15 min walk)         |
| `type`     | `restaurant`                            |
| `key`      | Server-side env var `GOOGLE_PLACES_KEY` |

### Response Fields Used

- `results[].price_level` -- integer 0-4
- `results[].name` -- for display / debugging
- `results[].vicinity` -- for zone classification

### Price Level Mapping (KES per meal)

| price_level | Description      | Estimated Lunch Cost (KES) |
| ----------- | ---------------- | -------------------------- |
| 0           | Free / Unknown   | Use zone default           |
| 1           | Inexpensive      | 150 - 300                  |
| 2           | Moderate         | 300 - 500                  |
| 3           | Expensive        | 500 - 800                  |
| 4           | Very Expensive   | 800 - 1200                 |

The midpoint of each range is used for calculation.

---

## BrowserBase Scraper (Optional Enrichment)

Use BrowserBase to launch a headless Chromium session that:

1. Opens Glovo Kenya (`https://glovoapp.com/ke/nbi/`) or Uber Eats Nairobi.
2. Sets the delivery address to the company location.
3. Scrapes the first 10-20 restaurant listings and their average plate prices.
4. Returns a median price in KES.

This step runs as a background Convex action and caches results. It is non-blocking; the UI can display the Tier 1 or Tier 3 estimate immediately and refine it when scraping completes.

---

## Calculation Formula

```
averageLunchCost = weightedMean(priceLevels) mapped to KES
                   OR scrapedMedianPrice
                   OR zoneDefault

monthlyFoodCost = averageLunchCost * MEALS_PER_DAY * WORKING_DAYS_PER_MONTH

where:
  MEALS_PER_DAY       = 1   (lunch only, user can override)
  WORKING_DAYS_PER_MONTH = 22
```

The user can adjust `MEALS_PER_DAY` (e.g., 2 for lunch + dinner) and `WORKING_DAYS_PER_MONTH` from the Expenses Dashboard.

---

## Hardcoded Fallback Data (Nairobi Zones)

These defaults are based on 2024/2025 Numbeo and local survey data for Nairobi.

| Zone Category | Areas (examples)                        | Avg Lunch Cost (KES) | Monthly Estimate (KES) |
| ------------- | --------------------------------------- | -------------------- | ---------------------- |
| Premium       | Westlands, Kilimani, Upper Hill, Karen  | 650                  | 14,300                 |
| Middle        | South B, South C, Langata, Lavington    | 400                  | 8,800                  |
| Budget        | Githurai, Umoja, Pipeline, Kayole       | 225                  | 4,950                  |

Zone classification is done by matching the company address string or coordinates against a lookup table of Nairobi sub-areas stored in a constants file.

---

## Convex Backend Design

### Action: `food/estimateFoodCost`

This is a Convex **action** (not a query or mutation) because it calls external APIs.

```ts
// convex/food/estimateFoodCost.ts
import { action } from "../_generated/server";
import { v } from "convex/values";

export const estimateFoodCost = action({
  args: {
    companyLat: v.number(),
    companyLng: v.number(),
    companyAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check cache (Convex table)
    // 2. Try Google Places API
    // 3. Try BrowserBase scraper (optional, async)
    // 4. Fallback to zone defaults
    // 5. Write result to cache table
    // 6. Return { avgMealCost, monthlyEstimate, source, restaurants }
  },
});
```

### Table: `foodCostCache`

```ts
// convex/schema.ts (addition)
foodCostCache: defineTable({
  locationKey: v.string(),   // geohash or "lat,lng" rounded to 3 decimals
  avgMealCost: v.number(),   // KES
  monthlyEstimate: v.number(),
  source: v.string(),        // "google_places" | "browserbase" | "fallback"
  restaurants: v.array(v.object({
    name: v.string(),
    priceLevel: v.number(),
  })),
  createdAt: v.number(),
}).index("by_location", ["locationKey"]),
```

Cache TTL: **7 days**. After 7 days the action re-fetches.

### Mutation: `food/saveUserFoodPreference`

Allows the user to override meals per day, working days, or the entire monthly food cost from the dashboard.

---

## Caching Strategy

1. **Server-side (Convex table):** Cache Google Places results per rounded location for 7 days. BrowserBase results cached for 14 days (scraping is expensive).
2. **Client-side:** React Query / Convex reactive queries keep the UI in sync. No additional client cache needed since Convex handles reactivity.
3. **Geohash rounding:** Round lat/lng to 3 decimal places (~111 m precision) so nearby offices share a cache entry.

---

## Files to Create / Edit

### New Files

| File                                           | Purpose                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| `convex/food/estimateFoodCost.ts`              | Convex action -- orchestrates the lookup         |
| `convex/food/saveUserFoodPreference.ts`        | Convex mutation -- user overrides                |
| `convex/food/getFoodCost.ts`                   | Convex query -- read cached/saved food cost      |
| `src/lib/googlePlaces.ts`                      | Google Places API helper (Nearby Search)         |
| `src/lib/browserbaseScraper.ts`                | BrowserBase scraping logic for Glovo/Uber Eats   |
| `src/lib/nairobiZones.ts`                      | Hardcoded zone data and zone-classifier function |
| `src/components/expenses/FoodCostCard.tsx`      | Dashboard card showing food cost breakdown       |
| `src/components/expenses/FoodCostEditModal.tsx` | Modal to override meals/day and working days     |

### Files to Edit

| File                | Change                                           |
| ------------------- | ------------------------------------------------ |
| `convex/schema.ts`  | Add `foodCostCache` table definition              |
| `.env.local`        | Add `GOOGLE_PLACES_KEY`, `BROWSERBASE_API_KEY`   |
| `src/pages/Dashboard.tsx` (or equivalent) | Import and render `FoodCostCard` |

---

## Tests

| Test File                                 | What It Covers                                                        |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `tests/unit/nairobiZones.test.ts`         | Zone classifier returns correct zone for known addresses/coordinates  |
| `tests/unit/foodCostCalc.test.ts`         | Calculation formula: price_level mapping, monthly math, edge cases    |
| `tests/unit/googlePlaces.test.ts`         | Mocked API response parsed correctly; handles missing price_level     |
| `tests/integration/estimateFoodCost.test.ts` | Full action flow with mocked HTTP calls; cache hit/miss scenarios  |
| `tests/e2e/foodCostDashboard.spec.ts`     | User sees food cost card; can edit meals/day; value updates           |

---

## Risks and Trade-offs

| Risk                                        | Mitigation                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Google Places API cost**                  | Cache aggressively (7-day TTL, geohash rounding). Free tier allows ~5,000 requests/month.      |
| **price_level missing for many Nairobi restaurants** | Fall back to zone defaults when <5 restaurants return a price_level.                  |
| **BrowserBase scraping is fragile**         | Treat as optional enrichment, never block on it. Wrap in try/catch with fallback.              |
| **Glovo/Uber Eats page structure changes**  | Scraper selectors will break. Maintain a selector config file; alert on repeated failures.     |
| **Hardcoded zone data becomes stale**       | Review and update zone averages quarterly. Long-term: replace with scraped data.               |
| **User is outside Nairobi**                 | Return a "coming soon" message; do not estimate. Check at the form input stage.                |
| **Currency fluctuation**                    | All values in KES. No currency conversion needed for the Nairobi scope.                        |
| **Privacy / API key exposure**              | All API calls happen server-side in Convex actions. Keys stored in environment variables only.  |
