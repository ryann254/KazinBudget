export type NairobiZone = "PREMIUM" | "MIDDLE" | "BUDGET" | "SATELLITE";

export type NairobiArea = {
  name: string;
  zone: NairobiZone;
  aliases: string[];
};

export type AreaLookupResult = {
  area: NairobiArea;
  score: number;
};
