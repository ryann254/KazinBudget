# Kazi Budget Rules Completion - Design

## Overview

This design covers the remaining product behaviors requested in `KaziNBudgetRules.md`:

1. Make Personal Info + Salary & Tax fields editable.
2. Make `CALCULATE BUDGET` use current inputs with required-field validation.
3. Add authentication with Clerk.
4. Make Monthly Expenses items editable/deletable from a 3-dot row menu.
5. Make edit mode inline inside the row (name + amount + save/cancel), matching the provided reference screenshot.
6. Allow adding expense items while keeping Monthly Expenses card height fixed and scrollable on overflow.
7. Recalculate budget when any input-page field changes.
8. Reduce unnecessary API calls through client/server caching and change-impact checks.
9. Replace the bottom two dashboard cards with the user's two largest expense categories and up to four cheaper alternatives.

The implementation should preserve the current KAZI&BUDGET brand, colors, and layout language.

## Current Baseline

- `web/src/App.tsx` renders the full product with static `dummy.ts` data.
- Budget input and expense rows are read-only in UI.
- Convex has initial `submissions`, `expenses`, and `takeHomeResults` tables, but App is not wired to this flow.
- Shared modules already include tax utilities, area matching, and currency formatting.

## Goals

- Convert the Input tab from static display to validated editable form.
- Make the Dashboard and Input tabs data-driven from current user edits.
- Keep interactions fast while avoiding expensive re-fetches on every keystroke.
- Ensure each user's data is private through Clerk + Convex auth checks.
- Align row-edit UX with screenshot behavior (inline editor, save/cancel controls).

## Non-Goals

- No redesign of the existing visual identity.
- No expansion beyond Nairobi support in this scope.
- No multi-route rewrite; keep current tab-based App shell and evolve in place.

## Product and UX Design

### 1. Editable Input and Salary/Tax Sections

- Replace read-only fields with controlled inputs bound to `budgetInputDraft`.
- Required fields:
  - `fullName`
  - `company`
  - `workLocation`
  - `homeArea`
  - `grossSalary`
  - `experienceYears`
- Validation errors render inline below fields and as a top summary when user clicks `CALCULATE BUDGET`.
- Tax cards (`PAYE`, `NSSF`, `SHIF`, `HOUSING`) become computed from current gross salary, not static values.

### 2. Calculate Button + Recalculation Behavior

- `CALCULATE BUDGET` triggers full validation and first calculation.
- After first successful calculation (`hasCalculated = true`), edits to input fields auto-trigger recalculation with debounce.
- Recalculation runs in two layers:
  - Immediate local recompute for deterministic logic (tax totals, sums, take-home).
  - Conditional async recompute for external/estimated costs only when impactful inputs changed.

### 3. Monthly Expenses Interactions

- Monthly list row behavior:
  - On hover: show 3-dot action trigger.
  - Click 3 dots: open contextual menu next to row with `Edit` and `Delete`.
- `Edit` switches row into inline editing mode:
  - Name input + amount input in same row.
  - Save (check icon) and cancel (x icon) actions.
  - Keyboard support: `Enter` save, `Escape` cancel.
- Add expense:
  - `+ Add Item` button at section footer.
  - Adds a new editable row immediately (inline) or opens compact modal if space is constrained on mobile.
- Monthly section container keeps current height and uses vertical scroll for overflow.

### 4. Bottom Two Dashboard Cards (Dynamic Alternatives)

- Determine top two biggest adjustable expenses from current budget (exclude statutory tax line items by default).
- For each category, show:
  - Current selected option first.
  - Up to 3 progressively cheaper alternatives (max 4 total options).
- Card title format:
  - `Rent in Juja` / `Food in Westlands` / `Transport from Juja to Westlands`, etc.
- Options render in descending order from current to cheapest, with amount + label.

## Technical Design

### Frontend State Model (`web/src/App.tsx` + hooks)

Introduce a single source of truth state:

