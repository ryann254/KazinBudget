# Salary Comparison -- Design Document

> **Phase 2 / Future Feature** -- This feature is planned for a future release and is NOT part of the initial MVP. It depends on data accumulated from Phase 1 (user submissions, scraped salary data) and should only be built once the core take-home salary calculator is stable and generating traffic.

## Overview

Show users whether they are being underpaid, fairly paid, or overpaid relative to the market. The comparison is based on three factors: **job role / company**, **location within Nairobi**, and **years of experience**. The feature displays a clear verdict (e.g., "You're earning 15% below the market average for Software Engineers in Westlands with 3 years experience") alongside a visual bell curve showing where the user falls in the salary distribution.

---

## Approach

### High-Level Architecture

```
Data Collection Layer          Comparison Engine           Presentation Layer
---------------------          ------------------          -------------------
BrowserBase scrapers  --->     Internal salary     --->    Comparison verdict
  (BrighterMonday,             database (Convex)           + bell curve visual
   Glassdoor)                       |                      + percentile rank
                                    |
User submissions      --->    Aggregation &         --->   Dashboard card
  (anonymized)                statistical calc             + detailed breakdown
                                    |
Static seed data      --->    Percentile ranking
  (KNBS, surveys)
```

### Step 1: Data Collection (Background Pipeline)

Build a salary data pipeline that runs on a scheduled cadence (weekly) to scrape, normalize, and store salary data points. This pipeline populates an internal salary benchmark database over time.

### Step 2: Internal Salary Database

Store normalized salary records in a Convex table. Each record contains: role/title (normalized), location/zone, years of experience (banded), salary amount (KES monthly), data source, and a timestamp. Records are never individually attributable to a user.

### Step 3: Comparison Logic

When a user requests a comparison, the engine queries the internal database for records matching their role + location + experience band, computes statistical measures (median, mean, percentiles), and determines where the user's salary falls.

### Step 4: Display

Present results as a dashboard card with a textual verdict, a bell curve / distribution chart, and the user's percentile rank.

---

## Data Sources for Kenya Salary Benchmarks

| Source | Type | Coverage | Reliability | Access Method |
|--------|------|----------|-------------|---------------|
| **BrighterMonday Kenya** | Job board with salary data | Strong Kenya/Nairobi coverage, many industries | High -- largest Kenyan job platform | BrowserBase scraper |
| **Glassdoor** | Salary self-reports | Limited Kenya data, better for multinational companies | Medium -- small sample sizes for Kenya | BrowserBase scraper |
| **PayScale** | Salary surveys | Some Kenya data, skewed toward tech/corporate | Medium | BrowserBase scraper (fallback) |
| **LinkedIn Salary Insights** | Professional network data | Growing Kenya dataset, strong for white-collar roles | Medium-High -- requires sufficient data points | API or BrowserBase scraper |
| **KNBS Employment Surveys** | Government statistics | Broad sector-level data, formal employment focus | High -- official statistics, but published annually with lag | Manual import (PDF/CSV) |
| **HassConsult Workforce Reports** | Industry reports | Executive and mid-level salary bands for Kenya | Medium-High -- reputable but narrow scope | Manual import (PDF) |
| **User Submissions (anonymized)** | First-party data | Grows with app usage; highly relevant to target audience | High -- real, current data from actual job seekers | Automatic from Phase 1 form submissions |

### Primary Sources (Automated Scraping)

**BrighterMonday** and **Glassdoor** are the two primary automated sources because they have the most granular role-level salary data for Kenya and can be scraped on a recurring basis.

### Secondary Sources (Manual / Semi-Automated)

**KNBS** and **HassConsult** reports are imported manually when new editions are published (typically annually). These provide macro-level benchmarks to calibrate and validate the scraped data.

### First-Party Data

User submissions from the Phase 1 input form provide ongoing salary data points. These are anonymized (name and company stripped) before entering the benchmark database. Over time, this becomes the most valuable and current data source.

---

## Scraping Strategy

### BrowserBase Setup

All scraping runs server-side as Convex scheduled actions using **BrowserBase** for headless browser automation. BrowserBase is already in the project stack (used by food-cost-lookup and other features).

### BrighterMonday Scraper

**Target URL pattern:** `https://www.brightermonday.co.ke/jobs/[category]` and salary survey pages.

**Data extracted per listing:**
- Job title
- Company name (for context, not stored in benchmarks)
- Location (mapped to Nairobi zone)
- Salary range (min/max KES)
- Experience level indicated in the listing

