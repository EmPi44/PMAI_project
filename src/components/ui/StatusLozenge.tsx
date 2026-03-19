"use client";

import { useState, useRef, useEffect } from "react";
import { T, STATUS_CONFIG } from "@/lib/tokens";
import type { IssueStatus } from "@/domains/issues/types";

interface Props {
  status: IssueStatus;
  onStatusChange?: (status: IssueStatus) => void;
}

const ALL_STATUSES: IssueStatus[] = ["To Do", "In Progress", "Done"];

function getLabel(status: IssueStatus): string {
  if (status === "In Progress") return "IN PROGRESS";
  if (status === "To Do") return "TO DO";
  return "DONE";
}

export function StatusLozenge({ status, onStatusChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["To Do"];

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onStatusChange) setOpen(!open);
        }}
        className="inline-flex shrink-0 items-center rounded px-1.5 py-px"
        style={{
          backgroundColor: cfg.bg,
          color: cfg.text,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.02em",
          lineHeight: "16px",
          textTransform: "uppercase",
          cursor: onStatusChange ? "pointer" : "default",
          border: "none",
        }}
      >
        {getLabel(status)}
      </button>
      {open && onStatusChange && (
        <div
          className="absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-md"
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            boxShadow: "0 4px 16px rgba(9,30,66,0.16)",
            minWidth: 140,
          }}
        >
          {ALL_STATUSES.map((s) => {
            const sCfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2"
                style={{
                  fontSize: 12,
                  fontWeight: s === status ? 600 : 400,
                  color: T.text,
                  background: s === status ? T.surfaceHovered : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = s === status ? T.surfaceHovered : "transparent"; }}
              >
                <span
                  className="inline-flex items-center rounded px-1.5 py-px"
                  style={{
                    backgroundColor: sCfg.bg,
                    color: sCfg.text,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    lineHeight: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  {getLabel(s)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
