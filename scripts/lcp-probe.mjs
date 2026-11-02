/**
 * Isolates what the home page's LCP would be if the display font were already
 * cached, i.e. the ceiling once fonts stop being the bottleneck.
 * node scripts/lcp-probe.mjs [baseUrl]
 */
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();

async function probe(label, { warm }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  // Warm the font cache only when asked.
  await page.goto(baseUrl, { waitUntil: "load" });
  if (!warm) await ctx.clearCookies();

  await page.reload({ waitUntil: "load" });
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const out = { lcp: 0, lcpElement: null, fcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            out.lcp = Math.round(entry.startTime);
            out.lcpElement = entry.element?.tagName ?? null;
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        const paint = performance
          .getEntriesByType("paint")
          .find((e) => e.name === "first-contentful-paint");
        out.fcp = Math.round(paint?.startTime ?? 0);
        setTimeout(() => resolve(out), 900);
      }),
  );
  console.log(`${label}: fcp=${result.fcp}ms lcp=${result.lcp}ms <${result.lcpElement}>`);
  await ctx.close();
}

await probe("cold cache, 4x CPU", { warm: false });
await probe("warm cache, 4x CPU", { warm: true });

await browser.close();
