export type RequirementType = "functional" | "non-functional";

export type RequirementStatus =
  | "draft"
  | "proposed"
  | "approved"
  | "rejected"
  | "deprecated";

export type RequirementPriority = "critical" | "high" | "medium" | "low";

export type NFRCategory =
  | "performance"
  | "security"
  | "reliability"
  | "scalability"
  | "usability"
  | "maintainability"
  | "compliance"
  | "compatibility";

export interface Requirement {
  id: string;
  reqId: string;
  projectId: string;
  type: RequirementType;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  status: RequirementStatus;
  priority: RequirementPriority;
  category: NFRCategory | null;
  author: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequirementDTO {
  projectId: string;
  type: RequirementType;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  status?: RequirementStatus;
  priority?: RequirementPriority;
  category?: NFRCategory;
  author?: string;
  tags?: string[];
}

export interface UpdateRequirementDTO {
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  status?: RequirementStatus;
  priority?: RequirementPriority;
  category?: NFRCategory;
  author?: string;
  tags?: string[];
}
