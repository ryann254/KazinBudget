import { findBestMatch } from "../src/geo/area-matcher.js";
import type { NairobiZone } from "../src/geo/types.js";

// ---------------------------------------------------------------------------
// Rent estimates (KES/month) by zone and bedroom count
// ---------------------------------------------------------------------------

type RentOption = { type: string; median: number; range: string };

const RENT_BY_ZONE: Record<
  NairobiZone,
  { bedsitter: RentOption; oneBr: RentOption; twoBr: RentOption }
> = {
  PREMIUM: {
    bedsitter: { type: "Bedsitter", median: 18_000, range: "12,000 - 25,000" },
    oneBr: { type: "1 Bedroom", median: 38_000, range: "25,000 - 55,000" },
    twoBr: { type: "2 Bedroom", median: 65_000, range: "45,000 - 90,000" },
  },
  MIDDLE: {
    bedsitter: { type: "Bedsitter", median: 11_000, range: "8,000 - 14,000" },
    oneBr: { type: "1 Bedroom", median: 22_000, range: "16,000 - 30,000" },
    twoBr: { type: "2 Bedroom", median: 35_000, range: "25,000 - 50,000" },
  },
  BUDGET: {
    bedsitter: { type: "Bedsitter", median: 6_500, range: "5,000 - 9,000" },
    oneBr: { type: "1 Bedroom", median: 12_000, range: "9,000 - 16,000" },
    twoBr: { type: "2 Bedroom", median: 18_000, range: "14,000 - 24,000" },
  },
  SATELLITE: {
    bedsitter: { type: "Bedsitter", median: 7_000, range: "5,000 - 10,000" },
    oneBr: { type: "1 Bedroom", median: 15_000, range: "10,000 - 20,000" },
    twoBr: { type: "2 Bedroom", median: 22_000, range: "15,000 - 30,000" },
  },
};

export type RentEstimate = {
  area: string;
  zone: NairobiZone;
  options: RentOption[];
};

export function estimateRent(homeArea: string): RentEstimate {
  const primary = homeArea.split(",")[0]?.trim() ?? homeArea;
  const match = findBestMatch(primary);
  const zone: NairobiZone = match?.area.zone ?? "SATELLITE";
  const displayArea = match?.area.name ?? primary;
  const opts = RENT_BY_ZONE[zone];
  return {
    area: displayArea,
    zone,
    options: [opts.bedsitter, opts.oneBr, opts.twoBr],
  };
}

// ---------------------------------------------------------------------------
// Food estimates (KES per meal) by zone
// ---------------------------------------------------------------------------

type FoodOption = { name: string; avgMeal: number };

const FOOD_BY_ZONE: Record<NairobiZone, FoodOption[]> = {
  PREMIUM: [
    { name: "Java House", avgMeal: 650 },
    { name: "Artcaffe", avgMeal: 800 },
    { name: "KFC", avgMeal: 500 },
    { name: "Mama Oliech", avgMeal: 350 },
    { name: "Street Food Vendor", avgMeal: 150 },
  ],
  MIDDLE: [
    { name: "Pronto Pizza", avgMeal: 450 },
    { name: "Kenchic", avgMeal: 300 },
    { name: "Local Kibanda", avgMeal: 250 },
    { name: "Chicken Inn", avgMeal: 400 },
    { name: "Street Food Vendor", avgMeal: 120 },
  ],
  BUDGET: [
    { name: "Local Kibanda", avgMeal: 200 },
    { name: "Fast Food Joint", avgMeal: 300 },
    { name: "Kenchic", avgMeal: 300 },
    { name: "Mandazi + Chai", avgMeal: 80 },
    { name: "Street Food Vendor", avgMeal: 100 },
  ],
  SATELLITE: [
    { name: "Local Kibanda", avgMeal: 180 },
    { name: "Small Restaurant", avgMeal: 300 },
    { name: "Roadside Vendor", avgMeal: 100 },
    { name: "Chicken Joint", avgMeal: 350 },
    { name: "Mandazi + Chai", avgMeal: 70 },
  ],
};

export type FoodEstimate = {
  area: string;
  zone: NairobiZone;
  options: FoodOption[];
};

export function estimateFood(workLocation: string): FoodEstimate {
  const primary = workLocation.split(",")[0]?.trim() ?? workLocation;
  const match = findBestMatch(primary);
  const zone: NairobiZone = match?.area.zone ?? "MIDDLE";
  const displayArea = match?.area.name ?? primary;
  return {
    area: displayArea,
    zone,
    options: FOOD_BY_ZONE[zone],
  };
}

// ---------------------------------------------------------------------------
// Commute estimates — distance heuristic + per-mode cost
// ---------------------------------------------------------------------------

