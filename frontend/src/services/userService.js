/*
 servicio con el que conectamos todas nuestras peticiones
 de USERS desde el Backend
*/

import axios from "../services/axiosConfig.js";

const API_URL = "http://localhost:8080/api/users";

// GET all users
export const getAllUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// GET user by ID
export const getUserById = async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};

// CREATE user
export const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData);
  return response.data;
};
//Crear un usuario desde la url pública
export const registerUserPublic = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// UPDATE user
export const updateUser = async (userId, userData) => {
  const response = await axios.put(`${API_URL}/${userId}`, userData);
  return response.data;
};

// DELETE user
export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/${userId}`);
  return response.status;
};

// SEARCH users by name
export const searchUsersByName = async (name) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { name }
  });
  return response.data;
};