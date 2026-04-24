import { useEffect, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

type MapsDistance = {
  distanceKm: number;
  durationMin: number;
};

type Status = "idle" | "loading" | "ok" | "error" | "disabled";

type HookState = MapsDistance & {
  status: Status;
};

const INITIAL: HookState = {
  distanceKm: 0,
  durationMin: 0,
  status: "idle",
};

const DISABLED: HookState = {
  distanceKm: 0,
  durationMin: 0,
  status: "disabled",
};

let optionsApplied = false;
let routesPromise: Promise<google.maps.RoutesLibrary> | null = null;

function loadRoutesLibrary(): Promise<google.maps.RoutesLibrary> {
  if (!apiKey) return Promise.reject(new Error("maps_disabled"));
  if (!optionsApplied) {
    setOptions({ key: apiKey, v: "weekly", region: "KE" });
    optionsApplied = true;
  }
  if (!routesPromise) {
    routesPromise = importLibrary("routes");
  }
  return routesPromise;
}

const cache = new Map<string, MapsDistance>();

function cacheKey(origin: string, destination: string): string {
  return `${origin.trim().toLowerCase()}|${destination.trim().toLowerCase()}`;
}

async function fetchDistance(
  lib: google.maps.RoutesLibrary,
  origin: string,
  destination: string,
): Promise<MapsDistance> {
  const result = await lib.RouteMatrix.computeRouteMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: google.maps.TravelMode.DRIVING,
    fields: ["distanceMeters", "durationMillis"],
  });
  const item = result.matrix.rows[0]?.items[0];
  if (!item) throw new Error("route_not_found");
  if (item.error) throw new Error(item.error.message);
  const meters = item.distanceMeters ?? 0;
  const ms = item.durationMillis ?? 0;
  if (meters <= 0) throw new Error("zero_distance");
  return {
    distanceKm: Math.round(meters / 1000),
    durationMin: Math.round(ms / 60000),
  };
}

export function useGoogleMapsDistance(
  origin: string,
  destination: string,
): HookState {
  const [state, setState] = useState<HookState>(INITIAL);

  useEffect(() => {
    if (!apiKey) return;

    const o = origin.trim();
    const d = destination.trim();
    if (!o || !d) return;

    const key = cacheKey(o, d);
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const hit = cache.get(key);
      if (hit) {
        setState({ ...hit, status: "ok" });
        return;
      }
      loadRoutesLibrary()
        .then((lib) => fetchDistance(lib, o, d))
        .then((result) => {
          if (cancelled) return;
          cache.set(key, result);
          setState({ ...result, status: "ok" });
        })
        .catch(() => {
          if (cancelled) return;
          setState({ distanceKm: 0, durationMin: 0, status: "error" });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  if (!apiKey) return DISABLED;
  return state;
}
