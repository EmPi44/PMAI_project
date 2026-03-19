"use client";

import { useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { T } from "@/lib/tokens";
import type { Page } from "@/domains/docs/types/page";
import type { Document } from "@/domains/docs/types/document";
import { useProjectDocuments } from "@/domains/docs/api/documentQueries";
import { DocumentLinkNode } from "./extensions/DocumentLinkNode";
import { DocumentSlashExtension, type PickerState } from "./extensions/DocumentSlashExtension";
import { DocumentPickerPopup } from "./DocumentPickerPopup";

interface Props {
  page: Page;
  onSave: (id: string, title: string, content: object) => Promise<void>;
  onIconChange: (id: string, icon: string) => void;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
}

const ICON_OPTIONS = ["📄", "📝", "📋", "📌", "🗂️", "💡", "🔧", "🚀", "⚙️", "🎯", "📊", "🔍", "🧩", "📐", "🗒️"];

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Gray", value: "#44546F" },
  { label: "Red", value: "#C9372C" },
  { label: "Orange", value: "#E2740F" },
  { label: "Yellow", value: "#CF9F02" },
  { label: "Green", value: "#1F845A" },
  { label: "Blue", value: "#0C66E4" },
  { label: "Purple", value: "#6554C0" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "#FFF7D6" },
  { label: "Green", value: "#DFFCF0" },
  { label: "Blue", value: "#E9F2FF" },
  { label: "Pink", value: "#FFEDEB" },
  { label: "Purple", value: "#EEE6FF" },
  { label: "Orange", value: "#FFF0E4" },
];

type SaveStatus = "idle" | "unsaved" | "saving" | "saved";

function ToolbarButton({
  label,
  active,
  onClick,
  title,
  style,
}: {
  label: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "2px 7px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${active ? T.brandBold : T.borderSubtle}`,
        background: active ? T.brandSubtle : "transparent",
        color: active ? T.brandBold : T.textSubtle,
        cursor: "pointer",
        lineHeight: "18px",
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: T.borderSubtle, margin: "0 3px", flexShrink: 0 }} />;
}

