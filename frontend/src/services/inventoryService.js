import API from "./api";

export const getInventories = async () => {

    const token = localStorage.getItem("token");

    return API.get("/inventory", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getInventory = async (id) => {

    const token = localStorage.getItem("token");

    return API.get(`/inventory/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const createInventory = async (data) => {

    const token = localStorage.getItem("token");

    return API.post(
        "/inventory",
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

export const updateInventory = async (id, data) => {

    const token = localStorage.getItem("token");

    return API.put(
        `/inventory/${id}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

export const deleteInventory = async (id) => {

    const token = localStorage.getItem("token");

    return API.delete(
        `/inventory/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};