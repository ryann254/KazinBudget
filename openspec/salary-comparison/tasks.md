# Salary Comparison -- Tasks

> **All tasks in this file are Phase 2.** Do not begin implementation until the Phase 1 core features (user input form, Kenya tax calculator, food cost lookup, travel cost estimator, rent estimator, expenses dashboard) are complete and stable.

---

## Data Layer: Types, Taxonomy, and Constants

- [ ] **Task 1 (Phase 2):** Create `packages/shared/src/salary/types.ts` with TypeScript types and Zod schemas for `SalaryBenchmark`, `ComparisonInput`, `ComparisonResult`, `ExperienceBand`, `RoleCategory`, and `ScraperRun`. Use `type` (not `interface`) per project convention.

- [ ] **Task 2 (Phase 2):** Create `packages/shared/src/salary/experience-bands.ts` with the experience band definitions (ENTRY: 0-2, JUNIOR: 2-4, MID: 4-7, SENIOR: 7-12, LEAD: 12-20, EXECUTIVE: 20+) and a `classifyExperience(years: number): ExperienceBand` pure function.

- [ ] **Task 3 (Phase 2):** Write unit tests for `classifyExperience` in `packages/shared/src/salary/__tests__/experience-bands.test.ts`. Cover all bands, boundary values (0, 2, 4, 7, 12, 20), and edge cases (negative input, very large numbers).

- [ ] **Task 4 (Phase 2):** Create `packages/shared/src/salary/role-taxonomy.ts` with a mapping of common Kenyan job titles to standardized role categories (SOFTWARE_ENGINEER, DATA_ANALYST, ACCOUNTANT, MARKETING, ADMIN, HEALTHCARE, LEGAL, HR, SALES, ENGINEERING, TEACHING, OTHER). Include at least 5-10 title variants per category.

- [ ] **Task 5 (Phase 2):** Add a `matchRoleCategory(jobTitle: string): { category: string; confidence: number }` function in `role-taxonomy.ts` using Fuse.js for fuzzy matching against the title variants. Return "OTHER" with low confidence if no good match is found.

- [ ] **Task 6 (Phase 2):** Write unit tests for `matchRoleCategory` in `packages/shared/src/salary/__tests__/role-taxonomy.test.ts`. Test exact matches, partial matches, misspellings, completely unrecognized titles, and case variations.

---

## Comparison Engine (Pure Functions)

- [ ] **Task 7 (Phase 2):** Create `packages/shared/src/salary/comparison-engine.ts` with a `computeSalaryStatistics(dataPoints: number[]): { median, mean, p25, p75, stdDev, min, max }` pure function.

- [ ] **Task 8 (Phase 2):** Add a `computePercentile(userSalary: number, dataPoints: number[]): number` pure function to `comparison-engine.ts`. Returns 0-100.

- [ ] **Task 9 (Phase 2):** Add a `generateVerdict(percentile: number): { verdict: string; verdictText: string }` pure function to `comparison-engine.ts`. Map percentile ranges to verdict strings (underpaid / slightly_underpaid / fair / slightly_overpaid / overpaid).

- [ ] **Task 10 (Phase 2):** Add a `determineConfidence(sampleSize: number): "high" | "medium" | "low" | "insufficient"` pure function. High: 20+, Medium: 10-19, Low: 5-9, Insufficient: <5.

- [ ] **Task 11 (Phase 2):** Add a top-level `compareSalary(input: ComparisonInput, dataPoints: SalaryBenchmark[]): ComparisonResult` function that composes tasks 7-10 into a single comparison result.

- [ ] **Task 12 (Phase 2):** Write comprehensive unit tests for the comparison engine in `packages/shared/src/salary/__tests__/comparison-engine.test.ts`. Test: correct median/mean calculation, percentile accuracy, verdict thresholds at boundaries, confidence levels, empty dataset handling, single data point, all identical salaries, and very large datasets.

---

## Convex Backend: Database Schema

- [ ] **Task 13 (Phase 2):** Add the `salaryBenchmarks` table definition to `convex/schema.ts` with fields: `roleCategory` (string), `zone` (string), `experienceBand` (string), `salaryAmount` (number), `source` (string), `scrapedAt` (number). Add indexes: `by_role_zone_exp` on [roleCategory, zone, experienceBand] and `by_source` on [source] and `by_scraped_at` on [scrapedAt].

- [ ] **Task 14 (Phase 2):** Add the `scraperRuns` table definition to `convex/schema.ts` with fields: `scraperName` (string), `status` (string), `recordsInserted` (number), `pagesScraped` (number), `errorMessage` (optional string), `startedAt` (number), `completedAt` (optional number). Add index: `by_scraper_status` on [scraperName, status].

