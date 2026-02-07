# Kenya Tax Calculator — Tasks

All tasks target the `packages/shared/` package. Use named exports only, no default exports, no barrel exports.

---

## 1. Create the tax constants file

- [ ] Create `packages/shared/lib/kenya-tax-constants.ts`.
- [ ] Define and export a `TAX_YEAR` constant set to `2026`.
- [ ] Define and export a `PERSONAL_RELIEF` constant set to `2400`.
- [ ] Define and export a `PAYE_BRACKETS` array with five bracket objects, each having `min`, `max`, and `rate` fields:
  - `{ min: 0, max: 24_000, rate: 0.10 }`
  - `{ min: 24_001, max: 32_333, rate: 0.25 }`
  - `{ min: 32_334, max: 500_000, rate: 0.30 }`
  - `{ min: 500_001, max: 800_000, rate: 0.325 }`
  - `{ min: 800_001, max: Infinity, rate: 0.35 }`
- [ ] Define and export NSSF constants: `NSSF_RATE = 0.06`, `NSSF_LEL = 8_000`, `NSSF_UEL = 72_000`.
- [ ] Define and export SHIF constants: `SHIF_RATE = 0.0275`, `SHIF_MINIMUM = 300`.
- [ ] Define and export Housing Levy constant: `HOUSING_LEVY_RATE = 0.015`.
- [ ] Use `as const` assertions on all constants where applicable.

## 2. Create the Zod schemas and TypeScript types

- [ ] Create `packages/shared/lib/kenya-tax-calculator.ts`.
- [ ] Import `z` from `zod`.
- [ ] Define and export `GrossSalarySchema` as `z.number().nonnegative()` for input validation.
- [ ] Define and export `TaxBreakdownSchema` as a Zod object with these fields (all `z.number()`):
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
- [ ] Export the inferred type: `type TaxBreakdown = z.infer<typeof TaxBreakdownSchema>`.

## 3. Implement the NSSF calculation helper

- [ ] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculateNssf(grossSalary: number)`.
- [ ] Compute Tier I: `Math.round(Math.min(grossSalary, NSSF_LEL) * NSSF_RATE * 100) / 100`.
- [ ] Compute Tier II: `Math.round(Math.max(0, Math.min(grossSalary, NSSF_UEL) - NSSF_LEL) * NSSF_RATE * 100) / 100`.
- [ ] Return `{ tierI, tierII, total: tierI + tierII }`.

## 4. Implement the SHIF calculation helper

- [ ] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculateShif(grossSalary: number)`.
- [ ] Compute: `Math.max(SHIF_MINIMUM, Math.round(grossSalary * SHIF_RATE * 100) / 100)`.
- [ ] If gross salary is 0, return 0 (no SHIF on zero income).
- [ ] Return the SHIF amount.

## 5. Implement the Housing Levy calculation helper

