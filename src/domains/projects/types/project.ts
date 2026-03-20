export interface Objective {
  id: string;
  text: string;
  progress: number;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: "completed" | "in-progress" | "upcoming";
}

export type StakeholderType = "internal" | "external" | "sponsor" | "user";
export type InfluenceLevel = "high" | "medium" | "low";

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  type: StakeholderType;
  influence: InfluenceLevel;
}

export interface ProjectCharter {
  vision: string;
  problemStatement: string;
  projectType: "greenfield" | "migration" | "enhancement";
  currentState: string;
  targetUsers: string;
  lead: string;
  startDate: string;
  targetDate: string;
  status: "on-track" | "at-risk" | "off-track" | "planning";
  objectives: Objective[];
  inScope: string[];
  outOfScope: string[];
  milestones: Milestone[];
  stakeholders: Stakeholder[];
}

export interface Project {
  id: string;
  key: string;
  name: string;
  type: string;
  description: string;
  avatarUrl: string | null;
  color: string | null;
  charter: ProjectCharter;
}
