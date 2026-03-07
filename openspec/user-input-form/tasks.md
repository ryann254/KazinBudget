# User Input Form - Tasks

Numbered implementation tasks for the user input form feature. Each task is a single, focused unit of work.

---

## Phase 1: Shared Constants and Schema

- [x] **1. Create Nairobi areas constant file**
  Create `packages/shared/constants/nairobi-areas.ts`. Define and export a `NAIROBI_AREAS` array of objects with `{ value: string; label: string }` shape. Include at least 50 neighborhoods: Westlands, Kilimani, CBD, Karen, Lang'ata, Lavington, Kileleshwa, South B, South C, Eastleigh, Kasarani, Roysambu, Ruaka, Juja, Thika Road, Parklands, Ngong Road, Upper Hill, Hurlingham, Ngara, Pangani, Embakasi, Donholm, Umoja, Pipeline, Rongai, Kitengela, Syokimau, Mlolongo, Athi River, Kahawa, Githurai, Zimmerman, Kahawa West, Garden Estate, Muthaiga, Runda, Gigiri, Spring Valley, Loresho, Mountain View, Waiyaki Way, Dagoretti, Kibera, Kawangware, Satellite, Utawala, Ruai, Njiru, Kangundo Road. Sort alphabetically by label.

- [x] **2. Create Zod submission schema**
  Create `packages/shared/schemas/submission.ts`. Define and export `submissionSchema` using Zod with six fields: `name` (string, min 2, max 100), `companyName` (string, min 1, max 200), `companyLocation` (string, min 1), `residentialArea` (string, min 1), `yearsOfExperience` (number, int, min 0, max 50), `monthlyGrossSalary` (number, positive, max 100000000). Also export the inferred type as `SubmissionFormData`.

- [x] **3. Write unit tests for the Zod schema**
  Create `packages/shared/schemas/submission.test.ts`. Test cases: valid input passes; empty name fails; name under 2 chars fails; empty company name fails; negative years of experience fails; decimal years of experience fails; zero salary fails; negative salary fails; salary above max fails; missing fields fail; boundary values (0 years, 50 years) pass.

- [x] **4. Run schema tests and confirm they pass**
  Execute `pnpm test:unit -- packages/shared/schemas/submission.test.ts` and verify all tests are green.

---

## Phase 2: Convex Backend

- [x] **5. Add submissions table to Convex schema**
  Edit `packages/convex/schema.ts`. Add a `submissions` table with fields: `name` (string), `company_name` (string), `company_location` (string), `residential_area` (string), `years_of_experience` (number), `monthly_gross_salary` (number), `status` (string, one of "pending", "calculated", "error"), `created_at` (number, timestamp), `updated_at` (number, timestamp). Add an index on `status`.

- [x] **6. Create the submissions mutation**
  Create `packages/convex/api/routes/submissions.ts`. Export a named Convex mutation `create` that accepts the six form fields as arguments, validates them, writes a new row to the `submissions` table with `status: "pending"` and `created_at` / `updated_at` set to `Date.now()`, and returns the new document ID.

- [ ] **7. Push Convex schema and verify deployment**
  Run `npx convex dev` and confirm the `submissions` table is created without errors.

---

## Phase 3: Combobox Component

- [ ] **8. Install shadcn Command and Popover components**
  Run `npx shadcn@latest add command popover` inside `packages/web` to scaffold the base components if not already present.

- [ ] **9. Create the reusable Combobox component**
  Create `packages/web/src/components/ui/combobox.tsx`. Build it from shadcn `Popover` + `PopoverTrigger` + `PopoverContent` + `Command` + `CommandInput` + `CommandList` + `CommandEmpty` + `CommandGroup` + `CommandItem`. Props: `options: { value: string; label: string }[]`, `value: string`, `onValueChange: (value: string) => void`, `placeholder: string`, `searchPlaceholder: string`, `emptyMessage: string`. Use named export only. Component should be keyboard-accessible and filter options as the user types.

- [ ] **10. Write unit tests for the Combobox**
  Create `packages/web/src/components/ui/combobox.test.tsx`. Test cases: renders with placeholder text; opens popover on trigger click; filters options when typing in search; selects an option and calls `onValueChange`; displays `emptyMessage` when no options match; closes popover after selection.

- [ ] **11. Run Combobox tests and confirm they pass**
  Execute `pnpm test:unit -- packages/web/src/components/ui/combobox.test.tsx`.

---

## Phase 4: Submission Form Component

- [ ] **12. Install react-hook-form and Zod resolver**
  Run `pnpm add react-hook-form @hookform/resolvers` inside `packages/web` if not already installed.

- [ ] **13. Install shadcn Form, Input, and Button components**
  Run `npx shadcn@latest add form input button` inside `packages/web` if not already present.

