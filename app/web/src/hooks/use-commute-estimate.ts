import { useMemo } from "react";
import {
  estimateCommute,
  type CommuteEstimate,
} from "@kazibudget/shared/lib/area-estimates";
import { useGoogleMapsDistance } from "./use-google-maps-distance";

export type LiveCommute = CommuteEstimate & {
  durationMin: number | null;
  source: "maps" | "heuristic";
};

const TRIPS_PER_MONTH = 44;
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

function round50(value: number): number {
  return Math.max(0, Math.round(value / 50) * 50);
}

function buildModes(distanceKm: number) {
  const tripCost = (perKm: number, min: number) =>
    distanceKm === 0 ? 0 : round50(Math.max(min, perKm * distanceKm));
  const matatu = tripCost(RATES.matatuPerKm, RATES.matatuMin);
  const boda = tripCost(RATES.bodaPerKm, RATES.bodaMin);
  const uber = tripCost(RATES.uberPerKm, RATES.uberMin);
  const car = tripCost(RATES.carPerKm, RATES.carMin);
  return [
    { mode: "Matatu", costPerTrip: matatu, monthly: matatu * TRIPS_PER_MONTH },
    { mode: "Boda Boda", costPerTrip: boda, monthly: boda * TRIPS_PER_MONTH },
    { mode: "Uber/Bolt", costPerTrip: uber, monthly: uber * TRIPS_PER_MONTH },
    {
      mode: "Personal Car",
      costPerTrip: car,
      monthly: car * TRIPS_PER_MONTH,
    },
  ];
}

export function useCommuteEstimate(
  homeArea: string,
  workLocation: string,
): LiveCommute {
  const heuristic = useMemo(
    () => estimateCommute(homeArea, workLocation),
    [homeArea, workLocation],
  );

  const maps = useGoogleMapsDistance(homeArea, workLocation);

  return useMemo<LiveCommute>(() => {
    if (maps.status === "ok") {
      return {
        ...heuristic,
        distanceKm: maps.distanceKm,
        distance: `${maps.distanceKm} km`,
        modes: buildModes(maps.distanceKm),
        durationMin: maps.durationMin,
        source: "maps",
      };
    }
    return { ...heuristic, durationMin: null, source: "heuristic" };
  }, [heuristic, maps.status, maps.distanceKm, maps.durationMin]);
}
