/**
 * Sustainability Service — Frontend API calls for Milestone 3
 * ==========================================================
 * Provides a clean interface to all sustainability, circularity, 
 * recommendation, and impact assessment endpoints.
 */

import api from './api';

const SustainabilityService = {
  /**
   * Run end-to-end sustainability & circularity analysis on a prediction.
   * @param {string} predictionId - The prediction UUID
   * @param {number} weightKg - Optional reference weight in kg
   * @param {string} inventoryId - Optional batch inventory link
   */
  analyze: (predictionId, weightKg = 100.0, inventoryId = null) =>
    api.post('/sustainability/analyze', {
      prediction_id: predictionId,
      weight_kg: weightKg,
      inventory_id: inventoryId,
    }),

  /**
   * Fetch paginated sustainability analysis log history.
   * @param {object} params - query parameters (search, material, page, per_page, etc.)
   */
  getHistory: (params = {}) =>
    api.get('/sustainability/history', { params }),

  /**
   * Get complete details of a sustainability audit by prediction ID (or analysis ID).
   */
  getDetail: (id) =>
    api.get(`/sustainability/${id}`),

  /**
   * Generate recycling recommendations for a prediction.
   */
  generateRecommendations: (predictionId) =>
    api.post('/recommendations/generate', { prediction_id: predictionId }),

  /**
   * Retrieve recommendations list, optionally filtered by predictionId.
   */
  getRecommendations: (predictionId = null) =>
    api.get('/recommendations', {
      params: predictionId ? { prediction_id: predictionId } : {},
    }),

  /**
   * Run environmental impact assessment.
   */
  assessEnvironment: (predictionId, weightKg = 100.0) =>
    api.post('/environment/assess', { prediction_id: predictionId, weight_kg: weightKg }),

  /**
   * Retrieve environmental impact records.
   */
  getEnvironmentImpact: (predictionId = null) =>
    api.get('/environment', {
      params: predictionId ? { prediction_id: predictionId } : {},
    }),

  /**
   * Run circularity score calculation.
   */
  calculateCircularity: (predictionId) =>
    api.post('/circularity/calculate', { prediction_id: predictionId }),

  /**
   * Retrieve circularity records.
   */
  getCircularityScores: (predictionId = null) =>
    api.get('/circularity', {
      params: predictionId ? { prediction_id: predictionId } : {},
    }),

  /**
   * Get list of reports.
   */
  getReports: () =>
    api.get('/sustainability/reports'),

  /**
   * Retrieve sustainability dashboard stats.
   */
  getDashboardStats: () =>
    api.get('/sustainability/dashboard/stats'),
};

export default SustainabilityService;
