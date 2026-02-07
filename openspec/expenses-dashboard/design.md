# Expenses Dashboard - Design Document

## Overview

The expenses dashboard is the central page of the WorkPlace Budgeting app. After a user submits their salary and location details, this page presents a complete visual breakdown of all deductions and expenses, culminating in the net take-home salary figure. It serves as both an informational display and an interactive workspace where users can add, edit, and delete expenses to model their actual financial situation.

The dashboard targets job seekers in Nairobi who may not be familiar with the full cost of living. It auto-populates mandatory Kenyan deductions (PAYE, NSSF, SHIF, Housing Levy) and estimated costs (rent, food, transport), while allowing users to layer on personal expenses (gym, internet, utilities, entertainment, groceries, etc.). Every change recalculates the take-home salary in real time.

## High-Level Approach

### Page Layout

The dashboard is organized into three vertical sections:

1. **Summary Cards Row** -- Four stat cards across the top showing Gross Salary, Total Deductions (statutory), Total Expenses (living costs), and Net Take-Home. These update in real time as expenses change.
2. **Expense Breakdown Chart** -- A donut/pie chart showing the proportional split of all expense categories (taxes, rent, food, transport, custom). A companion bar chart option allows toggling between views.
3. **Expense List/Table** -- A scrollable table of every individual expense with columns for name, category, monthly amount (KES), source (auto-calculated or user-added), and actions (edit/delete). An "Add Expense" button opens a dialog form.

### Data Flow

```
User submits salary form
  -> Convex mutation creates submission record
  -> Convex action triggers calculation pipeline
  -> Pipeline auto-generates expense records:
      - PAYE (computed from KRA tax brackets)
      - NSSF (tiered: old/new rates)
      - SHIF (2.75% of gross salary)
      - Housing Levy (1.5% of gross salary)
      - Rent estimate (from zone classification)
      - Food estimate (from zone classification)
      - Transport estimate (from distance calculation)
  -> Expense records stored in Convex `expenses` table
  -> Dashboard subscribes to `expenses` query (real-time via Convex)
  -> User sees all expenses, can add/edit/delete
  -> Summary cards and chart update on every change
```

### Real-Time Updates

Convex provides real-time subscriptions out of the box. The dashboard page uses `useQuery` hooks to subscribe to the expenses list and summary aggregations. When a user adds, edits, or deletes an expense, the mutation fires and the UI updates automatically without manual refetching or state management.

### Auto-Populated Expenses

These are generated server-side by the calculation pipeline and stored with `is_auto: true`:

| Expense | Category | Calculation Logic |
|---------|----------|-------------------|
| **PAYE** | tax | KRA 2024/2025 tax brackets applied to taxable income after pension/insurance relief |
| **NSSF** | tax | Tiered contribution: Tier I (6% of KES 7,000) + Tier II (6% of balance up to KES 36,000) capped at KES 2,160/month |
| **SHIF** | tax | 2.75% of gross salary |
| **Housing Levy** | tax | 1.5% of gross salary (employer + employee, but employee portion is 1.5%) |
| **Rent** | rent | Estimated from residential area zone: Premium KES 25,000-60,000, Middle KES 12,000-25,000, Budget KES 5,000-12,000, Satellite KES 4,000-15,000 |
| **Food (Lunch)** | food | Estimated daily lunch cost near company location multiplied by ~22 working days. Premium zone: KES 400-600/day, Middle: KES 200-400/day, Budget: KES 100-200/day |
| **Transport** | transport | Estimated from distance between home and work. Matatu/bus fare ranges by zone: KES 50-200 per trip, doubled for round trip, multiplied by 22 working days |

### User-Added Custom Expenses

Users can add any number of custom expenses. Common suggestions are presented as quick-add chips:

| Suggestion | Typical Range (KES) |
|------------|---------------------|
| Gym membership | 2,000 - 5,000 |
| Utilities (water + electricity) | 1,000 - 3,000 |
| Internet / WiFi | 2,000 - 4,000 |
| Groceries (supplementary) | 5,000 - 15,000 |
| Entertainment | 2,000 - 8,000 |
| Savings / Emergency fund | 5,000 - 20,000 |
| Phone airtime / data | 500 - 2,000 |
| Clothing | 1,000 - 5,000 |
| Personal care | 500 - 2,000 |

### CRUD Operations

