# Nairobi Geo-Fence

## Summary

Restrict the WorkPlace Budgeting app to Nairobi and the greater Nairobi metro area only. When a user enters a location outside the supported area (e.g., Mombasa, Kisumu, Nakuru), the app displays a friendly "Feature coming soon to your area" message instead of proceeding. This is the foundational gating feature that all other location-dependent features (rent estimation, food costs, travel costs) depend on.

## Approach

### Core Data Structure

Maintain a curated TypeScript `const` map of valid Nairobi neighborhoods and satellite towns, categorized into pricing zones. The zone classification is critical because downstream features (rent estimation, food cost lookup) need to know the economic tier of a location.

```
zones/
  PREMIUM  -> high-cost areas (Westlands, Kilimani, Karen, etc.)
  MIDDLE   -> mid-cost areas (South B, Langata, Embakasi, etc.)
  BUDGET   -> lower-cost areas (Umoja, Pipeline, Githurai, etc.)
  SATELLITE -> satellite towns within commuting distance (Juja, Thika, Ruiru, etc.)
```

### Nairobi Zones (50+ areas)

**Premium Zone:**
Westlands, Kilimani, Kileleshwa, Lavington, Parklands, Runda, Karen, Muthaiga, Spring Valley, Loresho

**Middle Zone:**
South B, South C, Langata, Embakasi, Donholm, Buruburu, Roysambu, Kasarani, Dagoretti, Imara Daima, Komarock

**Budget Zone:**
Kahawa West, Githurai, Zimmerman, Umoja, Pipeline, Utawala, Syokimau, Lucky Summer

**Satellite Zone:**
Juja, Thika, Ruiru, Kiambu, Ruaka, Ngong, Rongai, Kitengela, Athi River, Kikuyu, Limuru, Kangundo Road, Mlolongo

### Fuzzy Matching with Fuse.js

Users will not always type area names exactly. Common issues include:
- Misspellings: "Westland" instead of "Westlands", "Kilimni" instead of "Kilimani"
- Partial matches: "South" should suggest "South B" and "South C"
- Case variations: "JUJA", "juja", "Juja"

**Fuse.js** is the right tool for this:
- Lightweight (~5KB gzipped), no server round-trips needed
- Configurable fuzzy threshold (we want a threshold around 0.3-0.4 for reasonable tolerance)
- Returns scored results so we can show ranked suggestions in an autocomplete dropdown
- Works entirely client-side, keeping the UX snappy

### Validation Flow

1. User types into a location input field (company location or home location)
2. On each keystroke (debounced ~300ms), Fuse.js searches the curated area list
3. Matching areas appear in an autocomplete/combobox dropdown (using shadcn/ui Combobox)
4. User selects an area from the dropdown, or types a free-text value
5. On form submission, Zod validates the location against the allowed areas list
6. If the location is not in the allowed list:
   - Block form submission
   - Show a friendly inline message: "We're not in [location] yet, but we're expanding soon! For now, we support Nairobi and surrounding areas."
7. If the location is valid, the zone classification is attached to the form data for downstream use

### "Coming Soon" UX

When a user enters an unsupported location:
- Do NOT use a harsh error. Use a warm, encouraging tone.
- Show a card/banner with an illustration (map pin with a clock icon)
- Message: "We're expanding to [location] soon! For now, WorkPlace Budgeting covers Nairobi and the greater metro area."
- Optionally: collect their email to notify them when their area is supported (future feature)

## Technology

| Tool | Purpose | Justification |
|------|---------|---------------|
| **Fuse.js** | Fuzzy string matching | Lightweight, client-side, configurable threshold, well-maintained |
| **TypeScript const maps** | Area data store | Type-safe, tree-shakeable, zero runtime cost, `as const` for literal types |
| **Zod** | Form-level validation | Already in stack, `.refine()` for custom location validation |
| **shadcn/ui Combobox** | Autocomplete dropdown | Already in stack, accessible, keyboard-navigable |
| **TanStack Router** | Route-level guards (optional) | Already in stack, can gate routes if location not set |

### Why NOT a geocoding API?

- Adds network latency and an external dependency for a simple known-list lookup
- Google Maps / Mapbox geocoding APIs cost money at scale
- Our area list is finite and curated; fuzzy matching is sufficient
- We can always layer on geocoding later if we expand beyond Nairobi

