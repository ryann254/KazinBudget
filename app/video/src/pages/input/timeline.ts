// Timeline at 30 fps. Total duration: 1470 frames / 30 = 49s.
// The camera pans down a tall stacked page, pausing on each section.

export const FPS = 30;

export const SCENES = {
  title: { start: 0, duration: 90 }, // 3s title
  personal: { start: 90, duration: 270 }, // 3 – 12s
  salary: { start: 360, duration: 270 }, // 12 – 21s
  commute: { start: 630, duration: 300 }, // 21 – 31s
  expenses: { start: 930, duration: 360 }, // 31 – 43s (add-item beat)
  takehome: { start: 1290, duration: 180 }, // 43 – 49s
} as const;

export const TOTAL_FRAMES = 1470;

// ── Layout heights (natural page coordinates) ──────────────
export const LAYOUT = {
  PAGE_WIDTH: 1920,
  CONTENT_WIDTH: 1400,
  HEADER_HEIGHT: 70,
  SECTION_GAP: 60,
  PERSONAL_HEIGHT: 700,
  SALARY_HEIGHT: 820,
  COMMUTE_HEIGHT: 700,
  EXPENSES_HEIGHT: 880,
  TAKEHOME_HEIGHT: 520,
  PAGE_PADDING_TOP: 32,
  PAGE_PADDING_BOTTOM: 40,
} as const;

export const VIEWPORT_HEIGHT = 1080;

// Section y positions (top of each section) derived from the above.
const headerY = LAYOUT.PAGE_PADDING_TOP;
const personalY = headerY + LAYOUT.HEADER_HEIGHT + LAYOUT.SECTION_GAP;
const salaryY = personalY + LAYOUT.PERSONAL_HEIGHT + LAYOUT.SECTION_GAP;
const commuteY = salaryY + LAYOUT.SALARY_HEIGHT + LAYOUT.SECTION_GAP;
const expensesY = commuteY + LAYOUT.COMMUTE_HEIGHT + LAYOUT.SECTION_GAP;
const takehomeY = expensesY + LAYOUT.EXPENSES_HEIGHT + LAYOUT.SECTION_GAP;

export const SECTION_Y = {
  header: headerY,
  personal: personalY,
  salary: salaryY,
  commute: commuteY,
  expenses: expensesY,
  takehome: takehomeY,
} as const;

export const PAGE_HEIGHT =
  takehomeY + LAYOUT.TAKEHOME_HEIGHT + LAYOUT.PAGE_PADDING_BOTTOM;

// ── Camera waypoints ──────────────────────────────────────
const centerOf = (topY: number, height: number) => topY + height / 2;
const clampScroll = (center: number) =>
  Math.max(0, Math.min(PAGE_HEIGHT - VIEWPORT_HEIGHT, center - VIEWPORT_HEIGHT / 2));

export const CAMERA_Y = {
  personal: clampScroll(centerOf(personalY, LAYOUT.PERSONAL_HEIGHT)),
  salary: clampScroll(centerOf(salaryY, LAYOUT.SALARY_HEIGHT)),
  commute: clampScroll(centerOf(commuteY, LAYOUT.COMMUTE_HEIGHT)),
  expenses: clampScroll(centerOf(expensesY, LAYOUT.EXPENSES_HEIGHT)),
  takehome: clampScroll(centerOf(takehomeY, LAYOUT.TAKEHOME_HEIGHT)),
} as const;

// Personal info keystroke offsets (relative to personal.start)
export const PERSONAL_FIELDS = [
  { key: "fullName", label: "FULL NAME", text: "Amani Wanjiku", offset: 30, charFrames: 3 },
  { key: "company", label: "COMPANY", text: "Safaricom PLC", offset: 75, charFrames: 3 },
  { key: "jobTitle", label: "JOB TITLE", text: "Software Engineer", offset: 120, charFrames: 2 },
  { key: "workLocation", label: "WORK LOCATION", text: "Westlands, Nairobi", offset: 165, charFrames: 2 },
  { key: "homeArea", label: "HOME AREA", text: "Kilimani", offset: 210, charFrames: 3 },
] as const;

// Salary / experience field offsets (relative to salary.start)
export const SALARY_TYPE_OFFSET = 45;
export const SALARY_TARGET = 120_000;
export const SALARY_TYPE_DURATION = 90;
export const EXPERIENCE_TYPE_OFFSET = 150;
export const EXPERIENCE_TARGET = 3;
export const TAX_CARD_START = 60;
export const TAX_CARD_DURATION = 90;
export const NET_PULSE_AT = 210;

// Commute scene (relative to commute.start)
export const HOME_ERASE_AT = 30;
export const HOME_RETYPE_AT = 75;
export const HOME_RETYPE_TEXT = "Juja, Kiambu";
export const HOME_RETYPE_CHAR_FRAMES = 3;
export const COMMUTE_DISTANCE_UPDATE_AT = 150;
export const COMMUTE_MODE_REVEAL_AT = 180;

// Expenses scene (relative to expenses.start) — highlights the Matatu
// row added at the end of the commute scene, then opens Add-item row.
export const CLICK_HIGHLIGHT_AT = 10;
export const CLICK_AT = 45;
export const ROW_SLIDE_IN_AT = 60;
export const ROW_SLIDE_DURATION = 30;
export const TRANSPORT_ROW_PULSE_AT = 150;
export const ADD_ROW_EXPAND_AT = 210;
export const ADD_ROW_TYPE_AT = 240;
export const ADD_ROW_TEXT = "Gym";
export const ADD_ROW_CHAR_FRAMES = 4;
export const ADDED_GYM_AMOUNT = 3_500;

// Take-home (relative to takehome.start)
export const TOTAL_COUNT_AT = 0;
export const TOTAL_COUNT_DURATION = 60;
export const TAKEHOME_PULSE_AT = 80;

// ── Distance / cost models ────────────────────────────────
export const COMMUTE_AFTER = {
  distanceKm: 32,
  origin: "Juja",
  destination: "Westlands",
  modes: [
    { mode: "MATATU", monthly: 11_200 },
    { mode: "BODA BODA", monthly: 25_344 },
    { mode: "UBER/BOLT", monthly: 49_280 },
    { mode: "PERSONAL CAR", monthly: 19_712 },
  ],
} as const;

export const CLICK_MODE_INDEX = 0;
export const CLICK_MODE = COMMUTE_AFTER.modes[CLICK_MODE_INDEX];
export const TRANSPORT_CLICK_AMOUNT = CLICK_MODE.monthly;

export const TAX_TARGETS = {
  paye: 25_557.45,
  nssf: 4_320,
  shif: 3_300,
  housing: 1_800,
  netSalary: 85_022.55,
} as const;

export const SEEDED_EXPENSES = [
  { name: "RENT", amount: 15_000, accent: "red" },
  { name: "FOOD & MEALS", amount: 8_800, accent: "blue" },
  { name: "GROCERIES", amount: 8_000, accent: "yellow" },
  { name: "ELECTRICITY", amount: 2_500, accent: "teal" },
  { name: "INTERNET", amount: 3_000, accent: "muted" },
] as const;
