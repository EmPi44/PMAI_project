"use client";

import { useState, useRef } from "react";
import { T } from "@/lib/tokens";
import { PlusIcon } from "@/components/icons";

interface Props {
  onCreateIssue?: (summary: string) => void;
}

export function CreateIssueRow({ onCreateIssue }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed && onCreateIssue) {
      onCreateIssue(trimmed);
    }
    setValue("");
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        className="flex w-full items-center gap-2 px-3"
        style={{ height: 36 }}
      >
        <PlusIcon size={13} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") { setValue(""); setEditing(false); }
          }}
          onBlur={handleSubmit}
          placeholder="What needs to be done?"
          autoFocus
          className="min-w-0 flex-1 border-none bg-transparent outline-none"
          style={{ fontSize: 13, color: T.text }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex w-full items-center gap-2 px-3 cursor-pointer"
      style={{
        height: 36,
        color: T.textDisabled,
        fontSize: 13,
        transition: "color 120ms, background 120ms",
        border: "none",
        background: "transparent",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.textSubtle; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textDisabled; }}
    >
      <PlusIcon size={13} />
      <span>Create issue</span>
    </button>
  );
}
