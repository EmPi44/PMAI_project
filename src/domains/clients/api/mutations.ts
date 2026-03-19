import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "./keys";
import { createClient, updateClient, deleteClient } from "../services/mockClientService";
import type { CreateClientDTO, UpdateClientDTO } from "../types";

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientDTO) => createClient(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClientDTO }) => updateClient(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
