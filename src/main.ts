import "./styles.css";
import { checkoutUrl, captureLicense, clearLicense, hasOptimisticUnlock, storeLicense, verifyLicense } from "./billing";
import { challenges, freeChallenges } from "./data";
import { downloadJson, loadState, makeDeck, parseDeck, REUSE_LICENSE, saveState, uniqueById } from "./storage";
import { modes, type Artifact, type Challenge, type SkillMode } from "./types";

const app = document.querySelector<HTMLDivElement>("#app") as HTMLDivElement;
if (!app) throw new Error("Application root is missing");

captureLicense();
let state = loadState();
let unlocked = hasOptimisticUnlock();
let selectedId = state.savedIds[0] ?? freeChallenges[0]?.id ?? "";
let modeFilter: SkillMode | "All" = "All";
let ageFilter: "All" | "10–12" | "13–16" = "All";
let online = navigator.onLine;
let lastFocus: HTMLElement | null = null;

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);

const allChallenges = (): Challenge[] => uniqueById([...challenges, ...state.customChallenges]);
const byId = (id: string): Challenge | undefined => allChallenges().find((challenge) => challenge.id === id);
const isAvailable = (challenge: Challenge): boolean => !challenge.paid || unlocked;

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

function modePill(mode: SkillMode): string {
  return `<span class="mode-pill">${modeMark(mode)}${mode}</span>`;
}

function header(): string {
  return `<header class="site-header screen-only">
    <a class="wordmark" href="/" aria-label="Future Skills Portfolio home"><span class="wordmark-mark" aria-hidden="true"></span><span>Future Skills<br><b>Portfolio</b></span></a>
    <nav aria-label="Main navigation"><a href="/#deck">Challenge shelf</a><a href="/#portfolio">Portfolio</a><a href="/#make">Make a challenge</a><a href="/#keepsake">Keepsake deck</a></nav>
  </header>`;
}

function footer(): string {
  return `<footer class="site-footer screen-only">
    <div><a class="wordmark footer-mark" href="/"><span class="wordmark-mark" aria-hidden="true"></span><span>Future Skills Portfolio</span></a><p>Make evidence, not predictions.</p></div>
    <div><p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p><p>Original generated hero imagery. No tracking, child accounts, or public profiles.</p></div>
  </footer>`;
}

function legalPage(kind: "privacy" | "terms"): string {
  const privacy = `<p class="eyebrow">Plain-language policy</p><h1>Privacy, by default</h1><p class="lede">Your family’s work belongs on your device, not in our database.</p>
    <h2>What this site stores</h2><p>Challenge selections, custom challenges, artifact notes, rubric scores, and an optional purchase license are stored in your browser’s local storage. Future Skills Portfolio has no accounts and does not send this portfolio to us.</p>
    <h2>What leaves your device</h2><p>Nothing during normal free use. If you verify a Keepsake Deck license, the saved token is sent to the Sociobot billing API only to check whether it is active. If you choose checkout, you leave this site for Sociobot’s hosted checkout, where its merchant-of-record provider handles payment details. We never receive card numbers.</p>
    <h2>Offline and exports</h2><p>After the first visit, the app can work offline. JSON exports are files you choose to save and share. They may contain the notes you entered, so review them before sharing. Removing site data in browser settings erases the local copy.</p>
    <h2>Children</h2><p>No child account, name, email address, photo, or public profile is requested. Adults should avoid writing identifying or sensitive information in artifact notes.</p>
    <h2>Contact</h2><p>For privacy questions, email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p><p class="policy-date">Effective 28 August 2026</p>`;
  const terms = `<p class="eyebrow">Use terms</p><h1>Terms of use</h1><p class="lede">A durable family learning tool, offered without career predictions or automated judgments.</p>
    <h2>Using the challenges</h2><p>You may print and adapt the included challenges for personal, family, co-op, and classroom use. Adult supervision and sensible material choices remain your responsibility. The rubrics support conversation; they are not standardized assessments or claims about future employability.</p>
    <h2>Your challenges</h2><p>Custom challenges stay on your device. To create one, you confirm that you have the right to share it under the Creative Commons Attribution 4.0 license. Every challenge deck export carries that reuse license, including the included free sheets. Exporting a deck does not send it to us; you decide who receives the file.</p>
    <h2>Keepsake Deck purchase</h2><p>The optional Keepsake Deck is a $19 USD one-time purchase that unlocks eight additional curated challenge sheets in this browser. Sociobot/Dodo is the merchant of record. Checkout, receipts, taxes, and refunds are handled there. A refund revokes the license automatically. Accessibility, safety information, and portfolio export remain free.</p>
    <h2>Availability and warranty</h2><p>The free materials can be downloaded and used offline. Online license verification may occasionally be unavailable; a recently verified license continues optimistically. The product is provided “as is” without a promise of a particular educational or career outcome.</p>
    <h2>Contact</h2><p>For purchase or terms questions, email <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p><p class="policy-date">Effective 28 August 2026</p>`;
  return `${header()}<main id="main" class="legal"><a class="back-link" href="/">← Back to the portfolio</a><article>${kind === "privacy" ? privacy : terms}</article></main>${footer()}`;
}

