/*
 servicio con el que conectamos todas nuestras peticiones
 de ENTRIES desde el Backend
*/

import axios from "../services/axiosConfig.js";

const API_URL = "http://192.168.1.60:8080/api/entries";

// GET all entries
export const getAllEntries = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// GET entry by ID
export const getEntryById = async (entryId) => {
  const response = await axios.get(`${API_URL}/${entryId}`);
  return response.data;
};

// CREATE ENTRY
export const createEntry = async (entryData) => {
  const response = await axios.post(API_URL, entryData);
  return response.data;
};

// UPDATE ENTRY
export const updateEntry = async (entryId, entryData) => {
  const response = await axios.put(`${API_URL}/${entryId}`, entryData);
  return response.data;
};

// DELETE ENTRY
export const deleteEntry = async (entryId) => {
  const response = await axios.delete(`${API_URL}/${entryId}`);
  return response.status;
};
