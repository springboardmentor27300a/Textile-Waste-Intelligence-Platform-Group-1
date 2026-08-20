import { useEffect, useState } from "react";
import { History, Shirt } from "lucide-react";

import { getAnalysisHistory } from "../../api/imageAnalysisApi";

function MaterialHistory({ onSelect }) {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {

      const response =
        await getAnalysisHistory();

      const latestFive = [...response]
  .sort((a, b) => {
    return (
      new Date(b.upload_date).getTime() -
      new Date(a.upload_date).getTime()
    );
  })
  .slice(0, 5);

console.table(latestFive);

      setHistory(latestFive);

    } catch (err) {

      console.error(err);

    }
  };

  if (history.length === 0) {

    return (

      <div className="rounded-2xl bg-white p-8 shadow-card">

        <h2 className="text-2xl font-bold">
          Recent Classifications
        </h2>

        <p className="mt-3 text-muted">
          No material classifications available.
        </p>

      </div>

    );

  }

  return (

    <div className="rounded-2xl bg-white p-8 shadow-card">

      <div className="mb-6 flex items-center gap-3">

        <History
          size={24}
          className="text-accent"
        />

        <div>

          <h2 className="text-2xl font-bold text-heading">
            Recent Classifications
          </h2>

          <p className="text-muted">
            Previous AI textile analyses.
          </p>

        </div>

      </div>

      <div className="space-y-4">

        {history.map((item, index) => (

          <div
            key={item.id || index}
            onClick={() =>
             onSelect?.(
                item.batch_id ||
                item.batch ||
                item.inventory_id ||
                item.id
              )
            }
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 p-5 transition hover:bg-blue-50 hover:shadow-md"
          >

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-blue-100 p-3">

                <Shirt
                  size={22}
                  className="text-accent"
                />

              </div>

              <div>

                <h3 className="font-semibold text-heading">
                  {item.material || "Unknown"}
                </h3>

                <p className="text-xs text-gray-500">
                  Batch ID:{" "}
                  {item.batch_id ||
                    item.batch ||
                    item.inventory_id ||
                    item.id}
                </p>

                <p className="text-xs text-muted">

                  {item.material_category ||
                    item.category ||
                    item.waste_category ||
                    "Not Available"}

                </p>

                <p className="text-xs text-muted">
                 {item.upload_date
                    ? new Date(item.upload_date).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                    : "No Date"}
                </p>

              </div>

            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">

              {Number(item.confidence ?? 0).toFixed(1)}%

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default MaterialHistory;