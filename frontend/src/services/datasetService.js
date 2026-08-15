import api from "../api/api";

// Get all datasets
export const getDatasets = () => {
  return api.get("/dataset/");
};

// Upload a dataset
export const uploadDataset = (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post("/dataset/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete dataset (for future use)
export const deleteDataset = (id) => {
  return api.delete(`/dataset/${id}`);
};