import {
  Leaf,
  Droplets,
  Trash2,
  Factory,
} from "lucide-react";

import { Card, MetricCard } from "../ui";
import useDashboard from "../../hooks/useDashboard";

function SustainabilityDashboard() {
  const {
    sustainabilityDistribution = [],
    environmentalDistribution = [],
    summary = {},
    analytics = {},
    isLoading = false,
  } = useDashboard();

  if (isLoading) {
    return (
      <Card
        title="Sustainability Dashboard"
        subtitle="Loading sustainability metrics..."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      </Card>
    );
  }

  const sustainabilityRatings =
    sustainabilityDistribution?.reduce(
      (sum, item) =>
        sum + Number(item?.count ?? 0),
      0
    ) ?? 0;

  const environmentalRatings =
    environmentalDistribution?.reduce(
      (sum, item) =>
        sum + Number(item?.count ?? 0),
      0
    ) ?? 0;

  const cards = [
    {
      title: "Average Sustainability",
      value: `${analytics?.average_sustainability_score ?? 0}%`,
      icon: Leaf,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Average Environmental",
      value: `${analytics?.average_environmental_score ?? 0}%`,
      icon: Droplets,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Sustainability Ratings",
      value: sustainabilityRatings,
      icon: Factory,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Environmental Ratings",
      value: environmentalRatings,
      icon: Trash2,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  /*
   * IMPORTANT:
   * summary.best_company is an OBJECT returned by the backend.
   * We must display organization_name instead of the entire object.
   */
  const bestCompany =
    typeof summary?.best_company === "object" &&
    summary?.best_company !== null
      ? summary.best_company.organization_name
      : summary?.best_company;

  return (
    <Card
      title="Sustainability Dashboard"
      subtitle="Overall environmental and sustainability performance."
    >

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

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

      <div className="mt-10 rounded-3xl bg-gradient-to-r from-emerald-50 to-green-100 p-8">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold">
              Overall Company Performance
            </h3>

            <p className="mt-3 text-muted">
              Best Company
            </p>

            <h4 className="text-xl font-semibold">
              {bestCompany || "--"}
            </h4>

            <p className="mt-4 text-muted">
              Average Company Score
            </p>

            <h2 className="text-4xl font-bold text-green-700">
              {summary?.average_company_score ?? 0}
            </h2>

          </div>

          <Leaf
            size={70}
            className="text-green-600"
          />

        </div>

      </div>

    </Card>
  );
}

export default SustainabilityDashboard;