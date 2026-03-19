import type { Issue, CreateIssueDTO, UpdateIssueDTO } from "../types";

let sprintIssues: Issue[] = [
  { key: "NOVA-1042", type: "Story",  summary: "Implement new checkout payment flow",                     status: "In Progress", priority: "High",    assignee: "SC", points: 8, sprintId: "sprint-24" },
  { key: "NOVA-1043", type: "Task",   summary: "Add unit tests for payment validation service",           status: "To Do",      priority: "Medium",  assignee: "AR", points: 3, sprintId: "sprint-24" },
  { key: "NOVA-1044", type: "Bug",    summary: "Fix currency conversion rounding error on invoice page",  status: "In Progress", priority: "Highest", assignee: "JL", points: 5, sprintId: "sprint-24" },
  { key: "NOVA-1045", type: "Story",  summary: "Design subscription upgrade modal",                       status: "Done",       priority: "High",    assignee: "PP", points: 5, sprintId: "sprint-24" },
  { key: "NOVA-1046", type: "Task",   summary: "Migrate Stripe webhook handlers to v2 API",               status: "To Do",      priority: "Medium",  assignee: "SC", points: 3, sprintId: "sprint-24" },
  { key: "NOVA-1047", type: "Epic",   summary: "Q1 Payment Infrastructure Overhaul",                      status: "In Progress", priority: "High",    assignee: "AR", points: 13, sprintId: "sprint-24" },
];

let backlogIssues: Issue[] = [
  { key: "NOVA-1048", type: "Story", summary: "Add Apple Pay support to mobile checkout",          status: "To Do", priority: "Low",    assignee: "JL",  points: 8, sprintId: null },
  { key: "NOVA-1049", type: "Bug",   summary: "Payment receipt email not sent for guest users",    status: "To Do", priority: "High",   assignee: null,  points: 3, sprintId: null },
  { key: "NOVA-1050", type: "Task",  summary: "Document payment gateway failover procedures",      status: "To Do", priority: "Lowest", assignee: null,  points: 2, sprintId: null },
  { key: "NOVA-1051", type: "Story", summary: "Implement refund request workflow for admins",      status: "To Do", priority: "Medium", assignee: "PP",  points: 5, sprintId: null },
];

let nextId = 1052;

const delay = (ms: number = 100) => new Promise((r) => setTimeout(r, ms));

export async function fetchIssues(): Promise<Issue[]> {
  await delay();
  return [...sprintIssues, ...backlogIssues];
}

export async function fetchIssuesBySprintId(sprintId: string | null): Promise<Issue[]> {
  await delay();
  if (sprintId === null) {
    return [...backlogIssues];
  }
  return sprintIssues.filter((i) => i.sprintId === sprintId);
}

export async function createIssue(dto: CreateIssueDTO): Promise<Issue> {
  await delay();
  const issue: Issue = {
    key: `NOVA-${nextId++}`,
    type: dto.type,
    summary: dto.summary,
    status: "To Do",
    priority: dto.priority,
    assignee: dto.assignee ?? null,
    points: dto.points ?? 0,
    sprintId: dto.sprintId ?? null,
  };
  if (issue.sprintId) {
    sprintIssues = [...sprintIssues, issue];
  } else {
    backlogIssues = [...backlogIssues, issue];
  }
  return issue;
}

export async function updateIssue(key: string, dto: UpdateIssueDTO): Promise<Issue> {
  await delay();
  let issue: Issue | undefined;

  sprintIssues = sprintIssues.map((i) => {
    if (i.key === key) {
      issue = { ...i, ...dto };
      return issue;
    }
    return i;
  });

  backlogIssues = backlogIssues.map((i) => {
    if (i.key === key) {
      issue = { ...i, ...dto };
      return issue;
    }
    return i;
  });

  if (!issue) {
    throw new Error(`Issue ${key} not found`);
  }

  // Handle sprint reassignment
  if (dto.sprintId !== undefined) {
    if (dto.sprintId === null) {
      // Move to backlog
      sprintIssues = sprintIssues.filter((i) => i.key !== key);
      if (!backlogIssues.find((i) => i.key === key)) {
        backlogIssues = [...backlogIssues, issue];
      }
    } else {
      // Move to sprint
      backlogIssues = backlogIssues.filter((i) => i.key !== key);
      if (!sprintIssues.find((i) => i.key === key)) {
        sprintIssues = [...sprintIssues, issue];
      }
    }
  }

  return issue;
}
