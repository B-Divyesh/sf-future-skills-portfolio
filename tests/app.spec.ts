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

  await expect(page).toHaveTitle(/Future Skills Portfolio/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Make evidence. Not predictions." })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const highImpact = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  expect(highImpact).toEqual([]);
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
  const saved = await page.evaluate(() => localStorage.getItem("future-skills-portfolio:v1"));
  expect(saved).toContain("Map the quietest route");
});

test("legal routes render directly with one h1", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy, by default" })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1, name: "Terms of use" })).toBeVisible();
});

test("390px layout does not overflow horizontally", async ({ page }) => {
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.getByRole("link", { name: "Choose a challenge" }).first().click();
  await expect(page.getByRole("heading", { name: "Choose the next piece of evidence" })).toBeVisible();
});
