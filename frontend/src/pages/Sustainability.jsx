// import ModulePlaceholder from "../components/common/ModulePlaceholder";

// export default function Sustainability() {
//   return (
//     <ModulePlaceholder
//       eyebrow="SUSTAINABILITY"
//       title="Sustainability Analytics"
//       description="Measure environmental impact and textile circularity outcomes."
//       milestone="Milestone 4"
//     />
//   );
// }
import { getAnalysis } from "../services/analysisService";

import { useEffect, useState } from "react";
import {
  Leaf,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";


export default function Sustainability() {
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
              SUSTAINABILITY
            </p>

            <h1>
              Sustainability Analytics
            </h1>

            <p className="page-description">
              Measure environmental impact
              and textile circularity outcomes.
            </p>

          </div>

          <Leaf size={34} />

        </div>


        <div className="content-card">

          <AlertCircle size={35} />

          <h2>
            No sustainability data available
          </h2>

          <p>
            Analyze a textile image first
            to generate environmental
            impact estimates.
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


  const impact =
    analysis.impact;


  const score =
    analysis.waste_score;


  return (
    <div className="page-container">

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            SUSTAINABILITY
          </p>

          <h1>
            Sustainability Analytics
          </h1>

          <p className="page-description">
            Environmental impact and
            circularity analysis for the
            selected textile waste batch.
          </p>

        </div>

        <Leaf size={34} />

      </div>


      <div className="content-card">

        <div className="card-heading">

          <div>

            <h2>
              Environmental Impact
            </h2>

            <p>
              Batch:{" "}
              {analysis.batch_code}
            </p>

          </div>

        </div>


        <div className="metric-grid">

          <article className="metric-card">
            <div>
              <span>
                CO₂ Avoided
              </span>

              <strong>
                {impact.co2_avoided_kg} kg
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Water Saved
              </span>

              <strong>
                {impact.water_saved_liters} L
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Landfill Avoided
              </span>

              <strong>
                {impact.landfill_avoided_kg} kg
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Material Recovered
              </span>

              <strong>
                {impact.material_recovered_kg} kg
              </strong>
            </div>
          </article>

        </div>

      </div>


      <div className="content-card">

        <h2>
          Circularity Performance
        </h2>


        <div className="metric-grid">

          <article className="metric-card">
            <div>
              <span>
                Waste Diversion
              </span>

              <strong>
                {impact.diversion_percentage}%
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Circularity Score
              </span>

              <strong>
                {score.circularity_score}%
              </strong>
            </div>
          </article>


          <article className="metric-card">
            <div>
              <span>
                Environmental Benefit
              </span>

              <strong>
                {score.environmental_benefit_score}%
              </strong>
            </div>
          </article>

        </div>

      </div>


      <div className="content-card">

        <h2>
          Sustainability Summary
        </h2>

        <p>
          The analyzed textile has a
          circularity score of{" "}
          <strong>
            {score.circularity_score}%
          </strong>
          {" "}and an estimated diversion
          rate of{" "}
          <strong>
            {impact.diversion_percentage}%
          </strong>.
        </p>

        <p>
          Estimated environmental benefits
          include{" "}
          <strong>
            {impact.co2_avoided_kg} kg
          </strong>
          {" "}of CO₂ avoided and{" "}
          <strong>
            {impact.water_saved_liters} liters
          </strong>
          {" "}of water saved.
        </p>

      </div>

    </div>
  );
}