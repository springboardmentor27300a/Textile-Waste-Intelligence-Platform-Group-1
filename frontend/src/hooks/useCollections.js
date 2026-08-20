import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import collectionService from "../services/collectionService";

export default function useCollections(params = {}) {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collections", params],
    queryFn: () => collectionService.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: collectionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      collectionService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: collectionService.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    },
  });

  return {
    collections: data,

    getById: collectionService.getById,

    loading: isLoading,

    error,

    refresh: refetch,

    createCollection: createMutation.mutateAsync,

    updateCollection: updateMutation.mutateAsync,

    deleteCollection: deleteMutation.mutateAsync,

    creating: createMutation.isPending,

    updating: updateMutation.isPending,

    deleting: deleteMutation.isPending,
  };
}