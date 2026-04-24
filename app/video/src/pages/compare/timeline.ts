// Compare timeline at 30 fps.
// Total ≈ 1210 frames / 30 ≈ 40.3s.

export const FPS = 30;

export const SCENES = {
  header: { start: 0, duration: 30 }, // title drop
  filters: { start: 30, duration: 180 }, // arrive + cycle 3 chips (~50f each)
  distribution: { start: 210, duration: 550 }, // chart + scenario changes + slower hover sweep
  percentile: { start: 760, duration: 150 }, // percentile bar + verdict stamp
  gaps: { start: 910, duration: 300 }, // 3 gap cards cycled (~95f each — room to read)
} as const;

export const TOTAL_FRAMES = 1210;

// ── Gaussian bin helper ────────────────────────────────────
export function gaussianBins(
  median: number,
  sigma: number,
  bins: number,
  minX: number,
  maxX: number,
): { salary: number; frequency: number }[] {
  const step = (maxX - minX) / (bins - 1);
  const out: { salary: number; frequency: number }[] = [];
  for (let i = 0; i < bins; i++) {
    const x = minX + i * step;
    const z = (x - median) / sigma;
    const y = Math.exp(-0.5 * z * z); // unnormalized
    out.push({
      salary: Math.round(x / 1000) * 1000,
      frequency: Math.round(y * 100),
    });
  }
  return out;
}

// ── Scenarios ──────────────────────────────────────────────
export type Verdict = "BELOW" | "AT_MARKET" | "ABOVE";

export type Scenario = {
  role: string;
  experience: string;
  location: string;
  userSalary: number;
  median: number;
  p25: number;
  p75: number;
  percentile: number;
  verdict: Verdict;
  distribution: { salary: number; frequency: number }[];
  minX: number;
  maxX: number;
};

export const SCENARIOS: readonly Scenario[] = [
  {
    role: "Software Eng",
    experience: "Mid",
    location: "Nairobi",
    userSalary: 120000,
    median: 150000,
    p25: 108000,
    p75: 207000,
    percentile: 28,
    verdict: "BELOW",
    distribution: gaussianBins(150000, 52500, 21, 20000, 300000),
    minX: 20000,
    maxX: 300000,
  },
  {
    role: "Accountant",
    experience: "Mid",
    location: "Nairobi",
    userSalary: 110000,
    median: 85000,
    p25: 61200,
    p75: 117300,
    percentile: 80,
    verdict: "ABOVE",
    distribution: gaussianBins(85000, 29750, 21, 20000, 200000),
    minX: 20000,
    maxX: 200000,
  },
  {
    role: "Teacher",
    experience: "Mid",
    location: "Mombasa",
    userSalary: 65000,
    median: 65000,
    p25: 46800,
    p75: 89700,
    percentile: 50,
    verdict: "AT_MARKET",
    distribution: gaussianBins(65000, 22750, 19, 20000, 128000),
    minX: 20000,
    maxX: 128000,
  },
] as const;

// ── Filters ───────────────────────────────────────────────
export const FILTER_CHIPS = [
  { key: "profession", label: "PROFESSION", value: "SOFTWARE ENG", color: "#F4D35E" },
  { key: "experience", label: "EXPERIENCE", value: "MID", color: "#1D3557" },
  { key: "location", label: "LOCATION", value: "NAIROBI", color: "#E63946" },
] as const;

export const FILTER_CYCLE_PER_ITEM = 50; // 8 ramp-in, 34 hold, 8 ramp-out
export const FILTER_CYCLE_COUNT = 3;

// ── Distribution scenario timing ──────────────────────────
// Per-hover pacing slowed so viewers can actually read each tooltip.
// Scenario A: 200f (20f crossfade + 180f hover window / 6 = 30f per hover)
// Scenario B: 200f
// Scenario C: 150f (20f crossfade + 130f hover window / 6 ≈ 22f per hover)
export const DIST_SCENARIO_SLOTS = [
  { start: 0, duration: 200, scenario: 0 },
  { start: 200, duration: 200, scenario: 1 },
  { start: 400, duration: 150, scenario: 2 },
] as const;
export const DIST_CROSSFADE_FRAMES = 20;
// Each scenario slot: first 20f = cross-fade in; rest reserved for hover sweep.
export const DIST_HOVER_COUNT = 6; // 6 bins left→right per scenario

