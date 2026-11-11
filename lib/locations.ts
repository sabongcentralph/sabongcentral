import data from "./psgc.json";

// Official PSA PSGC list (2025-2Q release): 82 provinces plus Metro Manila,
// with every city and municipality. Highly urbanized cities are placed under
// the province they sit in, so people find them where they expect.
export type Area = { p: string; r: string; c: string[] };
export const AREAS = data as Area[];

export const PROVINCES = AREAS.map((a) => a.p);

export function citiesOf(province: string | undefined): string[] {
  return AREAS.find((a) => a.p === province)?.c ?? [];
}

export function regionOf(province: string): string {
  return AREAS.find((a) => a.p === province)?.r ?? "";
}

// Launch focus. Filters start empty (all provinces); this is where the sample listings live.
export const START_PROVINCE = "Batangas";
