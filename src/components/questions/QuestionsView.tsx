"use client";

import { useState } from "react";
import { T, FONT_STACK } from "@/lib/tokens";
import { useQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from "@/domains/questions";
import type { QuestionTag, QuestionStatus } from "@/domains/questions";

type FilterTab = "all" | "internal" | "external";

const TAG_STYLES: Record<QuestionTag, { bg: string; text: string; label: string }> = {
  internal: { bg: "#E9F2FF", text: "#0C66E4", label: "Internal" },
  external: { bg: "#F3F0FF", text: "#5E4DB2", label: "External" },
};

const STATUS_STYLES: Record<QuestionStatus, { bg: string; text: string; label: string }> = {
  open:     { bg: "#FFF7D6", text: "#974F0C", label: "Open" },
  answered: { bg: "#DFFCF0", text: "#1F845A", label: "Answered" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface AddQuestionFormProps {
  onSubmit: (data: { title: string; body: string; tags: QuestionTag[]; source: string }) => void;
  onCancel: () => void;
}

function AddQuestionForm({ onSubmit, onCancel }: AddQuestionFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState<QuestionTag[]>(["internal"]);

  function toggleTag(tag: QuestionTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), body: body.trim(), tags, source: source.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        boxShadow: "0 1px 3px rgba(9,30,66,0.08)",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <input
          autoFocus
          placeholder="Question title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            border: `1px solid ${T.border}`,
            borderRadius: 4,
            padding: "7px 10px",
            fontSize: 14,
            color: T.text,
            fontFamily: FONT_STACK,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; e.currentTarget.style.boxShadow = `0 0 0 2px ${T.brandSubtle}`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <textarea
          placeholder="Description (optional)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            border: `1px solid ${T.border}`,
            borderRadius: 4,
            padding: "7px 10px",
            fontSize: 13,
            color: T.text,
            fontFamily: FONT_STACK,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; e.currentTarget.style.boxShadow = `0 0 0 2px ${T.brandSubtle}`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSubtle, minWidth: 36 }}>Tags</span>
        <div style={{ display: "flex", gap: 6 }}>
          {(["internal", "external"] as QuestionTag[]).map((tag) => {
            const s = TAG_STYLES[tag];
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 3,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `2px solid ${active ? s.text : T.border}`,
                  background: active ? s.bg : "transparent",
                  color: active ? s.text : T.textSubtle,
                  transition: "all 100ms",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <input
          placeholder="Source / context (e.g. customer call Mar 18)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{
            flex: 1,
            border: `1px solid ${T.border}`,
            borderRadius: 4,
            padding: "5px 10px",
            fontSize: 12,
            color: T.text,
            fontFamily: FONT_STACK,
            outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.text,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT_STACK,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || tags.length === 0}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: "none",
            background: title.trim() && tags.length > 0 ? T.brandBold : T.surfaceHovered,
            color: title.trim() && tags.length > 0 ? "#fff" : T.textDisabled,
            fontSize: 13,
            fontWeight: 600,
            cursor: title.trim() && tags.length > 0 ? "pointer" : "not-allowed",
            fontFamily: FONT_STACK,
          }}
        >
          Add Question
        </button>
      </div>
    </form>
  );
}

interface QuestionRowProps {
  question: import("@/domains/questions").Question;
  onMarkAnswered: () => void;
  onDelete: () => void;
}

