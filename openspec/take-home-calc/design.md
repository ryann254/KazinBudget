# Take-Home Salary Calculator -- Design Document

## Overview

The take-home calculator is the core orchestration engine of WorkPlace Budgeting. It is a Convex action that accepts a user's submission data (gross salary, company location, residential area, years of experience), triggers all cost lookups in parallel, calculates Kenyan statutory deductions, aggregates every expense category, stores the complete result in Convex DB, and returns a full breakdown to the frontend.

This feature depends on four upstream modules:

| Dependency | Module | What It Provides |
|---|---|---|
| Tax deductions | `kenya-tax-calc` | PAYE, NSSF, SHIF, Housing Levy from gross salary |
| Rent cost | `rent-cost-lookup` | Monthly rent estimate for the user's residential area |
| Food cost | `food-cost-lookup` | Monthly food cost estimate near the company location |
| Transport cost | `travel-cost-calc` | Monthly commute cost between home and company |

---

## Core Formula

```
Take-Home = Gross Salary
           - PAYE
           - NSSF
           - SHIF
           - Housing Levy
           - Rent
           - Food (work-area meals)
           - Transport (commute)
           - Sum(Custom Expenses)
```

All values are monthly and denominated in KES.

---

## Approach

### Convex Action (Not Query, Not Mutation)

The calculator must be a Convex **action** because:

1. It calls external APIs (Google Maps, Google Places, BrowserBase) through the upstream lookup modules.
2. Actions can perform side effects and run long-running operations (up to 10 minutes on Convex).
3. Actions support up to 1,000 concurrent operations, which is more than enough for our parallel lookups.

However, actions run outside of Convex's transactional model. Each `ctx.runQuery` or `ctx.runMutation` call within an action is its own transaction, so there is no cross-call consistency guarantee. This is acceptable because our lookups are independent and idempotent.

### Why Not `ctx.runAction` for Parallel Lookups

Convex best practices discourage nesting `ctx.runAction` calls via `Promise.all` because each nested action allocates its own server resources and the parent action blocks while holding its resources. Instead, the recommended pattern is:

1. Extract each lookup's logic into a **plain TypeScript helper function**.
2. Call those helpers directly with `Promise.all` inside the single action handler.
3. Only use `ctx.runQuery` / `ctx.runMutation` for database reads and writes.

This avoids the overhead of nested action scheduling while still achieving parallelism through standard `Promise.all` on the `fetch` calls and helper invocations.

### Idempotency

The calculation is idempotent: identical inputs always produce identical outputs. This is achieved by:

- The tax calculator is a pure function with no side effects.
- Cost lookups are cached server-side with deterministic cache keys (area + bedroom count, lat/lng geohash, address pair).
- Results are stored keyed by submission ID. Re-running the calculation for the same submission overwrites with the same values.

### Session-Based Caching

Each user submission creates a unique record in the `submissions` table (from the `user-input-form` feature). The take-home result is stored linked to that submission ID. If the user re-submits with identical inputs, a cache check on the `takeHomeResults` table returns the existing result without re-running lookups.

Cache invalidation: results expire after **24 hours** to account for possible changes in scraped data. The user can also manually trigger a recalculation from the dashboard.

---

## Orchestration Flow

