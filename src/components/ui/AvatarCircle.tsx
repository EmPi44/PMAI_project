import { T } from "@/lib/tokens";
import { PersonIcon } from "@/components/icons";
import type { User } from "@/domains/users/types";

interface Props {
  user: User | null | undefined;
  size?: number;
  ring?: boolean;
}

export function AvatarCircle({ user, size = 24, ring = false }: Props) {
  if (!user) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          border: "1.5px dashed #B3B9C4",
          color: "#8993A5",
          fontSize: size * 0.4,
          fontWeight: 500,
        }}
        title="Unassigned"
      >
        <PersonIcon />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full cursor-pointer"
      style={{
        width: size,
        height: size,
        backgroundColor: user.color,
        color: "#fff",
        fontSize: size * 0.38,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 3.5px ${user.color}40` : undefined,
      }}
      title={user.name}
    >
      {user.initials}
    </span>
  );
}
