import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.RESPONSIVE_PORT ? Number(process.env.RESPONSIVE_PORT) : await new Promise((resolvePort, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    if (!address || typeof address === "string") {
      probe.close();
      reject(new Error("Could not reserve a local port for the responsive check"));
      return;
    }
    probe.close((error) => error ? reject(error) : resolvePort(address.port));
  });
});
const origin = `http://127.0.0.1:${port}`;
const hasProductionBuild = existsSync(join(root, ".next", "BUILD_ID"));
const routes = [
  ["home", "/"],
  ["categories", "/categories"],
  ["offers", "/offers"],
  ["occasions", "/occasions"],
  ["product", "/product/name-necklace"],
  ["cart", "/cart"],
  ["checkout", "/checkout"],
  ["track", "/track"],
  ["policy", "/policy"],
  ["contact", "/contact"],
  ["admin-login", "/admin/login"],
];
const viewports = [
  { name: "phone-360x740", width: 360, height: 740, touch: true },
  { name: "phone-375x667", width: 375, height: 667, touch: true },
  { name: "phone-393x852", width: 393, height: 852, touch: true },
  { name: "phone-430x932", width: 430, height: 932, touch: true },
  { name: "phone-landscape-852x393", width: 852, height: 393, touch: true },
  { name: "ipad-744x1133", width: 744, height: 1133, touch: true },
  { name: "ipad-768x1024", width: 768, height: 1024, touch: true },
  { name: "ipad-820x1180", width: 820, height: 1180, touch: true },
  { name: "ipad-834x1194", width: 834, height: 1194, touch: true },
  { name: "ipad-landscape-1024x768", width: 1024, height: 768, touch: true },
  { name: "ipad-landscape-1112x834", width: 1112, height: 834, touch: true },
  { name: "ipad-landscape-1180x820", width: 1180, height: 820, touch: true },
  { name: "ipad-landscape-1366x1024", width: 1366, height: 1024, touch: true },
  { name: "laptop-1280x720", width: 1280, height: 720, touch: false },
  { name: "laptop-1366x768", width: 1366, height: 768, touch: false },
  { name: "desktop-1440x900", width: 1440, height: 900, touch: false },
  { name: "desktop-1920x1080", width: 1920, height: 1080, touch: false },
];

const cartSeed = {
  state: {
    lines: [{
      key: "responsive-cart-line",
      productId: "responsive-product",
      slug: "name-necklace",
      nameAr: "سلسال بالاسم",
      imageUrl: null,
      unitPrice: 45,
      quantity: 1,
      options: [],
      customName: null,
      cardMessage: null,
      photoPath: null,
    }],
  },
  version: 0,
};

const server = spawn(process.execPath, [join(root, "node_modules", "next", "dist", "bin", "next"), hasProductionBuild ? "start" : "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: hasProductionBuild ? "production" : "development",
    NEXT_PUBLIC_SUPABASE_URL: "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    VERCEL_ENV: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
const serverLogs = [];
server.stdout.on("data", (chunk) => serverLogs.push(String(chunk)));
server.stderr.on("data", (chunk) => serverLogs.push(String(chunk)));

let browser;
const failures = [];
const summaries = [];
const artifactRoot = join(root, ".artifacts", "responsive");

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch { /* The dev server is still starting. */ }
    if (server.exitCode !== null) throw new Error(`Next dev server exited with ${server.exitCode}`);
    await delay(1000);
  }
  throw new Error("Timed out waiting for the local demo site");
}

