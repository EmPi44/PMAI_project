"use client";

import { useState } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PROJECT = { key: "NOVA", name: "Nova Platform", type: "Software project" };

const USERS = {
  SC: { initials: "SC", name: "Sarah Chen", color: "#6554C0" },
  AR: { initials: "AR", name: "Alex Rivera", color: "#00875A" },
  JL: { initials: "JL", name: "Jordan Lee", color: "#0065FF" },
  PP: { initials: "PP", name: "Priya Patel", color: "#FF5630" },
};

const SPRINT = {
  name: "NOVA Sprint 24",
  dateRange: "Mar 4 – Mar 18",
  status: "active",
};

const SPRINT_ISSUES = [
  { key: "NOVA-1042", type: "Story", summary: "Implement new checkout payment flow", status: "In Progress", priority: "High", assignee: "SC", points: 8 },
  { key: "NOVA-1043", type: "Task", summary: "Add unit tests for payment validation service", status: "To Do", priority: "Medium", assignee: "AR", points: 3 },
  { key: "NOVA-1044", type: "Bug", summary: "Fix currency conversion rounding error on invoice page", status: "In Progress", priority: "Highest", assignee: "JL", points: 5 },
  { key: "NOVA-1045", type: "Story", summary: "Design subscription upgrade modal", status: "Done", priority: "High", assignee: "PP", points: 5 },
  { key: "NOVA-1046", type: "Task", summary: "Migrate Stripe webhook handlers to v2 API", status: "To Do", priority: "Medium", assignee: "SC", points: 3 },
  { key: "NOVA-1047", type: "Epic", summary: "Q1 Payment Infrastructure Overhaul", status: "In Progress", priority: "High", assignee: "AR", points: 13 },
];

const BACKLOG_ISSUES = [
  { key: "NOVA-1048", type: "Story", summary: "Add Apple Pay support to mobile checkout", status: "To Do", priority: "Low", assignee: "JL", points: 8 },
  { key: "NOVA-1049", type: "Bug", summary: "Payment receipt email not sent for guest users", status: "To Do", priority: "High", assignee: null, points: 3 },
  { key: "NOVA-1050", type: "Task", summary: "Document payment gateway failover procedures", status: "To Do", priority: "Lowest", assignee: null, points: 2 },
  { key: "NOVA-1051", type: "Story", summary: "Implement refund request workflow for admins", status: "To Do", priority: "Medium", assignee: "PP", points: 5 },
];

// ─── Design Tokens ───────────────────────────────────────────────────────────

const ISSUE_TYPE_COLORS = { Epic: "#8677D9", Story: "#58D8A4", Task: "#3884FF", Bug: "#DD350D" };
const PRIORITY_COLORS = { Highest: "#CD1316", High: "#E5493A", Medium: "#F18D13", Low: "#2D8738", Lowest: "#3B7FC4" };
const STATUS_STYLES = {
  "To Do": { bg: "#DFE1E6", text: "#42526E" },
  "In Progress": { bg: "#DEEBFF", text: "#0747A6" },
  Done: { bg: "#E3FCEF", text: "#006644" },
};

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Ubuntu, sans-serif';

// ─── Icon Components (inline SVG) ────────────────────────────────────────────

function IssueTypeIcon({ type }) {
  const color = ISSUE_TYPE_COLORS[type] || "#3884FF";
  const icons = {
    Epic: (
      <path d="M4 8.5l4-5 4 5M6 6.5l2-2.5 2 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
    Story: (
      <path d="M5 3h6v10l-3-2-3 2V3z" fill="#fff" />
    ),
    Task: (
      <path d="M4 8l2.5 2.5L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
    Bug: (
      <circle cx="8" cy="8" r="3.5" fill="#fff" />
    ),
  };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <rect width="16" height="16" rx="3" fill={color} />
      {icons[type]}
    </svg>
  );
}

function PriorityIcon({ priority }) {
  const color = PRIORITY_COLORS[priority] || "#F18D13";
  const paths = {
    Highest: <><path d="M5 10l3-3 3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5 7l3-3 3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    High: <path d="M5 9l3-3 3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Medium: <path d="M4 8h8" stroke={color} strokeWidth="2" strokeLinecap="round" />,
    Low: <path d="M5 7l3 3 3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Lowest: <><path d="M5 6l3 3 3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5 9l3 3 3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" title={priority}>
      {paths[priority]}
    </svg>
  );
}

// Nav Icons
function TimelineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="4" width="8" height="3" rx="1" /><rect x="7" y="9" width="10" height="3" rx="1" /><rect x="5" y="14" width="6" height="3" rx="1" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="5" height="14" rx="1" /><rect x="10" y="3" width="5" height="9" rx="1" />
    </svg>
  );
}
function BacklogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 5h12M4 8h12M4 11h8M4 14h10" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="4" width="14" height="13" rx="2" /><path d="M3 8h14M7 3v3M13 3v3" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 6l-4 4 4 4M13 6l4 4-4 4" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 16V9M10 9c0-3 1.5-5.5 4-7-1 3-1 5 0 7M10 9c0-3-1.5-5.5-4-7 1 3 1 5 0 7M7 16h6" />
    </svg>
  );
}
function ChevronIcon({ direction = "right", className = "" }) {
  const rotation = { right: 0, down: 90, left: 180, up: 270 }[direction] || 0;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ transform: `rotate(${rotation}deg)`, transition: "transform 200ms" }}>
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="5" /><path d="M12 12l4 4" />
    </svg>
  );
}
function PlusIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
function DragHandleIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="#B0B3B8" className="shrink-0">
      <circle cx="4" cy="4" r="1.2" /><circle cx="8" cy="4" r="1.2" />
      <circle cx="4" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" />
      <circle cx="4" cy="12" r="1.2" /><circle cx="8" cy="12" r="1.2" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="9" r="2.5" /><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M3.1 14.9l1.4-1.4M13.5 4.5l1.4-1.4" />
    </svg>
  );
}
function CollapseIcon({ collapsed }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>
      <path d="M13 4l-6 6 6 6" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="12" cy="8" r="1.3" />
    </svg>
  );
}

