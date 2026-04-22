// Dashboard timeline at 30 fps.
// Total: 1515 frames / 30 = 50.5s.

export const FPS = 30;

export const SCENES = {
  calcIntro: { start: 0, duration: 90 }, // 0 – 3s click Calculate → flash
  cards: { start: 90, duration: 480 }, // 3 – 19s (arrive + cycle 4 cards + savings)
  pie: { start: 570, duration: 495 }, // 19 – 35.5s (arrive + cycle 5 items)
  rent: { start: 1065, duration: 240 }, // 35.5 – 43.5s
  food: { start: 1305, duration: 210 }, // 43.5 – 50.5s
} as const;

export const TOTAL_FRAMES = 1515;

// ── Layout heights ─────────────────────────────────────────
export const LAYOUT = {
  PAGE_WIDTH: 1920,
  CONTENT_WIDTH: 1400,
  HEADER_HEIGHT: 70,
  SECTION_GAP: 60,
  CARDS_HEIGHT: 320, // 4 summary cards + savings rate stamp room
  SAVINGS_HEIGHT: 260,
  PIE_BREAKDOWN_HEIGHT: 780, // pie + breakdown side-by-side
  RENT_HEIGHT: 540,
  FOOD_HEIGHT: 620,
  PAGE_PADDING_TOP: 32,
  PAGE_PADDING_BOTTOM: 48,
} as const;

export const VIEWPORT_HEIGHT = 1080;

const headerY = LAYOUT.PAGE_PADDING_TOP;
const cardsY = headerY + LAYOUT.HEADER_HEIGHT + LAYOUT.SECTION_GAP;
const savingsY = cardsY + LAYOUT.CARDS_HEIGHT + LAYOUT.SECTION_GAP;
const pieY = savingsY + LAYOUT.SAVINGS_HEIGHT + LAYOUT.SECTION_GAP;
const rentY = pieY + LAYOUT.PIE_BREAKDOWN_HEIGHT + LAYOUT.SECTION_GAP;
const foodY = rentY + LAYOUT.RENT_HEIGHT + LAYOUT.SECTION_GAP;

export const SECTION_Y = {
  header: headerY,
  cards: cardsY,
  savings: savingsY,
  pie: pieY,
  rent: rentY,
  food: foodY,
} as const;

export const PAGE_HEIGHT =
  foodY + LAYOUT.FOOD_HEIGHT + LAYOUT.PAGE_PADDING_BOTTOM;

const centerOf = (y: number, h: number) => y + h / 2;
const clampScroll = (c: number) =>
  Math.max(0, Math.min(PAGE_HEIGHT - VIEWPORT_HEIGHT, c - VIEWPORT_HEIGHT / 2));

export const CAMERA_Y = {
  cards: clampScroll(centerOf(cardsY, LAYOUT.CARDS_HEIGHT + 40)),
  savings: clampScroll(centerOf(savingsY, LAYOUT.SAVINGS_HEIGHT)),
  pie: clampScroll(centerOf(pieY, LAYOUT.PIE_BREAKDOWN_HEIGHT)),
  rent: clampScroll(centerOf(rentY, LAYOUT.RENT_HEIGHT)),
  food: clampScroll(centerOf(foodY, LAYOUT.FOOD_HEIGHT)),
} as const;

// ── Summary values ─────────────────────────────────────────
export const GROSS = 120_000;
export const DEDUCTIONS = 34_977.45; // PAYE + NSSF + SHIF + HOUSING
export const EXPENSES_TOTAL = 52_000; // seeded 37,300 + matatu 11,200 + gym 3,500
export const TAKE_HOME = 33_022.55;
export const SAVINGS_RATE = (TAKE_HOME / GROSS) * 100;

// ── Pie chart + breakdown items (top 6) ────────────────────
export const PIE_ITEMS = [
  { name: "PAYE", value: 25_557.45, color: "#F4D35E" }, // yellow
  { name: "NSSF", value: 4_320, color: "#1D3557" }, // blue
  { name: "SHIF", value: 3_300, color: "#2A9D8F" }, // teal
  { name: "HOUSING LEVY", value: 1_800, color: "#457B9D" }, // muted
  { name: "RENT", value: 15_000, color: "#E63946" }, // red
  { name: "FOOD & MEALS", value: 8_800, color: "#E76F51" }, // orange
  { name: "TRANSPORT (MATATU)", value: 11_200, color: "#0D1B2A" }, // black
  { name: "GROCERIES", value: 8_000, color: "#F4A261" }, // amber
  { name: "OTHER", value: 8_500, color: "#264653" }, // dark teal (electricity 2.5k + internet 3k + gym 3.5k lumped)
] as const;

// Which items to cycle-highlight during the pie scene
export const PIE_CYCLE_INDICES = [0, 1, 2, 3, 4, 5] as const;
export const PIE_CYCLE_PER_ITEM = 45; // frames per item highlight

// ── Rent scene data (relative to rent.start) ───────────────
export const RENT_BEFORE = {
  area: "Kilimani",
  zone: "PREMIUM",
  options: [
    { type: "BEDSITTER", median: 18_000 },
    { type: "1 BEDROOM", median: 38_000 },
    { type: "2 BEDROOM", median: 65_000 },
  ],
} as const;
export const RENT_AFTER = {
  area: "Juja",
  zone: "SATELLITE",
  options: [
    { type: "BEDSITTER", median: 7_000 },
    { type: "1 BEDROOM", median: 15_000 },
    { type: "2 BEDROOM", median: 22_000 },
  ],
} as const;
export const RENT_EDIT_ERASE_AT = 45;
export const RENT_EDIT_RETYPE_AT = 90;
export const RENT_EDIT_CHAR_FRAMES = 6;
export const RENT_RECALC_AT = 140;
export const RENT_RECALC_DURATION = 60;

// ── Food scene data (relative to food.start) ───────────────
export const FOOD_BEFORE = {
  area: "Westlands",
  zone: "PREMIUM",
  options: [
    { name: "Java House", avgMeal: 650 },
    { name: "Artcaffe", avgMeal: 800 },
    { name: "KFC", avgMeal: 500 },
    { name: "Mama Oliech", avgMeal: 350 },
    { name: "Street Food Vendor", avgMeal: 150 },
  ],
} as const;
export const FOOD_AFTER = {
  area: "Thika",
  zone: "SATELLITE",
  options: [
    { name: "Local Kibanda", avgMeal: 180 },
    { name: "Small Restaurant", avgMeal: 300 },
    { name: "Roadside Vendor", avgMeal: 100 },
    { name: "Chicken Joint", avgMeal: 350 },
    { name: "Mandazi + Chai", avgMeal: 70 },
  ],
} as const;
export const FOOD_EDIT_ERASE_AT = 45;
export const FOOD_EDIT_RETYPE_AT = 90;
export const FOOD_EDIT_CHAR_FRAMES = 6;
export const FOOD_RECALC_AT = 135;
export const FOOD_RECALC_DURATION = 60;
