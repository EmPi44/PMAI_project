import { T } from "@/lib/tokens";

export default function WorkflowsPage() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center"
      style={{ background: T.surfaceSunken, minHeight: "100%" }}
    >
      <div style={{ textAlign: "center", color: T.textSubtle }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto 16px", opacity: 0.4 }}
        >
          <rect x="3" y="3" width="5" height="5" rx="1" />
          <rect x="16" y="3" width="5" height="5" rx="1" />
          <rect x="9.5" y="16" width="5" height="5" rx="1" />
          <path d="M5.5 8v2c0 1 .5 1.5 1.5 1.5h10c1 0 1.5-.5 1.5-1.5V8M12 13.5V16" />
        </svg>
        <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          Workflows
        </p>
        <p style={{ fontSize: 14 }}>No workflows configured yet.</p>
      </div>
    </div>
  );
}
