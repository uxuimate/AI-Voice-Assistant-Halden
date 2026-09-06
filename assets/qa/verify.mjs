import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = (...p) => path.join(__dirname, ...p);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (err) => console.log("PAGEERROR", err.message));

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

assert.equal(await page.locator("#signature").count(), 0);
await page.screenshot({ path: out("v7-hero.png"), fullPage: false });

await page.locator("#problem").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: out("v7-problem.png"), fullPage: false });

await page.locator("#how").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: out("v7-how.png"), fullPage: false });

await page.locator("#savings").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const before = await page.locator("#save-net").innerText();
await page.fill("#save-calls", "50");
await page.fill("#save-value", "120");
const after = await page.locator("#save-net").innerText();
assert.notEqual(before, after, "calculator should update");
await page.screenshot({ path: out("v7-savings.png"), fullPage: false });

await page.locator("#pricing").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: out("v7-pricing.png"), fullPage: false });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: out("v7-mobile-hero.png"), fullPage: false });

await browser.close();
console.log({ before, after, ok: true });
