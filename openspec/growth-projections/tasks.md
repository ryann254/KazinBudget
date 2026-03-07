# Growth Projections - Tasks

## Setup

- [ ] 1. Install the shadcn chart component: run `npx shadcn@latest add chart`. This adds Recharts as a dependency and provides `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, and `ChartLegend` components.

- [ ] 2. Install shadcn `slider` component if not already present: run `npx shadcn@latest add slider`.

- [ ] 3. Install shadcn `table` component if not already present: run `npx shadcn@latest add table`.

- [ ] 4. Install shadcn `card` component if not already present: run `npx shadcn@latest add card`.

---

## Kenya Tax Calculation Module

- [x] 5. Create `src/lib/kenya-tax.ts`. Export the following pure functions:
  - `calculatePAYE(monthlyGross: number): number` - Implement Kenya PAYE brackets: 10% up to 24,000; 25% for 24,001-32,333; 30% for 32,334-500,000; 32.5% for 500,001-800,000; 35% above 800,000. Subtract personal relief of KES 2,400.
  - `calculateNSSF(monthlyGross: number): number` - 6% of gross, capped at KES 2,160/month.
  - `calculateSHIF(monthlyGross: number): number` - 2.75% of gross.
  - `calculateHousingLevy(monthlyGross: number): number` - 1.5% of gross.
  - `calculateTotalDeductions(monthlyGross: number): number` - Sum of all the above.
  - `calculateNetSalary(monthlyGross: number): number` - Gross minus total deductions.

- [x] 6. Write unit tests in `src/__tests__/kenya-tax.test.ts`:
  - Test PAYE for salary KES 20,000 (only 10% bracket).
  - Test PAYE for salary KES 30,000 (spans two brackets).
  - Test PAYE for salary KES 100,000 (spans three brackets).
  - Test PAYE for salary KES 600,000 (spans four brackets).
  - Test PAYE for salary KES 1,000,000 (spans all five brackets).
  - Test that personal relief is subtracted and result is never negative.
  - Test NSSF cap at KES 2,160.
  - Test SHIF at 2.75% for various salaries.
  - Test Housing Levy at 1.5% for various salaries.

---

## Projection Engine

- [x] 7. Create `src/lib/projections.ts`. Define TypeScript types:
  ```ts
  type ProjectionInput = {
    currentSalary: number;       // monthly gross
    currentRent: number;         // monthly
    currentFood: number;         // monthly
    currentTransport: number;    // monthly
    currentCustomExpenses: number; // monthly total of user-added items
    salaryGrowthRate: number;    // e.g., 0.075 for 7.5%
    rentInflationRate: number;   // e.g., 0.04 for 4%
    foodInflationRate: number;   // e.g., 0.07
    transportInflationRate: number; // e.g., 0.06
    customInflationRate: number; // e.g., 0.065
    generalInflationRate: number; // e.g., 0.07 for real-value discounting
  };

  type YearProjection = {
    year: number;
    salary: number;
    paye: number;
    nssf: number;
    shif: number;
    housingLevy: number;
    totalTax: number;
    rent: number;
    food: number;
    transport: number;
    customExpenses: number;
    totalExpenses: number;
    takeHome: number;
    takeHomeReal: number; // inflation-adjusted to today's value
  };
  ```

- [x] 8. In `src/lib/projections.ts`, implement and export:
  - `projectYear(input: ProjectionInput, year: number): YearProjection` - Apply compound growth to salary and each expense, recalculate taxes using `kenya-tax.ts` functions, compute take-home and real take-home.
  - `projectAll(input: ProjectionInput, years?: number): YearProjection[]` - Call `projectYear` for each year from 0 to `years` (default 10). Return the full array.
  - `getMilestones(projections: YearProjection[]): { year3: YearProjection; year5: YearProjection; year7: YearProjection; year10: YearProjection }` - Extract the four milestone snapshots from the projections array.

- [x] 9. Write unit tests in `src/__tests__/projections.test.ts`:
  - Test `projectYear` for year 0 returns current values unchanged.
  - Test `projectYear` for year 3 with known inputs matches hand-calculated result.
  - Test `projectAll` returns an array of length 11 (years 0-10).
  - Test `getMilestones` extracts correct years.
  - Test with zero growth rate: all years should have the same salary.
  - Test with zero expenses: take-home = salary - taxes.
  - Test real take-home is less than nominal take-home for year > 0.

---

## Convex Backend

- [x] 10. Edit `convex/schema.ts` to add a `growthAssumptions` table:
  ```ts
  growthAssumptions: defineTable({
    salaryGrowthRate: v.number(),
    rentInflationRates: v.object({
      premium: v.number(),
      middle: v.number(),
      budget: v.number(),
      satellite: v.number(),
    }),
    foodInflationRate: v.number(),
    transportInflationRate: v.number(),
    customInflationRate: v.number(),
    generalInflationRate: v.number(),
    updatedAt: v.number(), // timestamp
  })
  ```

- [x] 11. Create `convex/growthAssumptions.ts` with:
  - A `query` function `getDefaults` that returns the single assumptions document (or hardcoded defaults if none exists in the DB).
  - A `mutation` function `updateDefaults` that upserts the assumptions document (for future admin use).

- [ ] 12. Seed the `growthAssumptions` table with default values: salaryGrowthRate 0.075, rentInflationRates { premium: 0.04, middle: 0.035, budget: 0.03, satellite: 0.05 }, foodInflationRate 0.07, transportInflationRate 0.06, customInflationRate 0.065, generalInflationRate 0.07.

---

## Page Route

- [ ] 13. Create `src/routes/growth.tsx` as a TanStack Router route. The component should:
  - Fetch current user data (salary, expenses) from Convex using `useQuery`.
  - Fetch default growth assumptions from Convex using `useQuery`.
  - Maintain local state for user-overridden rates (initialized from defaults).
  - Compute projections using `projectAll` from `src/lib/projections.ts`, wrapped in `useMemo` depending on inputs and rates.
  - Render the four sub-components: `MilestoneCards`, `ProjectionChart`, `ProjectionTable`, `AssumptionsPanel`.
  - Show a loading skeleton while Convex queries are pending.
  - Show a message prompting the user to complete the salary intake form if no user data exists.

- [ ] 14. Register the route in the TanStack Router route tree. Verify `routeTree.gen.ts` regenerates correctly by running the dev server.

---

## UI Components

- [ ] 15. Create `src/components/growth/milestone-cards.tsx`:
  - Accept `currentTakeHome: number` and `milestones: { year3, year5, year7, year10 }` as props.
  - Render four shadcn `Card` components in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
  - Each card shows: year label, projected monthly take-home (formatted as KES), percentage change from current take-home (green if positive, red if negative).
  - Use `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })` for formatting.

- [ ] 16. Create `src/components/growth/projection-chart.tsx`:
  - Accept `projections: YearProjection[]` and `viewMode: 'nominal' | 'real'` as props.
  - Use shadcn `ChartContainer` wrapping a Recharts `LineChart`.
  - Plot four lines: Salary (green), Take-Home (blue), Total Expenses (red), Taxes (orange).
  - When `viewMode` is `'real'`, use `takeHomeReal` for the take-home line and discount other values similarly.
  - Add `ReferenceLine` components at x=3, x=5, x=7, x=10 with dashed stroke.
  - Add `ChartTooltip` showing all four values on hover, formatted as KES.
  - Add `ChartLegend` at the bottom.
  - Make the chart responsive using Recharts `ResponsiveContainer`.

- [ ] 17. Create `src/components/growth/projection-table.tsx`:
  - Accept `projections: YearProjection[]` and `viewMode: 'nominal' | 'real'` as props.
  - Use shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`.
  - Columns: Metric, Current (Year 0), Year 3, Year 5, Year 7, Year 10.
  - Rows: Gross Salary, PAYE, NSSF, SHIF, Housing Levy, Rent, Food, Transport, Custom Expenses, **Take-Home** (bold).
  - All values formatted as KES.
  - Take-Home row highlighted with a distinct background color.

