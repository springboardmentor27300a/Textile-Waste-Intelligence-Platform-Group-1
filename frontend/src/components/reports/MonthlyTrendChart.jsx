import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { Card } from "../ui";
import useDashboard from "../../hooks/useDashboard";

function MonthlyTrendChart() {

  const {

    trends,

    isLoading,

  } = useDashboard();

  if (isLoading) {

    return (

      <Card
        title="Monthly Analysis Trend"
        subtitle="Loading trend analytics..."
      >

        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />

      </Card>

    );

  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const collections =
    trends?.collections ?? [];

  const recovery =
    trends?.recovery ?? [];

  const chartData = months.map(
    (month, index) => ({

      month,

      analyses:
        collections[index]
          ?.collections ?? 0,

      recycled:
        recovery[index]
          ?.recovery ?? 0,

    })
  );

  const totalAnalyses =
    chartData.reduce(

      (sum, item) =>

        sum + item.analyses,

      0

    );

  const totalRecovered =
    chartData.reduce(

      (sum, item) =>

        sum + item.recycled,

      0

    );

  return (

    <Card
      title="Monthly Analysis Trend"
      subtitle="AI analyses and recovered textile waste over time."
    >

      {chartData.every(
        item =>
          item.analyses === 0 &&
          item.recycled === 0
      ) ? (

        <div className="flex h-80 items-center justify-center text-muted">

          No trend data available.

        </div>

      ) : (

        <>

          <div className="h-80">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line

                  type="monotone"

                  dataKey="analyses"

                  name="AI Analyses"

                  stroke="#2563EB"

                  strokeWidth={3}

                  dot={{ r: 5 }}

                  activeDot={{ r: 7 }}

                />

                <Line

                  type="monotone"

                  dataKey="recycled"

                  name="Recovered Waste"

                  stroke="#10B981"

                  strokeWidth={3}

                  dot={{ r: 5 }}

                  activeDot={{ r: 7 }}

                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-blue-50 p-5">

              <p className="text-sm text-muted">

                Total AI Analyses

              </p>

              <h3 className="mt-2 text-3xl font-bold text-blue-700">

                {totalAnalyses}

              </h3>

            </div>

            <div className="rounded-2xl bg-green-50 p-5">

              <p className="text-sm text-muted">

                Total Recovery

              </p>

              <h3 className="mt-2 text-3xl font-bold text-green-700">

                {totalRecovered}

              </h3>

            </div>

          </div>

        </>

      )}

    </Card>

  );

}

export default MonthlyTrendChart;