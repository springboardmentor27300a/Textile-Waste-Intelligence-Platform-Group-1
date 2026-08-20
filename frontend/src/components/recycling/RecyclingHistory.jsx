import {
  History,
  Calendar,
  Hash,
  Recycle,
  Percent,
} from "lucide-react";

function RecyclingHistory({
  history,
  selectedId,
  onSelect,
}) {
  if (!history?.length) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-card">
        <History
          size={48}
          className="mx-auto mb-4 text-gray-400"
        />

        <h2 className="text-xl font-semibold text-heading">
          No Recycling History
        </h2>

        <p className="mt-2 text-muted">
          Previous recycling analyses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <History size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Recycling History
          </h2>

          <p className="text-sm text-muted">
            Select a previous recycling analysis
          </p>
        </div>
      </div>

      {/* History */}
      <div className="divide-y divide-border">
        {history.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex w-full items-center justify-between p-5 text-left transition-all hover:bg-slate-50 ${
              selectedId === item.id
                ? "bg-primary/5 border-l-4 border-primary"
                : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash
                  size={16}
                  className="text-primary"
                />

                <span className="font-semibold text-heading">
                  Batch #{item.batch_id ?? item.id}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar size={14} />

                <span>
                  {new Date(
                    item.upload_date
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-sm text-muted">
                  <Recycle size={14} />
                  Method
                </div>

                <p className="font-medium text-heading">
                  {item.recycling_method ||
                    "N/A"}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-sm text-muted">
                  <Percent size={14} />
                  Recovery
                </div>

                <p className="font-semibold text-emerald-600">
                  {item.recovery_percentage !=
                  null
                    ? `${item.recovery_percentage}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecyclingHistory;