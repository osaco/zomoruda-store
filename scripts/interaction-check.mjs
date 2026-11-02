/**
 * Behavioural verification: the things a static DOM check cannot prove.
 * Run against a dev server: node scripts/interaction-check.mjs [baseUrl]
 */
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const results = [];
const check = (label, ok, detail = "") => results.push({ label, ok, detail });

const browser = await chromium.launch();

/* ---------------------------------------------------------------- gem tilt */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const before = await page.getAttribute("[data-testid='gem-mark']", "style");
  await page.mouse.move(100, 100);
  await page.waitForTimeout(150);
  const after = await page.getAttribute("[data-testid='gem-mark']", "style");

  const rot = /rotateY\(([-\d.]+)deg\)/.exec(after ?? "");
  const rotX = /rotateX\(([-\d.]+)deg\)/.exec(after ?? "");
  check(
    "gem tilts in perspective on pointermove",
    !!rot && !!rotX && Math.abs(parseFloat(rot[1])) > 0.5,
    `style=${after}`,
  );
  check("gem tilt actually changed", before !== after, `before=${before} after=${after}`);

  // Table facet opacity must respond too.
  const tableOpacity = await page.getAttribute("[data-testid='gem-mark'] polygon:last-of-type", "fill-opacity");
  check("gem table facet opacity responds", tableOpacity !== null && parseFloat(tableOpacity) > 0.22, `opacity=${tableOpacity}`);

  // rAF batching: a burst of moves must not schedule a state update storm.
  const rendered = await page.evaluate(async () => {
    let mutations = 0;
    const target = document.querySelector("[data-testid='gem-mark']");
    const obs = new MutationObserver((list) => { mutations += list.length; });
    obs.observe(target, { attributes: true, attributeFilter: ["style"] });
    for (let i = 0; i < 60; i++) {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: i * 10, clientY: i * 5 }));
    }
    await new Promise((r) => setTimeout(r, 120));
    obs.disconnect();
    return mutations;
  });
  check("gem updates are rAF-coalesced (<= ~10 for 60 events)", rendered <= 10, `style mutations=${rendered}`);
  await page.close();
}

/* -------------------------------------------------------------- gem static */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.mouse.move(10, 10).catch(() => {});
  await page.waitForTimeout(100);
  const style = await page.getAttribute("[data-testid='gem-mark']", "style");
  check("gem stays static on touch/mobile", !/rotateY/.test(style ?? ""), `style=${style}`);
  await page.close();
}

/* --------------------------------------------------------- ribbon drawing */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const initial = await page.evaluate(() => {
    const path = document.querySelector("[aria-hidden='true'] svg path");
    return path ? { dash: path.style.strokeDasharray, off: path.style.strokeDashoffset } : null;
  });
  await page.evaluate(() => document.querySelector("#occ")?.scrollIntoView());
  await page.waitForTimeout(400);
  const later = await page.evaluate(() => {
    const path = document.querySelector("[aria-hidden='true'] svg path");
    return path ? { off: parseFloat(path.style.strokeDashoffset), total: parseFloat(path.style.strokeDasharray) } : null;
  });
  check("ribbon starts undrawn", initial && parseFloat(initial.off) > 0, JSON.stringify(initial));
  check(
    "ribbon draws on scroll",
    later && later.off < later.total,
    JSON.stringify(later),
  );
  await page.close();
}

