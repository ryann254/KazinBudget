# Kenya Tax Calculator — Design Document

## Overview

This feature implements a pure-function tax calculator that computes all Kenyan statutory deductions from a gross monthly salary and returns the net take-home amount. The calculator covers PAYE (Pay As You Earn), NSSF (National Social Security Fund), SHIF (Social Health Insurance Fund), and the Housing Levy based on 2026 rates.

The function lives in the `shared/` package so it can be consumed by both the Convex backend (for server-side computation and storage) and the React frontend (for instant client-side preview).

---

## Approach

### Pure Function Design

The calculator is a single, side-effect-free function:

```
calculateKenyanDeductions(grossMonthlySalary: number) => TaxBreakdown
```

- **No network calls, no database access, no global state.**
- Deterministic: same input always produces the same output.
- Easy to unit test with simple input/output assertions.
- Easily composable with other expense calculators in the dashboard.

### Why a Pure Function?

| Concern | Decision |
|---------|----------|
| Testability | Pure functions need no mocks, stubs, or test databases. |
| Reusability | Importable from both `packages/web` and `packages/convex`. |
| Performance | Zero async overhead; runs synchronously in < 1ms. |
| Maintainability | When tax rates change, update one constants object and its tests. |

---

## Tax Rules (2026 Rates)

### PAYE (Pay As You Earn)

Progressive monthly tax brackets applied to **taxable income** (gross salary minus NSSF contribution, SHIF contribution, and Housing Levy):

| Band | Monthly Range (KES) | Rate |
|------|---------------------|------|
| 1 | 0 - 24,000 | 10% |
| 2 | 24,001 - 32,333 | 25% |
| 3 | 32,334 - 500,000 | 30% |
| 4 | 500,001 - 800,000 | 32.5% |
| 5 | Above 800,000 | 35% |

After computing the gross tax from the brackets, a **Personal Relief of KES 2,400/month** is subtracted. PAYE cannot go below zero.

### NSSF (National Social Security Fund)

Two-tier contribution model:

| Tier | Pensionable Earnings Base | Rate | Max Contribution |
|------|--------------------------|------|------------------|
| Tier I | min(salary, KES 8,000) | 6% | KES 480 |
| Tier II | min(salary, KES 72,000) - KES 8,000 (floored at 0) | 6% | KES 3,840 |

- **Total maximum NSSF employee contribution: KES 4,320/month.**

### SHIF (Social Health Insurance Fund)

- **Rate:** 2.75% of gross salary.
- **Minimum contribution:** KES 300/month.
- No upper cap specified.

### Housing Levy (Affordable Housing Levy)

- **Rate:** 1.5% of gross salary.
- No cap.

### Deduction Order for PAYE Taxable Income

Taxable income for PAYE is computed as:

```
taxableIncome = grossSalary - nssfTotal - shifContribution - housingLevy
```

NSSF, SHIF, and Housing Levy are all tax-allowable deductions subtracted before applying PAYE brackets.

---

## TypeScript Types

All types use `type` (not `interface`) per project convention. Validated at runtime with Zod schemas.

