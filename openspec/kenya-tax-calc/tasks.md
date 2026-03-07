# Kenya Tax Calculator — Tasks

All tasks target the `packages/shared/` package. Use named exports only, no default exports, no barrel exports.

---

## 1. Create the tax constants file

- [x] Create `packages/shared/lib/kenya-tax-constants.ts`.
- [x] Define and export a `TAX_YEAR` constant set to `2026`.
- [x] Define and export a `PERSONAL_RELIEF` constant set to `2400`.
- [x] Define and export a `PAYE_BRACKETS` array with five bracket objects, each having `min`, `max`, and `rate` fields:
  - `{ min: 0, max: 24_000, rate: 0.10 }`
  - `{ min: 24_001, max: 32_333, rate: 0.25 }`
  - `{ min: 32_334, max: 500_000, rate: 0.30 }`
  - `{ min: 500_001, max: 800_000, rate: 0.325 }`
  - `{ min: 800_001, max: Infinity, rate: 0.35 }`
- [x] Define and export NSSF constants: `NSSF_RATE = 0.06`, `NSSF_LEL = 8_000`, `NSSF_UEL = 72_000`.
- [x] Define and export SHIF constants: `SHIF_RATE = 0.0275`, `SHIF_MINIMUM = 300`.
- [x] Define and export Housing Levy constant: `HOUSING_LEVY_RATE = 0.015`.
- [x] Use `as const` assertions on all constants where applicable.

## 2. Create the Zod schemas and TypeScript types

- [x] Create `packages/shared/lib/kenya-tax-calculator.ts`.
- [x] Import `z` from `zod`.
- [x] Define and export `GrossSalarySchema` as `z.number().nonnegative()` for input validation.
- [x] Define and export `TaxBreakdownSchema` as a Zod object with these fields (all `z.number()`):
  - `grossSalary`
  - `nssfTierI`
  - `nssfTierII`
  - `nssfTotal`
  - `shif`
  - `housingLevy`
  - `taxableIncome`
  - `grossTax`
  - `personalRelief`
  - `paye`
  - `totalDeductions`
  - `netSalary`
- [x] Export the inferred type: `type TaxBreakdown = z.infer<typeof TaxBreakdownSchema>`.

## 3. Implement the NSSF calculation helper

- [x] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculateNssf(grossSalary: number)`.
- [x] Compute Tier I: `Math.round(Math.min(grossSalary, NSSF_LEL) * NSSF_RATE * 100) / 100`.
- [x] Compute Tier II: `Math.round(Math.max(0, Math.min(grossSalary, NSSF_UEL) - NSSF_LEL) * NSSF_RATE * 100) / 100`.
- [x] Return `{ tierI, tierII, total: tierI + tierII }`.

## 4. Implement the SHIF calculation helper

- [x] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculateShif(grossSalary: number)`.
- [x] Compute: `Math.max(SHIF_MINIMUM, Math.round(grossSalary * SHIF_RATE * 100) / 100)`.
- [x] If gross salary is 0, return 0 (no SHIF on zero income).
- [x] Return the SHIF amount.

## 5. Implement the Housing Levy calculation helper

- [x] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculateHousingLevy(grossSalary: number)`.
- [x] Compute: `Math.round(grossSalary * HOUSING_LEVY_RATE * 100) / 100`.
- [x] Return the housing levy amount.

## 6. Implement the PAYE calculation helper

- [x] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculatePaye(taxableIncome: number)`.
- [x] Import `PAYE_BRACKETS` and `PERSONAL_RELIEF` from `kenya-tax-constants.ts`.
- [x] Loop through each bracket. For each bracket, compute the taxable amount that falls within it:
  - `taxableInBand = Math.min(taxableIncome, bracket.max) - bracket.min + 1` (clamped to 0 minimum).
  - But only if `taxableIncome >= bracket.min`.
  - Add `taxableInBand * bracket.rate` to a running `grossTax` total.
- [x] Subtract `PERSONAL_RELIEF` from `grossTax`.
- [x] Floor PAYE at 0 (cannot be negative).
- [x] Round to 2 decimal places.
- [x] Return `{ grossTax (before relief), personalRelief: PERSONAL_RELIEF, paye (after relief) }`.

