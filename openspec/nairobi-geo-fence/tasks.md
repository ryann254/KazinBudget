# Nairobi Geo-Fence - Tasks

## Setup

- [x] 1. Install `fuse.js` as a dependency in `packages/shared`: `pnpm add fuse.js --filter shared`

## Data Layer (packages/shared/src/geo/)

- [x] 2. Create `packages/shared/src/geo/types.ts` with the following types:
  - `NairobiZone` union type: `"PREMIUM" | "MIDDLE" | "BUDGET" | "SATELLITE"`
  - `NairobiArea` type with fields: `name: string`, `zone: NairobiZone`, `aliases: string[]` (optional common aliases like "TRM" for Thika Road Mall area)
  - `AreaLookupResult` type with fields: `area: NairobiArea`, `score: number`

- [x] 3. Create `packages/shared/src/geo/nairobi-areas.ts` with a `const` array (using `as const` where appropriate) of all Nairobi areas organized by zone:
  - **Premium (10):** Westlands, Kilimani, Kileleshwa, Lavington, Parklands, Runda, Karen, Muthaiga, Spring Valley, Loresho
  - **Middle (11):** South B, South C, Langata, Embakasi, Donholm, Buruburu, Roysambu, Kasarani, Dagoretti, Imara Daima, Komarock
  - **Budget (8):** Kahawa West, Githurai, Zimmerman, Umoja, Pipeline, Utawala, Syokimau, Lucky Summer
  - **Satellite (13):** Juja, Thika, Ruiru, Kiambu, Ruaka, Ngong, Rongai, Kitengela, Athi River, Kikuyu, Limuru, Kangundo Road, Mlolongo
  - Add common aliases for areas where applicable (e.g., "CBD" for "Nairobi CBD", "TRM" for the Thika Road Mall area near Roysambu)
  - Export a flat array `NAIROBI_AREAS` and a lookup map `NAIROBI_AREA_MAP` keyed by lowercase area name

- [x] 4. Create `packages/shared/src/geo/area-matcher.ts`:
  - Initialize a Fuse.js instance with the `NAIROBI_AREAS` array, searching on `name` and `aliases` fields
  - Set Fuse.js options: `threshold: 0.3`, `distance: 100`, `keys: ["name", "aliases"]`
  - Export `searchAreas(query: string): AreaLookupResult[]` that returns top 5 fuzzy matches with scores
  - Export `findBestMatch(query: string): AreaLookupResult | null` that returns the single best match above a confidence threshold
  - Export `isValidArea(query: string): boolean` that returns true if the query matches any area with high confidence (score < 0.2)
  - Handle edge cases: empty string returns empty array, whitespace is trimmed, input is lowercased

- [x] 5. Create `packages/shared/src/geo/validation.ts`:
  - Define `locationSchema` using Zod: `z.string().min(1, "Location is required").refine(...)` that validates input against `isValidArea()`
  - The refine error message should be: "We're not in this area yet. Please select a supported Nairobi location."
  - Define `resolvedLocationSchema` that transforms a valid string input into an object with `{ name, zone }` using `findBestMatch()`
  - Export both schemas

## UI Components (packages/web/src/components/)

- [x] 6. Create `packages/web/src/components/location-combobox.tsx`:
  - Use shadcn/ui `Command` (cmdk) component as the base for autocomplete
  - Accept props: `value: string`, `onChange: (value: string, zone: NairobiZone) => void`, `placeholder: string`, `label: string`
  - On input change (debounced 300ms), call `searchAreas()` and display results in the dropdown
  - Each dropdown item should show the area name and its zone as a subtle badge (e.g., "Westlands" with a small "Premium" tag)
  - When user selects an area, call `onChange` with the area name and zone
  - If user types something with no matches, show inline text: "No matching areas found"
  - Use named export only (no default export per project conventions)

- [x] 7. Create `packages/web/src/components/coming-soon-banner.tsx`:
  - Accept props: `location: string` (the unsupported location the user typed)
  - Render a styled card/banner with:
    - A map pin icon (use Lucide `MapPinOff` or similar from the icon set already in shadcn)
    - Heading: "Coming Soon!"
    - Body: "We're expanding to {location} soon! For now, WorkPlace Budgeting covers Nairobi and the greater metro area."
    - A subtle list of supported areas or a "View supported areas" expandable section
  - Use Tailwind classes for styling, keep it warm and encouraging (not an error state)
  - Use named export only

## Form Integration

- [ ] 8. Integrate `LocationCombobox` into the salary input form:
  - Replace the plain text input for "Company Location" with `LocationCombobox`
  - Replace the plain text input for "Where They Live" with `LocationCombobox`
  - Wire the combobox `onChange` to the form state (React Hook Form or whatever form library is in use)
  - Store both the area name and the zone in form state for downstream features

- [ ] 9. Add form-level validation using the Zod `locationSchema`:
  - Both company location and home location fields must pass `locationSchema`
  - On validation failure, show the `ComingSoonBanner` component below the respective input field
  - Block form submission until both locations are valid Nairobi areas

## Tests

- [x] 10. Create `packages/shared/src/geo/__tests__/area-matcher.test.ts`:
  - Test exact match: "Westlands" returns Westlands with PREMIUM zone
  - Test fuzzy match: "Westland" (missing 's') returns Westlands
  - Test fuzzy match: "Kilimni" (typo) returns Kilimani
  - Test case insensitive: "juja" returns Juja with SATELLITE zone
  - Test partial: "South" returns both South B and South C
  - Test no match: "Mombasa" returns empty results
  - Test no match: "Kisumu" returns empty results
  - Test empty string returns empty array
  - Test whitespace-only input returns empty array
  - Test alias matching: "CBD" returns Nairobi CBD (if alias is configured)
  - Test `isValidArea()` returns true for exact known area
  - Test `isValidArea()` returns false for unknown city

- [x] 11. Create `packages/shared/src/geo/__tests__/validation.test.ts`:
  - Test valid location passes `locationSchema`
  - Test invalid location ("Mombasa") fails with correct error message
  - Test empty string fails with "Location is required"
  - Test `resolvedLocationSchema` transforms "Westlands" into `{ name: "Westlands", zone: "PREMIUM" }`
  - Test `resolvedLocationSchema` rejects "Nakuru"

- [ ] 12. Create `packages/web/src/components/__tests__/location-combobox.test.tsx`:
  - Test renders the combobox input
  - Test typing "West" shows "Westlands" in dropdown
  - Test selecting an area calls `onChange` with correct name and zone
  - Test typing "Mombasa" shows "No matching areas found"
  - Test keyboard navigation: arrow down selects first item, enter confirms

- [ ] 13. Create `packages/web/src/components/__tests__/coming-soon-banner.test.tsx`:
  - Test renders the banner with the provided location name
  - Test displays the correct "coming soon" message text
  - Test renders the map pin icon

## Final Verification

- [ ] 14. Run all unit tests: `pnpm test:unit` and confirm all geo-fence tests pass
- [ ] 15. Run type checking: `pnpm typecheck` and confirm no TypeScript errors in new files
- [ ] 16. Run linting: `pnpm lint` and confirm no lint errors in new files
- [ ] 17. Manual QA: type "Westlands" in the location field and confirm it resolves; type "Mombasa" and confirm the coming-soon banner appears
