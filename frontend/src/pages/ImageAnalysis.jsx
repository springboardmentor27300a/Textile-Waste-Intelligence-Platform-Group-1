// import { useEffect, useState } from "react";
// import {
//   ImagePlus,
//   Upload,
// } from "lucide-react";

// import {
//   getWasteBatches,
//   getWasteImages,
//   uploadWasteImage,
//   analyzeBatch,
// } from "../services/wasteBatchService";


// function getErrorMessage(error) {
//   const detail = error.response?.data?.detail;

//   if (typeof detail === "string") {
//     return detail;
//   }

//   if (Array.isArray(detail)) {
//     return detail
//       .map((item) => item.msg)
//       .join(", ");
//   }

//   return "Unable to complete image operation.";
// }


// export default function ImageAnalysis() {
//   const [batches, setBatches] =
//     useState([]);

//   const [batchId, setBatchId] =
//     useState("");

//   const [file, setFile] =
//     useState(null);

//   const [isPrimary, setIsPrimary] =
//     useState(true);

//   const [images, setImages] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [uploading, setUploading] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const [message, setMessage] =
//     useState("");
//   const [analysis, setAnalysis] = useState(null);
//   const [analyzing, setAnalyzing] = useState(false);

//   useEffect(() => {
//     async function loadBatches() {
//       try {
//         const data =
//           await getWasteBatches({
//             page: 1,
//             page_size: 100,
//           });

//         setBatches(data.items ?? []);
//       } catch (requestError) {
//         setError(
//           getErrorMessage(requestError)
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadBatches();
//   }, []);


//   async function loadImages(
//     selectedBatchId
//   ) {
//     if (!selectedBatchId) {
//       setImages([]);
//       return;
//     }

//     try {
//       const data =
//         await getWasteImages(
//           selectedBatchId
//         );

//       setImages(data);
//     } catch (requestError) {
//       setError(
//         getErrorMessage(requestError)
//       );
//     }
//   }


//   async function handleBatchChange(event) {
//     const value = event.target.value;

//     setBatchId(value);
//     setFile(null);
//     setMessage("");
//     setError("");

//     await loadImages(value);
//   }


//   function handleFileChange(event) {
//     const selected =
//       event.target.files?.[0];

//     setFile(selected || null);
//   }


//   async function handleUpload(event) {
//     event.preventDefault();

//     if (!batchId) {
//       setError(
//         "Select a waste batch first."
//       );
//       return;
//     }

//     if (!file) {
//       setError(
//         "Select an image to upload."
//       );
//       return;
//     }

//     setUploading(true);
//     setError("");
//     setMessage("");

//     try {
//       const uploaded =
//         await uploadWasteImage(
//           Number(batchId),
//           file,
//           isPrimary
//         );

//       setMessage(
//         `${uploaded.original_filename} uploaded successfully.`
//       );

//       setFile(null);

//       await loadImages(batchId);
//     } catch (requestError) {
//       setError(
//         getErrorMessage(requestError)
//       );
//     } finally {
//       setUploading(false);
//     }
//   }


//   async function handleAnalyze() {
//     if (!batchId) {
//       setError("Select a batch first.");
//       return;
//     }

//     try {
//       setAnalyzing(true);

//       const result = await analyzeBatch(batchId);

//       setAnalysis(result);

//       setMessage("Analysis completed successfully.");

//     } catch (err) {

//       setError(getErrorMessage(err));

//     } finally {

//       setAnalyzing(false);

//     }
//   }

//   return (
//     <div className="page-container">
//       <div className="page-heading">
//         <div>
//           <p className="eyebrow">
//             IMAGE ANALYSIS PIPELINE
//           </p>

//           <h1>Waste Image Upload</h1>

//           <p className="page-description">
//             Attach textile waste images to
//             registered batches for subsequent
//             material and waste classification.
//           </p>
//         </div>

