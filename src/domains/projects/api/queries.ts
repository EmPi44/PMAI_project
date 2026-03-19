import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "./keys";
import { fetchProject } from "../services";

export function useProject(key: string) {
  return useQuery({
    queryKey: projectKeys.detail(key),
    queryFn: () => fetchProject(key),
    enabled: !!key,
  });
}
