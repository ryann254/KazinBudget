# Rent Cost Lookup - Tasks

## Setup

- [ ] 1. Install dependencies: `npm install cheerio fuse.js playwright @browserbasehq/sdk`
- [ ] 2. Add environment variables to `.env.local`: `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `NUMBEO_API_KEY`
- [ ] 3. Add the `rentCache` table definition to `convex/schema.ts` with fields: `area`, `bedrooms`, `tier`, `source`, `medianRent`, `lowRent`, `highRent`, `sampleSize`, `scrapedAt`, `expiresAt` and indexes `by_area_bedrooms` and `by_expires`
- [ ] 4. Update the `userExpenses` table in `convex/schema.ts` to include `category`, `label`, `amountKES`, `isEditable`, and `source` fields if not already present

## Area Mapping

- [ ] 5. Create `src/lib/nairobi-areas.ts` with an object mapping each Nairobi sub-area name to its tier (`premium`, `middle`, `budget`, `satellite`)
- [ ] 6. In the same file, add a `normalizeArea(input: string)` function that lowercases, trims, and strips trailing punctuation
- [ ] 7. In the same file, add a `matchArea(input: string)` function that uses `fuse.js` to fuzzy-match the input against all known area names and returns `{ area, tier } | null`
- [ ] 8. Write unit tests for `normalizeArea` and `matchArea` covering: exact match, fuzzy match (e.g., "southb" -> "south b"), unknown area returns null

## Hardcoded Fallback Data

- [ ] 9. Create `src/lib/rent-fallback-data.ts` exporting a nested object keyed by `[tier][bedroomType]` returning `{ low, mid, high }` values in KES using the data from the design doc
- [ ] 10. Add a `getFallbackRent(tier: string, bedrooms: string)` function that looks up and returns the fallback estimate
- [ ] 11. Write unit tests: every tier/bedroom combo returns valid numbers, `low < mid < high` for all entries

## Scraping Logic

- [ ] 12. Create `convex/rentScraper.ts` as a Convex action
- [ ] 13. Implement `scrapeBuyRentKenya(area: string, bedrooms: string)`: build the URL, fetch the HTML with `fetch`, parse prices with Cheerio, return an array of numbers
- [ ] 14. Implement `scrapeProperty24(area: string, bedrooms: string)`: build the URL, fetch the HTML with `fetch`, parse prices with Cheerio, return an array of numbers
- [ ] 15. Implement `scrapeJiji(area: string, bedrooms: string)`: connect to BrowserBase via Playwright (`chromium.connectOverCDP`), navigate to the Jiji URL, wait for listings to render, extract prices from the DOM, close the session, return an array of numbers
- [ ] 16. Implement `aggregatePrices(prices: number[])`: filter outliers (below 1,000 or above 500,000 KES), compute median, 25th percentile (low), and 75th percentile (high)
- [ ] 17. Implement the main `scrapeRent(area: string, bedrooms: string)` action that calls all three scrapers, merges results, runs `aggregatePrices`, and returns `{ medianRent, lowRent, highRent, sampleSize }`
- [ ] 18. Write integration tests: mock HTML responses from each site, verify price extraction and aggregation

## Numbeo Fallback

- [ ] 19. In `convex/rentScraper.ts`, add a `fetchNumbeo()` function that calls the Numbeo API for Nairobi, extracts "Apartment (1 bedroom) in City Centre" and "Outside of Centre" prices, and maps them to tier-based estimates
- [ ] 20. Write a unit test for `fetchNumbeo` with a mocked API response

## Cache Layer

- [ ] 21. Create `convex/rentLookup.ts` with a Convex query `getCachedRent(area, bedrooms)` that checks the `rentCache` table for a non-expired entry
- [ ] 22. Add a Convex mutation `writeRentCache(data)` that upserts a cache entry with `scrapedAt` as now and `expiresAt` as now + 14 days (scrape) or now + 30 days (Numbeo)
- [ ] 23. Add a Convex action `lookupRent(area, bedrooms)` that orchestrates: check cache -> if miss, try scrape -> if fail, try Numbeo -> if fail, use hardcoded -> write result to cache -> return result
- [ ] 24. Write integration tests for `lookupRent`: cache hit returns immediately, cache miss triggers scrape, scrape failure falls through to Numbeo, Numbeo failure falls through to hardcoded

## Cron Job

- [ ] 25. Create `convex/rentCron.ts` that defines a weekly Convex cron job
- [ ] 26. The cron job iterates over a list of popular areas (Westlands, Kilimani, South B, Langata, Juja, Ruiru, Kasarani, Kahawa) x bedroom types and calls `lookupRent` for each to pre-warm the cache
- [ ] 27. Add logic to delete expired entries from `rentCache` during the cron run

## UI Component

- [ ] 28. Create `src/components/RentEstimateCard.tsx` with props: `area`, `tier`, `onRentEstimated(amount: number)`
- [ ] 29. Add a bedroom count selector (bedsitter / 1BR / 2BR) using shadcn/ui `Select` component
- [ ] 30. Display the rent estimate: median value prominently, low-high range below it, source badge ("Live data" | "Estimate"), and a "Last updated" timestamp
- [ ] 31. Add a loading skeleton state that shows while the `lookupRent` action is running
- [ ] 32. Add an "Edit" button that lets the user override the rent amount manually; when edited, mark the expense source as `"manual"`
- [ ] 33. Add a refresh icon button that manually triggers a re-scrape (calls `lookupRent` with cache bypass)
- [ ] 34. If the area is not recognized (outside Nairobi), show a "Coming soon to your area" message instead of the estimate
- [ ] 35. Style the card with TailwindCSS to match the dashboard layout

## Dashboard Integration

- [ ] 36. Import `RentEstimateCard` into the expenses dashboard page
- [ ] 37. Pass the user's living area (from their profile/form input) to the card
- [ ] 38. When the card returns an estimate via `onRentEstimated`, write it to `userExpenses` with `category: "rent"`, `source: "auto"`, and `isEditable: true`
- [ ] 39. If the user has a manual override saved in `userExpenses`, display that value instead of the auto-calculated one

## Component Tests

- [ ] 40. Write unit tests for `RentEstimateCard`: renders loading skeleton, renders estimate with correct formatting (KES with commas), renders bedroom selector, switching bedrooms updates the estimate, renders "coming soon" for unsupported area
- [ ] 41. Write an integration test: mock the `lookupRent` action, verify the card fetches and displays data on mount

## Final Verification

- [ ] 42. Manually test the full flow: enter area -> see loading -> see rent estimate -> change bedrooms -> see updated estimate -> edit manually -> verify override persists
- [ ] 43. Verify the fallback chain works: disable BrowserBase key -> confirm Numbeo is used -> disable Numbeo key -> confirm hardcoded data is used
- [ ] 44. Check that the cron job runs and populates the cache for popular areas
- [ ] 45. Review all scraper selectors against the live sites and update if needed
