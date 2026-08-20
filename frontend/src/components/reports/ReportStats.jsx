import {
  Boxes,
  Brain,
  Recycle,
  Leaf,
  Building2,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "../ui";
import useDashboard from "../../hooks/useDashboard";


function safeDisplay(value, fallback = "--") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "object"
  ) {
    return (
      value.organization_name ??
      value.name ??
      value.company_name ??
      value.label ??
      fallback
    );
  }

  return String(value);
}


function ReportStats() {

  const {
    kpis = {},
    analytics = {},
    summary = {},
    isLoading = false,
  } = useDashboard();


  if (isLoading) {

    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-3xl bg-slate-100"
            />
          )
        )}

      </div>
    );
  }


  const averageCompanyScore =
    typeof summary?.average_company_score ===
    "object"
      ? summary.average_company_score?.sustainability_score ??
        summary.average_company_score?.score ??
        0
      : summary?.average_company_score ?? 0;


  const cards = [

    {
      title: "Total Collections",

      value:
        safeDisplay(
          kpis?.total_collections,
          0
        ),

      icon: Boxes,

      color:
        "bg-blue-100 text-blue-600",
    },


    {
      title: "Total Analysis",

      value:
        safeDisplay(
          analytics?.total_analysis ??
            kpis?.total_analysis,
          0
        ),

      icon: Brain,

      color:
        "bg-violet-100 text-violet-600",
    },


    {
      title: "Average Confidence",

      value:
        `${safeDisplay(
          analytics?.average_confidence,
          0
        )}%`,

      icon: TrendingUp,

      color:
        "bg-cyan-100 text-cyan-600",
    },


    {
      title: "Manual Review",

      value:
        safeDisplay(
          analytics?.manual_review_count,
          0
        ),

      icon: Recycle,

      color:
        "bg-orange-100 text-orange-600",
    },


    {
      title: "Average Company Score",

      value:
        `${safeDisplay(
          averageCompanyScore,
          0
        )}`,

      icon: Leaf,

      color:
        "bg-green-100 text-green-600",
    },


    {
      title: "Companies",

      value:
        safeDisplay(
          summary?.total_companies,
          0
        ),

      icon: Building2,

      color:
        "bg-indigo-100 text-indigo-600",
    },

  ];


  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

      {cards.map((card) => (

        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />

      ))}

    </div>
  );
}


export default ReportStats;