| Operation | Convex Function | Type | Description |
|-----------|----------------|------|-------------|
| List expenses | `expenses.listBySession` | Query | Returns all expenses for a user session, ordered by category then name |
| Get summary | `expenses.getSummary` | Query | Returns aggregated totals: gross salary, total tax, total expenses, net take-home |
| Add expense | `expenses.create` | Mutation | Creates a new custom expense with `is_auto: false` |
| Edit expense | `expenses.update` | Mutation | Updates name, category, or amount of any expense. If editing an auto expense, sets `is_auto: false` to mark it as overridden |
| Delete expense | `expenses.remove` | Mutation | Deletes a custom expense. Auto expenses cannot be deleted, only edited to zero |
| Reset expense | `expenses.resetAuto` | Mutation | Resets an overridden auto expense back to its calculated value |

## Component Architecture

```
ExpensesDashboardPage (route: /dashboard/:sessionId)
├── SummaryCardsRow
│   ├── SummaryCard (Gross Salary)
│   ├── SummaryCard (Total Deductions)
│   ├── SummaryCard (Total Expenses)
│   └── SummaryCard (Net Take-Home)
├── ExpenseChart
│   ├── DonutChart (default view)
│   └── BarChart (toggle view)
├── ExpenseTable
│   ├── ExpenseTableHeader
│   ├── ExpenseTableRow (per expense)
│   │   ├── CategoryBadge
│   │   ├── SourceBadge (auto / manual)
│   │   └── ActionButtons (edit / delete / reset)
│   └── ExpenseTableFooter (total row)
├── AddExpenseButton
│   └── ExpenseDialog (triggered on click)
│       └── ExpenseForm
│           ├── NameInput
│           ├── CategorySelect
│           └── AmountInput
└── QuickAddChips
    └── SuggestionChip (gym, utilities, internet, etc.)
```

## shadcn/ui Components Used

| Component | Usage |
|-----------|-------|
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | Summary stat cards at the top |
| `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` | Recharts wrapper for donut and bar charts (shadcn chart primitives) |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Expense list table |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` | Add/edit expense modal form |
| `Button` | Add expense, edit, delete, reset, chart toggle actions |
| `Input` | Expense name and amount fields in the dialog form |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | Category picker in the dialog form |
| `Badge` | Category labels (tax, rent, food, transport, custom) and source labels (auto, manual) |
| `Tooltip`, `TooltipTrigger`, `TooltipContent` | Hover info on auto-calculated values explaining the calculation |
| `Separator` | Visual dividers between dashboard sections |
| `Skeleton` | Loading states while expenses are being fetched |
| `DropdownMenu` | Row-level actions menu (edit, delete, reset) on mobile |

## Convex Schema

### `expenses` Table

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... other tables (submissions, etc.)

  expenses: defineTable({
    user_session_id: v.string(),
    name: v.string(),
    category: v.union(
      v.literal("tax"),
      v.literal("rent"),
      v.literal("food"),
      v.literal("transport"),
      v.literal("custom")
    ),
    amount: v.number(),        // Monthly amount in KES
    is_auto: v.boolean(),      // true = system-calculated, false = user-added or overridden
    original_amount: v.optional(v.number()), // Original auto-calculated value (for reset)
    description: v.optional(v.string()),     // Optional note or calculation explanation
    created_at: v.number(),    // Unix timestamp ms
    updated_at: v.number(),    // Unix timestamp ms
  })
    .index("by_session", ["user_session_id"])
    .index("by_session_category", ["user_session_id", "category"]),
});
```

### Zod Validation Schema (Shared)

```typescript
import { z } from "zod";

const expenseCategorySchema = z.enum(["tax", "rent", "food", "transport", "custom"]);

const createExpenseSchema = z.object({
  name: z
    .string()
    .min(1, "Expense name is required")
    .max(100, "Name must not exceed 100 characters"),
  category: expenseCategorySchema,
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .nonnegative("Amount cannot be negative")
    .max(10_000_000, "Please enter a realistic amount"),
  description: z.string().max(500).optional(),
});

const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string().min(1),
});
```

## Kenyan Tax Calculation Reference

The tax calculation logic must reflect current KRA (Kenya Revenue Authority) rates. This is critical for the auto-populated tax expenses.

### PAYE Brackets (Monthly, 2024/2025)

| Taxable Income (KES/month) | Rate |
|-----------------------------|------|
| Up to 24,000 | 10% |
| 24,001 - 32,333 | 25% |
| 32,334 - 500,000 | 30% |
| 500,001 - 800,000 | 32.5% |
| Above 800,000 | 35% |

Personal relief: KES 2,400/month.

### NSSF (New Rates)

- Tier I: 6% of first KES 7,000 = max KES 420
- Tier II: 6% of next KES 29,000 (KES 7,001 to KES 36,000) = max KES 1,740
- Total cap: KES 2,160/month

### SHIF (Social Health Insurance Fund)

- 2.75% of gross salary

### Housing Levy

- 1.5% of gross salary (employee contribution)

## Responsive Design

