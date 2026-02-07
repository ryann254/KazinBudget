# Travel Cost Calculation Feature - Design

## Overview

Estimate the monthly commute cost between a user's home and their workplace in Nairobi. The feature uses the Google Maps Distance Matrix API to determine the distance and travel duration between two locations, then applies transport-mode-specific pricing formulas to produce a monthly commute expense. This expense feeds into the dashboard's expenses section and is deducted from the gross salary to compute the take-home estimate.

## Target Scope

- **Launch region:** Nairobi, Kenya only.
- If either the home or company location falls outside Nairobi, display a "Coming soon to your area" message and skip computation.

---

## Approach

### 1. Geocoding and Distance Retrieval

Use the **Google Maps Distance Matrix API** (or the companion Directions API when route detail is needed).

**Request flow:**

1. User enters home address and company address (free-text or Google Places Autocomplete).
2. The backend (Convex action) calls the Distance Matrix API:
   ```
   GET https://maps.googleapis.com/maps/api/distancematrix/json
     ?origins=<home_address>
     &destinations=<company_address>
     &mode=driving
     &key=<GOOGLE_MAPS_API_KEY>
   ```
3. Extract `distance.value` (meters) and `duration.value` (seconds) from the response.
4. Store the raw distance (km) and duration (minutes) in the Convex database alongside the user record.

**Why Google Maps Distance Matrix API:**
- Accurate road-network distances (not straight-line).
- Handles Nairobi-specific road naming and informal settlement references reasonably well through Google's geocoder.
- Duration estimates help inform time-based pricing (Uber/Bolt per-minute charges).

**API Key Management:**
- Store the key in a Convex environment variable (`GOOGLE_MAPS_API_KEY`).
- All API calls happen server-side inside Convex actions to avoid exposing the key to the client.

### 2. Transport Mode Cost Formulas

All costs are in **KES** (Kenyan Shillings). Prices reflect approximate 2025-2026 rates.

A single working month is assumed to be **22 working days**. Each working day requires **2 trips** (to work and back), giving **44 one-way trips per month**.

#### Matatu (PSV) - Default Mode

Matatus are the most common public transport in Nairobi.

| Route Category | Distance (approx.) | Cost per Trip (KES) |
|---|---|---|
| Short (within CBD) | 0 - 5 km | 30 - 50 |
| Medium (e.g., CBD to Eastlands) | 5 - 15 km | 50 - 80 |
| Long (e.g., CBD to Juja/Thika) | 15 - 40+ km | 100 - 200 |

**Formula:**
```
trip_cost = interpolate(distance_km, matatu_price_brackets)
monthly_cost = trip_cost * 2 * 22
```

Interpolation brackets (linear between boundaries):

| Distance (km) | Cost (KES) |
|---|---|
| 0 | 30 |
| 5 | 50 |
| 15 | 80 |
| 30 | 150 |
| 40+ | 200 |

#### Boda Boda (Motorcycle Taxi)

**Rate:** ~KES 20 - 30 per km, minimum fare KES 50.

**Formula:**
```
per_km_rate = 25  // midpoint
trip_cost = max(distance_km * per_km_rate, 50)
monthly_cost = trip_cost * 2 * 22
```

#### Uber / Bolt (Ride-Hailing)

**Rate structure:**
- Base fare: KES 100
- Per km: KES 40 (midpoint of 35-45)
- Per minute: KES 4.50 (midpoint of 4-5)

**Formula:**
```
trip_cost = 100 + (distance_km * 40) + (duration_minutes * 4.5)
monthly_cost = trip_cost * 2 * 22
```

#### Personal Car

**Assumptions:**
- Fuel price: KES 200 per liter (regular petrol, Nairobi average).
- Average fuel consumption: 10 km per liter.
- Parking is excluded (can be added as a separate dashboard expense).

**Formula:**
```
fuel_per_trip = (distance_km / 10) * 200
monthly_cost = fuel_per_trip * 2 * 22
```

#### BRT (Bus Rapid Transit) - Thika Road Corridor

Flat fare system.

**Formula:**
```
trip_cost = 40  // midpoint of 30-50
monthly_cost = trip_cost * 2 * 22
```

*Note: BRT is only available along the Thika Road corridor. If the route does not intersect this corridor, show a notice that BRT is unavailable for the route.*

### 3. Data Flow

```
User Input (home, company)
        |
        v
React Frontend (Google Places Autocomplete)
        |
        v
Convex Action: calculateTravelCost
   - Calls Google Maps Distance Matrix API
   - Computes cost for ALL transport modes
   - Returns results to client
        |
        v
Convex Mutation: storeTravelExpense
   - Saves selected mode + monthly cost to user's expenses
   - Saves all mode options for display
        |
        v
Dashboard Component
   - Shows selected transport mode and monthly cost
   - Dropdown to switch transport mode (recalculates instantly from stored data)
   - Editable: user can override the calculated amount
```

### 4. Convex Schema Additions

