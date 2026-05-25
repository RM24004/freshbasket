// Matriz de permisos para cada USER
// Se configura quien puede acceder a diferentes partes de la APP

export const matriz_permisos = {
  ADMINISTRADOR: { verTabsConsulta: true, crear: true,  actualizar: true,  eliminar: true,  verModuloUsuarios: true },
  SOPORTE:       { verTabsConsulta: true, crear: true,  actualizar: true,  eliminar: false, verModuloUsuarios: true },
  USUARIO:       { verTabsConsulta: true, crear: false, actualizar: false, eliminar: false, verModuloUsuarios: false }
};

export const tieneAcceso = (rol, accion) => {
  if (!rol) return false;

  let rolLimpio = rol.toUpperCase().trim();

  if (rolLimpio === "ADMIN") rolLimpio = "ADMINISTRADOR";

  return matriz_permisos[rolLimpio]?.[accion] || false;
};