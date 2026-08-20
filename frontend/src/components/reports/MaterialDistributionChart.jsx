import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card } from "../ui";
import useDashboard from "../../hooks/useDashboard";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

function MaterialDistributionChart() {

  const {

    materialDistribution,

    isLoading,

  } = useDashboard();

  if (isLoading) {

    return (

      <Card
        title="Material Distribution"
        subtitle="Loading..."
      >

        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />

      </Card>

    );

  }

  const chartData =
    materialDistribution?.map((item) => ({

      name:
        item.material ??
        item.material_name ??
        "Unknown",

      value:
        item.count ??
        item.total ??
        0,

    })) ?? [];

  const total =
    chartData.reduce(

      (sum, item) =>

        sum + item.value,

      0

    );

  return (

    <Card
      title="Material Distribution"
      subtitle="Distribution of detected textile materials."
    >

      {chartData.length === 0 ? (

        <div className="flex h-80 items-center justify-center text-muted">

          No material distribution available.

        </div>

      ) : (

        <>

          <div className="h-80">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie

                  data={chartData}

                  dataKey="value"

                  nameKey="name"

                  innerRadius={70}

                  outerRadius={115}

                  paddingAngle={3}

                >

                  {chartData.map(

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

                <Tooltip

                  formatter={(value) => [

                    value,

                    "Records",

                  ]}

                />

                <Legend
                  verticalAlign="bottom"
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            {chartData.map(

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
                              item.value /
                              total *
                              100
                            ).toFixed(1)
                          : 0}
                        %

                      </p>

                    </div>

                  </div>

                  <span className="text-lg font-bold text-blue-600">

                    {item.value}

                  </span>

                </div>

              )

            )}

          </div>

        </>

      )}

    </Card>

  );

}

export default MaterialDistributionChart;