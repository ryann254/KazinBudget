# User Input Form - Design Document

## Overview

The user input form is the primary entry point of the WorkPlace Budgeting app. Job seekers fill in their personal and employment details, which are persisted to Convex DB and used to trigger the salary calculation pipeline. The form collects six fields: name, company name, company location (restricted to Nairobi areas), residential area, years of experience, and monthly gross salary offered.

## High-Level Approach

### Form Architecture

1. **Single-page form** rendered at the app's root route (`/`) or a dedicated `/calculate` route via TanStack Router.
2. **react-hook-form** manages form state, validation, dirty tracking, and submission.
3. **Zod schema** defines the validation contract. The schema is shared between the frontend form and the Convex mutation argument validator so that validation rules are never duplicated.
4. **shadcn/ui components** provide the visual layer -- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Button`, and a `Combobox` (built from shadcn `Command` + `Popover`) for location fields.
5. On submit, the validated data is sent to a Convex mutation (`submissions.create`) which stores the record and optionally triggers an action that kicks off the expense-calculation pipeline.

### Location Autocomplete

Company location and residential area use a **Combobox** pattern (shadcn `Popover` + `Command` component) backed by a static list of known Nairobi neighborhoods/areas. The list is maintained in a shared constants file (`packages/shared/constants/nairobi-areas.ts`). If a user selects or types an area outside Nairobi, the form displays a friendly "Coming soon to your area" message and blocks submission.

**Why a static list instead of a geocoding API?**

- The app launches only in Nairobi, so the set of valid areas is small and predictable (~50-80 neighborhoods).
- Eliminates a network round-trip on every keystroke.
- Avoids API key management and rate-limit concerns at MVP stage.
- The list can later be replaced with or supplemented by a Google Places / OpenStreetMap autocomplete when the app expands to other cities.

### Data Flow

```
User fills form
  -> react-hook-form validates via Zod
  -> onSubmit calls Convex mutation `submissions.create`
  -> Convex stores record in `submissions` table
  -> Convex action `calculations.trigger` is scheduled
  -> Pipeline (food, transport, rent, tax) runs asynchronously
  -> Dashboard page polls / subscribes to the result via Convex query
```

### Non-Nairobi Handling

When the selected company location is not within the supported Nairobi areas list, the form:

1. Shows an inline banner: "This feature is coming soon to your area. Currently we only support Nairobi."
2. Disables the submit button.
3. Does **not** persist anything to the database.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Form state | `react-hook-form` v7 | Performant form state management, field registration, submission |
| Validation | `zod` | Schema declaration, shared between frontend and Convex |
| UI components | `shadcn/ui` | `Form`, `Input`, `Button`, `Popover`, `Command` (for Combobox) |
| Styling | TailwindCSS v4 | Utility-first styling, responsive layout |
| Routing | TanStack Router | Route definition, navigation after submission |
| Backend | Convex | Mutation for persistence, action for pipeline trigger |
| Database | Convex DB | `submissions` table |

## Zod Schema

```typescript
import { z } from "zod";

const submissionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must not exceed 200 characters"),
  companyLocation: z
    .string()
    .min(1, "Company location is required"),
  residentialArea: z
    .string()
    .min(1, "Residential area is required"),
  yearsOfExperience: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(50, "Maximum 50 years"),
  monthlyGrossSalary: z
    .number({ invalid_type_error: "Must be a number" })
    .positive("Salary must be positive")
    .max(100_000_000, "Please enter a realistic salary"),
});
```

Both `companyLocation` and `residentialArea` are further validated at submission time against the Nairobi areas list to ensure only supported locations proceed.

## Files to Create

| File | Description |
|------|-------------|
| `packages/shared/constants/nairobi-areas.ts` | Static array of Nairobi neighborhoods (e.g., Westlands, Kilimani, Juja, CBD, Karen, Lang'ata, etc.) with optional metadata (sub-county). |
| `packages/shared/schemas/submission.ts` | Zod schema for the submission form (shared between frontend and Convex). |
| `packages/web/src/components/ui/combobox.tsx` | Reusable Combobox component built from shadcn `Popover` + `Command`. |
| `packages/web/src/components/submission-form.tsx` | The main form component using react-hook-form, Zod resolver, and shadcn/ui fields. |
| `packages/web/src/routes/index.tsx` (or `calculate.tsx`) | Route that renders the `SubmissionForm` component. |
| `packages/convex/schema.ts` (edit) | Add `submissions` table definition. |
| `packages/convex/api/routes/submissions.ts` | Convex mutation `create` to persist the submission. |

## Files to Edit

| File | Change |
|------|--------|
| `packages/convex/schema.ts` | Add `submissions` table with columns: `name`, `company_name`, `company_location`, `residential_area`, `years_of_experience`, `monthly_gross_salary`, `created_at`, `updated_at`, `status` (pending/calculated/error). |
| `packages/web/src/routes/__root.tsx` (or router config) | Register the new route if using file-based routing or add to the route tree. |

## Tests to Write

### Unit Tests (Vitest)

| Test File | What It Covers |
|-----------|----------------|
| `packages/shared/schemas/submission.test.ts` | Zod schema validation -- valid inputs pass, invalid inputs (empty name, negative salary, non-numeric experience) produce correct error messages. |
| `packages/web/src/components/submission-form.test.tsx` | Form renders all six fields; submit button is disabled when form is invalid; submitting valid data calls the Convex mutation; selecting a non-Nairobi area shows the "coming soon" message. |
| `packages/web/src/components/ui/combobox.test.tsx` | Combobox opens on click, filters items on typing, selects item on click, closes after selection. |

### E2E Tests (Playwright)

| Test File | What It Covers |
|-----------|----------------|
| `e2e/submission-form.spec.ts` | Full happy-path: fill all fields with valid Nairobi data, submit, verify redirect to dashboard. Sad path: submit with empty fields shows validation errors. Edge case: select non-Nairobi area shows "coming soon" message. |

## Risks and Tradeoffs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Static Nairobi areas list becomes stale or incomplete | Medium | Low | Maintain a canonical list in one file; add a contribution/feedback mechanism for users to suggest missing areas. |
| Combobox UX is poor on mobile | Medium | Medium | Test on real devices early; consider falling back to a searchable `Select` on small screens. |
| Zod schema drift between frontend and Convex | Low | High | Single source of truth in `packages/shared/schemas/submission.ts`; Convex argument validators derive from the same schema. |
| Users enter salary in annual instead of monthly | Medium | Medium | Add helper text ("Monthly gross salary in KES") and a placeholder (e.g., "80,000"). |

### Tradeoffs

| Decision | Upside | Downside |
|----------|--------|----------|
| Static list for locations vs. geocoding API | Zero latency, no API key, works offline | Must be manually updated; limited to pre-defined areas |
| Single form page vs. multi-step wizard | Simpler implementation; fewer routes; all fields visible at once | May feel overwhelming on mobile with 6 fields (mitigated by good spacing and grouping) |
| Shared Zod schema in `packages/shared` | Single source of truth for validation | Adds a cross-package dependency; requires careful build ordering |
| Named exports only (per project convention) | Consistent imports, better tree-shaking | Slightly more verbose import lines |
| Storing raw salary (not formatted) | Easier calculations downstream | Frontend must handle KES formatting for display |

## UI Layout (Wireframe Description)

```
+--------------------------------------------------+
|  WorkPlace Budgeting                              |
+--------------------------------------------------+
|                                                    |
|  Calculate Your Take-Home Salary                  |
|  ─────────────────────────────────                |
|                                                    |
|  [Full Name                          ]            |
|                                                    |
|  [Company Name                       ]            |
|                                                    |
|  [Company Location ▾  ] [Where You Live ▾ ]      |
|   (Combobox)             (Combobox)               |
|                                                    |
|  [Years of Experience ] [Monthly Gross Salary KES]|
|                                                    |
|  [ Calculate My Take-Home Salary → ]              |
|                                                    |
+--------------------------------------------------+
```

- Fields are arranged in a responsive grid: single column on mobile, two columns for the location and numeric pairs on larger screens.
- The submit button spans the full width and uses the primary color from the shadcn theme.
- Validation errors appear directly below each field using shadcn `FormMessage`.