## Files to Create / Edit

### New Files

| File | Purpose |
|------|---------|
| `packages/shared/src/geo/nairobi-areas.ts` | Curated const map of all Nairobi areas with zone classifications |
| `packages/shared/src/geo/types.ts` | TypeScript types: `NairobiZone`, `NairobiArea`, `AreaLookupResult` |
| `packages/shared/src/geo/area-matcher.ts` | Fuse.js-powered fuzzy matching logic, `matchArea()` and `isValidArea()` functions |
| `packages/shared/src/geo/validation.ts` | Zod schemas for location validation: `locationSchema`, `companyLocationSchema`, `homeLocationSchema` |
| `packages/web/src/components/location-combobox.tsx` | shadcn/ui Combobox wired to Fuse.js for area autocomplete |
| `packages/web/src/components/coming-soon-banner.tsx` | Friendly "coming soon" message component |
| `packages/shared/src/geo/__tests__/area-matcher.test.ts` | Unit tests for fuzzy matching |
| `packages/shared/src/geo/__tests__/validation.test.ts` | Unit tests for Zod validation schemas |
| `packages/web/src/components/__tests__/location-combobox.test.tsx` | Component tests for the combobox |

### Files to Edit

| File | Change |
|------|--------|
| `packages/web/src/components/` (salary form) | Integrate `LocationCombobox` into the salary input form for both company location and home location fields |
| `packages/shared/package.json` | Add `fuse.js` dependency |

## Tests

### Unit Tests (`packages/shared/src/geo/__tests__/area-matcher.test.ts`)

- **Exact match**: `matchArea("Westlands")` returns `{ area: "Westlands", zone: "PREMIUM", score: 1.0 }`
- **Fuzzy match**: `matchArea("Westland")` returns Westlands with high confidence
- **Fuzzy match**: `matchArea("Kilimni")` returns Kilimani
- **Case insensitive**: `matchArea("juja")` returns Juja
- **Partial match**: `matchArea("South")` returns South B and South C
- **No match**: `matchArea("Mombasa")` returns empty results
- **No match**: `matchArea("Kisumu")` returns empty results
- **Edge cases**: Empty string, whitespace-only input, very long strings, special characters
- **Zone classification**: Every area in the map has a valid zone assigned
- **Completeness**: All 50+ areas are present in the data

### Validation Tests (`packages/shared/src/geo/__tests__/validation.test.ts`)

- Valid location passes Zod schema
- Invalid location (outside Nairobi) fails Zod schema with correct error message
- Empty location fails schema
- Schema returns zone information on success

### Component Tests (`packages/web/src/components/__tests__/location-combobox.test.tsx`)

- Renders input field
- Shows dropdown on typing
- Filters results as user types
- Selecting an area populates the input
- Shows "coming soon" message for unrecognized locations
- Keyboard navigation works (arrow keys, enter, escape)

## Risks and Trade-offs

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing areas from the curated list | Medium | Users in valid Nairobi areas get blocked | Start with 50+ areas, add a feedback mechanism ("Can't find your area?"), review and expand the list based on user reports |
| Fuzzy matching false positives | Low | User selects wrong area, gets wrong cost estimates | Tune Fuse.js threshold conservatively (0.3), always show dropdown for user to confirm |
| Fuzzy matching false negatives | Medium | Valid area not matched due to unusual spelling | Keep threshold at 0.3-0.4, add common aliases (e.g., "TRM" for Thika Road Mall area) |
| New areas/developments not in list | Low | Newer estates like Tatu City excluded | Periodic review, easy to add entries to the const map |

### Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Client-side fuzzy matching vs. geocoding API | Faster and free, but less accurate for edge cases and boundary areas. Acceptable for V1 with a known list. |
| Hardcoded area list vs. database-driven | Simpler deployment and zero latency, but requires a code change to add new areas. Acceptable while Nairobi-only. |
| Zone-based classification vs. granular coordinates | Coarser cost estimation, but much simpler to maintain and sufficient for V1 salary estimation. |
| Blocking form submission vs. allowing with warning | Stricter UX, but prevents garbage data from entering the system and producing meaningless estimates. |
| Fuse.js vs. custom Levenshtein implementation | Adds a dependency (~5KB), but well-tested, configurable, and saves development time. |
