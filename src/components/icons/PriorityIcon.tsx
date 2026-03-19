import { PRIORITY_COLORS } from "@/lib/tokens";
import type { Priority } from "@/domains/issues/types";

interface Props {
  priority: Priority;
}

export function PriorityIcon({ priority }: Props) {
  const c = PRIORITY_COLORS[priority] || "#E2740F";
  const draw: Record<Priority, React.ReactNode> = {
    Highest: <><path d="M5.5 9.5L8 7l2.5 2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5.5 6.5L8 4l2.5 2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    High:    <path d="M5.5 9L8 6.5 10.5 9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Medium:  <path d="M4.5 8h7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />,
    Low:     <path d="M5.5 7L8 9.5 10.5 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    Lowest:  <><path d="M5.5 6.5L8 9l2.5-2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5.5 9.5L8 12l2.5-2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" role="img" aria-label={`${priority} priority`}>
      {draw[priority]}
    </svg>
  );
}
