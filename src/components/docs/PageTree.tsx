"use client";

import { useState } from "react";
import { T } from "@/lib/tokens";
import type { PageTreeNode } from "@/domains/docs/types/page";
import { ChevronIcon, PlusIcon } from "@/components/icons";

interface Props {
  tree: PageTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}

interface ItemProps {
  node: PageTreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}

function PageTreeItem({ node, depth, selectedId, onSelect, onAddChild, onDelete }: ItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isSelected = node.id === selectedId;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-center rounded cursor-pointer select-none"
        style={{
          paddingLeft: 8 + depth * 16,
          paddingRight: 4,
          height: 30,
          background: isSelected ? "rgba(82,168,255,0.16)" : hovered ? T.surfaceHovered : "transparent",
          position: "relative",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/collapse toggle */}
        <button
          className="flex items-center justify-center shrink-0 rounded"
          style={{
            width: 18,
            height: 18,
            color: T.textSubtle,
            background: "transparent",
            border: "none",
            opacity: hasChildren ? 1 : 0,
            cursor: hasChildren ? "pointer" : "default",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded((v) => !v);
          }}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronIcon direction={expanded ? "down" : "right"} />
        </button>

        {/* Icon */}
        <span style={{ fontSize: 14, marginRight: 6, lineHeight: 1 }}>{node.icon}</span>

        {/* Title */}
        <span
          className="flex-1 truncate"
          style={{
            fontSize: 13,
            color: isSelected ? T.brandBold : T.text,
            fontWeight: isSelected ? 500 : 400,
          }}
        >
          {node.title || "Untitled"}
        </span>

        {/* Actions (shown on hover) */}
        {(hovered || isSelected) && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              className="flex items-center justify-center rounded"
              style={{
                width: 20,
                height: 20,
                color: T.textSubtle,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              title="Add sub-page"
            >
              <PlusIcon size={12} />
            </button>
          </div>
        )}

        {/* Active indicator */}
        {isSelected && (
          <span
            style={{
              position: "absolute",
              left: 0,
              width: 3,
              height: 18,
              borderRadius: "0 2px 2px 0",
              background: "#579DFF",
            }}
          />
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageTree({ tree, selectedId, onSelect, onAddChild, onDelete }: Props) {
  return (
    <div className="flex flex-col h-full" style={{ overflowY: "auto", scrollbarWidth: "none" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "8px 12px 6px",
          borderBottom: `1px solid ${T.borderSubtle}`,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.textSubtlest }}>
          PAGES
        </span>
        <button
          className="flex items-center justify-center rounded"
          style={{
            width: 22,
            height: 22,
            color: T.textSubtle,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => onAddChild(null)}
          title="New root page"
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 py-1 px-1">
        {tree.length === 0 ? (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
              fontSize: 13,
              color: T.textSubtlest,
            }}
          >
            No pages yet.
            <br />
            <button
              style={{
                marginTop: 8,
                color: T.brandBold,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
              }}
              onClick={() => onAddChild(null)}
            >
              Create your first page
            </button>
          </div>
        ) : (
          tree.map((node) => (
            <PageTreeItem
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
