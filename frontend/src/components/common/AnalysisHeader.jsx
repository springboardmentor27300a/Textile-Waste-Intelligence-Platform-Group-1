import { useEffect, useState } from "react";

import {
  Package,
  Shirt,
  Calendar,
  Target,
  Tag,
  Image as ImageIcon,
  Search,
} from "lucide-react";

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4">
      <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">
          {label}
        </p>

        <p className="truncate font-semibold text-heading">
          {value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
            ? value
            : "Not Available"}
        </p>
      </div>
    </div>
  );
}

function getApiBaseUrl() {
  /*
   * Use Vite environment variable when available.
   * Otherwise fall back to local FastAPI.
   */
  return (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000"
  ).replace(/\/+$/, "");
}

function buildImageUrl(imagePath) {
  if (!imagePath) {
    return null;
  }

  const rawPath = String(imagePath).trim();

  if (!rawPath) {
    return null;
  }

  /*
   * Already a complete URL.
   */
  if (
    rawPath.startsWith("http://") ||
    rawPath.startsWith("https://") ||
    rawPath.startsWith("blob:")
  ) {
    return rawPath;
  }

  /*
   * Normalize Windows paths and backend filesystem paths.
   *
   * Examples:
   * uploads/a.jpg
   * /uploads/a.jpg
   * uploads\\a.jpg
   */
  let normalized = rawPath
    .replace(/\\/g, "/")
    .trim();

  /*
   * Remove accidental leading ./.
   */
  normalized = normalized.replace(/^\.\/+/, "");

  /*
   * If backend stores:
   * uploads/file.jpg
   *
   * FastAPI exposes:
   * /uploads/file.jpg
   */
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return `${getApiBaseUrl()}${normalized}`;
}

function AnalysisHeader({
  waste,
  analysis,
  onSearch,
  loading = false,
  error = "",
}) {
  const [batchId, setBatchId] =
    useState("");

  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    const id =
      analysis?.id ??
      analysis?.batch_id ??
      analysis?.image_id ??
      waste?.id ??
      waste?.batch_id ??
      "";

    setBatchId(String(id));
    setImageError(false);
  }, [analysis, waste]);

  if (!waste && !analysis) {
    return null;
  }

  const imagePath =
    analysis?.image_path ??
    waste?.image_path ??
    analysis?.image_url ??
    analysis?.image ??
    waste?.image ??
    null;

  const image = buildImageUrl(imagePath);

  const handleSearch = () => {
    const id = String(batchId).trim();

    if (!id) {
      return;
    }

    onSearch?.(id);
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-heading">
            Analyzed Details
          </h2>

          <p className="mt-2 text-muted">
            Search an existing AI analysis using its Analysis Batch ID.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <label className="mb-2 block text-sm font-medium text-heading">
            Analysis Batch ID
          </label>

          <div className="flex gap-3">
            <input
              type="text"
              value={batchId}
              onChange={(event) =>
                setBatchId(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Enter Analysis Batch ID"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} />

              {loading
                ? "Searching..."
                : "Search"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div>
          {image && !imageError ? (
            <img
              src={image}
              alt="Analyzed textile waste"
              className="h-64 w-full rounded-xl border object-cover"
              onError={() => {
                console.error(
                  "Failed to load analysis image:",
                  image
                );

                setImageError(true);
              }}
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed bg-gray-50">
              <div className="text-center">
                <ImageIcon
                  size={42}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 text-sm text-muted">
                  {image
                    ? "Image could not be loaded"
                    : "No Image Available"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-2">
            <InfoItem
              icon={Package}
              label="Batch ID"
              value={
                analysis?.id ??
                analysis?.batch_id ??
                waste?.id ??
                waste?.batch_id
              }
            />

            <InfoItem
              icon={Shirt}
              label="Material"
              value={
                analysis?.material ??
                waste?.material
              }
            />

            <InfoItem
              icon={Tag}
              label="Waste Category"
              value={
                analysis?.waste_category ??
                analysis?.category ??
                waste?.waste_category
              }
            />

            <InfoItem
              icon={Target}
              label="Confidence"
              value={
                analysis?.confidence !== null &&
                analysis?.confidence !== undefined
                  ? `${Number(
                      analysis.confidence
                    ).toFixed(1)}%`
                  : null
              }
            />

            <InfoItem
              icon={Calendar}
              label="Analysis Date"
              value={
                analysis?.created_at ||
                analysis?.upload_date
                  ? new Date(
                      analysis.created_at ||
                      analysis.upload_date
                    ).toLocaleString()
                  : null
              }
            />

            <InfoItem
              icon={Package}
              label="Source"
              value={
                analysis?.source ??
                analysis?.uploaded_by ??
                waste?.source
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisHeader;