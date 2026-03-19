export type DocumentFileType = "pdf" | "image" | "video" | "other";

export interface Document {
  id: string;
  projectId: string;
  pageId: string | null;
  name: string;
  fileName: string;
  fileType: DocumentFileType;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  bucketName: string;
  metadata: Record<string, unknown>; // images: {width, height}; PDFs: {pages}; etc.
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDTO {
  projectId: string;
  pageId?: string | null;
  name: string;
  fileType: DocumentFileType;
  metadata?: Record<string, unknown>;
}
