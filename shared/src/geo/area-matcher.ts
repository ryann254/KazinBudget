import Fuse from "fuse.js";
import { NAIROBI_AREAS } from "./nairobi-areas";
import type { AreaLookupResult, NairobiArea } from "./types";

const fuse = new Fuse<NairobiArea>(NAIROBI_AREAS as NairobiArea[], {
  threshold: 0.3,
  distance: 100,
  includeScore: true,
  keys: ["name", "aliases"],
});

const CONFIDENCE_THRESHOLD = 0.3;
const STRICT_THRESHOLD = 0.2;
const MAX_RESULTS = 5;

export const searchAreas = (query: string): AreaLookupResult[] => {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return [];

  const results = fuse.search(trimmed, { limit: MAX_RESULTS });

  return results.map((result) => ({
    area: result.item,
    score: result.score ?? 1,
  }));
};

export const findBestMatch = (query: string): AreaLookupResult | null => {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return null;

  const results = fuse.search(trimmed, { limit: 1 });

  if (results.length === 0) return null;

  const best = results[0];
  const score = best.score ?? 1;

  if (score > CONFIDENCE_THRESHOLD) return null;

  return { area: best.item, score };
};

export const isValidArea = (query: string): boolean => {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return false;

  const results = fuse.search(trimmed, { limit: 1 });

  if (results.length === 0) return false;

  return (results[0].score ?? 1) < STRICT_THRESHOLD;
};
