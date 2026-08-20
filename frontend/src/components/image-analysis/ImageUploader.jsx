import { useRef, useState } from "react";
import {
  UploadCloud,
  ImagePlus,
//  CheckCircle2,
  Sparkles,
  AlertTriangle,
  X,
  ShieldCheck,
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ImageUploader({ onImageSelect }) {
  const inputRef = useRef();

  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const validateFile = (file) => {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      setError(
        "Only image files are supported."
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Maximum upload size is 10 MB."
      );
      return false;
    }

    setError("");
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);

    onImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    handleFile(
      e.dataTransfer.files?.[0]
    );
  };

  const handleChange = (e) => {
    handleFile(
      e.target.files?.[0]
    );
  };

  const removeFile = () => {
    setSelectedFile(null);

    setError("");

    if (inputRef.current)
      inputRef.current.value = "";

    onImageSelect(null);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">

      {/* Header */}

      <div className="mb-8">

        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">

          <Sparkles size={16} />

          AI Image Upload

        </div>

        <h2 className="mt-5 text-3xl font-bold text-heading">

          Upload Textile Image

        </h2>

        <p className="mt-3 leading-7 text-muted">

          Upload a textile image for AI powered
          material recognition, sustainability
          assessment, waste classification and
          environmental intelligence.

        </p>

      </div>

      {/* Upload */}

      <div

        onClick={() =>
          inputRef.current.click()
        }

        onDrop={handleDrop}

        onDragOver={(e) =>
          e.preventDefault()
        }

        className="cursor-pointer rounded-3xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-10 text-center transition hover:border-blue-500 hover:shadow-hover"

      >

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white">

          <UploadCloud size={42} />

        </div>

        <h3 className="mt-8 text-2xl font-bold">

          Drag & Drop Image

        </h3>

        <p className="mt-3 text-muted">

          or click anywhere to browse

        </p>

        <button
          type="button"
          className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
        >

          Browse Files

        </button>

        <input

          ref={inputRef}

          type="file"

          accept="image/*"

          className="hidden"

          onChange={handleChange}

        />

      </div>

      {/* Error */}

      {error && (

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertTriangle size={20} />

          {error}

        </div>

      )}

      {/* File */}

      {selectedFile && (

        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">

                {selectedFile.name}

              </h3>

              <p className="mt-2 text-sm text-muted">

                {formatFileSize(
                  selectedFile.size
                )}

              </p>

            </div>

            <button

              onClick={(e) => {

                e.stopPropagation();

                removeFile();

              }}

              className="rounded-full bg-red-100 p-2 text-red-600"

            >

              <X size={18} />

            </button>

          </div>

        </div>

      )}

      {/* Features */}

      <div className="mt-10 grid gap-4 md:grid-cols-2">

        <div className="flex gap-3 rounded-2xl bg-slate-50 p-5">

          <ImagePlus
            className="text-blue-600"
          />

          <div>

            <h4 className="font-semibold">

              Supported Formats

            </h4>

            <p className="text-sm text-muted">

              JPG • PNG • JPEG • WEBP

            </p>

          </div>

        </div>

        <div className="flex gap-3 rounded-2xl bg-slate-50 p-5">

          <ShieldCheck
            className="text-green-600"
          />

          <div>

            <h4 className="font-semibold">

              AI Analysis

            </h4>

            <p className="text-sm text-muted">

              Material • Waste • Sustainability • ESG

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ImageUploader;