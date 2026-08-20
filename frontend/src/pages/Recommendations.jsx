// import ModulePlaceholder from "../components/common/ModulePlaceholder";

// export default function Recommendations() {
//   return (
//     <ModulePlaceholder
//       eyebrow="RECOVERY INTELLIGENCE"
//       title="Recommendations"
//       description="Generate reuse, recycling and recovery recommendations."
//       milestone="Milestone 3"
//     />
//   );
// }

import { getAnalysis } from "../services/analysisService";
import { useEffect, useState } from "react";
import {
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";


export default function Recommendations() {
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
              RECOVERY INTELLIGENCE
            </p>

            <h1>
              Recommendations
            </h1>

            <p className="page-description">
              Generate reuse, recycling and
              recovery recommendations.
            </p>

          </div>

          <Lightbulb size={34} />

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


  const recommendations =
    analysis.recommendations || [];


  return (
    <div className="page-container">

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            RECOVERY INTELLIGENCE
          </p>

          <h1>
            Recommendations
          </h1>

          <p className="page-description">
            Recommended recovery strategies
            based on the analyzed textile.
          </p>

        </div>

        <Lightbulb size={34} />

      </div>


      <div className="content-card">

        <div className="card-heading">

          <div>

            <h2>
              Recovery Recommendations
            </h2>

            <p>
              Material:{" "}
              {analysis.material}
            </p>

          </div>

        </div>


        {recommendations.length === 0 ? (

          <p>
            No recommendation available.
          </p>

        ) : (

          <div className="table-wrapper">

            <table className="data-table">

              <thead>

                <tr>
                  <th>Rank</th>
                  <th>Action</th>
                  <th>Suitability</th>
                  <th>Reason</th>
                  <th>Primary</th>
                </tr>

              </thead>

              <tbody>

                {recommendations.map(
                  (recommendation, index) => (

                    <tr key={index}>

                      <td>
                        {recommendation.rank}
                      </td>

                      <td>
                        <strong>
                          {recommendation.action}
                        </strong>
                      </td>

                      <td>
                        {recommendation.suitability_score}%
                      </td>

                      <td>
                        {recommendation.reason}
                      </td>

                      <td>
                        {recommendation.is_primary
                          ? "Yes"
                          : "No"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}