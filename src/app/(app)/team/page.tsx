import { T } from "@/lib/tokens";

export default function TeamPage() {
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
          <circle cx="9" cy="7" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
          <path d="M17 14c2.2.5 4 2.2 4 4.5" />
        </svg>
        <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          Team
        </p>
        <p style={{ fontSize: 14 }}>Team members and AI agents will appear here.</p>
      </div>
    </div>
  );
}