**Scraping flow:**
1. Launch BrowserBase session
2. Navigate to BrighterMonday salary survey or job listings filtered by Nairobi
3. Iterate through job categories relevant to our user base (tech, finance, marketing, admin, engineering, healthcare, etc.)
4. Extract salary ranges and job metadata
5. Normalize and store in the salary benchmark table
6. Respect rate limits: maximum 50 pages per scraping run, 2-second delay between requests

### Glassdoor Scraper

**Target URL pattern:** `https://www.glassdoor.com/Salaries/nairobi-salary-[role]-SRCH_IL.0,7_IC3454863.htm`

**Data extracted:**
- Job title
- Average salary
- Salary range (low/high)
- Number of salary reports (sample size indicator)

**Scraping flow:**
1. Launch BrowserBase session
2. Navigate to Glassdoor salary pages for Nairobi
3. Search for roles matching our taxonomy
4. Extract salary data
5. Note sample sizes -- discard entries with fewer than 3 reports
6. Store normalized records

### Scraping Schedule

| Scraper | Frequency | Estimated Pages/Run | Rate Limit |
|---------|-----------|---------------------|------------|
| BrighterMonday | Weekly (Sunday 2 AM EAT) | 30-50 pages | 2s between requests |
| Glassdoor | Bi-weekly (1st and 15th, 3 AM EAT) | 20-30 pages | 3s between requests |
| PayScale (fallback) | Monthly | 10-15 pages | 5s between requests |

### Scraping Resilience

- **Retry logic:** 3 retries with exponential backoff on network errors
- **Selector versioning:** Store CSS selectors in a config file (`scraper-selectors.ts`) so they can be updated without changing scraper logic
- **Health monitoring:** Log success/failure counts per run. If a scraper fails 3 consecutive runs, send an alert (Convex scheduled function writes to an `alerts` table)
- **Graceful degradation:** If no fresh scraped data is available, the comparison engine falls back to the most recent cached data or KNBS baseline figures

---

## Role Taxonomy and Normalization

### The Problem

Job titles vary wildly: "Software Developer", "Software Engineer", "Full Stack Developer", "Developer", "SWE" may all refer to similar roles. Salary comparison requires normalizing these into a consistent taxonomy.

### Approach: Role Category Mapping

Maintain a mapping of common job titles to standardized role categories:

```
Role Categories (examples):
  SOFTWARE_ENGINEER  -> ["software engineer", "software developer", "full stack developer", "backend developer", "frontend developer", "swe", "web developer"]
  DATA_ANALYST       -> ["data analyst", "business analyst", "data scientist", "bi analyst"]
  ACCOUNTANT         -> ["accountant", "finance officer", "accounts assistant", "auditor"]
  MARKETING          -> ["marketing manager", "digital marketer", "marketing officer", "brand manager"]
  ADMIN              -> ["administrative assistant", "office administrator", "receptionist", "office manager"]
  ...
```

This mapping lives in a shared constants file. Fuse.js (already in the stack for geo-fence) performs fuzzy matching of user-entered job titles against the mapping.

### Experience Bands

Years of experience are bucketed into bands for comparison:

| Band | Years | Label |
|------|-------|-------|
| ENTRY | 0-2 | Entry Level |
| JUNIOR | 2-4 | Junior |
| MID | 4-7 | Mid-Level |
| SENIOR | 7-12 | Senior |
| LEAD | 12-20 | Lead / Principal |
| EXECUTIVE | 20+ | Executive |

---

## Comparison Algorithm

### Input

```typescript
type ComparisonInput = {
  userSalary: number;          // Monthly gross KES
  roleCategory: string;        // Normalized role category
  nairobiZone: string;         // From geo-fence feature
  yearsOfExperience: number;   // Raw years
};
```

### Process

1. **Determine experience band** from raw years
2. **Query salary benchmarks** matching `roleCategory + nairobiZone + experienceBand`
3. **Require minimum sample size:** At least 5 data points to produce a comparison. If fewer, widen the search (drop zone specificity, then drop experience band) and note the reduced precision
4. **Compute statistics:**
   - `median` -- the 50th percentile salary
   - `mean` -- average salary
   - `p25` -- 25th percentile
   - `p75` -- 75th percentile
   - `min` / `max` -- range
   - `stdDev` -- standard deviation
5. **Calculate user's percentile rank:**
   ```
   percentile = (count of salaries below userSalary) / totalCount * 100
   ```
6. **Generate verdict:**
   - Below p25: "Significantly below market" (flag: underpaid)
   - p25 to p45: "Below market average" (flag: slightly_underpaid)
   - p45 to p55: "At market rate" (flag: fair)
   - p55 to p75: "Above market average" (flag: slightly_overpaid)
   - Above p75: "Significantly above market" (flag: overpaid)

