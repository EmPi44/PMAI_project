import { ISSUE_TYPE_COLORS } from "@/lib/tokens";
import type { IssueType } from "@/domains/issues/types";

interface Props {
  type: IssueType;
}

const shapes: Record<IssueType, React.ReactNode> = {
  Epic: <path d="M11.5 7.5L8 4 4.5 7.5M8 4v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  Story: <path d="M5.5 3.5h5v9l-2.5-1.75L5.5 12.5V3.5z" fill="#fff" />,
  Task: <path d="M4.5 8l2.25 2.25L11.5 5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  Bug: <circle cx="8" cy="8" r="3" fill="#fff" />,
};

export function IssueTypeIcon({ type }: Props) {
  const bg = ISSUE_TYPE_COLORS[type] || "#579DFF";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" role="img" aria-label={type}>
      <rect width="16" height="16" rx="2" fill={bg} />
      {shapes[type]}
    </svg>
  );
}
