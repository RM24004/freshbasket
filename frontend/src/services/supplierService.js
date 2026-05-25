
import axios from "axios";

// Conexión con el backend
const API_URL = "http://localhost:8080/api/suppliers";

// Extrae el token para cada petición
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    };
};

// GET all suppliers
export const getAllSuppliers = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

// GET supplier by ID
export const getSupplierById = async (supplierId) => {
    const response = await axios.get(`${API_URL}/${supplierId}`, getAuthHeaders());
    return response.data;
};

// CREATE supplier
export const createSupplier = async (supplierData) => {
    const response = await axios.post(API_URL, supplierData, getAuthHeaders());
    return response.data;
};

// UPDATE supplier
export const updateSupplier = async (supplierId, supplierData) => {
    const response = await axios.put(`${API_URL}/${supplierId}`, supplierData, getAuthHeaders());
    return response.data;
};

// DELETE supplier
export const deleteSupplier = async (supplierId) => {
    const response = await axios.delete(`${API_URL}/${supplierId}`, getAuthHeaders());
    return response.data;
};

// SEARCH supplier by name
export const searchSuppliersByName = async (name) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: { name },
        ...getAuthHeaders()
    });
    return response.data;
};
