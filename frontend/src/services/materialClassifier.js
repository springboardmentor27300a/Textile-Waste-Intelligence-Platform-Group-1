import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export const predictMaterial = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await axios.post(
    `${API_BASE_URL}/material-classifier/predict`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};