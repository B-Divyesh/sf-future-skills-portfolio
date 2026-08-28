import { readFile, stat } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const REAL_KEY = "future-skills-portfolio:v1";
const DEMO_KEY = "demo:future-skills-portfolio:v1";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/?demo=1");
});

test("@claim:demo-isolation sample work is ready and cannot change real work", async ({ page }) => {
  const realValue = JSON.stringify({ artifacts: [], customChallenges: [], savedIds: ["explain-black-box"] });
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [REAL_KEY, realValue]);
  await page.reload();

  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator(".artifact-list > li")).toHaveCount(4);
  await expect(page.getByText("4 / 4 artifacts")).toBeVisible();
  await page.getByRole("button", { name: "Remove The one-sheet bridge from print deck" }).first().click();
  expect(await page.evaluate((key) => localStorage.getItem(key), REAL_KEY)).toBe(realValue);
  expect(await page.evaluate((key) => localStorage.getItem(key), DEMO_KEY)).not.toBeNull();

  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator(".artifact-list > li")).toHaveCount(4);
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  expect(await page.evaluate((key) => localStorage.getItem(key), REAL_KEY)).toBe(realValue);
  expect(await page.evaluate((key) => localStorage.getItem(key), DEMO_KEY)).toBeNull();
});

test("@claim:offline-reload the demo reloads after the network is disabled", async ({ page, context }) => {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator(".artifact-list > li")).toHaveCount(4);
  await expect(page.getByText(/You’re offline/)).toBeVisible();
});

test("@claim:private-free-use a complete demo flow sends requests only to this site", async ({ page }) => {
  const origins = new Set<string>();
  page.on("request", (request) => origins.add(new URL(request.url()).origin));
  await page.reload();
  await page.getByRole("button", { name: "Show Explain challenges" }).click();
  await page.getByRole("button", { name: /Open challenge: Explain a black box/ }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect([...origins]).toEqual(["http://127.0.0.1:4173"]);
  await expect(page.locator('input[type="email"], input[type="password"], input[accept^="image"]')).toHaveCount(0);
});

test("@claim:checkout-disabled no purchase action is shown while hosted checkout is unavailable", async ({ page }) => {
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /buy|purchase|checkout/i })).toHaveCount(0);
  await expect(page.getByText("$19", { exact: false })).toHaveCount(0);
});

test("@claim:included-deck includes eight free challenges, six skill modes, and a four-row rubric", async ({ page }) => {
  await expect(page.locator(".challenge-card")).toHaveCount(8);
  for (const mode of ["Build", "Explain", "Critique", "Model", "Debug", "Collaborate"]) {
    await expect(page.getByRole("button", { name: `Show ${mode} challenges` })).toBeVisible();
  }
  await expect(page.locator(".challenge-detail tbody tr")).toHaveCount(4);
});

test("@claim:print-results prints one selected challenge or every challenge in the print deck", async ({ page }) => {
  await page.getByRole("button", { name: "Start for real" }).click();
  await page.evaluate(() => { window.print = () => undefined; });
  await expect(page.getByRole("button", { name: "Print selected challenge" })).toBeVisible();
  await page.getByRole("button", { name: "Print selected challenge" }).click();
  await expect(page.locator(".print-sheet")).toHaveCount(1);

  await page.goto("/?demo=1");
  await page.evaluate(() => { window.print = () => undefined; });
  await expect(page.getByRole("button", { name: "Print deck (4)" })).toBeVisible();
  await page.getByRole("button", { name: "Print deck (4)" }).click();
  await expect(page.locator(".print-sheet")).toHaveCount(4);
});

test("@claim:portfolio-export exports all four sample artifacts as JSON", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export portfolio JSON" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  expect(payload.format).toBe("future-skills-portfolio");
  expect(payload.artifacts).toHaveLength(4);
});

test("@claim:deck-export exports the selected challenge deck with reuse licenses", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export print deck" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  expect(payload.format).toBe("future-skills-deck");
  expect(payload.challenges).toHaveLength(4);
  expect(payload.challenges.every((challenge: { license?: string }) => challenge.license === "CC BY 4.0")).toBe(true);
});