| Viewport | Layout |
|----------|--------|
| **Desktop (>=1024px)** | 4-column summary cards row; chart and table side by side or stacked with full table columns visible |
| **Tablet (768-1023px)** | 2x2 grid for summary cards; chart full width above table; table shows key columns, others in expandable row |
| **Mobile (<768px)** | Single column for everything; summary cards stack vertically or scroll horizontally; chart full width; table switches to card-based layout with expense cards instead of rows; action buttons in a dropdown menu |

The `ExpenseTable` component renders a `<Table>` on desktop/tablet and a stacked card list on mobile, controlled by a `useMediaQuery` hook or Tailwind responsive classes.

## Files to Create

| File | Description |
|------|-------------|
| `packages/web/src/routes/dashboard.$sessionId.tsx` | TanStack Router route for the dashboard page |
| `packages/web/src/components/dashboard/summary-cards-row.tsx` | Row of four summary stat cards |
| `packages/web/src/components/dashboard/summary-card.tsx` | Individual summary stat card component |
| `packages/web/src/components/dashboard/expense-chart.tsx` | Donut/pie chart and bar chart with toggle |
| `packages/web/src/components/dashboard/expense-table.tsx` | Table listing all expenses with actions |
| `packages/web/src/components/dashboard/expense-dialog.tsx` | Dialog form for adding/editing an expense |
| `packages/web/src/components/dashboard/expense-form.tsx` | Form inside the dialog with name, category, amount fields |
| `packages/web/src/components/dashboard/quick-add-chips.tsx` | Suggestion chips for common custom expenses |
| `packages/web/src/components/dashboard/category-badge.tsx` | Color-coded badge for expense categories |
| `packages/web/src/components/dashboard/source-badge.tsx` | Badge indicating auto-calculated vs user-added |
| `packages/shared/schemas/expense.ts` | Zod schemas for expense create/update validation |
| `packages/shared/constants/expense-suggestions.ts` | Predefined custom expense suggestions with typical KES ranges |
| `packages/shared/constants/tax-brackets.ts` | KRA PAYE brackets, NSSF rates, SHIF rate, Housing Levy rate |
| `packages/shared/utils/tax-calculator.ts` | Pure functions to compute PAYE, NSSF, SHIF, Housing Levy from gross salary |
| `packages/convex/api/routes/expenses.ts` | Convex queries and mutations for expenses CRUD |

## Files to Edit

| File | Change |
|------|--------|
| `packages/convex/schema.ts` | Add `expenses` table definition with indexes |
| `packages/web/src/routes/__root.tsx` (or router config) | Register the `/dashboard/:sessionId` route |
| `packages/convex/api/routes/submissions.ts` | After submission creation, schedule the expense calculation action that auto-populates expenses |

## Tests to Write

### Unit Tests (Vitest)

| Test File | What It Covers |
|-----------|----------------|
| `packages/shared/utils/tax-calculator.test.ts` | PAYE calculation for various salary levels (KES 30k, 50k, 100k, 200k, 500k, 1M); NSSF tier calculations; SHIF percentage; Housing Levy percentage; edge cases (zero salary, maximum salary) |
| `packages/shared/schemas/expense.test.ts` | Create schema accepts valid expense; rejects empty name; rejects negative amount; rejects unknown category; update schema allows partial fields; update schema requires id |
| `packages/web/src/components/dashboard/summary-card.test.tsx` | Renders title, amount formatted with KES, and optional percentage change indicator |
| `packages/web/src/components/dashboard/expense-chart.test.tsx` | Renders chart with correct segments; handles empty expense list; toggle between donut and bar views |
| `packages/web/src/components/dashboard/expense-table.test.tsx` | Renders all expense rows; edit button opens dialog; delete button removes custom expense; auto expenses show "auto" badge; delete button is hidden for auto expenses |
| `packages/web/src/components/dashboard/expense-dialog.test.tsx` | Dialog opens on trigger; form validates inputs; submitting valid data calls the mutation; cancel closes the dialog; edit mode pre-fills fields |
| `packages/web/src/components/dashboard/quick-add-chips.test.tsx` | Renders suggestion chips; clicking a chip opens the dialog pre-filled with that expense's name and suggested amount |

### Integration Tests (Vitest + Convex test utilities)

| Test File | What It Covers |
|-----------|----------------|
| `packages/convex/api/routes/expenses.test.ts` | `listBySession` returns only expenses for the given session; `create` adds expense and returns it; `update` modifies fields and updates `updated_at`; `remove` deletes custom expense; `remove` rejects deletion of auto expense; `resetAuto` restores original calculated amount |

### E2E Tests (Playwright)

