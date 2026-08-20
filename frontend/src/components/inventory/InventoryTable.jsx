import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Eye,
  Pencil,
  Trash2,
  Archive,
  ScanSearch,
  Leaf,
  ArrowDownUp,
  FileSpreadsheet,
} from "lucide-react";

import { ConfirmModal, Button } from "../ui";

const FABRIC_COLORS = {
  Cotton: "bg-blue-100 text-blue-700",
  Denim: "bg-indigo-100 text-indigo-700",
  Polyester: "bg-emerald-100 text-emerald-700",
  Wool: "bg-amber-100 text-amber-700",
  Silk: "bg-pink-100 text-pink-700",
  Linen: "bg-lime-100 text-lime-700",
  Nylon: "bg-cyan-100 text-cyan-700",
  Rayon: "bg-violet-100 text-violet-700",
  Acrylic: "bg-orange-100 text-orange-700",
  "Mixed Fabric": "bg-slate-100 text-slate-700",
};

const CONDITION_COLORS = {
  Excellent: "bg-green-100 text-green-700",
  Good: "bg-blue-100 text-blue-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Poor: "bg-red-100 text-red-700",
};

const STATUS_COLORS = {
  Available: "bg-green-100 text-green-700",
  Reserved: "bg-yellow-100 text-yellow-700",
  Processed: "bg-slate-200 text-slate-700",
};

const getFabricBadge = (fabric) =>
  FABRIC_COLORS[fabric] ?? "bg-slate-100 text-slate-700";

const getConditionBadge = (condition) =>
  CONDITION_COLORS[condition] ?? "bg-slate-100 text-slate-700";

const getStatusBadge = (status) =>
  STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700";

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString();
};

