function displayValue(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  if (typeof value === "object") {
    return (
      value.display_name ??
      value.organization_name ??
      value.company_name ??
      value.name ??
      "--"
    );
  }

  return String(value);
}


function StatCard({
  title,
  value,
  icon: Icon,
  color = "text-accent",
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-muted">
            {displayValue(title)}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-heading">
            {displayValue(value)}
          </h3>

        </div>

        <div
          className={`rounded-xl bg-gray-100 p-4 ${color}`}
        >
          {Icon && <Icon size={26} />}
        </div>

      </div>

    </div>
  );
}


export default StatCard;