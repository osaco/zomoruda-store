import "server-only";

// Cache only explicitly public reads. Order placement always uses the live repositories.
export async function publicCatalogRead<T>(key: string, read: () => Promise<T>): Promise<T> {
  const edge = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  if (!edge) return read();
  const url = "https://zomoruda-store.osaco-zomoruda.workers.dev/__catalog-cache/v1/" + encodeURIComponent(key);
  try {
    const hit = await edge.match(url);
    if (hit) return await hit.json() as T;
  } catch { /* A cache failure falls back to the catalog. */ }
  const value = await read();
  try {
    await edge.put(url, Response.json(value, { headers: { "Cache-Control": "public, max-age=60" } }));
  } catch { /* Keep serving the live result. */ }
  return value;
}
