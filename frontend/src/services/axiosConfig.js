//interceptor de errores a nivel global

import axios from "axios";
import toast from "react-hot-toast";

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const serverMessage = error.response.data?.message;
            const method = error.config.method?.toLowerCase();
            const url = error.config.url || "";

            if (status === 403 && (url.includes("/api/users") || url.includes("/users"))) {
                console.log(`[Axios Interceptor] 403 bloqueado en silencio para el endpoint: ${url}`);
                return Promise.reject(error);
            }

            const isIdRequest = /\/\d+$/.test(url);

            if (isIdRequest && (status === 403 || status === 404)) {
                return Promise.reject(error);
            }

            switch (status) {
                case 401:
                    toast.error(serverMessage || "Sesión expirada o no válida. Por favor, inicia sesión de nuevo.");
                    localStorage.removeItem("token");
                    
                    window.location.href = "/login";
                    break;
                case 403:
                    toast.error(serverMessage || "No tienes los permisos necesarios para realizar esta acción.");
                    break;
                case 404:
                    toast.error(serverMessage || "El recurso solicitado no fue encontrado.");
                    break;
                case 500:
                    toast.error("Error interno en el servidor. Inténtalo más tarde.");
                    break;
                default:
                    toast.error(serverMessage || "Ocurrió un error inesperado.");
            }
        } else if (error.request) {
            toast.error("No se pudo conectar con el servidor. Verifica tu conexión.");
        } else {
            toast.error("Error al procesar la solicitud.");
        }

        return Promise.reject(error);
    }
);

export default axios;