export default function ModulePlaceholder({
  eyebrow,
  title,
  description,
  milestone,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">
            {eyebrow}
          </span>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>
      </div>

      <div className="content-card empty-module">
        <div className="empty-module-icon">
          {milestone}
        </div>

        <h2>{title}</h2>

        <p>
          This module is included in the permanent
          application architecture and will be activated
          as its milestone functionality is implemented.
        </p>

        <span className="status-badge pending">
          {milestone}
        </span>
      </div>
    </div>
  );
}