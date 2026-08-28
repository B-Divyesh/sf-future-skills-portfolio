import type { Challenge, PortfolioState, ShareDeck } from "./types";
import { modes } from "./types";

export const STORAGE_KEY = "future-skills-portfolio:v1";

export const EMPTY_STATE: PortfolioState = { artifacts: [], customChallenges: [], savedIds: [] };

export function loadState(storage: Pick<Storage, "getItem"> = localStorage): PortfolioState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_STATE);
    const parsed = JSON.parse(raw) as Partial<PortfolioState>;
    return {
      artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
      customChallenges: Array.isArray(parsed.customChallenges) ? parsed.customChallenges : [],
      savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds.filter((id): id is string => typeof id === "string") : [],
    };
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}

export function saveState(state: PortfolioState, storage: Pick<Storage, "setItem"> = localStorage): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function makeDeck(challenges: Challenge[]): ShareDeck {
  return { format: "future-skills-deck", version: 1, exportedAt: new Date().toISOString(), challenges };
}

export function parseDeck(raw: string): ShareDeck {
  const deck = JSON.parse(raw) as Partial<ShareDeck>;
  if (deck.format !== "future-skills-deck" || deck.version !== 1 || !Array.isArray(deck.challenges)) {
    throw new Error("That file is not a Future Skills deck.");
  }
  if (deck.challenges.length > 100) throw new Error("That deck has more than 100 challenges.");
  for (const challenge of deck.challenges) {
    const valid = challenge
      && typeof challenge.id === "string"
      && /^[a-zA-Z0-9_-]{1,100}$/.test(challenge.id)
      && typeof challenge.title === "string"
      && challenge.title.length <= 100
      && typeof challenge.kicker === "string"
      && typeof challenge.task === "string"
      && Number.isFinite(challenge.ageMin)
      && Number.isFinite(challenge.ageMax)
      && Number.isFinite(challenge.minutes)
      && Array.isArray(challenge.modes)
      && challenge.modes.every((mode) => modes.includes(mode))
      && Array.isArray(challenge.materials)
      && challenge.materials.every((item) => typeof item === "string")
      && Array.isArray(challenge.limits)
      && challenge.limits.every((item) => typeof item === "string")
      && Array.isArray(challenge.reflection)
      && challenge.reflection.every((item) => typeof item === "string")
      && Array.isArray(challenge.rubric)
      && challenge.rubric.every((row) => row && typeof row.criterion === "string" && typeof row.emerging === "string" && typeof row.growing === "string" && typeof row.strong === "string" && typeof row.transferable === "string");
    if (!valid) {
      throw new Error("One or more challenges are incomplete.");
    }
  }
  return deck as ShareDeck;
}

export function uniqueById(items: Challenge[]): Challenge[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
