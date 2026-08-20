import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import useInventory from "../../hooks/useInventory";
import { Card } from "../ui";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
];

function InventoryAnalytics() {

  const { inventory } = useInventory();

  const fabricMap = {};

  inventory.forEach((item) => {

    fabricMap[item.fabric] =
      (fabricMap[item.fabric] || 0) + item.quantity;

  });

  const chartData = Object.entries(fabricMap).map(
    ([fabric, quantity]) => ({
      name: fabric,
      value: quantity,
    })
  );

  return (

    <Card
      title="Fabric Distribution"
      subtitle="Current inventory grouped by textile material."
    >

      <div className="h-96">

        <ResponsiveContainer>

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
            >

              {chartData.map((_, index) => (

                <Cell
                  key={index}
                  fill={
                    COLORS[index % COLORS.length]
                  }
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </Card>

  );

}

export default InventoryAnalytics;