import { useEffect, useState } from "react";

import AnalysisHeader from "../../components/common/AnalysisHeader";
import MaterialCard from "../../components/material/MaterialCard";
import MaterialProperties from "../../components/material/MaterialProperties";
import RecyclingMethods from "../../components/material/RecyclingMethods";
import EnvironmentalImpact from "../../components/material/EnvironmentalImpact";
import MaterialHistory from "../../components/material/MaterialHistory";

import {
  getAnalysisHistory,
  getAnalysisById,
} from "../../api/imageAnalysisApi";

function MaterialClassification() {
  const [material, setMaterial] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaterial();
  }, []);

  /*
   * Convert the backend AnalysisResponse into the
   * structure expected by the existing material cards.
   *
   * IMPORTANT:
   * Environmental values now use the canonical backend
   * field names directly.
   */
  const mapMaterial = (data) => {
    if (!data) {
      setMaterial(null);
      setAnalysis(null);
      return;
    }

    setAnalysis(data);

    setMaterial({
      name:
        data.material ||
        data.primary_material ||
        "Unknown",

      confidence: Number(
        data.confidence ?? 0
      ),

      category:
        data.material_category ||
        data.category ||
        data.waste_category ||
        "Not Available",

      composition:
        data.composition ||
        data.fiber_composition ||
        "Not Available",

      quality:
        data.material_quality ||
        data.quality ||
        "Not Available",

      color:
        data.dominant_color ||
        data.color ||
        "Not Available",

      pattern:
        data.pattern ||
        "Not Available",

      texture:
        data.texture ||
        "Not Available",

      recyclable:
        Boolean(
          data.recyclable ??
          Number(data.recyclability_score ?? 0) >= 70
        ),

      recommendation:
        data.recommendation ||
        "Not Available",

      recyclability:
        Number(
          data.recyclability_score ?? 0
        ),

      /*
       * Canonical environmental values.
       */
      carbon_savings:
        Number(
          data.carbon_savings ??
          data.carbon_saving ??
          0
        ),

      water_savings:
        Number(
          data.water_savings ??
          data.water_saving ??
          0
        ),

      energy_savings:
        Number(
          data.energy_savings ??
          data.energy_saving ??
          0
        ),

      landfill_diversion:
        Number(
          data.landfill_diversion ??
          data.landfill_reduction ??
          0
        ),

      resource_conservation:
        Number(
          data.resource_conservation ?? 0
        ),

      /*
       * Keep legacy aliases so other existing components
       * don't suddenly break.
       */
      co2Saving:
        Number(
          data.carbon_savings ??
          data.carbon_saving ??
          0
        ),

      waterSaving:
        Number(
          data.water_savings ??
          data.water_saving ??
          0
        ),

      energySaving:
        Number(
          data.energy_savings ??
          data.energy_saving ??
          0
        ),

      landfillReduction:
        Number(
          data.landfill_diversion ??
          data.landfill_reduction ??
          0
        ),
    });
  };

  const loadMaterial = async () => {
    try {
      setLoading(true);
      setError("");

      const history = await getAnalysisHistory();

      if (!Array.isArray(history) || history.length === 0) {
        setMaterial(null);
        setAnalysis(null);
        return;
      }

      /*
       * Backend returns analysis history newest-first.
       * Still sort defensively using created_at/upload_date.
       */
      const latest = [...history].sort((a, b) => {
        const dateA = new Date(
          a.created_at ||
          a.upload_date ||
          0
        ).getTime();

        const dateB = new Date(
          b.created_at ||
          b.upload_date ||
          0
        ).getTime();

        return dateB - dateA;
      })[0];

      mapMaterial(latest);
    } catch (err) {
      console.error(
        "Failed to load material analysis:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load material analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBatch = async (batchId) => {
    const id = String(batchId ?? "").trim();

    if (!id) {
      setError(
        "Please enter an Analysis Batch ID."
      );
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getAnalysisById(id);

      mapMaterial(response);

      return response;
    } catch (err) {
      console.error(
        "Failed to load analysis:",
        err
      );

      if (err.response?.status === 404) {
        setError(
          "Analysis Batch ID does not exist."
        );
      } else {
        setError(
          err.response?.data?.detail ||
          "Unable to load analysis."
        );
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  if (!material) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        {loading ? (
          <>
            <h2 className="text-xl font-semibold">
              Loading Analysis...
            </h2>

            <p className="mt-2 text-muted">
              Please wait while the latest textile analysis is loaded.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold">
              No Material Analysis Available
            </h2>

            <p className="mt-2 text-muted">
              {error ||
                "Upload and analyze a textile image first."}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-heading">
          Material Classification
        </h1>

        <p className="mt-2 text-muted">
          AI-powered textile material identification and recycling
          recommendations.
        </p>
      </div>

      <AnalysisHeader
        analysis={analysis}
        onSearch={loadBatch}
        loading={loading}
        error={error}
        waste={{
          id:
            analysis?.id ??
            analysis?.batch_id,

          quantity:
            analysis?.quantity ??
            analysis?.weight,

          image_path:
            analysis?.image_path,

          material:
            analysis?.material,

          source:
            analysis?.source,

          supplier:
            analysis?.supplier,

          analysisDate:
            analysis?.created_at ??
            analysis?.upload_date,
        }}
      />

      <MaterialCard
        material={material}
      />

      <MaterialProperties
        material={material}
      />

      <RecyclingMethods
        material={material}
      />

      <EnvironmentalImpact
        material={material}
        analysis={analysis}
      />

      <MaterialHistory
        onSelect={loadBatch}
      />
    </div>
  );
}

export default MaterialClassification;