function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">

      <h2 className="text-2xl font-bold text-heading">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-muted">
          {subtitle}
        </p>
      )}

    </div>
  );
}

export default SectionHeader;