"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPage, updatePage, deletePage } from "@/lib/supabase/pages";
import type { CreatePageDTO, UpdatePageDTO } from "@/domains/docs/types/page";
import { DOCS_KEYS } from "./keys";

export function useCreatePage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePageDTO) => createPage(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCS_KEYS.list(projectId) }),
  });
}

export function useUpdatePage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePageDTO }) => updatePage(id, dto),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: DOCS_KEYS.list(projectId) });
      qc.setQueryData(DOCS_KEYS.detail(page.id), page);
    },
  });
}

export function useDeletePage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCS_KEYS.list(projectId) }),
  });
}