test("@claim:licensed-import accepts CC BY 4.0 decks and rejects files without that license", async ({ page }) => {
  const challenge = {
    id: "sample-import", title: "Check a map legend", kicker: "Explain symbols clearly", ageMin: 10, ageMax: 16, minutes: 30, modes: ["Explain"],
    task: "Make a small map legend, ask a partner to use it, and revise one unclear symbol.", materials: ["Paper"], limits: ["No photos"], reflection: ["What changed?"],
    rubric: [{ criterion: "Evidence", emerging: "A mark", growing: "A note", strong: "A revision", transferable: "A tested revision" }],
  };
  const file = (licensed: boolean) => ({
    name: "deck.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ format: "future-skills-deck", version: 1, exportedAt: new Date().toISOString(), challenges: [{ ...challenge, ...(licensed ? { license: "CC BY 4.0" } : {}) }] })),
  });
  await page.locator("#deck-import").setInputFiles(file(false));
  await expect(page.locator("#toast")).toHaveText("Every imported challenge needs the supported CC BY 4.0 reuse license.");
  await expect(page.getByText("Check a map legend")).toHaveCount(0);
  await page.locator("#deck-import").setInputFiles(file(true));
  await expect(page.getByText("Check a map legend").first()).toBeVisible();
});

test("@claim:routing-metadata real routes set titles, focus destinations, and a styled not-found state", async ({ page }) => {
  await expect(page).toHaveTitle("Demo — Future Skills Portfolio");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://future-skills-portfolio.sociobot.in/demo");
  await page.getByRole("navigation").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveTitle("Privacy — Future Skills Portfolio");
  await expect(page.locator(":focus")).toHaveText("How your work stays private");
  await page.goBack();
  await expect(page).toHaveTitle("Demo — Future Skills Portfolio");
  await expect(page.locator(":focus")).toHaveText("Build a portfolio of math and computing work");
  await page.goForward();
  await expect(page).toHaveTitle("Privacy — Future Skills Portfolio");
  await expect(page.locator(":focus")).toHaveText("How your work stays private");
  await page.goto("/?demo=1");
  await page.getByRole("link", { name: "Browse free challenges" }).click();
  await expect(page.locator(":focus")).toHaveText("Choose a printable challenge");
  await page.goto("/terms");
  await expect(page).toHaveTitle("Terms — Future Skills Portfolio");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://future-skills-portfolio.sociobot.in/terms");
  await page.goto("/missing-challenge");
  await expect(page).toHaveTitle("Page not found — Future Skills Portfolio");
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});

test("@claim:local-authoring saves a family challenge only inside the demo namespace", async ({ page }) => {
  await page.getByLabel("Challenge title").fill("Map the quietest route");
  await page.getByLabel("Build, explain, or critique task").fill("Compare three walking routes and explain which route has the least traffic noise.");
  await page.getByLabel(/Material limits/).fill("Use a paper map\nTake no photos\nMake five observations");
  await page.getByLabel(/Reflection prompts/).fill("What did quiet mean?\nWhich sample was weakest?\nWhat would you test next?");
  await page.getByLabel(/I made this challenge/).check();
  await page.getByRole("button", { name: "Add to print deck" }).click();
  await expect(page.getByText("Map the quietest route").first()).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), REAL_KEY)).toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), DEMO_KEY)).toContain("Map the quietest route");
});

test("@claim:static-build ships a framework-free local asset bundle within its stated budgets", async ({ page }) => {
  const html = await readFile("dist/index.html", "utf8");
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const license = await readFile("LICENSE", "utf8");
  const jsPath = html.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1];
  const cssPath = html.match(/href="(\/assets\/index-[^"]+\.css)"/)?.[1];
  expect(jsPath).toBeTruthy();
  expect(cssPath).toBeTruthy();
  expect((await stat(`dist${jsPath}`)).size).toBeLessThanOrEqual(200_000);
  expect((await stat(`dist${cssPath}`)).size).toBeLessThanOrEqual(50_000);
  expect(packageJson.engines.node).toBe(">=20");
  expect(license).toContain("MIT License");
  expect(await page.locator('script[src^="http"], link[rel="stylesheet"][href^="http"]').count()).toBe(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
});
