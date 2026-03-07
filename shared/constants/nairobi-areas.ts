import { NAIROBI_AREAS } from "../src/geo/nairobi-areas.js";

export type AreaOption = {
  value: string;
  label: string;
};

/**
 * Nairobi area options formatted for form comboboxes.
 * Sorted alphabetically by label.
 */
export const NAIROBI_AREA_OPTIONS: readonly AreaOption[] = NAIROBI_AREAS
  .map((area) => ({
    value: area.name,
    label: area.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
