/*
 servicio con el que conectamos todas nuestras peticiones
 de SUPPLIERS desde el Backend
*/

import axios from "../services/axiosConfig.js";

// Conexión con el backend
const API_URL = "http://192.168.1.60:8080/api/suppliers";

// GET all suppliers
export const getAllSuppliers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// GET supplier by ID
export const getSupplierById = async (supplierId) => {
    const response = await axios.get(`${API_URL}/${supplierId}`);
    return response.data;
};

// CREATE supplier
export const createSupplier = async (supplierData) => {
    const response = await axios.post(API_URL, supplierData);
    return response.data;
};

// UPDATE supplier
export const updateSupplier = async (supplierId, supplierData) => {
    const response = await axios.put(`${API_URL}/${supplierId}`, supplierData);
    return response.data;
};

// DELETE supplier
export const deleteSupplier = async (supplierId) => {
    const response = await axios.delete(`${API_URL}/${supplierId}`);
    return response.data;
};

// SEARCH supplier by name
export const searchSuppliersByName = async (name) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: { name }
    });
    return response.data;
};