- `budgetInputDraft`
- `expenseItems`
- `calculationResult`
- `validationErrors`
- `hasCalculated`
- `isRecalculating`
- `lastCalcFingerprint`

Suggested type additions in shared package:

- `shared/schemas/budget-input.ts` (Zod + TS type)
- `shared/lib/budget-fingerprint.ts` (stable hash key for cache + change detection)
- `shared/lib/recommendations.ts` (top-two-expenses + alternatives)

### Auth (Clerk + Convex)

Integrate Clerk with Convex identity:

- `web/src/main.tsx`: wrap app with `ClerkProvider` and `ConvexProviderWithClerk`.
- `convex/auth.config.ts`: add Clerk issuer metadata.
- Add signed-out screen before app shell.
- Use Clerk user identity in Convex functions via `ctx.auth.getUserIdentity()`.

Data ownership:

- `submissions` and `expenses` rows include `owner_id`.
- Queries and mutations filter by `owner_id`.
- Reject cross-user access attempts.

### Caching and API-Call Minimization

#### Client-side

- Debounce recalculation (`300-500ms`) after input changes.
- Build `inputFingerprint` from impactful fields:
  - salary
  - work/home location
  - expense items
  - key assumptions
- If new fingerprint equals last fingerprint, skip async lookup calls.

#### Server-side

- Reuse existing cache tables (`takeHomeResults`, `rentCache`, `foodCostCache`) where available.
- Add/extend cached calculation query by fingerprint + owner.
- TTL examples:
  - take-home aggregate: 60 minutes
  - food/rent/location lookups: existing feature TTLs

#### Change Impact Rules

- Name/company-only edits: no external lookup, local-only recompute.
- Salary edit: recompute tax + totals, no location lookup.
- Work/home location edit: trigger location-dependent lookup refresh.
- Expense edit/add/delete: local recompute only.

### Data Flow

1. User edits input fields.
2. Form validation updates error state.
3. On calculate (or debounced change after first calc):
   - Build fingerprint.
   - Attempt cached result by fingerprint.
   - If cache miss and impactful fields changed, call required Convex actions.
   - Merge results with current editable expense items.
   - Persist/update state and dashboard cards.

## File-Level Impact

### Create

- `web/src/components/auth/auth-gate.tsx`
- `web/src/components/expenses/expense-row-actions.tsx`
- `web/src/components/expenses/inline-expense-editor.tsx`
- `shared/schemas/budget-input.ts`
- `shared/lib/budget-fingerprint.ts`
- `shared/lib/recommendations.ts`
- `convex/auth.config.ts`
- `convex/budget.ts` (or extend existing files with calculation-by-fingerprint queries/mutations)

### Edit

- `web/src/main.tsx`
- `web/src/App.tsx`
- `web/src/data/dummy.ts` (reduce to fallback only)
- `convex/schema.ts`
- `convex/submissions.ts`
- `convex/expenses.ts`
- optionally `convex/takeHome/*` for cache reuse and orchestration

## Risks and Mitigations

- Risk: App logic remains too large in `App.tsx`.
  - Mitigation: extract row editing, auth gate, and recommendation helpers into focused modules.
- Risk: recalculation causes visible UI jitter.
  - Mitigation: debounce + optimistic local recompute + loading indicators for async deltas only.
- Risk: auth migration breaks local dev.
  - Mitigation: include clear `.env.local` requirements and signed-out fallback view.
- Risk: recommendation data can be sparse for some categories.
  - Mitigation: category fallback options and card-level "limited options" state.

## Acceptance Criteria

- All personal/salary fields are editable and required.
- `CALCULATE BUDGET` uses entered values and blocks invalid submits with clear errors.
- Clerk sign-in gates the app; data is per-user.
- Monthly expenses support hover 3-dot menu, inline edit, delete, and add item.
- Monthly expenses section remains fixed-height and scrolls on overflow.
- Editing input fields triggers recalculation after first successful calculate.
- API calls are skipped for non-impactful edits and cache hits.
- Bottom dashboard cards always show top two expense categories with up to four options from current to cheapest.
