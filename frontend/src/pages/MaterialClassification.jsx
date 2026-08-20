// // // import ModulePlaceholder from "../components/common/ModulePlaceholder";

// // // export default function MaterialClassification() {
// // //   return (
// // //     <ModulePlaceholder
// // //       eyebrow="AI INTELLIGENCE"
// // //       title="Material Classification"
// // //       description="AI-powered identification of textile material composition."
// // //       milestone="Milestone 2"
// // //     />
// // //   );
// // // }
// // import { useEffect, useState } from "react";
// // import api from "../../services/api";

// // export default function MaterialClassificationPage() {

// //     const [result, setResult] = useState<any>(null);

// //     useEffect(() => {
// //         loadLatest();
// //     }, []);

// //     const loadLatest = async () => {
// //         try {
// //             const res = await api.get("/analysis/latest");
// //             setResult(res.data);
// //         } catch (e) {
// //             console.log(e);
// //         }
// //     };

// //     if (!result)
// //         return <h2>Loading...</h2>;

// //     return (
// //         <div>

// //             <h1>Material Classification</h1>

// //             <h2>{result.material}</h2>

// //             <p>
// //                 Confidence : {result.confidence}%
// //             </p>

// //             <p>
// //                 Condition : {result.condition}
// //             </p>

// //         </div>
// //     );
// // }

// import { useEffect, useState } from "react";
// import {
//   BrainCircuit,
//   CheckCircle2,
//   Activity,
//   AlertTriangle,
// } from "lucide-react";

// export default function MaterialClassification() {
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     const saved = localStorage.getItem("latestAnalysis");

//     if (saved) {
//       try {
//         setResult(JSON.parse(saved));
//       } catch (error) {
//         console.error("Unable to read analysis result", error);
//       }
//     }
//   }, []);

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <span className="page-eyebrow">AI INTELLIGENCE</span>

//           <h1>Material Classification</h1>

//           <p>
//             AI-powered identification of textile material
//             composition and condition.
//           </p>
//         </div>
//       </div>

//       {!result ? (
//         <section className="content-card">
//           <div className="card-heading">
//             <div>
//               <h2>No analysis available</h2>
//               <p>
//                 Upload and analyze a textile image first.
//               </p>
//             </div>
//           </div>
//         </section>
//       ) : (
//         <>
//           <section className="metric-grid">

//             <article className="metric-card">
//               <div className="metric-icon">
//                 <BrainCircuit size={21} />
//               </div>

//               <div>
//                 <span>Predicted Material</span>
//                 <strong>
//                   {result.material || result.predicted_material}
//                 </strong>
//                 <small>AI material classification</small>
//               </div>
//             </article>

//             <article className="metric-card">
//               <div className="metric-icon">
//                 <CheckCircle2 size={21} />
//               </div>

//               <div>
//                 <span>Confidence</span>
//                 <strong>
//                   {result.confidence ?? result.confidence_score}%
//                 </strong>
//                 <small>Prediction confidence</small>
//               </div>
//             </article>

//             <article className="metric-card">
//               <div className="metric-icon">
//                 <Activity size={21} />
//               </div>

//               <div>
//                 <span>Condition</span>
//                 <strong>
//                   {result.condition || result.predicted_condition}
//                 </strong>
//                 <small>Estimated textile condition</small>
//               </div>
//             </article>

//             <article className="metric-card">
//               <div className="metric-icon">
//                 <AlertTriangle size={21} />
//               </div>

//               <div>
//                 <span>Condition Confidence</span>
//                 <strong>
//                   {result.condition_confidence ?? "--"}%
//                 </strong>
//                 <small>Condition prediction confidence</small>
//               </div>
//             </article>

//           </section>

//           <section className="content-card">
//             <div className="card-heading">
//               <div>
//                 <h2>Classification Result</h2>
//                 <p>
//                   Detailed AI prediction for the analyzed textile.
//                 </p>
//               </div>
//             </div>

//             <div className="capability-list">

//               <div className="capability-row">
//                 <span>Material</span>
//                 <strong>
//                   {result.material || result.predicted_material}
//                 </strong>
//               </div>

//               <div className="capability-row">
//                 <span>Confidence</span>
//                 <strong>
//                   {result.confidence ?? result.confidence_score}%
//                 </strong>
//               </div>

//               <div className="capability-row">
//                 <span>Condition</span>
//                 <strong>
//                   {result.condition || result.predicted_condition}
//                 </strong>
//               </div>

