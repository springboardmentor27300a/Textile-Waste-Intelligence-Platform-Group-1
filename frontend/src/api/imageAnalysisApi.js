import api from "./axios";


// ==================================================
// UPLOAD IMAGE FOR ANALYSIS
// ==================================================

export const uploadImage = async (
    imageFile,
    collectionId
) => {

    if (!imageFile) {
        throw new Error(
            "Please select a textile image."
        );
    }


    if (
        collectionId === null ||
        collectionId === undefined ||
        collectionId === ""
    ) {
        throw new Error(
            "A collection is required for image analysis."
        );
    }


    const formData =
        new FormData();


    formData.append(
        "file",
        imageFile
    );


    formData.append(
        "collection_id",
        String(collectionId)
    );


    /*
     * IMPORTANT:
     *
     * Do NOT specify Content-Type here.
     *
     * axios.js detects FormData and removes
     * the global JSON Content-Type.
     *
     * The browser then creates the correct
     * multipart/form-data boundary.
     */

    const response =
        await api.post(
            "/analysis/upload",
            formData
        );


    return response.data;
};


// ==================================================
// GET ANALYSIS HISTORY
// ==================================================

export const getAnalysisHistory =
    async () => {

        const response =
            await api.get(
                "/analysis/"
            );

        return response.data;
    };


// ==================================================
// GET ANALYSIS BY ID
// ==================================================

export const getAnalysisById =
    async (id) => {

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {

            throw new Error(
                "Analysis ID is required."
            );

        }


        const response =
            await api.get(
                `/analysis/${id}`
            );


        return response.data;
    };