```typescript
import { z } from "zod";

// --- Zod Schemas ---

const TaxBracketSchema = z.object({
  min: z.number(),
  max: z.number(), // use Infinity for the last bracket
  rate: z.number(),
});

const TaxBreakdownSchema = z.object({
  grossSalary: z.number(),
  nssfTierI: z.number(),
  nssfTierII: z.number(),
  nssfTotal: z.number(),
  shif: z.number(),
  housingLevy: z.number(),
  taxableIncome: z.number(),
  grossTax: z.number(),
  personalRelief: z.number(),
  paye: z.number(),
  totalDeductions: z.number(),
  netSalary: z.number(),
});

// --- Derived Types ---

type TaxBracket = z.infer<typeof TaxBracketSchema>;
type TaxBreakdown = z.infer<typeof TaxBreakdownSchema>;
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `packages/shared/lib/kenya-tax-constants.ts` | All 2026 tax rates, brackets, and limits as named `const` exports. |
| `packages/shared/lib/kenya-tax-calculator.ts` | The `calculateKenyanDeductions` pure function and its Zod schemas/types. |
| `packages/shared/lib/__tests__/kenya-tax-calculator.test.ts` | Vitest unit tests covering all brackets, edge cases, and validation. |

No files need to be edited or deleted.

---

## Files to Edit

None. This is a new, self-contained module in the `shared` package.

---

## Unit Tests

Tests use **Vitest** (project standard). Suggested test cases:

### Bracket Coverage

| Test Case | Gross Salary (KES) | Purpose |
|-----------|---------------------|---------|
| Zero salary | 0 | Edge case: all deductions should be 0, net 0. |
| Below Band 1 ceiling | 15,000 | Only 10% PAYE bracket applies. NSSF Tier I only. |
| Band 1 boundary | 24,000 | Exactly at the first bracket ceiling. |
| Band 2 | 30,000 | Crosses into 25% bracket. |
| Band 2 boundary | 32,333 | Exactly at the second bracket ceiling. |
| Mid Band 3 | 100,000 | Common salary; exercises 30% bracket. Most typical case. |
| Band 3 at NSSF UEL | 72,000 | NSSF contribution hits maximum. |
| Band 4 | 600,000 | Exercises 32.5% bracket. |
| Band 5 | 1,000,000 | Top bracket at 35%. |
| Boundary: Band 4/5 | 800,000 | Exactly at the boundary. |

### NSSF-Specific Tests

- Salary below LEL (KES 8,000): Tier I = 6% of salary, Tier II = 0.
- Salary between LEL and UEL: Tier I = 480, Tier II = 6% of (salary - 8,000).
- Salary above UEL (KES 72,000): Tier I = 480, Tier II = 3,840, Total = 4,320.

### SHIF-Specific Tests

- Very low salary where 2.75% < 300: SHIF should be KES 300 (minimum).
- Normal salary: SHIF = 2.75% of gross.

### Validation Tests

- Negative salary input: should throw or return an error.
- Non-numeric input: Zod schema rejects it.

### Invariant Tests

- `netSalary + totalDeductions === grossSalary` (always).
- `totalDeductions === paye + nssfTotal + shif + housingLevy` (always).
- All numeric fields are non-negative.

---

## Risks and Tradeoffs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tax rates change mid-year or retroactively | Medium | High - incorrect calculations | Isolate all rates in `kenya-tax-constants.ts`. Add a `TAX_YEAR` constant. Log a warning or display a notice if the app is used past the valid tax year. |
| NSSF new rates contested in court (has happened before) | Medium | Medium - old rates may apply | Keep both old-rate and new-rate constant sets. Add a feature flag or config toggle. |
| Edge-case rounding errors (KES has no sub-units in practice) | Low | Low - off by a few shillings | Round all final amounts to 2 decimal places using `Math.round(x * 100) / 100`. Document rounding policy. |
| Users confuse monthly vs. annual salary | Medium | High - 12x error | Validate input and clearly label the function as monthly. Provide an optional annual wrapper that divides by 12. |
| Missing deductions (e.g., NITA levy for employers) | Low | Low - understates employer cost | Clearly document that this calculator covers **employee** deductions only. Employer-side levies are out of scope for v1. |

### Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| Pure function in `shared/` | Cannot auto-fetch latest rates from KRA. Rates must be manually updated. Gain: simplicity, testability, offline use. |
| Single monthly input only | Does not handle per-job or annual scenarios without a wrapper. Gain: simpler API surface. |
| No database persistence of rates | Changing rates requires a code deploy. Gain: no runtime dependency on DB; calculator works even if Convex is down. |
| Rounding to 2 decimal places | May accumulate micro-errors over 12 months if summed. Gain: matches how salaries are actually paid in KES. |
| Zod validation at the boundary | Adds a small runtime cost on each call. Gain: catches bad input before it produces nonsensical results. |

---

## Future Considerations

- **Annual salary wrapper:** `calculateAnnualDeductions(annualSalary)` that divides by 12, calls the monthly function, and multiplies results back.
- **Insurance Relief:** KRA allows an insurance relief of 15% of insurance premiums paid, up to KES 5,000/month. Can be added as an optional parameter.
- **Disability Exemption:** Persons with disability get a tax exemption on the first KES 150,000 monthly. Can be added as an optional flag.
- **Rate versioning:** If rates change, maintain a `TaxRateSet` type and allow the function to accept a specific rate set for historical calculations.
- **Integration with dashboard:** The expense dashboard will call this function and display the breakdown as a pie/bar chart.
