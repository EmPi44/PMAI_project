import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "./keys";
import { fetchProjectByKey, listProjects } from "@/lib/supabase/projects";

export function useProject(key: string) {
  return useQuery({
    queryKey: projectKeys.detail(key),
    queryFn: () => fetchProjectByKey(key),
    enabled: !!key,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
  });
}
