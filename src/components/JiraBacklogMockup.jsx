"use client";

import { useState } from "react";

// ─── Atlassian Design System Tokens ──────────────────────────────────────────
// Source: https://atlassian.design/foundations/tokens/design-tokens/

const T = {
  // Surfaces
  surface:          "#FFFFFF",
  surfaceSunken:    "#F7F8F9",
  surfaceHovered:   "#F1F2F4",
  surfacePressed:   "#DCDFE4",
  surfaceOverlay:   "#FFFFFF",
  surfaceRaised:    "#FFFFFF",

  // Sidebar (Atlassian dark nav)
  navBg:            "#0C1929",
  navBorder:        "rgba(255,255,255,0.08)",
  navHover:         "rgba(255,255,255,0.06)",
  navActive:        "rgba(255,255,255,0.12)",
  navTextMuted:     "rgba(255,255,255,0.45)",
  navText:          "rgba(255,255,255,0.75)",
  navTextBright:    "#FFFFFF",

  // Text
  text:             "#1D2125",
  textSubtle:       "#44546F",
  textSubtlest:     "#626F86",
  textDisabled:     "#8993A5",
  textInverse:      "#FFFFFF",

  // Brand
  brandBold:        "#0C66E4",
  brandBoldHover:   "#0055CC",
  brandBoldPress:   "#09326C",
  brandSubtle:      "#E9F2FF",
  brandText:        "#0C66E4",

  // Borders
  border:           "#091E4224",
  borderBold:       "#758195",
  borderFocused:    "#388BFF",
  borderSelected:   "#0C66E4",
  borderSubtle:     "#091E420F",

  // Status backgrounds (lozenge)
  bgNeutral:        "#091E420F",
  bgNeutralBold:    "#44546F",
  bgSuccessSubtle:  "#DFFCF0",
  bgSuccessBold:    "#1F845A",
  bgInfoSubtle:     "#E9F2FF",
  bgInfoBold:       "#0C66E4",
  bgWarningSubtle:  "#FFF7D6",
  bgWarningBold:    "#CF9F02",
  bgDangerSubtle:   "#FFEDEB",
  bgDangerBold:     "#C9372C",

  // Status text
  textSuccess:      "#216E4E",
  textInfo:         "#0055CC",
  textWarning:      "#7F5F01",
  textDanger:       "#AE2A19",
};

// Atlassian font stack (uses Atlassian Sans with system fallbacks)
const FONT_STACK = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, system-ui, "Helvetica Neue", sans-serif';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PROJECT = { key: "NOVA", name: "Nova Platform", type: "Software project" };

const USERS = {
  SC: { initials: "SC", name: "Sarah Chen", color: "#6554C0" },
  AR: { initials: "AR", name: "Alex Rivera", color: "#1F845A" },
  JL: { initials: "JL", name: "Jordan Lee", color: "#0C66E4" },
  PP: { initials: "PP", name: "Priya Patel", color: "#E56910" },
};

const SPRINT = { name: "NOVA Sprint 24", dateRange: "Mar 4 – Mar 18" };

const SPRINT_ISSUES = [
  { key: "NOVA-1042", type: "Story",  summary: "Implement new checkout payment flow",                     status: "In Progress", priority: "High",    assignee: "SC", points: 8 },
  { key: "NOVA-1043", type: "Task",   summary: "Add unit tests for payment validation service",           status: "To Do",      priority: "Medium",  assignee: "AR", points: 3 },
  { key: "NOVA-1044", type: "Bug",    summary: "Fix currency conversion rounding error on invoice page",  status: "In Progress", priority: "Highest", assignee: "JL", points: 5 },
  { key: "NOVA-1045", type: "Story",  summary: "Design subscription upgrade modal",                       status: "Done",       priority: "High",    assignee: "PP", points: 5 },
  { key: "NOVA-1046", type: "Task",   summary: "Migrate Stripe webhook handlers to v2 API",               status: "To Do",      priority: "Medium",  assignee: "SC", points: 3 },
  { key: "NOVA-1047", type: "Epic",   summary: "Q1 Payment Infrastructure Overhaul",                      status: "In Progress", priority: "High",    assignee: "AR", points: 13 },
];

const BACKLOG_ISSUES = [
  { key: "NOVA-1048", type: "Story", summary: "Add Apple Pay support to mobile checkout",          status: "To Do", priority: "Low",    assignee: "JL",  points: 8 },
  { key: "NOVA-1049", type: "Bug",   summary: "Payment receipt email not sent for guest users",    status: "To Do", priority: "High",   assignee: null,  points: 3 },
  { key: "NOVA-1050", type: "Task",  summary: "Document payment gateway failover procedures",      status: "To Do", priority: "Lowest", assignee: null,  points: 2 },
  { key: "NOVA-1051", type: "Story", summary: "Implement refund request workflow for admins",      status: "To Do", priority: "Medium", assignee: "PP",  points: 5 },
];

