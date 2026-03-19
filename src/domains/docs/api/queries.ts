"use client";

import { useQuery } from "@tanstack/react-query";
import { listPages, getPage } from "@/lib/supabase/pages";
import { DOCS_KEYS } from "./keys";

export function usePages(projectId: string) {
  return useQuery({
    queryKey: DOCS_KEYS.list(projectId),
    queryFn: () => listPages(projectId),
  });
}

export function usePage(id: string | null) {
  return useQuery({
    queryKey: DOCS_KEYS.detail(id ?? ""),
    queryFn: () => getPage(id!),
    enabled: !!id,
  });
}
