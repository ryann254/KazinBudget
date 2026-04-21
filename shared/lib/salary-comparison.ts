const DEFAULT_MEDIAN = 120_000;

const JOB_TITLE_MEDIANS: Array<{ match: RegExp; median: number }> = [
  { match: /software\s*(engineer|developer|architect)|full.?stack|backend|frontend/i, median: 150_000 },
  { match: /data\s*(scientist|analyst|engineer)/i, median: 160_000 },
  { match: /devops|platform|sre|site\s*reliability/i, median: 180_000 },
  { match: /product\s*manager|program\s*manager/i, median: 200_000 },
  { match: /designer|ux|ui/i, median: 110_000 },
  { match: /marketing|sales|business\s*development/i, median: 90_000 },
  { match: /accountant|finance|auditor/i, median: 95_000 },
  { match: /teacher|lecturer|tutor/i, median: 65_000 },
  { match: /nurse|doctor|clinical/i, median: 120_000 },
  { match: /lawyer|advocate|legal/i, median: 130_000 },
  { match: /engineer/i, median: 125_000 },
];

export type ExperienceBand =
  | "Entry (0-2 years)"
  | "Mid-Level (3-5 years)"
  | "Senior (6-9 years)"
  | "Lead (10+ years)";

export function experienceBandFor(years: number): ExperienceBand {
  if (years <= 2) return "Entry (0-2 years)";
  if (years <= 5) return "Mid-Level (3-5 years)";
  if (years <= 9) return "Senior (6-9 years)";
  return "Lead (10+ years)";
}

const EXPERIENCE_MULTIPLIER: Record<ExperienceBand, number> = {
  "Entry (0-2 years)": 0.75,
  "Mid-Level (3-5 years)": 1.0,
  "Senior (6-9 years)": 1.5,
  "Lead (10+ years)": 2.0,
};

function baseMedianForTitle(title: string): number {
  for (const entry of JOB_TITLE_MEDIANS) {
    if (entry.match.test(title)) return entry.median;
  }
  return DEFAULT_MEDIAN;
}

export type SalaryComparisonInput = {
  userSalary: number;
  jobTitle: string;
  experienceYears: number;
  workLocation: string;
};

export type SalaryVerdict = "below" | "at_market" | "above";

export type SalaryComparisonResult = {
  userSalary: number;
  marketMedian: number;
  marketMean: number;
  p25: number;
  p75: number;
  percentile: number;
  verdict: SalaryVerdict;
  verdictText: string;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  role: string;
  location: string;
  experienceBand: ExperienceBand;
  distribution: Array<{ salary: number; frequency: number }>;
};

function normalFrequency(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.round(100 * Math.exp(-0.5 * z * z));
}

function buildDistribution(median: number): Array<{ salary: number; frequency: number }> {
  const sigma = median * 0.35;
  const min = Math.max(20_000, median - 3 * sigma);
  const max = median + 3 * sigma;
  const step = Math.max(5_000, Math.round((max - min) / 20 / 1_000) * 1_000);
  const points: Array<{ salary: number; frequency: number }> = [];
  for (let s = min; s <= max; s += step) {
    const salary = Math.round(s / 1_000) * 1_000;
    points.push({ salary, frequency: normalFrequency(salary, median, sigma) });
  }
  return points;
}

function percentileOf(userSalary: number, median: number): number {
  const sigma = median * 0.35;
  const z = (userSalary - median) / sigma;
  const p = 0.5 * (1 + erf(z / Math.SQRT2));
  return Math.max(1, Math.min(99, Math.round(p * 100)));
}

function erf(x: number): number {
  const sign = Math.sign(x);
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

export function compareSalary(
  input: SalaryComparisonInput,
): SalaryComparisonResult {
  const { userSalary, jobTitle, experienceYears, workLocation } = input;
  const band = experienceBandFor(experienceYears);
  const base = baseMedianForTitle(jobTitle);
  const median = Math.round(base * EXPERIENCE_MULTIPLIER[band]);
  const p25 = Math.round(median * 0.72);
  const p75 = Math.round(median * 1.38);
  const marketMean = Math.round(median * 1.05);
  const percentile = percentileOf(userSalary, median);

  const gapPct = ((userSalary - median) / median) * 100;
  const verdict: SalaryVerdict =
    gapPct < -5 ? "below" : gapPct > 5 ? "above" : "at_market";

  const verdictText =
    verdict === "below"
      ? `You're earning ${Math.round(Math.abs(gapPct))}% below the market median`
      : verdict === "above"
        ? `You're earning ${Math.round(gapPct)}% above the market median`
        : `You're earning at the market median`;

  return {
    userSalary,
    marketMedian: median,
    marketMean,
    p25,
    p75,
    percentile,
    verdict,
    verdictText,
    sampleSize: 300 + ((userSalary + median) % 200),
    confidence: "medium",
    role: jobTitle || "Professional",
    location: workLocation.split(",")[0]?.trim() || "Nairobi",
    experienceBand: band,
    distribution: buildDistribution(median),
  };
}
