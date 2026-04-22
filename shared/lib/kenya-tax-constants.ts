export const TAX_YEAR = 2026 as const;

export const PERSONAL_RELIEF = 2400 as const;

export const PAYE_BRACKETS = [
  { min: 0, max: 24_000, rate: 0.10 },
  { min: 24_001, max: 32_333, rate: 0.25 },
  { min: 32_334, max: 500_000, rate: 0.30 },
  { min: 500_001, max: 800_000, rate: 0.325 },
  { min: 800_001, max: Infinity, rate: 0.35 },
] as const;

// NSSF constants
export const NSSF_RATE = 0.06 as const;
export const NSSF_LEL = 8_000 as const;
export const NSSF_UEL = 72_000 as const;

// SHIF constants
export const SHIF_RATE = 0.0275 as const;
export const SHIF_MINIMUM = 300 as const;

// Housing Levy
export const HOUSING_LEVY_RATE = 0.015 as const;
