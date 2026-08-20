import api from "./axios";

/**
 * Sustainability Dashboard API
 *
 * IMPORTANT:
 * This page intentionally uses the dedicated analytics endpoint instead of
 * /dashboard/. The global dashboard aggregates many unrelated services, so a
 * failure in one unrelated dashboard module must not break Sustainability.
 */
const SustainabilityAPI = {
  dashboard: async () => {
    const response = await api.get("/analytics/sustainability");
    const source = response.data || {};

    // The backend returns canonical sustainability fields plus compatibility
    // aliases. Build the exact contract consumed by SustainabilityDashboard
    // and its child sections without changing those components.
    const sustainability = {
      ...source,

      // Existing components expect a nested summary string.
      summary:
        typeof source.summary === "string"
          ? source.summary
          : source.summary_metrics || "",
    };

    const recovery = Number(
      source.material_recovery_score ??
        source.average_recovery ??
        0
    );

    const reuse = Number(
      source.reuse_score ?? source.average_reuse ?? 0
    );

    const recyclability = Number(
      source.recyclability_score ??
        source.average_recyclability ??
        0
    );

    const circularity = Number(
      source.circularity_score ??
        source.average_circularity ??
        0
    );

    const sustainabilityScore = Number(
      source.sustainability_score ??
        source.average_score ??
        0
    );

    const environmentalScore = Number(
      source.environmental_score ?? 0
    );

    const overallScore = Number(
      source.overall_score ??
        source.average_overall_score ??
        0
    );

    const recoveryLevel =
      recovery >= 85
        ? "High"
        : recovery >= 70
          ? "Medium"
          : "Low";

    const reuseLevel =
      reuse >= 85
        ? "High"
        : reuse >= 70
          ? "Medium"
          : "Low";

    const environmentalRating =
      environmentalScore >= 90
        ? "Excellent"
        : environmentalScore >= 75
          ? "Good"
          : environmentalScore >= 60
            ? "Average"
            : "Poor";

    const circularityCategory =
      circularity >= 90
        ? "Excellent Recovery Potential"
        : circularity >= 75
          ? "High Recovery Potential"
          : circularity >= 60
            ? "Moderate Recovery Potential"
            : circularity >= 40
              ? "Limited Recovery Potential"
              : "Disposal Recommended";

    const overallGrade =
      overallScore >= 90
        ? "A+"
        : overallScore >= 80
          ? "A"
          : overallScore >= 70
            ? "B"
            : overallScore >= 60
              ? "C"
              : "D";

    const overallRating =
      overallScore >= 90
        ? "Excellent"
        : overallScore >= 80
          ? "Very Good"
          : overallScore >= 70
            ? "Good"
            : overallScore >= 60
              ? "Average"
              : "Needs Improvement";

    // The persisted Analysis model does not store processing difficulty as a
    // column. Do not fabricate a numeric value; use the engine's documented
    // neutral default label for aggregate dashboard data.
    const processingDifficulty = "Medium";

    const weightedModel = {
      material_recyclability: {
        value: recyclability,
        weight: 35,
      },

      material_condition: {
        value: recovery,
        weight: 20,
      },

      reuse_potential: {
        value: reuse,
        weight: 20,
      },

      environmental_benefit: {
        value: environmentalScore,
        weight: 15,
      },

      processing_feasibility: {
        value: 100,
        weight: 10,
      },
    };

    return {
      // Canonical objects consumed by the existing UI.
      sustainability: {
        ...sustainability,

        summary:
          sustainability.summary ||
          "Sustainability metrics aggregated from persisted analyses.",
      },

      waste_scoring: {
        recyclability_score: recyclability,
        reuse_score: reuse,
        material_recovery_score: recovery,
        recovery_percentage: recovery,
        circularity_score: circularity,
        sustainability_score: sustainabilityScore,
        environmental_score: environmentalScore,
        overall_score: overallScore,
        weighted_model: weightedModel,
        circularity_category: circularityCategory,
        overall_grade: overallGrade,
        overall_rating: overallRating,
        environmental_rating: environmentalRating,
        reuse_level: reuseLevel,
        recovery_level: recoveryLevel,
        processing_difficulty: processingDifficulty,
      },

      // Environmental data is supplied by the dedicated environmental
      // analytics endpoint so this page never depends on the global dashboard.
      // It is loaded separately by the hook below when available.
      environmental: {},

      resource_recovery: {
        recovery_percentage: recovery,
        resource_recovery_percentage: recovery,

        resource_conservation: Number(
          source.resource_conservation ?? 0
        ),
      },

      waste_diversion: {
        diversion_percentage: recovery,
        landfill_diversion: 0,
      },

      benchmarking: {
        company_level:
          source.company_level ?? "Not assessed",

        company_score:
          Number(source.company_score ?? overallScore),

        benchmark:
          source.benchmark ?? "Not assessed",

        companies: [],
      },
    };
  },

  environment: async () => {
    const response = await api.get("/analytics/environment");

    return response.data || {};
  },
};

export default SustainabilityAPI;