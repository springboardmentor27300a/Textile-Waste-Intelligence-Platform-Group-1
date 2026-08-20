import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Sparkles,
  Table2,
} from "lucide-react";

import {
  DURATIONS,
  REPORT_TYPES,
  generateReport,
  getReportSummary,
  getReportTypes,
} from "../../services/reportService";


function downloadBlob(
  blob,
  filename,
  fallback
) {

  if (!blob) {
    throw new Error(
      "The server returned an empty report."
    );
  }


  const url =
    window.URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href = url;

  link.download =
    filename ||
    fallback;


  document.body.appendChild(
    link
  );

  link.click();

  link.remove();


  setTimeout(() => {
    window.URL.revokeObjectURL(
      url
    );
  }, 1000);

}


async function getErrorMessage(
  error
) {

  if (
    error?.parsedDetail
  ) {

    if (
      Array.isArray(
        error.parsedDetail
      )
    ) {

      return error.parsedDetail
        .map(
          (item) =>
            item?.msg ||
            String(item)
        )
        .join(", ");

    }


    return String(
      error.parsedDetail
    );

  }


  const detail =
    error?.response?.data?.detail;


  if (
    typeof detail ===
    "string"
  ) {
    return detail;
  }


  if (
    Array.isArray(detail)
  ) {

    return detail
      .map(
        (item) =>
          item?.msg ||
          String(item)
      )
      .join(", ");

  }


  return (
    error?.message ||
    "Report operation failed."
  );

}


function ReportToolbar({
  onRefresh,
}) {

  const [
    reportType,
    setReportType,
  ] = useState(
    "sustainability"
  );


  const [
    reportTypes,
    setReportTypes,
  ] = useState(
    REPORT_TYPES
  );


  const [
    duration,
    setDuration,
  ] = useState(
    "30days"
  );


  const [
    loadingAction,
    setLoadingAction,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  // =====================================================
  // LOAD REPORT TYPES
  // =====================================================

  useEffect(() => {

    let active = true;


    getReportTypes()

      .then((data) => {

        if (
          !active
        ) {
          return;
        }


        if (
          !Array.isArray(
            data?.reports
          ) ||
          !data.reports.length
        ) {
          return;
        }


        setReportTypes(
          data.reports
        );


        if (
          !data.reports.some(
            (item) =>
              item.value ===
              reportType
          )
        ) {

          setReportType(
            data.reports[0]
              .value
          );

        }

      })

      .catch(
        (err) => {

          console.warn(
            "Could not load report types. Using local list.",
            err
          );

        }
      );


    return () => {
      active = false;
    };

  }, []);


  const selectedReport =
    reportTypes.find(
      (item) =>
        item.value ===
        reportType
    ) ||
    reportTypes[0];


  const selectedDuration =
    DURATIONS.find(
      (item) =>
        item.value ===
        duration
    );


  // =====================================================
  // DOWNLOAD
  // =====================================================

  async function handleDownload(
    format
  ) {

    try {

      setError("");

      setLoadingAction(
        format
      );


      const result =
        await generateReport({

          reportType,

          duration,

          format,

        });


      downloadBlob(

        result.blob,

        result.filename,

        `TWIP_${reportType}_${duration}.${format}`

      );

    } catch (err) {

      console.error(
        "Report export failed:",
        err
      );


      const message =
        await getErrorMessage(
          err
        );


      setError(
        message
      );

    } finally {

      setLoadingAction("");

    }

  }


  // =====================================================
  // AI SUMMARY
  // =====================================================

  async function handleAISummary() {

    try {

      setError("");

      setLoadingAction(
        "summary"
      );


      const result =
        await getReportSummary({

          reportType,

          duration,

        });


      const title =
        result?.title ||
        selectedReport?.label ||
        "Report Summary";


      const summary =
        result?.summary ||
        "No summary was returned.";


      const recommendation =
        result?.recommendation ||
        "No recommendation was returned.";


      window.alert(
        `${title}\n\n` +
        `${summary}\n\n` +
        `Recommendation:\n` +
        `${recommendation}`
      );

    } catch (err) {

      console.error(
        "AI summary failed:",
        err
      );


      const message =
        await getErrorMessage(
          err
        );


      setError(
        message
      );

    } finally {

      setLoadingAction("");

    }

  }


  const busy =
    Boolean(
      loadingAction
    );


  return (

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">

      <div className="flex flex-col gap-5">


        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">


          {/* REPORT TYPE */}

          <div className="relative min-w-[280px]">

            <Table2
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />


            <select
              value={reportType}
              onChange={(event) => {

                setReportType(
                  event.target.value
                );

                setError("");

              }}
              disabled={busy}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 outline-none focus:border-blue-600 disabled:bg-slate-50"
            >

              {reportTypes.map(
                (item) => (

                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {item.label}
                  </option>

                )
              )}

            </select>

          </div>


          {/* DURATION */}

          <div className="relative min-w-[190px]">

            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />


            <select
              value={duration}
              onChange={(event) => {

                setDuration(
                  event.target.value
                );

                setError("");

              }}
              disabled={busy}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 outline-none focus:border-blue-600 disabled:bg-slate-50"
            >

              {DURATIONS.map(
                (item) => (

                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {item.label}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

            {error}

          </div>

        )}


        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="flex flex-wrap gap-3">


          {/* REFRESH */}

          <button
            type="button"
            onClick={
              onRefresh
            }
            disabled={busy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RefreshCw
              size={18}
            />

            Refresh

          </button>


          {/* CSV */}

          <button
            type="button"
            onClick={() =>
              handleDownload(
                "csv"
              )
            }
            disabled={busy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <FileSpreadsheet
              size={18}
            />

            {loadingAction ===
            "csv"
              ? "Exporting..."
              : "Export CSV"}

          </button>


          {/* EXCEL */}

          <button
            type="button"
            onClick={() =>
              handleDownload(
                "xlsx"
              )
            }
            disabled={busy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <FileSpreadsheet
              size={18}
            />

            {loadingAction ===
            "xlsx"
              ? "Exporting..."
              : "Export Excel"}

          </button>


          {/* PDF */}

          <button
            type="button"
            onClick={() =>
              handleDownload(
                "pdf"
              )
            }
            disabled={busy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <FileText
              size={18}
            />

            {loadingAction ===
            "pdf"
              ? "Generating..."
              : "Export PDF"}

          </button>


          {/* AI SUMMARY */}

          <button
            type="button"
            onClick={
              handleAISummary
            }
            disabled={busy}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Sparkles
              size={18}
            />

            {loadingAction ===
            "summary"
              ? "Preparing..."
              : "AI Summary"}

          </button>


          {/* GENERATE REPORT */}

          <button
            type="button"
            onClick={() =>
              handleDownload(
                "pdf"
              )
            }
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Download
              size={18}
            />

            {loadingAction ===
            "pdf"
              ? "Generating..."
              : "Generate Report"}

          </button>

        </div>


        {/* ================================================= */}
        {/* CURRENT SELECTION */}
        {/* ================================================= */}

        <p className="text-sm text-muted">

          Selected:{" "}

          <span className="font-semibold text-heading">

            {selectedReport?.label ||
              reportType}

          </span>

          {" · "}

          Period:{" "}

          <span className="font-semibold text-heading">

            {selectedDuration?.label ||
              duration}

          </span>

        </p>

      </div>

    </div>

  );

}


export default ReportToolbar;