//         <ImagePlus size={34} />
//       </div>

//       {message && (
//         <div className="success-message">
//           {message}
//         </div>
//       )}

//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       <div className="content-card">
//         <div className="card-heading">
//           <div>
//             <h2>Upload Textile Image</h2>

//             <p>
//               Images are associated with a
//               registered waste batch.
//             </p>
//           </div>
//         </div>

//         <form
//           className="form-grid"
//           onSubmit={handleUpload}
//         >
//           <label className="full-width">
//             Waste Batch *
//             <select
//               value={batchId}
//               onChange={handleBatchChange}
//               disabled={loading}
//               required
//             >
//               <option value="">
//                 Select waste batch
//               </option>

//               {batches.map((batch) => (
//                 <option
//                   key={batch.id}
//                   value={batch.id}
//                 >
//                   {batch.batch_code} —{" "}
//                   {batch.declared_material ||
//                     "Material not declared"}{" "}
//                   — {batch.quantity_kg} kg
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label className="full-width">
//             Textile Image *
//             <input
//               type="file"
//               accept="image/jpeg,image/png,image/webp"
//               onChange={handleFileChange}
//               required
//             />
//           </label>

//           <label className="checkbox-field">
//             <input
//               type="checkbox"
//               checked={isPrimary}
//               onChange={(event) =>
//                 setIsPrimary(
//                   event.target.checked
//                 )
//               }
//             />

//             Set as primary image
//           </label>

//           {file && (
//             <div className="full-width">
//               <strong>
//                 Selected file:
//               </strong>{" "}
//               {file.name}

//               <br />

//               <small>
//                 Size:{" "}
//                 {(
//                   file.size /
//                   1024 /
//                   1024
//                 ).toFixed(2)}{" "}
//                 MB
//               </small>
//             </div>
//           )}

//           <div className="form-actions full-width">
//             <button
//               type="submit"
//               className="primary-button"
//               disabled={uploading}
//             >
//               <Upload size={17} />

//               {uploading
//                 ? "Uploading..."
//                 : "Upload Image"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {batchId && (
//         <div className="content-card">
//           <div className="card-heading">
//             <div>
//               <h2>Batch Images</h2>

//               <p>
//                 {images.length} image
//                 {images.length === 1
//                   ? ""
//                   : "s"}{" "}
//                 currently attached.
//               </p>
//             </div>
//           </div>

//           {images.length === 0 ? (
//             <div className="empty-state">
//               <ImagePlus size={34} />

//               <h3>
//                 No images uploaded
//               </h3>

//               <p>
//                 Upload the first textile image
//                 for this waste batch.
//               </p>
//             </div>
//           ) : (
//             <div className="table-wrapper">
//               <table className="data-table">
//                 <thead>
//                   <tr>
//                     <th>File</th>
//                     <th>Type</th>
//                     <th>Size</th>
//                     <th>Primary</th>
//                     <th>Uploaded</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {images.map((image) => (
//                     <tr key={image.id}>
//                       <td>
//                         {image.original_filename}
//                       </td>

//                       <td>
//                         {image.mime_type}
//                       </td>

//                       <td>
//                         {(
//                           image.file_size_bytes /
//                           1024
//                         ).toFixed(1)}{" "}
//                         KB
//                       </td>

//                       <td>
//                         {image.is_primary
//                           ? "Yes"
//                           : "No"}
//                       </td>

//                       <td>
//                         {new Date(
//                           image.uploaded_at
//                         ).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}


//       <div className="content-card">

//         <button
//           className="primary-button"
//           onClick={handleAnalyze}
//           disabled={!batchId || analyzing}
//         >

//           {analyzing ? "Analyzing..." : "Analyze Image"}

//         </button>

//         {analysis && (

//           <div style={{ marginTop: 20 }}>

//             <h2>Analysis Result</h2>

//             <p>
//               <b>Material:</b> {analysis.material}
//             </p>