---

## Convex Backend: Queries and Mutations

- [ ] **Task 15 (Phase 2):** Create `convex/salary/compareSalary.ts` as a Convex query. Accept args: `roleCategory`, `zone`, `yearsOfExperience`, `userSalary`. Query the `salaryBenchmarks` table with matching criteria. If fewer than 5 results, widen by dropping zone, then dropping experience band. Pass results to the comparison engine. Return `ComparisonResult`.

- [ ] **Task 16 (Phase 2):** Create `convex/salary/anonymizeSubmission.ts` as a Convex mutation. Accept a submission ID. Read the submission, extract role category (via `matchRoleCategory`), zone (from company location), experience band (via `classifyExperience`), and salary. Insert an anonymized record into `salaryBenchmarks` with `source: "user_submission"`. Do NOT include user name, company name, or submission ID in the benchmark record.

- [ ] **Task 17 (Phase 2):** Edit the existing submission creation mutation (e.g., `convex/submissions/create.ts`) to schedule `salary/anonymizeSubmission` after a successful submission is saved.

- [ ] **Task 18 (Phase 2):** Write integration tests for `compareSalary` query in `tests/integration/compareSalary.test.ts`. Seed the `salaryBenchmarks` table with test data. Verify correct verdict for an underpaid user, a fairly paid user, and an overpaid user. Verify the widening logic when insufficient data exists for the exact criteria.

- [ ] **Task 19 (Phase 2):** Write integration tests for `anonymizeSubmission` in `tests/integration/anonymizeSubmission.test.ts`. Verify that a submitted record is correctly anonymized (no name or company in benchmark), role is normalized, zone is correct, experience is banded properly.

---

## Scraping Infrastructure

- [ ] **Task 20 (Phase 2):** Create `convex/salary/scraperSelectors.ts` with CSS selector configurations for BrighterMonday and Glassdoor. Export named objects like `BRIGHTERMONDAY_SELECTORS` and `GLASSDOOR_SELECTORS` so selectors can be updated without modifying scraper logic.

- [ ] **Task 21 (Phase 2):** Create `convex/salary/scrapeBrighterMonday.ts` as a Convex action. Use BrowserBase to launch a headless browser session. Navigate to BrighterMonday salary/job pages filtered for Nairobi. Extract job titles, salary ranges, and location data. Normalize titles using `matchRoleCategory`. Map locations to Nairobi zones. Insert records into `salaryBenchmarks` with `source: "brightermonday"`. Log the run in `scraperRuns`.

- [ ] **Task 22 (Phase 2):** Add rate limiting to the BrighterMonday scraper: 2-second delay between page navigations, maximum 50 pages per run. Add retry logic: 3 retries with exponential backoff on network failures.

- [ ] **Task 23 (Phase 2):** Create `convex/salary/scrapeGlassdoor.ts` as a Convex action. Same pattern as BrighterMonday but targeting Glassdoor Nairobi salary pages. Use 3-second delay between requests. Discard entries with fewer than 3 salary reports (too small a sample). Log the run in `scraperRuns`.

- [ ] **Task 24 (Phase 2):** Add scraper health monitoring: after each scraper run, check the `scraperRuns` table for the last 3 runs of that scraper. If all 3 have `status: "failed"`, insert an alert record into an `alerts` table (or log a warning).

- [ ] **Task 25 (Phase 2):** Register scheduled scraper jobs in `convex/crons.ts`. BrighterMonday: weekly on Sunday at 2 AM EAT (23:00 UTC Saturday). Glassdoor: bi-weekly (every 14 days) at 3 AM EAT.

---

## Seed Data

- [ ] **Task 26 (Phase 2):** Create a seed script `convex/salary/seedBenchmarks.ts` (Convex mutation) that inserts initial salary benchmark data from KNBS and HassConsult survey figures. Cover at least 10 role categories across all 4 Nairobi zones and all 6 experience bands. This provides a baseline before scrapers accumulate data.

- [ ] **Task 27 (Phase 2):** Research current Kenya salary data from KNBS, BrighterMonday published surveys, and HassConsult reports. Compile at least 50-100 data points to populate the seed script. Document the sources in a comment within the seed file.

---

## Frontend: Comparison Card Component

- [ ] **Task 28 (Phase 2):** Create `packages/web/src/components/salary/SalaryComparisonCard.tsx` using shadcn/ui Card. Display: verdict text (e.g., "You're earning 15% below market"), percentile rank, median salary for the comparison group, sample size, and confidence indicator. Handle loading, error, and "insufficient data" states.

