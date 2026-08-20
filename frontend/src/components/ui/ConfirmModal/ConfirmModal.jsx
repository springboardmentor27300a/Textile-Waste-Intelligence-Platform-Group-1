import { AlertTriangle } from "lucide-react";
import Button from "../Button";

function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex items-start gap-4">

          <div className="rounded-full bg-red-100 p-3">

            <AlertTriangle
              size={24}
              className="text-red-600"
            />

          </div>

          <div className="flex-1">

            <h2 className="text-xl font-semibold text-heading">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              {message}
            </p>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
          >
            Delete
          </Button>

        </div>

      </div>

    </div>
  );
}

export default ConfirmModal;