import { useQuery } from "@tanstack/react-query";
import { questionKeys } from "./keys";
import { fetchQuestions } from "../services/mockQuestionService";

export function useQuestions(projectKey: string) {
  return useQuery({
    queryKey: questionKeys.list(projectKey),
    queryFn: () => fetchQuestions(projectKey),
  });
}
