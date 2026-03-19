"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDocument, deleteDocument } from "@/lib/supabase/documents";
import type { CreateDocumentDTO } from "@/domains/docs/types/document";
import { DOCUMENT_KEYS } from "./documentKeys";

/** Uploads a document and invalidates both the project list and (if set) the page list. */
export function useUploadDocument(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, file }: { dto: CreateDocumentDTO; file: File }) =>
      uploadDocument(dto, file),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: DOCUMENT_KEYS.projectList(projectId) });
      if (doc.pageId) {
        qc.invalidateQueries({ queryKey: DOCUMENT_KEYS.pageList(doc.pageId) });
      }
    },
  });
}

/** Soft-deletes a document and invalidates the whole documents cache. */
export function useDeleteDocument(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENT_KEYS.all });
    },
  });
}
