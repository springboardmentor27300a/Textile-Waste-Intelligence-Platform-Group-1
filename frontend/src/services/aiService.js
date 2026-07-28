/**
 * AI Service — All frontend API calls for Milestone 2
 * =====================================================
 * Provides a clean interface to all AI prediction endpoints.
 * Follows the same auth/token pattern as the existing api.js service.
 */

import api from './api';

const AIService = {
  /**
   * Upload a textile image for analysis
   * @param {FormData} formData - FormData with 'file' field and optional 'inventory_id'
   */
  uploadImage: (formData) =>
    api.post('/image/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Run material classification on an uploaded image
   */
  predictMaterial: (imageId) =>
    api.post('/material/predict', { image_id: imageId }),

  /**
   * Run waste classification
   */
  classifyWaste: (imageId, material = null, materialConfidence = null) =>
    api.post('/waste/classify', {
      image_id: imageId,
      material,
      material_confidence: materialConfidence,
    }),

  /**
   * Calculate recyclability score
   */
  predictRecyclability: (imageId, material = null, wasteCategory = null) =>
    api.post('/recyclability/predict', {
      image_id: imageId,
      material,
      waste_category: wasteCategory,
    }),

  /**
   * Run the FULL AI pipeline (material + waste + recyclability) in one call
   */
  analyzeImage: (imageId) =>
    api.post(`/predictions/analyze?image_id=${imageId}`),

  /**
   * Get paginated prediction history
   */
  getPredictions: (params = {}) =>
    api.get('/predictions', { params }),

  /**
   * Get a single prediction with full details
   */
  getPrediction: (id) =>
    api.get(`/predictions/${id}`),

  /**
   * Get image metadata
   */
  getImage: (id) =>
    api.get(`/images/${id}`),

  /**
   * Get list of generated reports
   */
  getReports: (params = {}) =>
    api.get('/reports', { params }),
};

export default AIService;
