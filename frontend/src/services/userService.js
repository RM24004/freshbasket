// Servicio con el que conectamos todas nuestras peticiones
// de USERS desde el Backend

import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

// Extrae el token en tiempo real para cada petición
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  };
};

// GET all users
export const getAllUsers = async () => {
  const res = await axios.get(API_URL, getAuthHeaders());
  return res.data;
};

// GET user by ID
export const getUserById = async (userId) => {
  const res = await axios.get(`${API_URL}/${userId}`, getAuthHeaders());
  return res.data; //cambiar a response
};

// CREATE user
export const createUser = async (userData) => {
  const res = await axios.post(API_URL, userData, getAuthHeaders());
  return res.data;
};

// UPDATE user
export const updateUser = async (userId, userData) => {
  const res = await axios.put(`${API_URL}/${userId}`, userData, getAuthHeaders());
  return res.data;
};

// DELETE user
export const deleteUser = async (userId) => {
  const res = await axios.delete(`${API_URL}/${userId}`, getAuthHeaders());
  return res.status;
};

// SEARCH users by name
export const searchUsersByName = async (name) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/search`, {
    params: { name },
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
  return res.data;
};