// ─── Issue Type & Priority Configs ───────────────────────────────────────────

const ISSUE_TYPE_COLORS = { Epic: "#9F8FEF", Story: "#4BCE97", Task: "#579DFF", Bug: "#F87462" };

const PRIORITY_COLORS = {
  Highest: "#C9372C",
  High:    "#E2483D",
  Medium:  "#E2740F",
  Low:     "#1F845A",
  Lowest:  "#388BFF",
};

const STATUS_CONFIG = {
  "To Do":       { bg: T.bgNeutral,        text: T.textSubtle },
  "In Progress": { bg: T.bgInfoSubtle,     text: T.textInfo },
  Done:          { bg: T.bgSuccessSubtle,   text: T.textSuccess },
};

// ─── Icon Components ─────────────────────────────────────────────────────────

function IssueTypeIcon({ type }) {
  const bg = ISSUE_TYPE_COLORS[type] || "#579DFF";
  const shapes = {
    Epic: <path d="M11.5 7.5L8 4 4.5 7.5M8 4v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Story: <path d="M5.5 3.5h5v9l-2.5-1.75L5.5 12.5V3.5z" fill="#fff" />,
    Task: <path d="M4.5 8l2.25 2.25L11.5 5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Bug: <circle cx="8" cy="8" r="3" fill="#fff" />,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" role="img" aria-label={type}>
      <rect width="16" height="16" rx="2" fill={bg} />
      {shapes[type]}
    </svg>
  );
}

function PriorityIcon({ priority }) {
  const c = PRIORITY_COLORS[priority] || "#E2740F";
  const draw = {
    Highest: <><path d="M5.5 9.5L8 7l2.5 2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5.5 6.5L8 4l2.5 2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    High:    <path d="M5.5 9L8 6.5 10.5 9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Medium:  <path d="M4.5 8h7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />,
    Low:     <path d="M5.5 7L8 9.5 10.5 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Lowest:  <><path d="M5.5 6.5L8 9l2.5-2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5.5 9.5L8 12l2.5-2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" role="img" aria-label={`${priority} priority`}>
      {draw[priority]}
    </svg>
  );
}

/* ── Navigation icons (20×20, stroke-based) ── */

function TimelineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="10" height="3" rx="1.5" /><rect x="8" y="10" width="12" height="3" rx="1.5" /><rect x="5" y="16" width="8" height="3" rx="1.5" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1.5" /><rect x="13" y="3" width="7" height="12" rx="1.5" />
    </svg>
  );
}
function BacklogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h16M4 10h16M4 14h10M4 18h13" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V10M12 10c0-3.5 1.5-6.5 4.5-8.5-1 3.5-1 6 0 8.5M12 10c0-3.5-1.5-6.5-4.5-8.5 1 3.5 1 6 0 8.5M8 19h8" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h12" />
    </svg>
  );
}

/* ── Utility icons ── */

function ChevronIcon({ direction = "right", className = "" }) {
  const deg = { right: 0, down: 90, left: 180, up: 270 }[direction] || 0;
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
      style={{ transform: `rotate(${deg}deg)`, transition: "transform 150ms ease" }}
    >
      <path d="M6 3.5l4.5 4.5L6 12.5" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
    </svg>
  );
}
function PlusIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}
function DragHandleIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" className="shrink-0">
      {[2, 5.5, 9, 12.5].map((y) => (
        <g key={y}><circle cx="2" cy={y} r="1" fill="#B3B9C4" /><circle cx="6" cy={y} r="1" fill="#B3B9C4" /></g>
      ))}
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="2" /><path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4" />
    </svg>
  );
}
function CollapseIcon({ collapsed }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="5" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="15" cy="10" r="1.5" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 4h12M4 8h8M6 12h4" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
    </svg>
  );
}

// ─── Small UI Components ─────────────────────────────────────────────────────

function StatusLozenge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["To Do"];
  const label = status === "In Progress" ? "IN PROGRESS" : status === "To Do" ? "TO DO" : "DONE";
  return (
    <span
      className="inline-flex shrink-0 items-center rounded px-1.5 py-px"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
        lineHeight: "16px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

function StoryPointsBadge({ points }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: 20,
        height: 20,
        backgroundColor: T.bgNeutral,
        color: T.textSubtle,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {points}
    </span>
  );
}

