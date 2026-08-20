import { useQuery } from "@tanstack/react-query";

import DashboardAPI from "../api/dashboardApi";


export default function useDashboard() {

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({

    queryKey: [
      "dashboard"
    ],

    queryFn:
      DashboardAPI.dashboard,

    staleTime: 0,

    retry: 1,
  });


  return {

    data,

    role:
      data?.role ?? null,

    dashboardTitle:
      data?.dashboard_title ??
      "Dashboard",

    dashboardSubtitle:
      data?.dashboard_subtitle ??
      "Textile waste intelligence and sustainability analytics.",


    kpis:
      data?.kpis ?? {},

    analytics:
      data?.analytics ?? {},

    summary:
      data?.summary ?? {},


    companySummary:
      data?.company_summary ?? {},

    companyRanking:
      data?.company_ranking ?? [],


    trends:
      data?.trends ?? [],


    materialDistribution:
      data?.material_distribution ?? [],

    wasteDistribution:
      data?.waste_distribution ?? [],


    sustainabilityDistribution:
      data?.sustainability_distribution ?? [],

    environmentalDistribution:
      data?.environmental_distribution ?? [],

    recyclingDistribution:
      data?.recycling_distribution ?? [],


    environmentalSummary:
      data?.environmental_summary ?? {},

    sustainabilitySummary:
      data?.sustainability_summary ?? {},


    recentCollections:
      data?.recent_collections ?? [],

    recentAnalysis:
      data?.recent_analysis ?? [],


    isLoading,

    isFetching,

    error,

    refresh:
      refetch,
  };
}