### Output

```typescript
type ComparisonResult = {
  verdict: "underpaid" | "slightly_underpaid" | "fair" | "slightly_overpaid" | "overpaid";
  verdictText: string;           // Human-readable summary
  percentile: number;            // 0-100
  medianSalary: number;          // KES
  meanSalary: number;            // KES
  p25: number;                   // KES
  p75: number;                   // KES
  sampleSize: number;            // How many data points used
  differenceFromMedian: number;  // KES (positive = above, negative = below)
  differencePercent: number;     // Percentage above/below median
  confidence: "high" | "medium" | "low";  // Based on sample size
  roleCategory: string;
  experienceBand: string;
  zone: string;
  lastUpdated: number;           // Timestamp of most recent data point used
};
```

### Confidence Levels

| Sample Size | Confidence | Display Note |
|-------------|------------|--------------|
| 20+ data points | High | No disclaimer needed |
| 10-19 data points | Medium | "Based on limited data for your exact criteria" |
| 5-9 data points | Low | "Estimate based on a small sample. Results may vary." |
| < 5 data points | Insufficient | Do not show comparison. Display: "We need more data for [role] in [zone]. Check back soon." |

---

## Privacy Considerations

### Principles

1. **Never share individual salary data.** All displays show aggregated statistics only.
2. **Anonymize user submissions.** Strip name, company name, and any identifying fields before inserting into the benchmark table.
3. **Minimum aggregation threshold.** Never display statistics computed from fewer than 5 data points to prevent inference of individual salaries.
4. **No reverse lookups.** The benchmark table has no foreign key back to the submissions table.
5. **Data retention.** Scraped data points are retained for 24 months, then archived or deleted. User-submitted data points follow the same policy.

### Implementation

- The `salaryBenchmarks` table contains only: `roleCategory`, `zone`, `experienceBand`, `salaryAmount`, `source`, `scrapedAt`. No user IDs, no company names.
- When a user submission is used as a data point, a Convex mutation copies the relevant fields into `salaryBenchmarks` with `source: "user_submission"` and no link to the original submission.
- The comparison query reads only from `salaryBenchmarks`, never from `submissions`.

---

## Visualization: Salary Distribution Bell Curve

### Library

Use **Recharts** (already a common React charting library, compatible with shadcn/ui and TailwindCSS) to render an area chart approximating a normal distribution.

### Chart Design

- **X-axis:** Salary range (KES), divided into bins
- **Y-axis:** Frequency / density
- **Shaded regions:**
  - Red zone (below p25): "Below market"
  - Yellow zone (p25-p75): "Market range"
  - Green zone (above p75): "Above market"
- **User marker:** A vertical line or pin showing where the user's salary falls
- **Annotations:** Median line, user's percentile label

### Responsive Behavior

- Desktop: Full bell curve with labels and annotations
- Mobile: Simplified horizontal bar showing percentile position within the market range

---

## Convex Backend Design

### Table: `salaryBenchmarks`

```ts
// convex/schema.ts (addition -- Phase 2)
salaryBenchmarks: defineTable({
  roleCategory: v.string(),
  zone: v.string(),
  experienceBand: v.string(),
  salaryAmount: v.number(),          // Monthly gross KES
  source: v.string(),                // "brightermonday" | "glassdoor" | "payscale" | "knbs" | "user_submission"
  scrapedAt: v.number(),             // Timestamp
})
  .index("by_role_zone_exp", ["roleCategory", "zone", "experienceBand"])
  .index("by_source", ["source"])
  .index("by_scraped_at", ["scrapedAt"]),
```

### Table: `scraperRuns`

```ts
scraperRuns: defineTable({
  scraperName: v.string(),           // "brightermonday" | "glassdoor" | "payscale"
  status: v.string(),                // "running" | "success" | "failed"
  recordsInserted: v.number(),
  pagesScraped: v.number(),
  errorMessage: v.optional(v.string()),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_scraper_status", ["scraperName", "status"]),
```

### Action: `salary/scrapeBrighterMonday`

Convex scheduled action that runs the BrighterMonday scraper via BrowserBase. Inserts normalized records into `salaryBenchmarks`.

### Action: `salary/scrapeGlassdoor`

Same pattern for Glassdoor.

### Action: `salary/anonymizeSubmission`

Triggered when a new user submission is created. Extracts role category (via fuzzy match), zone, experience band, and salary. Inserts an anonymized record into `salaryBenchmarks`.

### Query: `salary/compareSalary`

