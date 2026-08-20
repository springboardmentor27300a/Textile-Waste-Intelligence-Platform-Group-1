import { useQuery } from "@tanstack/react-query";

import SustainabilityAPI from "../api/sustainabilityApi";

export default function useSustainability() {
  const dashboardQuery = useQuery({
    queryKey: ["sustainability-dashboard"],

    queryFn: async () => {
      // Load the two dedicated analytics domains independently.
      // The global /dashboard endpoint is deliberately not used here.
      const [dashboard, environmental] = await Promise.all([
        SustainabilityAPI.dashboard(),
        SustainabilityAPI.environment(),
      ]);

      return {
        ...dashboard,

        environmental: environmental || {},
      };
    },

    staleTime: 1000 * 60 * 5,

    retry: 1,
  });

  return {
    dashboard: dashboardQuery.data,

    loading: dashboardQuery.isLoading,

    error: dashboardQuery.error,

    refetch: dashboardQuery.refetch,

    isFetching: dashboardQuery.isFetching,
  };
}