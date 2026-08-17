/**
 * Report Service — Milestone 4
 * Adds all new report API methods while keeping existing AI methods untouched.
 */

import api from './api';

const API_BASE = 'http://localhost:8000';

const ReportService = {
  /** List all reports for the current user (role-scoped) */
  listReports: (params = {}) =>
    api.get('/report-hub', { params }),

  /** Get reports history (alias) */
  getHistory: (params = {}) =>
    api.get('/report-hub/history', { params }),

  /** Get report types accessible to the current user's role */
  getReportTypes: () =>
    api.get('/report-hub/types'),

  /** Get a single report with full data payload */
  getReport: (id) =>
    api.get(`/report-hub/${id}`),

  /** Generate a new report from existing platform data */
  generateReport: (reportType, predictionId, title = null) =>
    api.post('/report-hub/generate', {
      report_type: reportType,
      prediction_id: predictionId,
      title,
    }),

  /** Get PDF download URL for a report */
  getPdfUrl: (id) =>
    `${API_BASE}/api/v1/report-hub/export/pdf/${id}`,

  /** Download PDF (fetches with auth header) */
  downloadPdf: async (id, title = 'report') => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/api/v1/report-hub/export/pdf/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('PDF generation failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WeaveCycle_${title}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  /** Download Excel (fetches with auth header) */
  downloadExcel: async (id, title = 'report') => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/api/v1/report-hub/export/excel/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Excel generation failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WeaveCycle_${title}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  /** Archive a report */
  archiveReport: (id) =>
    api.delete(`/report-hub/${id}`),
};

export default ReportService;
