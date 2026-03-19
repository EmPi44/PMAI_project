import { useQuery } from "@tanstack/react-query";
import { clientKeys } from "./keys";
import { fetchClients } from "../services/mockClientService";

export function useClients() {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: fetchClients,
  });
}
