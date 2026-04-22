# Expenses Dashboard - Tasks

## Phase 1: Shared Constants and Tax Logic

- [x] 1. Create `packages/shared/constants/tax-brackets.ts` with KRA 2024/2025 PAYE monthly brackets (10%, 25%, 30%, 32.5%, 35%), personal relief (KES 2,400/month), NSSF tier rates (Tier I: 6% of KES 7,000, Tier II: 6% up to KES 36,000, cap KES 2,160), SHIF rate (2.75%), and Housing Levy rate (1.5%). Export all as named `const` objects.

- [x] 2. Create `packages/shared/utils/tax-calculator.ts` with pure functions: `calculatePAYE(grossSalary: number): number`, `calculateNSSF(grossSalary: number): number`, `calculateSHIF(grossSalary: number): number`, `calculateHousingLevy(grossSalary: number): number`, and `calculateAllDeductions(grossSalary: number): { paye: number; nssf: number; shif: number; housingLevy: number; total: number }`. All amounts in KES. Round to nearest integer.

- [x] 3. Write unit tests in `packages/shared/utils/tax-calculator.test.ts`. Test PAYE for salaries: KES 20,000 (only 10% bracket), KES 30,000 (crosses into 25%), KES 100,000 (crosses into 30%), KES 600,000 (crosses into 32.5%), KES 1,000,000 (crosses into 35%). Test NSSF for salary below KES 7,000, between KES 7,000 and KES 36,000, and above KES 36,000. Test SHIF and Housing Levy are correct percentages. Test edge cases: zero salary, very large salary.

- [x] 4. Create `packages/shared/constants/expense-suggestions.ts` exporting a `EXPENSE_SUGGESTIONS` array of objects: `{ name: string; category: "custom"; suggestedMin: number; suggestedMax: number; suggestedDefault: number }`. Include: Gym (2,000-5,000, default 3,000), Utilities (1,000-3,000, default 2,000), Internet (2,000-4,000, default 3,000), Groceries (5,000-15,000, default 8,000), Entertainment (2,000-8,000, default 3,000), Savings (5,000-20,000, default 10,000), Phone/Airtime (500-2,000, default 1,000), Clothing (1,000-5,000, default 2,000), Personal Care (500-2,000, default 1,000).

## Phase 2: Zod Validation Schemas

- [x] 5. Create `packages/shared/schemas/expense.ts`. Define and export `expenseCategorySchema` as `z.enum(["tax", "rent", "food", "transport", "custom"])`. Define and export `createExpenseSchema` with fields: `name` (string, min 1, max 100), `category` (expenseCategorySchema), `amount` (number, nonnegative, max 10,000,000), `description` (string, max 500, optional). Define and export `updateExpenseSchema` as `createExpenseSchema.partial().extend({ id: z.string().min(1) })`.

- [x] 6. Write unit tests in `packages/shared/schemas/expense.test.ts`. Test: valid expense passes, empty name fails, negative amount fails, amount over 10M fails, unknown category fails, update schema allows partial fields, update schema requires id field.

## Phase 3: Convex Backend

- [x] 7. Edit `packages/convex/schema.ts` to add the `expenses` table: fields `user_session_id` (string), `name` (string), `category` (union of literals: "tax", "rent", "food", "transport", "custom"), `amount` (number), `is_auto` (boolean), `original_amount` (optional number), `description` (optional string), `created_at` (number), `updated_at` (number). Add indexes: `by_session` on `["user_session_id"]` and `by_session_category` on `["user_session_id", "category"]`.

- [x] 8. Create `packages/convex/api/routes/expenses.ts` with a query `listBySession` that takes `{ user_session_id: string }` and returns all expenses for that session, ordered by category then name. Use the `by_session` index.

- [x] 9. In the same file, add a query `getSummary` that takes `{ user_session_id: string, gross_salary: number }`. It fetches all expenses for the session, sums tax-category expenses into `totalDeductions`, sums non-tax expenses into `totalExpenses`, and returns `{ grossSalary, totalDeductions, totalExpenses, netTakeHome: grossSalary - totalDeductions - totalExpenses }`.

- [x] 10. Add a mutation `create` that takes `{ user_session_id: string, name: string, category: string, amount: number, description?: string }`. Validate category is one of the allowed values. Set `is_auto: false`, `created_at` and `updated_at` to `Date.now()`. Insert into the `expenses` table and return the new document ID.

- [x] 11. Add a mutation `update` that takes `{ id: Id<"expenses">, name?: string, category?: string, amount?: number, description?: string }`. Fetch the existing expense by ID. If editing an auto expense (`is_auto === true`), store the current amount in `original_amount` (if not already set) and set `is_auto` to `false`. Apply the provided field updates and set `updated_at` to `Date.now()`.

- [x] 12. Add a mutation `remove` that takes `{ id: Id<"expenses"> }`. Fetch the expense by ID. If `is_auto` is `true`, throw an error: "Auto-calculated expenses cannot be deleted. You can edit the amount instead." Otherwise, delete the document.

