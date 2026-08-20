import { useEffect, useState } from "react";

import AnalysisHeader from "../../components/common/AnalysisHeader";
import AIRecommendation from "../../components/recycling/AIRecommendation";
import RecyclingStrategy from "../../components/recycling/RecyclingStrategy";
import RecyclingMetrics from "../../components/recycling/RecyclingMetrics";
import RecyclingProcess from "../../components/recycling/RecyclingProcess";
import EnvironmentalBenefits from "../../components/recycling/EnvironmentalBenefits";
import RecyclingHistory from "../../components/recycling/RecyclingHistory";

import { getAnalysisHistory } from "../../api/imageAnalysisApi";

function RecyclingEngine() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  /*
   * ---------------------------------------------------------
   * Normalize / repair analysis data for the frontend.
   *
   * The backend RecommendationEngine already defines these
   * values. These fallbacks prevent old database records from
   * displaying N/A when the material is known.
   * ---------------------------------------------------------
   */
  const normalizeAnalysis = (raw) => {
    if (!raw) return null;

    const material =
      raw.material ||
      raw.primary_material ||
      "Unknown";

    const defaults = {
      Cotton: {
        recovered_material: "Recycled Cotton Fiber",
        expected_output: "Recycled Cotton Fiber",
        recycling_method: "Mechanical Recycling",
        processing_time: "1-2 Hours",
        estimated_cost: 500,
      },

      Polyester: {
        recovered_material: "Recycled Polyester Pellets",
        expected_output: "Polyester Pellets",
        recycling_method: "Chemical Recycling",
        processing_time: "3-5 Hours",
        estimated_cost: 1200,
      },

      Silk: {
        recovered_material: "Silk Fiber",
        expected_output: "Silk Yarn",
        recycling_method: "Mechanical Recycling",
        processing_time: "1-2 Hours",
        estimated_cost: 500,
      },

      Wool: {
        recovered_material: "Recycled Wool",
        expected_output: "Recycled Wool",
        recycling_method: "Mechanical Recycling",
        processing_time: "1-2 Hours",
        estimated_cost: 500,
      },

      Denim: {
        recovered_material: "Recovered Denim Fiber",
        expected_output: "Denim Fiber",
        recycling_method: "Mechanical Recycling",
        processing_time: "1-2 Hours",
        estimated_cost: 500,
      },

      Linen: {
        recovered_material: "Recycled Linen Fiber",
        expected_output: "Linen Fiber",
        recycling_method: "Mechanical Recycling",
        processing_time: "1-2 Hours",
        estimated_cost: 500,
      },

      Rayon: {
        recovered_material: "Recovered Cellulose Fiber",
        expected_output: "Cellulose Fiber",
        recycling_method: "Mechanical Recycling",
        processing_time: "3-5 Hours",
        estimated_cost: 1200,
      },

      Nylon: {
        recovered_material: "Recycled Nylon",
        expected_output: "Recycled Nylon Granules",
        recycling_method: "Chemical Recycling",
        processing_time: "3-5 Hours",
        estimated_cost: 1200,
      },

      Acrylic: {
        recovered_material: "Synthetic Fiber",
        expected_output: "Synthetic Textile Fiber",
        recycling_method: "Manual Inspection",
        processing_time: "6-8 Hours",
        estimated_cost: 2500,
      },

      Blended: {
        recovered_material: "Mixed Textile Fiber",
        expected_output: "Mixed Recycled Textile Fiber",
        recycling_method: "Material Separation",
        processing_time: "6-8 Hours",
        estimated_cost: 2500,
      },

      Artificial_fur: {
        recovered_material: "Synthetic Fiber",
        expected_output: "Synthetic Fiber",
        recycling_method: "Manual Inspection",
        processing_time: "6-8 Hours",
        estimated_cost: 2500,
      },

      Artificial_leather: {
        recovered_material: "Composite Material",
        expected_output: "Composite Material",
        recycling_method: "Manual Inspection",
        processing_time: "1-2 Days",
        estimated_cost: 4000,
      },
    };

    const fallback =
      defaults[material] || {
        recovered_material: "Mixed Textile Fiber",
        expected_output: "Mixed Recycled Textile Fiber",
        recycling_method:
          raw.recycling_method ||
          "Manual Inspection",
        processing_time: "3-5 Hours",
        estimated_cost: 1200,
      };

    const value = (primary, fallbackValue) =>
      primary !== undefined &&
      primary !== null &&
      primary !== ""
        ? primary
        : fallbackValue;

    /*
     * Environmental fallback values.
     *
     * These are only used when the existing analysis record
     * does not contain the generated values.
     *
     * We derive them from the existing scores rather than
     * displaying 0 or N/A.
     */
    const recyclability = Number(
      raw.recyclability_score ?? 0
    );

    const circularity = Number(
      raw.circularity_score ?? 0
    );

    const reuse = Number(
      raw.reuse_score ?? 0
    );

    const calculatedRecovery =
      raw.recovery_percentage != null
        ? Number(raw.recovery_percentage)
        : Math.max(
            0,
            Math.min(
              100,
              recyclability * 0.6 +
                circularity * 0.2 +
                reuse * 0.2
            )
          );

    const calculatedCarbon =
      raw.carbon_saving != null
        ? Number(raw.carbon_saving)
        : Number(
            (calculatedRecovery * 0.35).toFixed(2)
          );

    const calculatedWater =
      raw.water_saving != null
        ? Number(raw.water_saving)
        : Number(
            (calculatedRecovery * 12.5).toFixed(2)
          );

    const calculatedLandfill =
      raw.landfill_reduction != null
        ? Number(raw.landfill_reduction)
        : Number(
            calculatedRecovery.toFixed(2)
          );

    const calculatedResource =
      raw.resource_conservation != null
        ? Number(raw.resource_conservation)
        : Number(
            (
              calculatedRecovery * 0.63
            ).toFixed(2)
          );

    return {
      ...raw,

      material,

      /*
       * Recycling strategy
       */
      recovered_material: value(
        raw.recovered_material,
        fallback.recovered_material
      ),

      recovery_percentage:
        calculatedRecovery,

      estimated_cost: value(
        raw.estimated_cost,
        fallback.estimated_cost
      ),

      processing_time: value(
        raw.processing_time,
        fallback.processing_time
      ),

      expected_output: value(
        raw.expected_output,
        fallback.expected_output
      ),

      recycling_method: value(
        raw.recycling_method,
        fallback.recycling_method
      ),

      /*
       * Environmental benefits
       */
      carbon_saving:
        calculatedCarbon,

      water_saving:
        calculatedWater,

      landfill_reduction:
        calculatedLandfill,

      resource_conservation:
        calculatedResource,

      /*
       * Recommendation
       */
      recommendation:
        raw.recommendation ||
        (recyclability >= 90
          ? "Recycle Immediately"
          : recyclability >= 75
          ? "Suitable for Recycling"
          : recyclability >= 60
          ? "Recover Valuable Fibers"
          : "Manual Sorting Required"),

      waste_reduction_strategy:
        raw.waste_reduction_strategy ||
        (circularity >= 85
          ? "Prioritize Reuse"
          : circularity >= 70
          ? "Recycle into New Textile Products"
          : circularity >= 50
          ? "Recover Raw Materials"
          : "Energy Recovery"),
    };
  };

  /*
   * ---------------------------------------------------------
   * Load analyses
   * ---------------------------------------------------------
   */
  const loadRecyclingData = async () => {
    try {
      setLoading(true);
      setSearchError("");

      const response =
        await getAnalysisHistory();

      if (
        !Array.isArray(response) ||
        response.length === 0
      ) {
        setAnalysis(null);
        setHistory([]);
        return;
      }

      const normalized =
        response.map(normalizeAnalysis);

      const sortedHistory =
        [...normalized].sort(
          (a, b) =>
            new Date(
              b.upload_date ||
                b.created_at ||
                0
            ).getTime() -
            new Date(
              a.upload_date ||
                a.created_at ||
                0
            ).getTime()
        );

      setHistory(sortedHistory);
      setAnalysis(sortedHistory[0]);
    } catch (error) {
      console.error(
        "Failed to load recycling data:",
        error
      );

      setSearchError(
        error?.response?.data?.detail ||
          "Failed to load recycling data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecyclingData();
  }, []);

  /*
   * ---------------------------------------------------------
   * Search analysis
   * ---------------------------------------------------------
   */
  const handleSearch = async (batchId) => {
    try {
      setSearchLoading(true);
      setSearchError("");

      const id =
        String(batchId ?? "").trim();

      if (!id) {
        setSearchError(
          "Please enter an Analysis Batch ID."
        );
        return;
      }

      const foundAnalysis =
        history.find(
          (item) =>
            String(
              item.batch_id ??
                item.analysis_batch_id ??
                item.id
            ) === id
        );

      if (!foundAnalysis) {
        setSearchError(
          "Analysis Batch ID not found."
        );
        return;
      }

      setAnalysis(
        normalizeAnalysis(foundAnalysis)
      );
    } catch (error) {
      console.error(
        "Failed to search analysis:",
        error
      );

      setSearchError(
        "Failed to search analysis."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * History selection
   * ---------------------------------------------------------
   */
  const handleHistorySelect = (
    selectedAnalysis
  ) => {
    if (!selectedAnalysis) return;

    setSearchError("");

    setAnalysis(
      normalizeAnalysis(
        selectedAnalysis
      )
    );
  };

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />

        <h2 className="text-xl font-semibold text-heading">
          Loading Recycling Engine...
        </h2>

        <p className="mt-2 text-muted">
          Loading AI recycling recommendations
          and environmental impact.
        </p>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * No data
   * ---------------------------------------------------------
   */
  if (!analysis) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <h2 className="text-xl font-semibold text-heading">
          No Recycling Recommendation Available
        </h2>

        <p className="mt-2 text-muted">
          Upload and analyze a textile image
          first.
        </p>

        {searchError && (
          <p className="mt-4 text-sm text-red-600">
            {searchError}
          </p>
        )}
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Dashboard
   * ---------------------------------------------------------
   */
  return (
    <div className="space-y-8">

      {/* Page Header */}

      <div>
        <h1 className="text-3xl font-bold text-heading">
          AI Recycling Engine
        </h1>

        <p className="mt-2 text-muted">
          AI-powered recycling strategy,
          material recovery recommendations,
          processing metrics and environmental
          benefits based on textile waste analysis.
        </p>
      </div>

      {/* Analysis Header */}

      <AnalysisHeader
        analysis={analysis}
        waste={analysis}
        onSearch={handleSearch}
        loading={searchLoading}
        error={searchError}
      />

      {/* AI Recommendation */}

      <AIRecommendation
        analysis={analysis}
      />

      {/* Recycling Strategy */}

      <RecyclingStrategy
        analysis={analysis}
      />

      {/* Recycling Metrics */}

      <RecyclingMetrics
        analysis={analysis}
      />

      {/* Recycling Process */}

      <RecyclingProcess />

      {/* Environmental Benefits */}

      <EnvironmentalBenefits
        analysis={analysis}
      />

      {/* History */}

      <RecyclingHistory
        history={history}
        selectedId={analysis.id}
        onSelect={handleHistorySelect}
      />

    </div>
  );
}

export default RecyclingEngine;