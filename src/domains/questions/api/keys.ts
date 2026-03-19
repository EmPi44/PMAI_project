export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (projectKey: string) => [...questionKeys.lists(), { projectKey }] as const,
};
