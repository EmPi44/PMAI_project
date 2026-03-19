"use client";

import { T, FONT_STACK, ISSUE_TYPE_COLORS } from "@/lib/tokens";
import { useIssues } from "@/domains/issues/api";
import { useSprints } from "@/domains/sprints/api";
import { getProjectSync } from "@/domains/projects/services";
import type { IssueType } from "@/domains/issues/types";

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: 8,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtlest, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
      <span style={{ fontSize: 32, fontWeight: 700, color: accent ?? T.text, lineHeight: 1.1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: T.textSubtle }}>{sub}</span>
      )}
    </div>
  );
}

// ─── Type breakdown bar ───────────────────────────────────────────────────────

function TypeBreakdownRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 52, fontSize: 12, color: T.textSubtle, textAlign: "right", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: T.bgNeutral, borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 99,
            transition: "width 400ms ease",
          }}
        />
      </div>
      <span style={{ width: 28, fontSize: 12, fontWeight: 600, color: T.text, textAlign: "right", flexShrink: 0 }}>{count}</span>
    </div>
  );
}

// ─── Sprint progress card ─────────────────────────────────────────────────────

function SprintCard({
  name,
  dateRange,
  totalPts,
  donePts,
  inProgressPts,
  toDoPts,
}: {
  name: string;
  dateRange: string;
  totalPts: number;
  donePts: number;
  inProgressPts: number;
  toDoPts: number;
}) {
  const donePct = totalPts > 0 ? (donePts / totalPts) * 100 : 0;
  const activePct = totalPts > 0 ? (inProgressPts / totalPts) * 100 : 0;

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: 8,
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{name}</div>
          <div style={{ fontSize: 11, color: T.textSubtlest, marginTop: 2 }}>{dateRange}</div>
        </div>
        <span
          style={{
            background: T.bgInfoSubtle,
            color: T.textInfo,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 3,
          }}
        >
          Active
        </span>
      </div>

      {/* Segmented progress bar */}
      <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", background: T.bgNeutral, marginBottom: 12 }}>
        <div style={{ width: `${donePct}%`, background: T.bgSuccessBold, transition: "width 400ms ease" }} />
        <div style={{ width: `${activePct}%`, background: T.brandBold, transition: "width 400ms ease" }} />
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.bgSuccessBold, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: T.textSubtle }}>{donePts} pts done</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.brandBold, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: T.textSubtle }}>{inProgressPts} pts active</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.bgNeutral, border: `1px solid ${T.borderBold}`, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: T.textSubtle }}>{toDoPts} pts to do</span>
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderSubtle}` }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{totalPts}</span>
        <span style={{ fontSize: 12, color: T.textSubtlest, marginLeft: 6 }}>total story points</span>
      </div>
    </div>
  );
}

// ─── AI agent row ─────────────────────────────────────────────────────────────

const AGENTS = [
  { name: "Code Reviewer",   color: "#9F8FEF", lastRun: "2h ago",  action: "Reviewed PR #42 — payment validation" },
  { name: "Sprint Planner",  color: "#579DFF", lastRun: "12h ago", action: "Generated scope for Sprint 24" },
  { name: "Backlog Groomer", color: "#4BCE97", lastRun: "1d ago",  action: "Triaged 3 backlog items" },
  { name: "PR Summarizer",   color: "#F87462", lastRun: "3h ago",  action: "Summarized 2 open pull requests" },
];

function AgentRow({ name, color, lastRun, action }: { name: string; color: string; lastRun: string; action: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${T.borderSubtle}`,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: color + "22",
          border: `1.5px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color,
          flexShrink: 0,
        }}
      >
        AI
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{name}</div>
        <div style={{ fontSize: 11, color: T.textSubtlest, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {action}
        </div>
      </div>
      <span style={{ fontSize: 11, color: T.textSubtlest, flexShrink: 0 }}>{lastRun}</span>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: 8,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.textSubtlest,
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ProjectMetricsView() {
  const project = getProjectSync();
  const { data: issues = [], isLoading: issuesLoading } = useIssues();
  const { data: sprints = [], isLoading: sprintsLoading } = useSprints(project.key);

  const activeSprint = sprints.find((s) => s.status === "active");
  const sprintIssues = issues.filter((i) => i.sprintId === activeSprint?.id);

  const total       = issues.length;
  const done        = issues.filter((i) => i.status === "Done").length;
  const inProgress  = issues.filter((i) => i.status === "In Progress").length;
  const toDo        = issues.filter((i) => i.status === "To Do").length;

  const sprintPts       = sprintIssues.reduce((s, i) => s + i.points, 0);
  const sprintDonePts   = sprintIssues.filter((i) => i.status === "Done").reduce((s, i) => s + i.points, 0);
  const sprintActivePts = sprintIssues.filter((i) => i.status === "In Progress").reduce((s, i) => s + i.points, 0);
  const sprintToDoPts   = sprintIssues.filter((i) => i.status === "To Do").reduce((s, i) => s + i.points, 0);

  const typeCounts: Record<IssueType, number> = { Epic: 0, Story: 0, Task: 0, Bug: 0 };
  for (const issue of issues) typeCounts[issue.type]++;

  if (issuesLoading || sprintsLoading) {
    return (
      <div style={{ fontFamily: FONT_STACK, padding: 40, color: T.textSubtle, fontSize: 14 }}>
        Loading metrics…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: FONT_STACK,
        background: T.surfaceSunken,
        minHeight: "100%",
        padding: "32px 40px 64px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text }}>Project Metrics</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSubtlest }}>
            {project.name} · {project.key}
          </p>
        </div>

        {/* ── Top stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          <StatCard label="Total Issues" value={total} sub="across all sprints" />
          <StatCard label="Done" value={done} sub={`${total > 0 ? Math.round((done / total) * 100) : 0}% of total`} accent={T.bgSuccessBold} />
          <StatCard label="In Progress" value={inProgress} sub="currently active" accent={T.brandBold} />
          <StatCard label="To Do" value={toDo} sub="not yet started" accent={T.textSubtle} />
        </div>

        {/* ── Sprint + Type breakdown ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {activeSprint ? (
            <SprintCard
              name={activeSprint.name}
              dateRange={activeSprint.dateRange}
              totalPts={sprintPts}
              donePts={sprintDonePts}
              inProgressPts={sprintActivePts}
              toDoPts={sprintToDoPts}
            />
          ) : (
            <Section title="Active Sprint">
              <span style={{ fontSize: 13, color: T.textSubtlest }}>No active sprint</span>
            </Section>
          )}

          <Section title="Issues by Type">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(["Epic", "Story", "Task", "Bug"] as IssueType[]).map((type) => (
                <TypeBreakdownRow
                  key={type}
                  label={type}
                  count={typeCounts[type]}
                  total={total}
                  color={ISSUE_TYPE_COLORS[type]}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* ── AI agent activity ── */}
        <Section title="AI Agent Activity">
          <div>
            {AGENTS.map((a) => (
              <AgentRow key={a.name} {...a} />
            ))}
            <div
              style={{
                paddingTop: 12,
                fontSize: 11,
                color: T.textSubtlest,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              Live agent logs coming soon
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
