# Take-Home Salary Calculator -- Tasks

Numbered implementation tasks for the take-home calculator orchestration engine. Each task is a single, focused unit of work.

---

## Phase 1: Shared Types and Pure Aggregator

- [ ] **1. Create Zod schemas and types for the take-home calculator**
  Create `packages/shared/lib/take-home-types.ts`. Define and export:
  - `TakeHomeInputSchema`: `submissionId` (string), `name` (string), `companyName` (string), `companyLocation` (string), `companyLat` (number, optional), `companyLng` (number, optional), `residentialArea` (string), `yearsOfExperience` (number, int, min 0), `monthlyGrossSalary` (number, positive), `bedroomPreference` (enum: `"bedsitter"`, `"1br"`, `"2br"`, default `"1br"`), `transportMode` (enum: `"matatu"`, `"boda"`, `"uber"`, `"car"`, `"brt"`, default `"matatu"`).
  - `ExpenseItemSchema`: `category` (enum: `"tax"`, `"rent"`, `"food"`, `"transport"`, `"custom"`), `label` (string), `amountKES` (number, min 0), `source` (enum: `"live"`, `"cached"`, `"fallback"`, `"manual"`, `"unavailable"`), `confidence` (enum: `"high"`, `"medium"`, `"low"`), `isEditable` (boolean).
  - `TaxSummarySchema`: `paye`, `nssfTotal`, `shif`, `housingLevy`, `totalTax`, `taxableIncome`, `personalRelief` (all numbers).
  - `TakeHomeResultSchema`: `submissionId` (string), `grossSalary` (number), `taxBreakdown` (TaxSummarySchema), `expenses` (array of ExpenseItemSchema), `totalTax`, `totalLivingCosts`, `totalCustomExpenses`, `totalDeductions`, `takeHomeSalary` (all numbers), `calculatedAt` (number), `expiresAt` (number).
  - Export inferred types: `TakeHomeInput`, `ExpenseItem`, `TaxSummary`, `TakeHomeResult`.

- [ ] **2. Write unit tests for the Zod schemas**
  Create `packages/shared/lib/__tests__/take-home-types.test.ts`. Test cases:
  - Valid `TakeHomeInput` with all fields passes.
  - Missing `monthlyGrossSalary` fails.
  - Negative salary fails.
  - `bedroomPreference` defaults to `"1br"` when omitted.
  - `transportMode` defaults to `"matatu"` when omitted.
  - Invalid `bedroomPreference` value `"5br"` fails.
  - Invalid `transportMode` value `"helicopter"` fails.
  - Valid `ExpenseItem` passes.
  - `amountKES` below 0 fails.
  - Valid `TakeHomeResult` passes.
  - `TakeHomeResult` with missing `taxBreakdown` fails.

- [ ] **3. Run schema tests and confirm they pass**
  Execute `pnpm test:unit -- packages/shared/lib/__tests__/take-home-types.test.ts`.

- [ ] **4. Create the pure aggregator function**
  Create `packages/shared/lib/take-home-aggregator.ts`. Export a single pure function:
  ```
  aggregateTakeHome(params: {
    grossSalary: number,
    taxBreakdown: TaxSummary,
    rentCost: { amount: number, source: string, confidence: string },
    foodCost: { amount: number, source: string, confidence: string },
    transportCost: { amount: number, source: string, confidence: string, mode: string },
    customExpenses: { label: string, amountKES: number }[],
    submissionId: string,
  }) => TakeHomeResult
  ```
  The function must:
  - Build an `expenses` array with one `ExpenseItem` per tax line (PAYE, NSSF, SHIF, Housing Levy) plus rent, food, transport, and each custom expense.
  - Compute `totalTax = paye + nssfTotal + shif + housingLevy`.
  - Compute `totalLivingCosts = rent + food + transport`.
  - Compute `totalCustomExpenses = sum of custom expense amounts`.
  - Compute `totalDeductions = totalTax + totalLivingCosts + totalCustomExpenses`.
  - Compute `takeHomeSalary = grossSalary - totalDeductions` (may be negative).
  - Set `calculatedAt = Date.now()` and `expiresAt = Date.now() + 24 * 60 * 60 * 1000`.
  - Return the full `TakeHomeResult` object.

