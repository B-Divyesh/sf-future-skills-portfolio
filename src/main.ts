import "./styles.css";
import { captureLicense, hasOptimisticUnlock, verifyLicense } from "./billing";
import { challenges, freeChallenges } from "./data";
import { DEMO_STORAGE_KEY, freshDemoState } from "./demo";
import { downloadJson, loadState, makeDeck, makePortfolio, parseDeck, parsePortfolio, REUSE_LICENSE, saveState, uniqueById } from "./storage";
import { modes, type Artifact, type Challenge, type PortfolioState, type SkillMode } from "./types";

const app = document.querySelector<HTMLDivElement>("#app") as HTMLDivElement;
if (!app) throw new Error("Application root is missing");

const BUILD_ID = "polish-3";
const PRODUCT = "Future Skills Portfolio";
const ORIGIN = "https://future-skills-portfolio.sociobot.in";

type Route = { page: "home" | "privacy" | "terms" | "not-found"; demo: boolean };

function readRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const demo = path === "/demo" || (path === "/" && new URLSearchParams(window.location.search).get("demo") === "1");
  if (demo) return { page: "home", demo: true };
  if (path === "/") return { page: "home", demo: false };
  if (path === "/privacy") return { page: "privacy", demo: false };
  if (path === "/terms") return { page: "terms", demo: false };
  return { page: "not-found", demo: false };
}

let route = readRoute();
if (!route.demo) captureLicense();

function demoState(): PortfolioState {
  try {
    if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
      const seeded = freshDemoState();
      saveState(seeded, localStorage, DEMO_STORAGE_KEY);
      return seeded;
    }
  } catch {
    return freshDemoState();
  }
  return loadState(localStorage, DEMO_STORAGE_KEY);
}

let state = route.demo ? demoState() : loadState();
let unlocked = !route.demo && hasOptimisticUnlock();
let selectedId = state.savedIds[0] ?? freeChallenges[0]?.id ?? "";
let modeFilter: SkillMode | "All" = "All";
let ageFilter: "All" | "10–12" | "13–16" = "All";
let online = navigator.onLine;
let lastFocus: HTMLElement | null = null;
let pendingPortfolioImport: PortfolioState | null = null;

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
const allChallenges = (): Challenge[] => uniqueById([...(unlocked && !route.demo ? challenges : freeChallenges), ...state.customChallenges]);
const byId = (id: string): Challenge | undefined => allChallenges().find((challenge) => challenge.id === id);

function modeMark(mode: SkillMode): string {
  const paths: Record<SkillMode, string> = {
    Build: '<path d="M4 15h7V8H4v7Zm9 5h7v-7h-7v7Zm0-18v8h7V2h-7Z"/>',
    Explain: '<path d="M3 4h18v13H9l-5 4v-4H3V4Zm4 5h10M7 13h7"/>',
    Critique: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 4v12"/>',
    Model: '<path d="M3 20h18M4 20V3m3 13 4-5 4 2 5-8"/>',
    Debug: '<path d="M8 8h8v10H8zM10 4h4M4 11h4m8 0h4M5 18l3-2m11 2-3-2"/>',
    Collaborate: '<circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="4"/><path d="M2 21c0-4 2-7 6-7m14 7c0-4-2-7-6-7M8 18h8"/>',
  };
  return `<svg class="mode-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[mode]}</svg>`;
}

const modePill = (mode: SkillMode): string => `<span class="mode-pill">${modeMark(mode)}${mode}</span>`;
const workspaceHref = (hash = ""): string => `${route.demo ? "/?demo=1" : "/"}${hash}`;

function header(): string {
  return `<header class="site-header screen-only">
    <a class="wordmark" href="${workspaceHref()}" aria-label="Future Skills Portfolio home"><span class="wordmark-mark" aria-hidden="true"></span><span>Future Skills<br><b>Portfolio</b></span></a>
    <nav aria-label="Main navigation"><a href="/?demo=1">Demo</a><a href="${workspaceHref("#deck")}">Challenges</a><a href="${workspaceHref("#portfolio")}">Portfolio</a><a href="/privacy">Privacy</a></nav>
  </header>`;
}

function footer(): string {
  return `<footer class="site-footer screen-only">
    <div><a class="wordmark footer-mark" href="${workspaceHref()}"><span class="wordmark-mark" aria-hidden="true"></span><span>Future Skills Portfolio</span></a><p>Printable math and computing challenges for ages 10–16.</p></div>
    <div><p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p><p>Built by Param Factory · ${BUILD_ID}</p><p>Original generated hero image.</p></div>
  </footer>`;
}

function shell(content: string): string {
  return `${route.demo ? demoBanner() : ""}${header()}${content}${footer()}<div id="route-status" class="sr-only" role="status" aria-live="polite"></div>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner screen-only" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Four sample work records are ready to inspect.</span><div><button type="button" data-action="reset-demo">Reset demo</button><button type="button" data-action="start-real">Start for real</button></div></aside>`;
}

