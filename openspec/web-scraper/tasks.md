# Web Scraper - Tasks

## Setup and Configuration

- [ ] 1. Sign up for a BrowserBase account at browserbase.com and create a project. Note the API key and project ID.
- [ ] 2. Install the BrowserBase SDK and Playwright Core: `npm install @browserbasehq/sdk playwright-core` in the `packages/convex` workspace.
- [ ] 3. Set Convex environment variables: `npx convex env set BROWSERBASE_API_KEY <key>`, `npx convex env set BROWSERBASE_PROJECT_ID <id>`.
- [ ] 4. Enable a Google Cloud project with Places API and Distance Matrix API. Set `npx convex env set GOOGLE_PLACES_API_KEY <key>`.
- [ ] 5. Set API budget caps in Google Cloud console (e.g. $10/month) to prevent cost overruns.

## Shared Types

- [ ] 6. Create `packages/shared/types/scraper.ts` with the following types: `DataType` (union: "rent" | "food" | "transport"), `AreaName` (string), and `ScrapedData` (object with fields: area, data_type, data, source, scraped_at, expires_at).

## Convex Schema

- [ ] 7. Edit `packages/convex/schema.ts` to add a `scraped_data` table with fields: `area` (string, indexed), `data_type` (string, indexed), `data` (any/object), `source` (string), `scraped_at` (number), `expires_at` (number). Add a compound index on `(area, data_type)`.

## Area Utilities

- [ ] 8. Create `packages/convex/lib/areaUtils.ts` with a function `normalizeArea(input: string): string` that lowercases, trims, and strips extra whitespace.
- [ ] 9. In the same file, add a `NAIROBI_AREAS` whitelist array containing supported area names (e.g. "juja", "westlands", "kilimani", "kileleshwa", "langata", "karen", "ruiru", "thika", "embakasi", "kasarani", "roysambu", "ruaka", "rongai", "kitengela", "syokimau", "cbd").
- [ ] 10. Add a function `isAreaSupported(area: string): boolean` that checks if the normalized area is in the whitelist.
- [ ] 11. Write unit tests in `packages/convex/lib/__tests__/areaUtils.test.ts` covering normalization edge cases (mixed case, extra spaces, leading/trailing whitespace) and whitelist validation.

## Fallback Data

- [ ] 12. Create `packages/convex/lib/fallbackData.ts` with hardcoded rent data (KES) for at least 10 Nairobi areas. Include bedsitter, one_br, and two_br price estimates per area.
- [ ] 13. In the same file, add hardcoded food cost data for Nairobi: inexpensive_meal, mid_range_meal, fast_food_combo, daily_estimate, monthly_estimate (all in KES).
- [ ] 14. In the same file, add hardcoded transport data for Nairobi: matatu_single, monthly_bus_pass, fuel_per_litre, taxi_per_km (all in KES).
- [ ] 15. Add getter functions: `getFallbackRentData(area)`, `getFallbackFoodData(area)`, `getFallbackTransportData(area)` that return the hardcoded data or a sensible default if the area is not found.
- [ ] 16. Write unit tests in `packages/convex/lib/__tests__/fallbackData.test.ts` verifying all whitelisted areas have fallback rent data, all values are positive numbers, and the getter functions return defaults for unknown areas.

## BrowserBase Wrapper

- [ ] 17. Create `packages/convex/lib/browserbase.ts` with a function `createBrowserSession()` that initializes the BrowserBase SDK, creates a session with proxies enabled, connects Playwright via CDP, and returns `{ browser, page, sessionId }`.
- [ ] 18. Add a function `closeBrowserSession(browser)` that gracefully closes the browser and handles errors.
- [ ] 19. Add a helper `waitWithRandomDelay(min: number, max: number)` that waits between `min` and `max` milliseconds (default 2000-5000ms) to rate-limit requests.
- [ ] 20. Write unit tests in `packages/convex/lib/__tests__/browserbase.test.ts` with mocked SDK calls verifying session creation, error handling (auth failure, timeout), and teardown.

## Cache Layer

- [ ] 21. Create `packages/convex/db/scraperCache.ts` with an internal query `get({ area, data_type })` that looks up the `scraped_data` table by the compound index, normalizes the area name, and returns the entry if `expires_at > Date.now()`.
- [ ] 22. In the same file, add an internal mutation `upsert({ area, data_type, data, source, scraped_at, expires_at })` that inserts or replaces the cache entry for the given `(area, data_type)` pair.
- [ ] 23. Add an internal mutation `invalidate({ area, data_type })` that deletes the cache entry for manual invalidation.
- [ ] 24. Write unit tests in `packages/convex/db/__tests__/scraperCache.test.ts` verifying cache hit, cache miss (expired), upsert overwrite, and invalidation.

## Rent Scraper

