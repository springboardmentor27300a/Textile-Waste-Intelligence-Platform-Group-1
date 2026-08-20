import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { Card } from "../ui";

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

function MaterialDistributionChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: item.material,
    value: item.count,
  }));

  return (
    <Card
      title="Material Distribution"
      subtitle="Detected textile materials"
    >
      {chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-muted">
          No material data available.
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={3}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default MaterialDistributionChart;