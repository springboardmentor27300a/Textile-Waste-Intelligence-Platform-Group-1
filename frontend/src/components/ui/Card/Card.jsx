function Card({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white shadow-card ${className}`}
    >
      {(title || subtitle) && (
        <div className="border-b border-slate-100 p-6">

          {title && (
            <h2 className="text-xl font-bold text-heading">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-muted">
              {subtitle}
            </p>
          )}

        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default Card;