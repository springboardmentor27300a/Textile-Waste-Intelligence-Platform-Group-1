import { RotateCcw, Save } from "lucide-react";

function SettingsFooter({
  saving,
  onCancel,
  onSave,
}) {
  return (
    <div className="sticky bottom-0 z-20 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">

        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >

          <RotateCcw size={18} />

          Cancel

        </button>

        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <Save size={18} />

          {saving ? "Saving..." : "Save Changes"}

        </button>

      </div>

    </div>
  );
}

export default SettingsFooter;