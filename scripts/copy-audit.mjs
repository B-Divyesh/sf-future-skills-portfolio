import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const url = process.env.COPY_AUDIT_URL ?? "http://127.0.0.1:4173/";
const banned = ["leverage", "seamless", "effortless", "robust", "powerful", "intuitive", "reimagine", "supercharge", "unlock", "delightful", "journey", "ecosystem", "AI-powered"];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
const copy = await page.locator("main").innerText();
await browser.close();

const sentences = [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(copy)]
  .map(({ segment }) => segment.replace(/\s+/g, " ").trim())
  .filter(Boolean);
const rows = sentences.map((sentence, index) => {
  const count = sentence.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const flags = [];
  if (count > 22) flags.push("over 22 words");
  const found = banned.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(sentence));
  if (found.length) flags.push(`banned: ${found.join(", ")}`);
  return `| ${index + 1} | ${count} | ${sentence.replaceAll("|", "\\|").replaceAll("\n", " ")} | ${flags.join("; ") || "—"} |`;
});
const failures = rows.filter((row) => !row.endsWith("— |")).length;
const document = `# Landing copy audit\n\nGenerated from the production-rendered home page at \`${url}\`. Sentences are segmented with \`Intl.Segmenter\`; words use Unicode letter and number tokens.\n\n- Sentences or fragments: ${rows.length}\n- Over 22 words: ${rows.filter((row) => row.includes("over 22 words")).length}\n- Banned-word matches: ${rows.filter((row) => row.includes("banned:" )).length}\n- Result: ${failures ? "FAIL" : "PASS"}\n\n| # | Words | Exact copy | Flag |\n| ---: | ---: | --- | --- |\n${rows.join("\n")}\n\n## Terminology\n\n| Concept | One term used |\n| --- | --- |\n| An activity | challenge |\n| A collection of challenges | deck |\n| One completed challenge note | work record |\n| The collection of work records | portfolio |\n| Build, Explain, Critique, Model, Debug, or Collaborate | skill mode |\n`;
await writeFile(new URL("../.factory/copy-audit.md", import.meta.url), document);
if (failures) process.exitCode = 1;
