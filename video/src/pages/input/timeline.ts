// Timeline at 30 fps. Total duration: 1110 frames / 30 = 37s.
// Anchors are absolute frame numbers; sub-events are relative to each scene.

export const FPS = 30;

export const SCENES = {
  title: { start: 0, duration: 90 }, // 3s intro title
  personal: { start: 90, duration: 240 }, // type name, company, title, workLoc, home
  salary: { start: 330, duration: 210 }, // type salary, animate tax cards, NET banner
  commute: { start: 540, duration: 240 }, // update home area → commute distance + modes
  click: { start: 780, duration: 180 }, // highlight Uber, click, add to expenses
  takehome: { start: 960, duration: 150 }, // total + take-home pulse finale
} as const;

export const TOTAL_FRAMES = 1110;

// Personal info keystroke offsets (relative to personal.start)
export const PERSONAL_FIELDS = [
  { key: "fullName", label: "FULL NAME", text: "Amani Wanjiku", offset: 10, charFrames: 3 },
  { key: "company", label: "COMPANY", text: "Safaricom PLC", offset: 60, charFrames: 3 },
  { key: "jobTitle", label: "JOB TITLE", text: "Software Engineer", offset: 110, charFrames: 2 },
  { key: "workLocation", label: "WORK LOCATION", text: "Westlands, Nairobi", offset: 150, charFrames: 2 },
  { key: "homeArea", label: "HOME AREA", text: "Kilimani", offset: 195, charFrames: 3 },
] as const;

// Salary / experience field offsets (relative to salary.start)
export const SALARY_TYPE_OFFSET = 15;
export const SALARY_TARGET = 120_000;
export const SALARY_TYPE_DURATION = 90;
export const EXPERIENCE_TYPE_OFFSET = 120;
export const EXPERIENCE_TARGET = 3;
export const TAX_CARD_START = 45; // when tax cards begin counting
export const TAX_CARD_DURATION = 90;
export const NET_PULSE_AT = 170;

// Commute scene (relative to commute.start)
export const HOME_ERASE_AT = 10;
export const HOME_RETYPE_AT = 50;
export const HOME_RETYPE_TEXT = "Juja, Kiambu";
export const HOME_RETYPE_CHAR_FRAMES = 3;
export const COMMUTE_DISTANCE_UPDATE_AT = 120;
export const COMMUTE_MODE_REVEAL_AT = 150;

// Click scene (relative to click.start)
export const CLICK_HIGHLIGHT_AT = 10;
export const CLICK_AT = 60;
export const ROW_SLIDE_IN_AT = 75;
export const ROW_SLIDE_DURATION = 30;

// Take-home (relative to takehome.start)
export const TOTAL_COUNT_AT = 0;
export const TOTAL_COUNT_DURATION = 60;
export const TAKEHOME_PULSE_AT = 80;

// Distance / cost models (derived from app heuristic)
export const COMMUTE_BEFORE = { distanceKm: 0, origin: "—", modes: [] as { mode: string; monthly: number }[] };
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

// Which commute-mode card the demo "clicks" to upsert into expenses.
// Matatu (index 0) keeps the demo's math positive; Uber spikes above net-after-tax.
export const CLICK_MODE_INDEX = 0;

// Tax breakdown for 120k gross (from shared/lib/kenya-tax-calculator at 120k)
export const TAX_TARGETS = {
  paye: 25_557.45,
  nssf: 4_320,
  shif: 3_300,
  housing: 1_800,
  netSalary: 85_022.55,
} as const;

// Seeded expenses shown throughout
export const SEEDED_EXPENSES = [
  { name: "RENT", amount: 15_000, accent: "red" },
  { name: "FOOD & MEALS", amount: 8_800, accent: "blue" },
  { name: "GROCERIES", amount: 8_000, accent: "yellow" },
  { name: "ELECTRICITY", amount: 2_500, accent: "teal" },
  { name: "INTERNET", amount: 3_000, accent: "muted" },
] as const;

export const CLICK_MODE = COMMUTE_AFTER.modes[CLICK_MODE_INDEX];
export const TRANSPORT_CLICK_AMOUNT = CLICK_MODE.monthly;
