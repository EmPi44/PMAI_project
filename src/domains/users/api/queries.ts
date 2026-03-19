import { useQuery } from "@tanstack/react-query";
import { userKeys } from "./keys";
import { fetchUsers, fetchUser } from "../services";

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}
