export const projectKeys = {
  all: ["projects"] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (key: string) => [...projectKeys.details(), key] as const,
};