| Test File | What It Covers |
|-----------|----------------|
| `e2e/expenses-dashboard.spec.ts` | Full flow: submit salary form, land on dashboard, verify summary cards show correct values, verify auto expenses are listed, add a custom expense, verify table and chart update, edit an auto expense, verify override is reflected, delete a custom expense, verify removal |

## Risks and Tradeoffs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| KRA tax brackets change mid-year | Low | High (wrong PAYE calculations) | Store tax bracket data in a shared constants file with a clear date stamp; add a scheduled check or admin flag to review annually; surface a disclaimer on the dashboard |
| Rent/food/transport estimates are inaccurate | High | Medium (user trust erodes) | Show estimates with a visible "estimated" label and a tooltip explaining the methodology; allow users to override any value; use conservative midpoint estimates |
| Users overload the dashboard with too many custom expenses | Low | Low (UI clutter) | Cap custom expenses at 20 per session; show a warning at 15 |
| Real-time Convex subscriptions cause excessive re-renders | Medium | Medium (performance) | Use `React.memo` and `useMemo` on expensive computations; keep chart re-renders throttled with a debounce wrapper |
| Session-based data (no auth) could be lost | Medium | High (user loses all data) | Store session ID in localStorage; show a warning that data is session-based; plan for authentication in a future iteration |
| NSSF new rates vs old rates confusion | Medium | Medium | Default to new (2024) rates; add a toggle or note explaining the difference |

### Tradeoffs

| Decision | Upside | Downside |
|----------|--------|----------|
| Session-based (no auth) for V1 | Faster to build; no login friction for casual users | Data is ephemeral; no cross-device access |
| Storing expenses as individual rows vs. a single JSON blob | Easier CRUD; Convex indexes work per-row; real-time subscriptions are granular | More database reads for the full list; slightly more complex queries |
| Using shadcn/ui chart (Recharts) vs. Chart.js or D3 | Consistent with the rest of the UI; shadcn provides wrapper components; smaller bundle for basic charts | Less customizable than D3; Recharts bundle is ~45KB gzipped |
| Auto-calculating taxes server-side (Convex action) vs. client-side | Single source of truth; prevents client-side manipulation; works if we add auth later | Adds latency to initial load; requires Convex action scheduling |
| Allowing overrides on auto expenses | Users can correct inaccurate estimates | Overridden values may diverge significantly from reality; users may forget they changed them |
| Zone-based cost estimation vs. exact address lookup | Simple, fast, no external API needed | Coarse granularity; two areas in the same zone can have very different costs |

## UI Layout (Wireframe Description)

```
+----------------------------------------------------------------------+
|  WorkPlace Budgeting            [User Name] | [Back to Form]         |
+----------------------------------------------------------------------+
|                                                                      |
|  +------------+  +---------------+  +-------------+  +-----------+   |
|  | Gross      |  | Deductions    |  | Expenses    |  | Take-Home |   |
|  | Salary     |  | (Taxes)       |  | (Living)    |  | Salary    |   |
|  | KES 80,000 |  | KES 18,450    |  | KES 32,000  |  | KES 29,550|   |
|  +------------+  +---------------+  +-------------+  +-----------+   |
|                                                                      |
|  +----------------------------+  +---------------------------------+ |
|  |                            |  |  Expense Breakdown              | |
|  |      [Donut Chart]         |  |  +---------+---------+--------+ | |
|  |   Taxes 36%  Rent 31%     |  |  | PAYE    | tax     |KES 14k | | |
|  |   Food 15%  Transport 10% |  |  | NSSF    | tax     |KES 2.1k| | |
|  |   Custom 8%               |  |  | SHIF    | tax     |KES 2.2k| | |
|  |                            |  |  | Housing | tax     |KES 1.2k| | |
|  +----------------------------+  |  | Rent    | rent    |KES 15k | | |
|                                  |  | Lunch   | food    |KES 8.8k| | |
|  +----------------------------+  |  | Matatu  |transport|KES 4.4k| | |
|  | Quick Add:                 |  |  | Gym     | custom  |KES 3k  | | |
|  | [Gym] [Internet] [Utils]  |  |  +---------+---------+--------+ | |
|  | [Groceries] [Entertainment]|  |                                 | |
|  +----------------------------+  |  [+ Add Expense]                | |
|                                  +---------------------------------+ |
+----------------------------------------------------------------------+
```

### Category Color Coding

| Category | Color | Badge Variant |
|----------|-------|---------------|
| tax | Red / Destructive | `destructive` |
| rent | Blue | `default` (blue theme) |
| food | Orange / Amber | `secondary` (amber theme) |
| transport | Green | `outline` (green theme) |
| custom | Purple | `secondary` (purple theme) |
