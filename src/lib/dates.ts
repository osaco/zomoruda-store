/** ISO timestamp `days` days before now (kept out of components for render purity). */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const storeZone = "Asia/Gaza";
const localDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: storeZone, year: "numeric", month: "2-digit", day: "2-digit",
});
const offsetFormat = new Intl.DateTimeFormat("en-US", { timeZone: storeZone, timeZoneName: "longOffset" });

export function storeDateInput(iso: string): string {
  const timestamp = new Date(iso);
  return Number.isFinite(timestamp.getTime()) ? localDate.format(timestamp) : "";
}

/** Convert the inclusive start or end of a Gaza calendar date to UTC. */
export function storeDateBoundary(date: string, end = false): string {
  const midnight = Date.parse(date + "T00:00:00.000Z") + (end ? 86_400_000 : 0);
  let timestamp = midnight;
  for (let i = 0; i < 3; i++) {
    const offset = offsetFormat.formatToParts(timestamp).find(part => part.type === "timeZoneName")?.value;
    const match = offset?.match(/GMT([+-])(\d{2}):(\d{2})/);
    const minutes = match ? (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "-" ? -1 : 1) : 0;
    const adjusted = midnight - minutes * 60_000;
    if (adjusted === timestamp) break;
    timestamp = adjusted;
  }
  return new Date(timestamp - (end ? 1 : 0)).toISOString();
}
