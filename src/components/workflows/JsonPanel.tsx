"use client";

import { useState, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import { T } from "@/lib/tokens";

interface Props {
  nodes: Node[];
  edges: Edge[];
  onApply: (nodes: Node[], edges: Edge[]) => void;
}

export function JsonPanel({ nodes, edges, onApply }: Props) {
  const canonical = JSON.stringify({ nodes, edges }, null, 2);
  const [draft, setDraft] = useState(canonical);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Keep draft in sync when canvas changes externally
  useEffect(() => {
    setDraft(canonical);
    setError(null);
  }, [canonical]);

  function handleApply() {
    try {
      const parsed = JSON.parse(draft) as { nodes: Node[]; edges: Edge[] };
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("JSON must have { nodes: [], edges: [] }");
      }
      onApply(parsed.nodes, parsed.edges);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      style={{
        width: 340,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          height: 40,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1 }}>
          Flow JSON
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 11,
            color: copied ? T.brandBold : T.textSubtle,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={draft}
        onChange={(e) => { setDraft(e.target.value); setError(null); }}
        spellCheck={false}
        style={{
          flex: 1,
          resize: "none",
          border: "none",
          outline: "none",
          padding: "12px",
          fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          fontSize: 11,
          lineHeight: "18px",
          color: T.text,
          background: T.surfaceSunken,
        }}
      />

      {/* Footer */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {error && (
          <span style={{ flex: 1, fontSize: 11, color: "#AE2A19" }} title={error}>
            ⚠ {error}
          </span>
        )}
        {!error && <div style={{ flex: 1 }} />}
        <button
          onClick={handleApply}
          style={{
            padding: "5px 14px",
            borderRadius: 4,
            border: "none",
            background: T.brandBold,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