//               <div className="capability-row">
//                 <span>Condition Confidence</span>
//                 <strong>
//                   {result.condition_confidence ?? "--"}%
//                 </strong>
//               </div>

//             </div>
//           </section>

//           {result.alternative_predictions?.length > 0 && (
//             <section className="content-card">
//               <div className="card-heading">
//                 <div>
//                   <h2>Alternative Predictions</h2>
//                   <p>
//                     Other possible material classifications.
//                   </p>
//                 </div>
//               </div>

//               <div className="capability-list">
//                 {result.alternative_predictions.map(
//                   (item, index) => (
//                     <div
//                       className="capability-row"
//                       key={index}
//                     >
//                       <span>{item.material}</span>
//                       <strong>
//                         {item.confidence}%
//                       </strong>
//                     </div>
//                   )
//                 )}
//               </div>
//             </section>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

import { getAnalysis } from "../services/analysisService";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";


export default function MaterialClassification() {
  const [analysis, setAnalysis] =
    useState(null);

  // useEffect(() => {
  //   const saved =
  //     localStorage.getItem(
  //       "latestAnalysis"
  //     );

  //   if (saved) {
  //     try {
  //       setAnalysis(
  //         JSON.parse(saved)
  //       );
  //     } catch {
  //       setAnalysis(null);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    async function loadAnalysis() {
      const batchId =
        localStorage.getItem(
          "latestAnalysisBatchId"
        );

      if (!batchId) {
        setAnalysis(null);
        return;
      }

      try {
        const result =
          await getAnalysis(
            Number(batchId)
          );

        setAnalysis(result);
      } catch (error) {
        console.error(
          "Unable to load analysis:",
          error
        );

        setAnalysis(null);
      }
    }

    loadAnalysis();
  }, []);


  if (!analysis) {
    return (
      <div className="page-container">

        <div className="page-heading">
          <div>
            <p className="eyebrow">
              AI INTELLIGENCE
            </p>

            <h1>
              Material Classification
            </h1>

            <p className="page-description">
              AI-powered identification of
              textile material composition.
            </p>
          </div>

          <BrainCircuit size={34} />
        </div>


        <div className="content-card">

          <AlertCircle size={35} />

          <h2>
            No analysis available
          </h2>

          <p>
            Upload and analyze a textile
            image first.
          </p>

          <Link
            to="/analysis/images"
            className="primary-button"
          >
            Go to Image Analysis
          </Link>

        </div>

      </div>
    );
  }


  const alternatives =
    analysis.alternative_predictions ||
    [];


  return (
    <div className="page-container">

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            AI INTELLIGENCE
          </p>

          <h1>
            Material Classification
          </h1>

          <p className="page-description">
            AI-powered identification of
            textile material composition.
          </p>

        </div>

        <BrainCircuit size={34} />

      </div>


      <div className="content-card">

        <div className="card-heading">

          <div>

            <h2>
              Classification Result
            </h2>

            <p>
              Batch:{" "}
              {analysis.batch_code}
            </p>

          </div>

          <CheckCircle2 size={30} />

        </div>


        <div className="metric-grid">

          <article className="metric-card">
            <div>
              <span>
                Predicted Material
              </span>

              <strong>
                {analysis.material}
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Confidence
              </span>

              <strong>
                {analysis.confidence}%
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Condition
              </span>

              <strong>
                {analysis.condition}
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Condition Confidence
              </span>

              <strong>
                {analysis.condition_confidence}%
              </strong>
            </div>
          </article>

        </div>

      </div>


      <div className="content-card">

        <h2>
          Alternative Predictions
        </h2>

        {alternatives.length === 0 ? (

          <p>
            No alternative predictions available.
          </p>

        ) : (

          <div className="table-wrapper">

            <table className="data-table">

              <thead>
                <tr>
                  <th>Material</th>
                  <th>Confidence</th>
                </tr>
              </thead>

              <tbody>

                {alternatives.map(
                  (item, index) => (
                    <tr key={index}>

                      <td>
                        {item.material}
                      </td>

                      <td>
                        {item.confidence}%
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      <div className="content-card">

        <h3>
          Classification Model
        </h3>

        <p>
          Model: Textile Material Classification
        </p>

        <p>
          Type: Fine-Tuned Deep Learning Model
        </p>

        <p>
          Classes: 7
        </p>

        <p>
          Version: 1.0
        </p>
      </div>

    </div>
  );
}