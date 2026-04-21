# Editable Inputs + Recalc + Expense CRUD + Clerk Fix — Design

## Overview

Converts the KAZI&BUDGET app from a static mock (`web/src/data/dummy.ts`) into a live, per-user product. Targets the 7 feature items + 1 Clerk bug captured in `KaziNBudgetRules.md`. Supersedes the pending tasks T020–T057 in `openspec/implementation-phase/tasks.md`.

## Goals

1. Make Personal Info and Salary & Tax fields editable, with required-field validation.
2. `CALCULATE BUDGET` uses current input values; disabled when invalid; subtle CSS shake on invalid fields when clicked.
3. Fix the Clerk sign-in failure (`cannot_render_single_session_enabled` + `/sessions/.../touch` 404) caused by a stale dev session cookie.
4. Monthly expenses rows support hover-revealed 3-dot menu (shadcn `DropdownMenu`) with Edit / Delete.
5. Inline row edit (name + amount + save ✓ / cancel ✕; Enter / Escape keys).
6. Add new expense items via an inline `+ Add item` row at the list bottom. Fixed-height card; vertical scroll on overflow.
7. Editing inputs after the first calculation triggers a debounced recalculation.
8. Cache results by input-hash so identical edits hit cache instead of the network.

## Non-goals

- No brand/theme/layout redesign; reuse Editorial Brutalist tokens already in `web/src/index.css`.
- No new routes or tab shell changes; Growth and Compare tabs untouched.
- No Clerk dashboard configuration changes.
- No expansion beyond Nairobi.

## UX decisions (finalized)

| Area | Decision |
| --- | --- |
| Plan layout | Single folder: `openspec/editable-inputs-and-recalc/` |
| Clerk fix | Auto-`signOut()` on session 404 + `<UserButton/>` in authed shell. `SignInButton` already guarded by `<Unauthenticated>` |
| Recalc trigger | Debounced auto-recalc (600 ms) after first successful Calculate click |
| Cache | React-state memoization by `budgetFingerprint` + existing Convex `takeHomeResults` / `rentCache` / `foodCostCache` |
| Add expense | Inline `+ Add item` row at list bottom, expands to two inputs + ✓/✕ |
| 3-dot menu | shadcn `DropdownMenu` anchored to trigger, brutalist border + 4 px offset shadow |
| Validation | Inline red error under field + disabled Calculate button + 300 ms CSS shake on invalid Calculate attempt |
| Branching | Single feature branch `feat/editable-inputs-and-recalc`; one commit per numbered task |

## Data flow

```
User edits input ─► react-hook-form state ─► Zod validate (BudgetInputSchema)
                                               │
                            (valid + hasCalculated) ▼
                                      debounce 600 ms
                                               │
                                               ▼
                         budgetFingerprint(inputs)
                                ├── match lastCalcFingerprint? → reuse local result (0 network)
                                │
                                ▼ miss
                   impact classifier (name/company? salary? location? expenses?)
                                ├── name/company only → local recompute only
                                ├── salary only       → local tax recompute; no location lookup
                                ├── location change   → full Convex recalc
                                └── expense edit      → local recompute; invalidate fingerprint
                                               │
                                               ▼
                             convex/budget.getByFingerprint(owner_id, fingerprint)
                                ├── hit → return cached takeHomeResult
                                └── miss → budget.upsertByFingerprint → store → return
```

## Reuse (do NOT re-implement)

Already in the tree, with tests:

- `shared/schemas/budget-input.ts` — `BudgetInputSchema` + inferred type
- `shared/lib/budget-fingerprint.ts` — stable hash over impactful fields
- `shared/lib/recommendations.ts` — top-two expense categories + up to four options
- `convex/expenses.ts` — owner-scoped `listBySession`, `getSummary`, `create`, `update`, `remove`, `resetAuto`
- `convex/submissions.ts` — owner-scoped create/get
- `convex/lib/ownership.ts` — `getOwnerIdOrThrow`, `assertOwnerAccess`
- `convex/auth.config.ts` — Clerk issuer config

## Files created

### Web
- `web/src/components/input/budget-input-form.tsx` — controlled react-hook-form + `BudgetInputSchema`, extracted from `App.tsx`
- `web/src/components/input/validated-field.tsx` — field wrapper with inline error + shake class
- `web/src/components/expenses/expense-row.tsx` — row with hover 3-dot trigger, inline edit mode, delete
- `web/src/components/expenses/expense-row-menu.tsx` — shadcn `DropdownMenu` wrapper (Edit / Delete)
- `web/src/components/expenses/add-expense-row.tsx` — persistent `+ Add item` row expanding to inputs
- `web/src/hooks/use-debounced-recalc.ts` — 600 ms debounce + fingerprint memo
- `web/src/hooks/use-budget-calculation.ts` — wires Convex, cache check, impact classifier
- `web/src/lib/session-recovery.ts` — Clerk stale-session 404 detection → `signOut({ redirectUrl: '/' })` + clear storage
- `web/src/styles/shake.css` (or equivalent `@keyframes shake` in existing stylesheet)

### Convex
- `convex/budget.ts` — `getByFingerprint(owner_id, fingerprint)` query + `upsertByFingerprint` mutation, keyed on `(owner_id, fingerprint)`, backed by `takeHomeResults`

## Files edited

- `web/src/App.tsx` — replace `dummy.ts` consumption with live state; mount new components; add `hasCalculated` / `isRecalculating` / `lastCalcFingerprint`; fixed-height + `overflow-y:auto` on expenses card; mount `<UserButton/>` in header
- `web/src/components/auth/auth-gate.tsx` — mount session-recovery hook
- `convex/schema.ts` — add `fingerprint` index on `takeHomeResults` if missing (verify first)
- `openspec/implementation-phase/tasks.md` — single pointer line noting T020–T057 superseded by this folder
- `web/src/data/dummy.ts` — demoted to fallback only (no live consumption)

## Acceptance criteria

1. Every Personal Info and Salary & Tax field accepts typed input.
2. `CALCULATE BUDGET` is disabled while any required field is empty/invalid; on invalid click, offending fields shake and show inline error.
3. Signed-out users see the sign-in view; sign-in works with a stale cookie present. Authed shell shows `<UserButton/>` with sign-out.
4. Monthly expense rows show a 3-dot menu on hover; Edit swaps row into inline editor; Delete removes the item; add-item row appends new editable row.
5. Expense list remains fixed height and scrolls when items overflow.
6. After first Calculate, editing any impactful field triggers a debounced recalc; non-impactful edits (name/company) do not hit network.
7. Repeated identical edits (same fingerprint) reuse cached result — no additional network requests.
8. All data is scoped to the authenticated user via `owner_id`; no cross-user access.
9. `pnpm check` passes (lint, typecheck, build, test:unit) before each commit.

## Risks

- **`App.tsx` bloat** — mitigate by extracting input form, expense list, and header into focused components.
- **Recalc jitter** — mitigate with debounce + local-only compute for fast paths; async loaders only for location lookups.
- **Stale Clerk session edge cases** — session-recovery hook targets exactly the `/sessions/.../touch` 404; add console warning for other Clerk failures rather than blanket signOut.
- **Cache misses on transient expense edits** — expense fingerprint should round amounts to whole units to avoid thrash.
