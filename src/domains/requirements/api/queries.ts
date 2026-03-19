import { useQuery } from "@tanstack/react-query";
import { requirementKeys } from "./keys";
import { listRequirements } from "@/lib/supabase/requirements";

export function useRequirements(projectId: string) {
  return useQuery({
    queryKey: requirementKeys.list(projectId),
    queryFn: () => listRequirements(projectId),
  });
}
