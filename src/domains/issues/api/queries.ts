import { useQuery } from "@tanstack/react-query";
import { issueKeys } from "./keys";
import { fetchIssues, fetchIssuesBySprintId } from "../services";

export function useIssues() {
  return useQuery({
    queryKey: issueKeys.lists(),
    queryFn: fetchIssues,
  });
}

export function useSprintIssues(sprintId: string) {
  return useQuery({
    queryKey: issueKeys.list({ sprintId }),
    queryFn: () => fetchIssuesBySprintId(sprintId),
  });
}

export function useBacklogIssues() {
  return useQuery({
    queryKey: issueKeys.list({ sprintId: null }),
    queryFn: () => fetchIssuesBySprintId(null),
  });
}
