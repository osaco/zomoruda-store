/** ISO timestamp `days` days before now (kept out of components for render purity). */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
