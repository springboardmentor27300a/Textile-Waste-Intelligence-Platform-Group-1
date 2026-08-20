import {
  Image,
  Camera,
  FileImage,
  Maximize2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "-";

  if (bytes < 1024)
    return `${bytes} B`;

  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ImagePreview({ image }) {

  if (!image) {

    return (

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">

        <div className="flex h-[620px] flex-col items-center justify-center">

          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100">

            <Image
              size={52}
              className="text-slate-400"
            />

          </div>

          <h2 className="mt-8 text-2xl font-bold text-heading">

            Image Preview

          </h2>

          <p className="mt-3 max-w-md text-center leading-7 text-muted">

            Upload a textile image to preview it before
            sending it to the AI analysis engine.

          </p>

        </div>

      </div>

    );

  }

  const imageURL = URL.createObjectURL(image);

  return (

    <div className="rounded-3xl border border-slate-200 bg-white shadow-card">

      <div className="border-b border-slate-100 p-6">

        <h2 className="text-2xl font-bold text-heading">

          Image Preview

        </h2>

        <p className="mt-2 text-muted">

          Verify the uploaded image before AI analysis.

        </p>

      </div>

      <div className="p-6">

        <div className="overflow-hidden rounded-3xl border bg-slate-50">

          <img

            src={imageURL}

            alt="Preview"

            className="h-[420px] w-full object-contain"

          />

        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">

            <FileImage
              className="text-blue-600"
              size={22}
            />

            <div>

              <h4 className="font-semibold">

                File Name

              </h4>

              <p className="text-sm text-muted break-all">

                {image.name}

              </p>

            </div>

          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">

            <Camera
              className="text-green-600"
              size={22}
            />

            <div>

              <h4 className="font-semibold">

                File Type

              </h4>

              <p className="text-sm text-muted">

                {image.type}

              </p>

            </div>

          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">

            <Maximize2
              className="text-violet-600"
              size={22}
            />

            <div>

              <h4 className="font-semibold">

                File Size

              </h4>

              <p className="text-sm text-muted">

                {formatSize(image.size)}

              </p>

            </div>

          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">

            <Calendar
              className="text-orange-600"
              size={22}
            />

            <div>

              <h4 className="font-semibold">

                Last Modified

              </h4>

              <p className="text-sm text-muted">

                {new Date(
                  image.lastModified
                ).toLocaleString()}

              </p>

            </div>

          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

          <div className="flex items-center gap-3">

            <CheckCircle2
              className="text-green-600"
            />

            <div>

              <h3 className="font-semibold text-green-700">

                Ready for AI Analysis

              </h3>

              <p className="mt-2 text-sm text-green-700">

                The uploaded image passed validation
                and is ready for AI material recognition,
                waste classification and sustainability
                assessment.

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default ImagePreview;