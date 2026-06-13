
import axios from "./axiosConfig.js";

// CRUD Genérico (soporta de forma nativa las 7 entidades)
export const apiService = (resource) => {
    const API_URL = `/api/${resource}`;

    return {

        // Para consultar todos los Get
        getAll: async () => {
            const response = await axios.get(`${API_URL}?t=${new Date().getTime()}`);
            return response.data;
        },

        // Consultar por ID
        getById: async (id) => {
            const response = await axios.get(`${API_URL}/${id}?t=${new Date().getTime()}`);
            return response.data;
        },

        // Crear un registro en cada entidad
        create: async (data) => {
            const response = await axios.post(API_URL, data);
            return response.data;

        },

        // Actualizar un registro existente
        update: async ({ id, data }) => {
            const { id: _, ...cleanData } = data;
            const response = await axios.put(`${API_URL}/${id}`, cleanData);
            return response.data;
        },

        // Borra un registro logico/fisico
        delete: async (id) => {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        },

        // Buscar por nombre
        searchByName: async (name) => {
            try {
                const response = await axios.get(`${API_URL}/search`, {
                    params: { name, t: new Date().getTime() }
                });
                return response.data;
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    const fallbackResponse = await axios.get(API_URL, {
                        params: { name, t: new Date().getTime() }
                    });
                    return fallbackResponse.data;
                }
                throw error;
            }
        }
    };
};

// Se obtienen los datos del perfil del usuario de la sesión
export const profileService = {
    getMyProfile: async () => {
        const response = await axios.get(`/api/users/me?t=${new Date().getTime()}`);
        return response.data;
    },

    //Se actualizan los datos del usuario desde el boton de actualizar datos
    updateMyProfile: async (payload) => {
        const response = await axios.put(`/api/users/me?t=${new Date().getTime()}`, payload);
        return response.data;
    }
};