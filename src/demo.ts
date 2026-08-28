import type { PortfolioState } from "./types";

export const DEMO_STORAGE_KEY = "demo:future-skills-portfolio:v1";

export const DEMO_STATE: PortfolioState = {
  savedIds: ["paper-bridge", "explain-black-box", "debug-recipe", "fair-score"],
  customChallenges: [],
  artifacts: [
    {
      id: "demo-bridge",
      challengeId: "paper-bridge",
      title: "Bridge revision with folded rails",
      completedOn: "2026-08-04",
      evidence: "Three load tests, a prediction sketch, and both bridge versions.",
      observation: "Mira used the first crease failure to move material toward both edges.",
      nextStep: "Compare equal-width rails with two different fold heights.",
      reviewer: "Adult",
      scores: { "Reasoning trail": 3, "Build craft": 3, Judgment: 3, Reflection: 3 },
      createdAt: "2026-08-04T16:00:00.000Z",
    },
    {
      id: "demo-black-box",
      challengeId: "explain-black-box",
      title: "Two explanations for n × 3 + 1",
      completedOn: "2026-08-11",
      evidence: "Eight input-output pairs, a diagram, and a pseudocode version.",
      observation: "Mira found a second possible rule and chose a test that separated them.",
      nextStep: "Design a rule where negative inputs expose a hidden assumption.",
      reviewer: "Adult",
      scores: { "Reasoning trail": 4, "Explain craft": 3, Judgment: 3, Reflection: 3 },
      createdAt: "2026-08-11T16:00:00.000Z",
    },
    {
      id: "demo-recipe",
      challengeId: "debug-recipe",
      title: "Revised geometric creature instructions",
      completedOn: "2026-08-18",
      evidence: "The first drawing, marked ambiguities, and the revised instructions.",
      observation: "Mira replaced three vague position words with measured offsets.",
      nextStep: "Test the instructions with someone who did not see the first version.",
      reviewer: "Peer",
      scores: { "Reasoning trail": 3, "Debug craft": 4, Judgment: 3, Reflection: 4 },
      createdAt: "2026-08-18T16:00:00.000Z",
    },
    {
      id: "demo-score",
      challengeId: "fair-score",
      title: "Weighted project score with sensitivity check",
      completedOn: "2026-08-25",
      evidence: "A score table, two weight sets, and a note about who benefits.",
      observation: "Mira changed one weight at a time and identified the least stable ranking.",
      nextStep: "Ask another reviewer to choose weights before seeing the projects.",
      reviewer: "Adult",
      scores: { "Reasoning trail": 4, "Model craft": 3, Judgment: 4, Reflection: 3 },
      createdAt: "2026-08-25T16:00:00.000Z",
    },
  ],
};

export function freshDemoState(): PortfolioState {
  return structuredClone(DEMO_STATE);
}
