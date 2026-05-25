// Servicio con el que conectamos todas nuestras peticiones
// de PRODUCTS desde el Backend

import axios from "axios";

const API_URL = "http://localhost:8080/api/products";

// Extrae el token en tiempo real para cada petición
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  };
};

// GET all products
export const getAllProducts = async () => {
  const res = await axios.get(API_URL, getAuthHeaders());
  return res.data;
};

// GET product by ID
export const getProductById = async (productId) => {
  const res = await axios.get(`${API_URL}/${productId}`, getAuthHeaders());
  return res.data;
};

// CREATE product
export const createProduct = async (productData) => {
  const res = await axios.post(API_URL, productData, getAuthHeaders());
  return res.data;
};

// UPDATE product
export const updateProduct = async (productId, productData) => {
  const res = await axios.put(`${API_URL}/${productId}`, productData, getAuthHeaders());
  return res.data;
};

// DELETE product
export const deleteProduct = async (productId) => {
  const res = await axios.delete(`${API_URL}/${productId}`, getAuthHeaders());
  return res.status;
};

// SEARCH products by name
export const searchProductsByName = async (name) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/search`, {
    params: { name },
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
  return res.data;
};