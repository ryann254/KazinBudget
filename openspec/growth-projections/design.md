# Growth Projections - Feature Design

## Overview

A dedicated page in the WorkPlace Budgeting app that projects a user's take-home salary over time at 3-year, 5-year, 7-year, and 10-year horizons. The projections account for salary growth, inflation across multiple expense categories, rent increases, and tax bracket creep under Kenya's PAYE system. The page is scoped to Nairobi and surrounding satellite areas (Juja, Thika, Kitengela, Rongai, etc.).

---

## Approach

### Data Flow

1. The user completes the salary intake form (name, company, location, salary, years of experience).
2. The dashboard scraper modules populate current expenses: rent, food, transport.
3. The taxes module calculates current PAYE, NSSF, NHIF/SHIF deductions.
4. The growth projections page reads all of the above from the Convex database and runs year-by-year compound projections client-side.
5. Results are rendered as a line chart and a comparison table.

### Why Client-Side Projection

The projection math is deterministic and lightweight (at most 10 iterations of simple arithmetic). Running it on the client avoids unnecessary Convex function calls and keeps the page instantly responsive when the user adjusts assumption sliders. The raw assumptions (rates) are stored in a Convex table so they can be updated centrally without redeploying the app.

---

## Projection Formulas

All projections are computed year-by-year from Year 0 (current) to Year 10. Milestone snapshots are extracted at years 3, 5, 7, and 10.

### Salary Growth

```
future_salary(y) = current_salary * (1 + salary_growth_rate) ^ y
```

- **Default rate**: 7.5% per annum (midpoint of 5-10% range for Kenya).
- Source: Kenya National Bureau of Statistics (KNBS) wage index, industry salary surveys (e.g., Brighter Monday salary reports).
- The rate is user-adjustable via a slider (range 0-20%).

### Inflation-Adjusted Expenses

Each expense category has its own inflation rate:

| Category  | Default Annual Rate | Rationale |
|-----------|-------------------|-----------|
| Rent      | Variable by tier  | See rent tiers below |
| Food      | 7.0%              | Tracks Kenya CPI food basket, historically 6-8% |
| Transport | 6.0%              | Fuel price volatility, matatu fare adjustments, 5-7% range |
| Custom expenses | 6.5%        | General CPI proxy for user-added items (gym, utilities, etc.) |

**Rent inflation tiers** (based on area classification already captured by the rent scraper):

| Tier      | Areas (examples)              | Annual Rate |
|-----------|-------------------------------|-------------|
| Premium   | Westlands, Kilimani, Lavington | 4.0%       |
| Middle    | South B, South C, Langata      | 3.5%       |
| Budget    | Roysambu, Kasarani, Embakasi   | 3.0%       |
| Satellite | Juja, Thika, Kitengela, Rongai | 5.0%       |

```
future_rent(y)      = current_rent      * (1 + rent_inflation_rate) ^ y
future_food(y)      = current_food      * (1 + food_inflation_rate) ^ y
future_transport(y) = current_transport  * (1 + transport_inflation_rate) ^ y
future_custom(y)    = current_custom    * (1 + custom_inflation_rate) ^ y

future_total_expenses(y) = future_rent(y) + future_food(y) + future_transport(y) + future_custom(y)
```

### Tax Bracket Creep (Kenya PAYE 2024 Rates)

As salary grows, the user may shift into higher PAYE bands. Taxes are recalculated each projected year using the current Kenyan tax table:

| Monthly Taxable Income (KES) | Rate |
|------------------------------|------|
| Up to 24,000                 | 10%  |
| 24,001 - 32,333              | 25%  |
| 32,334 - 500,000             | 30%  |
| 500,001 - 800,000            | 32.5%|
| Above 800,000                | 35%  |

Personal relief: KES 2,400/month.

Statutory deductions recalculated per projected year:
- **NSSF** (Tier I + Tier II): 6% of gross, capped at KES 2,160/month (current).
- **SHIF**: 2.75% of gross salary.
- **Housing Levy**: 1.5% of gross salary.

