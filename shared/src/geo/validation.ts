import { z } from "zod";
import { findBestMatch, isValidArea } from "./area-matcher";
import type { NairobiZone } from "./types";

export const locationSchema = z
  .string()
  .min(1, "Location is required")
  .refine((val) => isValidArea(val), {
    message:
      "We're not in this area yet. Please select a supported Nairobi location.",
  });

export const resolvedLocationSchema = z
  .string()
  .min(1, "Location is required")
  .refine((val) => isValidArea(val), {
    message:
      "We're not in this area yet. Please select a supported Nairobi location.",
  })
  .transform((val): { name: string; zone: NairobiZone } => {
    const match = findBestMatch(val);
    if (!match) {
      // This should never happen since refine already validates,
      // but we need to satisfy the type system.
      return { name: val, zone: "BUDGET" };
    }
    return { name: match.area.name, zone: match.area.zone };
  });
