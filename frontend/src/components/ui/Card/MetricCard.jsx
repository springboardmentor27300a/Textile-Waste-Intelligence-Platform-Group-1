function MetricCard({
  icon: Icon,
  title,
  value,
  color = "bg-blue-100 text-blue-600",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-muted">
            {title}
          </p>

          <h3 className="mt-2 break-words text-2xl font-bold text-heading">
            {value ?? "--"}
          </h3>

        </div>

        <div
          className={`rounded-2xl p-4 ${color}`}
        >

          <Icon size={24} />

        </div>

      </div>

    </div>
  );
}

export default MetricCard;