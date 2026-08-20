import { RefreshCw } from "lucide-react";

function DashboardHeader({
  onRefresh,
  isFetching,
}) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl lg:flex-row lg:items-center lg:justify-between">

      <div>

        <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
          Textile Waste Intelligence Platform
        </span>

        <h1 className="mt-5 text-4xl font-bold">
          Executive Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-blue-100 leading-8">
          AI-powered textile waste monitoring,
          sustainability analytics, circular economy
          insights and operational intelligence.
        </p>

      </div>

      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:scale-105 disabled:opacity-60"
      >
        <RefreshCw
          size={20}
          className={isFetching ? "animate-spin" : ""}
        />

        Refresh Dashboard
      </button>

    </div>
  );
}

export default DashboardHeader;