/*
 Servicio con el que conectamos todas nuestras peticiones
 de PRODUCTS desde el Backend
*/

import axios from "../services/axiosConfig.js";

const API_URL = "http://192.168.1.60:8080/api/products";

// GET all products
export const getAllProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// GET product by ID
export const getProductById = async (productId) => {
  const response = await axios.get(`${API_URL}/${productId}`);
  return response.data;
};

// CREATE product
export const createProduct = async (productData) => {
  const response = await axios.post(API_URL, productData);
  return response.data;
};

// UPDATE product
export const updateProduct = async (productId, productData) => {
  const response = await axios.put(`${API_URL}/${productId}`, productData);
  return response.data;
};

// DELETE product
export const deleteProduct = async (productId) => {
  const response = await axios.delete(`${API_URL}/${productId}`);
  return response.status;
};

// SEARCH products by name
export const searchProductsByName = async (name) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { name }
  });
  return response.data;
};