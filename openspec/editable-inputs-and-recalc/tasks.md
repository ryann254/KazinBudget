# Editable Inputs + Recalc + Expense CRUD + Clerk Fix — Tasks

Feature branch: `feat/editable-inputs-and-recalc` (one commit per task).
Supersedes `openspec/implementation-phase/tasks.md` tasks T020–T057.

## Phase 0 — Bootstrap

- [x] 1. Create this folder with `design.md` + `tasks.md`.
- [x] 2. Checkout feature branch `feat/editable-inputs-and-recalc` from current HEAD (no pull).
- [x] 3. Add supersede pointer to `openspec/implementation-phase/tasks.md` header.

## Phase 1 — Clerk sign-in fix

- [ ] 4. Add `web/src/lib/session-recovery.ts`: detect Clerk `/sessions/.../touch` 404, call `signOut({ redirectUrl: '/' })`, clear `__clerk_*` keys from `localStorage`.
- [ ] 5. Mount recovery hook at the root of `AuthGate` (`web/src/components/auth/auth-gate.tsx`). Verify `SignInButton` is inside `<Unauthenticated>` only.
- [ ] 6. Mount `<UserButton afterSignOutUrl="/"/>` in the header area of the authed shell in `web/src/App.tsx`.
- [ ] 7. Manual verify with stale dev cookie: refresh → recovery signs out → sign-in renders → sign in succeeds. Save screenshot to `.artifacts/T004-clerk-signin.png`.

## Phase 2 — Editable input form

- [ ] 8. Create `web/src/components/input/validated-field.tsx` — field wrapper with inline error; `shake` prop triggers 300 ms CSS animation.
- [ ] 9. Add `@keyframes shake` + `.animate-shake` to `web/src/index.css` (reuse existing stylesheet; do not create new file if not needed).
- [ ] 10. Create `web/src/components/input/budget-input-form.tsx` — react-hook-form + `BudgetInputSchema`. Fields: `fullName`, `company`, `workLocation`, `homeArea`, `grossSalary`, `experienceYears`.
- [ ] 11. Extract Input-tab markup from `App.tsx` to consume `budget-input-form.tsx`.
- [ ] 12. Wire `CALCULATE BUDGET`: `disabled` while form invalid; on invalid click, trigger shake on offending fields; on valid click, call `submissions.upsertByFingerprint` (added Phase 3) and set `hasCalculated = true`.
- [ ] 13. Replace static tax cards with computed values from current `grossSalary` via shared tax utilities.
- [ ] 14. Add component tests: invalid submit shows errors + shake; valid submit fires calc once.

## Phase 3 — Recalculation + cache

- [ ] 15. Add `convex/budget.ts` — `getByFingerprint({ fingerprint })` query + `upsertByFingerprint` mutation, owner-scoped, reusing `takeHomeResults`.
- [ ] 16. Verify / add a `(owner_id, fingerprint)` index in `convex/schema.ts` on `takeHomeResults`.
- [ ] 17. Create `web/src/hooks/use-debounced-recalc.ts` — 600 ms debounce; computes `budgetFingerprint`; skips when equal to `lastCalcFingerprint`.
- [ ] 18. Create `web/src/hooks/use-budget-calculation.ts` — impact classifier (name/company = local only; salary = local tax recompute; location/expense = full recalc); cache-first via `budget.getByFingerprint`; persist via `upsertByFingerprint`.
- [ ] 19. Wire hooks into `App.tsx`; show `isRecalculating` spinner only for async paths.
- [ ] 20. Manual verify in DevTools Network: typing name = zero requests; typing salary = one request per 600 ms window; repeat identical salary = zero additional requests. Save screenshot to `.artifacts/T020-network-cache.png`.
- [ ] 21. Tests: `use-debounced-recalc` fingerprint equality skips callback; `use-budget-calculation` impact classifier routes correctly.

## Phase 4 — Monthly expenses CRUD

- [ ] 22. Create `web/src/components/expenses/expense-row-menu.tsx` — shadcn `DropdownMenu` with Edit / Delete items, styled with brutalist border + 4 px offset shadow.
- [ ] 23. Create `web/src/components/expenses/expense-row.tsx` — row display; hover reveals 3-dot trigger; holds `isEditing` state; Edit swaps to inline name + amount inputs + ✓/✕; `Enter` saves, `Escape` cancels.
- [ ] 24. Wire row save → `expenses.update`; delete → `expenses.remove` (skip confirm dialog for MVP; rely on undo affordance later).
- [ ] 25. Create `web/src/components/expenses/add-expense-row.tsx` — persistent `+ Add item` row; click expands to inline inputs; ✓ calls `expenses.create`.
- [ ] 26. Replace static expense list in `App.tsx` with live query `expenses.listBySession`. Container: fixed height (keep current value), `overflow-y: auto`.
- [ ] 27. Expense edits invalidate `lastCalcFingerprint` → triggers recalc pipeline from Phase 3.
- [ ] 28. Tests: row menu visibility on hover, edit save/cancel, delete, add-item; container scroll on overflow.

## Phase 5 — Integration QA + commit

- [ ] 29. End-to-end manual: sign in → edit inputs → calculate → edit expenses → observe auto-recalc. Save `.artifacts/T029-e2e-dashboard.png`.
- [ ] 30. Run `pnpm check` before each commit (lint, typecheck, build, test:unit). Fix any failures before commit.
- [ ] 31. Update `docs/IMPLEMENTATION_STATE.md` with task-start and task-complete entries per AGENTS.md §4–5.
- [ ] 32. Tick tasks in this file as each completes; make one commit per task on the feature branch.