function QuestionRow({ question, onMarkAnswered, onDelete }: QuestionRowProps) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_STYLES[question.status];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: `1px solid ${T.border}`,
        background: hovered ? T.surfaceHovered : T.surface,
        transition: "background 100ms",
        padding: "11px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0, paddingTop: 1 }}>
          {question.tags.map((tag) => {
            const s = TAG_STYLES[tag];
            return (
              <span
                key={tag}
                style={{
                  padding: "2px 7px",
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 700,
                  background: s.bg,
                  color: s.text,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </span>
            );
          })}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: FONT_STACK,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: T.text,
                lineHeight: "20px",
              }}
            >
              {question.title}
            </span>
          </button>

          {question.source && (
            <div style={{ fontSize: 12, color: T.textSubtlest, marginTop: 2 }}>
              {question.source}
            </div>
          )}

          {expanded && question.body && (
            <div
              style={{
                fontSize: 13,
                color: T.textSubtle,
                marginTop: 6,
                lineHeight: "18px",
                whiteSpace: "pre-wrap",
              }}
            >
              {question.body}
            </div>
          )}

          {expanded && question.answer && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 10px",
                background: STATUS_STYLES.answered.bg,
                borderRadius: 4,
                fontSize: 13,
                color: T.text,
                lineHeight: "18px",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_STYLES.answered.text, display: "block", marginBottom: 2 }}>
                ANSWER
              </span>
              {question.answer}
            </div>
          )}
        </div>

        {/* Right side: status + date + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 3,
              fontSize: 11,
              fontWeight: 700,
              background: statusStyle.bg,
              color: statusStyle.text,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {statusStyle.label}
          </span>

          <span style={{ fontSize: 12, color: T.textSubtlest, whiteSpace: "nowrap" }}>
            {formatDate(question.createdAt)}
          </span>

          {hovered && (
            <div style={{ display: "flex", gap: 4 }}>
              {question.status === "open" && (
                <button
                  onClick={onMarkAnswered}
                  title="Mark as answered"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 3,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    color: STATUS_STYLES.answered.text,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONT_STACK,
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = STATUS_STYLES.answered.bg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; }}
                >
                  ✓ Answered
                </button>
              )}
              <button
                onClick={onDelete}
                title="Delete question"
                style={{
                  padding: "3px 7px",
                  borderRadius: 3,
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                  color: T.textSubtle,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: FONT_STACK,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FFEDEB"; e.currentTarget.style.color = "#C9372C"; e.currentTarget.style.borderColor = "#FFBDAD"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.textSubtle; e.currentTarget.style.borderColor = T.border; }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuestionsView() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: questions = [], isLoading } = useQuestions("NOVA");
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const filtered = questions.filter((q) => {
    if (filter === "internal") return q.tags.includes("internal");
    if (filter === "external") return q.tags.includes("external");
    return true;
  });

  const openCount = questions.filter((q) => q.status === "open").length;

  async function handleAdd(data: { title: string; body: string; tags: QuestionTag[]; source: string }) {
    await createQuestion.mutateAsync({
      title: data.title,
      body: data.body || undefined,
      tags: data.tags,
      source: data.source || undefined,
      projectKey: "NOVA",
    });
    setShowAddForm(false);
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: T.surfaceSunken,
        fontFamily: FONT_STACK,
      }}
    >
      {/* Page header */}
      <div
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: "16px 24px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text, lineHeight: "26px" }}>
              Questions
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: T.textSubtle }}>
              Open questions from meetings, customer calls, and implementation discussions.
              {openCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    padding: "1px 7px",
                    borderRadius: 10,
                    background: "#FFF7D6",
                    color: "#974F0C",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {openCount} open
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 4,
              border: "none",
              background: T.brandBold,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: showAddForm ? "default" : "pointer",
              opacity: showAddForm ? 0.5 : 1,
              fontFamily: FONT_STACK,
            }}
            onMouseEnter={(e) => { if (!showAddForm) e.currentTarget.style.background = "#0055CC"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.brandBold; }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Question
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {(["all", "internal", "external"] as FilterTab[]).map((tab) => {
            const active = filter === tab;
            const labels: Record<FilterTab, string> = { all: "All", internal: "Internal", external: "External" };
            const counts: Record<FilterTab, number> = {
              all: questions.length,
              internal: questions.filter((q) => q.tags.includes("internal")).length,
              external: questions.filter((q) => q.tags.includes("external")).length,
            };
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  borderBottom: active ? `2px solid ${T.brandBold}` : "2px solid transparent",
                  background: "transparent",
                  color: active ? T.brandBold : T.textSubtle,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: FONT_STACK,
                  transition: "color 100ms",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {labels[tab]}
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    background: active ? T.brandSubtle : T.surfaceHovered,
                    color: active ? T.brandBold : T.textSubtle,
                  }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
        {showAddForm && (
          <AddQuestionForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {isLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: T.textSubtlest, fontSize: 14 }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: T.textSubtlest,
              fontSize: 14,
              background: T.surface,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>?</div>
            <div style={{ fontWeight: 600, color: T.textSubtle, marginBottom: 4 }}>No questions yet</div>
            <div>Questions that come up in discussions will appear here.</div>
          </div>
        ) : (
          <div
            style={{
              background: T.surface,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
            }}
          >
            {filtered.map((q) => (
              <QuestionRow
                key={q.id}
                question={q}
                onMarkAnswered={() =>
                  updateQuestion.mutate({ id: q.id, dto: { status: "answered" } })
                }
                onDelete={() => deleteQuestion.mutate(q.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