```
User submits form
       |
       v
Frontend calls Convex action: `takeHome/calculate`
       |
       v
Action handler starts:
  1. Validate input with Zod schema
  2. Check takeHomeResults cache (by submission fingerprint)
       |
  [cache hit?] --yes--> return cached result
       |
      no
       |
       v
  3. Run tax calculation (synchronous pure function)
       |  calculateKenyanDeductions(grossMonthlySalary)
       |  => { paye, nssfTotal, shif, housingLevy, netSalary, ... }
       |
  4. Run cost lookups IN PARALLEL via Promise.all:
       |
       |--- estimateRentCost(residentialArea, bedroomPreference)
       |--- estimateFoodCost(companyLat, companyLng, companyAddress)
       |--- calculateTravelCost(homeAddress, companyAddress)
       |
       v
  5. Await all three lookups. Handle partial failures (see below).
       |
       v
  6. Load custom expenses for this user from the `userExpenses` table:
       |  ctx.runQuery(internal.expenses.getCustomExpenses, { userId })
       |
       v
  7. Aggregate everything:
       |  totalTax = paye + nssfTotal + shif + housingLevy
       |  totalLiving = rent + food + transport
       |  totalCustom = sum of custom expense amounts
       |  totalDeductions = totalTax + totalLiving + totalCustom
       |  takeHome = grossSalary - totalDeductions
       |
       v
  8. Store result:
       |  ctx.runMutation(internal.takeHome.storeResult, { ... })
       |
       v
  9. Return complete TakeHomeBreakdown to frontend
```

---

## Parallel Data Fetching

All three cost lookups are independent and can run simultaneously. Inside the action handler:

```typescript
// Helper functions imported from their respective modules
import { estimateRentCostHelper } from "../lib/rentLookupHelper";
import { estimateFoodCostHelper } from "../lib/foodLookupHelper";
import { calculateTravelCostHelper } from "../lib/travelCostHelper";

// Inside the action handler:
const [rentResult, foodResult, travelResult] = await Promise.allSettled([
  estimateRentCostHelper({
    area: args.residentialArea,
    bedrooms: args.bedroomPreference ?? "1br",
    ctx,
  }),
  estimateFoodCostHelper({
    companyLat: args.companyLat,
    companyLng: args.companyLng,
    companyAddress: args.companyLocation,
    ctx,
  }),
  calculateTravelCostHelper({
    homeAddress: args.residentialArea,
    companyAddress: args.companyLocation,
    ctx,
  }),
]);
```

**Why `Promise.allSettled` instead of `Promise.all`:**

`Promise.all` rejects as soon as any single promise rejects, losing the results of the other promises. `Promise.allSettled` waits for all promises to complete (fulfilled or rejected) and returns the status of each. This lets us provide a partial result when one or two lookups fail rather than failing the entire calculation.

---

## Error Handling: Partial Failure Strategy

When one or more lookups fail, the calculator does not abort. Instead, it applies a **graceful degradation** strategy:

| Lookup | On Failure | Fallback Value | User-Facing Indicator |
|---|---|---|---|
| Rent | Use hardcoded zone default for the area's tier | Median of the tier range | Badge: "Estimated (historical data)" |
| Food | Use hardcoded Nairobi zone default | Zone average from `nairobiZones.ts` | Badge: "Estimated (historical data)" |
| Transport | Skip transport cost, set to 0 | KES 0 | Badge: "Unable to estimate. Add manually." |
| Tax | **Cannot fail** (pure function, synchronous) | N/A | N/A |

Each expense item in the result carries a `source` field (`"live"`, `"cached"`, `"fallback"`, `"manual"`, `"unavailable"`) and a `confidence` field (`"high"`, `"medium"`, `"low"`) so the frontend can display appropriate indicators.

```typescript
// Processing a settled promise result
function extractResult<T>(
  settled: PromiseSettledResult<T>,
  fallback: T,
  fallbackSource: string
): { data: T; source: string; confidence: string } {
  if (settled.status === "fulfilled") {
    return { data: settled.value, source: "live", confidence: "high" };
  }
  console.error(`Lookup failed: ${settled.reason}`);
  return { data: fallback, source: fallbackSource, confidence: "low" };
}
```

---

## TypeScript Types

All types use `type` (not `interface`) per project convention. Validated with Zod at the action boundary.

