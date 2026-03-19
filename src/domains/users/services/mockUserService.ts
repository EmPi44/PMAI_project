import type { User } from "../types";

const USERS: Record<string, User> = {
  SC: { id: "SC", initials: "SC", name: "Sarah Chen", color: "#6554C0" },
  AR: { id: "AR", initials: "AR", name: "Alex Rivera", color: "#1F845A" },
  JL: { id: "JL", initials: "JL", name: "Jordan Lee", color: "#0C66E4" },
  PP: { id: "PP", initials: "PP", name: "Priya Patel", color: "#E56910" },
};

const delay = (ms: number = 100) => new Promise((r) => setTimeout(r, ms));

export async function fetchUsers(): Promise<User[]> {
  await delay();
  return Object.values(USERS);
}

export async function fetchUser(id: string): Promise<User | null> {
  await delay();
  return USERS[id] ?? null;
}

export function getUserSync(id: string): User | null {
  return USERS[id] ?? null;
}

export function getAllUsersSync(): Record<string, User> {
  return { ...USERS };
}
