import { Pill } from "./Ui.jsx";
import { Brain, Eye } from "./Icons.jsx";

/**
 * Renders the two dataset-backed model outputs. Both are optional: if the
 * datasets haven't been downloaded and trained, the analysis simply omits them
 * and this renders nothing rather than showing empty scaffolding.
 */
export default function DatasetFindings({ defect, garment }) {
  if (!defect && !garment) return null;

  return (
    <section className="card p-5">
      <h3 className="font-display text-[15px] font-bold">Dataset-backed findings</h3>
      <p className="mt-1 text-xs text-muted">
        Supervised models trained on AITEX and Fashion-MNIST, separate from the fibre classifier.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {defect && (
          <div className="rounded-lg border border-line bg-panel-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/12 text-brand">
                <Eye className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">Defect detection</span>
            </div>
            <p className={`mt-3 font-display text-lg font-bold ${
              defect.defect_probability >= 0.5 ? "text-warn" : "text-brand"}`}>
              {defect.verdict}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ground">
              <div className={`h-full rounded-full ${
                defect.defect_probability >= 0.5 ? "bg-warn" : "bg-brand"}`}
                style={{ width: `${defect.defect_probability * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted tnum">
              {(defect.defect_probability * 100).toFixed(0)}% probability · AITEX holdout AUC{" "}
              {defect.holdout_auc}
            </p>
          </div>
        )}

        {garment && garment.applicable !== false && (
          <div className="rounded-lg border border-line bg-panel-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/12 text-brand">
                <Brain className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">Garment recognition</span>
            </div>
            <p className="mt-3 font-display text-lg font-bold">{garment.garment}</p>
            <p className="mt-1 text-xs text-muted tnum">
              {(garment.confidence * 100).toFixed(0)}% confidence · Fashion-MNIST test accuracy{" "}
              {(garment.test_accuracy * 100).toFixed(0)}%
            </p>
            {garment.likely_fibres?.length > 0 && (
              <div className="mt-3">
                <p className="eyebrow">Fibres typical of this garment</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {garment.likely_fibres.map((f) => <Pill key={f} tone="info">{f}</Pill>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {garment?.applicable === false && (
        <p className="mt-4 rounded-lg border border-line bg-panel-2 px-3.5 py-2.5 text-xs text-muted">
          <span className="font-semibold text-ink">Garment recognition skipped.</span>{" "}
          {garment.reason}
        </p>
      )}
      {garment?.applicable !== false && garment?.caveat && (
        <p className="mt-3 text-xs text-muted">{garment.caveat}</p>
      )}
    </section>
  );
}
