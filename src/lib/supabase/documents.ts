import { supabase } from "./client";
import type { Document, CreateDocumentDTO } from "@/domains/docs/types/document";

// ── DB row type ───────────────────────────────────────────────────────────────

interface DocumentRow {
  id: string;
  project_id: string;
  page_id: string | null;
  name: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  bucket_name: string;
  metadata: Record<string, unknown>;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

function mapDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    projectId: row.project_id,
    pageId: row.page_id,
    name: row.name,
    fileName: row.file_name,
    fileType: row.file_type as Document["fileType"],
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
    bucketName: row.bucket_name,
    metadata: row.metadata,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLS =
  "id, project_id, page_id, name, file_name, file_type, mime_type, size_bytes, storage_path, bucket_name, metadata, uploaded_by, created_at, updated_at";

// ── Queries ───────────────────────────────────────────────────────────────────

/** All non-deleted documents for a project, newest first. */
export async function listDocuments(projectId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select(SELECT_COLS)
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DocumentRow[] ?? []).map(mapDocument);
}

/** All non-deleted documents for a specific page. */
export async function listPageDocuments(pageId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select(SELECT_COLS)
    .eq("page_id", pageId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DocumentRow[] ?? []).map(mapDocument);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Uploads a file to Supabase Storage and creates the document record.
 * Storage path: {projectId}/{documentId}/{fileName}
 */
export async function uploadDocument(dto: CreateDocumentDTO, file: File): Promise<Document> {
  // 1. Insert document record first to get the UUID for the storage path
  const { data: row, error: insertError } = await supabase
    .from("documents")
    .insert({
      project_id: dto.projectId,
      page_id: dto.pageId ?? null,
      name: dto.name,
      file_name: file.name,
      file_type: dto.fileType,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: "pending", // will be updated after upload
      bucket_name: "project-documents",
      metadata: dto.metadata ?? {},
    })
    .select(SELECT_COLS)
    .single();

  if (insertError) throw insertError;

  const documentId = (row as DocumentRow).id;
  const storagePath = `${dto.projectId}/${documentId}/${file.name}`;

  // 2. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("project-documents")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    // Rollback DB record
    await supabase.from("documents").delete().eq("id", documentId);
    throw uploadError;
  }

  // 3. Update storage_path now that we know it
  const { data: updated, error: updateError } = await supabase
    .from("documents")
    .update({ storage_path: storagePath })
    .eq("id", documentId)
    .select(SELECT_COLS)
    .single();

  if (updateError) throw updateError;
  return mapDocument(updated as DocumentRow);
}

/** Returns a short-lived signed URL (1 hour) for downloading a document. */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("project-documents")
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}

/** Soft-deletes the document record (Storage file is kept). */
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
