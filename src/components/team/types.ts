export type AgentStatus = "idle" | "running" | "error";
export type EffortLevel = "low" | "medium" | "high" | "max";
export type PermissionMode =
  | "default"
  | "dontAsk"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan";

export const ALL_TOOLS = [
  "Read", "Edit", "Bash", "Grep", "Glob", "WebSearch", "WebFetch", "Agent",
] as const;
export type AgentTool = (typeof ALL_TOOLS)[number];

export const ALL_MCP_SERVERS = ["Supabase", "Notion", "HubSpot", "context7"] as const;
export type McpServer = (typeof ALL_MCP_SERVERS)[number];

export const ALL_SKILLS = [
  "react-frontend-agent",
  "ui-ux-pro-max",
  "vercel-react-best-practices",
  "frontend-design",
  "audit-website",
] as const;
export type AgentSkill = (typeof ALL_SKILLS)[number];

export const MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", short: "Sonnet" },
  { id: "claude-opus-4-6",   label: "Claude Opus 4.6",   short: "Opus"   },
  { id: "claude-haiku-4-5",  label: "Claude Haiku 4.5",  short: "Haiku"  },
] as const;

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  model: string;
  effort: EffortLevel;
  systemPrompt: string;
  tools: AgentTool[];
  mcpServers: McpServer[];
  skills: AgentSkill[];
  memory: boolean;
  extendedThinking: boolean;
  maxTurns: number | null;
  maxBudget: number | null;
  permissionMode: PermissionMode;
}

export const INITIAL_AGENTS: Agent[] = [
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Reviews PRs and flags issues before merge",
    status: "idle",
    model: "claude-sonnet-4-6",
    effort: "high",
    systemPrompt:
      "You are a senior software engineer conducting code reviews. Your job is to:\n" +
      "- Check for bugs, security issues, and performance problems\n" +
      "- Enforce coding standards and best practices\n" +
      "- Suggest improvements with clear, actionable explanations\n" +
      "- Be constructive and specific — reference line numbers and propose alternatives",
    tools: ["Read", "Grep", "Glob"],
    mcpServers: [],
    skills: ["vercel-react-best-practices"],
    memory: false,
    extendedThinking: true,
    maxTurns: 20,
    maxBudget: null,
    permissionMode: "default",
  },
  {
    id: "backlog-groomer",
    name: "Backlog Groomer",
    description: "Organizes, estimates, and prioritizes issues",
    status: "running",
    model: "claude-sonnet-4-6",
    effort: "medium",
    systemPrompt:
      "You are a product manager assistant specializing in backlog grooming. You:\n" +
      "- Analyze issue descriptions and fill in missing context\n" +
      "- Assign story points based on complexity\n" +
      "- Suggest priority ordering aligned with product goals\n" +
      "- Flag blockers, dependencies, and duplicate issues",
    tools: ["Read", "WebSearch"],
    mcpServers: ["Notion", "HubSpot"],
    skills: [],
    memory: true,
    extendedThinking: false,
    maxTurns: 30,
    maxBudget: 2.0,
    permissionMode: "dontAsk",
  },
  {
    id: "pr-summarizer",
    name: "PR Summarizer",
    description: "Writes concise PR descriptions from diffs",
    status: "idle",
    model: "claude-haiku-4-5",
    effort: "low",
    systemPrompt:
      "You summarize pull requests into clear, human-readable descriptions. For each PR:\n" +
      "- Write a 1-sentence TL;DR\n" +
      "- List key changes as bullet points\n" +
      "- Note any breaking changes or migration steps\n" +
      "- Keep it under 200 words",
    tools: ["Read", "Grep", "Glob"],
    mcpServers: [],
    skills: [],
    memory: false,
    extendedThinking: false,
    maxTurns: 10,
    maxBudget: 0.5,
    permissionMode: "acceptEdits",
  },
  {
    id: "sprint-planner",
    name: "Sprint Planner",
    description: "Helps plan sprints and allocate capacity",
    status: "error",
    model: "claude-opus-4-6",
    effort: "max",
    systemPrompt:
      "You are a scrum master assistant. You help teams plan effective sprints by:\n" +
      "- Analyzing team velocity from past sprints\n" +
      "- Suggesting which issues to include based on priority and estimated size\n" +
      "- Identifying risks, dependencies, and blockers upfront\n" +
      "- Creating a balanced sprint that accounts for team capacity and holidays",
    tools: ["Read", "WebSearch", "WebFetch"],
    mcpServers: ["Supabase", "Notion"],
    skills: [],
    memory: true,
    extendedThinking: true,
    maxTurns: 50,
    maxBudget: 5.0,
    permissionMode: "default",
  },
];
