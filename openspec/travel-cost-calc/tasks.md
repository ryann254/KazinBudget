# Travel Cost Calculation - Tasks

## Setup

- [ ] 1. Create a Google Cloud project (or use existing) and enable the **Distance Matrix API** and **Places API**.
- [ ] 2. Generate a server-side API key (unrestricted or IP-restricted) for Convex actions. Generate a separate client-side API key restricted by HTTP referrer for Places Autocomplete.
- [ ] 3. Add `GOOGLE_MAPS_API_KEY` to the Convex environment variables (`npx convex env set GOOGLE_MAPS_API_KEY <key>`).
- [ ] 4. Add `VITE_GOOGLE_MAPS_CLIENT_KEY` to `.env.local` for the client-side Places Autocomplete.
- [ ] 5. Add the Google Maps JavaScript API script tag to `index.html` using the client key, loading the `places` library.

## Schema

- [ ] 6. Open `convex/schema.ts` and add the `travelEstimates` table with fields: `userId`, `homeAddress`, `companyAddress`, `distanceKm`, `durationMinutes`, `selectedMode`, `costBreakdown` (object with `matatu`, `boda`, `uber`, `car`, `brt` as float64), and `monthlyExpense`. Add an index `by_user` on `["userId"]`.

## Pricing Logic (Shared Pure Functions)

- [ ] 7. Create `src/lib/travelPricing.ts`.
- [ ] 8. In `travelPricing.ts`, define constants: `WORKING_DAYS = 22`, `TRIPS_PER_DAY = 2`, `FUEL_PRICE_PER_LITER = 200`, `FUEL_KM_PER_LITER = 10`.
- [ ] 9. Implement `calculateMatatuCost(distanceKm: number): number` using linear interpolation across brackets: 0km=30, 5km=50, 15km=80, 30km=150, 40km+=200. Multiply the one-way trip cost by `TRIPS_PER_DAY * WORKING_DAYS` to get the monthly cost.
- [ ] 10. Implement `calculateBodaCost(distanceKm: number): number`. Rate: KES 25/km, minimum KES 50 per trip. Multiply by `TRIPS_PER_DAY * WORKING_DAYS`.
- [ ] 11. Implement `calculateUberCost(distanceKm: number, durationMinutes: number): number`. Formula: `(100 + distanceKm * 40 + durationMinutes * 4.5) * TRIPS_PER_DAY * WORKING_DAYS`.
- [ ] 12. Implement `calculateCarCost(distanceKm: number): number`. Formula: `(distanceKm / FUEL_KM_PER_LITER * FUEL_PRICE_PER_LITER) * TRIPS_PER_DAY * WORKING_DAYS`.
- [ ] 13. Implement `calculateBrtCost(): number`. Flat rate: `40 * TRIPS_PER_DAY * WORKING_DAYS`.
- [ ] 14. Export a helper `calculateAllModes(distanceKm: number, durationMinutes: number)` that returns an object `{ matatu, boda, uber, car, brt }` with all monthly costs.
- [ ] 15. Export `TransportMode` type: `"matatu" | "boda" | "uber" | "car" | "brt"`.

## Convex Backend

- [ ] 16. Create `convex/travelCost.ts`.
- [ ] 17. Implement a Convex **action** `calculateTravelCost` that:
    - Accepts `homeAddress: string` and `companyAddress: string`.
    - Calls the Google Maps Distance Matrix API using `fetch` with the server-side API key from `process.env.GOOGLE_MAPS_API_KEY`.
    - Parses the response and extracts `distanceKm` (convert meters to km) and `durationMinutes` (convert seconds to minutes).
    - Calls `calculateAllModes` from `travelPricing.ts` to get the cost breakdown.
    - Returns `{ distanceKm, durationMinutes, costBreakdown }`.
- [ ] 18. Add Nairobi boundary validation to the action. Define a bounding box (approx lat: -1.1 to -1.5, lng: 36.6 to 37.2). If the geocoded coordinates of either address fall outside this box, return `{ error: "coming_soon", message: "This feature is currently available only in Nairobi." }` instead of cost data.
- [ ] 19. Implement a Convex **mutation** `storeTravelExpense` that:
    - Accepts `userId`, `homeAddress`, `companyAddress`, `distanceKm`, `durationMinutes`, `selectedMode`, `costBreakdown`.
    - Upserts into the `travelEstimates` table (check if a record exists for the user; update it if so, insert if not).
    - Sets `monthlyExpense` to `costBreakdown[selectedMode]`.
