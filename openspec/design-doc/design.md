# Design 5 — Editorial Brutalist

The active design for Kazi&Budget. A fusion of neo-brutalist rawness, Bauhaus color discipline, and editorial/newspaper typography.

## Design Origins

Design 5 started as a pure **Neo-Brutalist** design with 5 bright colors (yellow, pink, sky, lime, orange), Archivo Black font, and maximum visual chaos.

It was then refined by combining three influences:

1. **Design 5 (Neo-Brutalist base)** — thick borders, offset shadows, tilted stamps, bold type, hover interactions
2. **Design 1 (Bauhaus Blueprint)** — professional color discipline with a reduced primary palette (red, blue, yellow, black, cream)
3. **T4 Canvas Gazette (external reference)** — editorial/newspaper aesthetic with serif headings, uppercase letter-spaced labels, clean card modules, em-dash section markers, generous whitespace

The result: **Editorial Brutalist** — bold and unapologetic, but with restraint and typographic clarity.

---

## Color Palette

| Token    | Hex       | Usage                                    |
|----------|-----------|------------------------------------------|
| black    | `#0D1B2A` | Borders, shadows, primary text, header bg |
| cream    | `#FEFAE0` | Page background                          |
| red      | `#E63946` | Accents, warnings, CTA buttons, stamps   |
| blue     | `#1D3557` | Info sections, card left-borders, tags   |
| yellow   | `#F4D35E` | Highlights, active states, nav indicator |
| white    | `#FFFFFF` | Card backgrounds                         |
| muted    | `#457B9D` | Secondary text, subdued labels           |
| teal     | `#2A9D8F` | Success states, take-home, positive data |

### Chart Colors (ordered)

`red, blue, yellow, muted, teal, #E76F51, #264653, #F4A261`

### Rules

- Maximum 3 accent colors in any single section
- Yellow on dark backgrounds for emphasis (header, NET AFTER TAX banners)
- White cards with a single colored left-border (4px) — inherited from Bauhaus
- Stamps cycle through red, blue, yellow, teal — never repeat adjacent

---

## Typography

**Single font family:** Work Sans (Google Fonts)

```
Weights imported: 300, 400, 500, 600, 700, 800, 900
```

| Role               | Weight | Size           | Letter-spacing | Transform  |
|--------------------|--------|----------------|----------------|------------|
| Display headings   | 900    | text-3xl/4xl   | normal         | none       |
| Section titles     | 900    | text-lg        | normal         | none       |
| Stamp labels       | 800    | text-xs        | 0.15em         | uppercase  |
| Tab buttons        | 800    | text-xs        | 0.15em         | uppercase  |
| Card labels        | 800    | text-xs        | 0.15em         | uppercase  |
| Body text          | 400-600| text-sm        | normal         | none       |
| Muted labels       | 700    | text-xs        | 0.05em         | uppercase  |
| Monetary values    | 900    | text-lg/2xl    | normal         | none       |

### Section Header Pattern (Editorial)

Em-dash prefix in muted color followed by bold title:

```
— Section Title
```

The em-dash uses: `color: muted, fontSize: 0.75rem, letterSpacing: 0.15em, fontWeight: 800`
The title uses: `fontWeight: 900, color: black`

---

## Brutalist Elements

### Card Style

```
Base:    border: 3px solid black | box-shadow: 4px 4px 0 black
Hover:   border: 3px solid black | box-shadow: 6px 6px 0 black | translate(-2px, -2px)
```

Transition: `all 0.15s ease`

### Card Variants

- **Left-border accent:** White card + 4px colored left border (Bauhaus influence)
- **Top-border accent:** White card + 3-4px colored top border
- **Stamp card:** Colored background + thick border + rotated position

### Stamp Labels

Absolute-positioned rotated badges on section cards:

```
Position:  absolute, -top-4, -left-2 (or right-4, left-8, right-8)
Border:    2px solid black
Font:      extrabold, text-xs, uppercase, letter-spacing 0.15em
Rotation:  varies (-3deg to +3deg)
Z-index:   10
```

