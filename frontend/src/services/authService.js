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
  localStorage.setItem("token", data.token);

  // Opcional: decodificar JWT
  const decoded = jwtDecode(data.token);
  console.log("Usuario:", decoded.sub, "Roles:", decoded.roles);

  return data;
}