- [ ] **5. Write unit tests for the aggregator**
  Create `packages/shared/lib/__tests__/take-home-aggregator.test.ts`. Test cases:
  - Basic: gross 100,000; tax totaling 20,000; rent 15,000; food 8,800; transport 4,400; no custom => take-home 51,800.
  - Zero salary: all inputs zero => take-home 0.
  - Deductions exceed salary: gross 30,000; deductions 45,000 => take-home -15,000.
  - With custom expenses: add gym 3,000 and utilities 2,000 => total custom 5,000 deducted.
  - Invariant: `totalDeductions + takeHomeSalary === grossSalary` for any input.
  - Invariant: `totalDeductions === totalTax + totalLivingCosts + totalCustomExpenses`.
  - Expenses array contains correct number of items (4 tax items + 3 living items + N custom items).
  - Each expense item has valid `category`, `source`, and `confidence` fields.

- [ ] **6. Run aggregator tests and confirm they pass**
  Execute `pnpm test:unit -- packages/shared/lib/__tests__/take-home-aggregator.test.ts`.

---

## Phase 2: Convex Schema and Database Layer

- [ ] **7. Add `takeHomeResults` table to Convex schema**
  Edit `convex/schema.ts`. Add the `takeHomeResults` table with fields: `submissionId` (id referencing `"submissions"`), `grossSalary` (number), `paye` (number), `nssfTotal` (number), `shif` (number), `housingLevy` (number), `totalTax` (number), `rentCost` (number), `rentSource` (string), `rentConfidence` (string), `foodCost` (number), `foodSource` (string), `foodConfidence` (string), `transportCost` (number), `transportSource` (string), `transportConfidence` (string), `transportMode` (string), `customExpenses` (array of objects with `label: string`, `amountKES: number`), `totalCustomExpenses` (number), `totalLivingCosts` (number), `totalDeductions` (number), `takeHomeSalary` (number), `calculatedAt` (number), `expiresAt` (number). Add index `"by_submission"` on `["submissionId"]`.

- [ ] **8. Push Convex schema and verify deployment**
  Run `npx convex dev` and confirm the `takeHomeResults` table is created without errors.

- [ ] **9. Create the internal query for cache lookup**
  Create `convex/takeHome/getCachedResult.ts`. Export an `internalQuery` named `getCachedResult` that accepts `{ submissionId }`, queries the `takeHomeResults` table using the `"by_submission"` index, and returns the first result (or `null`).

- [ ] **10. Create the internal mutation for storing results**
  Create `convex/takeHome/storeResult.ts`. Export an `internalMutation` named `storeResult` that accepts all fields of the `takeHomeResults` table. It should: query for an existing result with the same `submissionId`, delete it if found, then insert the new result with `calculatedAt` set to `Date.now()` and `expiresAt` set to `Date.now() + 24 * 60 * 60 * 1000`.

- [ ] **11. Create the public query for reading results**
  Create `convex/takeHome/getResult.ts`. Export a `query` named `getResult` that accepts `{ submissionId }` (as `v.id("submissions")`), queries the `takeHomeResults` table by the `"by_submission"` index, orders descending, and returns the first result. This is the query the frontend subscribes to.

---

## Phase 3: Lookup Helper Functions

- [ ] **12. Create the lookup utilities module**
  Create `convex/lib/lookupUtils.ts`. Export:
  - `extractResult<T>(settled: PromiseSettledResult<T>, fallback: T, fallbackSource: string): { data: T; source: string; confidence: string }` -- returns `{ data: settled.value, source: "live", confidence: "high" }` on fulfilled, or `{ data: fallback, source: fallbackSource, confidence: "low" }` on rejected. Log the error on rejection.
  - `withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>` -- wraps a promise with a timeout. If the promise does not resolve within `ms` milliseconds, reject with a `TimeoutError`.

