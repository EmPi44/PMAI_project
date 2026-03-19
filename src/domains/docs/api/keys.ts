export const DOCS_KEYS = {
  all: ["pages"] as const,
  list: (projectId: string) => ["pages", projectId] as const,
  detail: (id: string) => ["pages", "detail", id] as const,
};
