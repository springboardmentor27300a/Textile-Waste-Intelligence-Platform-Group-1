import {
  Package,
  Building2,
  Calendar,
} from "lucide-react";

import { Card } from "../ui";

function statusColor(status) {

  switch (status) {

    case "Completed":
      return "bg-green-100 text-green-700";

    case "Pending":
      return "bg-yellow-100 text-yellow-700";

    case "Processing":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";

  }

}

function RecentCollectionsTable({
  data = [],
}) {
  return (
    <Card
      title="Recent Collections"
      subtitle="Latest textile waste collections"
    >
      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Collection
              </th>

              <th className="px-5 py-4 text-left">
                Organization
              </th>

              <th className="px-5 py-4 text-left">
                Weight
              </th>

              <th className="px-5 py-4 text-left">
                Status
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
                  No collections available.
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

                    <Package
                      size={18}
                      className="text-blue-600"
                    />

                    {item.collection_code}

                  </div>

                </td>

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Building2
                      size={18}
                      className="text-indigo-600"
                    />

                    {item.organization}

                  </div>

                </td>

                <td className="px-5 py-4">
                  {item.weight} kg
                </td>

                <td className="px-5 py-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor(item.status)}`}
                  >
                    {item.status}
                  </span>

                </td>

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    {new Date(
                      item.date
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

export default RecentCollectionsTable;