Color assignments:
- PERSONAL INFO → yellow bg
- SALARY & TAX → red bg, white text
- COMMUTE → blue bg, white text
- MONTHLY EXPENSES → teal bg, white text

### Button Press Animation

```
Default:     box-shadow: 4px 4px 0 black
onMouseDown: box-shadow: 1px 1px 0 black + translate(3px, 3px)
onMouseUp:   restore default
```

### Milestone Cards (Growth tab)

- Slight rotation when idle (-1deg to +1.5deg)
- Straighten to 0deg + lift on hover
- White bg with colored top border
- Absolute-positioned label stamp rotated +3deg

---

## Layout

### Container

```
Max width:   max-w-4xl (896px)
Padding:     px-5 sm:px-6 lg:px-5
Vertical:    py-8 sm:py-10
```

### Spacing

- Between sections: `space-y-12`
- Card gaps: `gap-5` or `gap-6`
- Internal card padding: `p-4 sm:p-6` (charts/data) or `p-6 sm:p-8` (form sections)

### Grid Patterns

| Pattern               | Breakpoints                           |
|-----------------------|---------------------------------------|
| Summary cards         | 1-col → 2-col (sm) → 4-col (lg)      |
| Form fields           | 1-col → 2-col (md)                    |
| Travel modes          | 2-col → 4-col (md)                    |
| Milestone cards       | 1-col → 2-col (sm) → 4-col (lg)      |
| Market stats          | 2-col → 4-col (md)                    |
| Gap analysis          | 1-col → 3-col (md)                    |
| Assumptions           | 2-col → 4-col (sm)                    |
| Pie + Table           | 1-col → 2-col (lg)                    |

---

## Mobile Responsiveness

### Navbar Scroll Indicator

On screens < 768px (md), a yellow chevron button appears on the right edge with a gradient fade from transparent to cream. Disappears after user scrolls 20px. Hidden scrollbar via CSS.

### Responsive Patterns

- Cards: `p-4 sm:p-6` — tighter padding on mobile
- Summary cards stack single-column on phones
- Expense table: flex-wrap layout replaces HTML table
- Buttons: `w-full sm:w-auto` — full width on mobile
- Header brand: hidden on mobile (`hidden sm:block`)
- User badge: hidden below md (`hidden md:flex`)
- Footer: stacks vertically on mobile (`flex-col md:flex-row`)

### Chart Heights

- Area chart (growth): 280px
- Line chart (taxes vs take-home): 240px
- Pie chart: 280px
- Bell curve: 300px

---

## Component Structure

### Tabs

| Key        | Label     | Active Color | Text Color |
|------------|-----------|--------------|------------|
| input      | INPUT     | red          | white      |
| dashboard  | DASHBOARD | blue         | white      |
| growth     | GROWTH    | yellow       | black      |
| comparison | COMPARE   | teal         | white      |

### Input Tab Sections

1. Personal Info (yellow stamp, blue left-border)
2. Salary & Tax (red stamp, red left-border) — includes CALCULATE BUDGET button
3. Commute (blue stamp, yellow left-border)
4. Monthly Expenses (teal stamp, teal left-border)
5. Take-Home Summary (teal bg, tilted -0.5deg, full-width)

### Header

- Sticky, black bg, red bottom border (4px)
- Brand: "KAZI&BUDGET" — white with red "&BUDGET"
- GO BACK button: yellow border/text on black, offset shadow, press animation

### Footer

- Black bg, red top border (4px)
- "MADE IN NAIROBI" stamp: red bg, yellow offset shadow, rotated -3deg
- Label: "Design 5 — Editorial Brutalist"

---

## Key Design Principles

1. **Commit to boldness** — thick borders, strong shadows, no rounded corners
2. **Restrain color** — max 3 accents per section, cycle through palette
3. **Typography does the heavy lifting** — weight and spacing create hierarchy, not decoration
4. **Every element earns its place** — no gradients, no blur, no ornamentation for its own sake
5. **Interactive feedback** — shadows collapse on press, cards lift on hover, stamps straighten
6. **Editorial clarity** — em-dash markers, uppercase labels, generous whitespace
7. **Mobile-first** — stacked layouts, full-width buttons, hidden chrome on small screens