- [ ] 25. Create `packages/convex/actions/scrapeRent.ts` as a Convex action that accepts `{ area: string }`.
- [ ] 26. In the action handler, first check the cache via `ctx.runQuery(internal.scraperCache.get, ...)`. If cached and not expired, return the cached data.
- [ ] 27. If no cache hit, call `createBrowserSession()` and navigate to the BuyRentKenya listings page for the area (e.g. `https://www.buyrentkenya.com/rentals/{area}`).
- [ ] 28. Write Playwright selectors to extract listing prices from the first 20-30 results. Parse price strings (e.g. "KSh 15,000") into numbers.
- [ ] 29. Compute median prices for bedsitter, 1BR, and 2BR categories. Structure the result as `Record<string, number>`.
- [ ] 30. Wrap the scraping logic in a try/catch. On failure, log the error and call `getFallbackRentData(area)` instead.
- [ ] 31. Write the result to cache via `ctx.runMutation(internal.scraperCache.upsert, ...)` with a 30-day TTL.
- [ ] 32. Always call `closeBrowserSession()` in a finally block.
- [ ] 33. Write integration tests in `packages/convex/actions/__tests__/scrapeRent.test.ts` with mocked BrowserBase/Playwright responses verifying successful parsing, fallback on error, and cache write.

## Food Cost Scraper

- [ ] 34. Create `packages/convex/actions/scrapeFood.ts` as a Convex action that accepts `{ area: string, latitude?: number, longitude?: number }`.
- [ ] 35. Use the Google Places API (REST, not browser) to search for restaurants near the provided coordinates. Extract `price_level` values. Map price levels (0-4) to estimated meal costs in KES.
- [ ] 36. Optionally scrape Numbeo's Nairobi cost-of-living page for meal prices (inexpensive restaurant, mid-range restaurant, fast food combo). Use BrowserBase for this.
- [ ] 37. Combine Google Places price-level data and Numbeo meal costs into a single result object with fields: `inexpensive_meal`, `mid_range_meal`, `fast_food_combo`, `daily_estimate`, `monthly_estimate`.
- [ ] 38. Apply the same cache-check-first, try/catch fallback, and cache-write pattern as the rent scraper. Use a 14-day TTL.
- [ ] 39. Write integration tests in `packages/convex/actions/__tests__/scrapeFood.test.ts` with mocked API and page responses.

## Transport Cost Scraper

- [ ] 40. Create `packages/convex/actions/scrapeTransport.ts` as a Convex action that accepts `{ area: string, home_location: string, company_location: string }`.
- [ ] 41. Use the Google Maps Distance Matrix API to get the distance in km and estimated travel time between `home_location` and `company_location`.
- [ ] 42. Scrape Numbeo for Nairobi transport costs (monthly bus pass, taxi per km, fuel per litre) using BrowserBase.
- [ ] 43. Calculate daily and monthly transport estimates for: matatu (based on distance and matatu fare per km), personal car (fuel cost based on distance and assumed consumption), and ride-hail (taxi per km rate).
- [ ] 44. Apply the same cache-check-first, try/catch fallback, and cache-write pattern. Use a 21-day TTL.
- [ ] 45. Write integration tests in `packages/convex/actions/__tests__/scrapeTransport.test.ts` with mocked API and page responses.

## Scheduler and Cron

- [ ] 46. Create `packages/convex/actions/scraperScheduler.ts` with a Convex action that queries all `scraped_data` entries expiring within the next 2 days.
- [ ] 47. For each expiring entry, schedule the appropriate scraper action (rent, food, or transport) for that area.
- [ ] 48. Register a daily cron job in `packages/convex/crons.ts` (or `convex.config.ts`) that triggers the scheduler action once per day (e.g. at 3:00 AM EAT).
- [ ] 49. Add a guard to prevent duplicate scraping: skip entries that were already scraped in the last 24 hours.

## Admin Endpoint

- [ ] 50. Create an internal Convex action `actions/adminRefresh.ts` that accepts `{ area: string, data_type: string }`, invalidates the cache for that entry, and immediately triggers the corresponding scraper action.
- [ ] 51. Gate this action behind an admin check (e.g. a shared secret or Convex auth role) so it cannot be called by regular users.

## Error Monitoring

- [ ] 52. Add structured logging to all scraper actions: log the area, data_type, source, success/failure status, and duration of each scraping session.
- [ ] 53. Add a helper that checks if fallback data has been used for any area for more than 48 hours. Log a warning or send an alert (e.g. via a webhook to Slack or email).

## E2E Tests

- [ ] 54. Write `e2e/scraper-fallback.spec.ts`: submit the salary form, mock scraper failure, verify the UI shows expense data with a "historical data" disclaimer.
- [ ] 55. Write `e2e/scraper-cache.spec.ts`: submit the salary form for an area, verify data loads. Submit again for the same area, verify data loads faster (from cache) without triggering a new scraping session.

## Documentation

- [ ] 56. Add a section to the project README explaining how to set up BrowserBase and Google API keys for local development.
- [ ] 57. Document the fallback data update process: where the file lives, how often to update it, and what data sources to reference.