// Precompute hover indices for each scenario (every 4th bin when 21 bins).
export function hoverIndicesForScenario(scenarioIdx: number): number[] {
  const bins = SCENARIOS[scenarioIdx].distribution.length;
  if (bins === 21) return [0, 4, 8, 12, 16, 20];
  // 19 bins (scenario C): evenly spread 6 points
  if (bins === 19) return [0, 3, 7, 10, 14, 18];
  // Fallback: 6 roughly evenly spaced
  const out: number[] = [];
  for (let i = 0; i < 6; i++) {
    out.push(Math.min(bins - 1, Math.round((i / 5) * (bins - 1))));
  }
  return out;
}

// ── Percentile ────────────────────────────────────────────
export const PERCENTILE_DRAW_FRAMES = 50;

// ── Gaps ──────────────────────────────────────────────────
export const GAPS_CYCLE_PER_ITEM = 95;
export const GAPS_CYCLE_COUNT = 3;

export const GAP_CARDS = [
  {
    key: "monthly",
    label: "MONTHLY GAP",
    valueFn: (s: Scenario) => Math.max(0, s.median - s.userSalary),
    accent: "#E63946",
    tooltip:
      "Difference between your salary and market median per month.",
  },
  {
    key: "annual",
    label: "ANNUAL GAP",
    valueFn: (s: Scenario) => Math.max(0, (s.median - s.userSalary) * 12),
    accent: "#E63946",
    tooltip: "Monthly gap projected over 12 months.",
  },
  {
    key: "p75",
    label: "TO REACH P75",
    valueFn: (s: Scenario) => Math.max(0, s.p75 - s.userSalary),
    accent: "#1D3557",
    tooltip:
      "Additional monthly salary needed to reach the 75th percentile.",
  },
] as const;

// ── Layout heights ─────────────────────────────────────────
export const LAYOUT = {
  PAGE_WIDTH: 1920,
  CONTENT_WIDTH: 1400,
  HEADER_HEIGHT: 70,
  SECTION_GAP: 60,
  FILTERS_HEIGHT: 250,
  DISTRIBUTION_HEIGHT: 620,
  PERCENTILE_HEIGHT: 340,
  GAPS_HEIGHT: 360,
  PAGE_PADDING_TOP: 32,
  PAGE_PADDING_BOTTOM: 48,
} as const;

export const VIEWPORT_HEIGHT = 1080;

const headerY = LAYOUT.PAGE_PADDING_TOP;
const filtersY = headerY + LAYOUT.HEADER_HEIGHT + LAYOUT.SECTION_GAP;
const distributionY = filtersY + LAYOUT.FILTERS_HEIGHT + LAYOUT.SECTION_GAP;
const percentileY =
  distributionY + LAYOUT.DISTRIBUTION_HEIGHT + LAYOUT.SECTION_GAP;
const gapsY = percentileY + LAYOUT.PERCENTILE_HEIGHT + LAYOUT.SECTION_GAP;

export const SECTION_Y = {
  header: headerY,
  filters: filtersY,
  distribution: distributionY,
  percentile: percentileY,
  gaps: gapsY,
} as const;

export const PAGE_HEIGHT =
  gapsY + LAYOUT.GAPS_HEIGHT + LAYOUT.PAGE_PADDING_BOTTOM;

const centerOf = (y: number, h: number) => y + h / 2;
const clampScroll = (c: number) =>
  Math.max(0, Math.min(PAGE_HEIGHT - VIEWPORT_HEIGHT, c - VIEWPORT_HEIGHT / 2));

export const CAMERA_Y = {
  filters: clampScroll(centerOf(filtersY, LAYOUT.FILTERS_HEIGHT + 80)),
  distribution: clampScroll(
    centerOf(distributionY, LAYOUT.DISTRIBUTION_HEIGHT),
  ),
  percentile: clampScroll(centerOf(percentileY, LAYOUT.PERCENTILE_HEIGHT)),
  gaps: clampScroll(centerOf(gapsY, LAYOUT.GAPS_HEIGHT)),
} as const;
