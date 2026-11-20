import app from "./.open-next/worker.js";

const worker = {
  fetch: app.fetch,
  async scheduled(_event, env, ctx) {
    if (!env.CRON_SECRET) throw new Error("CRON_SECRET is required for order maintenance");
    const request = new Request(new URL("/api/cron/keepalive", env.NEXT_PUBLIC_SITE_URL), {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    const response = await app.fetch(request, env, ctx);
    if (!response.ok) throw new Error(`Order maintenance failed (HTTP ${response.status})`);
  },
};

export default worker;
