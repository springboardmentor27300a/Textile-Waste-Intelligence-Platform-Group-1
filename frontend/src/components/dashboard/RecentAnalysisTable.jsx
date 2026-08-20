import {
  Brain,
  BadgeCheck,
  Calendar,
} from "lucide-react";

import { Card } from "../ui";

function confidenceBadge(confidence) {
  if (confidence >= 90)
    return "bg-green-100 text-green-700";

  if (confidence >= 75)
    return "bg-blue-100 text-blue-700";

  if (confidence >= 60)
    return "bg-yellow-100 text-yellow-700";

  return "bg-red-100 text-red-700";
}

function RecentAnalysisTable({
  data = [],
}) {
  return (
    <Card
      title="Recent AI Analysis"
      subtitle="Latest textile image analysis"
    >
      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Material
              </th>

              <th className="px-5 py-4 text-left">
                Waste Category
              </th>

              <th className="px-5 py-4 text-left">
                Confidence
              </th>

              <th className="px-5 py-4 text-left">
                Sustainability
              </th>

              <th className="px-5 py-4 text-left">
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {data.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-muted"
                >
                  No analysis available.
                </td>

              </tr>

            )}

            {data.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Brain
                      size={18}
                      className="text-violet-600"
                    />

                    {item.material}

                  </div>

                </td>

                <td className="px-5 py-4">
                  {item.waste_category}
                </td>

                <td className="px-5 py-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${confidenceBadge(item.confidence)}`}
                  >
                    {item.confidence}%
                  </span>

                </td>

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <BadgeCheck
                      size={18}
                      className="text-green-600"
                    />

                    {item.sustainability_score}

                  </div>

                </td>

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </Card>
  );
}

export default RecentAnalysisTable;