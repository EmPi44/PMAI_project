import { useQuery } from "@tanstack/react-query";
import { sprintKeys } from "./keys";
import { fetchSprints, fetchSprint } from "../services";

export function useSprints(projectKey?: string) {
  return useQuery({
    queryKey: sprintKeys.list(projectKey),
    queryFn: () => fetchSprints(projectKey),
  });
}

export function useSprint(id: string) {
  return useQuery({
    queryKey: sprintKeys.detail(id),
    queryFn: () => fetchSprint(id),
  });
}
