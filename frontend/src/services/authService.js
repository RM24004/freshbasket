// Se encarga de realizar todo el proceso de decodificación del token

import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/auth/login";

export async function login(email, password) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error en login");
  }

  const data = await response.json();

  // Guardamos el token para habilitar el acceso a las rutas privadas
  localStorage.setItem("token", data.token);

  // Decodificación segura de JWT para evitar crasheos
  try {
    const decoded = jwtDecode(data.token);


    const userRoles = decoded.roles || decoded.role || decoded.authorities || "No asignado";
    const userEmail = decoded.sub || decoded.email;

    console.log("Sesión Iniciada -> Usuario:", userEmail, "| Permisos:", userRoles);
  } catch (jwtError) {

    console.warn("No se pudo decodificar el payload del token JWT:", jwtError.message);
  }

  return data;
}