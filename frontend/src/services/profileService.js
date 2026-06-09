import axios from "../services/axiosConfig.js";

export const getMyProfileData = async () => {
    const response = await axios.get(`/api/users/me?t=${new Date().getTime()}`);
    return response.data;
};

export const updateMyProfileData = async (payload) => {
    const response = await axios.put(`/api/users/me?t=${new Date().getTime()}`, payload);
    return response.data;
};