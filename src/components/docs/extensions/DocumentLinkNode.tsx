"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useState } from "react";
import { T } from "@/lib/tokens";
import { getDocumentUrl } from "@/lib/supabase/documents";
import type { DocumentFileType } from "@/domains/docs/types/document";

const FILE_ICON: Record<DocumentFileType, string> = {
  pdf: "📄",
  image: "🖼",
  video: "🎬",
  other: "📎",
};

function DocumentLinkView({ node }: ReactNodeViewProps) {
  const attrs = node.attrs as {
    documentId: string;
    name: string;
    fileType: string;
    storagePath: string;
  };
  const [loading, setLoading] = useState(false);

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const url = await getDocumentUrl(attrs.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  const icon = FILE_ICON[attrs.fileType as DocumentFileType] ?? "📎";

  return (
    <NodeViewWrapper as="span" style={{ display: "inline" }}>
      <span
        contentEditable={false}
        onClick={handleOpen}
        title={`Open ${attrs.name}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "1px 8px",
          borderRadius: 4,
          background: T.brandSubtle,
          border: `1px solid #BDD7FF`,
          color: T.brandBold,
          fontSize: 13,
          fontWeight: 500,
          cursor: loading ? "default" : "pointer",
          userSelect: "none",
          opacity: loading ? 0.7 : 1,
          verticalAlign: "middle",
          transition: "background 120ms",
        }}
      >
        <span>{icon}</span>
        <span>{loading ? "Opening…" : attrs.name}</span>
      </span>
    </NodeViewWrapper>
  );
}

export const DocumentLinkNode = Node.create({
  name: "documentLink",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      documentId: { default: null },
      name: { default: "" },
      fileType: { default: "other" },
      storagePath: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-doc-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-doc-id": HTMLAttributes.documentId }, HTMLAttributes),
      `📎 ${HTMLAttributes.name}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocumentLinkView);
  },
});
