// servicio para decodificar el token

export async function login(email, password) {
  const response = await axios.post(API_URL, { email, password });
  const data = response.data;

  localStorage.setItem("token", data.token);

  try {
    const decoded = jwtDecode(data.token);

    const rawRoles = decoded.roles || decoded.role || decoded.authorities || "USUARIO";
    const userEmail = decoded.sub || decoded.email;
    const userName = decoded.name || decoded.username || "Usuario Registrado";

    let finalRole = Array.isArray(rawRoles) ? rawRoles[0] : rawRoles;

    if (finalRole && typeof finalRole === 'object' && finalRole.authority) {
      finalRole = finalRole.authority;
    }

    finalRole = String(finalRole)
        .replace("ROLE_", "")
        .toUpperCase()
        .trim();

    if (finalRole === "ADMIN") finalRole = "ADMINISTRADOR";
    if (finalRole === "USER") finalRole = "USUARIO";

    localStorage.setItem("userRole", finalRole);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("userName", userName);

    toast.success(`¡Bienvenido! Sesión iniciada como: ${userEmail}`);
    console.log("=== LOGIN EXITOSO ===");
    console.log("Usuario:", userEmail);
    console.log("Rol Procesado y Guardado:", finalRole);

  } catch (jwtError) {
    localStorage.setItem("userRole", "USUARIO");
    toast("Sesión iniciada, pero no se pudo leer el perfil del token.", { icon: "⚠️" });
    console.warn("No se pudo decodificar el payload del token JWT:", jwtError.message);
  }

  return data;
}