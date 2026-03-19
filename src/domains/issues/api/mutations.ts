import { useMutation, useQueryClient } from "@tanstack/react-query";
import { issueKeys } from "./keys";
import { createIssue, updateIssue } from "../services";
import type { CreateIssueDTO, UpdateIssueDTO } from "../types";

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateIssueDTO) => createIssue(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, dto }: { key: string; dto: UpdateIssueDTO }) =>
      updateIssue(key, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
  });
}
