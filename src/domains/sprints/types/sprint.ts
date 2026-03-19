export interface Sprint {
  id: string;
  name: string;
  dateRange: string;
  projectKey: string;
  status: "active" | "closed" | "future";
}
