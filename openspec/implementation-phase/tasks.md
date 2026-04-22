# Kazi Budget Rules Completion - Tasks

> **Note:** Tasks 20–57 (Phase 4 onward) are superseded by [`openspec/editable-inputs-and-recalc/`](../editable-inputs-and-recalc/tasks.md). Tasks 1–19 remain authoritative history for the completed Clerk + ownership work.

## Phase 0: Planning and Branching

- [x] 1. Create a feature branch for this bundle (example: `feat/implementation-phase`).
- [x] 2. Confirm `openspec/implementation-phase/design.md` is approved as implementation baseline.
- [x] 3. Capture current UI screenshots for Input and Dashboard tabs as before-state artifacts.

## Phase 1: Shared Contracts and Utilities

- [x] 4. Create `shared/schemas/budget-input.ts` with required fields for Personal Info + Salary & Tax and export `BudgetInputSchema` + inferred type.
- [x] 5. Add unit tests `shared/schemas/__tests__/budget-input.test.ts` for required-field and numeric validation behavior.
- [x] 6. Create `shared/lib/budget-fingerprint.ts` to generate a stable fingerprint from impactful fields (salary, locations, expense items, assumptions).
- [x] 7. Add unit tests `shared/lib/__tests__/budget-fingerprint.test.ts` to verify deterministic hashing and change sensitivity.
- [x] 8. Create `shared/lib/recommendations.ts` to compute the top two expense categories and at-most-four options from current to cheapest.
- [x] 9. Add unit tests `shared/lib/__tests__/recommendations.test.ts` for sorting, max-options cap, and fallback behavior.

## Phase 2: Clerk Authentication Integration

- [x] 10. Add Clerk dependencies to `web/package.json` and install (`@clerk/clerk-react`, `convex/react-clerk` if missing).
- [x] 11. Add Clerk environment variables to `.env.local` and `.env.example` (`VITE_CLERK_PUBLISHABLE_KEY`, Convex Clerk issuer config values).
- [x] 12. Create `convex/auth.config.ts` and configure Clerk as auth provider for Convex.
- [x] 13. Update `web/src/main.tsx` to use `ClerkProvider` + `ConvexProviderWithClerk`.
- [x] 14. Add `web/src/components/auth/auth-gate.tsx` to render signed-out state and protect the app shell.
- [x] 15. Replace static user badge in `web/src/App.tsx` with Clerk user data (`firstName/lastName` fallback to email).

## Phase 3: Ownership and Backend Guardrails

- [x] 16. Edit `convex/schema.ts` to add `owner_id` to `submissions` and `expenses` tables with indexes for owner-scoped queries.
- [x] 17. Edit `convex/submissions.ts` create/get handlers to enforce authenticated ownership via `ctx.auth.getUserIdentity()`.
- [x] 18. Edit `convex/expenses.ts` queries/mutations to enforce owner scoping and reject unauthorized access.
- [x] 19. Add backend tests for ownership isolation in `convex/__tests__/auth-ownership.test.ts` (or nearest existing suite).

## Phase 4: Editable Input + Validation + Calculate Button

- [ ] 20. Refactor `web/src/App.tsx` Input tab fields from read-only `dummy.ts` values to controlled state (`budgetInputDraft`).
- [ ] 21. Add inline validation messages and top-level error summary using `BudgetInputSchema`.
- [ ] 22. Keep `CALCULATE BUDGET` as explicit primary action; block action when required inputs are invalid.
- [ ] 23. Replace static tax card values with computed values from shared tax logic based on entered salary.
- [ ] 24. Ensure the "NET AFTER TAX" panel updates from current draft salary calculation.
- [ ] 25. Add component tests for input validation and calculate button behavior in `web/src/App.input.test.tsx` (or split component tests if Input tab is extracted).

## Phase 5: Recalculation Engine and API Call Control

- [ ] 26. Add `hasCalculated`, `isRecalculating`, and `lastCalcFingerprint` state to `web/src/App.tsx` (or a dedicated hook).
- [ ] 27. Implement debounced recalculation after first successful calculate (`300-500ms`), triggered by input edits.
- [ ] 28. Add impact-based gating so non-impactful edits (name/company only) skip external lookup calls.
- [ ] 29. Reuse existing Convex cache paths (take-home and lookup caches) by querying cached result first using fingerprint.
- [ ] 30. Add/update Convex query/mutation(s) to read/write cached calculations keyed by `owner_id + fingerprint`.
- [ ] 31. Add logging/telemetry markers for `cache_hit`, `cache_miss`, and `lookup_skipped` decisions.
- [ ] 32. Add tests for recalculation gating and cache behavior in web and Convex test suites.

## Phase 6: Monthly Expenses Row Actions and Inline Editing

- [ ] 33. Add 3-dot hover action trigger per monthly expense row in `web/src/App.tsx` (or extracted row component).
- [ ] 34. Add contextual menu/popover anchored to row with `Edit` and `Delete` options.
- [ ] 35. Implement inline row edit mode (name + amount inputs with save/check and cancel/x actions) matching provided screenshot behavior.
- [ ] 36. Implement delete flow with lightweight confirmation and immediate totals update.
- [ ] 37. Add `+ Add Item` control to create a new editable expense row.
- [ ] 38. Keep monthly expenses card at fixed height and set overflow to vertical scroll.
- [ ] 39. Add keyboard UX for inline edit (`Enter` save, `Escape` cancel, tab order preserved).
- [ ] 40. Add unit/component tests for row menu visibility, edit-save-cancel, delete, and add-item flows.

## Phase 7: Dynamic Bottom Two Recommendation Cards

- [ ] 41. Replace static rent/food detail cards in Dashboard section with dynamic cards driven by top two largest adjustable expenses.
- [ ] 42. For each card, show current option first and then cheaper alternatives up to four total options.
- [ ] 43. Add category-specific labels for recommendation cards (rent, food, transport, groceries, etc.) using location context when available.
- [ ] 44. Add empty/limited-options state when fewer than two categories or fewer than four alternatives exist.
- [ ] 45. Add component tests verifying top-two selection, ordering from current to cheapest, and max-four-option limit.

## Phase 8: Integration and Manual QA

- [ ] 46. Verify end-to-end flow: sign in -> edit inputs -> calculate -> edit monthly expenses -> observe automatic recalculation.
- [ ] 47. Verify no unnecessary API requests on non-impactful edits and repeated identical fingerprints.
- [ ] 48. Verify monthly expense section remains fixed height and scrolls with overflow.
- [ ] 49. Verify recommendation cards update after expense edits and always reflect current top-two categories.
- [ ] 50. Capture after-state screenshots for all changed behaviors.

## Phase 9: Quality Gates

- [ ] 51. Add a root `pnpm check` script in `package.json` (if missing) that runs the required validation pipeline for this repo.
- [ ] 52. Run `pnpm lint`.
- [ ] 53. Run `pnpm typecheck`.
- [ ] 54. Run `pnpm build`.
- [ ] 55. Run `pnpm test:unit`.
- [ ] 56. Run `pnpm check` immediately before commit (per project rule).
- [ ] 57. Update this checklist by marking completed tasks as implementation progresses.