- [x] **14. Create the SubmissionForm component**
  Create `packages/web/src/components/submission-form.tsx`. Use `useForm` from react-hook-form with `zodResolver(submissionSchema)`. Render six fields using shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`:
    - **Name**: `Input` type text, placeholder "e.g., Jane Wanjiku"
    - **Company Name**: `Input` type text, placeholder "e.g., Safaricom"
    - **Company Location**: `Combobox` with `NAIROBI_AREAS` as options, placeholder "Select company area"
    - **Residential Area**: `Combobox` with `NAIROBI_AREAS` as options, placeholder "Select where you live"
    - **Years of Experience**: `Input` type number, placeholder "e.g., 3", min 0
    - **Monthly Gross Salary**: `Input` type number, placeholder "e.g., 80000", with "KES" prefix label

  Add a submit button labeled "Calculate My Take-Home Salary". On submit, call the Convex `submissions.create` mutation via `useMutation`, then navigate to the dashboard route using TanStack Router's `useNavigate`.

- [ ] **15. Add non-Nairobi area handling**
  In `submission-form.tsx`, add logic: if `companyLocation` is set but its value is not found in `NAIROBI_AREAS`, show an inline alert/banner below the company location field: "This feature is coming soon to your area. Currently we only support locations within Nairobi." Disable the submit button when this condition is true. (Note: since the Combobox only offers Nairobi options this is a defensive measure for future extensibility.)

- [ ] **16. Make the form layout responsive**
  Use Tailwind grid classes: single column (`grid-cols-1`) on mobile, two columns (`md:grid-cols-2`) for the location pair and the numeric pair. Name and company name span full width. Submit button spans full width. Add appropriate vertical spacing (`gap-6`) and section padding.

- [ ] **17. Write unit tests for SubmissionForm**
  Create `packages/web/src/components/submission-form.test.tsx`. Test cases: renders all six fields with correct labels; submit button is present and initially enabled; submitting empty form shows validation error messages for all required fields; filling all fields with valid data and submitting calls the Convex mutation with correct arguments; years of experience rejects negative numbers; salary rejects zero; Combobox fields show Nairobi areas.

- [ ] **18. Run SubmissionForm tests and confirm they pass**
  Execute `pnpm test:unit -- packages/web/src/components/submission-form.test.tsx`.

---

## Phase 5: Route Integration

- [ ] **19. Create the form route**
  Create or edit `packages/web/src/routes/index.tsx` (the root/home route). Import and render the `SubmissionForm` component. Add a page title "Calculate Your Take-Home Salary" and a brief subtitle explaining the app's purpose. Use TanStack Router's `createFileRoute` or `createLazyFileRoute` pattern consistent with the project's routing approach.

- [ ] **20. Verify route renders in the browser**
  Start the dev server (`pnpm run dev`), navigate to `http://localhost:5173/`, and confirm the form is visible and functional.

---

## Phase 6: E2E Tests

- [ ] **21. Write E2E test for the submission form**
  Create `e2e/submission-form.spec.ts`. Test cases:
    - **Happy path**: Navigate to `/`, fill all six fields with valid data (use "Westlands" for company location, "Kilimani" for residential area), click submit, verify navigation to the dashboard/results page.
    - **Validation errors**: Click submit without filling any field, verify at least one error message is visible.
    - **Combobox interaction**: Click the company location combobox, type "West", verify "Westlands" appears in the dropdown, click it, verify the field value updates.

- [ ] **22. Run E2E tests and confirm they pass**
  Execute `pnpm test:e2e -- e2e/submission-form.spec.ts`.

---

## Phase 7: Polish and Review

- [ ] **23. Add loading state to submit button**
  While the Convex mutation is in flight, show a spinner/loading indicator on the submit button and disable it to prevent double submission.

- [x] **24. Add currency formatting helper**
  Create `packages/shared/utils/format-currency.ts`. Export a `formatKES` function that formats a number as Kenyan Shilling (e.g., `80000` -> `KES 80,000`). Use this in the salary input's display where appropriate.

- [ ] **25. Accessibility audit**
  Verify all form fields have associated labels (via `FormLabel`). Verify the Combobox is keyboard-navigable (arrow keys, Enter to select, Escape to close). Verify form error messages are linked to fields via `aria-describedby`. Verify focus management after submission error.

- [ ] **26. Run full pre-commit checks**
  Execute the full verification suite: `pnpm format && pnpm lint && pnpm typecheck && pnpm circular && pnpm deadcode && pnpm build && pnpm test:unit && pnpm test:e2e`. Fix any issues found.

- [ ] **27. Commit the feature**
  Stage all new and edited files. Commit with message: `feat(web): add user input form for salary calculation`.
