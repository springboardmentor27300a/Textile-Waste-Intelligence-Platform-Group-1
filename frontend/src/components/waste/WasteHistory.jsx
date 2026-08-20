import {
  CalendarDays,
  Package,
  Recycle,
  ChevronRight,
} from "lucide-react";

function WasteHistory({
  history = [],
  selectedId,
  onSelect,
}) {
  const recentHistory = [...history]
    .sort(
      (a, b) =>
        new Date(b.upload_date) -
        new Date(a.upload_date)
    )
    .slice(0, 5);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-heading">
          Recent Waste Classification History
        </h2>

        <p className="mt-1 text-sm text-muted">
          Review previously analyzed textile waste records.
        </p>
      </div>

      {recentHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center shadow-card">
          <Package
            size={40}
            className="mx-auto text-gray-400"
          />

          <h3 className="mt-4 text-lg font-semibold text-heading">
            No Analysis History
          </h3>

          <p className="mt-2 text-muted">
            Upload and analyze textile waste to view history.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentHistory.map((item) => {
            const active = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={`w-full rounded-2xl border bg-white p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  active
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package
                        size={18}
                        className="text-primary"
                      />

                      <span className="font-semibold text-heading">
                        Batch ID :
                      </span>

                      <span className="text-muted">
                        {item.batch_id ??
                          item.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={18}
                        className="text-primary"
                      />

                      <span className="font-semibold text-heading">
                        Upload Date :
                      </span>

                      <span className="text-muted">
                        {item.upload_date
                          ? new Date(
                              item.upload_date
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Recycle
                        size={18}
                        className="text-primary"
                      />

                      <span className="font-semibold text-heading">
                        Waste Category :
                      </span>

                      <span className="text-muted">
                        {item.waste_category ??
                          "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-sm text-muted">
                        Recyclability Score
                      </p>

                      <p className="text-2xl font-bold text-green-600">
                        {item.recyclability_score ??
                          "N/A"}
                        {item.recyclability_score !=
                          null && "%"}
                      </p>
                    </div>

                    <ChevronRight
                      className="text-gray-400"
                      size={24}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default WasteHistory;