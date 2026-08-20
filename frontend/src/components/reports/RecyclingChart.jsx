import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { Card } from "../ui";
import useDashboard from "../../hooks/useDashboard";


const COLORS = [
  "#10B981",
  "#2563EB",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
];


function getCompanyName(company) {
  if (
    company === null ||
    company === undefined
  ) {
    return "--";
  }

  if (
    typeof company === "object"
  ) {
    return (
      company.display_name ??
      company.organization_name ??
      company.company_name ??
      company.name ??
      "--"
    );
  }

  return String(company);
}


function RecyclingChart() {

  const {
    recyclingDistribution = [],
    summary = {},
    isLoading = false,
  } = useDashboard();


  if (isLoading) {

    return (
      <Card
        title="Recycling Distribution"
        subtitle="Loading..."
      >

        <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />

      </Card>
    );
  }


  const data =
    Array.isArray(recyclingDistribution)
      ? recyclingDistribution.map((item) => ({
          name:
            item?.method ??
            item?.recycling_method ??
            "Unknown",

          value:
            Number(
              item?.count ??
              item?.total ??
              0
            ),
        }))
      : [];


  const total =
    data.reduce(
      (sum, item) =>
        sum + Number(item?.value ?? 0),
      0
    );


  const recyclingLeader =
    getCompanyName(
      summary?.highest_recycling
    );


  return (
    <Card
      title="Recycling Method Distribution"
      subtitle="AI recommended recycling methods."
    >

      {data.length === 0 ? (

        <div className="flex h-80 items-center justify-center text-muted">
          No recycling data available.
        </div>

      ) : (

        <>

          {/* ================================================= */}
          {/* CHART */}
          {/* ================================================= */}

          <div className="relative h-80">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >

                  {data.map(
                    (_, index) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>


            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

              <p className="text-sm text-muted">
                Methods
              </p>

              <h2 className="text-4xl font-bold">
                {data.length}
              </h2>

            </div>

          </div>


          {/* ================================================= */}
          {/* METHOD BREAKDOWN */}
          {/* ================================================= */}

          <div className="mt-8 space-y-4">

            {data.map(
              (item, index) => (

                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >

                  <div className="flex items-center gap-3">

                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        background:
                          COLORS[
                            index %
                            COLORS.length
                          ],
                      }}
                    />

                    <div>

                      <h4 className="font-semibold">
                        {item.name}
                      </h4>

                      <p className="text-xs text-muted">

                        {total
                          ? (
                              (
                                item.value /
                                total
                              ) *
                              100
                            ).toFixed(1)
                          : 0}
                        %

                      </p>

                    </div>

                  </div>


                  <span className="text-lg font-bold text-green-600">
                    {item.value}
                  </span>

                </div>

              )
            )}

          </div>


          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-green-50 p-5">

              <p className="text-sm text-muted">
                Recycling Leader
              </p>

              <h3 className="mt-2 break-words text-2xl font-bold text-green-700">
                {recyclingLeader}
              </h3>

            </div>


            <div className="rounded-2xl bg-blue-50 p-5">

              <p className="text-sm text-muted">
                Available Methods
              </p>

              <h3 className="mt-2 text-2xl font-bold text-blue-700">
                {data.length}
              </h3>

            </div>

          </div>

        </>

      )}

    </Card>
  );
}


export default RecyclingChart;