- [ ] 20. Implement a Convex **mutation** `updateTransportMode` that:
    - Accepts `userId` and `newMode`.
    - Reads the existing `travelEstimates` record for the user.
    - Updates `selectedMode` and recalculates `monthlyExpense` from the stored `costBreakdown`.
- [ ] 21. Implement a Convex **query** `getTravelEstimate` that:
    - Accepts `userId`.
    - Returns the `travelEstimates` record for the user (or `null` if none exists).

## Frontend Components

- [ ] 22. Create `src/components/AddressAutocomplete.tsx`. Build a controlled input that initializes Google Places Autocomplete on mount. Restrict to Kenya (`componentRestrictions: { country: "ke" }`). On place selection, call the `onPlaceSelected` prop with `{ address: string, lat: number, lng: number }`.
- [ ] 23. Create `src/components/TravelCostCard.tsx`. This is a shadcn/ui `Card` component that:
    - Displays the monthly commute cost in KES for the selected transport mode.
    - Shows the distance (km) and estimated one-way duration (minutes).
    - Contains a `Select` dropdown (shadcn/ui) listing all five transport modes with their monthly costs.
    - Changing the dropdown calls the `updateTransportMode` mutation and updates the displayed cost instantly (optimistic update from stored `costBreakdown`).
- [ ] 24. Add a loading state to `TravelCostCard.tsx` using shadcn/ui `Skeleton` while the travel estimate is being fetched or calculated.
- [ ] 25. Add a "Coming soon" state to `TravelCostCard.tsx` that renders when the API returns the `coming_soon` error (location outside Nairobi).
- [ ] 26. Create `src/hooks/useTravelEstimate.ts`. This hook wraps `useQuery(api.travelCost.getTravelEstimate, { userId })` and returns `{ estimate, isLoading }`.

## Dashboard Integration

- [ ] 27. Open the Dashboard page component (e.g., `src/pages/Dashboard.tsx`). Import and render `TravelCostCard`, passing the current user's ID.
- [ ] 28. Ensure the travel cost `monthlyExpense` is included in the total expenses calculation on the dashboard so it is deducted from the gross salary.

## User Input Flow Integration

- [ ] 29. In the user onboarding form (where they enter home address and company address), replace plain text inputs with the `AddressAutocomplete` component.
- [ ] 30. After the onboarding form is submitted, call the `calculateTravelCost` action with the home and company addresses. On success, call the `storeTravelExpense` mutation to persist the result with `selectedMode: "matatu"` as the default.

## Tests

- [ ] 31. Create `src/lib/__tests__/travelPricing.test.ts`.
- [ ] 32. Write tests for `calculateMatatuCost`: verify correct output at 0 km, 3 km, 5 km, 10 km, 15 km, 20 km, 30 km, 40 km, and 50 km.
- [ ] 33. Write tests for `calculateBodaCost`: verify the KES 50 minimum is enforced for very short distances (e.g., 1 km), and correct rate for longer distances.
- [ ] 34. Write tests for `calculateUberCost`: verify the formula with known distance and duration values.
- [ ] 35. Write tests for `calculateCarCost`: verify correct output for 0 km, 10 km, and 25 km.
- [ ] 36. Write tests for `calculateBrtCost`: verify it always returns `40 * 2 * 22 = 1760`.
- [ ] 37. Write tests for `calculateAllModes`: verify it returns an object with all five keys and valid numbers.
- [ ] 38. Create `src/components/__tests__/TravelCostCard.test.tsx`. Write tests verifying: the card renders the monthly cost, the dropdown lists all five modes, switching mode updates the displayed cost, and the "Coming soon" state renders correctly.

## Documentation

- [ ] 39. Add a comment block at the top of `src/lib/travelPricing.ts` explaining the pricing sources and that these are estimates which the user can override on the dashboard.
- [ ] 40. Add inline comments in the Convex action explaining the Google Maps API response structure.