// ─── Small UI Components ─────────────────────────────────────────────────────

function StatusLozenge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES["To Do"];
  const label = status === "In Progress" ? "IN PROGRESS" : status === "To Do" ? "TO DO" : "DONE";
  return (
    <span
      className="shrink-0 rounded px-2 py-0.5 text-[11px] font-bold uppercase leading-none"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

function StoryPointsBadge({ points }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-600">
      {points}
    </span>
  );
}

function AvatarCircle({ userKey, size = 24 }) {
  if (!userKey || !USERS[userKey]) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-[10px] font-medium text-gray-400"
        style={{ width: size, height: size }}
        title="Unassigned"
      >
        ?
      </span>
    );
  }
  const user = USERS[userKey];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ width: size, height: size, backgroundColor: user.color }}
      title={user.name}
    >
      {user.initials}
    </span>
  );
}

function CreateIssueRow() {
  return (
    <div className="group flex h-10 cursor-pointer items-center gap-2 border-b border-gray-100 px-3 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600">
      <PlusIcon size={14} />
      <span>Create issue</span>
    </div>
  );
}

// ─── Issue Row ───────────────────────────────────────────────────────────────

function IssueRow({ issue }) {
  return (
    <div className="group flex h-10 items-center gap-2.5 border-b border-gray-100 px-3 hover:bg-[#F4F5F7]">
      {/* Drag handle */}
      <span className="w-3 opacity-0 transition-opacity group-hover:opacity-100">
        <DragHandleIcon />
      </span>
      {/* Checkbox */}
      <input type="checkbox" className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-gray-300 accent-[#1868DB]" readOnly />
      {/* Issue type */}
      <IssueTypeIcon type={issue.type} />
      {/* Issue key */}
      <span className="w-24 shrink-0 cursor-pointer text-[13px] font-medium text-[#1868DB] hover:underline">
        {issue.key}
      </span>
      {/* Summary */}
      <span className="min-w-0 flex-1 truncate text-[13px] text-[#292A2E]">
        {issue.summary}
      </span>
      {/* Priority */}
      <PriorityIcon priority={issue.priority} />
      {/* Assignee */}
      <AvatarCircle userKey={issue.assignee} />
      {/* Status */}
      <StatusLozenge status={issue.status} />
      {/* Story points */}
      <StoryPointsBadge points={issue.points} />
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { group: "Planning", items: [
    { label: "Timeline", Icon: TimelineIcon, active: false },
    { label: "Board", Icon: BoardIcon, active: false },
    { label: "Backlog", Icon: BacklogIcon, active: true },
    { label: "Calendar", Icon: CalendarIcon, active: false },
  ]},
  { group: "Development", items: [
    { label: "Code", Icon: CodeIcon, active: false },
  ]},
  { group: "Operations", items: [
    { label: "Deployments", Icon: RocketIcon, active: false },
  ]},
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="flex flex-col border-r border-[#1B3A5C] bg-[#0C1929]"
      style={{ width: collapsed ? 56 : 256, transition: "width 200ms ease-in-out" }}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-[#1B3A5C] px-3">
        {/* Project avatar */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
          N
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{PROJECT.name}</div>
            <div className="truncate text-[11px] text-slate-400">{PROJECT.type}</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-[#162D4A] hover:text-white"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-3">
            {!collapsed && (
              <div className="mb-1 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.group}
              </div>
            )}
            {group.items.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 px-4 py-1.5 text-sm transition-colors ${
                  item.active
                    ? "bg-[#1868DB] text-white"
                    : "text-slate-300 hover:bg-[#162D4A] hover:text-white"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.Icon />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-3 border-t border-[#1B3A5C] px-3 py-3">
        <AvatarCircle userKey="SC" size={28} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{USERS.SC.name}</span>
            <button className="text-slate-400 hover:text-white">
              <SettingsIcon />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-[#6B6E76] hover:text-[#292A2E] cursor-pointer hover:underline">Projects</span>
        <span className="text-[#6B6E76]">/</span>
        <span className="text-[#6B6E76] hover:text-[#292A2E] cursor-pointer hover:underline">{PROJECT.key}</span>
        <span className="text-[#6B6E76]">/</span>
        <span className="font-semibold text-[#292A2E]">Backlog</span>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        <button className="text-[#505258] hover:text-[#292A2E]">
          <SearchIcon />
        </button>
        {/* Board/Backlog toggle */}
        <div className="flex overflow-hidden rounded-md border border-gray-200">
          <button className="px-3 py-1 text-[13px] text-[#505258] hover:bg-gray-50">Board</button>
          <button className="bg-[#1868DB] px-3 py-1 text-[13px] font-medium text-white">Backlog</button>
        </div>
        <AvatarCircle userKey="SC" size={28} />
      </div>
    </div>
  );
}

// ─── Sprint Section ──────────────────────────────────────────────────────────

function SprintSection({ issues, expanded, onToggle }) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Blue top accent */}
      <div className="h-0.5 rounded-t-lg bg-[#1868DB]" />
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button onClick={onToggle} className="text-[#505258] hover:text-[#292A2E]">
          <ChevronIcon direction={expanded ? "down" : "right"} />
        </button>
        <span className="text-[14px] font-semibold text-[#292A2E]">{SPRINT.name}</span>
        <span className="text-[13px] text-[#6B6E76]">({SPRINT.dateRange})</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-[#505258]">
          {issues.length} issues
        </span>
        <div className="flex-1" />
        <button className="text-[#505258] hover:text-[#292A2E]">
          <MoreIcon />
        </button>
        <button className="rounded bg-[#1868DB] px-3 py-1 text-[13px] font-medium text-white hover:bg-[#1457B5]">
          Complete Sprint
        </button>
      </div>
      {/* Issues */}
      {expanded && (
        <div className="border-t border-gray-100">
          {issues.map((issue) => (
            <IssueRow key={issue.key} issue={issue} />
          ))}
          <CreateIssueRow />
        </div>
      )}
    </div>
  );
}

// ─── Backlog Section ─────────────────────────────────────────────────────────

function BacklogSection({ issues, expanded, onToggle }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Gray top accent */}
      <div className="h-0.5 rounded-t-lg bg-gray-300" />
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button onClick={onToggle} className="text-[#505258] hover:text-[#292A2E]">
          <ChevronIcon direction={expanded ? "down" : "right"} />
        </button>
        <span className="text-[14px] font-semibold text-[#292A2E]">Backlog</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-[#505258]">
          {issues.length} issues
        </span>
        <div className="flex-1" />
        <button className="text-[#505258] hover:text-[#292A2E]">
          <MoreIcon />
        </button>
        <button className="rounded border border-gray-300 px-3 py-1 text-[13px] font-medium text-[#505258] hover:bg-gray-50">
          Create Sprint
        </button>
      </div>
      {/* Issues */}
      {expanded && (
        <div className="border-t border-gray-100">
          {issues.map((issue) => (
            <IssueRow key={issue.key} issue={issue} />
          ))}
          <CreateIssueRow />
        </div>
      )}
    </div>
  );
}

// ─── Root Component ──────────────────────────────────────────────────────────

export default function JiraBacklogMockup() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sprintExpanded, setSprintExpanded] = useState(true);
  const [backlogExpanded, setBacklogExpanded] = useState(true);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-white"
      style={{ fontFamily: FONT_FAMILY, fontSize: 14, lineHeight: "20px" }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB] px-8 py-6">
          <SprintSection
            issues={SPRINT_ISSUES}
            expanded={sprintExpanded}
            onToggle={() => setSprintExpanded(!sprintExpanded)}
          />
          <BacklogSection
            issues={BACKLOG_ISSUES}
            expanded={backlogExpanded}
            onToggle={() => setBacklogExpanded(!backlogExpanded)}
          />
        </div>
      </div>
    </div>
  );
}
