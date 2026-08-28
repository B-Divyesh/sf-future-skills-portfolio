import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("the home screen is semantic, quiet in the console, and has no serious axe findings", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  // The preview server mirrors the deployed Azure CSP. Reload after installing
  // the listener so a CSP violation on first paint cannot be missed.
  await page.reload();

  await expect(page).toHaveTitle(/Future Skills Portfolio/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Make evidence. Not predictions." })).toBeVisible();
  const progress = page.locator("progress.progress-track");
  await expect(progress).toHaveCount(2);
  await expect(progress.nth(0)).toHaveAttribute("value", "0");
  await expect(progress.nth(1)).toHaveAttribute("value", "0");
  expect(await progress.evaluateAll((elements) => elements.every((element) => !element.hasAttribute("style")))).toBe(true);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test("a family can inspect a challenge and log reviewable evidence", async ({ page }) => {
  await page.locator(".card-open", { hasText: "Explain a black box" }).click();
  await expect(page.locator(".challenge-detail").getByRole("heading", { name: "Explain a black box" })).toBeVisible();
  await page.getByRole("button", { name: "Log an artifact" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("What did you make?").fill("Two black-box explanations");
  await page.getByLabel("Evidence kept").fill("Eight input-output pairs and two written explanations.");
  await page.getByLabel("Concrete growth observation").fill("The second explanation used one counterexample to rule out an alternative rule.");
  await page.getByLabel("A useful next step").fill("Try a rule with two inputs.");
  await page.getByRole("button", { name: "Save artifact locally" }).click();
  await expect(page.getByText("1 / 4 artifacts")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Two black-box explanations" })).toBeVisible();
});

test("custom challenge creation stays local and requires a reuse license", async ({ page }) => {
  await page.getByLabel("Challenge title").fill("Map the quietest route");
  await page.getByLabel("Build, explain, or critique task").fill("Measure three possible walking routes and explain which one is quietest without recording any people.");
  await page.getByLabel(/Material limits/).fill("Use only a paper map\nTake no photos\nCollect five readings per route");
  await page.getByLabel(/Reflection prompts/).fill("What did quiet mean?\nWhich sample was least reliable?\nWhat would you test next?");
  await page.getByLabel(/I created this challenge/).check();
  await page.getByRole("button", { name: "Add to my shelf" }).click();
  await expect(page.getByText("Map the quietest route").first()).toBeVisible();
  await expect(page.locator("#toast")).toHaveText("Your challenge was added to the shelf.");
  await expect(page.locator("#toast")).toHaveClass(/is-visible/);
  const saved = await page.evaluate(() => localStorage.getItem("future-skills-portfolio:v1"));
  expect(saved).toContain("Map the quietest route");
});

test("a valid imported deck stays local and confirms the successful import", async ({ page }) => {
  const deck = {
    format: "future-skills-deck",
    version: 1,
    exportedAt: new Date().toISOString(),
    challenges: [{
      id: "route-notes",
      title: "Trace a friendly route",
      kicker: "A shared observation challenge",
      ageMin: 10,
      ageMax: 16,
      minutes: 30,
      modes: ["Explain"],
      task: "Compare two routes, then explain the clues that made one route easier to follow.",
      materials: ["Paper", "Pencil"],
      limits: ["No photos", "Use two routes", "Keep one observation per route"],
      reflection: ["Which clue mattered?", "What was ambiguous?", "What would you revise?"],
      rubric: [{ criterion: "Evidence", emerging: "A note", growing: "Two notes", strong: "Compared notes", transferable: "Explained trade-offs" }],
      license: "CC BY 4.0",
    }],
  };
  await page.locator("#deck-import").setInputFiles({
    name: "future-skills-deck.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(deck)),
  });
  await expect(page.getByText("Trace a friendly route").first()).toBeVisible();
  await expect(page.locator("#toast")).toHaveText("1 challenge imported locally.");
  await expect(page.locator("#toast")).toHaveClass(/is-visible/);
  const saved = await page.evaluate(() => localStorage.getItem("future-skills-portfolio:v1"));
  expect(saved).toContain("Trace a friendly route");
});

test("an unlicensed deck is rejected instead of bypassing the reuse safeguard", async ({ page }) => {
  const deck = {
    format: "future-skills-deck",
    version: 1,
    exportedAt: new Date().toISOString(),
    challenges: [{
      id: "unlicensed-route", title: "No license", kicker: "Should not import", ageMin: 10, ageMax: 16, minutes: 30, modes: ["Explain"],
      task: "Compare two routes, then explain the clues that made one route easier to follow.", materials: ["Paper"], limits: ["No photos"], reflection: ["Which clue mattered?"],
      rubric: [{ criterion: "Evidence", emerging: "A note", growing: "Two notes", strong: "Compared notes", transferable: "Explained trade-offs" }],
    }],
  };
  await page.locator("#deck-import").setInputFiles({ name: "unlicensed.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(deck)) });
  await expect(page.locator("#toast")).toHaveText("Every imported challenge needs the supported CC BY 4.0 reuse license.");
  await expect(page.getByText("No license")).toHaveCount(0);
});

test("storage-denied artifact and shelf writes keep work in memory without false success", async ({ page }) => {
  await page.locator(".card-open", { hasText: "Explain a black box" }).click();
  await page.getByRole("button", { name: "Log an artifact" }).click();
  await page.getByLabel("What did you make?").fill("Unsaved explanation");
  await page.getByLabel("Evidence kept").fill("A written rule and examples.");
  await page.getByLabel("Concrete growth observation").fill("The explanation named a test case.");
  await page.getByLabel("A useful next step").fill("Test another rule.");
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "Save artifact locally" }).click();
  await expect(page.getByRole("heading", { name: "Unsaved explanation" })).toBeVisible();
  await expect(page.locator("#toast")).toHaveText("Your browser blocked local storage. Export your work before leaving.");
  await expect(page.locator("#toast")).not.toHaveText("Artifact saved on this device.");
  await page.locator("[data-action='toggle-save']").first().click();
  await expect(page.locator("#toast")).toHaveText("Your browser blocked local storage. Export your work before leaving.");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Unsaved explanation" })).toHaveCount(0);
  await expect(page.getByText("0 / 4 artifacts")).toBeVisible();
});

test("malformed stored members recover to a usable portfolio instead of a blank page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.evaluate(() => localStorage.setItem("future-skills-portfolio:v1", JSON.stringify({ artifacts: [], savedIds: [], customChallenges: [{}] })));
  await page.reload();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Make evidence. Not predictions." })).toBeVisible();
  expect(errors).toEqual([]);
});

test("legal routes render directly with one h1", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy, by default" })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1, name: "Terms of use" })).toBeVisible();
});

test("390px layout reflows at 200% text size while rubric and filters scroll locally", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  const bounds = await page.evaluate(() => [".hero", ".filters"].map((selector) => ({ selector, right: document.querySelector(selector)?.getBoundingClientRect().right ?? 0, client: document.documentElement.clientWidth })));
  expect(bounds.every((item) => item.right <= item.client + 1)).toBe(true);
  const filters = await page.locator(".chip-row").evaluateAll((rows) => rows.map((row) => ({ scroll: row.scrollWidth, client: row.clientWidth })));
  expect(filters.some((row) => row.scroll > row.client)).toBe(true);
  await page.getByRole("link", { name: "Choose a challenge" }).first().click();
  await expect(page.getByRole("heading", { name: "Choose the next piece of evidence" })).toBeVisible();
  await page.locator(".card-open", { hasText: "Explain a black box" }).click();
  const rubric = await page.locator(".challenge-detail .table-wrap").evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));
  expect(rubric.scroll).toBeGreaterThan(rubric.client);
  const afterDetail = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(afterDetail.scroll).toBeLessThanOrEqual(afterDetail.client + 1);
});
