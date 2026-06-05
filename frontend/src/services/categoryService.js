/*
 servicio con el que conectamos todas nuestras peticiones
 de SUPPLIERS desde el Backend
*/

import axios from "../services/axiosConfig.js";

// Conexión con el backend
const API_URL = "http://localhost:8080/api/categories";

// GET all categories
export const getAllCategories = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// GET category by ID
export const getCategoryById = async (categoryId) => {
    const response = await axios.get(`${API_URL}/${categoryId}`);
    return response.data;
};

// CREATE category
export const createCategory = async (categoryData) => {
    const response = await axios.post(API_URL, categoryData);
    return response.data;
};

// UPDATE category
export const updateCategory = async (categoryId, categoryData) => {
    const response = await axios.put(`${API_URL}/${categoryId}`, categoryData);
    return response.data;
};

// DELETE category
export const deleteCategory = async (categoryId) => {
    const response = await axios.delete(`${API_URL}/${categoryId}`);
    return response.data;
};

// SEARCH category by name
export const searchCategoriesByName = async (name) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: { name }
    });
    return response.data;
};