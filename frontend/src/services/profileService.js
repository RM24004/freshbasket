import axios from "../services/axiosConfig.js";

const API_URL = "http://192.168.1.60:8080/api/users/me";

export const getMyProfileData = async () => {
    const response = await axios.get("/api/users/me");
    return response.data;
};

export const updateMyProfileData = async (payload) => {
    const response = await axios.put("/api/users/me", payload);
    return response.data;
};