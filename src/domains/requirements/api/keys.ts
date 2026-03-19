export const requirementKeys = {
  all: ["requirements"] as const,
  lists: () => [...requirementKeys.all, "list"] as const,
  list: (projectId: string) => [...requirementKeys.lists(), { projectId }] as const,
};