```
future_taxes(y) = calculate_paye(future_salary(y)) + calculate_nssf(future_salary(y))
                  + calculate_shif(future_salary(y)) + calculate_housing_levy(future_salary(y))
                  - personal_relief
```

### Take-Home Projection

```
future_take_home(y) = future_salary(y) - future_taxes(y) - future_total_expenses(y)
```

### Real vs Nominal View

The page offers a toggle between:
- **Nominal**: Raw projected figures.
- **Real (inflation-adjusted)**: All future values discounted back to today's purchasing power using general CPI inflation (default 7.0%).

```
real_value(y) = nominal_value(y) / (1 + general_inflation) ^ y
```

---

## Inflation Assumptions & Data Sources

| Assumption | Default | Source |
|------------|---------|--------|
| General CPI inflation | 7.0% | Central Bank of Kenya (CBK) monetary policy reports, KNBS CPI |
| Salary growth rate | 7.5% | KNBS wage index, industry surveys |
| Rent inflation (by tier) | 3.0-5.0% | HassConsult Rental Index, BuyRentKenya data |
| Food inflation | 7.0% | KNBS CPI food & non-alcoholic beverages |
| Transport inflation | 6.0% | EPRA fuel price data, KNBS transport CPI |

These defaults are stored in a Convex `growthAssumptions` table. An admin or future scraping job can update them. Users can also override them per session via sliders on the projections page.

---

## UI Design

### Page Layout

The page is accessible via `/growth` in TanStack Router.

**Top section - Summary cards (4 cards in a row, responsive grid):**
- Year 3 projected take-home (monthly)
- Year 5 projected take-home (monthly)
- Year 7 projected take-home (monthly)
- Year 10 projected take-home (monthly)

Each card shows the absolute value plus the percentage change from current take-home.

**Middle section - Line chart:**
- X-axis: Year (0-10)
- Y-axis: Monthly amount (KES)
- Lines: Salary (green), Take-home (blue), Total Expenses (red), Taxes (orange)
- Vertical dashed reference lines at years 3, 5, 7, 10
- Tooltip showing all values on hover
- Toggle button: Nominal / Real (inflation-adjusted)

**Bottom section - Detailed comparison table:**

| Metric | Current | Year 3 | Year 5 | Year 7 | Year 10 |
|--------|---------|--------|--------|--------|---------|
| Gross Salary | ... | ... | ... | ... | ... |
| PAYE | ... | ... | ... | ... | ... |
| NSSF | ... | ... | ... | ... | ... |
| SHIF | ... | ... | ... | ... | ... |
| Housing Levy | ... | ... | ... | ... | ... |
| Rent | ... | ... | ... | ... | ... |
| Food | ... | ... | ... | ... | ... |
| Transport | ... | ... | ... | ... | ... |
| Custom Expenses | ... | ... | ... | ... | ... |
| **Take-Home** | **...** | **...** | **...** | **...** | **...** |

**Right sidebar (collapsible on mobile) - Assumptions panel:**
- Sliders for each rate (salary growth, rent inflation, food inflation, transport inflation, general CPI)
- Dropdown for rent tier override
- Reset to defaults button

### Chart Library

**Recharts** (via shadcn/ui chart components). shadcn/ui wraps Recharts and provides `<ChartContainer>`, `<ChartTooltip>`, `<ChartTooltipContent>`, and `<ChartLegend>` components that are already styled with TailwindCSS and respect the app's theme.

Installation: `npx shadcn@latest add chart` (adds the chart primitives and Recharts as a dependency).

---

## Tech Stack & Tools

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend framework | React (via Vite) | Component rendering |
| Styling | TailwindCSS + shadcn/ui | UI components, cards, table, sliders |
| Charts | Recharts (via shadcn/ui chart) | Line chart for projections |
| Routing | TanStack Router | `/growth` page route |
| Backend / DB | Convex | Store assumptions, user data, expense snapshots |
| State | React hooks (`useMemo`, `useState`) | Projection calculation, slider state |

---

## Files to Create / Edit

### New Files

