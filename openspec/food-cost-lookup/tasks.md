# Food Cost Lookup - Tasks

## Setup

- [ ] 1. Add `GOOGLE_PLACES_KEY` and `BROWSERBASE_API_KEY` to `.env.local` and document them in `.env.example`.
- [ ] 2. Install any needed npm packages (`node-fetch` if not already available in the Convex runtime, `ngeohash` for geohash utilities).
- [ ] 3. Add the `foodCostCache` table to `convex/schema.ts` with fields: `locationKey`, `avgMealCost`, `monthlyEstimate`, `source`, `restaurants`, `createdAt`, and an index on `locationKey`.

## Nairobi Zone Defaults

- [ ] 4. Create `src/lib/nairobiZones.ts` with a `NAIROBI_ZONES` constant mapping zone names to `{ areas: string[], avgLunchCostKES: number }` for Premium (650), Middle (400), and Budget (225) tiers.
- [ ] 5. In the same file, export a `classifyZone(address: string): ZoneCategory` function that matches an address string against known area names and returns the zone category.
- [ ] 6. Export a `getDefaultMealCost(zone: ZoneCategory): number` helper that returns the average lunch cost in KES for the given zone.
- [ ] 7. Write unit tests in `tests/unit/nairobiZones.test.ts` covering: known addresses map to correct zones, unknown addresses return a sensible default, and `getDefaultMealCost` returns correct KES values.

## Google Places API Helper

- [ ] 8. Create `src/lib/googlePlaces.ts` with a `fetchNearbyRestaurants(lat: number, lng: number, radiusMetres?: number)` function that calls the Google Places Nearby Search endpoint with `type=restaurant` and returns an array of `{ name, priceLevel, vicinity }`.
- [ ] 9. Handle the case where `price_level` is missing on a result -- filter those out or mark them as `0`.
- [ ] 10. Export a `computeAveragePriceLevel(restaurants: { priceLevel: number }[]): number` function that returns the mean `price_level` of restaurants that have a valid (>0) value.
- [ ] 11. Export a `mapPriceLevelToKES(priceLevel: number): number` function using the mapping: 1 -> 225, 2 -> 400, 3 -> 650, 4 -> 1000. Return zone default for 0.
- [ ] 12. Write unit tests in `tests/unit/googlePlaces.test.ts` with mocked fetch responses: valid response parsing, missing price_level handling, empty results array, and API error response.

## Calculation Logic

- [ ] 13. Create `src/lib/foodCostCalc.ts` with a `calculateMonthlyFoodCost(avgMealCostKES: number, mealsPerDay?: number, workingDaysPerMonth?: number): number` function. Defaults: `mealsPerDay = 1`, `workingDaysPerMonth = 22`.
- [ ] 14. Write unit tests in `tests/unit/foodCostCalc.test.ts` covering: default parameters, custom meals/day, custom working days, and edge cases (0 meal cost, negative values clamped to 0).

## BrowserBase Scraper (Optional Enrichment)

- [ ] 15. Create `src/lib/browserbaseScraper.ts` with a `scrapeGlovoRestaurantPrices(address: string): Promise<number | null>` function that uses BrowserBase to open Glovo Kenya, set the delivery location, scrape average plate prices from the first 10-20 listings, and return the median price in KES. Return `null` on failure.
- [ ] 16. Wrap the entire scraper in a try/catch so it never throws -- only returns `null` on any error.
- [ ] 17. Add a selector config object at the top of the file for Glovo DOM selectors so they are easy to update when the page structure changes.

## Convex Action

- [ ] 18. Create `convex/food/estimateFoodCost.ts` as a Convex action that accepts `{ companyLat, companyLng, companyAddress }`.
- [ ] 19. At the start of the action, generate a `locationKey` by rounding lat/lng to 3 decimal places (e.g., `"-1.286,36.817"`).
- [ ] 20. Query the `foodCostCache` table by `locationKey`. If a cache entry exists and is less than 7 days old, return it immediately.
- [ ] 21. If cache miss, call `fetchNearbyRestaurants` from the Google Places helper. If at least 5 restaurants return a valid price_level, compute the average and map to KES.
- [ ] 22. If fewer than 5 valid price_levels, fall back to `classifyZone` + `getDefaultMealCost`.
- [ ] 23. Call `calculateMonthlyFoodCost` with the resolved average meal cost.
- [ ] 24. Store the result in `foodCostCache` via a Convex internal mutation.
- [ ] 25. Return `{ avgMealCost, monthlyEstimate, source, restaurants }` to the client.

## Convex Query and Mutation

- [ ] 26. Create `convex/food/getFoodCost.ts` as a Convex query that reads the cached food cost for a given `locationKey` and any user overrides.
- [ ] 27. Create `convex/food/saveUserFoodPreference.ts` as a Convex mutation that stores user overrides (custom `mealsPerDay`, `workingDaysPerMonth`, or a manual `monthlyFoodCost`) linked to the user's profile.

## UI Components

- [ ] 28. Create `src/components/expenses/FoodCostCard.tsx` -- a shadcn/ui Card that displays: area name, average meal cost (KES), meals/day, working days/month, and total monthly food estimate. Include an "Edit" button.
- [ ] 29. Show a small badge or label indicating the data source ("Google Places", "Scraped", or "Estimate") so the user knows how the number was derived.
- [ ] 30. Create `src/components/expenses/FoodCostEditModal.tsx` -- a shadcn/ui Dialog that lets the user override meals per day, working days per month, or enter a fully custom monthly food cost. On save, call `saveUserFoodPreference`.
- [ ] 31. Add loading and error states to `FoodCostCard`: show a Skeleton while the action is running, and an alert if the lookup fails.
- [ ] 32. Import and render `FoodCostCard` inside the Expenses Dashboard page, passing the company location from the user's profile/form data.

## Integration Test

- [ ] 33. Write `tests/integration/estimateFoodCost.test.ts` that mocks the Google Places HTTP call and verifies the full action flow: cache miss triggers API call, result is cached, subsequent call returns cached data, expired cache triggers re-fetch.

## E2E Test

- [ ] 34. Write `tests/e2e/foodCostDashboard.spec.ts` (Playwright) that: fills in a company location in Nairobi, navigates to the dashboard, sees the FoodCostCard with a KES value, opens the edit modal, changes meals/day to 2, saves, and confirms the monthly estimate doubled.

## Cleanup and Documentation

- [ ] 35. Add a brief JSDoc comment to each exported function describing its purpose and parameters.
- [ ] 36. Verify the "coming soon" guard: if the company address is outside Nairobi, the food cost section should show a "Coming soon to your area" message instead of an estimate.