const formatQuantity = (qty) => {
  if (!qty) return "0";

  return Number(qty).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

const getScoreBadge = (score = 0) => {
  const numericScore = Number(score);

  if (numericScore >= 80) {
    return "bg-green-100 text-green-700";
  }

  if (numericScore >= 60) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-red-100 text-red-700";
};

function InventoryTable({
  inventory = [],
  onDelete,
}) {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role;

  const [openModal, setOpenModal] = useState(false);

  const [
    selectedBatch,
    setSelectedBatch,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    sortDirection,
    setSortDirection,
  ] = useState("desc");

  /*
   * --------------------------------------------------
   * Sort Inventory
   * --------------------------------------------------
   */

  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      const quantityA = Number(a.quantity || 0);
      const quantityB = Number(b.quantity || 0);

      if (sortDirection === "asc") {
        return quantityA - quantityB;
      }

      return quantityB - quantityA;
    });
  }, [inventory, sortDirection]);

  /*
   * --------------------------------------------------
   * Export CSV
   * --------------------------------------------------
   */

  const exportCSV = () => {
    const headers = [
      "Batch ID",
      "Fabric",
      "Source",
      "Quantity",
      "Condition",
      "Status",
      "Storage",
    ];

    const rows = sortedInventory.map((item) => [
      item.batch_id ?? "",
      item.fabric ?? "",
      item.source ?? "",
      item.quantity ?? "",
      item.condition ?? "",
      item.status ?? "",
      item.storage_location ?? "",
    ]);

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replaceAll('"', '""')}"`;
      }

      return stringValue;
    };

    const csv = [
      headers.map(escapeCSV),
      ...rows.map((row) => row.map(escapeCSV)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * --------------------------------------------------
   * Delete
   * --------------------------------------------------
   */

  const handleDeleteClick = (item) => {
    setSelectedBatch(item);
    setOpenModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBatch) return;

    try {
      setDeleting(true);

      await onDelete(selectedBatch);
    } finally {
      setDeleting(false);
      setOpenModal(false);
      setSelectedBatch(null);
    }
  };

  const handleCancel = () => {
    if (deleting) return;

    setOpenModal(false);
    setSelectedBatch(null);
  };

  /*
   * --------------------------------------------------
   * Render
   * --------------------------------------------------
   */

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex flex-col gap-5 border-b border-slate-200 bg-slate-50 px-8 py-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Textile Waste Inventory
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {sortedInventory.length} textile waste batches currently registered.
            </p>
          </div>

          <div className="flex gap-3">

            <Button
              variant="secondary"
              onClick={() =>
                setSortDirection(
                  sortDirection === "asc"
                    ? "desc"
                    : "asc"
                )
              }
            >
              <span className="flex items-center gap-2">
                <ArrowDownUp size={18} />

                {sortDirection === "asc"
                  ? "Quantity ↑"
                  : "Quantity ↓"}
              </span>
            </Button>

            <Button
              variant="secondary"
              onClick={exportCSV}
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet size={18} />
                Export CSV
              </span>
            </Button>

          </div>
        </div>

        {/* ==================================================
            Table
        ================================================== */}

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-600">

                <th className="px-6 py-4 text-left">
                  Batch
                </th>

                <th className="px-6 py-4 text-left">
                  Fabric
                </th>

                <th className="px-6 py-4 text-left">
                  Source
                </th>

                <th className="px-6 py-4 text-left">
                  Quantity
                </th>

                <th className="px-6 py-4 text-left">
                  Sustainability
                </th>

                <th className="px-6 py-4 text-left">
                  Condition
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

                <th className="px-6 py-4 text-left">
                  Storage
                </th>

                <th className="px-6 py-4 text-left">
                  Collection
                </th>

                <th className="px-6 py-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {sortedInventory.length > 0 ? (

                sortedInventory.map((item) => {

                  /*
                   * Important:
                   *
                   * collection_id is required by the backend
                   * analysis pipeline.
                   *
                   * Some older inventory records may not have it,
                   * therefore we preserve the complete waste object
                   * and pass the value when available.
                   */

                  const collectionId =
                    item.collection_id ??
                    item.collection?.id ??
                    null;

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 transition-all duration-300 hover:bg-blue-50"
                    >

                      {/* Batch */}

                      <td className="px-6 py-5">

                        <div>
                          <p className="font-bold text-slate-800">
                            {item.batch_id || `WB-${item.id}`}
                          </p>

                          <p className="text-xs text-slate-500">
                            ID #{item.id}
                          </p>
                        </div>

                      </td>

                      {/* Fabric */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getFabricBadge(
                            item.fabric
                          )}`}
                        >
                          {item.fabric || "-"}
                        </span>

                      </td>

                      {/* Source */}

                      <td className="px-6 py-5">

                        <div>
                          <p className="font-medium">
                            {item.source || "-"}
                          </p>
                        </div>

                      </td>

                      {/* Quantity */}

                      <td className="px-6 py-5">

                        <div className="w-36">

                          <div className="mb-2 flex justify-between text-xs">

                            <span>
                              {formatQuantity(item.quantity)} kg
                            </span>

                          </div>

                          <div className="h-2 rounded-full bg-slate-200">

                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{
                                width: `${Math.min(
                                  Number(item.quantity || 0),
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      {/* Sustainability */}

                      <td className="px-6 py-5">

                        <div className="flex flex-col gap-2">

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getScoreBadge(
                              item.sustainability_score
                            )}`}
                          >

                            <Leaf
                              size={12}
                              className="mr-1"
                            />

                            {item.sustainability_score ?? 0}%

                          </span>

                          <span className="text-xs text-slate-500">

                            Circularity{" "}

                            {item.circularity_score ?? 0}%

                          </span>

                        </div>

                      </td>

                      {/* Condition */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getConditionBadge(
                            item.condition
                          )}`}
                        >
                          {item.condition || "-"}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status || "-"}
                        </span>

                      </td>

                      {/* Storage */}

                      <td className="px-6 py-5">

                        <div className="flex flex-col">

                          <span>
                            {item.storage_location || "-"}
                          </span>

                          <span className="text-xs text-slate-500">
                            {item.rack_number || "-"}
                          </span>

                        </div>

                      </td>

                      {/* Collection Date */}

                      <td className="px-6 py-5">

                        {formatDate(item.collection_date)}

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-5">

                        <div className="flex justify-center gap-2">

                          {/* View */}

                          <Link
                            to={`/inventory/${item.id}`}
                          >
                            <button
                              type="button"
                              title="View waste details"
                              className="rounded-xl p-2.5 text-blue-600 transition hover:bg-blue-100"
                            >
                              <Eye size={18} />
                            </button>
                          </Link>

                          {/* =================================================
                              Analyze With AI

                              IMPORTANT:
                              Pass BOTH waste and collectionId.
                              This keeps the Inventory → Analysis flow
                              compatible with backend /analysis/upload.
                          ================================================= */}

                          <Link
                            to="/image-analysis"
                            state={{
                              waste: item,
                              collectionId,
                            }}
                          >
                            <button
                              type="button"
                              title="Analyze with AI"
                              className="rounded-xl p-2.5 text-violet-600 transition hover:bg-violet-100"
                            >
                              <ScanSearch size={18} />
                            </button>
                          </Link>

                          {/* Edit */}

                          {(role === "administrator" ||
                            role === "manufacturer") && (
                            <Link
                              to={`/inventory/edit/${item.id}`}
                            >
                              <button
                                type="button"
                                title="Edit waste"
                                className="rounded-xl p-2.5 text-amber-600 transition hover:bg-amber-100"
                              >
                                <Pencil size={18} />
                              </button>
                            </Link>
                          )}

                          {/* Delete */}

                          {role === "administrator" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteClick(item)
                              }
                              disabled={deleting}
                              title="Delete waste"
                              className="rounded-xl p-2.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan={10}
                    className="py-20"
                  >

                    <div className="flex flex-col items-center">

                      <Archive
                        size={60}
                        className="mb-5 text-slate-300"
                      />

                      <h2 className="text-2xl font-bold">
                        No Inventory Available
                      </h2>

                      <p className="mt-3 text-slate-500">
                        Register your first textile waste batch to start inventory tracking.
                      </p>

                      <Link
                        to="/inventory/add"
                        className="mt-6"
                      >
                        <Button>
                          Register Waste
                        </Button>
                      </Link>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ==================================================
            Footer
        ================================================== */}

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-8 py-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="text-sm text-slate-500">

            Showing{" "}

            <span className="font-semibold">
              {sortedInventory.length}
            </span>{" "}

            inventory batches.

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm">

              Total Quantity{" "}

              <span className="font-bold text-blue-600">

                {sortedInventory
                  .reduce(
                    (sum, item) =>
                      sum +
                      Number(item.quantity || 0),
                    0
                  )
                  .toLocaleString()}{" "}
                kg

              </span>

            </div>

            <div className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm">

              Available{" "}

              <span className="font-bold text-green-600">

                {
                  sortedInventory.filter(
                    (item) =>
                      item.status === "Available"
                  ).length
                }

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          Delete Confirmation
      ================================================== */}

      <ConfirmModal
        open={openModal}
        title="Delete Textile Waste Batch"
        message={
          selectedBatch
            ? `Are you sure you want to permanently delete ${selectedBatch.batch_id}? This action cannot be undone.`
            : ""
        }
        confirmText={
          deleting
            ? "Deleting..."
            : "Delete Batch"
        }
        cancelText="Cancel"
        onCancel={handleCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

export default InventoryTable;