export const modes = ["Build", "Explain", "Critique", "Model", "Debug", "Collaborate"] as const;
export type SkillMode = (typeof modes)[number];

export interface RubricRow {
  criterion: string;
  emerging: string;
  growing: string;
  strong: string;
  transferable: string;
}

export interface Challenge {
  id: string;
  title: string;
  kicker: string;
  ageMin: number;
  ageMax: number;
  minutes: number;
  modes: SkillMode[];
  task: string;
  materials: string[];
  limits: string[];
  reflection: string[];
  rubric: RubricRow[];
  paid?: boolean;
  custom?: boolean;
  license?: string;
}

export interface Artifact {
  id: string;
  challengeId: string;
  title: string;
  completedOn: string;
  evidence: string;
  observation: string;
  nextStep: string;
  reviewer: "Adult" | "Peer" | "Self";
  scores: Record<string, number>;
  createdAt: string;
}

export interface PortfolioState {
  artifacts: Artifact[];
  customChallenges: Challenge[];
  savedIds: string[];
}

export interface ShareDeck {
  format: "future-skills-deck";
  version: 1;
  exportedAt: string;
  challenges: Challenge[];
}

export interface PortfolioExport {
  format: "future-skills-portfolio";
  version: 1;
  exportedAt: string;
  artifacts: Artifact[];
  customChallenges: Challenge[];
  savedIds: string[];
}
