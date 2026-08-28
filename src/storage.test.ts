import { describe, expect, it } from "vitest";
import { challenges, freeChallenges } from "./data";
import { loadState, makeDeck, parseDeck, saveState, uniqueById } from "./storage";

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
