"use client";

import { useState, useEffect, useRef } from "react";
import { T } from "@/lib/tokens";
import type { Document, DocumentFileType } from "@/domains/docs/types/document";
import type { PickerState } from "./extensions/DocumentSlashExtension";

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

function getFilteredDocuments(documents: Document[], query: string): Document[] {
  const q = query.toLowerCase();
  const searchStr = q.startsWith("document") ? q.slice(8).trim() : "";
  if (!searchStr) return documents.slice(0, 8);
  return documents.filter((d) => d.name.toLowerCase().includes(searchStr)).slice(0, 8);
}

interface Props {
  state: PickerState;
  documents: Document[];
  onClose: () => void;
}

export function DocumentPickerPopup({ state, documents, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = getFilteredDocuments(documents, state.query);
  const rect = state.clientRect?.();

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filtered.length]);

  // Keyboard navigation via document-level listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          state.selectDocument(filtered[activeIndex]);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [filtered, activeIndex, state, onClose]);

  if (!rect) return null;

  const top = rect.bottom + 6;
  const left = rect.left;

  if (filtered.length === 0) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 1000,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          fontSize: 13,
          color: T.textSubtlest,
          maxWidth: 280,
        }}
      >
        No documents in this project yet.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top,
        left,
        zIndex: 1000,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
        minWidth: 260,
        maxWidth: 340,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px 12px 6px",
          fontSize: 11,
          fontWeight: 600,
          color: T.textSubtlest,
          borderBottom: `1px solid ${T.borderSubtle}`,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Documents
      </div>

      {/* Item list */}
      <div style={{ padding: "4px 0" }}>
        {filtered.map((doc, i) => (
          <button
            key={doc.id}
            onClick={() => {
              state.selectDocument(doc);
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "7px 12px",
              border: "none",
              background: i === activeIndex ? T.surfaceHovered : "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 100ms",
            }}
            onMouseEnter={() => setActiveIndex(i)}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{FILE_ICON[doc.fileType]}</span>
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
              >
                {doc.name}
              </div>
              <div style={{ fontSize: 11, color: T.textSubtlest }}>
                {formatBytes(doc.sizeBytes)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: "5px 12px 7px",
          borderTop: `1px solid ${T.borderSubtle}`,
          fontSize: 11,
          color: T.textSubtlest,
          display: "flex",
          gap: 8,
        }}
      >
        <span>↑↓ navigate</span>
        <span>↵ select</span>
        <span>Esc close</span>
      </div>
    </div>
  );
}