function challengeCard(challenge: Challenge): string {
  const available = isAvailable(challenge);
  const saved = state.savedIds.includes(challenge.id);
  const completed = state.artifacts.some((artifact) => artifact.challengeId === challenge.id);
  return `<li class="challenge-card ${selectedId === challenge.id ? "is-selected" : ""}">
    <button class="card-open" type="button" data-action="select" data-id="${challenge.id}" aria-pressed="${selectedId === challenge.id}">
      <span class="card-top"><span class="card-number">${challenge.custom ? "Made here" : challenge.paid ? "Keepsake" : `No. ${String(allChallenges().indexOf(challenge) + 1).padStart(2, "0")}`}</span>${completed ? '<span class="fired">● Logged</span>' : available ? "" : '<span class="locked">◇ Locked</span>'}</span>
      <span class="card-kicker">${escapeHtml(challenge.kicker)}</span>
      <strong>${escapeHtml(challenge.title)}</strong>
      <span class="card-meta">Ages ${challenge.ageMin}–${challenge.ageMax} · ${challenge.minutes} min</span>
      <span class="pill-row">${challenge.modes.map(modePill).join("")}</span>
    </button>
    ${available ? `<button class="save-pin" type="button" data-action="toggle-save" data-id="${challenge.id}" aria-label="${saved ? "Remove" : "Add"} ${escapeHtml(challenge.title)} ${saved ? "from" : "to"} print shelf" aria-pressed="${saved}">${saved ? "✓ On shelf" : "+ Shelf"}</button>` : ""}
  </li>`;
}

