import axios from "axios";


const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 120000,
});


API.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);


API.interceptors.response.use(
  (response) => response,

  async (error) => {

    /*
     * When responseType is blob, FastAPI errors
     * also arrive as a Blob. Convert them into
     * readable JSON/text before rejecting.
     */

    if (
      error?.response?.data instanceof Blob
    ) {

      try {

        const text =
          await error.response.data.text();

        let parsed;

        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }

        error.parsedDetail =
          parsed?.detail ??
          text ??
          null;

      } catch {
        // Keep original Axios error.
      }
    }

    return Promise.reject(error);
  }
);


// =====================================================
// REPORT TYPES
// =====================================================

export const REPORT_TYPES = [

  {
    value: "analysis",
    label: "AI Analysis Reports",
  },

  {
    value: "material",
    label: "Material Intelligence Reports",
  },

  {
    value: "waste",
    label: "Waste Classification Reports",
  },

  {
    value: "recycling",
    label: "Recycling Reports",
  },

  {
    value: "sustainability",
    label: "Sustainability Reports",
  },

  {
    value: "environmental_impact",
    label: "Environmental Impact Reports",
  },

  {
    value: "circular_economy",
    label: "Circular Economy Reports",
  },

  {
    value: "collection",
    label: "Collection Reports",
  },

  {
    value: "inventory",
    label: "Inventory Reports",
  },

  {
    value: "waste_source",
    label: "Waste Source / Organization Reports",
  },

  {
    value: "dashboard",
    label: "Executive Dashboard Reports",
  },

  {
    value: "comprehensive",
    label: "Comprehensive Reports",
  },

];


// =====================================================
// DURATIONS
// =====================================================

export const DURATIONS = [

  {
    value: "7days",
    label: "Last 7 Days",
  },

  {
    value: "30days",
    label: "Last 30 Days",
  },

  {
    value: "3months",
    label: "Last 3 Months",
  },

  {
    value: "6months",
    label: "Last 6 Months",
  },

  {
    value: "1year",
    label: "Last 1 Year",
  },

];


// =====================================================
// GENERATE REPORT
// =====================================================

export async function generateReport({

  reportType = "sustainability",

  duration = "30days",

  format = "pdf",

} = {}) {

  const response =
    await API.get(
      "/reports/generate",
      {
        params: {
          report_type:
            reportType,

          duration,

          format,
        },

        responseType: "blob",
      }
    );


  const filename =
    getFilename(
      response
        ?.headers
        ?.["content-disposition"]
    );


  return {

    blob:
      response.data,

    filename:
      filename ||
      `TWIP_${reportType}_${duration}.${format === "xlsx" ? "xlsx" : format}`,

  };

}


// =====================================================
// AI REPORT SUMMARY
// =====================================================

export async function getReportSummary({

  reportType = "sustainability",

  duration = "30days",

} = {}) {

  const response =
    await API.get(
      "/reports/summary",
      {
        params: {
          report_type:
            reportType,

          duration,
        },
      }
    );


  return response.data;
}


// =====================================================
// REPORT TYPES FROM BACKEND
// =====================================================

export async function getReportTypes() {

  const response =
    await API.get(
      "/reports/types"
    );

  return response.data;

}


// =====================================================
// FILENAME
// =====================================================

function getFilename(
  contentDisposition
) {

  if (
    !contentDisposition
  ) {
    return null;
  }


  const match =
    contentDisposition.match(
      /filename="?([^";]+)"?/i
    );


  return (
    match?.[1] ??
    null
  );

}


export default API;