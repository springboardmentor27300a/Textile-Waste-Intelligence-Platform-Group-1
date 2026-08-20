import {
  Eye,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";

function StatusBadge({ status }) {
  const styles = {
    Active:
      "bg-green-100 text-green-700 border-green-200",

    Inactive:
      "bg-red-100 text-red-700 border-red-200",

    Pending:
      "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function WasteSourceTable({
  wasteSources = [],
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-12 text-center shadow-sm">
        <p className="text-muted">
          Loading waste sources...
        </p>
      </div>
    );
  }

  if (!wasteSources.length) {
    return (
      <div className="rounded-2xl bg-card p-16 text-center shadow-sm">
        <Building2
          className="mx-auto mb-4 text-gray-400"
          size={48}
        />

        <h2 className="text-xl font-semibold text-heading">
          No Waste Sources Found
        </h2>

        <p className="mt-2 text-muted">
          Add your first waste source to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold">
                Code
              </th>

              <th className="px-6 py-4 text-sm font-semibold">
                Organization
              </th>

              <th className="px-6 py-4 text-sm font-semibold">
                Contact
              </th>

              <th className="px-6 py-4 text-sm font-semibold">
                City
              </th>

              <th className="px-6 py-4 text-sm font-semibold">
                Monthly Waste
              </th>

              <th className="px-6 py-4 text-sm font-semibold">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {wasteSources.map((source) => (
              <tr
                key={source.id}
                className="border-t transition hover:bg-background"
              >
                <td className="px-6 py-4 font-medium">
                  {source.source_code}
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">
                      {source.organization_name}
                    </p>

                    <p className="text-sm text-muted">
                      {source.industry}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p>{source.contact_person}</p>

                    <p className="text-sm text-muted">
                      {source.email}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {source.city}
                </td>

                <td className="px-6 py-4">
                  {source.average_monthly_waste} kg
                </td>

                <td className="px-6 py-4">
                  <StatusBadge
                    status={source.status}
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(source)}
                      className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => onEdit(source)}
                      className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(source)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WasteSourceTable;