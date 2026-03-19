"use client";

import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { T } from "@/lib/tokens";
import type { Document, DocumentFileType } from "@/domains/docs/types/document";
import { useProjectDocuments } from "@/domains/docs/api/documentQueries";
import { useDeleteDocument } from "@/domains/docs/api/documentMutations";
import { uploadDocument, getDocumentUrl } from "@/lib/supabase/documents";
import { DOCUMENT_KEYS } from "@/domains/docs/api/documentKeys";

type FileUploadStatus =
  | { status: "uploading" }
  | { status: "error"; message: string };

type UploadStateMap = Record<string, { fileName: string } & FileUploadStatus>;

const FILE_ICON: Record<DocumentFileType, string> = {
  pdf: "📄",
  image: "🖼",
  video: "🎬",
  other: "📎",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectFileType(mimeType: string): DocumentFileType {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
}

function DocItem({
  doc,
  onDelete,
}: {
  doc: Document;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const url = await getDocumentUrl(doc.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }, [doc.storagePath, loading]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 8px",
        borderRadius: 4,
        background: hovered ? T.surfaceHovered : "transparent",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0 }}>{FILE_ICON[doc.fileType]}</span>
      <span
        onClick={handleOpen}
        style={{
          flex: 1,
          fontSize: 12,
          color: loading ? T.textSubtlest : T.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
        title={doc.name}
      >
        {loading ? "Opening…" : doc.name}
      </span>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
          title="Remove"
          style={{
            padding: 0,
            border: "none",
            background: "transparent",
            color: T.textSubtlest,
            cursor: "pointer",
            fontSize: 11,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
      {hovered && !loading && (
        <span style={{ fontSize: 10, color: T.textSubtlest, flexShrink: 0 }}>
          {formatBytes(doc.sizeBytes)}
        </span>
      )}
    </div>
  );
}

interface Props {
  projectId: string;
}

function extractErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "object" && err !== null) {
    // Supabase StorageError has message property
    if ("message" in err && typeof (err as { message: unknown }).message === "string") {
      return (err as { message: string }).message;
    }
    if ("error" in err && typeof (err as { error: unknown }).error === "string") {
      return (err as { error: string }).error;
    }
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export function ProjectDocuments({ projectId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStates, setUploadStates] = useState<UploadStateMap>({});

  const qc = useQueryClient();
  const { data: documents = [] } = useProjectDocuments(projectId);
  const remove = useDeleteDocument(projectId);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file) => {
        const key = `${file.name}-${Date.now()}`;
        setUploadStates((prev) => ({
          ...prev,
          [key]: { status: "uploading", fileName: file.name },
        }));
        uploadDocument(
          { projectId, pageId: null, name: file.name, fileType: detectFileType(file.type) },
          file
        )
          .then(() => {
            setUploadStates((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
            qc.invalidateQueries({ queryKey: DOCUMENT_KEYS.projectList(projectId) });
          })
          .catch((err: unknown) => {
            setUploadStates((prev) => ({
              ...prev,
              [key]: { status: "error", fileName: file.name, message: extractErrorMessage(err) },
            }));
          });
      });
    },
    [projectId, qc]
  );

  const dismissError = useCallback((key: string) => {
    setUploadStates((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      style={{
        borderTop: `1px solid ${T.borderSubtle}`,
        padding: "8px 0",
        background: isDragOver ? T.brandSubtle : "transparent",
        transition: "background 150ms",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 12px 4px",
        }}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: T.textSubtlest,
              display: "inline-block",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 150ms",
              lineHeight: 1,
            }}
          >
            ▶
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtle, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Documents
          </span>
          {documents.length > 0 && (
            <span
              style={{
                fontSize: 10,
                color: T.textSubtlest,
                background: T.surfacePressed,
                borderRadius: 8,
                padding: "0 5px",
                lineHeight: "16px",
              }}
            >
              {documents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload document"
          style={{
            padding: "1px 6px",
            border: "none",
            background: "transparent",
            color: T.textSubtle,
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
            borderRadius: 3,
          }}
        >
          +
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />

      {/* Document list */}
      {expanded && (
        <div style={{ padding: "0 4px" }}>
          {documents.length === 0 ? (
            <div
              style={{
                padding: "8px 12px",
                fontSize: 12,
                color: T.textSubtlest,
                fontStyle: "italic",
              }}
            >
              {isDragOver ? "Drop to upload…" : "No documents yet. Drop files or click +"}
            </div>
          ) : (
            documents.map((doc) => (
              <DocItem
                key={doc.id}
                doc={doc}
                onDelete={(id) => remove.mutate(id)}
              />
            ))
          )}
        </div>
      )}

      {/* Per-file upload status */}
      {Object.entries(uploadStates).length > 0 && (
        <div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(uploadStates).map(([key, state]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                padding: "5px 8px",
                borderRadius: 4,
                background: state.status === "error" ? T.bgDangerSubtle : T.bgInfoSubtle,
                border: `1px solid ${state.status === "error" ? "#FF8F73" : "#B3D4FF"}`,
                fontSize: 11,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>
                {state.status === "uploading" ? "⏳" : "❌"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: state.status === "error" ? T.textDanger : T.textInfo,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={state.fileName}
                >
                  {state.fileName}
                </div>
                <div style={{ color: state.status === "error" ? T.textDanger : T.textSubtlest, marginTop: 1 }}>
                  {state.status === "uploading" ? "Uploading…" : state.message}
                </div>
              </div>
              {state.status === "error" && (
                <button
                  onClick={() => dismissError(key)}
                  style={{
                    flexShrink: 0,
                    border: "none",
                    background: "transparent",
                    color: T.textDanger,
                    cursor: "pointer",
                    fontSize: 11,
                    padding: 0,
                    lineHeight: 1,
                    marginTop: 1,
                  }}
                  title="Dismiss"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