```typescript
import { z } from "zod";

// --- Input Schema ---
const TakeHomeInputSchema = z.object({
  submissionId: z.string(),
  name: z.string(),
  companyName: z.string(),
  companyLocation: z.string(),
  companyLat: z.number().optional(),
  companyLng: z.number().optional(),
  residentialArea: z.string(),
  yearsOfExperience: z.number().int().min(0),
  monthlyGrossSalary: z.number().positive(),
  bedroomPreference: z.enum(["bedsitter", "1br", "2br"]).optional().default("1br"),
  transportMode: z.enum(["matatu", "boda", "uber", "car", "brt"]).optional().default("matatu"),
});

// --- Expense Item ---
const ExpenseItemSchema = z.object({
  category: z.enum(["tax", "rent", "food", "transport", "custom"]),
  label: z.string(),
  amountKES: z.number().min(0),
  source: z.enum(["live", "cached", "fallback", "manual", "unavailable"]),
  confidence: z.enum(["high", "medium", "low"]),
  isEditable: z.boolean(),
});

// --- Tax Breakdown (re-exported from kenya-tax-calc) ---
const TaxSummarySchema = z.object({
  paye: z.number(),
  nssfTotal: z.number(),
  shif: z.number(),
  housingLevy: z.number(),
  totalTax: z.number(),
  taxableIncome: z.number(),
  personalRelief: z.number(),
});

// --- Full Result ---
const TakeHomeResultSchema = z.object({
  submissionId: z.string(),
  grossSalary: z.number(),
  taxBreakdown: TaxSummarySchema,
  expenses: z.array(ExpenseItemSchema),
  totalTax: z.number(),
  totalLivingCosts: z.number(),
  totalCustomExpenses: z.number(),
  totalDeductions: z.number(),
  takeHomeSalary: z.number(),
  calculatedAt: z.number(),
  expiresAt: z.number(),
});

// --- Derived types ---
type TakeHomeInput = z.infer<typeof TakeHomeInputSchema>;
type ExpenseItem = z.infer<typeof ExpenseItemSchema>;
type TaxSummary = z.infer<typeof TaxSummarySchema>;
type TakeHomeResult = z.infer<typeof TakeHomeResultSchema>;
```

---

## Convex Action Design

### Action: `takeHome/calculate`