function ColorPickerDropdown({
  colors,
  activeColor,
  onSelect,
  trigger,
}: {
  colors: { label: string; value: string }[];
  activeColor: string;
  onSelect: (value: string) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "2px 6px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          border: `1px solid ${activeColor ? T.brandBold : T.borderSubtle}`,
          background: activeColor ? T.brandSubtle : "transparent",
          color: activeColor ? T.brandBold : T.textSubtle,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        {trigger}
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              zIndex: 100,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 8,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 4,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              minWidth: 140,
            }}
          >
            {colors.map((c) => (
              <button
                key={c.label}
                title={c.label}
                onClick={() => {
                  onSelect(c.value);
                  setOpen(false);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: c.value === activeColor ? `2px solid ${T.brandBold}` : `1px solid ${T.borderSubtle}`,
                  background: c.value || T.surface,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: c.value ? "transparent" : T.textSubtle,
                }}
              >
                {!c.value && "✕"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function PageEditor({ page, onSave, onIconChange, onDelete, onTitleChange }: Props) {
  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [pickerState, setPickerState] = useState<PickerState | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs for the slash extension (avoids editor recreation on re-render)
  const documentsRef = useRef<Document[]>([]);
  const { data: projectDocuments = [] } = useProjectDocuments(page.projectId);
  documentsRef.current = projectDocuments;

  const scheduleAutoSave = useCallback(
    (newTitle: string, newContent: object) => {
      setSaveStatus("unsaved");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await onSave(page.id, newTitle, newContent);
          setSaveStatus("saved");
          if (savedTimeout.current) clearTimeout(savedTimeout.current);
          savedTimeout.current = setTimeout(() => setSaveStatus("idle"), 2500);
        } catch {
          setSaveStatus("idle");
        }
      }, 800);
    },
    [page.id, onSave]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing… (type / to insert)" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      DocumentLinkNode,
      DocumentSlashExtension.configure({
        documentsRef,
        onOpen: (state) => setPickerState(state),
        onUpdate: (state) => setPickerState(state),
        onClose: () => setPickerState(null),
      }),
    ],
    content: page.content ?? undefined,
    onUpdate: ({ editor }) => {
      scheduleAutoSave(title, editor.getJSON());
    },
  });

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(page.id, newTitle);
    if (editor) scheduleAutoSave(newTitle, editor.getJSON());
  };

  const handleIconSelect = (newIcon: string) => {
    setIcon(newIcon);
    setShowIconPicker(false);
    onIconChange(page.id, newIcon);
  };

  const activeTextColor = editor?.getAttributes("textStyle").color ?? "";
  const activeHighlight = editor?.getAttributes("highlight").color ?? "";

  const saveLabel: { text: string; color: string } = {
    idle:    { text: "", color: "" },
    unsaved: { text: "Unsaved", color: T.textSubtlest },
    saving:  { text: "Saving…", color: T.textSubtle },
    saved:   { text: "Saved", color: T.textSuccess },
  }[saveStatus];

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto" onClick={() => pickerState && setPickerState(null)}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "8px 20px",
          borderBottom: `1px solid ${T.borderSubtle}`,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div className="flex items-center gap-1 flex-wrap">
          {/* Text style */}
          <ToolbarButton label={<b>B</b>} active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold" />
          <ToolbarButton label={<i>I</i>} active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic" />
          <ToolbarButton label={<s>S</s>} active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough" />
          <ToolbarButton label="<>" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()} title="Inline code" />

          <Divider />

          {/* Text color */}
          <ColorPickerDropdown
            colors={TEXT_COLORS}
            activeColor={activeTextColor}
            onSelect={(color) => {
              if (color) editor?.chain().focus().setColor(color).run();
              else editor?.chain().focus().unsetColor().run();
            }}
            trigger={
              <>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    borderBottom: `3px solid ${activeTextColor || T.text}`,
                    lineHeight: "14px",
                  }}
                >
                  A
                </span>
                <span style={{ fontSize: 9 }}>▾</span>
              </>
            }
          />

          {/* Highlight */}
          <ColorPickerDropdown
            colors={HIGHLIGHT_COLORS}
            activeColor={activeHighlight}
            onSelect={(color) => {
              if (color) editor?.chain().focus().setHighlight({ color }).run();
              else editor?.chain().focus().unsetHighlight().run();
            }}
            trigger={
              <>
                <span
                  style={{
                    fontSize: 13,
                    background: activeHighlight || "#FFF7D6",
                    borderRadius: 2,
                    padding: "0 2px",
                    lineHeight: "16px",
                  }}
                >
                  ab
                </span>
                <span style={{ fontSize: 9 }}>▾</span>
              </>
            }
          />

          <Divider />

          {/* Headings */}
          {([1, 2, 3] as const).map((level) => (
            <ToolbarButton
              key={level}
              label={`H${level}`}
              active={editor?.isActive("heading", { level })}
              onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            />
          ))}

          <Divider />

          {/* Lists */}
          <ToolbarButton label="• List" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
          <ToolbarButton label="1. List" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
          <ToolbarButton label="☑ Tasks" active={editor?.isActive("taskList")} onClick={() => editor?.chain().focus().toggleTaskList().run()} />

          <Divider />

          {/* Blocks */}
          <ToolbarButton label="Code" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
          <ToolbarButton label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        </div>

        {/* Right side: save status + delete */}
        <div className="flex items-center gap-8 shrink-0">
          {saveLabel.text && (
            <span style={{ fontSize: 12, color: saveLabel.color, transition: "color 200ms" }}>
              {saveLabel.text}
            </span>
          )}
          <button
            onClick={() => {
              if (confirm("Delete this page?")) onDelete(page.id);
            }}
            style={{
              padding: "3px 10px",
              borderRadius: 4,
              fontSize: 12,
              border: `1px solid ${T.borderSubtle}`,
              background: "transparent",
              color: T.textSubtle,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Page body */}
      <div className="flex-1" style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "40px 48px 80px" }}>
        {/* Icon */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <button
            onClick={() => setShowIconPicker((v) => !v)}
            style={{
              fontSize: 40,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
              padding: 4,
              borderRadius: 8,
            }}
            title="Change icon"
          >
            {icon}
          </button>

          {showIconPicker && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={() => setShowIconPicker(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 100,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: 8,
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 4,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}
              >
                {ICON_OPTIONS.map((em) => (
                  <button
                    key={em}
                    onClick={() => handleIconSelect(em)}
                    style={{
                      fontSize: 22,
                      background: em === icon ? T.brandSubtle : "transparent",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 6,
                      padding: "4px 6px",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          style={{
            width: "100%",
            fontSize: 32,
            fontWeight: 700,
            color: T.text,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: 0,
            marginBottom: 24,
            lineHeight: 1.2,
            fontFamily: "inherit",
          }}
        />

        {/* Editor */}
        <div className="docs-editor" style={{ fontSize: 15, lineHeight: 1.65, color: T.text }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Document slash-command picker */}
      {pickerState && (
        <DocumentPickerPopup
          state={pickerState}
          documents={projectDocuments}
          onClose={() => setPickerState(null)}
        />
      )}
    </div>
  );
}
