
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: "",
    timeout: 10000
});

// Interceptor de peticiones global y automatico
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de Respuestas: Control global de errores HTTP
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const serverMessage = error.response.data?.message;
            const url = error.config.url || "";
            const method = error.config.method || "";

            const isAuthRequest = url.includes("/auth/login") || url.includes("/login");
            const isIdRequest = /\/\d+$/.test(url) && method.toLowerCase() === "get";

            if (isAuthRequest || isIdRequest || (status === 403 && url.includes("/users"))) {
                return Promise.reject(error);
            }

            // Sistema centralizado de control de errores con toast.
            switch (status) {
                case 401:
                    // Sesión expirada o token inválido
                    toast.error(serverMessage || "Sesión expirada. Por favor, inicia sesión de nuevo.");
                    localStorage.clear();
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 100);
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

export default api;