- [ ] **13. Create the rent lookup helper**
  Create `convex/lib/rentLookupHelper.ts`. Export an async function `estimateRentCostHelper({ area, bedrooms, ctx })` that:
  1. Calls `ctx.runQuery(internal.rentLookup.getCached, { area, bedrooms })` to check the rent cache.
  2. If cache hit and not expired, return `{ medianRent, source: "cached" }`.
  3. If cache miss, call the external rent scraping/API logic (import from the rent-cost-lookup module's helper functions).
  4. Write result to cache via `ctx.runMutation`.
  5. On any error, return the hardcoded fallback from `rent-fallback-data.ts`.
  Wrap the entire external call in `withTimeout(promise, 10000)`.

- [ ] **14. Create the food lookup helper**
  Create `convex/lib/foodLookupHelper.ts`. Export an async function `estimateFoodCostHelper({ companyLat, companyLng, companyAddress, ctx })` that:
  1. Checks the `foodCostCache` table for a non-expired entry.
  2. If cache hit, return `{ monthlyEstimate, source: "cached" }`.
  3. If cache miss, call Google Places API for nearby restaurants and compute the monthly food estimate.
  4. Write result to cache.
  5. On any error, return the zone-based fallback from `nairobiZones.ts`.
  Wrap the external call in `withTimeout(promise, 10000)`.

- [ ] **15. Create the travel cost helper**
  Create `convex/lib/travelCostHelper.ts`. Export an async function `calculateTravelCostHelper({ homeAddress, companyAddress, ctx })` that:
  1. Call Google Maps Distance Matrix API to get distance and duration.
  2. Compute costs for all transport modes using the pure functions from `travelPricing.ts`.
  3. Return `{ monthlyExpense, distanceKm, durationMinutes, costBreakdown, source: "live" }`.
  4. On any error, return `{ monthlyExpense: 0, source: "unavailable" }`.
  Wrap the external call in `withTimeout(promise, 10000)`.

- [ ] **16. Write unit tests for lookupUtils**
  Create `convex/lib/__tests__/lookupUtils.test.ts`. Test cases:
  - `extractResult` returns fulfilled value with `source: "live"` and `confidence: "high"`.
  - `extractResult` returns fallback with correct source and `confidence: "low"` on rejected promise result.
  - `withTimeout` resolves when the inner promise resolves before the timeout.
  - `withTimeout` rejects with `TimeoutError` when the inner promise exceeds the timeout.

- [ ] **17. Run lookupUtils tests and confirm they pass**
  Execute `pnpm test:unit -- convex/lib/__tests__/lookupUtils.test.ts`.

---

## Phase 4: Main Orchestration Action

- [ ] **18. Create the calculate action**
  Create `convex/takeHome/calculate.ts`. Export a Convex `action` named `calculate` with args: `submissionId` (`v.id("submissions")`), `companyLocation` (string), `companyLat` (optional number), `companyLng` (optional number), `residentialArea` (string), `monthlyGrossSalary` (number), `bedroomPreference` (optional string), `transportMode` (optional string). The handler must:
  1. Call `ctx.runQuery(internal.takeHome.getCachedResult, { submissionId })`. If result exists and `expiresAt > Date.now()`, return it immediately.
  2. Import and call `calculateKenyanDeductions(monthlyGrossSalary)` from `packages/shared/lib/kenya-tax-calculator.ts` (synchronous).
  3. Run three lookups in parallel using `Promise.allSettled([estimateRentCostHelper(...), estimateFoodCostHelper(...), calculateTravelCostHelper(...)])`.
  4. Process each settled result with `extractResult` and appropriate fallbacks.
  5. Load custom expenses via `ctx.runQuery(internal.expenses.getCustomExpenses, { submissionId })`.
  6. Call `aggregateTakeHome(...)` from `packages/shared/lib/take-home-aggregator.ts` to build the final result.
  7. Store the result via `ctx.runMutation(internal.takeHome.storeResult, { ... })`.
  8. Return the result.

- [ ] **19. Create a wrapper for frontend invocation**
  Create `convex/takeHome/requestCalculation.ts`. Export a public `mutation` named `requestCalculation` that accepts the same args as the action. The mutation:
  1. Validates that the `submissionId` exists in the `submissions` table.
  2. Updates the submission's `status` to `"calculating"`.
  3. Schedules the `calculate` action via `ctx.scheduler.runAfter(0, internal.takeHome.calculate, args)`.
  4. Returns the `submissionId` so the frontend can subscribe to `getResult`.
  This pattern lets the frontend fire-and-forget the mutation and reactively wait for the result via the `getResult` query.

---

## Phase 5: Integration Tests

- [ ] **20. Write integration tests for the calculate action**
  Create `convex/takeHome/__tests__/calculate.test.ts`. Mock the three lookup helpers to return fixed values. Test cases:
  - Happy path: all lookups return valid data. Verify the returned `TakeHomeResult` has correct `takeHomeSalary`, `totalTax`, `totalLivingCosts`, and that the result is stored in the DB.
  - Cache hit: pre-insert a non-expired `takeHomeResults` row. Call calculate. Verify the action returns the cached result without calling any lookup helpers.
  - Cache expired: pre-insert an expired row. Call calculate. Verify lookups run and a fresh result is stored.
  - Rent lookup fails: mock rent helper to throw. Verify food and transport still succeed. Verify `rentSource` is `"fallback"` and `rentConfidence` is `"low"`.
  - Food lookup fails: mock food helper to throw. Verify `foodSource` is `"fallback"`.
  - Transport lookup fails: mock transport helper to throw. Verify `transportCost` is 0 and `transportSource` is `"unavailable"`.
  - All lookups fail: all three throw. Verify calculation still completes. Verify all sources are fallback/unavailable.
  - Custom expenses included: pre-insert custom expenses. Verify `totalCustomExpenses` matches their sum. Verify `totalDeductions` includes them.
  - Result stored correctly: verify all fields in `takeHomeResults` match expected values by querying the table after the action completes.

- [ ] **21. Run integration tests and confirm they pass**
  Execute `pnpm test:unit -- convex/takeHome/__tests__/calculate.test.ts`.

---

## Phase 6: Frontend Wiring

- [ ] **22. Create a custom hook for the take-home calculation**
  Create `packages/web/src/hooks/useTakeHomeCalculation.ts`. Export a hook `useTakeHomeCalculation(submissionId: string)` that:
  - Uses `useMutation` from Convex to call `takeHome/requestCalculation`.
  - Uses `useQuery` from Convex to subscribe to `takeHome/getResult` with the `submissionId`.
  - Returns `{ trigger, result, isLoading, error }` where `trigger` calls the mutation, `result` is the reactive query result, `isLoading` is true while `result` is `undefined` or `null`, and `error` captures any mutation errors.

- [ ] **23. Integrate the hook into the dashboard page**
  Edit `packages/web/src/routes/dashboard.tsx` (or equivalent). After the user submits the form and navigates to the dashboard:
  1. Read the `submissionId` from the route params or state.
  2. Call `useTakeHomeCalculation(submissionId)`.
  3. On mount (or via a "Calculate" button), call `trigger()` to kick off the calculation.
  4. Display a loading skeleton while `isLoading` is true.
  5. When `result` arrives, render the take-home breakdown (pass result to child components).

- [ ] **24. Create the TakeHomeSummaryCard component**
  Create `packages/web/src/components/TakeHomeSummaryCard.tsx`. Accepts a `TakeHomeResult` prop. Displays:
  - Gross salary (formatted as KES).
  - Total deductions (formatted as KES, colored red).
  - Take-home salary (formatted as KES, colored green if positive, red if negative).
  - If take-home is negative, show a warning banner: "Your estimated expenses exceed your salary by KES X."
  - A "Recalculate" button that calls the `trigger` function (passed as a prop or via context).
  Use shadcn/ui `Card`, `Badge`, and Tailwind for styling.

- [ ] **25. Create the DeductionsBreakdown component**
  Create `packages/web/src/components/DeductionsBreakdown.tsx`. Accepts the `expenses` array from `TakeHomeResult`. Renders a grouped list:
  - **Statutory Deductions** section: PAYE, NSSF, SHIF, Housing Levy with amounts.
  - **Living Costs** section: Rent, Food, Transport with amounts and source badges.
  - **Custom Expenses** section: List of user-added expenses with amounts.
  Each item shows its `source` badge (e.g., "Live Data", "Estimated", "Manual") using the `confidence` field for badge color (green for high, yellow for medium, red for low).

---

## Phase 7: E2E Tests and Polish

- [ ] **26. Write E2E test for the full calculation flow**
  Create `e2e/take-home-calc.spec.ts`. Test cases:
  - Navigate to `/`, fill the form with valid data (name, company, Westlands as company location, Kilimani as home, 3 years experience, 100,000 KES salary), submit.
  - Verify navigation to the dashboard.
  - Verify the take-home summary card appears with a KES amount.
  - Verify the deductions breakdown shows tax, rent, food, and transport sections.
  - Verify each section has a non-zero amount (or an "Unable to estimate" message for transport if API is mocked).

- [ ] **27. Write E2E test for negative take-home warning**
  In the same E2E spec file, add a test: submit with a very low salary (e.g., 10,000 KES) and a premium area (Westlands). Verify the warning banner appears stating expenses exceed income.

- [ ] **28. Add "Last calculated" timestamp to the summary card**
  In `TakeHomeSummaryCard.tsx`, display "Last calculated: X minutes ago" using the `calculatedAt` field from the result. Use a relative time formatter (e.g., `Intl.RelativeTimeFormat` or a small utility function).

- [ ] **29. Add error boundary for calculation failures**
  Wrap the dashboard's calculation section in a React error boundary. If the action or query throws an unrecoverable error, display a user-friendly message: "Something went wrong while calculating your take-home salary. Please try again." with a retry button.

- [ ] **30. Run full verification suite**
  Execute: `pnpm format && pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit && pnpm test:e2e`. Fix any issues found.

- [ ] **31. Commit the feature**
  Stage all new and edited files. Commit with message: `feat(convex): add take-home salary calculator orchestration engine`.
