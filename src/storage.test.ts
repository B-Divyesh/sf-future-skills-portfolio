import { describe, expect, it } from "vitest";
import { challenges, freeChallenges } from "./data";
import { loadState, makeDeck, parseDeck, REUSE_LICENSE, saveState, uniqueById } from "./storage";

class MemoryStorage {
  value: string | null = null;
  getItem(): string | null { return this.value; }
  setItem(_key: string, value: string): void { this.value = value; }
}

describe("local portfolio storage", () => {
  it("starts empty when no state exists", () => {
    const storage = new MemoryStorage();
    expect(loadState(storage)).toEqual({ artifacts: [], customChallenges: [], savedIds: [] });
  });

  it("round-trips a portfolio without a network", () => {
    const storage = new MemoryStorage();
    const state = { artifacts: [], customChallenges: [], savedIds: ["paper-bridge"] };
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual(state);
  });

  it("recovers from corrupt browser data", () => {
    const storage = new MemoryStorage();
    storage.value = "not json";
    expect(loadState(storage).artifacts).toEqual([]);
  });

  it("filters malformed stored members so a bad record cannot blank the app", () => {
    const storage = new MemoryStorage();
    storage.value = JSON.stringify({ artifacts: [], savedIds: ["paper-bridge", 3], customChallenges: [{}] });
    expect(loadState(storage)).toEqual({ artifacts: [], customChallenges: [], savedIds: ["paper-bridge"] });
  });
});

describe("shareable challenge decks", () => {
  it("round-trips the documented deck format", () => {
    const deck = makeDeck(freeChallenges.slice(0, 2));
    expect(parseDeck(JSON.stringify(deck)).challenges).toHaveLength(2);
  });

  it("rejects unrelated JSON", () => {
    expect(() => parseDeck('{"challenges":[]}')).toThrow("not a Future Skills deck");
  });

  it("rejects malformed challenge data", () => {
    expect(() => parseDeck(JSON.stringify({ format: "future-skills-deck", version: 1, challenges: [{ id: "bad-id", title: "Incomplete", task: "No supporting fields" }] }))).toThrow("incomplete");
  });

  it("rejects an imported challenge without the required reuse license", () => {
    const unlicensed = { ...makeDeck(freeChallenges.slice(0, 1)), challenges: [{ ...freeChallenges[0], license: undefined }] };
    expect(() => parseDeck(JSON.stringify(unlicensed))).toThrow("supported CC BY 4.0 reuse license");
  });

  it("exports a clear CC BY 4.0 attribution for every challenge", () => {
    expect(makeDeck(freeChallenges.slice(0, 1)).challenges[0]?.license).toBe(REUSE_LICENSE);
  });

  it("will not re-export an unlicensed family challenge", () => {
    expect(() => makeDeck([{ ...freeChallenges[0]!, custom: true, license: undefined }])).toThrow("supported CC BY 4.0 reuse license");
  });

  it("deduplicates imported challenges by id", () => {
    expect(uniqueById([challenges[0]!, challenges[0]!])).toHaveLength(1);
  });
});

describe("curated content", () => {
  it("ships a useful free deck and an eight-card paid extension", () => {
    expect(freeChallenges).toHaveLength(8);
    expect(challenges.filter((challenge) => challenge.paid)).toHaveLength(8);
  });

  it("gives every challenge a task, limits, reflection, and full rubric", () => {
    for (const challenge of challenges) {
      expect(challenge.task.length).toBeGreaterThan(40);
      expect(challenge.limits.length).toBeGreaterThanOrEqual(3);
      expect(challenge.reflection.length).toBeGreaterThanOrEqual(3);
      expect(challenge.rubric).toHaveLength(4);
    }
  });
});
