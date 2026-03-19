import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requirementKeys } from "./keys";
import {
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from "@/lib/supabase/requirements";
import type { CreateRequirementDTO, UpdateRequirementDTO } from "../types";

export function useCreateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRequirementDTO) => createRequirement(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    },
  });
}

export function useUpdateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRequirementDTO }) =>
      updateRequirement(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    },
  });
}

export function useDeleteRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    },
  });
}
