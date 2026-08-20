import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});


// ==================================================
// REQUEST INTERCEPTOR
// ==================================================

api.interceptors.request.use(
    (config) => {

        // ----------------------------------------------
        // Authentication
        // ----------------------------------------------

        const token =
            localStorage.getItem("access_token") ||
            localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        // ----------------------------------------------
        // FormData
        // ----------------------------------------------

        /*
         * IMPORTANT:
         *
         * Do NOT manually set multipart/form-data.
         *
         * Axios/browser will automatically generate:
         *
         * multipart/form-data;
         * boundary=----------------...
         *
         * FastAPI needs that boundary to parse
         * UploadFile + Form correctly.
         */

        if (
            config.data instanceof FormData
        ) {

            delete config.headers["Content-Type"];

            delete config.headers["content-type"];

        }

        // ----------------------------------------------
        // Normal JSON requests
        // ----------------------------------------------

        else {

            config.headers["Content-Type"] =
                "application/json";

        }


        return config;

    },

    (error) => {
        return Promise.reject(error);
    }
);


// ==================================================
// RESPONSE INTERCEPTOR
// ==================================================

api.interceptors.response.use(

    (response) => {
        return response;
    },

    (error) => {

        /*
         * Do not redirect automatically here.
         *
         * The individual hooks/pages should decide
         * how to display API errors.
         */

        return Promise.reject(error);

    }

);


export default api;