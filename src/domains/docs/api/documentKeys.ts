export const DOCUMENT_KEYS = {
  all: ["documents"] as const,
  pageList: (pageId: string) => ["documents", "page", pageId] as const,
  projectList: (projectId: string) => ["documents", "project", projectId] as const,
};
