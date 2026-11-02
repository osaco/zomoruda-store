/**
 * Measures FCP/LCP under realistic network + CPU throttling, which Lighthouse's
 * `simulate` model exaggerates for self-hosted Arabic webfonts.
 *
 * node scripts/lcp-throttled.mjs [baseUrl]
 */
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();

const PROFILES = [
  { name: "no throttle", cpu: 1, net: null },
  { name: "4x CPU", cpu: 4, net: null },
  { name: "Slow 4G + 4x CPU", cpu: 4, net: { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 } },
];

for (const profile of PROFILES) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
  if (profile.net) await cdp.send("Network.emulateNetworkConditions", { offline: false, ...profile.net });

  await page.goto(baseUrl, { waitUntil: "load" });
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const out = { lcp: 0, tag: null, fcp: 0, cls: 0 };
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.entryType === "largest-contentful-paint") {
              out.lcp = Math.round(e.startTime);
              out.tag = e.element?.tagName ?? null;
            }
            if (e.entryType === "layout-shift" && !e.hadRecentInput) out.cls += e.value;
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
        out.fcp = Math.round(
          performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")?.startTime ?? 0,
        );
        setTimeout(() => resolve(out), 1200);
      }),
  );
  console.log(
    `${profile.name.padEnd(22)} FCP=${String(result.fcp).padStart(5)}ms  LCP=${String(result.lcp).padStart(5)}ms <${result.tag}>  CLS=${result.cls.toFixed(4)}`,
  );
  await ctx.close();
}

await browser.close();