//             <p>
//               <b>Confidence:</b> {analysis.confidence}%
//             </p>

//             <p>
//               <b>Condition:</b> {analysis.condition}
//             </p>

//           </div>

//         )}

//       </div>

//       <div className="content-card">
//         <h3>
//           Next: Intelligent Classification
//         </h3>

//         <p>
//           Uploaded images become the input for
//           material classification and waste
//           classification in Milestone 2.
//         </p>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";

import {
  ImagePlus,
  Upload,
  BrainCircuit,
} from "lucide-react";

import {
  getWasteBatches,
  getWasteImages,
  uploadWasteImage,
  analyzeBatch,
} from "../services/wasteBatchService";


function getErrorMessage(error) {
  const detail =
    error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .join(", ");
  }

  return (
    error.message ||
    "Unable to complete image operation."
  );
}


export default function ImageAnalysis() {
  const [batches, setBatches] =
    useState([]);

  const [batchId, setBatchId] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [isPrimary, setIsPrimary] =
    useState(true);

  const [images, setImages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);


  useEffect(() => {
    async function loadBatches() {
      try {
        const data =
          await getWasteBatches({
            page: 1,
            page_size: 100,
          });

        setBatches(
          data.items ?? []
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadBatches();
  }, []);


  async function loadImages(
    selectedBatchId
  ) {
    if (!selectedBatchId) {
      setImages([]);
      return;
    }

    try {
      const data =
        await getWasteImages(
          selectedBatchId
        );

      setImages(data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError
        )
      );
    }
  }


  async function handleBatchChange(
    event
  ) {
    const value =
      event.target.value;

    setBatchId(value);
    setFile(null);
    setAnalysis(null);
    setMessage("");
    setError("");

    await loadImages(value);
  }


  function handleFileChange(
    event
  ) {
    const selected =
      event.target.files?.[0];

    setFile(
      selected || null
    );
  }


  async function handleUpload(
    event
  ) {
    event.preventDefault();

    if (!batchId) {
      setError(
        "Select a waste batch first."
      );
      return;
    }

    if (!file) {
      setError(
        "Select an image to upload."
      );
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const uploaded =
        await uploadWasteImage(
          Number(batchId),
          file,
          isPrimary
        );

      setMessage(
        `${uploaded.original_filename} uploaded successfully.`
      );

      setFile(null);

      await loadImages(
        batchId
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError
        )
      );
    } finally {
      setUploading(false);
    }
  }


  async function handleAnalyze() {
    if (!batchId) {
      setError(
        "Select a waste batch first."
      );
      return;
    }

    if (images.length === 0) {
      setError(
        "Upload an image before analysis."
      );
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setMessage("");
      setAnalysis(null);

      const result =
        await analyzeBatch(
          Number(batchId)
        );

      setAnalysis(result);

      /*
       * Save complete analysis so that
       * Milestone 2 and 3 pages can use it.
       */
      // localStorage.setItem(
      //   "latestAnalysis",
      //   JSON.stringify(result)
      // );

      localStorage.setItem(
        "latestAnalysisBatchId",
        String(batchId)
      );

      setMessage(
        "Analysis completed successfully."
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError
        )
      );
    } finally {
      setAnalyzing(false);
    }
  }


  return (
    <div className="page-container">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            IMAGE ANALYSIS PIPELINE
          </p>

          <h1>
            Waste Image Upload
          </h1>

          <p className="page-description">
            Attach textile waste images
            to registered batches for
            material analysis and
            classification.
          </p>
        </div>

        <ImagePlus size={34} />
      </div>


      {message && (
        <div className="success-message">
          {message}
        </div>
      )}


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      <div className="content-card">

        <div className="card-heading">
          <div>
            <h2>
              Upload Textile Image
            </h2>

            <p>
              Images must be associated
              with a registered waste batch.
            </p>
          </div>
        </div>


        <form
          className="form-grid"
          onSubmit={handleUpload}
        >

          <label className="full-width">
            Waste Batch *

            <select
              value={batchId}
              onChange={
                handleBatchChange
              }
              disabled={loading}
              required
            >

              <option value="">
                Select waste batch
              </option>

              {batches.map(
                (batch) => (
                  <option
                    key={batch.id}
                    value={batch.id}
                  >
                    {batch.batch_code}
                    {" — "}
                    {batch.declared_material ||
                      "Material not declared"}
                    {" — "}
                    {batch.quantity_kg}
                    {" kg"}
                  </option>
                )
              )}

            </select>
          </label>


          <label className="full-width">
            Textile Image *

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleFileChange
              }
              required
            />
          </label>


          <label className="checkbox-field">

            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(event) =>
                setIsPrimary(
                  event.target.checked
                )
              }
            />

            Set as primary image

          </label>


          {file && (
            <div className="full-width">

              <strong>
                Selected file:
              </strong>

              {" "}
              {file.name}

              <br />

              <small>
                Size:{" "}
                {(
                  file.size /
                  1024 /
                  1024
                ).toFixed(2)}
                {" MB"}
              </small>

            </div>
          )}


          <div className="form-actions full-width">

            <button
              type="submit"
              className="primary-button"
              disabled={uploading}
            >

              <Upload size={17} />

              {uploading
                ? "Uploading..."
                : "Upload Image"}

            </button>

          </div>

        </form>

      </div>


      {batchId && (
        <div className="content-card">

          <div className="card-heading">

            <div>

              <h2>
                Batch Images
              </h2>

              <p>
                {images.length} image
                {images.length === 1
                  ? ""
                  : "s"} currently attached.
              </p>

            </div>

          </div>


          {images.length === 0 ? (

            <div className="empty-state">

              <ImagePlus size={34} />

              <h3>
                No images uploaded
              </h3>

              <p>
                Upload the first textile
                image for this batch.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table className="data-table">

                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Primary</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>

                <tbody>

                  {images.map(
                    (image) => (
                      <tr key={image.id}>

                        <td>
                          {image.original_filename}
                        </td>

                        <td>
                          {image.mime_type}
                        </td>

                        <td>
                          {(
                            image.file_size_bytes /
                            1024
                          ).toFixed(1)}
                          {" KB"}
                        </td>

                        <td>
                          {image.is_primary
                            ? "Yes"
                            : "No"}
                        </td>

                        <td>
                          {new Date(
                            image.uploaded_at
                          ).toLocaleString()}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}


      <div className="content-card">

        <button
          className="primary-button"
          onClick={handleAnalyze}
          disabled={
            !batchId ||
            images.length === 0 ||
            analyzing
          }
        >

          <BrainCircuit size={18} />

          {analyzing
            ? "Analyzing..."
            : "Analyze Image"}

        </button>


        {analysis && (

          <div
            style={{
              marginTop: "24px",
            }}
          >

            <h2>
              Analysis Result
            </h2>

            <p>
              <strong>
                Batch:
              </strong>{" "}
              {analysis.batch_code}
            </p>

            <p>
              <strong>
                Material:
              </strong>{" "}
              {analysis.material}
            </p>

            <p>
              <strong>
                Confidence:
              </strong>{" "}
              {analysis.confidence}%
            </p>

            <p>
              <strong>
                Condition:
              </strong>{" "}
              {analysis.condition}
            </p>

            <p>
              <strong>
                Condition Confidence:
              </strong>{" "}
              {analysis.condition_confidence}%
            </p>

          </div>

        )}

      </div>


      <div className="content-card">

        <h3>
          Analysis Pipeline Completed
        </h3>

        <p>
          The analysis result is now available
          for Material Classification, Waste
          Classification, Recommendations and
          Sustainability analysis.
        </p>

      </div>

    </div>
  );
}