function AvatarCircle({ userKey, size = 24, ring = false }) {
  if (!userKey || !USERS[userKey]) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          border: "1.5px dashed #B3B9C4",
          color: "#8993A5",
          fontSize: size * 0.4,
          fontWeight: 500,
        }}
        title="Unassigned"
      >
        <PersonIcon />
      </span>
    );
  }
  const user = USERS[userKey];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full cursor-pointer"
      style={{
        width: size,
        height: size,
        backgroundColor: user.color,
        color: "#fff",
        fontSize: size * 0.38,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 3.5px ${user.color}40` : undefined,
      }}
      title={user.name}
    >
      {user.initials}
    </span>
  );
}

function CreateIssueRow() {
  return (
    <button
      className="flex w-full items-center gap-2 px-3 cursor-pointer"
      style={{
        height: 36,
        color: T.textDisabled,
        fontSize: 13,
        transition: "color 120ms, background 120ms",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.textSubtle; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textDisabled; }}
    >
      <PlusIcon size={13} />
      <span>Create issue</span>
    </button>
  );
}

// ─── Issue Row ───────────────────────────────────────────────────────────────

function IssueRow({ issue }) {
  return (
    <div
      className="group flex items-center gap-2 px-2 cursor-pointer"
      style={{
        height: 40,
        borderBottom: `1px solid ${T.borderSubtle}`,
        transition: "background 100ms",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* Drag handle */}
      <span className="flex w-4 items-center justify-center opacity-0 transition-opacity duration-100 group-hover:opacity-100">
        <DragHandleIcon />
      </span>
      {/* Checkbox */}
      <input
        type="checkbox"
        readOnly
        className="shrink-0 cursor-pointer rounded"
        style={{ width: 14, height: 14, accentColor: T.brandBold }}
        aria-label={`Select ${issue.key}`}
      />
      {/* Issue type */}
      <IssueTypeIcon type={issue.type} />
      {/* Issue key */}
      <span
        className="shrink-0 cursor-pointer"
        style={{
          width: 92,
          fontSize: 13,
          fontWeight: 500,
          color: T.brandBold,
          textDecoration: "none",
          transition: "text-decoration 100ms",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
      >
        {issue.key}
      </span>
      {/* Summary */}
      <span
        className="min-w-0 flex-1 truncate"
        style={{ fontSize: 13, color: T.text, fontWeight: 400 }}
      >
        {issue.summary}
      </span>
      {/* Priority */}
      <PriorityIcon priority={issue.priority} />
      {/* Assignee */}
      <AvatarCircle userKey={issue.assignee} size={22} />
      {/* Status lozenge */}
      <StatusLozenge status={issue.status} />
      {/* Story points */}
      <StoryPointsBadge points={issue.points} />
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    group: "PLANNING",
    items: [
      { label: "Timeline",  Icon: TimelineIcon, active: false },
      { label: "Board",     Icon: BoardIcon,    active: false },
      { label: "Backlog",   Icon: BacklogIcon,  active: true },
      { label: "Calendar",  Icon: CalendarIcon, active: false },
      { label: "List",      Icon: ListIcon,     active: false },
    ],
  },
  {
    group: "DEVELOPMENT",
    items: [
      { label: "Code", Icon: CodeIcon, active: false },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { label: "Deployments", Icon: RocketIcon, active: false },
    ],
  },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="flex shrink-0 flex-col"
      style={{
        width: collapsed ? 52 : 260,
        background: T.navBg,
        borderRight: `1px solid ${T.navBorder}`,
        transition: "width 180ms cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 shrink-0"
        style={{
          height: 56,
          padding: collapsed ? "0 10px" : "0 12px",
          borderBottom: `1px solid ${T.navBorder}`,
        }}
      >
        {/* Project avatar */}
        <span
          className="flex shrink-0 items-center justify-center rounded-md"
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #579DFF 0%, #6554C0 100%)",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          N
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: T.navTextBright, lineHeight: "18px" }}>
              {PROJECT.name}
            </div>
            <div className="truncate" style={{ fontSize: 11, color: T.navTextMuted, lineHeight: "14px" }}>
              {PROJECT.type}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex shrink-0 items-center justify-center rounded cursor-pointer"
          style={{
            width: 28,
            height: 28,
            color: T.navText,
            transition: "background 120ms, color 120ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.navHover; e.currentTarget.style.color = T.navTextBright; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navText; }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-1.5">
            {!collapsed && (
              <div
                style={{
                  padding: "6px 16px 4px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: T.navTextMuted,
                }}
              >
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = item.active;
              return (
                <button
                  key={item.label}
                  className="flex w-full items-center cursor-pointer"
                  style={{
                    gap: collapsed ? 0 : 10,
                    height: 32,
                    padding: collapsed ? "0" : "0 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    margin: collapsed ? "1px 6px" : "1px 8px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? T.navTextBright : T.navText,
                    background: isActive ? "rgba(82,168,255,0.16)" : "transparent",
                    transition: "background 120ms, color 120ms",
                    width: collapsed ? 40 : "calc(100% - 16px)",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = T.navHover; e.currentTarget.style.color = T.navTextBright; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navText; } }}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex shrink-0 items-center justify-center" style={{ width: 20, height: 20 }}>
                    <item.Icon />
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && isActive && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        width: 3,
                        height: 20,
                        borderRadius: "0 2px 2px 0",
                        background: "#579DFF",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="mt-auto flex items-center gap-2.5 shrink-0"
        style={{
          height: 52,
          padding: collapsed ? "0 10px" : "0 12px",
          borderTop: `1px solid ${T.navBorder}`,
        }}
      >
        <AvatarCircle userKey="SC" size={28} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate" style={{ fontSize: 13, color: T.navText }}>
              {USERS.SC.name}
            </span>
            <button
              className="flex items-center justify-center rounded cursor-pointer"
              style={{ width: 28, height: 28, color: T.navText, transition: "background 120ms, color 120ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.navHover; e.currentTarget.style.color = T.navTextBright; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navText; }}
              aria-label="Settings"
            >
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
    <header
      className="flex shrink-0 items-center justify-between"
      style={{
        height: 56,
        padding: "0 24px",
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Left: breadcrumb + title */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1" style={{ fontSize: 13, color: T.textSubtlest }} aria-label="Breadcrumb">
          <span className="cursor-pointer hover:underline" style={{ transition: "color 100ms" }} onMouseEnter={(e) => e.currentTarget.style.color = T.brandBold} onMouseLeave={(e) => e.currentTarget.style.color = T.textSubtlest}>Projects</span>
          <span style={{ margin: "0 2px" }}>/</span>
          <span className="cursor-pointer hover:underline" style={{ transition: "color 100ms" }} onMouseEnter={(e) => e.currentTarget.style.color = T.brandBold} onMouseLeave={(e) => e.currentTarget.style.color = T.textSubtlest}>{PROJECT.key}</span>
          <span style={{ margin: "0 2px" }}>/</span>
          <span style={{ fontWeight: 600, color: T.text }}>Backlog</span>
        </nav>
        <span className="cursor-pointer" style={{ color: T.textDisabled, transition: "color 100ms" }} onMouseEnter={(e) => e.currentTarget.style.color = T.textSubtle} onMouseLeave={(e) => e.currentTarget.style.color = T.textDisabled}>
          <StarIcon />
        </span>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center justify-center rounded cursor-pointer"
          style={{ width: 32, height: 32, color: T.textSubtle, transition: "background 120ms" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label="Search"
        >
          <SearchIcon />
        </button>
        {/* Filter */}
        <button
          className="flex items-center gap-1.5 rounded cursor-pointer"
          style={{
            height: 32,
            padding: "0 10px",
            fontSize: 13,
            fontWeight: 500,
            color: T.textSubtle,
            transition: "background 120ms",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <FilterIcon /> Filter
        </button>
        {/* Separator */}
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        {/* Board/Backlog toggle */}
        <div className="flex overflow-hidden rounded-md" style={{ border: `1px solid ${T.border}` }}>
          <button
            className="cursor-pointer"
            style={{
              padding: "0 12px",
              height: 30,
              fontSize: 13,
              fontWeight: 500,
              color: T.textSubtle,
              background: "transparent",
              transition: "background 100ms",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            Board
          </button>
          <button
            className="cursor-pointer"
            style={{
              padding: "0 12px",
              height: 30,
              fontSize: 13,
              fontWeight: 600,
              color: T.textInverse,
              background: T.brandBold,
            }}
          >
            Backlog
          </button>
        </div>
        {/* User avatar */}
        <div style={{ marginLeft: 4 }}>
          <AvatarCircle userKey="SC" size={28} ring />
        </div>
      </div>
    </header>
  );
}

// ─── Sprint Section ──────────────────────────────────────────────────────────

function SprintSection({ issues, expanded, onToggle }) {
  const totalPoints = issues.reduce((s, i) => s + i.points, 0);
  return (
    <section className="mb-3" style={{ borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, boxShadow: "0 1px 3px 0 rgba(9,30,66,0.08)" }}>
      {/* Accent bar */}
      <div style={{ height: 2, borderRadius: "8px 8px 0 0", background: `linear-gradient(90deg, ${T.brandBold} 0%, #579DFF 100%)` }} />
      {/* Header */}
      <div className="flex items-center gap-2" style={{ padding: "10px 12px 10px 8px" }}>
        <button
          onClick={onToggle}
          className="flex items-center justify-center rounded cursor-pointer"
          style={{ width: 24, height: 24, color: T.textSubtle, transition: "background 100ms" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label={expanded ? "Collapse sprint" : "Expand sprint"}
        >
          <ChevronIcon direction={expanded ? "down" : "right"} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{SPRINT.name}</span>
        <span style={{ fontSize: 12, color: T.textSubtlest, marginLeft: 2 }}>{SPRINT.dateRange}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: T.textSubtle,
            background: T.bgNeutral,
            borderRadius: 10,
            padding: "2px 8px",
            marginLeft: 4,
          }}
        >
          {issues.length} issues
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: T.textSubtlest,
            marginLeft: 2,
          }}
        >
          ({totalPoints} points)
        </span>
        <div className="flex-1" />
        <button
          className="flex items-center justify-center rounded cursor-pointer"
          style={{ width: 28, height: 28, color: T.textSubtle, transition: "background 100ms" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label="More actions"
        >
          <MoreIcon />
        </button>
        <button
          className="rounded cursor-pointer"
          style={{
            height: 32,
            padding: "0 12px",
            fontSize: 13,
            fontWeight: 600,
            color: T.textInverse,
            background: T.brandBold,
            border: "none",
            transition: "background 120ms",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.brandBoldHover}
          onMouseLeave={(e) => e.currentTarget.style.background = T.brandBold}
        >
          Complete Sprint
        </button>
      </div>
      {/* Issues */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
          {issues.map((issue) => (
            <IssueRow key={issue.key} issue={issue} />
          ))}
          <CreateIssueRow />
        </div>
      )}
    </section>
  );
}

// ─── Backlog Section ─────────────────────────────────────────────────────────

function BacklogSection({ issues, expanded, onToggle }) {
  const totalPoints = issues.reduce((s, i) => s + i.points, 0);
  return (
    <section style={{ borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, boxShadow: "0 1px 3px 0 rgba(9,30,66,0.08)" }}>
      {/* Accent bar */}
      <div style={{ height: 2, borderRadius: "8px 8px 0 0", background: T.borderBold }} />
      {/* Header */}
      <div className="flex items-center gap-2" style={{ padding: "10px 12px 10px 8px" }}>
        <button
          onClick={onToggle}
          className="flex items-center justify-center rounded cursor-pointer"
          style={{ width: 24, height: 24, color: T.textSubtle, transition: "background 100ms" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label={expanded ? "Collapse backlog" : "Expand backlog"}
        >
          <ChevronIcon direction={expanded ? "down" : "right"} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Backlog</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: T.textSubtle,
            background: T.bgNeutral,
            borderRadius: 10,
            padding: "2px 8px",
            marginLeft: 4,
          }}
        >
          {issues.length} issues
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: T.textSubtlest, marginLeft: 2 }}>
          ({totalPoints} points)
        </span>
        <div className="flex-1" />
        <button
          className="flex items-center justify-center rounded cursor-pointer"
          style={{ width: 28, height: 28, color: T.textSubtle, transition: "background 100ms" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label="More actions"
        >
          <MoreIcon />
        </button>
        <button
          className="rounded cursor-pointer"
          style={{
            height: 32,
            padding: "0 12px",
            fontSize: 13,
            fontWeight: 600,
            color: T.textSubtle,
            background: "transparent",
            border: `1px solid ${T.border}`,
            transition: "background 120ms",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          Create Sprint
        </button>
      </div>
      {/* Issues */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
          {issues.map((issue) => (
            <IssueRow key={issue.key} issue={issue} />
          ))}
          <CreateIssueRow />
        </div>
      )}
    </section>
  );
}

// ─── Root Component ──────────────────────────────────────────────────────────

export default function JiraBacklogMockup() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sprintExpanded, setSprintExpanded] = useState(true);
  const [backlogExpanded, setBacklogExpanded] = useState(true);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        fontFamily: FONT_STACK,
        fontSize: 14,
        lineHeight: "20px",
        color: T.text,
        background: T.surfaceSunken,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>
          <SprintSection
            issues={SPRINT_ISSUES}
            expanded={sprintExpanded}
            onToggle={() => setSprintExpanded((v) => !v)}
          />
          <BacklogSection
            issues={BACKLOG_ISSUES}
            expanded={backlogExpanded}
            onToggle={() => setBacklogExpanded((v) => !v)}
          />
        </main>
      </div>
    </div>
  );
}
