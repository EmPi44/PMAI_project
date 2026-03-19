"use client";

import { useQuery } from "@tanstack/react-query";
import { listPageDocuments, listDocuments } from "@/lib/supabase/documents";
import { DOCUMENT_KEYS } from "./documentKeys";

export function usePageDocuments(pageId: string) {
  return useQuery({
    queryKey: DOCUMENT_KEYS.pageList(pageId),
    queryFn: () => listPageDocuments(pageId),
    enabled: !!pageId,
  });
}

export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: DOCUMENT_KEYS.projectList(projectId),
    queryFn: () => listDocuments(projectId),
    enabled: !!projectId,
  });
}
