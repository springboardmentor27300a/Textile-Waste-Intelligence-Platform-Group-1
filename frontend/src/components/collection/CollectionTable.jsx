import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Eye,
  Pencil,
  Trash2,
  ScanSearch,
  Leaf,
  FileSpreadsheet,
  ArrowDownUp,
  Archive,
} from "lucide-react";

function StatusBadge({ status }) {

  const colors = {

    Scheduled:
      "bg-yellow-100 text-yellow-700",

    Completed:
      "bg-green-100 text-green-700",

    Cancelled:
      "bg-red-100 text-red-700",

    Pending:
      "bg-slate-100 text-slate-700",

  };

  return (

    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ??
        "bg-slate-100 text-slate-700"
      }`}
    >

      {status}

    </span>

  );

}

function ScoreBadge({ score = 0 }) {

  let color =
    "bg-red-100 text-red-700";

  if (score >= 80) {

    color =
      "bg-green-100 text-green-700";

  } else if (score >= 60) {

    color =
      "bg-yellow-100 text-yellow-700";

  }

  return (

    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >

      {score}%

    </span>

  );

}

function formatWeight(weight) {

  return Number(
    weight || 0
  ).toLocaleString(undefined, {

    maximumFractionDigits: 2,

  });

}

function CollectionTable({

  collections = [],

  loading,

  onView,

  onEdit,

  onDelete,

}) {

  const [

    sortDirection,

    setSortDirection,

  ] = useState("desc");

  const sortedCollections =
    useMemo(() => {

      return [...collections].sort(

        (a, b) => {

          if (
            sortDirection === "asc"
          ) {

            return (
              a.total_weight -
              b.total_weight
            );

          }

          return (
            b.total_weight -
            a.total_weight
          );

        }

      );

    }, [

      collections,

      sortDirection,

    ]);

  const exportCSV = () => {

    const headers = [

      "Collection",

      "Date",

      "Collector",

      "Method",

      "Weight",

      "Status",

      "Recovery",

      "Sustainability",

    ];

    const rows =
      sortedCollections.map(item => [

        item.collection_code,

        item.collection_date,

        item.collected_by,

        item.collection_method,

        item.total_weight,

        item.collection_status,

        item.recovery_percentage,

        item.sustainability_score,

      ]);

    const csv = [

      headers,

      ...rows,

    ]

      .map(row => row.join(","))

      .join("\n");

    const blob = new Blob(

      [csv],

      {

        type:
          "text/csv;charset=utf-8",

      }

    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "collections.csv";

    link.click();

  };

  if (loading) {

    return (

      <div className="rounded-3xl bg-white p-12 text-center shadow-card">

        Loading collections...

      </div>

    );

  }

  return (

    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

      <div className="flex flex-col gap-4 border-b bg-slate-50 p-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-2xl font-bold">

            Collection Management

          </h2>

          <p className="mt-2 text-sm text-slate-500">

            {sortedCollections.length}
            {" "}
            textile waste collections.

          </p>

        </div>

        <div className="flex gap-3">

          <button

            onClick={() =>
              setSortDirection(

                sortDirection === "asc"

                  ? "desc"

                  : "asc"

              )
            }

            className="rounded-xl border p-3"

          >

            <ArrowDownUp
              size={18}
            />

          </button>

          <button

            onClick={exportCSV}

            className="flex items-center gap-2 rounded-xl border px-5"

          >

            <FileSpreadsheet
              size={18}
            />

            Export CSV

          </button>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-100">

            <tr className="text-left text-xs uppercase tracking-wide text-slate-600">

              <th className="px-6 py-4">

                Collection

              </th>

              <th className="px-6 py-4">

                Date

              </th>

              <th className="px-6 py-4">

                Collector

              </th>

              <th className="px-6 py-4">

                Weight

              </th>

              <th className="px-6 py-4">

                Recovery

              </th>

              <th className="px-6 py-4">

                Sustainability

              </th>

              <th className="px-6 py-4">

                Status

              </th>

              <th className="px-6 py-4">

                AI

              </th>

              <th className="px-6 py-4 text-center">

                Actions

              </th>

            </tr>

          </thead>
        <tbody>

{sortedCollections.length ? (

sortedCollections.map((collection) => (

<tr
    key={collection.id}
    className="border-t border-slate-100 transition-all duration-300 hover:bg-blue-50"
>

    {/* Collection */}

    <td className="px-6 py-5">

        <div>

            <h3 className="font-bold text-slate-800">

                {collection.collection_code}

            </h3>

            <p className="mt-1 text-xs text-slate-500">

                {collection.collection_method}

            </p>

        </div>

    </td>

    {/* Date */}

    <td className="px-6 py-5">

        <div>

            <p>

                {collection.collection_date}

            </p>

        </div>

    </td>

    {/* Collector */}

    <td className="px-6 py-5">

        <div>

            <p className="font-medium">

                {collection.collected_by}

            </p>

            <p className="text-xs text-slate-500">

                {collection.vehicle_number || "-"}

            </p>

        </div>

    </td>

    {/* Weight */}

    <td className="px-6 py-5">

        <div className="w-36">

            <div className="mb-2 flex justify-between text-xs">

                <span>

                    {formatWeight(collection.total_weight)} kg

                </span>

            </div>

            <div className="h-2 rounded-full bg-slate-200">

                <div

                    className="h-2 rounded-full bg-blue-600"

                    style={{

                        width: `${Math.min(

                            Number(collection.total_weight),

                            100

                        )}%`

                    }}

                />

            </div>

        </div>

    </td>

    {/* Recovery */}

    <td className="px-6 py-5">

        <div className="flex flex-col gap-2">

            <span className="font-semibold text-green-700">

                {collection.recovery_percentage ?? 0}%

            </span>

            <span className="text-xs text-slate-500">

                {collection.recyclable_weight ?? 0} kg recyclable

            </span>

        </div>

    </td>

    {/* Sustainability */}

    <td className="px-6 py-5">

        <div className="space-y-2">

            <ScoreBadge

                score={

                    collection.sustainability_score ?? 0

                }

            />

            <div className="flex items-center gap-1 text-xs text-slate-500">

                <Leaf size={12} />

                {collection.carbon_saved ?? 0} kg CO2

            </div>

        </div>

    </td>

    {/* Status */}

    <td className="px-6 py-5">

        <div className="space-y-2">

            <StatusBadge

                status={

                    collection.collection_status

                }

            />

            <div className="text-xs text-slate-500">

                AI:

                {" "}

                {collection.analysis_status ?? "Pending"}

            </div>

        </div>

    </td>

    {/* AI */}

    <td className="px-6 py-5">

        <div className="space-y-2 text-xs">

            <div>

                Inventory:

                {" "}

                <strong>

                    {collection.inventory_status ?? "Pending"}

                </strong>

            </div>

            <div>

                Report:

                {" "}

                <strong>

                    {collection.report_status ?? "Pending"}

                </strong>

            </div>

        </div>

    </td>

    {/* Actions */}

    <td className="px-6 py-5">

        <div className="flex justify-center gap-2">

            <button

                onClick={() =>

                    onView(collection)

                }

                className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-100"

            >

                <Eye size={18} />

            </button>

            <Link

                to="/image-analysis"

                state={{

                    collection,

                }}

            >

                <button

                    className="rounded-xl p-2 text-violet-600 transition hover:bg-violet-100"

                    title="Analyze Collection"

                >

                    <ScanSearch size={18} />

                </button>

            </Link>

            <button

                onClick={() =>

                    onEdit(collection)

                }

                className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-100"

            >

                <Pencil size={18} />

            </button>

            <button

                onClick={() =>

                    onDelete(collection)

                }

                className="rounded-xl p-2 text-red-600 transition hover:bg-red-100"

            >

                <Trash2 size={18} />

            </button>

        </div>

    </td>

</tr>

))

) : (

<tr>

<td

colSpan={9}

className="py-20"

>

<div className="flex flex-col items-center">

<Archive

size={60}

className="mb-5 text-slate-300"

/>

<h2 className="text-2xl font-bold">

No Collections Found

</h2>

<p className="mt-3 text-slate-500">

Create your first textile waste collection to begin tracking.

</p>

<Link

to="/collections/add"

className="mt-6"

>

<button className="rounded-xl bg-primary px-6 py-3 text-white">

Add Collection

</button>

</Link>

</div>

</td>

</tr>

)}

</tbody>

      </table>

</div>

{/* Footer */}

<div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-8 py-5 lg:flex-row lg:items-center lg:justify-between">

    <div className="text-sm text-slate-500">

        Showing

        <span className="mx-1 font-semibold">

            {sortedCollections.length}

        </span>

        collection(s)

    </div>

    <div className="flex flex-wrap items-center gap-4">

        <div className="rounded-xl bg-white px-4 py-2 shadow-sm">

            <p className="text-xs text-slate-500">

                Total Weight

            </p>

            <h3 className="font-bold text-blue-600">

                {sortedCollections
                    .reduce(
                        (sum, item) =>
                            sum +
                            Number(item.total_weight || 0),
                        0
                    )
                    .toFixed(2)}{" "}
                kg

            </h3>

        </div>

        <div className="rounded-xl bg-white px-4 py-2 shadow-sm">

            <p className="text-xs text-slate-500">

                Completed

            </p>

            <h3 className="font-bold text-green-600">

                {
                    sortedCollections.filter(
                        (item) =>
                            item.collection_status ===
                            "Completed"
                    ).length
                }

            </h3>

        </div>

        <div className="rounded-xl bg-white px-4 py-2 shadow-sm">

            <p className="text-xs text-slate-500">

                Pending AI

            </p>

            <h3 className="font-bold text-amber-600">

                {
                    sortedCollections.filter(
                        (item) =>
                            item.analysis_status !==
                            "Completed"
                    ).length
                }

            </h3>

        </div>

    </div>

</div>

</div>
  );
}

export default CollectionTable;