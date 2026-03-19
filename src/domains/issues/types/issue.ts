export type IssueType = "Epic" | "Story" | "Task" | "Bug";

export type Priority = "Highest" | "High" | "Medium" | "Low" | "Lowest";

export type IssueStatus = "To Do" | "In Progress" | "Done";

export interface Issue {
  key: string;
  type: IssueType;
  summary: string;
  status: IssueStatus;
  priority: Priority;
  assignee: string | null;
  points: number;
  sprintId?: string | null;
}

export interface CreateIssueDTO {
  type: IssueType;
  summary: string;
  priority: Priority;
  assignee?: string | null;
  points?: number;
  sprintId?: string | null;
}

export interface UpdateIssueDTO {
  summary?: string;
  status?: IssueStatus;
  priority?: Priority;
  assignee?: string | null;
  points?: number;
  sprintId?: string | null;
}
