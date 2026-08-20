import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";

function DeleteUserModal({
  open,
  user,
  onClose,
  onConfirm,
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!open || !user) return null;

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-heading">
              Delete User
            </h2>

            <p className="mt-1 text-sm text-muted">
              Confirm before permanently removing this user.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert
              size={40}
              className="text-red-600"
            />
          </div>

          <h3 className="text-xl font-semibold text-heading">
            Are you sure?
          </h3>

          <p className="mt-3 text-sm leading-6 text-muted">
            You are deleting{" "}
            <strong>{user.full_name}</strong>.
            This action cannot be undone.
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-5">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border px-6 py-2.5"
          >
            Cancel
          </button>

          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;