```typescript
// In convex/schema.ts - add to existing schema

travelEstimates: defineTable({
  userId: v.id("users"),
  homeAddress: v.string(),
  companyAddress: v.string(),
  distanceKm: v.float64(),
  durationMinutes: v.float64(),
  selectedMode: v.string(), // "matatu" | "boda" | "uber" | "car" | "brt"
  costBreakdown: v.object({
    matatu: v.float64(),
    boda: v.float64(),
    uber: v.float64(),
    car: v.float64(),
    brt: v.float64(),
  }),
  monthlyExpense: v.float64(), // cost for selected mode
}).index("by_user", ["userId"]),
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, TailwindCSS, shadcn/ui |
| Backend / DB | Convex (actions for API calls, mutations for storage, queries for reads) |
| Maps API | Google Maps Distance Matrix API, Google Places Autocomplete |
| State | Convex reactive queries (real-time dashboard updates) |

---

## Files to Create / Edit

### New Files

| File | Purpose |
|---|---|
| `convex/travelCost.ts` | Convex action (`calculateTravelCost`) that calls Google Maps API and computes costs. Convex mutation (`storeTravelExpense`) to persist results. Convex query (`getTravelEstimate`) to read stored data. |
| `src/lib/travelPricing.ts` | Pure functions for each transport mode's cost formula. Shared between server and client so the user can preview cost changes when switching modes without a round-trip. |
| `src/components/TravelCostCard.tsx` | Dashboard card showing commute cost, transport mode selector dropdown, and distance/duration info. Uses shadcn/ui `Card`, `Select`, `Badge`. |
| `src/components/AddressAutocomplete.tsx` | Reusable Google Places Autocomplete input component. Restricted to Kenya (`componentRestrictions: { country: 'ke' }`). |
| `src/hooks/useTravelEstimate.ts` | Custom hook wrapping the Convex query for the current user's travel estimate. |
| `convex/travelCost.test.ts` | Unit tests for pricing formulas. |
| `src/components/__tests__/TravelCostCard.test.tsx` | Component tests for the travel cost card. |

### Files to Edit

| File | Change |
|---|---|
| `convex/schema.ts` | Add `travelEstimates` table definition. |
| `.env.local` | Add `GOOGLE_MAPS_API_KEY` (gitignored). |
| `convex/.env` or environment config | Add `GOOGLE_MAPS_API_KEY` for server-side Convex actions. |
| `src/pages/Dashboard.tsx` (or equivalent) | Import and render `TravelCostCard`. |
| `index.html` | Add Google Maps JS API script tag (for Places Autocomplete on client). |

---

## Tests to Write

1. **Unit tests for `travelPricing.ts`:**
   - `calculateMatatuCost` returns correct interpolated values at bracket boundaries (0 km, 5 km, 15 km, 30 km, 40+ km).
   - `calculateBodaCost` enforces the KES 50 minimum.
   - `calculateUberCost` correctly combines base fare, distance, and duration components.
   - `calculateCarCost` handles zero distance (should return 0).
   - `calculateBrtCost` always returns the flat rate.

2. **Integration tests for `convex/travelCost.ts`:**
   - Mock the Google Maps API response and verify the action returns correct distance and cost breakdown.
   - Verify the mutation stores data correctly and the query retrieves it.

3. **Component tests for `TravelCostCard.tsx`:**
   - Renders the monthly cost for the selected transport mode.
   - Switching transport mode via the dropdown updates the displayed cost.
   - Displays "Coming soon" message when location is outside Nairobi.

4. **Component tests for `AddressAutocomplete.tsx`:**
   - Renders an input field.
   - Calls the `onPlaceSelected` callback with place data.

---

## Risks and Trade-offs

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Google Maps API costs** | Distance Matrix API charges per element (~$5 per 1000 requests). At scale this adds up. | Cache results in Convex. Re-use cached distance if home and company addresses haven't changed. Batch requests where possible. |
| **Inaccurate matatu pricing** | Matatu fares are informal, vary by time of day and demand, and are not published in a structured format. | Use conservative bracket estimates. Allow the user to override the calculated amount on the dashboard. Display costs as "estimates." |
| **API key exposure** | Leaking the Google Maps API key could result in unauthorized usage charges. | All Distance Matrix calls go through Convex actions (server-side). The Places Autocomplete on the client uses a separate restricted key with HTTP referrer restrictions. |
| **BRT route detection** | No straightforward way to know if a user's route intersects the Thika Road BRT corridor. | Use a simple geofence: if either origin or destination is within a bounding box around Thika Road, show BRT as an option. Otherwise, grey it out. |
| **Nairobi boundary detection** | Determining whether an address is "in Nairobi" is non-trivial. | Use a bounding box approximation for the Nairobi metropolitan area. If either coordinate falls outside, show the "Coming soon" message. |
| **Fuel price volatility** | KES 200/liter is an approximation that can change. | Store fuel price as a configurable constant. Consider a periodic scrape (separate feature) to update it. |

### Trade-offs

| Decision | Trade-off |
|---|---|
| **Server-side API calls only** | Adds latency (client -> Convex -> Google -> Convex -> client) but protects the API key and enables caching. |
| **Pre-calculate all modes** | Slightly more compute per request, but enables instant mode switching on the frontend without additional API calls. |
| **Linear interpolation for matatu** | Simpler than a lookup table with hundreds of routes, but less accurate for specific routes. The user override on the dashboard compensates. |
| **Google Maps over OpenStreetMap** | Google has better coverage and accuracy in Nairobi, but costs money. OSRM (OpenStreetMap) is free but less reliable for Nairobi's informal roads. |
| **No real-time traffic consideration** | Using average duration rather than live traffic keeps costs down and results predictable, but may underestimate Uber/Bolt costs during peak hours. |