## 7. Implement the main `calculateKenyanDeductions` function

- [x] Export a named function `calculateKenyanDeductions(grossMonthlySalary: number): TaxBreakdown`.
- [x] Validate input with `GrossSalarySchema.parse(grossMonthlySalary)` — this throws on invalid input.
- [x] Call `calculateNssf(grossMonthlySalary)` to get NSSF breakdown.
- [x] Call `calculateShif(grossMonthlySalary)` to get SHIF.
- [x] Call `calculateHousingLevy(grossMonthlySalary)` to get housing levy.
- [x] Compute `taxableIncome = grossMonthlySalary - nssf.total - shif - housingLevy`. Floor at 0.
- [x] Call `calculatePaye(taxableIncome)` to get PAYE breakdown.
- [x] Compute `totalDeductions = paye + nssf.total + shif + housingLevy`.
- [x] Compute `netSalary = grossMonthlySalary - totalDeductions`.
- [x] Assemble and return the `TaxBreakdown` object with all fields populated.

## 8. Write unit tests — basic cases

- [x] Create `packages/shared/lib/__tests__/kenya-tax-calculator.test.ts`.
- [x] Import `calculateKenyanDeductions` and `TaxBreakdown` from `kenya-tax-calculator.ts`.
- [x] Import `describe`, `it`, `expect` from `vitest`.
- [x] Test: zero salary returns all-zero breakdown, netSalary = 0.
- [x] Test: salary of KES 15,000 — verify NSSF Tier I = 900, Tier II = 0 (salary > LEL? no, 15000 > 8000 so Tier I = 480, Tier II = (15000 - 8000) * 0.06 = 420), SHIF = max(300, 15000 * 0.0275 = 412.5), Housing Levy = 225. Verify net is correct.
- [x] Test: salary of KES 100,000 — common salary. Verify NSSF total = 4,320, SHIF = 2,750, Housing Levy = 1,500. Verify PAYE uses correct brackets on taxable income.

## 9. Write unit tests — bracket boundary cases

- [x] Test: salary of KES 24,000 — right at Band 1 ceiling.
- [x] Test: salary of KES 32,333 — right at Band 2 ceiling.
- [x] Test: salary of KES 500,000 — right at Band 3 ceiling.
- [x] Test: salary of KES 800,000 — right at Band 4 ceiling.
- [x] Test: salary of KES 1,000,000 — in Band 5.

## 10. Write unit tests — NSSF edge cases

- [x] Test: salary of KES 5,000 — below LEL. Tier I = 300, Tier II = 0.
- [x] Test: salary of KES 8,000 — exactly at LEL. Tier I = 480, Tier II = 0.
- [x] Test: salary of KES 50,000 — between LEL and UEL. Tier I = 480, Tier II = 2,520.
- [x] Test: salary of KES 72,000 — exactly at UEL. Tier I = 480, Tier II = 3,840.
- [x] Test: salary of KES 200,000 — above UEL. NSSF total still 4,320.

## 11. Write unit tests — SHIF minimum

- [x] Test: salary of KES 5,000. SHIF at 2.75% = 137.50, but minimum is 300. Verify SHIF = 300.
- [x] Test: salary of KES 10,910. SHIF at 2.75% = 300.025. Verify this is the approximate crossover point.
- [x] Test: salary of KES 50,000. SHIF = 1,375. Verify no minimum override.

## 12. Write unit tests — validation and invariants

- [x] Test: negative salary throws a Zod validation error.
- [x] Test: NaN input throws a Zod validation error.
- [x] Test: for every test case, assert `result.netSalary + result.totalDeductions === result.grossSalary` (within rounding tolerance of KES 1).
- [x] Test: for every test case, assert `result.totalDeductions === result.paye + result.nssfTotal + result.shif + result.housingLevy` (within rounding tolerance of KES 1).
- [x] Test: for every test case, assert all numeric fields are >= 0.

## 13. Verify everything passes

- [x] Run `pnpm test:unit -- packages/shared` and confirm all tests pass.
- [x] Run `pnpm typecheck` and confirm no TypeScript errors.
- [x] Run `pnpm lint` and confirm no lint errors.
- [x] Verify there are no default exports in any of the new files.
- [x] Verify there are no barrel exports (no `export * from`).