try {
  await mkdir(artifactRoot, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.touch,
      hasTouch: viewport.touch,
    });
    const page = await context.newPage();
    await page.addInitScript((seed) => localStorage.setItem("zomoruda-cart", JSON.stringify(seed)), cartSeed);

    for (const [routeName, path] of routes) {
      const result = { viewport: viewport.name, route: path, overflow: false, overlaps: 0, smallInputs: 0, smallTargets: 0 };
      try {
        const response = await page.goto(`${origin}${path}`, { waitUntil: "networkidle", timeout: 60_000 });
        if (!response?.ok()) failures.push(`${viewport.name} ${path}: HTTP ${response?.status() ?? "no response"}`);
        await page.locator("body").waitFor({ state: "visible" });
        await page.evaluate(() => document.fonts.ready);

        const audit = await page.evaluate((touch) => {
          const visible = (element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0;
          };
          const scroller = document.scrollingElement;
          const smallInputs = touch ? [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea")]
            .filter(visible)
            .filter((element) => Number.parseFloat(getComputedStyle(element).fontSize) < 16)
            .map((element) => `${element.tagName.toLowerCase()}[name=${element.getAttribute("name") ?? ""}] ${getComputedStyle(element).fontSize}`) : [];
          const targets = [...document.querySelectorAll("a,button,[role=button]")].filter((element) => visible(element) && !element.matches(".sr-only:not(:focus)" )).flatMap((element) => {
            if (element.tagName === "A" && element.closest("p")) return [];
            const rect = element.getBoundingClientRect();
            return rect.width < 44 || rect.height < 44 ? [`${element.tagName.toLowerCase()} ${element.textContent?.trim().slice(0, 45) ?? element.getAttribute("aria-label") ?? ""} ${Math.round(rect.width)}x${Math.round(rect.height)}`] : [];
          });
          const fixed = [...document.querySelectorAll("body *")].filter((element) => visible(element) && getComputedStyle(element).position === "fixed").map((element) => {
            const rect = element.getBoundingClientRect();
            return { label: element.getAttribute("aria-label") ?? element.getAttribute("data-testid") ?? element.tagName, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
          });
          const overlaps = [];
          const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          for (let i = 0; i < fixed.length; i += 1) for (let j = i + 1; j < fixed.length; j += 1) {
            if (fixed[i].label !== fixed[j].label && fixed[i].right - fixed[i].left > 2 && fixed[i].bottom - fixed[i].top > 2 && intersects(fixed[i], fixed[j])) overlaps.push(`${fixed[i].label} overlaps ${fixed[j].label}`);
          }
          const desktopNav = document.querySelector('[data-testid="desktop-store-nav"]');
          const mobileMenu = document.querySelector('[data-testid="mobile-menu-trigger"]');
          return {
            overflow: scroller.scrollWidth > window.innerWidth,
            scrollWidth: scroller.scrollWidth,
            viewportWidth: window.innerWidth,
            smallInputs,
            targets,
            overlaps,
            desktopNavVisible: Boolean(desktopNav && visible(desktopNav)),
            mobileMenuVisible: Boolean(mobileMenu && visible(mobileMenu)),
          };
        }, viewport.touch);

        result.overflow = audit.overflow;
        result.overlaps = audit.overlaps.length;
        result.smallInputs = audit.smallInputs.length;
        result.smallTargets = audit.targets.length;
        if (audit.overflow) failures.push(`${viewport.name} ${path}: horizontal scroll ${audit.scrollWidth}px > ${audit.viewportWidth}px`);
        for (const issue of audit.overlaps) failures.push(`${viewport.name} ${path}: fixed element overlap: ${issue}`);
        for (const issue of audit.smallInputs) failures.push(`${viewport.name} ${path}: touch input below 16px: ${issue}`);
        for (const issue of audit.targets) failures.push(`${viewport.name} ${path}: target below 44px: ${issue}`);
        if (path === "/" && viewport.width === 1024 && (!audit.desktopNavVisible || audit.mobileMenuVisible)) failures.push("1024px: expected desktop navigation only");
        if (path === "/" && viewport.width === 852 && (!audit.mobileMenuVisible || audit.desktopNavVisible)) failures.push("852px: expected touch navigation only");

        const viewportFolder = join(artifactRoot, viewport.name);
        await mkdir(viewportFolder, { recursive: true });
        await page.screenshot({ path: join(viewportFolder, `${routeName}.png`), fullPage: true, animations: "disabled" });
      } catch (error) {
        failures.push(`${viewport.name} ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
      summaries.push(result);
    }
    await context.close();
    process.stdout.write(`Finished ${viewport.name} (${routes.length} routes)\n`);
  }

  const thresholdContext = await browser.newContext({ viewport: { width: 1023, height: 768 } });
  const thresholdPage = await thresholdContext.newPage();
  await thresholdPage.goto(origin, { waitUntil: "networkidle" });
  for (const [width, expectedDesktop] of [[1023, false], [1024, true]]) {
    await thresholdPage.setViewportSize({ width, height: 768 });
    const state = await thresholdPage.evaluate(() => ({
      desktop: getComputedStyle(document.querySelector('[data-testid="desktop-store-nav"]')).display !== "none",
      mobile: getComputedStyle(document.querySelector('[data-testid="mobile-menu-trigger"]')).display !== "none",
    }));
    if (state.desktop !== expectedDesktop || state.mobile === expectedDesktop) failures.push(`${width}px nav breakpoint mismatch: ${JSON.stringify(state)}`);
  }
  await thresholdContext.close();
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  if (browser) await browser.close();
  if (process.platform === "win32" && server.pid) {
    try { execFileSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" }); }
    catch { server.kill("SIGTERM"); }
  } else {
    server.kill("SIGTERM");
  }
}

const header = ["Viewport", "Route checks", "Overflow", "Overlap", "Small inputs", "Small targets"].join(" | ");
process.stdout.write(`\n${header}\n${"-".repeat(header.length)}\n`);
for (const viewport of viewports) {
  const items = summaries.filter((entry) => entry.viewport === viewport.name);
  process.stdout.write(`${viewport.name} | ${items.length}/${routes.length} | ${items.filter((x) => x.overflow).length} | ${items.reduce((sum, x) => sum + x.overlaps, 0)} | ${items.reduce((sum, x) => sum + x.smallInputs, 0)} | ${items.reduce((sum, x) => sum + x.smallTargets, 0)}\n`);
}

if (failures.length > 0) {
  await mkdir(artifactRoot, { recursive: true });
  await writeFile(join(artifactRoot, "failures.txt"), `${failures.join("\n")}\n`);
  process.stderr.write(`\n${failures.length} responsive issue(s):\n${failures.join("\n")}\n`);
  if (serverLogs.length) process.stderr.write(`\nNext.js server output:\n${serverLogs.join("").slice(-12_000)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`\nResponsive check passed for ${summaries.length} route/viewport combinations. Screenshots: .artifacts/responsive/\n`);
}
