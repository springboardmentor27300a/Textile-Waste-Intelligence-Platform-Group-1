import API from "./api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`
    };
};

// =====================================
// Analyze Textile Image
// =====================================
export const analyzeTextile = async (imageFile) => {

    const formData = new FormData();

    formData.append("file", imageFile);

    return API.post(
        "/analysis/analyze",
        formData,
        {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "multipart/form-data"
            }
        }
    );
};

// =====================================
// Get Analysis History
// =====================================
export const getAnalysisHistory = async () => {

    return API.get(
        "/dashboard/history",
        {
            headers: getAuthHeaders()
        }
    );

};