const AREA_DISTANCE_FROM_CBD: Record<string, number> = {
  Westlands: 5,
  Kilimani: 4,
  Kileleshwa: 6,
  Lavington: 7,
  Parklands: 4,
  Runda: 12,
  Karen: 18,
  Muthaiga: 8,
  "Spring Valley": 9,
  Loresho: 10,
  "South B": 7,
  "South C": 8,
  Langata: 10,
  Embakasi: 15,
  Donholm: 12,
  Buruburu: 10,
  Roysambu: 14,
  Kasarani: 15,
  Dagoretti: 11,
  "Imara Daima": 13,
  Komarock: 17,
  "Kahawa West": 20,
  Githurai: 18,
  Zimmerman: 16,
  Umoja: 12,
  Pipeline: 14,
  Utawala: 18,
  Syokimau: 19,
  "Lucky Summer": 12,
  Juja: 32,
  Thika: 45,
  Kikuyu: 20,
  Ngong: 22,
  Rongai: 24,
  "Athi River": 28,
  Kitengela: 30,
  Ruiru: 22,
  Kiambu: 16,
};

const DEFAULT_DISTANCE_KM = 12;
const TRIPS_PER_MONTH = 44; // 22 working days × 2 legs

type CommuteMode = {
  mode: string;
  costPerTrip: number;
  monthly: number;
};

const RATES = {
  matatuPerKm: 8,
  bodaPerKm: 18,
  uberPerKm: 35,
  carPerKm: 14,
  matatuMin: 80,
  bodaMin: 100,
  uberMin: 350,
  carMin: 250,
};

export type CommuteEstimate = {
  origin: string;
  destination: string;
  distanceKm: number;
  distance: string;
  modes: CommuteMode[];
};

function lookupDistanceFromCBD(area: string): number | null {
  const primary = area.split(",")[0]?.trim() ?? area;
  const match = findBestMatch(primary);
  if (!match) return null;
  const exact = AREA_DISTANCE_FROM_CBD[match.area.name];
  if (exact !== undefined) return exact;
  switch (match.area.zone) {
    case "PREMIUM":
      return 6;
    case "MIDDLE":
      return 12;
    case "BUDGET":
      return 16;
    case "SATELLITE":
      return 25;
  }
}

function normaliseForCompare(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function estimateCommute(
  homeArea: string,
  workLocation: string,
): CommuteEstimate {
  const originPrimary = homeArea.split(",")[0]?.trim() ?? homeArea;
  const destPrimary = workLocation.split(",")[0]?.trim() ?? workLocation;
  const originMatch = findBestMatch(originPrimary);
  const destMatch = findBestMatch(destPrimary);
  const origin = originMatch?.area.name ?? originPrimary;
  const destination = destMatch?.area.name ?? destPrimary;

  const sameArea =
    normaliseForCompare(homeArea) === normaliseForCompare(workLocation) ||
    (originMatch !== null &&
      destMatch !== null &&
      originMatch.area.name === destMatch.area.name);

  let distanceKm: number;
  if (sameArea) {
    distanceKm = 0;
  } else {
    const originKm = lookupDistanceFromCBD(homeArea) ?? DEFAULT_DISTANCE_KM;
    const destKm = lookupDistanceFromCBD(workLocation) ?? DEFAULT_DISTANCE_KM;
    distanceKm = Math.max(
      3,
      Math.round(
        Math.abs(originKm - destKm) + Math.min(originKm, destKm) * 0.6,
      ),
    );
  }

  const round50 = (value: number) => Math.max(0, Math.round(value / 50) * 50);
  const tripCost = (perKm: number, min: number) => {
    if (distanceKm === 0) return 0;
    return round50(Math.max(min, perKm * distanceKm));
  };

  const matatu = tripCost(RATES.matatuPerKm, RATES.matatuMin);
  const boda = tripCost(RATES.bodaPerKm, RATES.bodaMin);
  const uber = tripCost(RATES.uberPerKm, RATES.uberMin);
  const car = tripCost(RATES.carPerKm, RATES.carMin);

  return {
    origin,
    destination,
    distanceKm,
    distance: `${distanceKm} km`,
    modes: [
      { mode: "Matatu", costPerTrip: matatu, monthly: matatu * TRIPS_PER_MONTH },
      { mode: "Boda Boda", costPerTrip: boda, monthly: boda * TRIPS_PER_MONTH },
      { mode: "Uber/Bolt", costPerTrip: uber, monthly: uber * TRIPS_PER_MONTH },
      {
        mode: "Personal Car",
        costPerTrip: car,
        monthly: car * TRIPS_PER_MONTH,
      },
    ],
  };
}
