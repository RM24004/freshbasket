import axios from "../services/axiosConfig.js";

// Conexión con el backend
const API_URL = "http://localhost:8080/api/countries";

// GET all Countries
export const getAllCountries = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// GET Country  by ID
export const getCountryById = async (countryId) => {
    const response = await axios.get(`${API_URL}/${countryId}`);
    return response.data;
};

// CREATE Country
export const createCountry  = async (countryData) => {
    const response = await axios.post(API_URL, countryData);
    return response.data;
};

// UPDATE Country
export const updateCountry = async (countryId, countryData) => {
    const response = await axios.put(`${API_URL}/${countryId}`, countryData);
    return response.data;
};

// DELETE Country
export const deleteCountry = async (countryId) => {
    const response = await axios.delete(`${API_URL}/${countryId}`);
    return response.data;
};

// SEARCH Countries by name
export const searchCountriesByName = async (name) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: { name }
    });
    return response.data;
};