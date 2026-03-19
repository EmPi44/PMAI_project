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

export interface ProjectCharter {
  vision: string;
  problemStatement: string;
  lead: string;
  startDate: string;
  targetDate: string;
  status: "on-track" | "at-risk" | "off-track" | "planning";
  objectives: Objective[];
  inScope: string[];
  outOfScope: string[];
  milestones: Milestone[];
}

export interface Project {
  key: string;
  name: string;
  type: string;
  charter: ProjectCharter;
}
