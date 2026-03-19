"use client";

import { T } from "@/lib/tokens";
import { IssueTypeIcon, PriorityIcon, DragHandleIcon } from "@/components/icons";
import { StatusLozenge, StoryPointsBadge, AvatarCircle } from "@/components/ui";
import type { Issue, IssueStatus } from "@/domains/issues/types";
import type { User } from "@/domains/users/types";

interface Props {
  issue: Issue;
  users: Record<string, User>;
  onStatusChange?: (key: string, status: IssueStatus) => void;
}

export function IssueRow({ issue, users, onStatusChange }: Props) {
  const user = issue.assignee ? users[issue.assignee] ?? null : null;

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
      <AvatarCircle user={user} size={22} />
      {/* Status lozenge */}
      <StatusLozenge
        status={issue.status}
        onStatusChange={onStatusChange ? (s) => onStatusChange(issue.key, s) : undefined}
      />
      {/* Story points */}
      <StoryPointsBadge points={issue.points} />
    </div>
  );
}
