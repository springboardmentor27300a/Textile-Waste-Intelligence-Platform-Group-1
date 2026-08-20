import { useState } from "react";

import {
    uploadImage,
    getAnalysisHistory,
    getAnalysisById,
} from "../api/imageAnalysisApi";


function formatApiError(
    error,
    fallback = "An unexpected error occurred."
) {

    const detail =
        error?.response?.data?.detail;

    // FastAPI validation errors
    if (Array.isArray(detail)) {

        const messages = detail
            .map((item) => {

                if (
                    typeof item === "string"
                ) {
                    return item;
                }

                return (
                    item?.msg ||
                    "Invalid request."
                );

            })
            .filter(Boolean);

        if (messages.length > 0) {
            return messages.join(", ");
        }
    }


    // Normal FastAPI string detail
    if (
        typeof detail === "string" &&
        detail.trim()
    ) {
        return detail;
    }


    // Object detail
    if (
        typeof detail === "object" &&
        detail !== null
    ) {

        if (
            typeof detail.msg === "string"
        ) {
            return detail.msg;
        }

        if (
            typeof detail.message === "string"
        ) {
            return detail.message;
        }
    }


    // Axios error message
    if (
        typeof error?.message === "string" &&
        error.message.trim()
    ) {
        return error.message;
    }


    return fallback;
}


function useAnalysis() {

    const [loading, setLoading] =
        useState(false);

    const [result, setResult] =
        useState(null);

    const [history, setHistory] =
        useState([]);

    const [error, setError] =
        useState("");


    // ==================================================
    // Analyze Image
    // ==================================================

    const analyzeImage = async (
        image,
        collectionId
    ) => {

        if (!image) {

            setError(
                "Please select a textile image."
            );

            return null;
        }


        if (
            collectionId === null ||
            collectionId === undefined ||
            collectionId === ""
        ) {

            setError(
                "Please select a waste collection before analyzing the image."
            );

            return null;
        }


        try {

            setLoading(true);
            setError("");


            const response =
                await uploadImage(
                    image,
                    collectionId
                );


            setResult(response);


            setHistory((previous) => {

                const currentHistory =
                    Array.isArray(previous)
                        ? previous
                        : [];


                const filtered =
                    currentHistory.filter(
                        (item) =>
                            item?.id !==
                            response?.id
                    );


                return [
                    response,
                    ...filtered,
                ];

            });


            return response;

        } catch (err) {

            console.error(
                "Image analysis error:",
                err
            );


            const message =
                formatApiError(
                    err,
                    "Image analysis failed."
                );


            setError(message);


            return null;

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // Load History
    // ==================================================

    const loadHistory = async () => {

        try {

            setError("");


            const response =
                await getAnalysisHistory();


            const safeHistory =
                Array.isArray(response)
                    ? response
                    : [];


            setHistory(
                safeHistory
            );


            return safeHistory;

        } catch (err) {

            console.error(
                "Failed to load analysis history:",
                err
            );


            const message =
                formatApiError(
                    err,
                    "Unable to load analysis history."
                );


            setError(message);


            return [];

        }

    };


    // ==================================================
    // Load Individual Analysis
    // ==================================================

    const loadAnalysis = async (
        id
    ) => {

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {

            setError(
                "Please enter an Analysis ID."
            );

            return null;
        }


        try {

            setLoading(true);
            setError("");


            const response =
                await getAnalysisById(id);


            setResult(response);


            setHistory((previous) => {

                const currentHistory =
                    Array.isArray(previous)
                        ? previous
                        : [];


                const filtered =
                    currentHistory.filter(
                        (item) =>
                            item?.id !==
                            response?.id
                    );


                return [
                    response,
                    ...filtered,
                ];

            });


            return response;

        } catch (err) {

            console.error(
                "Failed to load analysis:",
                err
            );


            if (
                err?.response?.status === 404
            ) {

                setError(
                    "Analysis ID does not exist."
                );

            } else {

                setError(
                    formatApiError(
                        err,
                        "Unable to load analysis."
                    )
                );

            }


            return null;

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // Clear Result
    // ==================================================

    const clearResult = () => {

        setResult(null);
        setError("");

    };


    // ==================================================
    // Return
    // ==================================================

    return {

        loading,

        result,

        history,

        error,

        analyzeImage,

        loadHistory,

        loadAnalysis,

        clearResult,

        setResult,

    };

}


export default useAnalysis;