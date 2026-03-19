"use client";

import { useState } from "react";
import { useSprintIssues, useBacklogIssues, useCreateIssue, useUpdateIssue } from "@/domains/issues/api";
import { useUsers } from "@/domains/users/api";
import { useSprints } from "@/domains/sprints/api";
import { SprintSection } from "./SprintSection";
import { BacklogSection } from "./BacklogSection";
import type { IssueStatus } from "@/domains/issues/types";

export function BacklogView() {
  const [sprintExpanded, setSprintExpanded] = useState(true);
  const [backlogExpanded, setBacklogExpanded] = useState(true);

  const { data: sprints } = useSprints("NOVA");
  const activeSprint = sprints?.find((s) => s.status === "active");

  const { data: sprintIssues = [] } = useSprintIssues(activeSprint?.id ?? "sprint-24");
  const { data: backlogIssues = [] } = useBacklogIssues();
  const { data: usersList = [] } = useUsers();

  const createIssueMutation = useCreateIssue();
  const updateIssueMutation = useUpdateIssue();

  // Build users lookup
  const users: Record<string, (typeof usersList)[number]> = {};
  for (const u of usersList) {
    users[u.id] = u;
  }

  function handleStatusChange(key: string, status: IssueStatus) {
    updateIssueMutation.mutate({ key, dto: { status } });
  }

  function handleCreateSprintIssue(summary: string) {
    createIssueMutation.mutate({
      type: "Task",
      summary,
      priority: "Medium",
      sprintId: activeSprint?.id ?? "sprint-24",
    });
  }

  function handleCreateBacklogIssue(summary: string) {
    createIssueMutation.mutate({
      type: "Task",
      summary,
      priority: "Medium",
      sprintId: null,
    });
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>
      {activeSprint && (
        <SprintSection
          sprint={activeSprint}
          issues={sprintIssues}
          users={users}
          expanded={sprintExpanded}
          onToggle={() => setSprintExpanded((v) => !v)}
          onStatusChange={handleStatusChange}
          onCreateIssue={handleCreateSprintIssue}
        />
      )}
      <BacklogSection
        issues={backlogIssues}
        users={users}
        expanded={backlogExpanded}
        onToggle={() => setBacklogExpanded((v) => !v)}
        onStatusChange={handleStatusChange}
        onCreateIssue={handleCreateBacklogIssue}
      />
    </main>
  );
}
