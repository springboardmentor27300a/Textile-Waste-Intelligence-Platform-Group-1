import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import wasteSourceService from "../services/wasteSourceService";

export default function useWasteSources(params = {}) {
  const queryClient = useQueryClient();

  // Fetch Waste Sources
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wasteSources", params],
    queryFn: () => wasteSourceService.getAll(params),
  });

  // Create
  const createMutation = useMutation({
    mutationFn: wasteSourceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wasteSources"],
      });
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      wasteSourceService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wasteSources"],
      });
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: wasteSourceService.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wasteSources"],
      });
    },
  });

  return {
    wasteSources: data,

    getById: wasteSourceService.getById,   // <-- ADD THIS

    loading: isLoading,

    error,

    refresh: refetch,

    createSource: createMutation.mutateAsync,

    updateSource: updateMutation.mutateAsync,

    deleteSource: deleteMutation.mutateAsync,

    creating: createMutation.isPending,

    updating: updateMutation.isPending,

    deleting: deleteMutation.isPending,
    };
}