- [ ] 18. Create `src/components/growth/assumptions-panel.tsx`:
  - Accept current rate values and `onRateChange` callback as props.
  - Render shadcn `Slider` components for: Salary Growth Rate (0-20%, step 0.5%), Rent Inflation (0-15%), Food Inflation (0-15%), Transport Inflation (0-15%), General Inflation (0-15%).
  - Each slider shows a label with the current percentage value.
  - Include a "Reset to Defaults" button that calls `onRateChange` with the Convex defaults.
  - Include a Nominal/Real toggle switch at the top of the panel.
  - On mobile, render as a collapsible section (shadcn `Collapsible`).

---

## Navigation

- [ ] 19. Edit the app's sidebar/navigation component to add a "Growth" link pointing to `/growth`. Use an appropriate icon (e.g., `TrendingUp` from `lucide-react`).

---

## Integration & Polish

- [ ] 20. Add debouncing (300ms) to assumption slider changes so the chart and table do not re-render on every pixel of slider movement. Use a `useEffect` with a timeout or a small `useDebouncedValue` hook.

- [ ] 21. Add a disclaimer banner at the top of the growth page: "These projections are estimates based on current tax rates and historical inflation trends. Actual results may vary significantly."

- [ ] 22. Handle edge cases in the UI:
  - If current take-home is negative (expenses exceed salary), show a warning instead of projections.
  - If any projected take-home goes negative, highlight that year in red on the chart and table.
  - If salary is zero, disable the projections and prompt the user to enter salary data.

- [ ] 23. Write integration tests in `src/__tests__/growth-page.test.tsx`:
  - Test that the page renders all four milestone cards.
  - Test that the chart component renders with correct number of data points.
  - Test that changing a slider value updates the milestone card values.
  - Test the Nominal/Real toggle switches the displayed values.
  - Test that the disclaimer banner is visible.
  - Test that missing user data shows the prompt message instead of projections.

---

## Future Enhancements (Not in MVP)

- [ ] 24. (Post-MVP) Add salary growth decay option: growth rate reduces by a configurable amount per year after a threshold (e.g., -0.5%/year after year 5).

- [ ] 25. (Post-MVP) Add optimistic/pessimistic range bands on the chart (e.g., +/- 2% on each rate).

- [ ] 26. (Post-MVP) Add a "Compare scenarios" feature where the user can save multiple assumption sets and compare them side by side.

- [ ] 27. (Post-MVP) Integrate with scraped data to auto-update inflation assumptions periodically via a Convex cron job.
