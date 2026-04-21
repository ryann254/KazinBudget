# Editable Inputs + Recalc + Expense CRUD + Clerk Fix — Tasks

Feature branch: `feat/editable-inputs-and-recalc` (one commit per task).
Supersedes `openspec/implementation-phase/tasks.md` tasks T020–T057.

## Phase 0 — Bootstrap

- [x] 1. Create this folder with `design.md` + `tasks.md`.
- [x] 2. Checkout feature branch `feat/editable-inputs-and-recalc` from current HEAD (no pull).
- [x] 3. Add supersede pointer to `openspec/implementation-phase/tasks.md` header.

## Phase 1 — Clerk sign-in fix

- [x] 4. Add `web/src/lib/session-recovery.ts`: detect Clerk `/sessions/.../touch` 404, call `signOut({ redirectUrl: '/' })`, clear `__clerk_*` keys from `localStorage`.
- [x] 5. Mount recovery hook at the root of `AuthGate` (`web/src/components/auth/auth-gate.tsx`). Verify `SignInButton` is inside `<Unauthenticated>` only.
- [x] 6. Mount `<UserButton afterSignOutUrl="/"/>` in the header area of the authed shell in `web/src/App.tsx`.
- [ ] 7. Manual verify with stale dev cookie: refresh → recovery signs out → sign-in renders → sign in succeeds. Save screenshot to `.artifacts/T004-clerk-signin.png`.

## Phase 2 — Editable input form

- [x] 8. Create `web/src/components/input/validated-field.tsx` — field wrapper with inline error; `shake` prop triggers 300 ms CSS animation.
- [x] 9. Add `@keyframes shake` + `.animate-shake` to `web/src/index.css` (reuse existing stylesheet; do not create new file if not needed).
- [x] 10. Create `web/src/hooks/use-budget-form.ts` — react-hook-form + `BudgetInputSchema` resolver. Fields: `fullName`, `company`, `workLocation`, `homeArea`, `grossSalary`, `experienceYears`. (Pivoted from extracting a whole form component: kept the tab layout in App.tsx and introduced a hook + field wrapper for minimal diff.)
- [x] 11. Wire controlled inputs in-place in `App.tsx` (swap `readOnly` for `form.register(...)`; wrap each field in `ValidatedField`).
- [x] 12. Wire `CALCULATE BUDGET`: `aria-disabled` while form invalid; on invalid click, trigger shake on offending fields; on valid click, set `hasCalculated = true` (Phase 3 wiring) and navigate to dashboard.
- [x] 13. Replace static tax cards + NET AFTER TAX with live values computed via `calculateKenyanDeductions(grossSalary)`.
- [ ] 14. Web has no vitest harness yet; per AGENTS.md §6.6 note 3, defer automated UI tests to Phase 5 manual verification with screenshots.

## Phase 3 — Recalculation + cache

- [x] 15. Add `convex/budget.ts` — `getByFingerprint({ fingerprint })` query + `upsertByFingerprint` mutation, owner-scoped.
- [x] 16. Add `budgetCalculations` table with `by_owner_fingerprint` index in `convex/schema.ts` (separate from submission-bound `takeHomeResults` to keep contracts clean).
- [x] 17. Create `web/src/hooks/use-debounced-recalc.ts` — 600 ms debounce + fingerprint-equality skip using derived `isPending`.
- [x] 18. Create `web/src/hooks/use-budget-calculation.ts` — local cache (`Map` via ref) → Convex `getByFingerprint` → local tax compute → `upsertByFingerprint` on miss. Non-impactful edits (name/company) don't alter the fingerprint, so no recalc fires.
- [x] 19. Wire hooks into `App.tsx`: `hasCalculated` flips true on first Calculate click; debounced recalc thereafter; `RECALC…` badge appears on NET AFTER TAX while pending.
- [ ] 20. Manual verify in DevTools Network (Phase 5 QA): typing name = zero requests; typing salary = one request per 600 ms window; repeat identical salary = zero additional requests. Save screenshot to `.artifacts/T020-network-cache.png`.
- [ ] 21. Web has no vitest harness; automated hook tests deferred per AGENTS.md §6.6 note 3 to Phase 5 manual verification.

## Phase 4 — Monthly expenses CRUD

- [x] 22. shadcn `DropdownMenu` usage inlined into `expense-row.tsx` (rather than separate `expense-row-menu.tsx` wrapper) — simpler surface; brutalist border + 4 px offset shadow.
- [x] 23. Create `web/src/components/expenses/expense-row.tsx` — row display; hover reveals 3-dot trigger; holds `isEditing` state; Edit swaps to inline name + amount inputs + ✓/✕; `Enter` saves, `Escape` cancels.
- [x] 24. Wire row save → `expenses.update`; delete → `expenses.remove` (no confirm dialog for MVP). Auto expenses hide the Delete option (backend rejects it anyway).
- [x] 25. Create `web/src/components/expenses/add-expense-row.tsx` — persistent `+ Add item` row; click expands to inline inputs; ✓ calls `expenses.create` with category="custom".
- [x] 26. `useExpenseList` hook wraps `listBySession/create/update/remove`. App.tsx replaces static expense list with live query. Container: `maxHeight: 320px` + `overflow-y: auto`.
- [x] 27. Expense edits propagate through `fingerprintInput.expenseItems` → `createBudgetFingerprint` changes → `useDebouncedRecalc` fires → `calculate()` runs.
- [ ] 28. Web has no vitest harness; component tests deferred per AGENTS.md §6.6 note 3 to Phase 5 manual verification.

## Phase 5 — Integration QA + commit

- [ ] 29. End-to-end manual: sign in → edit inputs → calculate → edit expenses → observe auto-recalc. Save `.artifacts/T029-e2e-dashboard.png`. _(User-side verification in progress; Clerk sign-in confirmed working after adding Convex JWT template.)_
- [x] 30. Run `pnpm check` before each commit (lint, typecheck, build, test:unit). All 6 commits on branch passed.
- [x] 31. Update `docs/IMPLEMENTATION_STATE.md` with Entry 6 covering Phases 0–5.
- [x] 32. Ticked tasks in this file; commits made per logical unit (per-task branching was replaced with per-phase commits at user's request for a single feature branch).