- [x] 13. Add a mutation `resetAuto` that takes `{ id: Id<"expenses"> }`. Fetch the expense by ID. If `original_amount` exists, set `amount` back to `original_amount`, set `is_auto` to `true`, clear `original_amount`, and update `updated_at`. If no `original_amount`, throw an error: "This expense has no original value to reset to."

- [ ] 14. Create a Convex action `populateAutoExpenses` in `packages/convex/api/routes/expenses.ts` (or a separate file `packages/convex/api/actions/populate-expenses.ts`). This action takes `{ user_session_id: string, gross_salary: number, company_zone: string, residential_zone: string }`. It calls the tax calculator functions to compute PAYE, NSSF, SHIF, Housing Levy. It uses zone data to estimate rent, food, and transport costs. It then calls the `expenses.create` mutation (or an internal mutation) for each auto expense with `is_auto: true`.

- [ ] 15. Write integration tests in `packages/convex/api/routes/expenses.test.ts`. Test: `listBySession` returns only expenses for the correct session; `create` inserts a new expense; `update` modifies fields; `update` on auto expense stores `original_amount` and flips `is_auto`; `remove` deletes custom expense; `remove` throws on auto expense; `resetAuto` restores original amount.

## Phase 4: Dashboard UI Components

- [ ] 16. Create `packages/web/src/components/dashboard/summary-card.tsx`. Props: `title: string`, `amount: number`, `variant: "default" | "destructive" | "success"`. Render a shadcn `Card` with `CardHeader` containing the title and `CardContent` containing the amount formatted as "KES XX,XXX" using `Intl.NumberFormat("en-KE")`. Apply variant-based text color (green for take-home, red for deductions).

- [ ] 17. Create `packages/web/src/components/dashboard/summary-cards-row.tsx`. Accept props: `grossSalary: number`, `totalDeductions: number`, `totalExpenses: number`, `netTakeHome: number`. Render four `SummaryCard` components in a responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.

- [ ] 18. Create `packages/web/src/components/dashboard/category-badge.tsx`. Props: `category: "tax" | "rent" | "food" | "transport" | "custom"`. Render a shadcn `Badge` with color mapping: tax=red/destructive, rent=blue/default, food=amber/secondary, transport=green/outline, custom=purple/secondary. Display the category name capitalized.

- [ ] 19. Create `packages/web/src/components/dashboard/source-badge.tsx`. Props: `isAuto: boolean`. Render a small shadcn `Badge`: if auto, show "Auto" in a muted style; if manual, show "Manual" in a secondary style.

- [ ] 20. Create `packages/web/src/components/dashboard/expense-chart.tsx`. Accept an array of expenses as props. Aggregate amounts by category. Render a Recharts `PieChart` with a `Pie` component (donut style: `innerRadius={60} outerRadius={90}`). Use the shadcn chart wrapper (`ChartContainer`, `ChartTooltip`). Each slice uses the category color. Add a toggle button to switch to a `BarChart` view. Below the chart, show a simple legend with category names and their totals.

- [ ] 21. Create `packages/web/src/components/dashboard/expense-form.tsx`. Props: `onSubmit: (data) => void`, `defaultValues?: Partial<ExpenseFormData>`, `isEdit?: boolean`. Use `react-hook-form` with `zodResolver` and the `createExpenseSchema`. Fields: name (`Input`), category (`Select` with options: tax, rent, food, transport, custom), amount (`Input` type number with KES prefix). Submit button text: "Add Expense" or "Save Changes" based on `isEdit`.

- [ ] 22. Create `packages/web/src/components/dashboard/expense-dialog.tsx`. Props: `trigger: ReactNode`, `title: string`, `expense?: ExpenseData` (for edit mode), `onSave: (data) => void`. Render a shadcn `Dialog` containing `DialogHeader` with the title and `ExpenseForm` in the content. On form submit, call `onSave` and close the dialog.

- [ ] 23. Create `packages/web/src/components/dashboard/expense-table.tsx`. Accept an array of expenses as props. Render a shadcn `Table` with columns: Name, Category (using `CategoryBadge`), Amount (formatted KES), Source (using `SourceBadge`), Actions. The Actions column has: an edit button (opens `ExpenseDialog` in edit mode), a delete button (only for custom expenses, with a confirmation), and a reset button (only for overridden auto expenses). On mobile (below 768px), render expense items as stacked cards instead of table rows.

- [ ] 24. Create `packages/web/src/components/dashboard/quick-add-chips.tsx`. Import `EXPENSE_SUGGESTIONS` from shared constants. Render a row of clickable chip buttons (shadcn `Button` variant="outline" size="sm"). Clicking a chip opens the `ExpenseDialog` pre-filled with the suggestion's name, "custom" category, and the `suggestedDefault` amount. Chips that already exist as expenses in the current list should be visually dimmed or hidden.

