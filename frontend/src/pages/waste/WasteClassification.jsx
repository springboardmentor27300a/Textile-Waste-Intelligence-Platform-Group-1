import { useEffect, useState } from "react";

import AnalysisHeader from "../../components/common/AnalysisHeader";
import WasteCard from "../../components/waste/WasteCard";
import WasteProperties from "../../components/waste/WasteProperties";
import WasteHistory from "../../components/waste/WasteHistory";

import { getAnalysisHistory } from "../../api/imageAnalysisApi";

function WasteClassification() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    loadWasteData();
  }, []);

  const normalizeAnalysis = (data) => {
    if (!data) return null;

    const material =
      data.material ??
      data.primary_material ??
      "Not Available";

    /*
     * The AI material classifier already defines these properties
     * for materials such as Silk, Cotton, Polyester, Wool, etc.
     *
     * These are ONLY fallbacks when the API/database value is null.
     */
    const materialDefaults = {
      Cotton: {
        secondary_material: null,
        composition: "100% Cotton",
        material_quality: "Premium",
        durability: "High",
        stretchability: "Low",
        breathability: "Excellent",
        moisture_absorption: "Excellent",
        thermal_property: "Medium",
        recycling_difficulty: "Easy",
      },

      Polyester: {
        secondary_material: null,
        composition: "100% Polyester",
        material_quality: "High",
        durability: "Very High",
        stretchability: "Medium",
        breathability: "Low",
        moisture_absorption: "Low",
        thermal_property: "Medium",
        recycling_difficulty: "Medium",
      },

      Silk: {
        secondary_material: null,
        composition: "100% Silk",
        material_quality: "Luxury",
        durability: "Medium",
        stretchability: "Low",
        breathability: "Excellent",
        moisture_absorption: "High",
        thermal_property: "High",
        recycling_difficulty: "Easy",
      },

      Wool: {
        secondary_material: null,
        composition: "100% Wool",
        material_quality: "Premium",
        durability: "High",
        stretchability: "Medium",
        breathability: "High",
        moisture_absorption: "High",
        thermal_property: "Excellent",
        recycling_difficulty: "Easy",
      },

      Denim: {
        secondary_material: null,
        composition: "100% Cotton Denim",
        material_quality: "High",
        durability: "Very High",
        stretchability: "Low",
        breathability: "Medium",
        moisture_absorption: "High",
        thermal_property: "Medium",
        recycling_difficulty: "Easy",
      },

      Linen: {
        secondary_material: null,
        composition: "100% Linen",
        material_quality: "Premium",
        durability: "High",
        stretchability: "Low",
        breathability: "Excellent",
        moisture_absorption: "Excellent",
        thermal_property: "Medium",
        recycling_difficulty: "Easy",
      },

      Rayon: {
        secondary_material: null,
        composition: "100% Rayon",
        material_quality: "Medium",
        durability: "Medium",
        stretchability: "Medium",
        breathability: "Good",
        moisture_absorption: "High",
        thermal_property: "Medium",
        recycling_difficulty: "Medium",
      },

      Nylon: {
        secondary_material: null,
        composition: "100% Nylon",
        material_quality: "High",
        durability: "Very High",
        stretchability: "High",
        breathability: "Medium",
        moisture_absorption: "Low",
        thermal_property: "Medium",
        recycling_difficulty: "Medium",
      },

      Acrylic: {
        secondary_material: null,
        composition: "100% Acrylic",
        material_quality: "Medium",
        durability: "High",
        stretchability: "Medium",
        breathability: "Low",
        moisture_absorption: "Low",
        thermal_property: "High",
        recycling_difficulty: "Hard",
      },
    };

    const defaults = materialDefaults[material] ?? {};

    const getValue = (...values) => {
      for (const value of values) {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          return value;
        }
      }

      return "Not Available";
    };

    return {
      ...data,

      /* ---------------- Material ---------------- */

      material: getValue(
        data.material,
        data.primary_material
      ),

      primary_material: getValue(
        data.primary_material,
        data.material
      ),

      secondary_material:
        data.secondary_material !== undefined &&
        data.secondary_material !== null &&
        data.secondary_material !== ""
          ? data.secondary_material
          : defaults.secondary_material ?? "None",

      composition: getValue(
        data.composition,
        data.fiber_composition,
        defaults.composition
      ),

      material_quality: getValue(
        data.material_quality,
        data.quality,
        defaults.material_quality
      ),

      /* ---------------- Image Analysis ---------------- */

      dominant_color: getValue(
        data.dominant_color,
        data.color
      ),

      secondary_color: getValue(
        data.secondary_color
      ),

      pattern: getValue(data.pattern),

      texture: getValue(data.texture),

      /* ---------------- Damage ---------------- */

      defects: getValue(
        data.defects,
        data.defect,
        data.damage_type
      ),

      damage_level: getValue(
        data.damage_level,
        data.damage,
        data.condition,
        data.defects ? "Minor" : "None Detected"
      ),

      /* ---------------- Contamination ---------------- */

      contamination: getValue(
        data.contamination,
        data.contaminants,
        data.contamination_type,
        "None Detected"
      ),

      contamination_level: getValue(
        data.contamination_level,
        "Low"
      ),

      /* ---------------- Physical Properties ---------------- */

      durability: getValue(
        data.durability,
        defaults.durability
      ),

      stretchability: getValue(
        data.stretchability,
        defaults.stretchability
      ),

      breathability: getValue(
        data.breathability,
        defaults.breathability
      ),

      moisture_absorption: getValue(
        data.moisture_absorption,
        defaults.moisture_absorption
      ),

      thermal_property: getValue(
        data.thermal_property,
        defaults.thermal_property
      ),

      recycling_difficulty: getValue(
        data.recycling_difficulty,
        defaults.recycling_difficulty
      ),

      /* ---------------- Waste Intelligence ---------------- */

      waste_category: getValue(
        data.waste_category,
        data.waste_type,
        data.category
      ),

      waste_score:
        data.waste_score ??
        data.wasteScore ??
        null,

      reuse_score:
        data.reuse_score ??
        data.reuseScore ??
        null,

      recyclability_score:
        data.recyclability_score ??
        data.recyclability ??
        null,

      circularity_score:
        data.circularity_score ??
        data.circularity ??
        null,

      /* ---------------- Recommendation ---------------- */

      disposal_method: getValue(
        data.disposal_method,
        data.disposal_recommendation,
        data.disposal
      ),

      recommendation: getValue(
        data.recommendation
      ),

      recycling_method: getValue(
        data.recycling_method
      ),

      waste_reduction_strategy: getValue(
        data.waste_reduction_strategy,
        data.reduction_strategy
      ),

      recovered_material: getValue(
        data.recovered_material
      ),

      recovery_percentage:
        data.recovery_percentage ??
        data.recovery_rate ??
        null,

      estimated_cost:
        data.estimated_cost ?? null,

      processing_time: getValue(
        data.processing_time
      ),

      expected_output: getValue(
        data.expected_output
      ),

      /* ---------------- Sustainability ---------------- */

      carbon_saving:
        data.carbon_saving ??
        data.co2Saving ??
        data.co2_saving ??
        null,

      water_saving:
        data.water_saving ??
        data.waterSaving ??
        null,

      landfill_reduction:
        data.landfill_reduction ??
        data.landfillReduction ??
        null,

      resource_conservation:
        data.resource_conservation ??
        null,

      environmental_impact:
        getValue(data.environmental_impact),

      sustainability_score:
        data.sustainability_score ??
        null,

      confidence:
        data.confidence ?? null,
    };
  };

  const loadWasteData = async () => {
    try {
      setLoading(true);
      setSearchError("");

      const response = await getAnalysisHistory();

      if (!Array.isArray(response) || response.length === 0) {
        setAnalysis(null);
        setHistory([]);
        return;
      }

      const sortedHistory = [...response].sort(
        (a, b) =>
          new Date(b.upload_date || 0).getTime() -
          new Date(a.upload_date || 0).getTime()
      );

      const normalizedHistory =
        sortedHistory.map(normalizeAnalysis);

      setHistory(normalizedHistory);
      setAnalysis(normalizedHistory[0]);
    } catch (error) {
      console.error(
        "Failed to load waste analysis:",
        error
      );

      setSearchError(
        error?.response?.data?.detail ||
          "Failed to load waste analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (batchId) => {
    const id = String(batchId ?? "").trim();

    if (!id) {
      setSearchError(
        "Please enter an Analysis Batch ID."
      );
      return;
    }

    const found = history.find(
      (item) =>
        String(
          item.batch_id ??
            item.analysis_batch_id ??
            item.id
        ) === id
    );

    if (!found) {
      setSearchError(
        "Analysis Batch ID not found."
      );
      return;
    }

    setSearchError("");
    setAnalysis(found);
  };

  const handleHistorySelect = (selectedAnalysis) => {
    if (!selectedAnalysis) return;

    setSearchError("");
    setAnalysis(
      normalizeAnalysis(selectedAnalysis)
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <h2 className="text-xl font-semibold text-heading">
          Loading Waste Classification...
        </h2>

        <p className="mt-2 text-muted">
          Loading AI waste analysis data.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <h2 className="text-xl font-semibold text-heading">
          No Waste Classification Available
        </h2>

        <p className="mt-2 text-muted">
          Upload and analyze a textile image first.
        </p>

        {searchError && (
          <p className="mt-4 text-sm text-red-600">
            {searchError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-heading">
          Waste Classification
        </h1>

        <p className="mt-2 text-muted">
          AI-powered textile waste classification,
          recovery analysis and sustainability
          assessment.
        </p>
      </div>

      <AnalysisHeader
        analysis={analysis}
        waste={analysis}
        onSearch={handleSearch}
        error={searchError}
      />

      <WasteCard
        waste={analysis}
      />

      <WasteProperties
        waste={analysis}
      />

      <WasteHistory
        history={history}
        selectedId={analysis.id}
        onSelect={handleHistorySelect}
      />

    </div>
  );
}

export default WasteClassification;