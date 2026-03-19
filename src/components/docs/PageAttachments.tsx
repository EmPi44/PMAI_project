"use client";

import { useRef, useState, useCallback } from "react";
import { T } from "@/lib/tokens";
import type { Document, DocumentFileType } from "@/domains/docs/types/document";
import { usePageDocuments } from "@/domains/docs/api/documentQueries";
import { useUploadDocument, useDeleteDocument } from "@/domains/docs/api/documentMutations";
import { getDocumentUrl } from "@/lib/supabase/documents";

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectFileType(mimeType: string): DocumentFileType {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_ICON: Record<DocumentFileType, string> = {
  pdf: "📄",
  image: "🖼",
  video: "🎬",
  other: "📎",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  onDelete,
}: {
  doc: Document;
  onDelete: (id: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const url = await getDocumentUrl(doc.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }, [doc.storagePath]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 10px",
        borderRadius: 6,
        border: `1px solid ${T.borderSubtle}`,
        background: T.surface,
      }}
    >
      {/* Type icon */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[doc.fileType]}</span>

      {/* Name + size */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: T.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={doc.name}
        >
          {doc.name}
        </div>
        <div style={{ fontSize: 11, color: T.textSubtlest, marginTop: 1 }}>
          {formatBytes(doc.sizeBytes)}
        </div>
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        title="Download"
        style={{
          padding: "3px 10px",
          borderRadius: 4,
          fontSize: 12,
          border: `1px solid ${T.borderSubtle}`,
          background: "transparent",
          color: T.textSubtle,
          cursor: downloading ? "default" : "pointer",
          opacity: downloading ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        {downloading ? "…" : "Download"}
      </button>

      {/* Delete */}
      {confirmDelete ? (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => onDelete(doc.id)}
            style={{
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 12,
              border: `1px solid #C9372C`,
              background: "transparent",
              color: "#C9372C",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 12,
              border: `1px solid ${T.borderSubtle}`,
              background: "transparent",
              color: T.textSubtle,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          title="Remove attachment"
          style={{
            padding: "3px 7px",
            borderRadius: 4,
            fontSize: 12,
            border: "none",
            background: "transparent",
            color: T.textSubtlest,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  pageId: string;
  projectId: string;
}

export function PageAttachments({ pageId, projectId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { data: documents = [] } = usePageDocuments(pageId);
  const upload = useUploadDocument(pageId);
  const remove = useDeleteDocument(pageId);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file) => {
        upload.mutate({
          dto: {
            projectId,
            pageId,
            name: file.name,
            fileType: detectFileType(file.type),
          },
          file,
        });
      });
    },
    [upload, projectId, pageId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div style={{ marginTop: 48, borderTop: `1px solid ${T.borderSubtle}`, paddingTop: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.textSubtle }}>Attachments</span>
          {documents.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.textSubtlest,
                background: T.surfaceSunken,
                border: `1px solid ${T.borderSubtle}`,
                borderRadius: 10,
                padding: "0 7px",
                lineHeight: "18px",
              }}
            >
              {documents.length}
            </span>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending}
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            border: `1px solid ${T.borderSubtle}`,
            background: "transparent",
            color: T.textSubtle,
            cursor: upload.isPending ? "default" : "pointer",
            opacity: upload.isPending ? 0.6 : 1,
          }}
        >
          {upload.isPending ? "Uploading…" : "+ Attach"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => ((e.target as HTMLInputElement).value = "")}
        />
      </div>

      {/* Drop zone - only shown when no documents yet */}
      {documents.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "24px 16px",
            borderRadius: 8,
            border: `2px dashed ${isDragOver ? T.brandBold : T.borderSubtle}`,
            background: isDragOver ? T.brandSubtle : T.surfaceSunken,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 150ms, background 150ms",
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>📎</div>
          <div style={{ fontSize: 13, color: T.textSubtle }}>
            Drop files here or <span style={{ color: T.brandBold, fontWeight: 500 }}>click to attach</span>
          </div>
          <div style={{ fontSize: 11, color: T.textSubtlest, marginTop: 4 }}>
            PDF, images, videos, documents - up to 50 MB
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.length > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: isDragOver ? "8px" : 0,
            borderRadius: 8,
            border: isDragOver ? `2px dashed ${T.brandBold}` : "2px dashed transparent",
            background: isDragOver ? T.brandSubtle : "transparent",
            transition: "border-color 150ms, background 150ms",
          }}
        >
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Upload error */}
      {upload.isError && (
        <div
          style={{
            marginTop: 8,
            padding: "6px 10px",
            borderRadius: 6,
            background: "#FFEDEB",
            border: "1px solid #FF8F73",
            fontSize: 12,
            color: "#C9372C",
          }}
        >
          Upload failed - {upload.error instanceof Error ? upload.error.message : "Unknown error"}
        </div>
      )}
    </div>
  );
}