- [ ] **Task 29 (Phase 2):** Style `SalaryComparisonCard` with TailwindCSS. Use color coding for verdicts: red shades for underpaid, green shades for overpaid, neutral/blue for fair. Add a subtle icon or badge for the verdict. Ensure the card is responsive.

- [ ] **Task 30 (Phase 2):** Write component tests for `SalaryComparisonCard` in `packages/web/src/components/salary/__tests__/SalaryComparisonCard.test.tsx`. Test all verdict states render correctly, loading skeleton displays, insufficient data message displays, confidence disclaimer appears for low-confidence results.

---

## Frontend: Bell Curve Visualization

- [ ] **Task 31 (Phase 2):** Install Recharts as a dependency in `packages/web` (if not already installed): `npm install recharts`.

- [ ] **Task 32 (Phase 2):** Create `packages/web/src/components/salary/SalaryBellCurve.tsx` using Recharts AreaChart. Accept props: salary data distribution (bins), user salary position, median, p25, p75. Render a bell-curve-shaped area chart with shaded regions (red below p25, yellow p25-p75, green above p75). Add a vertical marker line for the user's salary.

- [ ] **Task 33 (Phase 2):** Add responsive behavior to `SalaryBellCurve`: on screens below 640px, replace the full bell curve with a simplified horizontal progress bar showing the user's percentile position within the market range.

- [ ] **Task 34 (Phase 2):** Write component tests for `SalaryBellCurve` in `packages/web/src/components/salary/__tests__/SalaryBellCurve.test.tsx`. Test that the chart renders without errors, the user marker is present, and the component handles empty data gracefully.

---

## Frontend: Detail Modal and Page

- [ ] **Task 35 (Phase 2):** Create `packages/web/src/components/salary/ComparisonDetailModal.tsx` using shadcn/ui Dialog. Show full statistics table (median, mean, p25, p75, min, max, sample size), methodology note explaining how the comparison works, data source attribution, confidence disclaimer, and the bell curve component.

- [ ] **Task 36 (Phase 2):** Wire the `SalaryComparisonCard` to open `ComparisonDetailModal` on click. Pass comparison result data as props.

- [ ] **Task 37 (Phase 2):** Optionally create `packages/web/src/pages/SalaryComparison.tsx` as a dedicated route (e.g., `/comparison`) using TanStack Router. This page shows the full comparison view for users who want a standalone page rather than a dashboard card.

---

## Dashboard Integration

- [ ] **Task 38 (Phase 2):** Import and render `SalaryComparisonCard` in the main Dashboard page (`packages/web/src/pages/Dashboard.tsx` or equivalent). Position it below the expenses section. Initially render the card in a "Coming Soon" preview state with a teaser message and a muted visual style.

- [ ] **Task 39 (Phase 2):** Add a feature flag (e.g., `ENABLE_SALARY_COMPARISON` in environment variables or a Convex config table) to control whether the comparison feature is active or shows the "Coming Soon" state. This allows gradual rollout.

---

## Privacy and Data Protection

- [ ] **Task 40 (Phase 2):** Verify that the `salaryBenchmarks` table has no foreign keys or references to the `submissions` table. Write a test that attempts to trace a benchmark record back to a submission and confirms it is impossible.

- [ ] **Task 41 (Phase 2):** Implement the minimum-sample-size guard in the `compareSalary` query: if fewer than 5 data points match after all widening attempts, return a result with `confidence: "insufficient"` and no statistical data. The frontend must handle this state.

- [ ] **Task 42 (Phase 2):** Add outlier detection to `anonymizeSubmission`: before inserting a user-submitted salary into benchmarks, check if it deviates by more than 3 standard deviations from the existing median for the same role/zone/band. If so, flag it for review rather than inserting it directly.

---

## E2E Testing

- [ ] **Task 43 (Phase 2):** Write Playwright E2E tests in `e2e/salary-comparison.spec.ts`. Seed the database with benchmark data. Submit a salary via the input form. Navigate to the dashboard. Verify the comparison card displays a verdict. Click the card and verify the detail modal opens with statistics and the bell curve chart.

---

## Documentation

- [ ] **Task 44 (Phase 2):** Add inline code comments in all new files explaining the Phase 2 boundary: which parts of the codebase are Phase 2 only and should not be imported by Phase 1 features. This prevents accidental coupling.

- [ ] **Task 45 (Phase 2):** Update the project README or internal docs to describe the salary comparison feature, its data sources, privacy guarantees, and how to run/maintain the scrapers. (Only when the feature is ready for release.)
