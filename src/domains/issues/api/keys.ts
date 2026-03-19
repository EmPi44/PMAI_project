export const issueKeys = {
  all: ["issues"] as const,
  lists: () => [...issueKeys.all, "list"] as const,
  list: (filters: { sprintId?: string | null }) =>
    [...issueKeys.lists(), filters] as const,
  details: () => [...issueKeys.all, "detail"] as const,
  detail: (key: string) => [...issueKeys.details(), key] as const,
};
