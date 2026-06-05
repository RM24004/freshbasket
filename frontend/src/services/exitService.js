/*
 servicio con el que conectamos todas nuestras peticiones
 de EXITS desde el Backend
*/

import axios from "../services/axiosConfig.js";

const API_URL = "http://localhost:8080/api/exits";

// GET all exits
export const getAllExits = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// GET exit by ID
export const getExitById = async (exitId) => {
    const response = await axios.get(`${API_URL}/${exitId}`);
    return response.data;
};

// CRÉATE EXIT
export const createExit = async (exitData) => {
    const response = await axios.post(API_URL, exitData);
    return response.data;
};

// UPDATE EXIT
export const updateExit = async (exitId, exitData) => {
    const response = await axios.put(`${API_URL}/${exitId}`, exitData);
    return response.data;
};

// DELETE EXIT
export const deleteExit = async (exitId) => {
    const response = await axios.delete(`${API_URL}/${exitId}`);
    return response.status;
};
