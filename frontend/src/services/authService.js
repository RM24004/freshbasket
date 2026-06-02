// Se encarga de realizar todo el proceso de decodificación del token
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import axios from "../services/axiosConfig.js";

const API_URL = "http://localhost:8080/api/auth/login";

export async function login(email, password) {
  const response = await axios.post(API_URL, { email, password });
  const data = response.data;

  // Guardamos el token recibido
  localStorage.setItem("token", data.token);

  try {
    const decoded = jwtDecode(data.token);

    const userRoles = decoded.roles || decoded.role || decoded.authorities || "No asignado";
    const userEmail = decoded.sub || decoded.email;

    // Toast personalizado de éxito
    toast.success(`¡Bienvenido! Sesión iniciada como: ${userEmail}`);
    console.log("Sesión Iniciada -> Usuario:", userEmail, "| Permisos:", userRoles);

  } catch (jwtError) {
    toast("Sesión iniciada, pero no se pudo leer el perfil del token.", { icon: "⚠️" });
    console.warn("No se pudo decodificar el payload del token JWT:", jwtError.message);
  }

  return data;
}