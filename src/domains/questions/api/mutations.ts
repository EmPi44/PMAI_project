import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionKeys } from "./keys";
import { createQuestion, updateQuestion, deleteQuestion } from "../services/mockQuestionService";
import type { CreateQuestionDTO, UpdateQuestionDTO } from "../types";

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuestionDTO) => createQuestion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateQuestionDTO }) =>
      updateQuestion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}
