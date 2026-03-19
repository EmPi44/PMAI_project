"use client";

import { T } from "@/lib/tokens";
import { ChevronIcon, MoreIcon } from "@/components/icons";
import { CreateIssueRow } from "@/components/ui";
import { IssueRow } from "./IssueRow";
import type { Issue, IssueStatus } from "@/domains/issues/types";
import type { User } from "@/domains/users/types";
import type { Sprint } from "@/domains/sprints/types";

interface Props {
  sprint: Sprint;
  issues: Issue[];
  users: Record<string, User>;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange?: (key: string, status: IssueStatus) => void;
  onCreateIssue?: (summary: string) => void;
}

export function SprintSection({ sprint, issues, users, expanded, onToggle, onStatusChange, onCreateIssue }: Props) {
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
          style={{ width: 24, height: 24, color: T.textSubtle, transition: "background 100ms", border: "none", background: "transparent" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label={expanded ? "Collapse sprint" : "Expand sprint"}
        >
          <ChevronIcon direction={expanded ? "down" : "right"} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{sprint.name}</span>
        <span style={{ fontSize: 12, color: T.textSubtlest, marginLeft: 2 }}>{sprint.dateRange}</span>
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
          style={{ width: 28, height: 28, color: T.textSubtle, transition: "background 100ms", border: "none", background: "transparent" }}
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
            <IssueRow key={issue.key} issue={issue} users={users} onStatusChange={onStatusChange} />
          ))}
          <CreateIssueRow onCreateIssue={onCreateIssue} />
        </div>
      )}
    </section>
  );
}
