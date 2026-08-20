// // import ModulePlaceholder from "../components/common/ModulePlaceholder";

// // export default function WasteClassification() {
// //   return (
// //     <ModulePlaceholder
// //       eyebrow="AI INTELLIGENCE"
// //       title="Waste Classification"
// //       description="Classify textile waste characteristics and recovery categories."
// //       milestone="Milestone 2"
// //     />
// //   );
// // }

// import { useEffect, useState } from "react";
// import {
//   Recycle,
//   Gauge,
//   Leaf,
//   RefreshCw,
//   Factory,
//   TrendingUp,
// } from "lucide-react";

// export default function WasteClassification() {
//   const [score, setScore] = useState(null);

//   useEffect(() => {
//     const saved = localStorage.getItem("latestWasteScore");

//     if (saved) {
//       setScore(JSON.parse(saved));
//     }
//   }, []);

//   return (
//     <div className="page">

//       <div className="page-header">
//         <div>
//           <span className="page-eyebrow">
//             AI INTELLIGENCE
//           </span>

//           <h1>Waste Classification</h1>

//           <p>
//             Classify textile waste characteristics,
//             recyclability and circularity potential.
//           </p>
//         </div>
//       </div>

//       {!score ? (
//         <section className="content-card">
//           <h2>No waste classification available</h2>
//           <p>
//             Analyze an image first to generate waste
//             classification scores.
//           </p>
//         </section>
//       ) : (
//         <section className="metric-grid">

//           <article className="metric-card">
//             <div className="metric-icon">
//               <Recycle size={21} />
//             </div>
//             <div>
//               <span>Recyclability</span>
//               <strong>{score.recyclability_score}%</strong>
//               <small>Recycling suitability</small>
//             </div>
//           </article>

//           <article className="metric-card">
//             <div className="metric-icon">
//               <Gauge size={21} />
//             </div>
//             <div>
//               <span>Condition Score</span>
//               <strong>{score.condition_score}%</strong>
//               <small>Material condition</small>
//             </div>
//           </article>

//           <article className="metric-card">
//             <div className="metric-icon">
//               <RefreshCw size={21} />
//             </div>
//             <div>
//               <span>Reuse Potential</span>
//               <strong>{score.reuse_potential_score}%</strong>
//               <small>Reuse suitability</small>
//             </div>
//           </article>

//           <article className="metric-card">
//             <div className="metric-icon">
//               <Leaf size={21} />
//             </div>
//             <div>
//               <span>Environmental Benefit</span>
//               <strong>{score.environmental_benefit_score}%</strong>
//               <small>Environmental value</small>
//             </div>
//           </article>

//         </section>
//       )}

//       {score && (
//         <>
//           <section className="content-card">

//             <div className="card-heading">
//               <div>
//                 <h2>Circularity Assessment</h2>
//                 <p>
//                   Overall textile recovery potential.
//                 </p>
//               </div>
//             </div>

//             <div className="capability-list">

//               <div className="capability-row">
//                 <span>Waste Category</span>
//                 <strong>{score.waste_category}</strong>
//               </div>

//               <div className="capability-row">
//                 <span>Processing Feasibility</span>
//                 <strong>
//                   {score.processing_feasibility_score}%
//                 </strong>
//               </div>

//               <div className="capability-row">
//                 <span>Circularity Score</span>
//                 <strong>
//                   {score.circularity_score}%
//                 </strong>
//               </div>

//             </div>

//           </section>
//         </>
//       )}

//     </div>
//   );
// }
import { getAnalysis } from "../services/analysisService";
import { useEffect, useState } from "react";
import {
  Recycle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";


const scoreItems = [
  [
    "Recyclability",
    "recyclability_score",
  ],
  [
    "Condition",
    "condition_score",
  ],
  [
    "Reuse Potential",
    "reuse_potential_score",
  ],
  [
    "Environmental Benefit",
    "environmental_benefit_score",
  ],
  [
    "Processing Feasibility",
    "processing_feasibility_score",
  ],
  [
    "Circularity",
    "circularity_score",
  ],
];


export default function WasteClassification() {
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
              Waste Classification
            </h1>

            <p className="page-description">
              Classify textile waste
              characteristics and recovery
              potential.
            </p>
          </div>

          <Recycle size={34} />

        </div>


        <div className="content-card">

          <AlertCircle size={35} />

          <h2>
            No analysis available
          </h2>

          <p>
            Analyze a textile image first.
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


  const score =
    analysis.waste_score;


  return (
    <div className="page-container">

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            AI INTELLIGENCE
          </p>

          <h1>
            Waste Classification
          </h1>

          <p className="page-description">
            Waste category and recovery
            assessment generated from
            image analysis.
          </p>

        </div>

        <Recycle size={34} />

      </div>


      <div className="content-card">

        <div className="card-heading">

          <div>

            <h2>
              Waste Assessment
            </h2>

            <p>
              Batch:{" "}
              {analysis.batch_code}
            </p>

          </div>

        </div>


        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#edf8f0",
            marginBottom: "24px",
          }}
        >

          <strong>
            Waste Category
          </strong>

          <h2
            style={{
              marginTop: "8px",
            }}
          >
            {score.waste_category}
          </h2>

        </div>


        <div className="metric-grid">

          {scoreItems.map(
            ([label, key]) => (

              <article
                className="metric-card"
                key={key}
              >

                <div>

                  <span>
                    {label}
                  </span>

                  <strong>
                    {score[key]}%
                  </strong>

                </div>

              </article>

            )
          )}

        </div>

      </div>


      <div className="content-card">

        <h2>
          Recovery Potential
        </h2>

        <p>
          Overall circularity score:
        </p>

        <h1>
          {score.circularity_score}%
        </h1>

        <p>
          Higher circularity indicates
          stronger potential for recovery,
          reuse or recycling.
        </p>

      </div>

    </div>
  );
}