/* ------------------------------------------------------- mobile menu a11y */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const trigger = page.locator("button[aria-controls='mobile-menu']");
  await trigger.click();
  await page.waitForTimeout(150);

  const openState = await page.evaluate(() => {
    const dialog = document.querySelector("#mobile-menu");
    return {
      exists: !!dialog,
      role: dialog?.getAttribute("role"),
      modal: dialog?.getAttribute("aria-modal"),
      expanded: document.querySelector("button[aria-controls='mobile-menu']")?.getAttribute("aria-expanded"),
      focusedInside: dialog?.contains(document.activeElement) ?? false,
      bodyLocked: getComputedStyle(document.body).overflow,
      links: dialog?.querySelectorAll("a[href]").length ?? 0,
    };
  });
  check("drawer opens as a modal dialog", openState.exists && openState.role === "dialog" && openState.modal === "true", JSON.stringify(openState));
  check("aria-expanded reflects open", openState.expanded === "true", `expanded=${openState.expanded}`);
  check("focus moves into the drawer", openState.focusedInside, JSON.stringify(openState));
  check("background scroll locked", openState.bodyLocked === "hidden", `overflow=${openState.bodyLocked}`);
  check("drawer lists nav links", openState.links >= 5, `links=${openState.links}`);

  // Escape closes and restores focus to the trigger.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const closed = await page.evaluate(() => ({
    gone: !document.querySelector("#mobile-menu"),
    focusOnTrigger: document.activeElement?.getAttribute("aria-controls") === "mobile-menu",
    bodyScroll: getComputedStyle(document.body).overflow,
  }));
  check("Escape closes the drawer", closed.gone, JSON.stringify(closed));
  check("focus returns to the trigger", closed.focusOnTrigger, JSON.stringify(closed));
  check("scroll lock released", closed.bodyScroll !== "hidden", `overflow=${closed.bodyScroll}`);

  // Outside click closes.
  await trigger.click();
  await page.waitForTimeout(150);
  await page.mouse.click(195, 700);
  await page.waitForTimeout(200);
  const outsideClosed = await page.evaluate(() => !document.querySelector("#mobile-menu"));
  check("outside click closes the drawer", outsideClosed, "drawer still open");

  await page.close();
}

/* ---------------------------------------------------- hover fills a row */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const row = page.locator("[data-testid='occasion-row']").first();
  await row.scrollIntoViewIfNeeded();
  const beforeScale = await row.evaluate((el) =>
    getComputedStyle(el.querySelector("span[aria-hidden]")).transform,
  );
  await row.hover();
  await page.waitForTimeout(450);
  const afterScale = await row.evaluate((el) =>
    getComputedStyle(el.querySelector("span[aria-hidden]")).transform,
  );
  check("occasion fill is scaleY driven", beforeScale !== afterScale, `${beforeScale} -> ${afterScale}`);
  check("occasion fill uses a matrix scale", /matrix/.test(afterScale), afterScale);
  await page.close();
}

/* --------------------------------------------------- RTL arrow direction */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const dir = await page.evaluate(() => {
    const row = document.querySelector("[data-testid='occasion-row']");
    const spans = row.querySelectorAll("span");
    const arrow = spans[spans.length - 1];
    return { text: arrow.textContent, rect: arrow.getBoundingClientRect().x, rowRect: row.getBoundingClientRect().x };
  });
  check("occasion arrow points left (RTL forward)", dir.text.trim() === "←", JSON.stringify(dir));
  await page.close();
}

/* ----------------------------------------------- cart count is real */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem(
      "zomoruda-cart",
      JSON.stringify({
        state: {
          lines: [
            {
              key: "k1", productId: "prd-1", slug: "royal-gift-box", nameAr: "بوكس",
              imageUrl: null, unitPrice: 120, quantity: 3, options: [],
              customName: null, cardMessage: null, photoPath: null,
            },
          ],
        },
        version: 0,
      }),
    );
  });
  await page.reload({ waitUntil: "networkidle" });
  const label = await page.getAttribute("[data-testid='cart-button']", "aria-label");
  check("cart count comes from the store", /٣|3/.test(label ?? ""), `label=${label}`);
  await page.close();
}

await browser.close();

const passed = results.filter((r) => r.ok).length;
console.log(`\nInteraction checks: ${passed}/${results.length} passed`);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : `  (${r.detail})`}`);
const failed = results.filter((r) => !r.ok);
if (failed.length) process.exit(1);
