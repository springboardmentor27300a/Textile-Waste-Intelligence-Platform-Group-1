import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { Card } from "../ui";

function WasteDistributionChart({
  data = [],
}) {
  const chartData = data.map((item) => ({
    category: item.category,
    count: item.count,
  }));

  return (
    <Card
      title="Waste Distribution"
      subtitle="Waste category analysis"
    >
      {chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-muted">
          No waste distribution available.
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="category"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              fill="#2563EB"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default WasteDistributionChart;