import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const base = process.argv[2] ?? "https://future-skills-portfolio.sociobot.in";
const evidence = process.argv[3] ?? ".factory/evidence/polish-3/live";
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hostIsLive = new URL(base).hostname === "future-skills-portfolio.sociobot.in";
const results = { base, checkedAt: new Date().toISOString(), routes: {}, requests: [], axe: {}, mobile: {}, touchTargets: {}, offline: {}, demo: {}, portfolioImport: {}, focus: {}, externalLink: {} };
await mkdir(evidence, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: "block" });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => results.requests.push(request.url()));

await page.goto(`${base}/?cold=polish-3`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
assert(await page.title() === "Future Skills Portfolio — Printable math challenges", "home title mismatch");
assert(await page.locator("h1").innerText() === "Build a portfolio of math and computing work", "home heading mismatch");
assert(await page.getByRole("link", { name: "Try it with sample data" }).isVisible(), "sample action missing");
assert(await page.getByText("Works offline after one visit.").isVisible(), "tested offline fact missing from the first screen");
assert(await page.locator('a[href*="/checkout"]').count() === 0, "checkout link still visible");
await page.screenshot({ path: `${evidence}/home-cold-desktop.png`, fullPage: true });
const homeCopy = await page.locator("main").innerText();
for (const removed of ["six-week", "Log an artifact", "reviewable work", "No AI scoring"]) assert(!homeCopy.includes(removed), `obsolete copy remains: ${removed}`);
const ccLink = page.getByRole("link", { name: "CC BY 4.0 (opens Creative Commons)" });
const ccHref = await ccLink.getAttribute("href");
assert(ccHref === "https://creativecommons.org/licenses/by/4.0/", "external CC link is missing or unclear");
const ccResponse = await context.request.get(ccHref);
assert(ccResponse.ok(), `Creative Commons link returned ${ccResponse.status()}`);
results.externalLink = { label: await ccLink.innerText(), href: ccHref, status: ccResponse.status() };

for (const [path, title] of [["/", "Future Skills Portfolio — Printable math challenges"], ["/demo", "Demo — Future Skills Portfolio"], ["/privacy", "Privacy — Future Skills Portfolio"], ["/terms", "Terms — Future Skills Portfolio"], ["/missing-challenge", "Page not found — Future Skills Portfolio"]]) {
  const response = await page.goto(`${base}${path}?cold=polish-3`, { waitUntil: "networkidle" });
  const status = response?.status() ?? 0;
  results.routes[path] = { status, title: await page.title(), h1: await page.locator("h1").innerText(), canonical: await page.locator('link[rel="canonical"]').getAttribute("href") };
  assert(await page.title() === title, `${path} title mismatch`);
  assert(await page.locator("h1").count() === 1, `${path} must have one h1`);
  assert(Boolean(await page.locator('meta[name="description"]').getAttribute("content")), `${path} description missing`);
  assert(Boolean(await page.locator('meta[property="og:title"]').getAttribute("content")), `${path} Open Graph title missing`);
  assert(Boolean(await page.locator('meta[name="twitter:title"]').getAttribute("content")), `${path} Twitter title missing`);
  assert(path === "/missing-challenge" ? status === (hostIsLive ? 404 : 200) : status === 200, `${path} status mismatch: ${status}`);
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
  results.axe[path] = serious.length;
  assert(serious.length === 0, `${path} has serious axe findings`);
}

await page.goto(`${base}/?cold=focus-polish-3`, { waitUntil: "networkidle" });
await page.getByRole("navigation").getByRole("link", { name: "Privacy" }).click();
assert(await page.locator(":focus").innerText() === "How your work stays private", "route click did not focus the privacy heading");
await page.goBack();
assert(await page.locator(":focus").innerText() === "Build a portfolio of math and computing work", "back navigation did not focus the home heading");
results.focus = { privacyClick: true, back: true };

await page.goto(`${base}/?cold=polish-3`, { waitUntil: "networkidle" });
const sentinel = JSON.stringify({ artifacts: [], customChallenges: [], savedIds: ["explain-black-box"] });
await page.evaluate(([key, value]) => localStorage.setItem(key, value), ["future-skills-portfolio:v1", sentinel]);
await page.getByRole("link", { name: "Try it with sample data" }).click();
assert(await page.title() === "Demo — Future Skills Portfolio", "demo title mismatch");
assert(await page.locator(".artifact-list > li").count() === 4, "demo does not have four work records");
await page.getByRole("button", { name: "Remove The one-sheet bridge from print deck" }).first().click();
assert(await page.evaluate((key) => localStorage.getItem(key), "future-skills-portfolio:v1") === sentinel, "demo changed real storage");
await page.getByRole("button", { name: "Reset demo" }).click();
assert(await page.locator(".artifact-list > li").count() === 4, "demo reset failed");
assert(await page.getByRole("button", { name: "Add to print deck" }).count() > 0, "visible print-deck action is not result-naming");
const importedRecord = { id: "live-restored-record", challengeId: "explain-black-box", title: "Restored live portfolio note", completedOn: "2026-08-28", evidence: "A rule table and test case.", observation: "The note records the test that ruled out a second rule.", nextStep: "Try a two-input rule.", reviewer: "Adult", scores: { "Reasoning trail": 3, "Explain craft": 3, Judgment: 3, Reflection: 3 }, createdAt: "2026-08-28T12:00:00.000Z" };
await page.locator("#portfolio-import").setInputFiles({ name: "portfolio.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ format: "future-skills-portfolio", version: 1, exportedAt: new Date().toISOString(), artifacts: [importedRecord], customChallenges: [], savedIds: ["explain-black-box"] })) });
assert(await page.getByRole("dialog", { name: "Import portfolio JSON" }).isVisible(), "portfolio import preview is missing");
await page.getByRole("button", { name: "Merge 1 work record" }).click();
assert(await page.locator(".artifact-list > li").count() === 5, "portfolio merge did not add the imported record");
assert(await page.evaluate((key) => localStorage.getItem(key), "future-skills-portfolio:v1") === sentinel, "portfolio import changed real storage");
results.portfolioImport = { preview: true, mergedRecords: 1, realBytesUnchanged: true };
await page.getByRole("button", { name: "Reset demo" }).click();
assert(await page.locator(".artifact-list > li").count() === 4, "demo reset did not remove imported test data");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/?demo=1&cold=first-viewport-polish-3`, { waitUntil: "networkidle" });
assert(await page.locator("h1").innerText() === "Inspect four completed work records", "demo starts with the wrong heading");
assert(await page.locator(".demo-progress").evaluate((element) => element.getBoundingClientRect().top < innerHeight), "demo progress is below the first viewport");
assert(await page.locator(".demo-records > li").count() === 2, "demo preview needs two work records");
assert(await page.locator(".demo-records > li").evaluateAll((elements) => elements.every((element) => { const box = element.getBoundingClientRect(); return box.top < innerHeight && box.bottom > 0; })), "sample work records are not in the first viewport");
await page.waitForTimeout(4300);
await page.screenshot({ path: `${evidence}/demo-cold-mobile.png`, fullPage: true });
await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
results.mobile = dimensions;
assert(dimensions.scrollWidth <= dimensions.clientWidth + 1, "mobile page overflows at 200% text");
await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
await page.getByRole("button", { name: "Start for real" }).click();
assert(await page.evaluate((key) => localStorage.getItem(key), "demo:future-skills-portfolio:v1") === null, "demo key remains after exit");
assert(await page.evaluate((key) => localStorage.getItem(key), "future-skills-portfolio:v1") === sentinel, "real state changed after demo exit");
results.demo = { workRecords: 4, firstViewportRecords: 2, reset: true, realBytesUnchanged: true, discardedOnExit: true };
const unexpectedErrors = errors.filter((message) => !message.includes("server responded with a status of 404"));
assert(unexpectedErrors.length === 0, `browser errors: ${unexpectedErrors.join(" | ")}`);

const observedOrigins = [...new Set(results.requests.map((url) => new URL(url).origin))];
assert(observedOrigins.every((origin) => origin === new URL(base).origin), `unexpected request origins: ${observedOrigins.join(", ")}`);

const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
const touchPage = await touchContext.newPage();
for (const path of ["/", "/?demo=1", "/privacy", "/terms"]) {
  await touchPage.goto(`${base}${path}${path.includes("?") ? "&" : "?"}cold=touch-polish-3`, { waitUntil: "networkidle" });
  const undersized = await touchPage.locator("a, button").evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && box.width > 0 && box.height > 0;
    })
    .map((element) => {
      const box = element.getBoundingClientRect();
      return { label: (element.getAttribute("aria-label") || element.textContent || "").trim(), width: Math.round(box.width), height: Math.round(box.height) };
    })
    .filter((target) => target.width < 44 || target.height < 44));
  assert(undersized.length === 0, `${path} has undersized touch targets: ${JSON.stringify(undersized)}`);
  results.touchTargets[path] = { undersized };
}
await touchContext.close();

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${base}/?demo=1&cold=offline-polish-3`, { waitUntil: "networkidle" });
await offlinePage.evaluate(async () => { await navigator.serviceWorker.ready; });
await offlinePage.reload({ waitUntil: "networkidle" });
await offlineContext.setOffline(true);
await offlinePage.reload({ waitUntil: "domcontentloaded" });
results.offline = { title: await offlinePage.title(), workRecords: await offlinePage.locator(".artifact-list > li").count(), statusVisible: await offlinePage.getByText(/You’re offline/).isVisible() };
assert(results.offline.title === "Demo — Future Skills Portfolio", "offline demo title mismatch");
assert(results.offline.workRecords === 4 && results.offline.statusVisible, "offline demo did not reload completely");
await offlineContext.close();
await context.close();
await browser.close();

results.errors = unexpectedErrors;
results.requestOrigins = observedOrigins;
await writeFile(`${evidence}/live-audit.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
