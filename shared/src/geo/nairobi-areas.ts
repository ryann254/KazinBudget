import type { NairobiArea } from "./types";

const PREMIUM_AREAS = [
  { name: "Westlands", zone: "PREMIUM", aliases: ["CBD", "Westie"] },
  { name: "Kilimani", zone: "PREMIUM", aliases: [] },
  { name: "Kileleshwa", zone: "PREMIUM", aliases: ["Kile"] },
  { name: "Lavington", zone: "PREMIUM", aliases: ["Lavi"] },
  { name: "Parklands", zone: "PREMIUM", aliases: [] },
  { name: "Runda", zone: "PREMIUM", aliases: [] },
  { name: "Karen", zone: "PREMIUM", aliases: [] },
  { name: "Muthaiga", zone: "PREMIUM", aliases: [] },
  { name: "Spring Valley", zone: "PREMIUM", aliases: [] },
  { name: "Loresho", zone: "PREMIUM", aliases: [] },
] as const satisfies readonly NairobiArea[];

const MIDDLE_AREAS = [
  { name: "South B", zone: "MIDDLE", aliases: ["SB"] },
  { name: "South C", zone: "MIDDLE", aliases: ["SC"] },
  { name: "Langata", zone: "MIDDLE", aliases: [] },
  { name: "Embakasi", zone: "MIDDLE", aliases: [] },
  { name: "Donholm", zone: "MIDDLE", aliases: [] },
  { name: "Buruburu", zone: "MIDDLE", aliases: ["Buru"] },
  { name: "Roysambu", zone: "MIDDLE", aliases: ["TRM", "RoySam"] },
  { name: "Kasarani", zone: "MIDDLE", aliases: [] },
  { name: "Dagoretti", zone: "MIDDLE", aliases: [] },
  { name: "Imara Daima", zone: "MIDDLE", aliases: ["Imara"] },
  { name: "Komarock", zone: "MIDDLE", aliases: [] },
] as const satisfies readonly NairobiArea[];

const BUDGET_AREAS = [
  { name: "Kahawa West", zone: "BUDGET", aliases: ["Kahawa"] },
  { name: "Githurai", zone: "BUDGET", aliases: ["Githu"] },
  { name: "Zimmerman", zone: "BUDGET", aliases: ["Zimm"] },
  { name: "Umoja", zone: "BUDGET", aliases: [] },
  { name: "Pipeline", zone: "BUDGET", aliases: [] },
  { name: "Utawala", zone: "BUDGET", aliases: [] },
  { name: "Syokimau", zone: "BUDGET", aliases: ["Syoki"] },
  { name: "Lucky Summer", zone: "BUDGET", aliases: [] },
] as const satisfies readonly NairobiArea[];

const SATELLITE_AREAS = [
  { name: "Juja", zone: "SATELLITE", aliases: [] },
  { name: "Thika", zone: "SATELLITE", aliases: [] },
  { name: "Ruiru", zone: "SATELLITE", aliases: [] },
  { name: "Kiambu", zone: "SATELLITE", aliases: [] },
  { name: "Ruaka", zone: "SATELLITE", aliases: [] },
  { name: "Ngong", zone: "SATELLITE", aliases: [] },
  { name: "Rongai", zone: "SATELLITE", aliases: [] },
  { name: "Kitengela", zone: "SATELLITE", aliases: ["Kite"] },
  { name: "Athi River", zone: "SATELLITE", aliases: ["Mavoko"] },
  { name: "Kikuyu", zone: "SATELLITE", aliases: [] },
  { name: "Limuru", zone: "SATELLITE", aliases: [] },
  { name: "Kangundo Road", zone: "SATELLITE", aliases: ["Kangundo"] },
  { name: "Mlolongo", zone: "SATELLITE", aliases: [] },
] as const satisfies readonly NairobiArea[];

export const NAIROBI_AREAS: readonly NairobiArea[] = [
  ...PREMIUM_AREAS,
  ...MIDDLE_AREAS,
  ...BUDGET_AREAS,
  ...SATELLITE_AREAS,
];

export const NAIROBI_AREA_MAP: ReadonlyMap<string, NairobiArea> = new Map(
  NAIROBI_AREAS.map((area) => [area.name.toLowerCase(), area]),
);