This is the primary entry point. It is an **internal action** (callable from the frontend via a wrapper mutation that validates and schedules it, or directly from the client if using Convex's action client).

```typescript
// convex/takeHome/calculate.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { calculateKenyanDeductions } from "../../packages/shared/lib/kenya-tax-calculator";

export const calculate = action({
  args: {
    submissionId: v.id("submissions"),
    companyLocation: v.string(),
    companyLat: v.optional(v.number()),
    companyLng: v.optional(v.number()),
    residentialArea: v.string(),
    monthlyGrossSalary: v.number(),
    bedroomPreference: v.optional(v.string()),
    transportMode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check cache
    const cached = await ctx.runQuery(
      internal.takeHome.getCachedResult,
      { submissionId: args.submissionId }
    );
    if (cached && cached.expiresAt > Date.now()) {
      return cached;
    }

    // 2. Calculate taxes (synchronous, pure function)
    const taxBreakdown = calculateKenyanDeductions(args.monthlyGrossSalary);

    // 3. Run cost lookups in parallel
    const [rentSettled, foodSettled, travelSettled] = await Promise.allSettled([
      estimateRentCostHelper({ area: args.residentialArea, bedrooms: args.bedroomPreference ?? "1br", ctx }),
      estimateFoodCostHelper({ companyLat: args.companyLat, companyLng: args.companyLng, companyAddress: args.companyLocation, ctx }),
      calculateTravelCostHelper({ homeAddress: args.residentialArea, companyAddress: args.companyLocation, ctx }),
    ]);

    // 4. Extract results with fallbacks
    const rent = extractResult(rentSettled, getFallbackRent(args.residentialArea, args.bedroomPreference), "fallback");
    const food = extractResult(foodSettled, getFallbackFood(args.companyLocation), "fallback");
    const travel = extractResult(travelSettled, { monthlyExpense: 0 }, "unavailable");

    // 5. Load custom expenses
    const customExpenses = await ctx.runQuery(
      internal.expenses.getCustomExpenses,
      { submissionId: args.submissionId }
    );

    // 6. Aggregate
    const totalTax = taxBreakdown.paye + taxBreakdown.nssfTotal + taxBreakdown.shif + taxBreakdown.housingLevy;
    const totalLiving = rent.data.medianRent + food.data.monthlyEstimate + travel.data.monthlyExpense;
    const totalCustom = customExpenses.reduce((sum, e) => sum + e.amountKES, 0);
    const totalDeductions = totalTax + totalLiving + totalCustom;
    const takeHome = args.monthlyGrossSalary - totalDeductions;

    // 7. Build result
    const result = { /* ... full TakeHomeResult object ... */ };

    // 8. Store
    await ctx.runMutation(internal.takeHome.storeResult, result);

    return result;
  },
});
```

### Query: `takeHome/getResult`

Reactive Convex query that the frontend subscribes to. Returns the latest result for a given submission.

```typescript
// convex/takeHome/getResult.ts
export const getResult = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("takeHomeResults")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .order("desc")
      .first();
  },
});
```

### Mutation: `takeHome/storeResult`

Internal mutation that persists the calculation result.

```typescript
// convex/takeHome/storeResult.ts
export const storeResult = internalMutation({
  args: { /* all fields of TakeHomeResult as Convex validators */ },
  handler: async (ctx, args) => {
    // Upsert: delete old result for this submission, insert new one
    const existing = await ctx.db
      .query("takeHomeResults")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    await ctx.db.insert("takeHomeResults", {
      ...args,
      calculatedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24-hour TTL
    });
  },
});
```

---

## Convex Schema Additions

```typescript
// convex/schema.ts (additions)

takeHomeResults: defineTable({
  submissionId: v.id("submissions"),
  grossSalary: v.number(),

  // Tax breakdown
  paye: v.number(),
  nssfTotal: v.number(),
  shif: v.number(),
  housingLevy: v.number(),
  totalTax: v.number(),

  // Living cost breakdown
  rentCost: v.number(),
  rentSource: v.string(),
  rentConfidence: v.string(),
  foodCost: v.number(),
  foodSource: v.string(),
  foodConfidence: v.string(),
  transportCost: v.number(),
  transportSource: v.string(),
  transportConfidence: v.string(),
  transportMode: v.string(),

  // Custom expenses snapshot
  customExpenses: v.array(v.object({
    label: v.string(),
    amountKES: v.number(),
  })),
  totalCustomExpenses: v.number(),

  // Totals
  totalLivingCosts: v.number(),
  totalDeductions: v.number(),
  takeHomeSalary: v.number(),

  // Metadata
  calculatedAt: v.number(),
  expiresAt: v.number(),
})
  .index("by_submission", ["submissionId"]),
```

---

## Files to Create

| File | Purpose |
|---|---|
| `packages/shared/lib/take-home-types.ts` | Zod schemas and derived TypeScript types for `TakeHomeInput`, `ExpenseItem`, `TaxSummary`, `TakeHomeResult`. |
| `packages/shared/lib/take-home-aggregator.ts` | Pure function `aggregateTakeHome(taxBreakdown, rentCost, foodCost, transportCost, customExpenses, grossSalary)` that combines all inputs into a `TakeHomeResult`. No side effects, no async. |
| `convex/takeHome/calculate.ts` | Convex action: the main orchestrator. Validates input, checks cache, calls tax calculator, runs parallel lookups, calls the aggregator, stores result. |
| `convex/takeHome/getResult.ts` | Convex query: returns the cached result for a submission ID. Used by the frontend for reactive updates. |
| `convex/takeHome/storeResult.ts` | Convex internal mutation: persists (upserts) the calculation result to `takeHomeResults`. |
| `convex/takeHome/getCachedResult.ts` | Convex internal query: checks if a non-expired result exists for the submission. Used by the action for cache checks. |
| `convex/lib/rentLookupHelper.ts` | TypeScript helper wrapping rent cost lookup logic (cache check via `ctx.runQuery`, external fetch, fallback). Callable from within the action without nesting actions. |
| `convex/lib/foodLookupHelper.ts` | TypeScript helper wrapping food cost lookup logic. Same pattern as rent. |
| `convex/lib/travelCostHelper.ts` | TypeScript helper wrapping travel cost calculation logic. Same pattern. |
| `convex/lib/lookupUtils.ts` | Shared utilities: `extractResult` function for `PromiseSettledResult` handling, fallback data loaders. |
| `packages/shared/lib/__tests__/take-home-aggregator.test.ts` | Unit tests for the pure aggregator function. |
| `convex/takeHome/__tests__/calculate.test.ts` | Integration tests for the full orchestration action with mocked lookups. |

## Files to Edit

| File | Change |
|---|---|
| `convex/schema.ts` | Add `takeHomeResults` table definition. |
| `convex/_generated/api.ts` | Auto-generated by Convex after schema push. |
| `packages/web/src/routes/dashboard.tsx` (or equivalent) | Call the `takeHome/calculate` action on page load and subscribe to `takeHome/getResult` for reactive display. |

---

## Tests

### Unit Tests (Vitest)

#### `take-home-aggregator.test.ts`

| Test Case | Input | Expected |
|---|---|---|
| Basic aggregation | Gross 100,000; tax 20,000; rent 15,000; food 8,800; transport 4,400; no custom | Take-home = 51,800 |
| Zero salary | Gross 0; all deductions 0 | Take-home = 0 |
| Deductions exceed salary | Gross 30,000; total deductions 45,000 | Take-home = -15,000 (negative, flagged as warning) |
| With custom expenses | Gross 100,000; tax 20,000; rent 15,000; food 8,800; transport 4,400; gym 3,000 + utilities 2,000 | Take-home = 46,800 |
| Invariant: totalDeductions + takeHome = grossSalary | Any input | Always holds |
| Invariant: totalDeductions = totalTax + totalLiving + totalCustom | Any input | Always holds |
| All amounts non-negative except takeHome | Any input | Only takeHome may be negative |

#### `take-home-types.test.ts`

| Test Case | Description |
|---|---|
| Valid TakeHomeInput passes schema | All required fields present and valid |
| Missing salary fails | `monthlyGrossSalary` omitted |
| Negative salary fails | `monthlyGrossSalary: -50000` |
| Invalid bedroom preference fails | `bedroomPreference: "5br"` |
| Invalid transport mode fails | `transportMode: "helicopter"` |
| Default values applied | `bedroomPreference` defaults to `"1br"`, `transportMode` defaults to `"matatu"` |

### Integration Tests (Vitest + Convex test helpers)

#### `calculate.test.ts`

| Test Case | Description |
|---|---|
| Happy path: all lookups succeed | Mock rent, food, transport helpers to return fixed values. Verify the final take-home is correct and result is stored. |
| Cache hit: returns stored result | Pre-populate `takeHomeResults` with a non-expired entry. Call calculate. Verify no lookups are triggered. |
| Cache expired: re-calculates | Pre-populate with an expired entry. Call calculate. Verify lookups run and a new result is stored. |
| Rent lookup fails: uses fallback | Mock rent helper to throw. Verify food and transport still succeed. Verify rent falls back to hardcoded. Verify `rentSource` is `"fallback"`. |
| Food lookup fails: uses fallback | Same pattern, food fallback used. |
| Transport lookup fails: zero cost | Transport set to 0, `transportSource` is `"unavailable"`. |
| All lookups fail: all fallbacks | All three throw. Verify calculation still completes with all fallbacks. |
| Custom expenses included | Add custom expenses to DB before calling. Verify they are included in total deductions. |
| Result is stored correctly | Verify all fields written to `takeHomeResults` match expected values. |

### E2E Tests (Playwright)

| Test Case | Description |
|---|---|
| Full flow: form to dashboard | Fill out the form, submit, verify the dashboard shows a take-home breakdown with tax, rent, food, transport sections. |
| Negative take-home warning | Enter a very low salary with high-cost area. Verify the dashboard shows a warning that expenses exceed income. |
| Recalculate button | On the dashboard, click "Recalculate". Verify the action runs again and the result refreshes. |

---

## Risks and Trade-offs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **One lookup is extremely slow (>30s)** | Medium | Delays the entire result since `Promise.allSettled` waits for all | Add per-lookup timeouts (10s each) using `Promise.race` with a timeout promise. If a lookup times out, treat it as a failure and use the fallback. |
| **Convex action timeout (10 min limit)** | Low | Calculation never completes | The 10-second per-lookup timeout keeps total execution well under 1 minute even in worst case. |
| **Stale cached results mislead the user** | Medium | User sees outdated expenses | 24-hour TTL on results. Display "Last calculated: X hours ago" in the UI. Provide a manual recalculate button. |
| **Race condition: user edits custom expenses while calculation runs** | Low | Custom expenses snapshot may be slightly stale | The action snapshots custom expenses at calculation time. If the user edits after, the dashboard shows the live expense list alongside the stored take-home. The user can recalculate to reconcile. |
| **Negative take-home salary confuses users** | Medium | User thinks the app is broken | Display negative take-home with a clear warning: "Your estimated expenses exceed your salary by KES X. Consider adjusting your expenses or negotiating a higher salary." |
| **Tax rates change mid-session** | Low | Incorrect PAYE calculation | Tax calculator uses constants versioned with a `TAX_YEAR` value. The action logs a warning if the current date exceeds the valid tax year. |
| **External API costs accumulate** | Medium | Budget overrun | All lookups are cached (rent 14d, food 7d, transport per address pair). The take-home result is cached 24h. Repeated calculations for the same submission hit caches, not APIs. |

### Trade-offs

| Decision | Benefit | Cost |
|---|---|---|
| **Single Convex action orchestrating everything** | Simple mental model; one function to debug; easy to add new expense categories | If the action grows too large, it becomes hard to test. Mitigated by extracting logic into helper functions. |
| **`Promise.allSettled` over `Promise.all`** | Partial results on failure; never a total failure | Must handle each result individually; more verbose code. |
| **Helper functions instead of nested `ctx.runAction`** | Avoids Convex resource overhead of nested actions; true parallelism | Helpers must manually manage cache reads/writes via `ctx.runQuery`/`ctx.runMutation` rather than being self-contained actions. |
| **24-hour result cache TTL** | Reduces redundant API calls; instant re-loads of the dashboard | Results can be up to 24 hours stale. Mitigated by manual recalculate button. |
| **Storing full result snapshot (including custom expenses)** | Dashboard loads instantly from one query; no need to re-aggregate on read | Storage grows linearly with submissions. Acceptable for expected user volume. |
| **Allowing negative take-home** | Honest signal to the user that their expenses exceed income | May confuse users unfamiliar with budgeting. Mitigated by clear UI copy and warnings. |
| **Pure aggregator in `shared/`** | Testable without Convex; reusable on the client for "what-if" previews | Must keep it in sync with the action's aggregation logic. Mitigated by the action importing and using the shared function directly. |

---

## Future Considerations

- **"What-if" mode on the client:** Import the pure aggregator into the React frontend so users can tweak salary, bedroom count, or transport mode and see instant take-home previews without a server round-trip. The full action is only called once on initial submission; subsequent tweaks use the client-side aggregator.
- **Salary comparison feature:** Use the stored `takeHomeResult` alongside market salary data (from the future `salary-comparison` feature) to show whether the user is underpaid.
- **Growth projections:** The `growth-projection` feature will consume `TakeHomeResult` as its base input and project take-home over 3, 5, 7, and 10 years with inflation adjustments.
- **PDF/export:** Generate a downloadable salary breakdown report from the stored result.
- **Multi-city support:** When expanding beyond Nairobi, the action's structure remains the same; only the lookup helpers need city-specific logic.
