// Growth timeline at 30 fps.
// Tight pacing — total: 990 frames / 30 = 33s.

export const FPS = 30;

export const SCENES = {
  header: { start: 0, duration: 30 }, // title drop
  assumptions: { start: 30, duration: 210 }, // arrive + cycle 4 items (~35f each) + hold
  salaryChart: { start: 240, duration: 270 }, // draw + 6 point hovers left→right
  milestones: { start: 510, duration: 210 }, // arrive + cycle 4 cards (~45f each)
  taxesChart: { start: 720, duration: 270 }, // draw + 6 point hovers
} as const;

export const TOTAL_FRAMES = 990;

// ── Data ───────────────────────────────────────────────────

export const GROWTH_ASSUMPTIONS = [
  { label: "SALARY GROWTH", value: 7.5, color: "#2A9D8F" },
  { label: "RENT INFLATION", value: 5.0, color: "#E63946" },
  { label: "FOOD INFLATION", value: 6.5, color: "#F4D35E" },
  { label: "CPI", value: 6.0, color: "#457B9D" },
] as const;

export const GROWTH_CHART = [
  { year: 0, salary: 120000, takeHome: 53338, expenses: 50200, taxes: 16462 },
  { year: 1, salary: 129000, takeHome: 56200, expenses: 52700, taxes: 17700 },
  { year: 2, salary: 138675, takeHome: 59300, expenses: 55400, taxes: 19175 },
  { year: 3, salary: 149153, takeHome: 62450, expenses: 58700, taxes: 21003 },
  { year: 4, salary: 160339, takeHome: 65700, expenses: 61700, taxes: 23139 },
  { year: 5, salary: 172406, takeHome: 69200, expenses: 64800, taxes: 25406 },
  { year: 6, salary: 185336, takeHome: 72500, expenses: 68100, taxes: 27936 },
  { year: 7, salary: 199280, takeHome: 76100, expenses: 71500, taxes: 30680 },
  { year: 8, salary: 214226, takeHome: 80100, expenses: 75200, taxes: 33726 },
  { year: 9, salary: 230293, takeHome: 84200, expenses: 78600, taxes: 37093 },
  { year: 10, salary: 246170, takeHome: 88700, expenses: 82300, taxes: 39170 },
] as const;

export const MILESTONES = [
  { label: "NOW",     year: 0,  salary: 120000, takeHome: 53338, color: "#E63946", rotate: -1 },
  { label: "YEAR 3",  year: 3,  salary: 149153, takeHome: 62450, color: "#1D3557", rotate:  1.5 },
  { label: "YEAR 5",  year: 5,  salary: 172406, takeHome: 69200, color: "#F4D35E", rotate: -0.5 },
  { label: "YEAR 10", year: 10, salary: 246170, takeHome: 88700, color: "#2A9D8F", rotate:  1 },
] as const;

// Indices (0..10) to cycle through for chart hovers: 6 points left→right.
export const HOVER_INDICES = [0, 2, 4, 6, 8, 10] as const;

// ── Layout heights ─────────────────────────────────────────
export const LAYOUT = {
  PAGE_WIDTH: 1920,
  CONTENT_WIDTH: 1400,
  HEADER_HEIGHT: 70,
  SECTION_GAP: 60,
  ASSUMPTIONS_HEIGHT: 340,
  SALARY_CHART_HEIGHT: 560,
  MILESTONES_HEIGHT: 360,
  TAXES_CHART_HEIGHT: 560,
  PAGE_PADDING_TOP: 32,
  PAGE_PADDING_BOTTOM: 48,
} as const;

export const VIEWPORT_HEIGHT = 1080;

const headerY = LAYOUT.PAGE_PADDING_TOP;
const assumptionsY = headerY + LAYOUT.HEADER_HEIGHT + LAYOUT.SECTION_GAP;
const salaryChartY =
  assumptionsY + LAYOUT.ASSUMPTIONS_HEIGHT + LAYOUT.SECTION_GAP;
const milestonesY =
  salaryChartY + LAYOUT.SALARY_CHART_HEIGHT + LAYOUT.SECTION_GAP;
const taxesChartY =
  milestonesY + LAYOUT.MILESTONES_HEIGHT + LAYOUT.SECTION_GAP;

export const SECTION_Y = {
  header: headerY,
  assumptions: assumptionsY,
  salaryChart: salaryChartY,
  milestones: milestonesY,
  taxesChart: taxesChartY,
} as const;

export const PAGE_HEIGHT =
  taxesChartY + LAYOUT.TAXES_CHART_HEIGHT + LAYOUT.PAGE_PADDING_BOTTOM;

const centerOf = (y: number, h: number) => y + h / 2;
const clampScroll = (c: number) =>
  Math.max(0, Math.min(PAGE_HEIGHT - VIEWPORT_HEIGHT, c - VIEWPORT_HEIGHT / 2));

export const CAMERA_Y = {
  assumptions: clampScroll(
    centerOf(assumptionsY, LAYOUT.ASSUMPTIONS_HEIGHT + 40),
  ),
  salaryChart: clampScroll(
    centerOf(salaryChartY, LAYOUT.SALARY_CHART_HEIGHT),
  ),
  milestones: clampScroll(centerOf(milestonesY, LAYOUT.MILESTONES_HEIGHT)),
  taxesChart: clampScroll(centerOf(taxesChartY, LAYOUT.TAXES_CHART_HEIGHT)),
} as const;

// ── Cycle timings ──────────────────────────────────────────
// Assumptions: 4 cards over ~140f, hold rest of scene.
export const ASSUMPTION_CYCLE_PER_ITEM = 35; // ramp-in 8 + hold 22 + ramp-out 5
export const ASSUMPTION_CYCLE_COUNT = 4;

// Milestones: 4 cards each ~45f.
export const MILESTONE_CYCLE_PER_ITEM = 45;
export const MILESTONE_CYCLE_COUNT = 4;

// Chart pacing
export const CHART_LINE_DRAW_FRAMES = 60;
export const CHART_HOVER_COUNT = 6;
export const CHART_HOVER_PER_ITEM = 30;
