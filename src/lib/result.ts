/** Typed result for server actions — never throw across the network boundary. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (error: string, fieldErrors?: Record<string, string>): Result<never> => ({ ok: false, error, fieldErrors });

/** Flattens a zod error into { field: firstMessage }. */
export function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    out[key] ??= issue.message;
  }
  return out;
}