function legalPage(kind: "privacy" | "terms"): string {
  const privacy = `<p class="eyebrow">Plain-language policy</p><h1 tabindex="-1">How your work stays private</h1><p class="lede">Your family’s work stays under your control.</p>
    <h2>What this site stores</h2><p>The site stores challenge choices, custom challenges, work records, and rubric scores in this browser. It needs no user account.</p>
    <h2>What leaves your device</h2><p>Free and demo use sends no data to another site. This release offers no checkout.</p>
    <h2>Offline use and exports</h2><p>The site works offline after one online visit. Exports are files that you choose to save. Review an export before sharing because it contains your notes.</p>
    <h2>Children</h2><p>Adults should avoid names and other sensitive details in work records.</p>
    <h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p><p class="policy-date">Effective 28 August 2026</p>`;
  const terms = `<p class="eyebrow">Use terms</p><h1 tabindex="-1">Terms of use</h1><p class="lede">Use these challenges for family, co-op, or classroom learning.</p>
    <h2>Using the challenges</h2><p>You may print and adapt the included challenges. Adults remain responsible for supervision and safe materials. Rubrics support conversation, not standardized assessment.</p>
    <h2>Your challenges</h2><p>You confirm that shared challenges may use the CC BY 4.0 license. Every exported challenge keeps that license. You choose who receives each file.</p>
    <h2>Availability and outcomes</h2><p>The included challenges work without a license. The product makes no promise about education or careers.</p>
    <h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> with terms questions.</p><p class="policy-date">Effective 28 August 2026</p>`;
  return shell(`<main id="main" class="legal"><a class="back-link" href="/">← Back to the portfolio</a><article>${kind === "privacy" ? privacy : terms}</article></main>`);
}

function notFoundPage(): string {
  return shell(`<main id="main" class="not-found"><div class="lost-mark" aria-hidden="true">404</div><p class="eyebrow">This slab has no challenge</p><h1 tabindex="-1">Page not found</h1><p>The address may be old or mistyped.</p><a class="button primary" href="/">Return home</a></main>`);
}

function challengeCard(challenge: Challenge): string {
  const saved = state.savedIds.includes(challenge.id);
  const completed = state.artifacts.some((artifact) => artifact.challengeId === challenge.id);
  const title = escapeHtml(challenge.title);
  return `<li class="challenge-card ${selectedId === challenge.id ? "is-selected" : ""}">
    <button class="card-open" type="button" data-action="select" data-id="${challenge.id}" aria-label="Open challenge: ${title}" aria-pressed="${selectedId === challenge.id}">
      <span class="card-top"><span class="card-number">${challenge.custom ? "Made here" : `No. ${String(allChallenges().indexOf(challenge) + 1).padStart(2, "0")}`}</span>${completed ? '<span class="fired">● Logged</span>' : ""}</span>
      <span class="card-kicker">${escapeHtml(challenge.kicker)}</span><strong>${title}</strong>
      <span class="card-meta">Ages ${challenge.ageMin}–${challenge.ageMax} · ${challenge.minutes} min</span><span class="pill-row">${challenge.modes.map(modePill).join("")}</span>
    </button>
    <button class="save-pin" type="button" data-action="toggle-save" data-id="${challenge.id}" aria-label="${saved ? "Remove" : "Add"} ${title} ${saved ? "from" : "to"} print deck" aria-pressed="${saved}">${saved ? "Remove from print deck" : "Add to print deck"}</button>
  </li>`;
}

