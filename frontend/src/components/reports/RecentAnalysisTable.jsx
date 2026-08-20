import { useEffect } from "react";

import {
  Eye,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";

import { Card } from "../ui";
import useAnalysis from "../../hooks/useAnalysis";

function confidenceColor(value) {
  const confidence = Number(value ?? 0);

  if (confidence >= 95)
    return "bg-green-100 text-green-700";

  if (confidence >= 85)
    return "bg-blue-100 text-blue-700";

  if (confidence >= 70)
    return "bg-amber-100 text-amber-700";

  return "bg-red-100 text-red-700";
}

function recommendationColor(type) {
  switch (type) {
    case "Recycle":
      return "bg-blue-100 text-blue-700";

    case "Upcycle":
      return "bg-purple-100 text-purple-700";

    case "Recover":
      return "bg-green-100 text-green-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusBadge(status) {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle size={14} />
          Completed
        </span>
      );

    case "Processing":
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          <Clock size={14} />
          Processing
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          <Clock size={14} />
          Pending
        </span>
      );
  }
}

function RecentAnalysisTable() {
  const {
    history = [],
    loading = false,
    loadHistory,
  } = useAnalysis();

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return (
      <Card
        title="Recent Analysis Activity"
        subtitle="Loading..."
      >
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </Card>
    );
  }

  if (!history.length) {
    return (
      <Card
        title="Recent Analysis Activity"
        subtitle="Latest AI textile analyses."
      >
        <div className="flex h-80 items-center justify-center text-muted">
          No analysis records available.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Recent Analysis Activity"
      subtitle="Latest AI textile analyses."
    >

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b">

            <tr className="text-left text-sm text-muted">

              <th className="py-4">
                Batch
              </th>

              <th>
                Material
              </th>

              <th>
                Confidence
              </th>

              <th>
                Recommendation
              </th>

              <th>
                Status
              </th>

              <th>
                Date
              </th>

              <th className="text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {history.map((item, index) => (

              <tr
                key={item?.id ?? item?.batch_id ?? index}
                className="border-b transition hover:bg-slate-50"
              >

                <td className="py-4 font-semibold">
                  {item?.batch_id ?? item?.id ?? "--"}
                </td>

                <td>
                  {item?.material ?? "--"}
                </td>

                <td>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceColor(
                      item?.confidence
                    )}`}
                  >
                    {item?.confidence ?? 0}%
                  </span>

                </td>

                <td>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${recommendationColor(
                      item?.recommendation
                    )}`}
                  >
                    {item?.recommendation ?? "--"}
                  </span>

                </td>

                <td>
                  {statusBadge(
                    item?.status ?? "Completed"
                  )}
                </td>

                <td>
                  {item?.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleDateString()
                    : "--"}
                </td>

                <td>

                  <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      className="rounded-lg p-2 transition hover:bg-blue-100"
                    >
                      <Eye
                        size={18}
                        className="text-blue-600"
                      />
                    </button>

                    <button
                      type="button"
                      className="rounded-lg p-2 transition hover:bg-green-100"
                    >
                      <Download
                        size={18}
                        className="text-green-600"
                      />
                    </button>

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