function rubricTable(challenge: Challenge, inputs = false): string {
  return `<div class="table-wrap" role="region" aria-label="${inputs ? "Artifact score choices" : "Challenge review rubric"}" tabindex="0"><table><caption>${inputs ? "Choose one level for each criterion" : "Adult or peer review rubric"}</caption><thead><tr><th scope="col">Look for</th><th scope="col">1 · Emerging</th><th scope="col">2 · Growing</th><th scope="col">3 · Strong</th><th scope="col">4 · Transferable</th></tr></thead><tbody>${challenge.rubric.map((row, rowIndex) => `<tr><th scope="row">${escapeHtml(row.criterion)}</th>${([row.emerging, row.growing, row.strong, row.transferable]).map((description, score) => `<td>${inputs ? `<label class="score-choice"><input type="radio" name="score-${rowIndex}" value="${score + 1}" ${score === 2 ? "checked" : ""}><span>${score + 1}</span></label>` : ""}<span>${escapeHtml(description)}</span></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function challengeDetail(challenge: Challenge): string {
  if (!isAvailable(challenge)) {
    return `<div class="challenge-detail locked-detail" aria-labelledby="detail-title"><span class="slab-icon" aria-hidden="true">◇</span><p class="eyebrow">Keepsake challenge</p><h3 id="detail-title">${escapeHtml(challenge.title)}</h3><p>${escapeHtml(challenge.kicker)}. This challenge is part of the extended eight-sheet Keepsake collection.</p><a class="button primary" href="#keepsake">See the one-time unlock</a></div>`;
  }
  const saved = state.savedIds.includes(challenge.id);
  return `<article class="challenge-detail" aria-labelledby="detail-title">
    <div class="detail-heading"><div><p class="eyebrow">${challenge.custom ? "Your challenge" : "Challenge sheet"}</p><h3 id="detail-title">${escapeHtml(challenge.title)}</h3><p>${escapeHtml(challenge.kicker)}</p></div><span class="duration">${challenge.minutes}<small>min</small></span></div>
    <div class="pill-row">${challenge.modes.map(modePill).join("")}</div>
    <h4>The challenge</h4><p class="task-copy">${escapeHtml(challenge.task)}</p>
    <div class="detail-grid"><div><h4>Materials</h4><ul>${challenge.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div><h4>Useful limits</h4><ul>${challenge.limits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></div>
    <h4>Pause and reflect</h4><ol class="reflection-list">${challenge.reflection.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    ${rubricTable(challenge)}
    <div class="detail-actions"><button class="button primary" type="button" data-action="log" data-id="${challenge.id}">Log an artifact</button><button class="button secondary" type="button" data-action="toggle-save" data-id="${challenge.id}">${saved ? "Remove from shelf" : "Add to print shelf"}</button><button class="text-button" type="button" data-action="print-one" data-id="${challenge.id}">Print this sheet</button></div>
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
  return `<section id="deck" class="section deck-section" aria-labelledby="deck-title">
    <div class="section-heading"><div><p class="eyebrow">The challenge shelf</p><h2 id="deck-title">Choose the next piece of evidence</h2></div><p>Mix modes across six weeks. Difficulty comes from reasoning and revision, not more screen time.</p></div>
    <div class="filters" aria-label="Filter challenges">
      <div class="filter-group"><span>Mode</span><div class="chip-row">${(["All", ...modes] as const).map((mode) => `<button type="button" class="filter-chip" data-action="filter-mode" data-value="${mode}" aria-pressed="${modeFilter === mode}">${mode}</button>`).join("")}</div></div>
      <div class="filter-group"><span>Age</span><div class="chip-row">${(["All", "10–12", "13–16"] as const).map((age) => `<button type="button" class="filter-chip" data-action="filter-age" data-value="${age}" aria-pressed="${ageFilter === age}">${age}</button>`).join("")}</div></div>
    </div>
    <p class="results-count" aria-live="polite">Showing ${visible.length} ${visible.length === 1 ? "challenge" : "challenges"}</p>
    ${visible.length ? `<div class="deck-layout"><ul class="challenge-list">${visible.map(challengeCard).join("")}</ul>${selected ? challengeDetail(selected) : ""}</div>` : `<div class="empty-state"><span aria-hidden="true">◯</span><h3>No challenge fits both filters</h3><p>Try a wider age band or choose “All” for mode.</p><button class="button secondary" type="button" data-action="clear-filters">Clear filters</button></div>`}
  </section>`;
}

function portfolioSection(): string {
  const completedModes = new Set(state.artifacts.flatMap((artifact) => byId(artifact.challengeId)?.modes ?? []));
  return `<section id="portfolio" class="section portfolio-section" aria-labelledby="portfolio-title">
    <div class="section-heading"><div><p class="eyebrow">Private on this device</p><h2 id="portfolio-title">A six-week evidence shelf</h2></div><p>Success is concrete: four artifacts in at least three modes, each with an adult’s observable growth note.</p></div>
    <div class="progress-plinth">
      <div class="progress-copy"><p class="progress-label"><strong>${state.artifacts.length}</strong> / 4 artifacts</p><progress class="progress-track" aria-label="Artifacts completed" max="4" value="${Math.min(state.artifacts.length, 4)}">${state.artifacts.length} of 4 artifacts</progress></div>
      <div class="progress-copy"><p class="progress-label"><strong>${completedModes.size}</strong> / 3 skill modes</p><progress class="progress-track" aria-label="Skill modes covered" max="3" value="${Math.min(completedModes.size, 3)}">${completedModes.size} of 3 skill modes</progress></div>
      <p class="privacy-note"><span aria-hidden="true">⌂</span> Stored locally. No account.</p>
    </div>
    ${state.artifacts.length ? `<ol class="artifact-list">${state.artifacts.map((artifact) => {
      const challenge = byId(artifact.challengeId);
      return `<li><div class="artifact-date"><span>${new Date(`${artifact.completedOn}T12:00:00`).toLocaleDateString(undefined, { month: "short" })}</span><strong>${new Date(`${artifact.completedOn}T12:00:00`).getDate()}</strong></div><div><p class="eyebrow">${challenge ? escapeHtml(challenge.title) : "Imported challenge"} · ${artifact.reviewer} review</p><h3>${escapeHtml(artifact.title)}</h3><p>${escapeHtml(artifact.observation)}</p><details><summary>Evidence and next step</summary><p>${escapeHtml(artifact.evidence)}</p><p><strong>Next:</strong> ${escapeHtml(artifact.nextStep)}</p></details></div><button class="icon-button" type="button" data-action="delete-artifact" data-id="${artifact.id}" aria-label="Delete artifact ${escapeHtml(artifact.title)}">×</button></li>`;
    }).join("")}</ol>` : `<div class="empty-state artifact-empty"><span class="empty-vessel" aria-hidden="true"></span><h3>Your shelf is ready</h3><p>Complete a challenge, then log what was made and one thing you observed. A photo is not required.</p><a class="button secondary" href="#deck">Choose a challenge</a></div>`}
    <div class="portfolio-actions"><button class="button secondary" type="button" data-action="export-portfolio" ${state.artifacts.length ? "" : "disabled"}>Export portfolio JSON</button>${state.artifacts.length ? '<button class="text-button danger-link" type="button" data-action="clear-portfolio">Erase local portfolio</button>' : ""}</div>
  </section>`;
}

function makeSection(): string {
  return `<section id="make" class="section make-section" aria-labelledby="make-title">
    <div class="section-heading"><div><p class="eyebrow">Adapt the format</p><h2 id="make-title">Shape a challenge of your own</h2></div><p>Keep the structure: a task, real limits, reflection, and review. Your challenge stays local until you export it.</p></div>
    <div class="maker-layout"><form id="challenge-form" class="maker-form"><div class="field wide"><label for="custom-title">Challenge title</label><input id="custom-title" name="title" required maxlength="70" autocomplete="off"></div><div class="field"><label for="custom-mode">Primary mode</label><select id="custom-mode" name="mode">${modes.map((mode) => `<option>${mode}</option>`).join("")}</select></div><div class="field"><label for="custom-age">Age band</label><select id="custom-age" name="age"><option value="10-12">10–12</option><option value="13-16">13–16</option><option value="10-16">10–16</option></select></div><div class="field"><label for="custom-time">Minutes</label><input id="custom-time" name="minutes" type="number" min="15" max="240" step="5" value="45" required></div><div class="field wide"><label for="custom-task">Build, explain, or critique task</label><textarea id="custom-task" name="task" rows="4" required maxlength="600" aria-describedby="task-hint"></textarea><small id="task-hint">Write what someone should make and what evidence they should keep.</small></div><div class="field wide"><label for="custom-limits">Material limits <span>(one per line)</span></label><textarea id="custom-limits" name="limits" rows="3" required maxlength="400"></textarea></div><div class="field wide"><label for="custom-reflection">Reflection prompts <span>(one per line)</span></label><textarea id="custom-reflection" name="reflection" rows="3" required maxlength="400"></textarea></div><label class="check-row wide"><input type="checkbox" name="license" required><span>I created this challenge or have permission to share it under <a href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer">CC BY 4.0</a>.</span></label><div class="wide"><button class="button primary" type="submit">Add to my shelf</button></div></form>
    <div class="share-panel"><span class="slab-icon" aria-hidden="true">↗</span><h3>Pass a deck hand to hand</h3><p>Export a small JSON file for another family. Importing adds the challenges to this browser; nothing is uploaded.</p><button class="button secondary" type="button" data-action="export-deck">Export my shelf</button><label class="button text-upload">Import a deck<input id="deck-import" type="file" accept="application/json,.json"></label><p class="microcopy">${state.customChallenges.length} made here · ${state.savedIds.length} on your print shelf</p></div></div>
  </section>`;
}

function keepsakeSection(): string {
  return `<section id="keepsake" class="section keepsake-section" aria-labelledby="keepsake-title"><div class="keepsake-copy"><p class="eyebrow">Optional Keepsake Deck</p><h2 id="keepsake-title">More prompts. Same quiet format.</h2><p>Unlock eight additional curated challenge sheets for <strong>$19 USD, once</strong>. The free eight-card deck, custom challenges, accessibility, and all exports stay free.</p><ul><li>Eight additional cross-mode challenges</li><li>Lifetime license for this product</li><li>Restore on another device with your license token</li></ul><p class="merchant-note">Sociobot/Dodo is the merchant of record. Refunds are handled there.</p></div><div class="purchase-slab">${unlocked ? '<span class="fired-badge">● Unlocked</span><h3>Your Keepsake shelf is open</h3><p>The additional challenges now appear on the shelf.</p><button class="text-button" type="button" data-action="remove-license">Remove license from this device</button>' : `<span class="price"><strong>$19</strong><small>USD · one time</small></span><a class="button primary full" href="${checkoutUrl}">Buy the Keepsake Deck</a><details><summary>Have a license? Restore it</summary><form id="license-form"><label for="license-token">License token</label><input id="license-token" name="license" required autocomplete="off" spellcheck="false"><button class="button secondary full" type="submit" aria-label="Verify license and unlock">Verify and unlock</button></form></details>`}<p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p></div></section>`;
}

function printArea(ids?: string[]): string {
  const wanted = ids ?? (state.savedIds.length ? state.savedIds : [selectedId]);
  const printable = wanted.map(byId).filter((challenge): challenge is Challenge => Boolean(challenge && isAvailable(challenge)));
  return `<div class="print-area" aria-hidden="true">${printable.map((challenge) => `<article class="print-sheet"><header><p>Future Skills Portfolio · Ages ${challenge.ageMin}–${challenge.ageMax} · ${challenge.minutes} minutes</p><h2>${escapeHtml(challenge.title)}</h2><p>${escapeHtml(challenge.kicker)} · ${challenge.modes.join(" + ")}</p></header><section><h3>The challenge</h3><p>${escapeHtml(challenge.task)}</p></section><div class="print-columns"><section><h3>Materials</h3><ul>${challenge.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><section><h3>Useful limits</h3><ul>${challenge.limits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section></div><section><h3>Pause and reflect</h3><ol>${challenge.reflection.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>${rubricTable(challenge)}<div class="print-notes"><h3>Observation</h3><span></span><span></span><p>Next experiment:</p><span></span></div><footer>Made to be reviewed by a human · future-skills-portfolio.sociobot.in</footer></article>`).join("")}</div>`;
}

function homePage(): string {
  return `${header()}<div id="connection-status" class="connection-status ${online ? "" : "is-visible"}" role="status">You’re offline. The deck and local portfolio still work.</div><main id="main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Ages 10–16 · offline by default</p><h1>Make evidence.<br><em>Not predictions.</em></h1><p class="hero-lede">A printable challenge deck for families growing mathematical and computational judgment in an AI-rich world.</p><div class="hero-actions"><a class="button primary" href="#deck">Choose a challenge</a><button class="button secondary" type="button" data-action="print-shelf">Print my shelf${state.savedIds.length ? ` (${state.savedIds.length})` : ""}</button></div><p class="hero-note"><span aria-hidden="true">⌁</span> No child account. No AI scoring. No career claims.</p></div><figure class="hero-art"><picture><source media="(max-width: 720px)" srcset="/assets/hero-ceramic-720.webp"><img src="/assets/hero-ceramic.webp" width="1200" height="800" alt="Four hand-built ceramic forms—a bridge, spiral vessel, split tile, and pebble stack—resting on translucent ice slabs" fetchpriority="high" decoding="async"></picture><figcaption>Four modes of evidence, shaped by hand.</figcaption></figure></section>
    <section class="proof-strip" aria-label="What is included"><div><strong>8</strong><span>free, complete challenges</span></div><div><strong>6</strong><span>human skill modes</span></div><div><strong>1</strong><span>transparent review rubric</span></div><div><strong>0</strong><span>accounts or uploads</span></div></section>
    ${deckSection()}${portfolioSection()}${makeSection()}${keepsakeSection()}
  </main>${footer()}${printArea()}<div id="dialog-root"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}

function render(): void {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  app.innerHTML = path === "/privacy" ? legalPage("privacy") : path === "/terms" ? legalPage("terms") : homePage();
  bindEvents();
}

function persist(message: string): boolean {
  if (!saveState(state)) {
    requestAnimationFrame(() => toast("Your browser blocked local storage. Export your work before leaving.", true));
    return false;
  }
  // Callers often re-render immediately after saving. Queue feedback so the
  // newly rendered toast node, rather than the node about to be replaced,
  // receives the message.
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

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}

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
  root.innerHTML = `<div class="dialog-backdrop" data-action="close-dialog"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="dialog-close" type="button" data-action="close-dialog" aria-label="Close artifact form">×</button><p class="eyebrow">Add evidence · ${escapeHtml(challenge.title)}</p><h2 id="dialog-title">Log an artifact</h2><form id="artifact-form" data-challenge="${challenge.id}"><div class="field"><label for="artifact-title">What did you make?</label><input id="artifact-title" name="title" required maxlength="90" autofocus></div><div class="form-two"><div class="field"><label for="artifact-date">Completed on</label><input id="artifact-date" name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div><div class="field"><label for="artifact-reviewer">Reviewed by</label><select id="artifact-reviewer" name="reviewer"><option>Adult</option><option>Peer</option><option>Self</option></select></div></div><div class="field"><label for="artifact-evidence">Evidence kept</label><textarea id="artifact-evidence" name="evidence" rows="3" required placeholder="For example: three trial measurements and a revised diagram"></textarea></div><div class="field"><label for="artifact-observation">Concrete growth observation</label><textarea id="artifact-observation" name="observation" rows="3" required placeholder="I noticed…" aria-describedby="observation-hint"></textarea><small id="observation-hint">Describe something visible in the work, not a trait or score.</small></div><div class="field"><label for="artifact-next">A useful next step</label><textarea id="artifact-next" name="next" rows="2" required></textarea></div>${rubricTable(challenge, true)}<button class="button primary" type="submit">Save artifact locally</button></form></section></div>`;
  root.querySelector<HTMLInputElement>("#artifact-title")?.focus();
  bindDialogEvents();
}

function closeDialog(): void {
  const root = document.querySelector<HTMLDivElement>("#dialog-root");
  if (root) root.innerHTML = "";
  lastFocus?.focus();
}

function bindDialogEvents(): void {
  const backdrop = document.querySelector<HTMLDivElement>(".dialog-backdrop");
  const dialog = document.querySelector<HTMLElement>(".dialog");
  backdrop?.addEventListener("click", (event) => { if (event.target === backdrop) closeDialog(); });
  dialog?.querySelector<HTMLElement>(".dialog-close")?.addEventListener("click", closeDialog);
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
    persist("Artifact saved on this device.");
    closeDialog();
    render();
    requestAnimationFrame(() => document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" }));
  });
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const target = event.currentTarget as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id ?? "";
    if (action === "select") { selectedId = id; render(); requestAnimationFrame(() => document.querySelector(".challenge-detail")?.scrollIntoView({ block: "nearest" })); }
    if (action === "toggle-save") {
      state.savedIds = state.savedIds.includes(id) ? state.savedIds.filter((saved) => saved !== id) : [...state.savedIds, id];
      const added = state.savedIds.includes(id); persist(added ? "Added to your print shelf." : "Removed from your print shelf."); render();
    }
    if (action === "filter-mode") { modeFilter = target.dataset.value as typeof modeFilter; render(); }
    if (action === "filter-age") { ageFilter = target.dataset.value as typeof ageFilter; render(); }
    if (action === "clear-filters") { modeFilter = "All"; ageFilter = "All"; render(); }
    if (action === "log") { const challenge = byId(id); if (challenge) showArtifactDialog(challenge); }
    if (action === "print-one") { app.querySelector(".print-area")?.replaceWith(htmlToElement(printArea([id]))); window.print(); }
    if (action === "print-shelf") { window.print(); }
    if (action === "export-portfolio") { downloadJson(`future-skills-portfolio-${new Date().toISOString().slice(0, 10)}.json`, { format: "future-skills-portfolio", version: 1, exportedAt: new Date().toISOString(), artifacts: state.artifacts }); toast("Portfolio export prepared."); }
    if (action === "export-deck") {
      const saved = state.savedIds.map(byId).filter((challenge): challenge is Challenge => Boolean(challenge && isAvailable(challenge)));
      const exportable = saved.length ? saved : state.customChallenges;
      if (!exportable.length) { toast("Add a challenge to your shelf before exporting.", true); return; }
      downloadJson("future-skills-deck.json", makeDeck(exportable)); toast("Deck export prepared.");
    }
    if (action === "delete-artifact") {
      const artifact = state.artifacts.find((item) => item.id === id);
      if (artifact && confirm(`Delete “${artifact.title}” from this device? This cannot be undone.`)) { state.artifacts = state.artifacts.filter((item) => item.id !== id); persist("Artifact deleted."); render(); }
    }
    if (action === "clear-portfolio" && confirm(`Erase all ${state.artifacts.length} local artifacts? Export first if you need a copy.`)) { state.artifacts = []; persist("Local portfolio erased."); render(); }
    if (action === "remove-license" && confirm("Remove the saved Keepsake license from this browser? You can restore it later with the token.")) { clearLicense(); unlocked = false; render(); }
  }));

  document.querySelector<HTMLFormElement>("#challenge-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const age = String(data.get("age")).split("-").map(Number);
    const mode = String(data.get("mode")) as SkillMode;
    const title = String(data.get("title")).trim();
    const challenge: Challenge = { id: `custom-${crypto.randomUUID()}`, title, kicker: "A family-made challenge", ageMin: age[0] ?? 10, ageMax: age[1] ?? 16, minutes: Number(data.get("minutes")), modes: [mode], task: String(data.get("task")).trim(), materials: ["Choose only the materials named in your task"], limits: lines(data.get("limits")), reflection: lines(data.get("reflection")), rubric: customRubric(mode), custom: true, license: REUSE_LICENSE };
    state.customChallenges.push(challenge); state.savedIds.push(challenge.id); selectedId = challenge.id; persist("Your challenge was added to the shelf."); form.reset(); render(); requestAnimationFrame(() => document.querySelector("#deck")?.scrollIntoView({ behavior: "smooth" }));
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
      persist(`${imported.length} ${imported.length === 1 ? "challenge" : "challenges"} imported locally.`); render();
    } catch (error) { toast(error instanceof Error ? error.message : "That deck could not be read.", true); input.value = ""; }
  });

  document.querySelector<HTMLFormElement>("#license-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const token = String(new FormData(form).get("license") ?? "").trim();
    if (!token) return;
    if (!storeLicense(token)) { toast("This browser blocked local storage, so the license cannot be saved here.", true); return; }
    unlocked = true; render(); toast("Checking the license…");
    const result = await verifyLicense(true);
    if (result === "invalid") { unlocked = false; render(); toast("That license is not active. Check the token or buy a new license.", true); }
    else if (result === "offline") toast("You appear offline. The saved license will be checked when connected.");
    else { render(); toast("Keepsake Deck unlocked."); }
  });
}

function htmlToElement(html: string): HTMLElement {
  const template = document.createElement("template"); template.innerHTML = html.trim(); return template.content.firstElementChild as HTMLElement;
}

window.addEventListener("online", () => { online = true; render(); void reconcileLicense(); });
window.addEventListener("offline", () => { online = false; render(); });

async function reconcileLicense(): Promise<void> {
  const result = await verifyLicense();
  if (result === "invalid") { unlocked = false; render(); toast("This license is no longer active. The free deck and exports are unchanged.", true); }
  if (result === "valid" && !unlocked) { unlocked = true; render(); }
}

render();
if ("serviceWorker" in navigator && import.meta.env.PROD) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
void reconcileLicense();