- [ ] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculateHousingLevy(grossSalary: number)`.
- [ ] Compute: `Math.round(grossSalary * HOUSING_LEVY_RATE * 100) / 100`.
- [ ] Return the housing levy amount.

## 6. Implement the PAYE calculation helper

- [ ] In `kenya-tax-calculator.ts`, create a non-exported helper function `calculatePaye(taxableIncome: number)`.
- [ ] Import `PAYE_BRACKETS` and `PERSONAL_RELIEF` from `kenya-tax-constants.ts`.
- [ ] Loop through each bracket. For each bracket, compute the taxable amount that falls within it:
  - `taxableInBand = Math.min(taxableIncome, bracket.max) - bracket.min + 1` (clamped to 0 minimum).
  - But only if `taxableIncome >= bracket.min`.
  - Add `taxableInBand * bracket.rate` to a running `grossTax` total.
- [ ] Subtract `PERSONAL_RELIEF` from `grossTax`.
- [ ] Floor PAYE at 0 (cannot be negative).
- [ ] Round to 2 decimal places.
- [ ] Return `{ grossTax (before relief), personalRelief: PERSONAL_RELIEF, paye (after relief) }`.

## 7. Implement the main `calculateKenyanDeductions` function

- [ ] Export a named function `calculateKenyanDeductions(grossMonthlySalary: number): TaxBreakdown`.
- [ ] Validate input with `GrossSalarySchema.parse(grossMonthlySalary)` — this throws on invalid input.
- [ ] Call `calculateNssf(grossMonthlySalary)` to get NSSF breakdown.
- [ ] Call `calculateShif(grossMonthlySalary)` to get SHIF.
- [ ] Call `calculateHousingLevy(grossMonthlySalary)` to get housing levy.
- [ ] Compute `taxableIncome = grossMonthlySalary - nssf.total - shif - housingLevy`. Floor at 0.
- [ ] Call `calculatePaye(taxableIncome)` to get PAYE breakdown.
- [ ] Compute `totalDeductions = paye + nssf.total + shif + housingLevy`.
- [ ] Compute `netSalary = grossMonthlySalary - totalDeductions`.
- [ ] Assemble and return the `TaxBreakdown` object with all fields populated.

## 8. Write unit tests — basic cases

- [ ] Create `packages/shared/lib/__tests__/kenya-tax-calculator.test.ts`.
- [ ] Import `calculateKenyanDeductions` and `TaxBreakdown` from `kenya-tax-calculator.ts`.
- [ ] Import `describe`, `it`, `expect` from `vitest`.
- [ ] Test: zero salary returns all-zero breakdown, netSalary = 0.
- [ ] Test: salary of KES 15,000 — verify NSSF Tier I = 900, Tier II = 0 (salary > LEL? no, 15000 > 8000 so Tier I = 480, Tier II = (15000 - 8000) * 0.06 = 420), SHIF = max(300, 15000 * 0.0275 = 412.5), Housing Levy = 225. Verify net is correct.
- [ ] Test: salary of KES 100,000 — common salary. Verify NSSF total = 4,320, SHIF = 2,750, Housing Levy = 1,500. Verify PAYE uses correct brackets on taxable income.

## 9. Write unit tests — bracket boundary cases

- [ ] Test: salary of KES 24,000 — right at Band 1 ceiling.
- [ ] Test: salary of KES 32,333 — right at Band 2 ceiling.
- [ ] Test: salary of KES 500,000 — right at Band 3 ceiling.
- [ ] Test: salary of KES 800,000 — right at Band 4 ceiling.
- [ ] Test: salary of KES 1,000,000 — in Band 5.

## 10. Write unit tests — NSSF edge cases

- [ ] Test: salary of KES 5,000 — below LEL. Tier I = 300, Tier II = 0.
- [ ] Test: salary of KES 8,000 — exactly at LEL. Tier I = 480, Tier II = 0.
- [ ] Test: salary of KES 50,000 — between LEL and UEL. Tier I = 480, Tier II = 2,520.
- [ ] Test: salary of KES 72,000 — exactly at UEL. Tier I = 480, Tier II = 3,840.
- [ ] Test: salary of KES 200,000 — above UEL. NSSF total still 4,320.

## 11. Write unit tests — SHIF minimum

- [ ] Test: salary of KES 5,000. SHIF at 2.75% = 137.50, but minimum is 300. Verify SHIF = 300.
- [ ] Test: salary of KES 10,910. SHIF at 2.75% = 300.025. Verify this is the approximate crossover point.
- [ ] Test: salary of KES 50,000. SHIF = 1,375. Verify no minimum override.

## 12. Write unit tests — validation and invariants

- [ ] Test: negative salary throws a Zod validation error.
- [ ] Test: NaN input throws a Zod validation error.
- [ ] Test: for every test case, assert `result.netSalary + result.totalDeductions === result.grossSalary` (within rounding tolerance of KES 1).
- [ ] Test: for every test case, assert `result.totalDeductions === result.paye + result.nssfTotal + result.shif + result.housingLevy` (within rounding tolerance of KES 1).
- [ ] Test: for every test case, assert all numeric fields are >= 0.

## 13. Verify everything passes

- [ ] Run `pnpm test:unit -- packages/shared` and confirm all tests pass.
- [ ] Run `pnpm typecheck` and confirm no TypeScript errors.
- [ ] Run `pnpm lint` and confirm no lint errors.
- [ ] Verify there are no default exports in any of the new files.
- [ ] Verify there are no barrel exports (no `export * from`).