function rubricTable(challenge: Challenge, inputs = false): string {
  return `<div class="table-wrap" role="region" aria-label="${inputs ? "Artifact score choices" : "Challenge review rubric"}" tabindex="0"><table><caption>${inputs ? "Choose one level for each criterion" : "Adult or peer review rubric"}</caption><thead><tr><th scope="col">Look for</th><th scope="col">1 · Emerging</th><th scope="col">2 · Growing</th><th scope="col">3 · Strong</th><th scope="col">4 · Transferable</th></tr></thead><tbody>${challenge.rubric.map((row, rowIndex) => `<tr><th scope="row">${escapeHtml(row.criterion)}</th>${([row.emerging, row.growing, row.strong, row.transferable]).map((description, score) => `<td>${inputs ? `<label class="score-choice"><input type="radio" name="score-${rowIndex}" value="${score + 1}" ${score === 2 ? "checked" : ""}><span>${score + 1}</span></label>` : ""}<span>${escapeHtml(description)}</span></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function challengeDetail(challenge: Challenge): string {
  const saved = state.savedIds.includes(challenge.id);
  return `<article class="challenge-detail" aria-labelledby="detail-title"><div class="detail-heading"><div><p class="eyebrow">${challenge.custom ? "Your challenge" : "Challenge"}</p><h3 id="detail-title">${escapeHtml(challenge.title)}</h3><p>${escapeHtml(challenge.kicker)}</p></div><span class="duration">${challenge.minutes}<small>min</small></span></div>
    <div class="pill-row">${challenge.modes.map(modePill).join("")}</div><h4>The challenge</h4><p class="task-copy">${escapeHtml(challenge.task)}</p>
    <div class="detail-grid"><div><h4>Materials</h4><ul>${challenge.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div><h4>Useful limits</h4><ul>${challenge.limits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></div>
    <h4>Pause and reflect</h4><ol class="reflection-list">${challenge.reflection.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>${rubricTable(challenge)}
    <div class="detail-actions"><button class="button primary" type="button" data-action="log" data-id="${challenge.id}">Save a work record</button><button class="button secondary" type="button" data-action="toggle-save" data-id="${challenge.id}">${saved ? "Remove from print deck" : "Add to print deck"}</button><button class="text-button" type="button" data-action="print-one" data-id="${challenge.id}">Print this challenge</button></div>
  </article>`;
}

function filteredChallenges(): Challenge[] {
  return allChallenges().filter((challenge) => {
    const modeMatch = modeFilter === "All" || challenge.modes.includes(modeFilter);
    const ageMatch = ageFilter === "All" || (ageFilter === "10–12" ? challenge.ageMin <= 12 && challenge.ageMax >= 10 : challenge.ageMin <= 16 && challenge.ageMax >= 13);
    return modeMatch && ageMatch;
  });
}

function deckSection(): string {
  const visible = filteredChallenges();
  const selected = visible.find((challenge) => challenge.id === selectedId) ?? visible[0];
  if (selected && selected.id !== selectedId) selectedId = selected.id;
  return `<section id="deck" class="section deck-section" aria-labelledby="deck-title"><div class="section-heading"><div><p class="eyebrow">Challenge deck</p><h2 id="deck-title" tabindex="-1">Choose a printable challenge</h2></div><p>Choose a skill mode or age range. Each challenge includes materials, limits, reflection, and review.</p></div>
    <div class="filters" aria-label="Filter challenges"><div class="filter-group"><span>Skill mode</span><div class="chip-row">${(["All", ...modes] as const).map((mode) => `<button type="button" class="filter-chip" data-action="filter-mode" data-value="${mode}" aria-label="${mode === "All" ? "Show all challenges" : `Show ${mode} challenges`}" aria-pressed="${modeFilter === mode}">${mode}</button>`).join("")}</div></div>
      <div class="filter-group"><span>Age</span><div class="chip-row">${(["All", "10–12", "13–16"] as const).map((age) => `<button type="button" class="filter-chip" data-action="filter-age" data-value="${age}" aria-label="${age === "All" ? "Show challenges for all ages" : `Show challenges for ages ${age}`}" aria-pressed="${ageFilter === age}">${age}</button>`).join("")}</div></div></div>
    <p class="results-count" aria-live="polite">Showing ${visible.length} ${visible.length === 1 ? "challenge" : "challenges"}</p>
    ${visible.length ? `<div class="deck-layout"><ul class="challenge-list">${visible.map(challengeCard).join("")}</ul>${selected ? challengeDetail(selected) : ""}</div>` : `<div class="empty-state"><span aria-hidden="true">◯</span><h3>No challenge fits both filters</h3><p>Choose another age or skill mode.</p><button class="button secondary" type="button" data-action="clear-filters">Clear filters</button></div>`}</section>`;
}

function howSection(): string {
  return `<section class="section how-section" aria-labelledby="how-title"><div class="section-heading"><div><p class="eyebrow">How it works</p><h2 id="how-title" tabindex="-1">Complete a challenge and review the work</h2></div><p>Use the same short cycle for each activity.</p></div><ol class="work-steps"><li><span>01</span><h3>Choose a challenge</h3><p>Pick an age range and skill mode.</p></li><li><span>02</span><h3>Make and review</h3><p>Keep the work, then use the adult or peer rubric.</p></li><li><span>03</span><h3>Save a work record</h3><p>Record the evidence, one observation, and a next step.</p></li></ol></section>`;
}

function privacySection(): string {
  return `<section class="section boundaries-section" aria-labelledby="boundaries-title"><div><p class="eyebrow">Private by design</p><h2 id="boundaries-title" tabindex="-1">Your family controls the work</h2></div><ul><li>Portfolio notes stay in this browser unless you export them.</li><li>Free and demo use needs no account.</li><li>Free and demo use sends no data to another site.</li></ul><a href="/privacy">Read the privacy policy</a></section>`;
}

function demoOverview(): string {
  const completedModes = new Set(state.artifacts.flatMap((artifact) => byId(artifact.challengeId)?.modes ?? []));
  const samples = state.artifacts.slice(0, 2);
  return `<section class="demo-overview" aria-labelledby="demo-title"><div class="demo-overview-copy"><p class="eyebrow">Sample portfolio</p><h1 id="demo-title" tabindex="-1">Inspect four completed work records</h1><p>See what was made, what changed, and what to try next.</p></div><div class="demo-progress" aria-label="Sample portfolio summary"><div><strong>${state.artifacts.length} / 4</strong><span>work records</span></div><div><strong>${completedModes.size}</strong><span>skill modes</span></div><a href="/?demo=1#portfolio">Open all four records</a></div><ol class="demo-records">${samples.map((artifact) => `<li><h2>${escapeHtml(artifact.title)}</h2><p>${escapeHtml(artifact.observation)}</p><p><strong>Next:</strong> ${escapeHtml(artifact.nextStep)}</p></li>`).join("")}</ol><div class="demo-overview-actions"><a class="button secondary" href="/?demo=1#deck">Browse challenges</a><button class="text-button" type="button" data-action="print-deck">Print deck (${state.savedIds.length})</button></div></section>`;
}

function portfolioSection(): string {
  const completedModes = new Set(state.artifacts.flatMap((artifact) => byId(artifact.challengeId)?.modes ?? []));
  return `<section id="portfolio" class="section portfolio-section" aria-labelledby="portfolio-title"><div class="section-heading"><div><p class="eyebrow">Portfolio in this browser</p><h2 id="portfolio-title" tabindex="-1">Track completed work in a portfolio</h2></div><p>${route.demo ? "Four sample work records are ready to inspect." : "Save a short record after each completed challenge."}</p></div>
    <div class="progress-plinth"><div class="progress-copy"><p class="progress-label"><strong>${state.artifacts.length}</strong> / 4 work records</p><progress class="progress-track" aria-label="Work records completed" max="4" value="${Math.min(state.artifacts.length, 4)}">${state.artifacts.length} of 4 work records</progress></div><div class="progress-copy"><p class="progress-label"><strong>${completedModes.size}</strong> / 3 skill modes</p><progress class="progress-track" aria-label="Skill modes covered" max="3" value="${Math.min(completedModes.size, 3)}">${completedModes.size} of 3 skill modes</progress></div><p class="privacy-note"><span aria-hidden="true">⌂</span> Stored in this browser</p></div>
    ${state.artifacts.length ? `<ol class="artifact-list">${state.artifacts.map((artifact) => { const challenge = byId(artifact.challengeId); return `<li><div class="artifact-date"><span>${new Date(`${artifact.completedOn}T12:00:00`).toLocaleDateString(undefined, { month: "short" })}</span><strong>${new Date(`${artifact.completedOn}T12:00:00`).getDate()}</strong></div><div><p class="eyebrow">${challenge ? escapeHtml(challenge.title) : "Imported challenge"} · ${artifact.reviewer} review</p><h3>${escapeHtml(artifact.title)}</h3><p>${escapeHtml(artifact.observation)}</p><details><summary>Evidence and next step</summary><p>${escapeHtml(artifact.evidence)}</p><p><strong>Next:</strong> ${escapeHtml(artifact.nextStep)}</p></details></div><button class="icon-button" type="button" data-action="delete-artifact" data-id="${artifact.id}" aria-label="Delete work record ${escapeHtml(artifact.title)}">×</button></li>`; }).join("")}</ol>` : `<div class="empty-state artifact-empty"><span class="empty-vessel" aria-hidden="true"></span><h3>No work records yet</h3><p>Complete a challenge, then record what was made and observed.</p><a class="button secondary" href="${workspaceHref("#deck")}">Choose a challenge</a></div>`}
    <div class="portfolio-actions"><button class="button secondary" type="button" data-action="export-portfolio" ${state.artifacts.length ? "" : "disabled"}>Export portfolio JSON</button><label class="button secondary text-upload">Import portfolio JSON<input id="portfolio-import" type="file" accept="application/json,.json"></label>${state.artifacts.length ? '<button class="text-button danger-link" type="button" data-action="clear-portfolio">Erase local portfolio</button>' : ""}</div></section>`;
}

function makeSection(): string {
  return `<section id="make" class="section make-section" aria-labelledby="make-title"><div class="section-heading"><div><p class="eyebrow">Make your own</p><h2 id="make-title" tabindex="-1">Make a challenge for your family</h2></div><p>Add a task, limits, reflection prompts, and one review rubric.</p></div>
    <div class="maker-layout"><form id="challenge-form" class="maker-form"><div class="field wide"><label for="custom-title">Challenge title</label><input id="custom-title" name="title" required maxlength="70" autocomplete="off"></div><div class="field"><label for="custom-mode">Primary skill mode</label><select id="custom-mode" name="mode">${modes.map((mode) => `<option>${mode}</option>`).join("")}</select></div><div class="field"><label for="custom-age">Age range</label><select id="custom-age" name="age"><option value="10-12">10–12</option><option value="13-16">13–16</option><option value="10-16">10–16</option></select></div><div class="field"><label for="custom-time">Minutes</label><input id="custom-time" name="minutes" type="number" min="15" max="240" step="5" value="45" required></div><div class="field wide"><label for="custom-task">Build, explain, or critique task</label><textarea id="custom-task" name="task" rows="4" required maxlength="600" aria-describedby="task-hint"></textarea><small id="task-hint">Name what to make and what evidence to keep.</small></div><div class="field wide"><label for="custom-limits">Material limits <span>(one per line)</span></label><textarea id="custom-limits" name="limits" rows="3" required maxlength="400"></textarea></div><div class="field wide"><label for="custom-reflection">Reflection prompts <span>(one per line)</span></label><textarea id="custom-reflection" name="reflection" rows="3" required maxlength="400"></textarea></div><label class="check-row wide"><input type="checkbox" name="license" required><span>I made this challenge or can share it under <a href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer">CC BY 4.0 (opens Creative Commons)</a>.</span></label><div class="wide"><button class="button primary" type="submit">Add to print deck</button></div></form>
    <div class="share-panel"><span class="slab-icon" aria-hidden="true">↗</span><h3>Export or import a challenge deck</h3><p>Share a JSON file with another family. An import changes only this browser workspace.</p><button class="button secondary" type="button" data-action="export-deck">Export print deck</button><label class="button text-upload">Import a challenge deck<input id="deck-import" type="file" accept="application/json,.json"></label><p class="microcopy">${state.customChallenges.length} made here · ${state.savedIds.length} in your print deck</p></div></div></section>`;
}

function printArea(ids?: string[]): string {
  const wanted = ids ?? (state.savedIds.length ? state.savedIds : [selectedId]);
  const printable = wanted.map(byId).filter((challenge): challenge is Challenge => Boolean(challenge));
  return `<div class="print-area" aria-hidden="true">${printable.map((challenge) => `<article class="print-sheet"><header><p>Future Skills Portfolio · Ages ${challenge.ageMin}–${challenge.ageMax} · ${challenge.minutes} minutes</p><h2>${escapeHtml(challenge.title)}</h2><p>${escapeHtml(challenge.kicker)} · ${challenge.modes.join(" + ")}</p></header><section><h3>The challenge</h3><p>${escapeHtml(challenge.task)}</p></section><div class="print-columns"><section><h3>Materials</h3><ul>${challenge.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><section><h3>Useful limits</h3><ul>${challenge.limits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section></div><section><h3>Pause and reflect</h3><ol>${challenge.reflection.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>${rubricTable(challenge)}<div class="print-notes"><h3>Observation</h3><span></span><span></span><p>Next experiment:</p><span></span></div><footer>Made for human review · future-skills-portfolio.sociobot.in</footer></article>`).join("")}</div>`;
}

function homePage(): string {
  const printLabel = state.savedIds.length ? `Print deck (${state.savedIds.length})` : "Print selected challenge";
  if (route.demo) return shell(`<div id="connection-status" class="connection-status ${online ? "" : "is-visible"}" role="status">You’re offline. This page and your local portfolio still work.</div><main id="main">${demoOverview()}${portfolioSection()}${deckSection()}${howSection()}${privacySection()}${makeSection()}</main>${printArea()}<div id="dialog-root"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>`);
  return shell(`<div id="connection-status" class="connection-status ${online ? "" : "is-visible"}" role="status">You’re offline. This page and your local portfolio still work.</div><main id="main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Printable challenges · ages 10–16</p><h1 tabindex="-1">Build a portfolio of math and computing work</h1><p class="hero-lede">For families guiding ages 10–16 through printable challenges, reflection, and human review.</p><div class="hero-actions"><div><a class="button primary" href="/?demo=1">Try it with sample data</a><small>Opens four completed work records.</small></div><a class="button secondary" href="${workspaceHref("#deck")}">Browse free challenges</a><button class="text-button print-hero" type="button" data-action="print-deck">${printLabel}</button></div><ul class="hero-facts"><li>8 challenges are free.</li><li>Work stays in this browser.</li><li>Works offline after one visit.</li></ul></div>
      <figure class="hero-art"><picture><source media="(max-width: 720px)" srcset="/assets/hero-ceramic-720.webp"><img src="/assets/hero-ceramic.webp" width="1200" height="800" alt="Four hand-built ceramic forms resting on translucent ice slabs" fetchpriority="high" decoding="async"></picture><figcaption>Four ceramic forms represent four example skills.</figcaption></figure></section>
    <section class="proof-strip" aria-label="What is included"><div><strong>8</strong><span>free challenges</span></div><div><strong>6</strong><span>skill modes</span></div><div><strong>1</strong><span>adult or peer rubric</span></div><div><strong>0</strong><span>required accounts</span></div></section>
    ${howSection()}${deckSection()}${privacySection()}${portfolioSection()}${makeSection()}
  </main>${printArea()}<div id="dialog-root"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>`);
}

function setMetadata(): void {
  const metadata = route.page === "privacy"
    ? { title: `Privacy — ${PRODUCT}`, description: "How Future Skills Portfolio stores work in your browser and handles exports.", path: "/privacy" }
    : route.page === "terms"
      ? { title: `Terms — ${PRODUCT}`, description: "Terms for printing, adapting, and sharing Future Skills Portfolio challenges.", path: "/terms" }
      : route.page === "not-found"
        ? { title: `Page not found — ${PRODUCT}`, description: "This Future Skills Portfolio page does not exist.", path: window.location.pathname }
        : route.demo
          ? { title: `Demo — ${PRODUCT}`, description: "Inspect four sample work records without changing your family’s saved work.", path: "/demo" }
          : { title: `${PRODUCT} — Printable math challenges`, description: "Build a private portfolio with printable math and computing challenges for ages 10–16.", path: "/" };
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", metadata.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `${ORIGIN}${metadata.path}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", metadata.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", metadata.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", `${ORIGIN}${metadata.path}`);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", metadata.description);
}

function syncWorkspace(): void {
  const next = readRoute();
  if (next.demo !== route.demo) {
    state = next.demo ? demoState() : loadState();
    unlocked = !next.demo && hasOptimisticUnlock();
    selectedId = state.savedIds[0] ?? freeChallenges[0]?.id ?? "";
    modeFilter = "All";
    ageFilter = "All";
  }
  route = next;
}

function render(): void {
  syncWorkspace();
  setMetadata();
  app.innerHTML = route.page === "privacy" ? legalPage("privacy") : route.page === "terms" ? legalPage("terms") : route.page === "not-found" ? notFoundPage() : homePage();
  bindEvents();
}

function persist(message: string): boolean {
  const saved = saveState(state, localStorage, route.demo ? DEMO_STORAGE_KEY : undefined);
  if (!saved) {
    requestAnimationFrame(() => toast(route.demo ? "Demo changes could not be kept. Reset the demo to recover." : "Your browser blocked local storage. Export your work before leaving.", true));
    return false;
  }
  requestAnimationFrame(() => toast(message));
  return true;
}

function toast(message: string, error = false): void {
  const element = document.querySelector<HTMLDivElement>("#toast");
  if (!element) return;
  element.textContent = message;
  element.className = `toast is-visible${error ? " is-error" : ""}`;
  window.setTimeout(() => element.classList.remove("is-visible"), 4200);
}

const lines = (value: FormDataEntryValue | null): string[] => String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

function customRubric(mode: SkillMode): Challenge["rubric"] {
  return [
    { criterion: "Evidence", emerging: "Shows a result.", growing: "Keeps some working.", strong: "Connects working to choices.", transferable: "Tests the evidence and its limits." },
    { criterion: `${mode} craft`, emerging: "Makes an attempt.", growing: "Uses a fitting method with help.", strong: "Uses a fitting method independently.", transferable: "Adapts the method after feedback." },
    { criterion: "Judgment", emerging: "Takes the first path.", growing: "Notices one limitation.", strong: "Explains a trade-off.", transferable: "Compares alternatives fairly." },
    { criterion: "Reflection", emerging: "Describes the work.", growing: "Names one change.", strong: "Explains why a revision helped.", transferable: "Proposes a precise next test." },
  ];
}

function showArtifactDialog(challenge: Challenge): void {
  lastFocus = document.activeElement as HTMLElement;
  const root = document.querySelector<HTMLDivElement>("#dialog-root");
  if (!root) return;
  root.innerHTML = `<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="dialog-close" type="button" data-action="close-dialog" aria-label="Close work record form">×</button><p class="eyebrow">Add a work record · ${escapeHtml(challenge.title)}</p><h2 id="dialog-title">Save a work record</h2><form id="artifact-form" data-challenge="${challenge.id}"><div class="field"><label for="artifact-title">What did you make?</label><input id="artifact-title" name="title" required maxlength="90"></div><div class="form-two"><div class="field"><label for="artifact-date">Completed on</label><input id="artifact-date" name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div><div class="field"><label for="artifact-reviewer">Reviewed by</label><select id="artifact-reviewer" name="reviewer"><option>Adult</option><option>Peer</option><option>Self</option></select></div></div><div class="field"><label for="artifact-evidence">Evidence kept</label><textarea id="artifact-evidence" name="evidence" rows="3" required></textarea></div><div class="field"><label for="artifact-observation">Concrete growth observation</label><textarea id="artifact-observation" name="observation" rows="3" required aria-describedby="observation-hint"></textarea><small id="observation-hint">Describe something visible in the work, not a trait.</small></div><div class="field"><label for="artifact-next">A useful next step</label><textarea id="artifact-next" name="next" rows="2" required></textarea></div>${rubricTable(challenge, true)}<button class="button primary" type="submit">Save work record locally</button></form></section></div>`;
  root.querySelector<HTMLInputElement>("#artifact-title")?.focus();
  bindDialogEvents();
}

function closeDialog(): void {
  const root = document.querySelector<HTMLDivElement>("#dialog-root");
  if (root) root.innerHTML = "";
  pendingPortfolioImport = null;
  lastFocus?.focus();
}

function workRecordLabel(count: number): string {
  return `${count} ${count === 1 ? "work record" : "work records"}`;
}

function showPortfolioImportDialog(imported: PortfolioState): void {
  lastFocus = document.activeElement as HTMLElement;
  pendingPortfolioImport = imported;
  const root = document.querySelector<HTMLDivElement>("#dialog-root");
  if (!root) return;
  const currentIds = new Set(state.artifacts.map((artifact) => artifact.id));
  const newRecords = imported.artifacts.filter((artifact) => !currentIds.has(artifact.id)).length;
  const duplicateRecords = imported.artifacts.length - newRecords;
  const currentCustomIds = new Set(state.customChallenges.map((challenge) => challenge.id));
  const newChallenges = imported.customChallenges.filter((challenge) => !currentCustomIds.has(challenge.id)).length;
  root.innerHTML = `<div class="dialog-backdrop"><section class="dialog portfolio-import-dialog" role="dialog" aria-modal="true" aria-labelledby="portfolio-import-title" aria-describedby="portfolio-import-summary"><button class="dialog-close" type="button" data-action="close-dialog" aria-label="Close portfolio import preview">×</button><p class="eyebrow">Local file preview</p><h2 id="portfolio-import-title">Import portfolio JSON</h2><p id="portfolio-import-summary">This file has ${workRecordLabel(imported.artifacts.length)}, ${newChallenges} ${newChallenges === 1 ? "family challenge" : "family challenges"}, and ${imported.savedIds.length} print deck choices.</p><dl class="import-summary"><div><dt>Merge</dt><dd>Adds ${workRecordLabel(newRecords)} and keeps your current record when an ID matches.</dd></div><div><dt>Replace</dt><dd>Removes ${workRecordLabel(state.artifacts.length)} in this ${route.demo ? "demo" : "browser"} and restores this file.</dd></div>${duplicateRecords ? `<div><dt>Duplicate IDs</dt><dd>${workRecordLabel(duplicateRecords)} already ${duplicateRecords === 1 ? "exists" : "exist"} here. Merge keeps the current version.</dd></div>` : ""}</dl><div class="dialog-actions"><button class="button secondary" type="button" data-action="merge-portfolio">Merge ${workRecordLabel(newRecords)}</button><button class="button primary" type="button" data-action="replace-portfolio">Replace ${workRecordLabel(state.artifacts.length)}</button></div></section></div>`;
  root.querySelector<HTMLButtonElement>("[data-action='merge-portfolio']")?.focus();
  bindDialogEvents();
}

function mergePortfolio(imported: PortfolioState): number {
  const currentArtifactIds = new Set(state.artifacts.map((artifact) => artifact.id));
  const newArtifacts = imported.artifacts.filter((artifact) => !currentArtifactIds.has(artifact.id));
  const currentCustomIds = new Set(state.customChallenges.map((challenge) => challenge.id));
  const newCustomChallenges = imported.customChallenges.filter((challenge) => !currentCustomIds.has(challenge.id));
  state = {
    artifacts: [...state.artifacts, ...newArtifacts],
    customChallenges: [...state.customChallenges, ...newCustomChallenges],
    savedIds: [...new Set([...state.savedIds, ...imported.savedIds])],
  };
  return newArtifacts.length;
}

function finishPortfolioMerge(): void {
  if (!pendingPortfolioImport) return;
  const added = mergePortfolio(pendingPortfolioImport);
  const saved = persist(`Portfolio merged: ${workRecordLabel(added)} added.`);
  closeDialog();
  render();
  if (saved) requestAnimationFrame(() => document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" }));
}

function finishPortfolioReplace(): void {
  if (!pendingPortfolioImport) return;
  const imported = pendingPortfolioImport;
  const currentCount = state.artifacts.length;
  if (!confirm(`Replace ${workRecordLabel(currentCount)} in this ${route.demo ? "demo" : "browser"} with ${workRecordLabel(imported.artifacts.length)} from this file? This cannot be undone.`)) return;
  state = structuredClone(imported);
  const saved = persist(`Portfolio replaced with ${workRecordLabel(imported.artifacts.length)}.`);
  closeDialog();
  render();
  if (saved) requestAnimationFrame(() => document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" }));
}

function bindDialogEvents(): void {
  const backdrop = document.querySelector<HTMLDivElement>(".dialog-backdrop");
  const dialog = document.querySelector<HTMLElement>(".dialog");
  backdrop?.addEventListener("click", (event) => { if (event.target === backdrop) closeDialog(); });
  dialog?.querySelector<HTMLElement>(".dialog-close")?.addEventListener("click", closeDialog);
  dialog?.querySelector<HTMLElement>("[data-action='merge-portfolio']")?.addEventListener("click", finishPortfolioMerge);
  dialog?.querySelector<HTMLElement>("[data-action='replace-portfolio']")?.addEventListener("click", finishPortfolioReplace);
  dialog?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDialog();
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, [href]')].filter((element) => !element.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  document.querySelector<HTMLFormElement>("#artifact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const challenge = byId(form.dataset.challenge ?? "");
    if (!challenge) return;
    const scores: Record<string, number> = {};
    challenge.rubric.forEach((row, index) => scores[row.criterion] = Number(data.get(`score-${index}`) ?? 3));
    const artifact: Artifact = { id: crypto.randomUUID(), challengeId: challenge.id, title: String(data.get("title")), completedOn: String(data.get("date")), evidence: String(data.get("evidence")), observation: String(data.get("observation")), nextStep: String(data.get("next")), reviewer: String(data.get("reviewer")) as Artifact["reviewer"], scores, createdAt: new Date().toISOString() };
    state.artifacts.unshift(artifact);
    persist(route.demo ? "Work record added to the demo." : "Work record saved on this device.");
    closeDialog();
    render();
    requestAnimationFrame(() => document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" }));
  });
}

function focusRoute(hash = window.location.hash, restoreScroll?: number): void {
  requestAnimationFrame(() => {
    const target = hash ? document.querySelector<HTMLElement>(hash) : document.querySelector<HTMLElement>("h1");
    const focusTarget = target?.matches("h1, h2") ? target : target?.querySelector<HTMLElement>("h1, h2") ?? document.querySelector<HTMLElement>("h1");
    focusTarget?.focus({ preventScroll: true });
    if (typeof restoreScroll === "number") window.scrollTo({ top: restoreScroll });
    else if (hash && target) target.scrollIntoView();
    const status = document.querySelector<HTMLElement>("#route-status");
    if (status && focusTarget) status.textContent = focusTarget.textContent?.trim() ?? "Page changed";
  });
}

function navigate(href: string): void {
  const nextUrl = new URL(href, window.location.href);
  const nextPath = nextUrl.pathname.replace(/\/$/, "") || "/";
  const nextIsDemo = nextPath === "/demo" || (nextPath === "/" && nextUrl.searchParams.get("demo") === "1");
  if (route.demo && !nextIsDemo) {
    try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* Real data remains separate even when removal is blocked. */ }
  }
  history.replaceState({ ...(history.state ?? {}), scrollY: window.scrollY }, "");
  history.pushState({ scrollY: 0 }, "", href);
  render();
  focusRoute();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/"], a[href^="#"]').forEach((anchor) => anchor.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  }));

  document.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const target = event.currentTarget as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id ?? "";
    if (action === "select") { selectedId = id; render(); requestAnimationFrame(() => document.querySelector(".challenge-detail")?.scrollIntoView({ block: "nearest" })); }
    if (action === "toggle-save") { state.savedIds = state.savedIds.includes(id) ? state.savedIds.filter((saved) => saved !== id) : [...state.savedIds, id]; const added = state.savedIds.includes(id); persist(added ? "Added to your print deck." : "Removed from your print deck."); render(); }
    if (action === "filter-mode") { modeFilter = target.dataset.value as typeof modeFilter; render(); }
    if (action === "filter-age") { ageFilter = target.dataset.value as typeof ageFilter; render(); }
    if (action === "clear-filters") { modeFilter = "All"; ageFilter = "All"; render(); }
    if (action === "log") { const challenge = byId(id); if (challenge) showArtifactDialog(challenge); }
    if (action === "print-one") { app.querySelector(".print-area")?.replaceWith(htmlToElement(printArea([id]))); window.print(); }
    if (action === "print-deck") { window.print(); }
    if (action === "export-portfolio") { downloadJson(`future-skills-portfolio-${new Date().toISOString().slice(0, 10)}.json`, makePortfolio(state)); toast("Portfolio export prepared."); }
    if (action === "export-deck") { const saved = state.savedIds.map(byId).filter((challenge): challenge is Challenge => Boolean(challenge)); const exportable = saved.length ? saved : state.customChallenges; if (!exportable.length) { toast("Add a challenge to the print deck before exporting.", true); return; } downloadJson("future-skills-deck.json", makeDeck(exportable)); toast("Challenge deck export prepared."); }
    if (action === "delete-artifact") { const artifact = state.artifacts.find((item) => item.id === id); if (artifact && confirm(`Delete “${artifact.title}” from this browser?`)) { state.artifacts = state.artifacts.filter((item) => item.id !== id); persist("Work record deleted."); render(); } }
    if (action === "clear-portfolio" && confirm(`Erase all ${state.artifacts.length} artifacts from this browser?`)) { state.artifacts = []; persist("Local portfolio erased."); render(); }
    if (action === "reset-demo") { state = freshDemoState(); saveState(state, localStorage, DEMO_STORAGE_KEY); selectedId = state.savedIds[0] ?? "paper-bridge"; render(); toast("Demo reset to its sample portfolio."); }
    if (action === "start-real") { try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* The real workspace still remains separate. */ } navigate("/"); }
    if (action === "merge-portfolio") finishPortfolioMerge();
    if (action === "replace-portfolio") finishPortfolioReplace();
    if (action === "close-dialog") closeDialog();
  }));

  document.querySelector<HTMLFormElement>("#challenge-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const age = String(data.get("age")).split("-").map(Number);
    const mode = String(data.get("mode")) as SkillMode;
    const challenge: Challenge = { id: `custom-${crypto.randomUUID()}`, title: String(data.get("title")).trim(), kicker: "A family-made challenge", ageMin: age[0] ?? 10, ageMax: age[1] ?? 16, minutes: Number(data.get("minutes")), modes: [mode], task: String(data.get("task")).trim(), materials: ["Choose only the materials named in your task"], limits: lines(data.get("limits")), reflection: lines(data.get("reflection")), rubric: customRubric(mode), custom: true, license: REUSE_LICENSE };
    state.customChallenges.push(challenge);
    state.savedIds.push(challenge.id);
    selectedId = challenge.id;
    persist(route.demo ? "Challenge added to the demo deck." : "Your challenge was added to the print deck.");
    form.reset();
    render();
    requestAnimationFrame(() => document.querySelector("#deck")?.scrollIntoView({ behavior: "smooth" }));
  });

  document.querySelector<HTMLInputElement>("#deck-import")?.addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const deck = parseDeck(await file.text());
      const imported = deck.challenges.map((challenge) => ({ ...challenge, id: `custom-${crypto.randomUUID()}`, custom: true, paid: false }));
      state.customChallenges = uniqueById([...state.customChallenges, ...imported]);
      state.savedIds = [...new Set([...state.savedIds, ...imported.map((challenge) => challenge.id)])];
      persist(`${imported.length} ${imported.length === 1 ? "challenge" : "challenges"} imported into this ${route.demo ? "demo" : "browser"}.`);
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "That deck could not be read.", true); input.value = ""; }
  });

  document.querySelector<HTMLInputElement>("#portfolio-import")?.addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      showPortfolioImportDialog(parsePortfolio(await file.text()));
    } catch (error) {
      toast(error instanceof Error ? error.message : "That portfolio could not be read.", true);
    } finally {
      input.value = "";
    }
  });

}

function htmlToElement(html: string): HTMLElement {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement;
}

history.scrollRestoration = "manual";
window.addEventListener("popstate", (event) => { render(); focusRoute(window.location.hash, typeof event.state?.scrollY === "number" ? event.state.scrollY : 0); });
window.addEventListener("online", () => { online = true; render(); if (!route.demo) void reconcileLicense(); });
window.addEventListener("offline", () => { online = false; render(); });

async function reconcileLicense(): Promise<void> {
  if (route.demo) return;
  const result = await verifyLicense();
  if (result === "invalid") { unlocked = false; render(); toast("This license is no longer active. The free challenges are unchanged.", true); }
  if (result === "valid" && !unlocked) { unlocked = true; render(); }
}

render();
if (window.location.hash) focusRoute();
if ("serviceWorker" in navigator && import.meta.env.PROD) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
if (!route.demo) void reconcileLicense();
