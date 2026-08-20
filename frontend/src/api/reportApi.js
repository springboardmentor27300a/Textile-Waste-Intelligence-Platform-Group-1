import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const generatePDF = async (duration = "7days") => {
  const response = await API.get(`/reports/generate?duration=${duration}`, {
    responseType: "blob",
  });

  return response.data;
};