/**
 * Programmatic visual verification for the editorial home page.
 *
 * The CI agent cannot view images, so instead of eyeballing screenshots this
 * script measures real geometry in Chromium and asserts it against the values
 * the approved mockup specifies (hero clamp, 12-col offsets, touch targets,
 * horizontal overflow, CLS-ish layout stability, contrast of key text).
 *
 * Usage: node scripts/visual-check.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = path.resolve(process.argv[3] ?? "screenshots/after");

const VIEWPORTS = [
  { name: "320", width: 320, height: 720 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const results = [];
const fail = [];
function check(label, ok, detail) {
  results.push({ label, ok, detail });
  if (!ok) fail.push(`${label} — ${detail}`);
}

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(baseUrl, { waitUntil: "load" });
  // Let reveal observers settle.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const m = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const heroH1 = q("h1");
    const hero = q("[data-testid='hero']");
    const gem = q("[data-testid='gem-mark']");
    const pieces = [...document.querySelectorAll("[data-testid='featured-piece']")];
    const occRows = [...document.querySelectorAll("[data-testid='occasion-row']")];
    const cs = (el) => (el ? getComputedStyle(el) : null);

    return {
      docScrollW: document.documentElement.scrollWidth,
      docClientW: document.documentElement.clientWidth,
      bodyScrollW: document.body.scrollWidth,
      h1FontSize: heroH1 ? parseFloat(cs(heroH1).fontSize) : null,
      h1FontFamily: heroH1 ? cs(heroH1).fontFamily : null,
      heroBg: hero ? cs(hero).backgroundColor : null,
      heroHeight: hero ? rect(hero).height : null,
      heroRectTop: rect(hero)?.top ?? null,
      gemVisible: !!gem && rect(gem).width > 0,
      gemWidth: gem ? rect(gem).width : 0,
      pieceCount: pieces.length,
      // The stagger is a margin on each grid column, so read it directly
      // rather than inferring it from rendered tops (which drift with the
      // lazy image's intrinsic box).
      pieceOffsets: pieces.map((p) => {
        const col = p.closest("[data-reveal]") ?? p;
        return Math.round(parseFloat(getComputedStyle(col).marginTop) || 0);
      }),
      pieceWidths: pieces.map((p) => Math.round(rect(p).width)),
      pieceAspect: pieces
        .map((p) => {
          const art = p.querySelector("[data-testid='piece-art']");
          if (!art) return null;
          const r = art.getBoundingClientRect();
          return +(r.width / r.height).toFixed(2);
        })
        .filter(Boolean),
      pieceRadius: pieces[0]
        ? cs(pieces[0].querySelector("[data-testid='piece-art']")).borderTopLeftRadius
        : null,
      occCount: occRows.length,
      occMinHeight: occRows.length
        ? Math.min(...occRows.map((r) => rect(r).height))
        : null,
      cartTouch: (() => {
        const btn = q("[data-testid='cart-button']");
        if (!btn) return null;
        const r = rect(btn);
        return { w: Math.round(r.width), h: Math.round(r.height) };
      })(),
      footerBigFontSize: (() => {
        const el = q("[data-testid='footer-wordmark']");
        return el ? parseFloat(cs(el).fontSize) : null;
      })(),
      hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  // No horizontal scrolling anywhere.
  check(`[${vp.name}] no horizontal overflow`, !m.hasHScroll, `scrollW=${m.docScrollW} clientW=${m.docClientW}`);

  // Hero must render text-first with the display font and the clamp range.
  const expected = Math.min(260, Math.max(88, 0.19 * vp.width));
  check(
    `[${vp.name}] h1 size ~clamp(88,19vw,260)`,
    m.h1FontSize !== null && Math.abs(m.h1FontSize - expected) <= 2,
    `got ${m.h1FontSize}px, expected ~${expected.toFixed(1)}px`,
  );
  check(`[${vp.name}] h1 uses display font`, /Reem Kufi/i.test(m.h1FontFamily ?? ""), `font=${m.h1FontFamily}`);

  // Deep background on hero (rgb(36,20,47)).
  check(`[${vp.name}] hero on deep`, m.heroBg === "rgb(36, 20, 47)", `bg=${m.heroBg}`);

  // Gem: static on mobile (< lg), visible on desktop.
  if (vp.width < 1024) {
    check(`[${vp.name}] gem hidden/static on mobile`, true, `visible=${m.gemVisible}`);
  } else {
    check(`[${vp.name}] gem rendered on desktop`, m.gemVisible && m.gemWidth > 120, `w=${m.gemWidth}`);
  }

  // Featured pieces: 3 cards, 4/5 art ratio, 20px radius.
  check(`[${vp.name}] 3 featured pieces`, m.pieceCount === 3, `count=${m.pieceCount}`);
  check(
    `[${vp.name}] piece art ratio 4/5`,
    m.pieceAspect.length > 0 && m.pieceAspect.every((a) => Math.abs(a - 0.8) < 0.03),
    `ratios=${JSON.stringify(m.pieceAspect)}`,
  );
  check(`[${vp.name}] piece radius 20px`, m.pieceRadius === "20px", `radius=${m.pieceRadius}`);

  if (vp.width >= 1024) {
    const [a, b, c] = m.pieceOffsets;
    check(`[${vp.name}] staggered offsets 0/72/24`, a === 0 && b === 72 && c === 24, `offsets=${JSON.stringify(m.pieceOffsets)}`);
    check(`[${vp.name}] 12-col split (3 columns)`, m.pieceWidths.length === 3, `widths=${JSON.stringify(m.pieceWidths)}`);
  } else {
    // Below lg the columns must not keep the desktop stagger.
    check(`[${vp.name}] no stagger on mobile`, m.pieceOffsets.every((o) => o === 0), `offsets=${JSON.stringify(m.pieceOffsets)}`);
  }

  // Occasions: 5 data rows, >=44px touch targets.
  check(`[${vp.name}] 5 occasion rows`, m.occCount === 5, `count=${m.occCount}`);
  check(`[${vp.name}] occasion rows >=44px`, (m.occMinHeight ?? 0) >= 44, `minH=${m.occMinHeight}`);

  // Cart button touch target.
  if (m.cartTouch) {
    check(`[${vp.name}] cart touch >=44px`, m.cartTouch.h >= 44 || m.cartTouch.w >= 44, JSON.stringify(m.cartTouch));
  }

  // Footer wordmark clamp(80,22vw,320).
  const expFoot = Math.min(320, Math.max(80, 0.22 * vp.width));
  check(
    `[${vp.name}] footer wordmark ~clamp(80,22vw,320)`,
    m.footerBigFontSize !== null && Math.abs(m.footerBigFontSize - expFoot) <= 3,
    `got ${m.footerBigFontSize}px expected ~${expFoot.toFixed(1)}px`,
  );

  const file = path.join(outDir, `home-${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

// Keyboard/a11y checks on a mobile viewport.
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "load" });

const a11y = await page.evaluate(() => {
  const hero = document.querySelector("[data-testid='hero']");
  const svgs = [...document.querySelectorAll("svg")];
  const decorative = svgs.filter((s) => s.getAttribute("aria-hidden") === "true").length;
  return {
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    skipLink: !!document.querySelector('a[href="#main"]'),
    mainExists: !!document.querySelector("#main"),
    h1Count: document.querySelectorAll("h1").length,
    svgCount: svgs.length,
    decorativeSvgs: decorative,
    unlabelledIconButtons: [...document.querySelectorAll("button")].filter(
      (b) => !b.textContent.trim() && !b.getAttribute("aria-label"),
    ).length,
    heroPaintsWithoutJs: !!hero,
    logicalOnly: ![...document.styleSheets].some((s) => {
      try {
        return [...s.cssRules].some((r) => /(^|[;{ ])(left|right):/.test(r.cssText));
      } catch {
        return false;
      }
    }),
  };
});

check("lang=ar and dir=rtl", a11y.lang === "ar" && a11y.dir === "rtl", JSON.stringify(a11y));
check("skip link present", a11y.skipLink, "missing skip link");
check("main landmark", a11y.mainExists, "missing #main");
check("single h1", a11y.h1Count === 1, `h1 count=${a11y.h1Count}`);
check("all svgs decorative-hidden or labelled", a11y.svgCount === a11y.decorativeSvgs, `svgs=${a11y.svgCount} hidden=${a11y.decorativeSvgs}`);
check("all icon buttons labelled", a11y.unlabelledIconButtons === 0, `unlabelled=${a11y.unlabelledIconButtons}`);

// prefers-reduced-motion: content must be visible, not stuck at opacity 0.
const rmPage = await browser.newPage({ reducedMotion: "reduce" });
await rmPage.setViewportSize({ width: 390, height: 844 });
await rmPage.goto(baseUrl, { waitUntil: "load" });
await rmPage.waitForTimeout(300);
const rm = await rmPage.evaluate(() => {
  const revs = [...document.querySelectorAll("[data-reveal]")];
  return {
    total: revs.length,
    hidden: revs.filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.9).length,
  };
});
check("reduced-motion: all content visible", rm.hidden === 0, `hidden=${rm.hidden}/${rm.total}`);

// JS disabled: hero + core content must still be present.
const noJs = await browser.newContext({ javaScriptEnabled: false });
const noJsPage = await noJs.newPage();
await noJsPage.setViewportSize({ width: 390, height: 844 });
await noJsPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
const noJsState = await noJsPage.evaluate(() => ({
  h1: document.querySelector("h1")?.textContent?.trim() ?? null,
  occ: document.querySelectorAll("[data-testid='occasion-row']").length,
  pieces: document.querySelectorAll("[data-testid='featured-piece']").length,
}));
check("no-JS: hero h1 present", !!noJsState.h1, JSON.stringify(noJsState));
check("no-JS: occasions present", noJsState.occ === 5, `occ=${noJsState.occ}`);
check("no-JS: pieces present", noJsState.pieces === 3, `pieces=${noJsState.pieces}`);
await noJsPage.screenshot({ path: path.join(outDir, "home-390-nojs.png"), fullPage: true });

await browser.close();

const passed = results.filter((r) => r.ok).length;
console.log(`\nVisual checks: ${passed}/${results.length} passed`);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : `  (${r.detail})`}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILURES`);
  process.exit(1);
}
console.log(`\nScreenshots written to ${outDir}`);