| File | Purpose |
|------|---------|
| `src/routes/growth.tsx` | TanStack Router page component for `/growth` |
| `src/lib/projections.ts` | Pure functions: `projectSalary`, `projectExpenses`, `calculateFutureTaxes`, `projectTakeHome`. No side effects, fully testable. |
| `src/lib/kenya-tax.ts` | Kenya PAYE calculation, NSSF, SHIF, Housing Levy helpers. Reusable across the app (dashboard taxes module may already partially exist -- share logic). |
| `src/components/growth/projection-chart.tsx` | Recharts line chart wrapped in shadcn `ChartContainer` |
| `src/components/growth/projection-table.tsx` | Detailed comparison table using shadcn `Table` |
| `src/components/growth/milestone-cards.tsx` | Four summary cards for years 3/5/7/10 |
| `src/components/growth/assumptions-panel.tsx` | Sidebar with sliders for rate overrides |
| `convex/growthAssumptions.ts` | Convex schema and query for default growth/inflation assumptions |
| `convex/schema.ts` (edit) | Add `growthAssumptions` table definition |
| `src/__tests__/projections.test.ts` | Unit tests for projection math |
| `src/__tests__/kenya-tax.test.ts` | Unit tests for tax calculations |

### Files to Edit

| File | Change |
|------|--------|
| `src/routeTree.gen.ts` (auto) | Auto-generated when `growth.tsx` route file is added |
| `src/components/layout/sidebar.tsx` or equivalent nav | Add "Growth" nav link |

---

## Tests

### Unit Tests (`vitest`)

1. **`projections.test.ts`**
   - `projectSalary`: Given current salary 100,000 and 7.5% growth, year 3 salary = 100,000 * 1.075^3 = 124,229.69 (within rounding).
   - `projectExpenses`: Given current rent 25,000 with 4% inflation, year 5 rent = 25,000 * 1.04^5 = 30,416.32.
   - `projectTakeHome`: End-to-end projection matches hand-calculated values for a known scenario.
   - Edge cases: zero salary, zero expenses, 0% growth, very high growth (cap at reasonable max).

2. **`kenya-tax.test.ts`**
   - PAYE calculation for salary in each bracket boundary.
   - NSSF caps correctly.
   - SHIF at 2.75%.
   - Housing Levy at 1.5%.
   - Personal relief deducted correctly.
   - Monthly salary of KES 50,000 -> verify exact net PAYE.
   - Monthly salary of KES 1,000,000 -> verify top bracket applies.

### Integration Tests

3. **`growth-page.test.tsx`** (React Testing Library)
   - Page renders chart, table, and cards.
   - Changing a slider updates projected values.
   - Nominal/Real toggle changes displayed values.
   - Milestone cards display correct year labels.

---

## Risks & Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tax rates change** | Projections become inaccurate if Kenya Finance Act changes PAYE bands. | Store tax brackets in Convex `taxBrackets` table; update when new Finance Act is passed. Display disclaimer: "Based on current tax rates." |
| **Inflation assumptions are static defaults** | Real-world inflation is volatile and unpredictable. | Allow user overrides via sliders. Show a range (optimistic/pessimistic) in future iteration. Add disclaimer. |
| **Compound projection error accumulation** | Small rate errors compound significantly over 10 years. | Show projections as estimates, not guarantees. Use clearly labeled "projected" language. |
| **Rent tier misclassification** | If the rent scraper categorizes an area into the wrong tier, inflation rate will be off. | Allow user to override rent tier. Show the detected tier and let them correct it. |
| **Custom expenses lack category-specific inflation** | All custom expenses use a single general CPI rate. | Acceptable for MVP. Future iteration could allow per-expense inflation rates. |
| **No salary ceiling modeling** | Salary growth rarely stays constant for 10 years; it typically plateaus. | Add a salary growth decay option in future (e.g., growth rate reduces by 0.5% per year after year 5). |
| **Client-side computation** | If projection logic becomes complex (Monte Carlo simulations, etc.), client may become slow. | Current deterministic model is O(10) iterations -- negligible. Reassess if adding stochastic models. |
| **Chart performance** | Recharts re-renders on every slider change. | Use `useMemo` to memoize projection data. Debounce slider changes (300ms). |
| **Currency formatting** | KES amounts need proper locale formatting (commas, no decimals for whole numbers). | Use `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })` consistently. |