- [ ] 25. Write unit tests for `summary-card.tsx`: renders title and formatted amount; applies correct variant styles. Write tests for `category-badge.tsx`: renders correct color per category. Write tests for `source-badge.tsx`: shows "Auto" or "Manual" based on prop.

- [ ] 26. Write unit tests for `expense-table.tsx`: renders all expense rows; shows edit button for all expenses; shows delete button only for custom expenses; hides delete for auto expenses; shows reset button for overridden auto expenses (where `original_amount` exists).

- [ ] 27. Write unit tests for `expense-dialog.tsx` and `expense-form.tsx`: dialog opens on trigger click; form validates required fields; submitting valid data calls `onSave`; cancel closes dialog without calling `onSave`; edit mode pre-fills the form with existing expense data.

- [ ] 28. Write unit tests for `expense-chart.tsx`: renders donut chart by default; aggregates expenses by category correctly; toggle switches to bar chart; handles empty expense array without crashing.

- [ ] 29. Write unit tests for `quick-add-chips.tsx`: renders all suggestion chips; clicking a chip triggers the add dialog with pre-filled values; already-added suggestions are visually distinguished.

## Phase 5: Dashboard Page and Routing

- [ ] 30. Create the dashboard route file `packages/web/src/routes/dashboard.$sessionId.tsx` using TanStack Router. The route loader fetches the session ID from params. The component subscribes to `expenses.listBySession` and `expenses.getSummary` using Convex `useQuery`. Render a loading skeleton while data is fetching.

- [ ] 31. In the dashboard route component, compose the full page layout: `SummaryCardsRow` at the top (passing summary data), `ExpenseChart` and `ExpenseTable` in a responsive two-column layout on desktop (chart left, table right) or stacked on mobile (chart above table), `QuickAddChips` between the chart and table sections. Wire up all CRUD handlers: add calls `expenses.create` mutation, edit calls `expenses.update`, delete calls `expenses.remove`, reset calls `expenses.resetAuto`.

- [ ] 32. Add a KES currency formatting utility in `packages/shared/utils/format-currency.ts`: `formatKES(amount: number): string` that returns "KES XX,XXX" using `Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0, maximumFractionDigits: 0 })`. Use this everywhere amounts are displayed.

- [ ] 33. Edit the router configuration (or `__root.tsx`) to register the `/dashboard/:sessionId` route. Add a navigation from the submission form success handler to redirect to `/dashboard/${newSessionId}`.

- [ ] 34. Add loading and empty states to the dashboard: show `Skeleton` components (shadcn) while expenses are loading; show a friendly empty state message if no expenses exist yet ("Your expenses are being calculated...") with a spinner.

## Phase 6: Polish and Responsiveness

- [ ] 35. Add a `useMediaQuery` hook or use Tailwind responsive classes to switch the expense table to a card-based layout on mobile (<768px). Each expense card shows name, category badge, amount, source badge, and an actions dropdown menu (`DropdownMenu` from shadcn).

- [ ] 36. Add hover tooltips (shadcn `Tooltip`) on auto-calculated expense amounts explaining how the value was derived, e.g., "PAYE calculated using KRA 2024/2025 brackets on taxable income of KES XX,XXX" or "Rent estimated for [Zone] zone in [Area]."

- [ ] 37. Add a "Back to Form" link/button in the dashboard header that navigates back to the input form route. If the user returns and resubmits, the expenses should be recalculated for the new session.

- [ ] 38. Add a disclaimer banner at the bottom of the dashboard: "These figures are estimates based on current KRA tax rates and average living costs in Nairobi. Actual amounts may vary. Last updated: [date]."

## Phase 7: E2E Tests

- [ ] 39. Write Playwright E2E test `e2e/expenses-dashboard.spec.ts` -- happy path: fill out the salary form with valid Nairobi data (e.g., KES 80,000 salary, Westlands company location, Kilimani residential area), submit, verify redirect to dashboard, verify all four summary cards are visible with non-zero values, verify auto expenses (PAYE, NSSF, SHIF, Housing Levy, Rent, Food, Transport) appear in the table.

- [ ] 40. E2E test -- add custom expense: on the dashboard, click "Add Expense", fill in name "Gym", category "custom", amount 3000, submit. Verify the new row appears in the table. Verify the summary cards update (total expenses increases, net take-home decreases).

- [ ] 41. E2E test -- edit expense: click edit on the Rent expense, change amount from the auto value to KES 20,000, save. Verify the amount updates in the table, the source badge changes from "Auto" to "Manual", and summary cards reflect the change.

- [ ] 42. E2E test -- delete custom expense: add a custom expense, then click delete on it, confirm deletion. Verify the row is removed from the table and summary cards update accordingly.

- [ ] 43. E2E test -- reset overridden expense: after editing an auto expense (from task 41), click the reset button. Verify the amount reverts to the original auto-calculated value and the source badge changes back to "Auto".
