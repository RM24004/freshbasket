
import axios from "./axiosConfig.js";

const API_URL = "/api/auth/login";

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(API_URL, { email, password });
    const data = response.data;

    if (!data) throw new Error("No se recibieron datos del servidor");

    // Guardar el token de acceso
    localStorage.setItem("token", data.token);

    // Procesa el nombre completo
    let nombreCompleto = "";
    if (data.name) {
      nombreCompleto = `${data.name} ${data.lastName || ""}`.trim();
    } else {
      nombreCompleto = data.email || email;
    }
    localStorage.setItem("userName", nombreCompleto);
    localStorage.setItem("userEmail", data.email || email);

    // Procesa el rol del usuario
    let finalRole = "CLIENTE";

    if (data.role) {
      finalRole = data.role.toUpperCase();
    } else if (data.token) {
      try {
        const { jwtDecode } = await import("jwt-decode"); // Carga dinámica por seguridad
        const decoded = jwtDecode(data.token);
        const rawRoles = decoded.roles || decoded.role || decoded.authorities || "CLIENTE";

        let extractedRole = Array.isArray(rawRoles) ? rawRoles[0] : rawRoles;
        if (extractedRole && typeof extractedRole === 'object' && extractedRole.authority) {
          extractedRole = extractedRole.authority;
        }

        extractedRole = String(extractedRole)
            .replace("ROLE_", "")
            .toUpperCase()
            .trim();

        if (extractedRole === "ADMIN") extractedRole = "ADMINISTRADOR";
        if (extractedRole === "USER") extractedRole = "USUARIO";

        finalRole = extractedRole;
      } catch (jwtError) {
        console.warn("No se pudo extraer el rol del JWT fallback:", jwtError.message);
      }
    }

    localStorage.setItem("userRole", finalRole);

    return nombreCompleto;
  },

  // Al cerrar la sesión se limpia el cache
  logout: (queryClient) => {
    localStorage.clear();
    if (queryClient) {
      queryClient.clear();
    }
  }
};