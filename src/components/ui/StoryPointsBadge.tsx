import { T } from "@/lib/tokens";

interface Props {
  points: number;
}

export function StoryPointsBadge({ points }: Props) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: 20,
        height: 20,
        backgroundColor: T.bgNeutral,
        color: T.textSubtle,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {points}
    </span>
  );
}