```ts
// convex/salary/compareSalary.ts
export const compareSalary = query({
  args: {
    roleCategory: v.string(),
    zone: v.string(),
    yearsOfExperience: v.number(),
    userSalary: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Determine experience band
    // 2. Query salaryBenchmarks by role + zone + band
    // 3. If < 5 results, widen criteria
    // 4. Compute statistics (median, mean, percentiles)
    // 5. Calculate user's percentile
    // 6. Generate verdict
    // 7. Return ComparisonResult
  },
});
```

### Scheduled Functions

```ts
// convex/crons.ts (addition -- Phase 2)
crons.weekly(
  "scrape-brightermonday",
  { dayOfWeek: "sunday", hourUTC: 23, minuteUTC: 0 }, // 2 AM EAT
  internal.salary.scrapeBrighterMonday
);

crons.interval(
  "scrape-glassdoor",
  { days: 14 },
  internal.salary.scrapeGlassdoor
);
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `packages/shared/src/salary/role-taxonomy.ts` | Role category mapping with Fuse.js matching for title normalization |
| `packages/shared/src/salary/experience-bands.ts` | Experience band definitions and classifier function |
| `packages/shared/src/salary/comparison-engine.ts` | Pure function: given salary data points and user input, compute statistics and verdict |
| `packages/shared/src/salary/types.ts` | TypeScript types and Zod schemas: `ComparisonInput`, `ComparisonResult`, `SalaryBenchmark`, `ExperienceBand` |
| `convex/salary/compareSalary.ts` | Convex query that retrieves benchmarks and runs comparison engine |
| `convex/salary/anonymizeSubmission.ts` | Convex mutation that anonymizes and stores user salary data |
| `convex/salary/scrapeBrighterMonday.ts` | Convex action: BrowserBase scraper for BrighterMonday |
| `convex/salary/scrapeGlassdoor.ts` | Convex action: BrowserBase scraper for Glassdoor |
| `convex/salary/scraperSelectors.ts` | CSS selector config for scrapers (easily updatable when sites change) |
| `packages/web/src/components/salary/SalaryComparisonCard.tsx` | Dashboard card showing verdict, percentile, and key stats |
| `packages/web/src/components/salary/SalaryBellCurve.tsx` | Recharts-based bell curve / distribution visualization |
| `packages/web/src/components/salary/ComparisonDetailModal.tsx` | Modal with full breakdown: statistics table, methodology note, confidence disclaimer |
| `packages/web/src/pages/SalaryComparison.tsx` | Dedicated page (optional) for detailed salary comparison view |

## Files to Edit

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `salaryBenchmarks` and `scraperRuns` table definitions |
| `convex/crons.ts` | Add scheduled scraper jobs (weekly BrighterMonday, bi-weekly Glassdoor) |
| `packages/web/src/pages/Dashboard.tsx` | Import and render `SalaryComparisonCard` (conditionally, with "Coming Soon" state initially) |
| `convex/submissions/create.ts` (or equivalent) | After saving a submission, schedule `salary/anonymizeSubmission` action |
| `.env.local` | Add `BROWSERBASE_API_KEY` if not already present (likely already added by food-cost-lookup feature) |

---

## Tests

### Unit Tests (Vitest)

| Test File | What It Covers |
|-----------|----------------|
| `packages/shared/src/salary/__tests__/role-taxonomy.test.ts` | Fuzzy matching of job titles to role categories: exact matches, partial matches, misspellings, unmapped titles return "OTHER" |
| `packages/shared/src/salary/__tests__/experience-bands.test.ts` | Band classification: 0 -> ENTRY, 3 -> JUNIOR, 5 -> MID, 10 -> SENIOR, 15 -> LEAD, 25 -> EXECUTIVE, boundary values |
| `packages/shared/src/salary/__tests__/comparison-engine.test.ts` | Statistical calculations: median, mean, percentiles computed correctly; verdict assignment at each threshold; edge cases (single data point, all same salary, empty dataset); confidence level assignment based on sample size; widening logic when sample too small |

### Integration Tests

| Test File | What It Covers |
|-----------|----------------|
| `tests/integration/compareSalary.test.ts` | Full query flow with seeded benchmark data: correct verdict returned, proper percentile calculation, insufficient data returns appropriate message |
| `tests/integration/anonymizeSubmission.test.ts` | Submission is correctly anonymized: no name/company in benchmark record, role is normalized, zone is mapped, experience is banded |

### Component Tests

| Test File | What It Covers |
|-----------|----------------|
| `packages/web/src/components/salary/__tests__/SalaryComparisonCard.test.tsx` | Renders verdict text, shows percentile, handles loading state, handles "insufficient data" state, shows confidence disclaimer for low-confidence results |
| `packages/web/src/components/salary/__tests__/SalaryBellCurve.test.tsx` | Chart renders without errors, user marker positioned correctly, responsive layout adapts on mobile |

### E2E Tests (Playwright)

| Test File | What It Covers |
|-----------|----------------|
| `e2e/salary-comparison.spec.ts` | User submits salary data, navigates to dashboard, sees comparison card (with seeded benchmark data); card shows correct verdict; bell curve is visible on desktop; clicking card opens detail modal |

---

## Risks and Tradeoffs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Insufficient salary data for many role/zone/experience combinations** | High (initially) | High -- feature is useless without data | Seed with KNBS and survey data at launch. Show "insufficient data" gracefully rather than wrong comparisons. Widen search criteria progressively. Prioritize scraping for the most common roles first. |
| **BrighterMonday or Glassdoor change their site structure** | High (over time) | Medium -- scrapers break | Isolate CSS selectors in a config file. Monitor scraper health with the `scraperRuns` table. Alert on consecutive failures. Design scrapers to fail gracefully. |
| **Scraped salary data is inaccurate or outdated** | Medium | Medium -- misleading comparisons | Cross-reference multiple sources. Weight more recent data higher. Display data freshness ("Based on data from the last 3 months"). Allow users to flag obviously wrong comparisons. |
| **Legal/TOS issues with scraping salary sites** | Medium | High -- potential legal action | Review BrighterMonday and Glassdoor Terms of Service before scraping. Use BrowserBase (which mimics real browser behavior). Rate-limit aggressively. Do not republish raw scraped data. Only show aggregated statistics. Consider reaching out for data partnerships as the app grows. |
| **User-submitted salary data is unreliable (inflated or deflated)** | Medium | Medium -- skews benchmarks | Apply outlier detection: discard submissions more than 3 standard deviations from existing median for the same category. Weight user submissions lower than scraped data initially. |
| **Privacy breach: individual salaries inferred from aggregates** | Low | Very High -- trust destruction | Enforce minimum 5-point aggregation threshold. Never show statistics for groups with fewer than 5 entries. No foreign keys between benchmarks and submissions. Regular privacy audits. |
| **Role normalization is inaccurate** | Medium | Medium -- wrong comparison group | Use Fuse.js with a conservative threshold. Let users confirm or correct the normalized role category. Show "Comparing as: [category]" with an edit option. |

### Tradeoffs

| Decision | Upside | Downside |
|----------|--------|----------|
| Building an internal salary database vs. querying external APIs in real-time | Full control over data quality, no runtime dependency on third parties, faster queries | Requires ongoing scraping infrastructure, data can be stale between scraping runs |
| Anonymized user submissions as a data source | Best, most current, most relevant data over time | Small initial dataset, potential for gaming (users entering fake high/low salaries) |
| Role category taxonomy vs. free-text matching | Consistent comparisons, manageable data model | Some roles don't fit neatly into categories, requires maintenance as job market evolves |
| Experience bands (e.g., 4-7 years = MID) vs. exact year matching | Larger sample sizes per group, smoother statistics | Less precise: a 4-year and a 7-year developer get compared to the same group |
| Minimum 5 data points to show comparison vs. lower threshold | Prevents misleading statistics from tiny samples | Many role/zone/experience combinations will show "insufficient data" early on |
| Bell curve visualization vs. simpler bar chart | More informative, shows full distribution context | More complex to implement, may confuse non-technical users -- mitigated with clear labeling |
| Recharts vs. D3.js for visualization | Simpler API, React-native, less code | Less customization than D3, but sufficient for this use case |
| Weekly scraping cadence vs. daily | Lower cost, less risk of being blocked, salary data doesn't change daily | Data could be up to a week old; acceptable for salary benchmarks |

---

## Future Considerations (Beyond Phase 2)

- **Data partnerships:** Approach BrighterMonday or LinkedIn for official data access, eliminating scraping fragility.
- **Employer benchmarks:** Allow companies to see aggregated salary data for their industry/location to help them set competitive offers.
- **Negotiation tips:** Based on the comparison result, provide actionable advice (e.g., "Based on market data, you could negotiate for KES X-Y").
- **Historical trends:** Show how salaries for a given role/location have changed over the past 1-3 years.
- **City expansion:** When the app expands beyond Nairobi, the comparison engine and scraping pipeline should support additional cities with minimal changes (add new zones, update scrapers).
- **Salary prediction:** Use the collected data to build a simple regression model predicting expected salary given role + location + experience.
